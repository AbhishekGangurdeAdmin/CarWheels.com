# AWS Deployment Guide for CarWheels.com

This guide provides step-by-step instructions for deploying CarWheels to AWS using EC2, RDS, ElastiCache, and S3.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [Architecture Overview](#architecture-overview)
3. [RDS PostgreSQL Setup](#rds-postgresql-setup)
4. [ElastiCache Redis Setup](#elasticache-redis-setup)
5. [EC2 Backend Deployment](#ec2-backend-deployment)
6. [Vercel Frontend Deployment](#vercel-frontend-deployment)
7. [S3 & CloudFront Setup](#s3--cloudfront-setup)
8. [Domain & SSL](#domain--ssl)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Cost Optimization](#cost-optimization)

---

## Prerequisites

### AWS Account & Tools
- AWS Account with billing enabled
- AWS CLI installed and configured: `aws configure`
- SSH key pair for EC2 instances
- GitHub account (for frontend deployment)

### Cost Estimate (Monthly)
- RDS PostgreSQL (db.t3.micro): ~$30-50
- ElastiCache Redis (cache.t3.micro): ~$20-30
- EC2 (t3.small): ~$20-30
- Data Transfer: ~$0-50
- **Total: ~$70-160/month** (Free tier eligible for 12 months)

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                        │
└────────────┬──────────────────────────────────┬──────────────┘
             │                                  │
        ┌────▼─────┐                   ┌────────▼────────┐
        │  Vercel   │                   │  S3 + CloudFront│
        │ (Frontend)│                   │   (Static Files)│
        └────┬─────┘                   └────────┬────────┘
             │                                  │
             └──────────────┬───────────────────┘
                           │
                    ┌──────▼──────┐
                    │   Nginx/SSL  │
                    │  (ALB/Route53)
                    └──────┬──────┘
                           │
                    ┌──────▼────────┐
                    │  EC2 Instance  │
                    │   (Node.js)    │
                    └──────┬────────┘
                           │
        ┌──────────────────┼──────────────────┐
        │                  │                  │
    ┌───▼────┐      ┌──────▼──────┐    ┌─────▼──────┐
    │   RDS  │      │ ElastiCache │    │   S3 Logs  │
    │   DB   │      │    Redis    │    │   Backup   │
    └────────┘      └─────────────┘    └────────────┘
```

---

## RDS PostgreSQL Setup

### Step 1: Create RDS Instance

```bash
# Via AWS Console
# 1. Go to RDS Dashboard → Create Database
# 2. Engine: PostgreSQL (version 15)
# 3. Templates: Free tier (eligible for 12 months)
# 4. DB Instance Identifier: carwheels-db
# 5. Master Username: postgres
# 6. Auto-generate password (save it securely)
# 7. DB Instance Class: db.t3.micro (free tier)
# 8. Storage: 20 GB (free tier allocation)
# 9. Storage autoscaling: Enabled
# 10. Backup retention: 7 days
# 11. Encryption: Enabled
# 12. VPC: Default
# 13. Publicly accessible: NO (for security)
# 14. Enhanced monitoring: Disabled (for cost)
# 15. Create database
```

### Step 2: Configure Security Groups

```bash
# Get your EC2 security group ID
EC2_SG_ID=$(aws ec2 describe-security-groups --filters "Name=group-name,Values=launch-wizard-1" --query "SecurityGroups[0].GroupId" --output text)

# Get RDS security group ID
RDS_SG_ID=$(aws rds describe-db-instances --db-instance-identifier carwheels-db --query "DBInstances[0].VpcSecurityGroups[0].VpcSecurityGroupId" --output text)

# Allow EC2 to access RDS
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 5432 \
  --source-group $EC2_SG_ID
```

### Step 3: Get RDS Endpoint

```bash
# Get the RDS endpoint
aws rds describe-db-instances \
  --db-instance-identifier carwheels-db \
  --query "DBInstances[0].Endpoint.Address" \
  --output text

# Output: carwheels-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com
```

---

## ElastiCache Redis Setup

### Step 1: Create Redis Cluster

```bash
# Via AWS Console
# 1. Go to ElastiCache → Create Cache
# 2. Engine: Redis (version 7.x)
# 3. Cluster mode: Disabled
# 4. Node type: cache.t3.micro (free tier eligible)
# 5. Number of replicas: 1 (for HA)
# 6. Automatic failover: Enabled
# 7. VPC: Same as RDS
# 8. Subnet group: Create default
# 9. Create cluster
```

### Step 2: Configure Security Group

```bash
# Allow EC2 to access Redis
aws ec2 authorize-security-group-ingress \
  --group-id $RDS_SG_ID \
  --protocol tcp \
  --port 6379 \
  --source-group $EC2_SG_ID
```

### Step 3: Get Redis Endpoint

```bash
# Get primary endpoint
aws elasticache describe-cache-clusters \
  --cache-cluster-id carwheels-redis \
  --show-cache-node-info \
  --query "CacheClusters[0].CacheNodes[0].Endpoint.Address" \
  --output text

# Output: carwheels-redis.xxxxxxxxxxxx.ng.0001.use1.cache.amazonaws.com
```

---

## EC2 Backend Deployment

### Step 1: Launch EC2 Instance

```bash
# Create key pair
aws ec2 create-key-pair \
  --key-name carwheels-key \
  --query 'KeyMaterial' \
  --output text > carwheels-key.pem

chmod 400 carwheels-key.pem

# Launch instance
aws ec2 run-instances \
  --image-id ami-0c55b159cbfafe1f0 \
  --instance-type t3.small \
  --key-name carwheels-key \
  --security-groups launch-wizard-1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=CarWheels-Backend}]'

# Get instance IP
INSTANCE_IP=$(aws ec2 describe-instances \
  --filters "Name=tag:Name,Values=CarWheels-Backend" \
  --query "Reservations[0].Instances[0].PublicIpAddress" \
  --output text)

echo $INSTANCE_IP
```

### Step 2: Connect to EC2

```bash
# SSH into instance
ssh -i carwheels-key.pem ec2-user@$INSTANCE_IP

# Update system
sudo yum update -y
sudo yum install -y git curl
```

### Step 3: Install Node.js & Dependencies

```bash
# Install Node.js 18
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 18
node -v  # v18.x.x

# Install PostgreSQL client
sudo yum install -y postgresql

# Install PM2 globally
npm install -g pm2
```

### Step 4: Clone & Setup Backend

```bash
# Clone repository
git clone https://github.com/YOUR_USERNAME/carwheels.git
cd carwheels/backend

# Install dependencies
npm install

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD@carwheels-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com:5432/carwheels
REDIS_URL=redis://carwheels-redis.xxxxxxxxxxxx.ng.0001.use1.cache.amazonaws.com:6379
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=carwheels-bucket
CORS_ORIGIN=https://carwheels.com
LOG_LEVEL=info
EOF

# Create database and tables
PGPASSWORD=YOUR_PASSWORD psql -h carwheels-db.xxxxxxxxxxxx.us-east-1.rds.amazonaws.com -U postgres -d carwheels -f src/db/schema.ts

# Build TypeScript
npm run build
```

### Step 5: Start Backend with PM2

```bash
# Create PM2 ecosystem config
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [
    {
      name: "carwheels-api",
      script: "./dist/index.js",
      instances: 2,
      exec_mode: "cluster",
      env: {
        NODE_ENV: "production"
      },
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time_format: "YYYY-MM-DD HH:mm:ss Z",
      merge_logs: true,
      watch: false,
      ignore_watch: ["node_modules", "logs"],
      max_memory_restart: "500M",
      max_restarts: 10,
      min_uptime: "10s"
    }
  ]
};
EOF

# Start with PM2
pm2 start ecosystem.config.js

# Save PM2 config to restart on reboot
pm2 startup
pm2 save

# Check status
pm2 status
pm2 logs carwheels-api
```

### Step 6: Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo yum install -y nginx

# Create Nginx config
sudo tee /etc/nginx/conf.d/carwheels.conf > /dev/null << 'EOF'
upstream carwheels_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    
    # Redirect to HTTPS
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    # SSL Certificate (use AWS Certificate Manager)
    ssl_certificate /etc/ssl/certs/carwheels.crt;
    ssl_certificate_key /etc/ssl/private/carwheels.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    
    # Gzip compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
    
    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    # Rate limiting
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    # Proxy to backend
    location /api/ {
        proxy_pass http://carwheels_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 30s;
        proxy_connect_timeout 30s;
    }
    
    # Health check endpoint
    location /health {
        proxy_pass http://carwheels_backend;
        access_log off;
    }
}
EOF

# Enable and start Nginx
sudo systemctl enable nginx
sudo systemctl start nginx
sudo systemctl status nginx

# Test configuration
sudo nginx -t
```

### Step 7: Setup SSL with Let's Encrypt

```bash
# Install Certbot
sudo yum install -y certbot python-certbot-nginx

# Get certificate (use your domain)
sudo certbot certonly --standalone \
  -d carwheels.com \
  -d www.carwheels.com \
  --email admin@carwheels.com

# Update Nginx config with certificate paths
# Then reload:
sudo systemctl reload nginx

# Setup auto-renewal
sudo systemctl enable certbot-renew.timer
```

---

## Vercel Frontend Deployment

### Step 1: Push to GitHub

```bash
# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: CarWheels frontend"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/carwheels-frontend.git
git push -u origin main
```

### Step 2: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
cd frontend
vercel

# Set up environment variables in Vercel dashboard:
# NEXT_PUBLIC_API_URL=https://api.carwheels.com
```

### Step 3: Configure Custom Domain

1. Go to Vercel Dashboard → Project Settings
2. Add Domain: `carwheels.com`
3. Add Nameservers to your domain registrar
4. Update Route 53 (see Domain & SSL section)

---

## S3 & CloudFront Setup

### Step 1: Create S3 Bucket

```bash
# Create bucket for images
aws s3 mb s3://carwheels-images --region us-east-1

# Enable versioning
aws s3api put-bucket-versioning \
  --bucket carwheels-images \
  --versioning-configuration Status=Enabled

# Enable public read access
aws s3api put-bucket-acl --bucket carwheels-images --acl public-read

# Create policy
cat > s3-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::carwheels-images/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket carwheels-images --policy file://s3-policy.json
```

### Step 2: Create CloudFront Distribution

```bash
# Create distribution config
cat > cloudfront-config.json << 'EOF'
{
  "CallerReference": "carwheels-$(date +%s)",
  "DefaultCacheBehavior": {
    "TargetOriginId": "S3Origin",
    "ViewerProtocolPolicy": "redirect-to-https",
    "TrustedSigners": {
      "Enabled": false,
      "Quantity": 0
    },
    "ForwardedValues": {
      "QueryString": false,
      "Cookies": {
        "Forward": "none"
      }
    },
    "MinTTL": 0,
    "DefaultTTL": 86400,
    "MaxTTL": 31536000
  },
  "Origins": {
    "Quantity": 1,
    "Items": [
      {
        "Id": "S3Origin",
        "DomainName": "carwheels-images.s3.amazonaws.com",
        "S3OriginConfig": {
          "OriginAccessIdentity": ""
        }
      }
    ]
  },
  "Enabled": true,
  "Comment": "CarWheels Image CDN"
}
EOF

aws cloudfront create-distribution --distribution-config file://cloudfront-config.json
```

### Step 3: Update Backend to Use CloudFront

In `backend/.env`:
```env
AWS_CLOUDFRONT_URL=https://d111111abcdef8.cloudfront.net
AWS_S3_BUCKET=carwheels-images
```

In backend code:
```typescript
// utils/uploadHelper.ts
const imageUrl = `${process.env.AWS_CLOUDFRONT_URL}/vehicles/${filename}`;
```

---

## Domain & SSL

### Step 1: Route 53 Setup

```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name carwheels.com \
  --caller-reference $(date +%s)

# Get nameservers
aws route53 list-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --query "ResourceRecordSets[?Type=='NS']"

# Add these nameservers to your domain registrar

# Create A record for API
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "api.carwheels.com",
        "Type": "A",
        "TTL": 300,
        "ResourceRecords": [{"Value": "'$INSTANCE_IP'"}]
      }
    }]
  }'

