tflint {
  required_version = ">= 0.60.0"
}

config {
  format              = "compact"
  plugin_dir          = "~/.tflint.d/plugins"
  call_module_type    = "local"
  force               = false
  disabled_by_default = false

# Ignore specific public modules
  ignore_module = {
    "terraform-aws-modules/vpc/aws"            = true
    "terraform-aws-modules/security-group/aws" = true
  }

# Variable files and inline variables
  varfile = ["environments/dev.tfvars"]
}

# AWS Plugin
plugin "aws" {
  enabled = true
  version = "0.37.0" 
  source  = "github.com/terraform-linters/tflint-ruleset-aws"
}

# Terraform Plugin
plugin "terraform" {
  enabled = true
  preset  = "recommended" # 'all' is often too noisy; 'recommended' is the 2026 standard
}

# --- Core Rules ---

rule "terraform_unused_declarations" { enabled = true }

rule "terraform_unused_required_providers" { enabled = true }

rule "terraform_required_version" { enabled = true }

rule "terraform_comment_syntax" { enabled = true }

rule "terraform_naming_convention" { enabled = true }

# --- AWS Security & Best Practices ---

rule "aws_instance_invalid_type" { enabled = false }

rule "aws_kms_key_rotation_enabled" { enabled = true }

# Standard Security Rules

rule "aws_security_group_rule_allows_all" { enabled = true }

rule "aws_elb_missing_security_group" { enabled = true }

rule "aws_instance_root_volume_encrypted" { enabled = true }

rule "aws_db_instance_no_multi_az" { enabled = true }

rule "aws_dynamodb_table_point_in_time_recovery_enabled" { enabled = true }

rule "aws_ebs_volume_encryption_enabled" { enabled = true }

rule "aws_s3_bucket_public_access_block_enabled" { enabled = true }