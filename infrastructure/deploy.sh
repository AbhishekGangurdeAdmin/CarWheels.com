#!/bin/bash

# CarWheels AWS Deployment Script
# This script automates the entire AWS deployment process

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
AWS_REGION="us-east-1"
APP_NAME="carwheels"
DOMAIN_NAME="carwheels.com"

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   CarWheels AWS Deployment Script      ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# ============================================================
# PRE-DEPLOYMENT CHECKS
# ============================================================

check_prerequisites() {
    echo -e "${YELLOW}[*] Checking prerequisites...${NC}"
    
    if ! command -v aws &> /dev/null; then
        echo -e "${RED}[✗] AWS CLI not found. Please install it first.${NC}"
        echo "   https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
        exit 1
    fi
    
    if ! command -v terraform &> /dev/null; then
        echo -e "${RED}[✗] Terraform not found. Please install it first.${NC}"
        echo "   https://www.terraform.io/downloads.html"
        exit 1
    fi
    
    if ! aws sts get-caller-identity &> /dev/null; then
        echo -e "${RED}[✗] AWS credentials not configured. Please run 'aws configure'${NC}"
        exit 1
    fi
    
    echo -e "${GREEN}[✓] All prerequisites met${NC}"
    echo ""
}

# ============================================================
# TERRAFORM DEPLOYMENT
# ============================================================