# Create CNAME for images (CloudFront)
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "images.carwheels.com",
        "Type": "CNAME",
        "TTL": 300,
        "ResourceRecords": [{"Value": "d111111abcdef8.cloudfront.net"}]
      }
    }]
  }'
```

### Step 2: SSL Certificates

```bash
# Request certificate in AWS Certificate Manager
aws acm request-certificate \
  --domain-name carwheels.com \
  --subject-alternative-names www.carwheels.com api.carwheels.com \
  --validation-method DNS \
  --region us-east-1
```

---

## Monitoring & Maintenance

### Step 1: CloudWatch Monitoring

```bash
# Create CloudWatch alarm for EC2 CPU
aws cloudwatch put-metric-alarm \
  --alarm-name carwheels-high-cpu \
  --alarm-description "Alert when CPU exceeds 80%" \
  --metric-name CPUUtilization \
  --namespace AWS/EC2 \
  --statistic Average \
  --period 300 \
  --threshold 80 \
  --comparison-operator GreaterThanThreshold \
  --evaluation-periods 2

# Create alarm for RDS connections
aws cloudwatch put-metric-alarm \
  --alarm-name carwheels-high-connections \
  --alarm-description "Alert when DB connections exceed 50" \
  --metric-name DatabaseConnections \
  --namespace AWS/RDS \
  --statistic Average \
  --period 300 \
  --threshold 50 \
  --comparison-operator GreaterThanThreshold
