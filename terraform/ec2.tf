# ============================================================
# セキュリティグループ（EC2 用）
# ============================================================
resource "aws_security_group" "ec2" {
  name        = "${var.project_name}-ec2-sg"
  description = "Allow HTTP and SSH access to EC2"
  vpc_id      = aws_vpc.main.id

  # HTTP（Nginx 経由でフロントエンド・API を配信）- 自分の PC からのみ許可
  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # SSH（サーバーへのログイン・デプロイ作業用）- 自分の PC からのみ許可
  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # 外向き通信はすべて許可（パッケージインストール・RDS 接続に必要）
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.project_name}-ec2-sg"
  }
}

# ============================================================
# キーペア（SSH ログイン用）
# ============================================================
resource "aws_key_pair" "ec2" {
  key_name   = "${var.project_name}-key"
  public_key = file("~/.ssh/contactmanager-ec2.pub")
}

# ============================================================
# 最新の Amazon Linux 2023 AMI を自動取得
# ============================================================
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}

# ============================================================
# EC2 インスタンス（t3.small — Rails + Next.js の同居に必要な 2GB RAM）
# ============================================================
resource "aws_instance" "app" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.small"
  subnet_id              = aws_subnet.public_1.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = aws_key_pair.ec2.key_name

  # 起動時に Ruby・Node.js・Nginx 等をインストールする
  # 完了まで約 15 分かかる（/var/log/cloud-init-output.log で進捗確認）
  # NOTE: <<-EOF はタブのみ除去するため、スクリプト本文はカラム0から記述する
  user_data = <<-EOF
#!/bin/bash
set -euo pipefail

# システムパッケージ
dnf update -y
dnf install -y git nginx mariadb1011 mariadb1011-devel
dnf groupinstall -y "Development Tools"
dnf install -y openssl-devel readline-devel zlib-devel libyaml-devel

# Node.js 20 (NodeSource)
curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
dnf install -y nodejs
npm install -g pnpm

# rbenv + ruby-build
git clone https://github.com/rbenv/rbenv.git /opt/rbenv
git clone https://github.com/rbenv/ruby-build.git /opt/rbenv/plugins/ruby-build

printf 'export RBENV_ROOT=/opt/rbenv\nexport PATH="$RBENV_ROOT/bin:$RBENV_ROOT/shims:$PATH"\neval "$(rbenv init -)"\n' >> /home/ec2-user/.bashrc

export RBENV_ROOT=/opt/rbenv
export PATH="$RBENV_ROOT/bin:$RBENV_ROOT/shims:$PATH"
rbenv install 3.3.7
rbenv global 3.3.7
rbenv rehash
gem install bundler --no-document

# rbenv を ec2-user でも使えるよう所有権を変更
chown -R ec2-user:ec2-user /opt/rbenv

# nginx.conf のデフォルト server ブロックを削除（conf.d/ との競合防止）
cat > /etc/nginx/nginx.conf << 'NGINXEOF'
user nginx;
worker_processes auto;
error_log /var/log/nginx/error.log notice;
pid /run/nginx.pid;
include /usr/share/nginx/modules/*.conf;
events { worker_connections 1024; }
http {
    log_format main '$remote_addr - $remote_user [$time_local] "$request" $status $body_bytes_sent';
    access_log /var/log/nginx/access.log main;
    sendfile on; tcp_nopush on; keepalive_timeout 65;
    types_hash_max_size 4096;
    include /etc/nginx/mime.types;
    default_type application/octet-stream;
    include /etc/nginx/conf.d/*.conf;
}
NGINXEOF

# アプリ用 Nginx 設定
cat > /etc/nginx/conf.d/contactmanager.conf << 'NGINXAPP'
upstream rails_backend   { server 127.0.0.1:3001; }
upstream nextjs_frontend { server 127.0.0.1:3000; }
server {
    listen 80 default_server;
    server_name _;
    location /api/ {
        proxy_pass       http://rails_backend;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
    location / {
        proxy_pass         http://nextjs_frontend;
        proxy_set_header   Host $host;
        proxy_set_header   X-Real-IP $remote_addr;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "upgrade";
    }
}
NGINXAPP

# Nginx 起動
systemctl enable nginx
systemctl start nginx

# アプリ配置ディレクトリ
mkdir -p /var/www/contactmanager
chown ec2-user:ec2-user /var/www/contactmanager
  EOF

  tags = {
    Name = "${var.project_name}-app"
  }
}
