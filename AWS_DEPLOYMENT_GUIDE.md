# AWS Deployment - Complete File Inventory

## 📁 New Files Created for AWS Deployment

### Quick Start Guide (Read This First!)
```
QUICK_START_AWS.md
├── Prerequisites setup
├── 5-step deployment process
├── Common operations (scale, monitor, backup)
├── Cost estimates
├── Useful AWS CLI commands
└── Estimated time: 30 minutes to deploy
```

### Infrastructure as Code (Terraform)
```
infrastructure/
├── main.tf
│   ├── VPC with public/private subnets
│   ├── RDS PostgreSQL Multi-AZ
│   ├── ElastiCache Redis Cluster
│   ├── EC2 Auto Scaling Group
│   ├── Application Load Balancer
│   ├── S3 Bucket + CloudFront CDN
│   ├── Route 53 DNS
│   ├── CloudWatch Monitoring & Alarms
│   ├── IAM roles and security groups
│   └── 1000+ lines of production code
│
├── terraform.tfvars
│   ├── AWS region configuration
│   ├── Database credentials
│   ├── Instance types
│   ├── Domain name
│   └── Environment variables
│
├── user_data.sh
│   ├── Installs Node.js 18
│   ├── Sets up PM2 process manager
│   ├── Configures Nginx reverse proxy
│   ├── CloudWatch agent setup
│   ├── Auto-starts application
│   └── Runs on EC2 instance startup
│
└── deploy.sh
    ├── Prerequisites verification
    ├── Terraform initialization
    ├── Infrastructure deployment
    ├── Health checks
    ├── SNS alert setup
    └── Automated deployment script
```

### Documentation
```
docs/

├── AWS_DEPLOYMENT.md
│   ├── Table of Contents
│   ├── Prerequisites & cost estimate
│   ├── Architecture overview
│   ├── RDS PostgreSQL Setup (detailed)
│   ├── ElastiCache Redis Setup
│   ├── EC2 Backend Deployment (step-by-step)
│   ├── Vercel Frontend Deployment
│   ├── S3 & CloudFront Setup
│   ├── Domain & SSL Configuration
│   ├── Monitoring & Maintenance
│   ├── Cost Optimization Tips
│   ├── Troubleshooting Section
│   ├── Production Checklist
│   └── Useful AWS Commands Reference
│
├── AWS_TROUBLESHOOTING.md
│   ├── Issue 1: RDS Connection Failed
│   ├── Issue 2: Redis Connection Failed
│   ├── Issue 3: EC2 Instance Not Receiving Traffic
│   ├── Issue 4: SSL Certificate Issues
│   ├── Issue 5: High CPU/Memory Usage
│   ├── Issue 6: Database Performance Issues
│   ├── Issue 7: Cost Overages
│   ├── Issue 8: Terraform State Issues
│   ├── Issue 9: DNS Not Resolving
│   ├── Issue 10: Application Won't Start
│   ├── Quick Debugging Commands
│   ├── Prevention Tips
│   └── Getting Help Resources
│
└── AWS_ARCHITECTURE.md
    ├── Complete Architecture Diagram
    ├── Service Architecture explanation
    ├── Deployment Guide Files Summary
    ├── Cost Breakdown Table
    ├── Deployment Steps (5 phases)
    ├── Key Features Listed
    ├── Next Steps After Deployment
    └── Support & Documentation Links
```

---

## 📊 Architecture Overview

### What Gets Deployed (10 AWS Services)

1. **VPC** - Virtual Private Cloud with 4 subnets
2. **RDS** - PostgreSQL database with Multi-AZ failover
3. **ElastiCache** - Redis cluster for caching
4. **EC2** - 2-4 instances with auto-scaling
5. **ALB** - Application Load Balancer with SSL
6. **Auto Scaling Group** - Automatic instance scaling
7. **S3** - Image storage bucket
8. **CloudFront** - CDN for images
9. **Route 53** - DNS management
10. **CloudWatch** - Monitoring and logging

### Deployment Time: ~20 minutes
- Terraform init: 2 minutes
- Infrastructure creation: 10-15 minutes
- EC2 setup: 5-10 minutes (in background)
- Domain configuration: 5 minutes (manual)

---

## 🚀 Quick Start Summary

### Step 1: Install Tools
```bash
# AWS CLI: https://awscli.amazonaws.com/AWSCLIV2.msi
# Terraform: https://www.terraform.io/downloads.html
# Configure: aws configure
```

### Step 2: Deploy Infrastructure
```bash
cd infrastructure
terraform init
terraform apply
# Type: yes when prompted
# Wait 10-15 minutes
```