deploy_infrastructure() {
    echo -e "${YELLOW}[*] Deploying AWS infrastructure with Terraform...${NC}"
    
    cd infrastructure
    
    # Initialize Terraform
    echo -e "${BLUE}[*] Initializing Terraform...${NC}"
    terraform init
    
    # Validate configuration
    echo -e "${BLUE}[*] Validating Terraform configuration...${NC}"
    terraform validate
    
    # Plan deployment
    echo -e "${BLUE}[*] Planning infrastructure changes...${NC}"
    terraform plan -out=tfplan
    
    # Apply configuration
    echo -e "${BLUE}[*] Applying infrastructure changes...${NC}"
    read -p "Do you want to apply these changes? (yes/no) " -r
    echo
    if [[ $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
        terraform apply tfplan
        
        # Get outputs
        INSTANCE_IP=$(terraform output -raw alb_dns_name)
        RDS_ENDPOINT=$(terraform output -raw rds_endpoint)
        REDIS_ENDPOINT=$(terraform output -raw redis_endpoint)
        S3_BUCKET=$(terraform output -raw s3_bucket_name)
        
        echo ""
        echo -e "${GREEN}[✓] Infrastructure deployed successfully!${NC}"
        echo ""
        echo "Important Endpoints:"
        echo "  ALB DNS: $INSTANCE_IP"
        echo "  RDS: $RDS_ENDPOINT"
        echo "  Redis: $REDIS_ENDPOINT"
        echo "  S3 Bucket: $S3_BUCKET"
        echo ""
        
        # Save to file
        cat > deployment_info.txt << EOF
Deployment Information - $(date)
============================

ALB DNS Name: $INSTANCE_IP
RDS Endpoint: $RDS_ENDPOINT
Redis Endpoint: $REDIS_ENDPOINT
S3 Bucket: $S3_BUCKET

Next Steps:
1. Update your domain DNS records to point to: $INSTANCE_IP
2. Wait 5-10 minutes for EC2 instances to initialize
3. Monitor CloudWatch logs for startup process
4. Test API: curl -H "Host: carwheels.com" http://$INSTANCE_IP/api/health
5. Update frontend .env with API_URL: https://api.carwheels.com
EOF
        
        echo "Deployment information saved to: deployment_info.txt"
    else
        echo "Deployment cancelled."
        exit 0
    fi
    
    cd ..
}

# ============================================================
# POST-DEPLOYMENT CONFIGURATION
# ============================================================

configure_post_deployment() {
    echo ""
    echo -e "${YELLOW}[*] Post-deployment configuration...${NC}"
    
    # Get EC2 instance
    INSTANCE_IP=$(aws ec2 describe-instances \
        --filters "Name=tag:Name,Values=${APP_NAME}-backend" \
        --query "Reservations[0].Instances[0].PublicIpAddress" \
        --region $AWS_REGION \
        --output text)
    
    if [ -z "$INSTANCE_IP" ] || [ "$INSTANCE_IP" == "None" ]; then
        echo -e "${YELLOW}[!] Could not find EC2 instance IP. Waiting for instance to initialize...${NC}"
        sleep 30
        INSTANCE_IP=$(aws ec2 describe-instances \
            --filters "Name=tag:Name,Values=${APP_NAME}-backend" \
            --query "Reservations[0].Instances[0].PublicIpAddress" \
            --region $AWS_REGION \
            --output text)
    fi
    
    echo -e "${GREEN}[✓] Instance IP: $INSTANCE_IP${NC}"
    
    # Wait for instance to be ready
    echo -e "${YELLOW}[*] Waiting for instance to be ready (this may take a few minutes)...${NC}"
    aws ec2 wait instance-status-ok \
        --instance-ids $(aws ec2 describe-instances \
            --filters "Name=tag:Name,Values=${APP_NAME}-backend" \
            --query "Reservations[0].Instances[0].InstanceId" \
            --region $AWS_REGION \
            --output text) \
        --region $AWS_REGION || echo "Warning: Instance status check timeout"
    
    echo -e "${GREEN}[✓] Instance is ready${NC}"
}

# ============================================================
# HEALTH CHECKS
# ============================================================

run_health_checks() {
    echo ""
    echo -e "${YELLOW}[*] Running health checks...${NC}"
    
    # Get ALB DNS
    ALB_DNS=$(aws elbv2 describe-load-balancers \
        --query "LoadBalancers[?LoadBalancerName=='${APP_NAME}-alb'].DNSName" \
        --region $AWS_REGION \
        --output text)
    
    if [ -z "$ALB_DNS" ]; then
        echo -e "${YELLOW}[!] ALB not found yet. Skipping health checks.${NC}"
        return
    fi
    
    echo -e "${BLUE}[*] ALB DNS: $ALB_DNS${NC}"
    
    # Test health endpoint
    echo -e "${BLUE}[*] Testing API health endpoint...${NC}"
    if curl -sf -H "Host: ${DOMAIN_NAME}" "http://${ALB_DNS}/api/health" > /dev/null; then
        echo -e "${GREEN}[✓] API is healthy${NC}"
    else
        echo -e "${YELLOW}[!] API health check failed (instance may still be initializing)${NC}"
    fi
    
    echo ""
    echo -e "${GREEN}[✓] Health checks completed${NC}"
}

# ============================================================
# MONITORING SETUP
# ============================================================

setup_monitoring() {
    echo ""
    echo -e "${YELLOW}[*] Setting up monitoring...${NC}"
    
    # Create SNS topic for alerts
    SNS_TOPIC=$(aws sns create-topic \
        --name ${APP_NAME}-alerts \
        --region $AWS_REGION \
        --query TopicArn \
        --output text)
    
    echo -e "${GREEN}[✓] SNS topic created: $SNS_TOPIC${NC}"
    
    # Subscribe email (ask user)
    read -p "Enter email for alerts: " email
    aws sns subscribe \
        --topic-arn $SNS_TOPIC \
        --protocol email \
        --notification-endpoint $email \
        --region $AWS_REGION > /dev/null
    
    echo -e "${GREEN}[✓] Alert subscription created. Check your email to confirm.${NC}"
}

# ============================================================
# DEPLOYMENT SUMMARY
# ============================================================

print_summary() {
    echo ""
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║    Deployment Summary                  ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
    echo ""
    echo -e "${GREEN}✓ Infrastructure deployed successfully!${NC}"
    echo ""
    echo "Next Steps:"
    echo "1. ${YELLOW}Update DNS Records${NC}"
    echo "   Point your domain ($DOMAIN_NAME) to the ALB DNS name"
    echo ""
    echo "2. ${YELLOW}Wait for DNS Propagation${NC}"
    echo "   This may take 15-30 minutes"
    echo ""
    echo "3. ${YELLOW}Test the API${NC}"
    echo "   curl https://api.$DOMAIN_NAME/api/health"
    echo ""
    echo "4. ${YELLOW}Deploy Frontend${NC}"
    echo "   Push to GitHub and connect to Vercel"
    echo ""
    echo "5. ${YELLOW}Monitor Logs${NC}"
    echo "   aws logs tail /carwheels/api --follow"
    echo ""
    echo "Useful Commands:"
    echo "  View logs: aws logs tail /carwheels/api --follow"
    echo "  Scale up: aws autoscaling set-desired-capacity --auto-scaling-group-name carwheels-backend-asg --desired-capacity 4"
    echo "  List instances: aws ec2 describe-instances --filters Name=tag:Name,Values=carwheels-backend"
    echo ""
}

# ============================================================
# MAIN EXECUTION
# ============================================================

main() {
    check_prerequisites
    deploy_infrastructure
    configure_post_deployment
    run_health_checks
    setup_monitoring
    print_summary
}

# Run main function
main

echo -e "${GREEN}Deployment complete!${NC}"
