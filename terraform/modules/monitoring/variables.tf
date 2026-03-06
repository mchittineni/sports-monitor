variable "environment" {
  type        = string
  description = "The deployment environment, used to separate dev/prod monitoring metrics."
}

variable "log_group_name" {
  type        = string
  description = "Prefix name for the primary CloudWatch log group."
}

variable "alarm_email" {
  type        = string
  description = "The destination email address to receive SNS alerts for infrastructure alarms."
}
