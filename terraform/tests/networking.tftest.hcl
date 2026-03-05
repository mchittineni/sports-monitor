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
  }

  assert {
    condition     = aws_vpc.main.cidr_block == "10.0.0.0/16"
    error_message = "The VPC CIDR block is incorrect."
  }

  assert {
    condition     = aws_vpc.main.tags["Name"] == "sports-monitor-vpc-test"
    error_message = "The VPC Name tag was not set correctly."
  }
}