```

### Step 2: Backup Strategy

```bash
# Enable automatic backups (RDS)
aws rds modify-db-instance \
  --db-instance-identifier carwheels-db \
  --backup-retention-period 30 \
  --preferred-backup-window "03:00-04:00"

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier carwheels-db \
  --db-snapshot-identifier carwheels-backup-$(date +%Y%m%d)

# Export snapshot to S3
aws rds start-export-task \
  --export-task-identifier carwheels-export-$(date +%s) \
  --source-arn arn:aws:rds:us-east-1:ACCOUNT_ID:db:carwheels-db \
  --s3-bucket-name carwheels-backups \
  --s3-prefix snapshots/
```

### Step 3: Logs Management

```bash
# Configure CloudWatch Logs for backend
# In your EC2 instance:
sudo yum install -y amazon-cloudwatch-agent

# Create CloudWatch Logs group
aws logs create-log-group --log-group-name /carwheels/api

# Stream PM2 logs to CloudWatch
pm2 install pm2-auto-pull
```

---

## Cost Optimization

### Production Checklist

- [ ] Enable Reserved Instances for EC2 (40% savings)
- [ ] Use spot instances for non-critical workloads
- [ ] Enable S3 Intelligent-Tiering for old backups
- [ ] Use RDS Aurora Serverless for variable load
- [ ] Enable VPC endpoints to reduce NAT charges
- [ ] Use CloudFront for static assets
- [ ] Enable compression on Nginx
- [ ] Use ElastiCache for database query caching
- [ ] Implement proper index strategy in PostgreSQL
- [ ] Monitor unused resources regularly

### Budget Alerts

```bash
# Create budget alert
aws budgets create-budget \
  --account-id $(aws sts get-caller-identity --query Account --output text) \
  --budget file://budget.json \
  --notifications-with-subscribers file://notifications.json
