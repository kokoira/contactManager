variable "aws_region" {
  description = "AWS のリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "project_name" {
  description = "各リソース名のプレフィックス"
  type        = string
  default     = "contactmanager"
}

variable "my_ip" {
  description = "自分の PC の IP アドレス（CIDR 形式, 例: 203.0.113.1/32）"
  type        = string
}

variable "db_username" {
  description = "RDS MySQL の管理者ユーザー名"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "RDS MySQL の管理者パスワード（8文字以上）"
  type        = string
  sensitive   = true
}
