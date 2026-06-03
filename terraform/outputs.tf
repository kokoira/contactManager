output "ec2_public_ip" {
  description = "EC2 インスタンスのパブリック IP アドレス"
  value       = aws_instance.app.public_ip
}

output "ec2_public_dns" {
  description = "EC2 インスタンスのパブリック DNS 名"
  value       = aws_instance.app.public_dns
}

output "rds_endpoint" {
  description = "RDS MySQL のエンドポイント（ホスト名）"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDS MySQL のポート番号"
  value       = aws_db_instance.main.port
}

output "rds_database_name" {
  description = "Rails production データベース名"
  value       = aws_db_instance.main.db_name
}

output "backend_env_hint" {
  description = "Rails 環境変数の設定例（SSH ログイン後に /etc/environment 等へ設定）"
  value       = <<-EOT
    export DATABASE_HOST="${aws_db_instance.main.address}"
    export DATABASE_PORT="${aws_db_instance.main.port}"
    export DATABASE_USER="${var.db_username}"
    export DATABASE_PASSWORD="<terraform.tfvars で設定した db_password の値>"
    export RAILS_ENV=production
    export PORT=3001
    export CORS_ALLOWED_ORIGIN="http://${aws_instance.app.public_ip}"
    export RAILS_MASTER_KEY="<config/master.key の内容>"
  EOT
}
