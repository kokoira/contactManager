# Terraform AWS 環境構築ガイド
## 〜 contactManager を EC2 + RDS へデプロイする 〜

---

## そもそも Terraform って何？

**Terraform（テラフォーム）** とは、「インフラをコードで管理するツール」です。

通常、AWS のサーバーを作るには AWS の管理画面をクリックして設定していきます。
Terraform を使うと、**設定ファイル（.tf ファイル）に「こういう環境を作って」と書くだけで、自動でまとめて作ってくれます。**

```
設定ファイルに書く → terraform apply と実行 → AWS に環境が自動で構築される
```

メリットは「何度でも同じ環境を再現できる」「変更・削除も管理できる」点です。

---

## そもそも AWS って何？

**AWS（Amazon Web Services）** は、Amazon が提供するクラウドサービスです。
サーバーやデータベースなどを、自分でハードウェアを買わずに**借りて使える**サービスです。

---

## この terraform フォルダで何が作られるの？

**EC2 インスタンス（サーバー）** と **RDS（マネージドデータベース）** を構築します。
フロントエンド（Next.js）とバックエンド（Rails）を **1 台の EC2 に同居させ**、
データベースは **RDS（プライベートサブネット）** に分離する構成です。

### 全体の構成イメージ

```
ブラウザ
  │
  ↓ http://EC2のIPアドレス/
┌──────────────────────────────────────────────┐
│           EC2 t3.small（1台）                  │
│                                              │
│  Nginx（ポート 80）                            │
│   ├─ /api/* → Rails（Puma、ポート 3001）へ転送  │
│   └─ /*     → Next.js（ポート 3000）へ転送      │
│                                              │
│  Rails 7.2（Puma）                            │
│  Next.js 15                                  │
└──────────────────┬───────────────────────────┘
                   │ ポート 3306（プライベート通信のみ）
┌──────────────────▼───────────────────────────┐
│  RDS MySQL 8.0（db.t3.micro）                 │
│  プライベートサブネット配置                      │
│  → インターネットから直接アクセス不可             │
└──────────────────────────────────────────────┘
```

> **RDS をプライベートサブネットに置く理由**
> データベースはインターネットから直接アクセスできないようにするのがセキュリティの基本です。
> EC2（同じ VPC 内）からのみ接続できるよう、セキュリティグループで制限しています。

---

## 各ファイルの説明

### main.tf ― AWS への接続設定

Terraform が AWS のどのリージョン（地域）に接続するかを定義しています。
東京リージョン（`ap-northeast-1`）が設定されています。

### variables.tf ― 変数の定義

設定値を一元管理するファイルです。

| 変数名 | デフォルト値 | 説明 |
|--------|------------|------|
| `aws_region` | `ap-northeast-1` | AWS のリージョン（東京） |
| `project_name` | `contactmanager` | 各リソース名のプレフィックス |
| `my_ip` | 必須入力 | 自分の PC の IP（CIDR 形式） |
| `db_username` | `admin` | RDS の管理者ユーザー名 |
| `db_password` | 必須入力 | RDS の管理者パスワード（機密情報） |

### vpc.tf ― ネットワークの定義

AWS 上に作る「プライベートなネットワーク空間」です。

| リソース | CIDR / 場所 | 役割 |
|---------|-------------|------|
| VPC | 10.0.0.0/16 | 全体のネットワーク空間 |
| パブリックサブネット | 10.0.1.0/24（1a） | EC2 を配置 |
| プライベートサブネット 1 | 10.0.11.0/24（1a） | RDS プライマリ配置 |
| プライベートサブネット 2 | 10.0.12.0/24（1c） | RDS サブネットグループ用（2 AZ 必須） |
| インターネットゲートウェイ | — | VPC とインターネットを繋ぐ「出入口」 |
| ルートテーブル | — | パブリックサブネットの通信経路設定 |

### ec2.tf ― サーバーの定義

**セキュリティグループ（ファイアウォール設定）：**

| ポート | 用途 |
|--------|------|
| 80 | HTTP（Nginx 経由でフロント・API を配信） |
| 22 | SSH（サーバーへのログイン・デプロイ作業用） |

**EC2 インスタンスの設定：**