```

---

## Troubleshooting

### Backend Not Starting

```bash
# Check PM2 logs
pm2 logs carwheels-api

# Check Nginx logs
sudo tail -f /var/log/nginx/error.log

# Check database connection
psql -h $RDS_ENDPOINT -U postgres -d carwheels -c "SELECT 1;"

# Check Redis connection
redis-cli -h $REDIS_ENDPOINT ping
```

### High CPU/Memory Usage

```bash
# Check running processes
pm2 monit

# Check Nginx worker count
ps aux | grep nginx

# Optimize Node.js
pm2 restart carwheels-api -- --max-old-space-size=512
```

### Database Connection Issues

```bash
# Check security groups
aws ec2 describe-security-groups --group-ids $RDS_SG_ID

# Check RDS status
aws rds describe-db-instances --db-instance-identifier carwheels-db

# Restart RDS (if needed)
aws rds reboot-db-instance --db-instance-identifier carwheels-db
```

### SSL Certificate Issues

```bash
# Check certificate expiration
openssl s_client -connect api.carwheels.com:443 | grep "notAfter"

# Renew certificate
sudo certbot renew --force-renewal

# Reload Nginx
sudo systemctl reload nginx
```

---

## Production Checklist

- [ ] RDS instance created with automated backups
- [ ] ElastiCache Redis configured for caching
- [ ] EC2 instance running backend API
- [ ] PM2 configured with ecosystem.config.js
- [ ] Nginx reverse proxy configured with SSL
- [ ] Vercel frontend deployed with custom domain
- [ ] S3 bucket created for images
- [ ] CloudFront distribution configured
- [ ] Route 53 DNS records configured
- [ ] ACM SSL certificates requested
- [ ] CloudWatch monitoring enabled
- [ ] Backup strategy implemented
- [ ] CI/CD pipeline configured (GitHub Actions)
- [ ] Error logging configured
- [ ] Database optimized with proper indexes
- [ ] Environment variables configured securely
- [ ] Security groups configured properly
- [ ] DDoS protection enabled (Shield)
- [ ] WAF rules configured (optional)
- [ ] Load testing performed

---

## Useful AWS Commands

```bash
# List all EC2 instances
aws ec2 describe-instances --query "Reservations[].Instances[].{ID:InstanceId,Type:InstanceType,IP:PublicIpAddress,State:State.Name}"

