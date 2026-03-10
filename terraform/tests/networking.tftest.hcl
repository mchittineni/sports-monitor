mock_provider "aws" {}

run "execute_networking_plan" {
  command = plan

  module {
    source = "./modules/networking"
  }

  variables {
    environment        = "test"
    vpc_cidr           = "10.0.0.0/16"
    availability_zones = ["us-east-1a", "us-east-1b"]
    kms_key_arn        = "arn:aws:kms:us-east-1:123456789012:key/mock-id"
  }

  # Assertion 1: Verify VPC CIDR
  assert {
    condition     = aws_vpc.main.cidr_block == "10.0.0.0/16"
    error_message = "VPC CIDR block does not match the input variable."
  }

  # Assertion 2: Verify Subnet Count (2 AZs = 2 Public + 2 Private)
  assert {
    condition     = length(aws_subnet.public) == 2 && length(aws_subnet.private) == 2
    error_message = "The number of subnets created does not match the AZ count."
  }

  # Assertion 3: Verify VPC Flow Logs
  assert {
    condition     = aws_flow_log.main.traffic_type == "ALL"
    error_message = "VPC Flow Logs must capture ALL traffic for security compliance."
  }

  # Assertion 4: Verify Public IP strategy
  assert {
    condition     = alltrue([for s in aws_subnet.public : s.map_public_ip_on_launch == false])
    error_message = "Public subnets should not auto-assign public IPs; use EIPs or manual assignment."
  }

  # Assertion 5: Verify Resource Tagging
  assert {
    condition     = aws_vpc.main.tags["Name"] == "sports-monitor-vpc-test"
    error_message = "The VPC Name tag was not set correctly."
  }
}