### Step 3: Configure Domain
```bash
# Get ALB DNS name
aws elbv2 describe-load-balancers --query "LoadBalancers[].DNSName"

# Update DNS records to point to this ALB
# (In your domain registrar or Route 53)
```

### Step 4: Deploy Frontend
```bash
cd frontend
vercel
# Connect GitHub repository
# Deploy to Vercel
```

### Step 5: Test & Monitor
```bash
curl https://api.carwheels.com/api/health
aws logs tail /carwheels/api --follow
```

---

## 📝 Files Checklist

### Main Deployment Files
- ✅ `infrastructure/main.tf` - Terraform configuration (1000+ lines)
- ✅ `infrastructure/terraform.tfvars` - Variable configuration
- ✅ `infrastructure/user_data.sh` - EC2 startup script
- ✅ `infrastructure/deploy.sh` - Automated deployment

### Documentation Files
- ✅ `QUICK_START_AWS.md` - 30-minute quick start guide
- ✅ `docs/AWS_DEPLOYMENT.md` - 50-page comprehensive guide
- ✅ `docs/AWS_TROUBLESHOOTING.md` - Problem-solving reference
- ✅ `docs/AWS_ARCHITECTURE.md` - Architecture overview

### Setup Scripts
- ✅ `setup.sh` - Unix/Linux setup script
- ✅ `setup.bat` - Windows setup script

---

## 🛠️ What Each File Does

### main.tf (Terraform - 1000+ lines)
**Purpose**: Defines all AWS infrastructure

**Creates**:
- VPC with public/private subnets in 2 AZs
- Internet Gateway and NAT Gateway
- Route tables and associations
- 4 Security Groups (ALB, Backend, RDS, Redis)
- RDS PostgreSQL with backups and encryption
- ElastiCache Redis with High Availability
- EC2 Launch Template with user data
- Auto Scaling Group (2-4 instances)
- Application Load Balancer
- Target Groups and Listeners
- S3 bucket with versioning and CORS
- CloudFront distribution
- Route 53 hosted zone and records
- CloudWatch alarms for monitoring
- IAM roles and policies

**Deploy with**: `terraform apply`

### terraform.tfvars (Configuration - 10 lines)
**Purpose**: Variables for your specific setup

**Contains**:
- AWS region (us-east-1)
- Application name (carwheels)
- Domain name (your-domain.com)
- Database credentials
- Instance type (t3.small)

**Edit**: Before deployment to customize for your needs

### user_data.sh (EC2 Script - 200 lines)
**Purpose**: Initializes EC2 instances on startup

**Does**:
- Installs Node.js 18 via NVM
- Installs PM2 process manager
- Clones your GitHub repository
- Installs npm dependencies
- Builds TypeScript code
- Creates .env file with AWS endpoints
- Creates PM2 ecosystem configuration
- Starts Node.js application (2 worker processes)
- Configures Nginx as reverse proxy
- Sets up SSL/TLS
- Installs CloudWatch agent
- Auto-starts services on reboot

**Execution**: Automatic when EC2 instance starts

### deploy.sh (Deployment Script - 150 lines)
**Purpose**: Automates the entire deployment process

**Does**:
- Checks prerequisites (AWS CLI, Terraform)
- Validates AWS credentials
- Initializes Terraform
- Plans infrastructure changes
- Applies Terraform configuration
- Waits for instances to be ready
- Runs health checks
- Sets up SNS alerts
- Prints deployment summary

**Run with**: `chmod +x infrastructure/deploy.sh && ./infrastructure/deploy.sh`

---

## 📚 Documentation Guide

### For Different Users:

**I want to deploy quickly (30 min)**
→ Read: `QUICK_START_AWS.md`

**I want detailed step-by-step setup**
→ Read: `docs/AWS_DEPLOYMENT.md`

**I want to understand the architecture**
→ Read: `docs/AWS_ARCHITECTURE.md`

**I encountered an error**
→ Read: `docs/AWS_TROUBLESHOOTING.md`

**I want to know what each AWS service does**
→ Read: `docs/AWS_ARCHITECTURE.md` (Service Architecture section)

---

## 💰 Cost Information

### Monthly Cost Estimate (Production)
- RDS PostgreSQL: $30
- ElastiCache Redis: $25
- EC2 (2-4 instances): $40-80
- Data Transfer: $5-20
- Storage: $10
- **Total: $110-165/month**

