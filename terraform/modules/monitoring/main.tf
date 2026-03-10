# CloudWatch Log Group
resource "aws_cloudwatch_log_group" "api_logs" {
  name              = "${var.log_group_name}-${var.environment}"
  retention_in_days = var.environment == "prod" ? 30 : 7
  kms_key_id        = var.kms_key_arn

  tags = {
    Name = "api-logs"
  }
}

# SNS Topic for alerts
resource "aws_sns_topic" "alerts" {
  name              = "sports-monitor-alerts-${var.environment}"
  kms_master_key_id = var.kms_key_arn
}

resource "aws_sns_topic_subscription" "alerts_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

# CloudWatch Alarms
resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "sports-monitor-lambda-errors-${var.environment}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 1
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_actions       = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "rds_cpu" {
  alarm_name          = "sports-monitor-rds-cpu-${var.environment}"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_actions       = [aws_sns_topic.alerts.arn]
}
