# contactManager

Zendesk ライクなお問い合わせ管理アプリの学習用実装です。

## 概要

チケット（お問い合わせ）の作成・管理・対応を行うシンプルなアプリです。  
画面上のトグルスイッチで **ユーザー** と **担当者** の2つの役割を切り替えて操作できます。

| 役割 | できること |
|------|-----------|
| ユーザー | チケット作成・チケット閲覧・コメント追加 |
| 担当者 | 全チケット閲覧・ステータス変更・コメント追加 |

## 技術スタック

| レイヤー | 技術 |
|---------|------|
| Frontend | Next.js 15 / React 19 / TypeScript 5 / Tailwind CSS 3 |
| Backend | Ruby on Rails 7.2（API モード）/ Ruby 3.3 |
| Database | MySQL 8.0 |
| 実行環境 | Docker Compose |

## 画面構成

| 画面 | パス | 説明 |
|------|------|------|
| チケット一覧 | `/` | チケットの一覧表示（役割によって表示件数が変わる） |
| チケット作成 | `/tickets/new` | 新規お問い合わせの作成（ユーザーのみ） |
| チケット詳細 | `/tickets/:id` | 詳細・コメント・ステータス変更 |

## API エンドポイント

| メソッド | パス | 説明 |
|---------|------|------|
| GET | `/api/v1/tickets` | チケット一覧取得 |
| GET | `/api/v1/tickets/:id` | チケット詳細取得 |
| POST | `/api/v1/tickets` | チケット作成 |
| PATCH | `/api/v1/tickets/:id` | チケット更新（ステータス・優先度） |
| POST | `/api/v1/tickets/:id/comments` | コメント追加 |

## セットアップ

### 前提条件

- Docker / Docker Compose がインストール済みであること

### 起動手順

```bash
# リポジトリをクローン
git clone https://github.com/kokoira/contactManager.git
cd contactManager

# コンテナを起動
docker compose up

# （初回のみ）データベースのセットアップ
docker compose exec backend bundle exec rails db:create db:migrate
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## 開発コマンド

```bash
# Lint（フロントエンド）
docker compose exec frontend pnpm lint

# Lint（バックエンド）
docker compose exec backend bundle exec rubocop

# DB マイグレーション
docker compose exec backend bundle exec rails db:migrate

# Rails コンソール
docker compose exec backend bundle exec rails console
```

## プロジェクト構成

```
contactManager/
├── frontend/          # Next.js 15 アプリ (port 3000)
├── backend/           # Rails 7.2 API (port 3001)
├── docs/              # ドキュメント
│   ├── requirements.md          # 要件定義書
│   ├── functional-requirements.md  # 機能要件
│   ├── screen-design.md         # 画面設計
│   └── database-design.md       # データベース設計
├── .github/           # PR テンプレート・コントリビューションガイド
└── docker-compose.yml
```

## ドキュメント

- [要件定義書](docs/requirements.md)
- [機能要件](docs/functional-requirements.md)
- [画面設計](docs/screen-design.md)
- [データベース設計](docs/database-design.md)
- [コントリビューションガイド](.github/CONTRIBUTING.md)
