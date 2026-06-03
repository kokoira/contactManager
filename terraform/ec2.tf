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
  user_data = <<-EOF
    #!/bin/bash
    set -euo pipefail

    # ─── システムパッケージ ───────────────────────────────────────
    dnf update -y
    dnf install -y git nginx mysql mysql-devel
    dnf groupinstall -y "Development Tools"
    dnf install -y openssl-devel readline-devel zlib-devel libyaml-devel

    # ─── Node.js 20 (NodeSource) ─────────────────────────────────
    curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
    dnf install -y nodejs
    npm install -g pnpm

    # ─── rbenv + ruby-build ──────────────────────────────────────
    git clone https://github.com/rbenv/rbenv.git /opt/rbenv
    git clone https://github.com/rbenv/ruby-build.git /opt/rbenv/plugins/ruby-build

    cat >> /home/ec2-user/.bashrc <<'PROFILE'
export RBENV_ROOT=/opt/rbenv
export PATH="$RBENV_ROOT/bin:$RBENV_ROOT/shims:$PATH"
eval "$(rbenv init -)"
PROFILE

    export RBENV_ROOT=/opt/rbenv
    export PATH="$RBENV_ROOT/bin:$RBENV_ROOT/shims:$PATH"
    rbenv install 3.3.7
    rbenv global 3.3.7
    rbenv rehash
    gem install bundler --no-document

    # ─── Nginx 起動 ──────────────────────────────────────────────
    systemctl enable nginx
    systemctl start nginx

    # ─── アプリ配置ディレクトリ ──────────────────────────────────
    mkdir -p /var/www/contactmanager
    chown ec2-user:ec2-user /var/www/contactmanager
  EOF

  tags = {
    Name = "${var.project_name}-app"
  }
}