### Free Tier (First 12 months)
- RDS: 750 hours/month = **FREE**
- ElastiCache: 750 hours/month = **FREE**
- EC2: 750 hours/month = **FREE** (some conditions apply)
- With Free Tier: **$0-50/month for 12 months**

### Cost Optimization Options
1. Reserve Instances (save 40%)
2. Spot Instances (save 70%, non-critical only)
3. S3 Intelligent-Tiering (save on storage)
4. CloudFront (reduce bandwidth costs)
5. Auto-scaling (avoid over-provisioning)

---

## 🔐 Security Features

✅ **Network Security**
- VPC isolation
- Private subnets for databases
- Security groups (firewall rules)
- ALB with DDoS protection

✅ **Data Security**
- RDS encryption at rest
- Redis encryption in transit
- SSL/TLS for all connections
- Encrypted S3 buckets

✅ **Access Control**
- IAM roles and policies
- EC2 instance profiles
- Database access restrictions
- Least privilege principle

✅ **Monitoring**
- CloudWatch logging all activity
- Alarms for suspicious behavior
- CloudTrail for API auditing
- VPC Flow Logs

---

## ⚡ Performance Features

✅ **Auto-Scaling**
- 2 to 4 EC2 instances based on CPU
- Scales up when traffic increases
- Scales down to save costs
- Health checks ensure valid instances

✅ **Load Balancing**
- ALB distributes traffic across instances
- Connection draining for safe deploys
- Health checks every 30 seconds
- Sticky sessions (cookies)

✅ **Caching**
- CloudFront for images (global CDN)
- Redis cluster for session storage
- Application-level caching ready
- CDN reduces latency globally

✅ **Database Performance**
- Connection pooling
- Read replicas (can add)
- Query optimization indexes
- Automated backups don't impact performance

---

## 📋 Deployment Checklist

Before deploying, ensure:
- [ ] AWS account created
- [ ] AWS CLI installed and configured
- [ ] Terraform installed
- [ ] GitHub repository ready
- [ ] Domain registered
- [ ] AWS Free Tier eligible (if using free tier)

During deployment:
- [ ] Run `terraform apply`
- [ ] Wait for infrastructure creation
- [ ] Verify all resources created
- [ ] Run health checks

After deployment:
- [ ] Update domain DNS records
- [ ] Deploy frontend to Vercel
- [ ] Test API endpoints
- [ ] Set up alerts and backups
- [ ] Monitor CloudWatch logs

---

## 🆘 Getting Help

### If deployment fails:
1. Check `docs/AWS_TROUBLESHOOTING.md`
2. Review CloudWatch logs: `aws logs tail /carwheels/api --follow`
3. SSH into instance: `ssh -i carwheels-key.pem ec2-user@IP`
4. Run: `pm2 status` and `pm2 logs`

### Common Issues:
- RDS connection refused → Check security groups
- Redis timeout → Check ElastiCache status
- 502 Bad Gateway → Check EC2 instance health
- SSL certificate error → Check ACM certificate status
- DNS not resolving → Check Route 53 records

### Resources:
- AWS Support: https://console.aws.amazon.com/support/
- AWS Docs: https://docs.aws.amazon.com
- Terraform Docs: https://www.terraform.io/docs
- Stack Overflow: Tag [amazon-web-services] or [terraform]

---

## 🎯 Next Steps

1. **Read QUICK_START_AWS.md** (5 minutes)
   - Understand the deployment process
   - Check prerequisites

2. **Setup AWS** (5 minutes)
   - Install AWS CLI
   - Run `aws configure`

3. **Deploy Infrastructure** (20 minutes)
   - Go to `infrastructure` folder
   - Run `terraform apply`
   - Wait for completion

4. **Configure Domain** (5 minutes)
   - Update DNS records
   - Wait for propagation

5. **Deploy Frontend** (10 minutes)
   - Push to GitHub
   - Deploy to Vercel

6. **Test & Monitor** (5 minutes)
   - Test API endpoints
   - View CloudWatch logs
   - Setup alerts

**Total Time: ~50 minutes from zero to production!** 🚀

---

## 📞 Support

For questions about:
- **AWS Services**: See `docs/AWS_DEPLOYMENT.md`
- **Architecture**: See `docs/AWS_ARCHITECTURE.md`
- **Troubleshooting**: See `docs/AWS_TROUBLESHOOTING.md`
- **Quick Reference**: See `QUICK_START_AWS.md`
- **Terraform**: See `infrastructure/main.tf` comments

---

**Your CarWheels app is now ready for AWS deployment!** 🚗🚀

Created: February 13, 2026
Last Updated: February 13, 2026
