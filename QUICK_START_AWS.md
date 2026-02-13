# AWS Deployment Quick Start Guide

**For CarWheels Project - 30 Minute Setup**

## Prerequisites (Do Once)

```bash
# 1. Install AWS CLI
# Windows: https://awscli.amazonaws.com/AWSCLIV2.msi
# Mac: brew install awscli
# Linux: pip install awscli

# 2. Install Terraform
# https://www.terraform.io/downloads.html

# 3. Configure AWS credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key
# - Default region: us-east-1
# - Default output format: json

# 4. Create S3 bucket for Terraform state (one-time)
aws s3 mb s3://carwheels-terraform-state-$(date +%s) --region us-east-1

# 5. Create DynamoDB table for state locking (one-time)
aws dynamodb create-table \
  --table-name terraform-locks \
  --attribute-definitions AttributeName=LockID,AttributeType=S \
  --key-schema AttributeName=LockID,KeyType=HASH \
  --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5
```

---

## Deployment (5 Steps - ~20 minutes)

### Step 1: Prepare Configuration

```bash
cd CarWheels/infrastructure

# Edit terraform.tfvars
nano terraform.tfvars  # or use your editor

# Update these values:
# - aws_region: us-east-1 (or your region)
# - app_name: carwheels
# - domain_name: your-domain.com
# - db_username: postgres
# - db_password: strong-password-here
```

### Step 2: Initialize Infrastructure

```bash
# Initialize Terraform
terraform init

# Validate configuration
terraform validate

# Preview changes
terraform plan
```

### Step 3: Deploy (Automated)

```bash
# Deploy everything
terraform apply

# When prompted, type: yes

# This creates:
# ✓ VPC with subnets
# ✓ RDS PostgreSQL
# ✓ ElastiCache Redis
# ✓ EC2 instances (2)
# ✓ Auto Scaling Group
# ✓ Application Load Balancer
# ✓ S3 bucket for images
# ✓ CloudFront CDN
# ✓ Route53 DNS records
# ✓ CloudWatch monitoring

# Estimated time: 10-15 minutes
```

### Step 4: Configure Domain

```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers \
  --query "LoadBalancers[].DNSName" \
  --output text

# Go to your domain registrar
# Point nameservers to AWS Route53 nameservers
# (Terraform creates them automatically)

# Or create CNAME records:
# api.carwheels.com -> ALB DNS name
```

### Step 5: Verify Deployment

```bash
# Wait 5-10 minutes for DNS propagation

# Test API
curl https://api.carwheels.com/health

# View logs
aws logs tail /carwheels/api --follow

# SSH into instance (optional)
# 1. Get instance IP
aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=carwheels-backend" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text

# 2. SSH (you need carwheels-key.pem)
ssh -i carwheels-key.pem ec2-user@IP_ADDRESS

# 3. Check status
pm2 status
pm2 logs
```

---

## Post-Deployment Configuration

### 1. Update Frontend .env

```bash
# frontend/.env.local
NEXT_PUBLIC_API_URL=https://api.carwheels.com
NEXT_PUBLIC_IMAGE_URL=https://images.carwheels.com
```

### 2. Deploy Frontend to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Configure:
# - Project name: carwheels
# - Framework: Next.js
# - Build command: npm run build
# - Output directory: .next
# - Install command: npm install
```

### 3. Setup Email Alerts

```bash
# Create SNS topic
aws sns create-topic --name carwheels-alerts

# Subscribe to alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:YOUR_ACCOUNT_ID:carwheels-alerts \
  --protocol email \
  --notification-endpoint your-email@example.com

# Check email and confirm subscription
```

---

## Common Operations

### View All Resources

```bash
# List all EC2 instances
aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=CarWheels" \
  --query "Reservations[].Instances[].{ID:InstanceId,State:State.Name,IP:PublicIpAddress}"

# View RDS instances
aws rds describe-db-instances \
  --query "DBInstances[].{Name:DBInstanceIdentifier,Status:DBInstanceStatus,Class:DBInstanceClass}"

# View ElastiCache clusters
aws elasticache describe-replication-groups \
  --query "ReplicationGroups[].{Name:ReplicationGroupId,Status:Status,Engine:Engine}"

# View S3 buckets
aws s3 ls

# View CloudFront distributions
aws cloudfront list-distributions --query "DistributionList.Items[].{ID:Id,DomainName:DomainName,Status:Status}"
```

### View Costs

```bash
# Current month costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "1 month ago" +%Y-%m-01),End=$(date +%Y-%m-01) \
  --granularity MONTHLY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output table

# Daily costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d "7 days ago" +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity DAILY \
  --metrics UnblendedCost \
  --output table
```

### Scale Up/Down

```bash
# Increase desired capacity (scale up)
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name carwheels-backend-asg \
  --desired-capacity 4

# Decrease desired capacity (scale down)
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name carwheels-backend-asg \
  --desired-capacity 2