| 設定 | 値 |
|------|-----|
| インスタンスタイプ | t3.small（2 vCPU / 2GB RAM） |
| OS | Amazon Linux 2023（最新版を自動取得） |
| 起動時の処理 | Ruby 3.3・Node.js 20・pnpm・Nginx のインストール |

> **t3.small を選ぶ理由**
> Rails（Ruby）と Next.js を 1 台に同居させるため、メモリが 2GB 必要です。
> t3.micro（1GB）では同時起動時にメモリ不足になる可能性があります。
> t3.small は約 $15/月（東京リージョン）です。

### rds.tf ― データベースの定義

**RDS インスタンスの設定：**

| 設定 | 値 |
|------|-----|
| エンジン | MySQL 8.0 |
| インスタンスタイプ | db.t3.micro（**無料枠対象**） |
| ストレージ | 20GB（gp3） |
| DB 名 | contact_manager_production |
| タイムゾーン | Asia/Tokyo |
| 文字コード | utf8mb4 |
| パブリックアクセス | 無効（プライベートのみ） |

### outputs.tf ― 構築後に表示される情報

`terraform apply` 完了後に以下の情報が表示されます：

| 出力名 | 内容 | 用途 |
|--------|------|------|
| `ec2_public_ip` | EC2 のパブリック IP | ブラウザアクセス・SSH に使用 |
| `ec2_public_dns` | EC2 のパブリック DNS | 同上 |
| `rds_endpoint` | RDS のエンドポイント | Rails の DATABASE_HOST に設定 |
| `rds_port` | RDS のポート（3306） | Rails の DATABASE_PORT に設定 |
| `rds_database_name` | DB 名 | 確認用 |
| `backend_env_hint` | Rails 環境変数の設定例 | SSH ログイン後にコピペして使用 |

---

## 実行する前に必要な準備

### 1. AWS アカウントの用意

AWS アカウントを作成し、操作権限を持つ IAM ユーザーの認証情報（アクセスキー）を取得してください。

### 2. ツールのインストール

```bash
# Terraform のインストール（Mac の場合）
brew install terraform

# AWS CLI のインストール
brew install awscli

# AWS の認証情報を設定
aws configure
# → アクセスキー ID、シークレットアクセスキー、リージョン（ap-northeast-1）を入力
```

### 3. SSH キーペアの作成

EC2 へ SSH でログインするためのキーを作成します。

```bash
ssh-keygen -t ed25519 -f ~/.ssh/contactmanager-ec2
# → ~/.ssh/contactmanager-ec2（秘密鍵）と ~/.ssh/contactmanager-ec2.pub（公開鍵）が作成される
```

### 4. 設定ファイルの作成

```bash
# terraform フォルダ内で実行
cp terraform.tfvars.example terraform.tfvars
```

`terraform.tfvars` を開いて以下を設定してください：

```bash
# 自分の IP アドレスを確認する
curl -s https://checkip.amazonaws.com
# 出力例: 203.0.113.1
# → my_ip = "203.0.113.1/32" と設定する
```

> ⚠️ **`terraform.tfvars` は絶対にコミットしないでください**
> RDS パスワードが含まれています。このファイルは `.gitignore` で除外済みです。

---

## 実行手順

```bash
# terraform フォルダに移動
cd terraform

# 初期化（Terraform が AWS と通信するためのプログラムをダウンロード）
terraform init

# 何が作られるか確認（実際には何も作らない・無料）
terraform plan

# 実際に構築する（RDS の作成に約 5〜10 分かかります）
terraform apply
# → "Do you want to perform these actions?" と聞かれるので "yes" と入力
```

完了すると以下のように表示されます：

```
ec2_public_ip      = "xx.xx.xx.xx"
ec2_public_dns     = "ec2-xx-xx-xx-xx.ap-northeast-1.compute.amazonaws.com"
rds_endpoint       = "contactmanager-db.xxxxxxxxxx.ap-northeast-1.rds.amazonaws.com"
rds_port           = 3306
rds_database_name  = "contact_manager_production"
backend_env_hint   = <<EOT
  export DATABASE_HOST="contactmanager-db.xxxxxxxxxx..."
  ...
EOT
```

後から出力を確認したい場合：

```bash
terraform output
terraform output rds_endpoint  # 個別に確認
```

---

## 構築後のアプリデプロイ手順

