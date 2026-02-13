# Terraform Variables Configuration
# Save as: infrastructure/terraform.tfvars

aws_region  = "us-east-1"
environment = "production"
app_name    = "carwheels"
domain_name = "carwheels.com"

# Database credentials - change these!
db_username = "postgres"
db_password = "ChangeMe123!@#"

# EC2 instance type
instance_type = "t3.small"