# View current status
aws autoscaling describe-auto-scaling-groups \
  --auto-scaling-group-names carwheels-backend-asg \
  --query "AutoScalingGroups[0].{Desired:DesiredCapacity,Current:Instances[].InstanceId,MinSize:MinSize,MaxSize:MaxSize}"
```

### View Logs

```bash
# Real-time API logs
aws logs tail /carwheels/api --follow

# Nginx error logs
aws logs tail /carwheels/nginx-error --follow

# Search for errors
aws logs filter-log-events \
  --log-group-name /carwheels/api \
  --filter-pattern "ERROR" \
  --limit 50

# Export logs to S3
aws logs create-export-task \
  --log-group-name /carwheels/api \
  --from $(date -d "7 days ago" +%s)000 \
  --to $(date +%s)000 \
  --destination carwheels-logs \
  --destination-prefix api-logs
```

### Create Database Backups

```bash
# Manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier carwheels-db \
  --db-snapshot-identifier carwheels-backup-$(date +%Y%m%d-%H%M%S)

# Export to S3
aws rds start-export-task \
  --export-task-identifier carwheels-export-$(date +%Y%m%d) \
  --source-arn arn:aws:rds:us-east-1:ACCOUNT_ID:db:carwheels-db \
  --s3-bucket-name carwheels-backups \
  --s3-prefix manual-exports

# List snapshots
aws rds describe-db-snapshots \
  --db-instance-identifier carwheels-db \
  --query "DBSnapshots[].{SnapshotID:DBSnapshotIdentifier,CreatedTime:SnapshotCreateTime,Status:Status}"
```

### Monitor Performance

```bash
# Real-time metrics
watch -n 5 'aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=AutoScalingGroupName,Value=carwheels-backend-asg \
  --start-time $(date -u -d "5 min ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Average \
  --output table'

# Database metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/RDS \
  --metric-name CPUUtilization \
  --dimensions Name=DBInstanceIdentifier,Value=carwheels-db \
  --start-time $(date -u -d "1 hour ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average,Maximum

# Network traffic
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApplicationELB \
  --metric-name TargetResponseTime \
  --dimensions Name=LoadBalancer,Value=app/carwheels-alb/... \
  --start-time $(date -u -d "1 hour ago" +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 \
  --statistics Average
```

---

## Cleanup (Destroy Resources)

```bash
# WARNING: This deletes everything!

cd infrastructure

# Preview what will be deleted
terraform plan -destroy

# Destroy all resources
terraform destroy

# Type: yes when prompted

# This removes:
# ✓ EC2 instances
# ✓ RDS database
# ✓ ElastiCache Redis
# ✓ Load balancer
# ✓ S3 bucket
# ✓ All network resources

# Note: S3 bucket and snapshots may be retained for safety
```

---

## Useful AWS CLI Shortcuts

Add to your `.bashrc` or `.zshrc`:

```bash
# List all CarWheels resources
alias cw-ls='aws ec2 describe-instances \
  --filters "Name=tag:Project,Values=CarWheels" \
  --query "Reservations[].Instances[].[InstanceId,State.Name,PublicIpAddress]" \
  --output table'

# SSH to CarWheels instance
alias cw-ssh='ssh -i carwheels-key.pem ec2-user@$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=carwheels-backend" \
  --query "Reservations[0].Instances[0].PublicIpAddress" --output text)'

# View API logs
alias cw-logs='aws logs tail /carwheels/api --follow'

# Get API URL
alias cw-api='aws elbv2 describe-load-balancers \
  --query "LoadBalancers[].DNSName" --output text'

# Get costs
alias cw-costs='aws ce get-cost-and-usage \
  --time-period Start=$(date -d "1 month ago" +%Y-%m-01),End=$(date +%Y-%m-01) \
  --granularity MONTHLY --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE --output table'
```

---

## Costs Estimate

| Service | Size | Monthly Cost |
|---------|------|--------------|
| RDS | db.t3.micro | ~$30 |
| ElastiCache | cache.t3.micro | ~$25 |
| EC2 (2x t3.small) | auto-scaling | ~$40 |
| Data Transfer | ~100GB | ~$15 |
| S3 + CloudFront | images | ~$10 |
| **Total** | | **~$120/month** |

*Note: First 12 months eligible for AWS Free Tier (can be free!)*

---

## Support

- Documentation: See `docs/AWS_DEPLOYMENT.md`
- Troubleshooting: See `docs/AWS_TROUBLESHOOTING.md`
- AWS Help: https://console.aws.amazon.com/support/

---

## Next Steps

1. ✅ Setup AWS credentials (`aws configure`)
2. ✅ Deploy infrastructure (`terraform apply`)
3. ✅ Configure domain DNS records
4. ✅ Deploy frontend to Vercel
5. ✅ Test API endpoints
6. ✅ Monitor CloudWatch logs
7. ✅ Setup alerts and backups

**That's it! Your CarWheels app is now live on AWS! 🚀**