### 1. user_data スクリプトの完了を確認する

EC2 は起動直後も SSH 接続できますが、Ruby 等のインストールが完了していない場合があります。
**約 15 分待ってから**以下で進捗を確認してください。

```bash
# SSH でログイン
ssh -i ~/.ssh/contactmanager-ec2 ec2-user@<ec2_public_ip>

# インストールログを確認（最後に "user_data完了" が出たら OK）
sudo tail -f /var/log/cloud-init-output.log
```

### 2. スワップ領域の追加（推奨）

メモリ逼迫時の安全網として 2GB のスワップを追加します。

```bash
sudo dd if=/dev/zero of=/swapfile bs=128M count=16
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile swap swap defaults 0 0' | sudo tee -a /etc/fstab
```

### 3. Rails 環境変数の設定

`terraform output backend_env_hint` の出力を参考に環境変数を設定します。

```bash
# /etc/environment に追記（システム全体に適用）
sudo tee -a /etc/environment <<'EOF'
DATABASE_HOST="<rds_endpoint>"
DATABASE_PORT="3306"
DATABASE_USER="admin"
DATABASE_PASSWORD="<db_password>"
RAILS_ENV="production"
PORT="3001"
CORS_ALLOWED_ORIGIN="http://<ec2_public_ip>"
RAILS_MASTER_KEY="<config/master.key の内容>"
EOF

# 環境変数を反映
source /etc/environment
```

### 4. アプリケーションのデプロイ

```bash
cd /var/www/contactmanager

# リポジトリをクローン
git clone https://github.com/kokoira/contactManager.git .

# ─── バックエンド ─────────────────────────────────────
cd backend
bundle install --without development test
bundle exec rails db:create db:migrate RAILS_ENV=production

# Puma をバックグラウンドで起動
bundle exec puma -C config/puma.rb -d

# ─── フロントエンド ───────────────────────────────────
cd ../frontend
pnpm install
pnpm build

# Next.js をバックグラウンドで起動
PORT=3000 pnpm start &
```

### 5. Nginx の設定

```bash
sudo tee /etc/nginx/conf.d/contactmanager.conf <<'EOF'
upstream rails_backend {
    server 127.0.0.1:3001;
}

upstream nextjs_frontend {
    server 127.0.0.1:3000;
}

server {
    listen 80;
    server_name _;

    location /api/ {
        proxy_pass         http://rails_backend;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
    }

    location / {
        proxy_pass         http://nextjs_frontend;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_set_header   X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
EOF

# デフォルト設定を無効化して新しい設定を反映
sudo nginx -t && sudo systemctl reload nginx
```

### 6. 動作確認

ブラウザで `http://<ec2_public_ip>/` にアクセスして画面が表示されれば成功です。

```bash
# API の疎通確認
curl http://<ec2_public_ip>/api/v1/tickets

# RDS 接続確認（EC2 上から）
mysql -h <rds_endpoint> -u admin -p contact_manager_production
```

---

## 削除したいとき

```bash
terraform destroy
# → "Do you want to destroy all resources?" と聞かれるので "yes" と入力
```

> **注意：** `terraform destroy` を実行すると EC2・RDS を含む全リソースが削除されます。
> RDS のデータも失われます。使い終わったら必ず実行しましょう（費用がかかり続けます）。

---

## 費用について

| サービス | 無料枠 | 概算費用/月 |
|---------|--------|------------|
| EC2 t3.small | 対象外 | 約 $15 |
| RDS db.t3.micro | 750 時間/月（12 ヶ月） | 無料枠内は $0 / 超過後 約 $25 |
| RDS ストレージ 20GB | 20GB/月 | 無料枠内は $0 / 超過後 約 $2.5 |
| VPC / サブネット / IGW | 無料 | $0 |

> 無料枠は **新規 AWS アカウント作成から 12 ヶ月間**が対象です。
> 使い終わったら `terraform destroy` で削除しておくと安心です。

---

## まとめ

この terraform フォルダで構築される環境：

```
ブラウザ → EC2（Nginx + Rails + Next.js が同居） → RDS MySQL（プライベート）
```

学習・開発目的として十分な構成です。
将来的に HTTPS 化（ACM + ALB）やコンテナ化（ECS）に発展させることができます。