# Stop instance (save costs)
aws ec2 stop-instances --instance-ids i-1234567890abcdef0

# Start instance
aws ec2 start-instances --instance-ids i-1234567890abcdef0

# Monitor costs
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics "BlendedCost" \
  --group-by Type=DIMENSION,Key=SERVICE

# Get billing alerts
aws budgets describe-budgets --account-id $(aws sts get-caller-identity --query Account --output text)
```

---

## Next Steps

1. **Clone Repository**: `git clone https://github.com/YOUR_USERNAME/carwheels.git`
2. **Configure AWS CLI**: `aws configure`
3. **Create RDS Instance**: Follow RDS Setup section
4. **Create Redis Cache**: Follow ElastiCache section
5. **Launch EC2**: Follow EC2 Deployment section
6. **Deploy Frontend**: Follow Vercel Deployment section
7. **Configure Domain**: Follow Domain & SSL section
8. **Setup Monitoring**: Follow Monitoring & Maintenance section

---

## Support & Resources

- AWS Documentation: https://docs.aws.amazon.com
- Node.js Best Practices: https://nodejs.org/en/docs/guides/nodejs-performance/
- PostgreSQL Optimization: https://www.postgresql.org/docs/current/performance-tips.html
- Nginx Documentation: https://nginx.org/en/docs/
- PM2 Documentation: https://pm2.keymetrics.io/docs/usage/overview/

---

**Last Updated**: February 2026
**Maintained by**: CarWheels Development Team
