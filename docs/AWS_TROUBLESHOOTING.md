# AWS Deployment Troubleshooting Guide

## Common Issues & Solutions

### 1. RDS Connection Failed

**Error**: `connect ECONNREFUSED 127.0.0.1:5432` or `ENOTFOUND carwheels-db.xxx.rds.amazonaws.com`

**Solutions**:
```bash
# Check RDS status
aws rds describe-db-instances \
  --db-instance-identifier carwheels-db \
  --query "DBInstances[0].DBInstanceStatus"

# Check security group allows EC2
aws ec2 describe-security-groups \
  --group-ids sg-xxxxx \
  --query "SecurityGroups[0].IpPermissions"

# Test connection from EC2
ssh -i carwheels-key.pem ec2-user@INSTANCE_IP
psql -h carwheels-db.xxxxx.rds.amazonaws.com -U postgres -d carwheels

# Fix: Update security group
aws ec2 authorize-security-group-ingress \
  --group-id sg-rds \
  --protocol tcp \
  --port 5432 \
  --source-group sg-ec2
```

---

### 2. Redis Connection Failed

**Error**: `ECONNREFUSED 127.0.0.1:6379` or timeout

**Solutions**:
```bash
# Check Redis cluster status
aws elasticache describe-replication-groups \
  --replication-group-id carwheels-redis \
  --query "ReplicationGroups[0].Status"

# Check security group
aws ec2 describe-security-groups \
  --group-ids sg-redis \
  --query "SecurityGroups[0].IpPermissions"

# Test from EC2
redis-cli -h carwheels-redis.xxxxx.cache.amazonaws.com -p 6379 ping

# Fix: Enable security group access
aws ec2 authorize-security-group-ingress \
  --group-id sg-redis \
  --protocol tcp \
  --port 6379 \
  --source-group sg-ec2
```

---

### 3. EC2 Instance Not Receiving Traffic

**Error**: `503 Service Unavailable` or `502 Bad Gateway`

**Solutions**:
```bash
# Check ALB target health
aws elbv2 describe-target-health \
  --target-group-arn arn:aws:elasticloadbalancing:...

# SSH into instance and check PM2
ssh -i carwheels-key.pem ec2-user@INSTANCE_IP
pm2 status
pm2 logs carwheels-api

# Check Nginx
sudo systemctl status nginx
sudo nginx -t
sudo tail -f /var/log/nginx/error.log

# Fix: Restart PM2
pm2 restart carwheels-api
pm2 logs

# Fix: Restart Nginx
sudo systemctl restart nginx
```

---

### 4. Certificate/SSL Issues

**Error**: `NET::ERR_CERT_AUTHORITY_INVALID` or `SSL_ERROR_BAD_CERT_DOMAIN`

**Solutions**:
```bash
# Check ACM certificate status
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:... \
  --query "Certificate.{Status:Status,ValidationMethod:ValidationMethod}"

# View DNS validation records
aws acm describe-certificate \
  --certificate-arn arn:aws:acm:... \
  --query "Certificate.DomainValidationOptions"

# Add DNS records manually if needed
aws route53 change-resource-record-sets \
  --hosted-zone-id Z... \
  --change-batch file://validation-records.json

# Check certificate is attached to ALB listener
aws elbv2 describe-listeners \
  --load-balancer-arn arn:aws:elasticloadbalancing:...
```

---

### 5. High CPU/Memory Usage

**Error**: Instance killing processes or becoming unresponsive

**Solutions**:
```bash
# Check metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time 2024-01-01T00:00:00Z \
  --end-time 2024-01-01T01:00:00Z \
  --period 300 \
  --statistics Average

# SSH and monitor
ssh -i carwheels-key.pem ec2-user@INSTANCE_IP
pm2 monit
top
free -h

# Increase instance type
aws ec2 modify-instance-attribute \
  --instance-id i-xxxxx \
  --instance-type t3.medium

# Or scale with ASG
aws autoscaling set-desired-capacity \
  --auto-scaling-group-name carwheels-backend-asg \
  --desired-capacity 4

# Check for memory leaks
pm2 logs carwheels-api | grep -i error
```

---

### 6. Database Performance Issues

**Error**: Slow queries, timeouts, or high connection count

**Solutions**:
```bash
# Check DB performance insights
aws pi describe-dimension-keys \
  --service-type RDS \
  --identifier-arn arn:aws:rds:... \
  --start-time 2024-01-01T00:00:00Z \
  --period-in-seconds 60 \
  --metric db.load.avg

# Check connections
psql -h DB_HOST -U postgres -d carwheels \
  -c "SELECT datname, count(*) FROM pg_stat_activity GROUP BY datname;"

# Kill idle connections
psql -h DB_HOST -U postgres -d carwheels << EOF
SELECT pg_terminate_backend(pg_stat_activity.pid)
FROM pg_stat_activity
WHERE pg_stat_activity.datname = 'carwheels'
  AND pid <> pg_backend_pid()
  AND pg_stat_activity.state = 'idle';
EOF

# Optimize database
psql -h DB_HOST -U postgres -d carwheels << EOF
-- Analyze all tables
ANALYZE;

-- Reindex if needed
REINDEX DATABASE carwheels;

-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;
EOF

# Increase RDS instance size
aws rds modify-db-instance \
  --db-instance-identifier carwheels-db \
  --db-instance-class db.t3.small \
  --apply-immediately
```

---

### 7. Cost Overages

**Error**: Unexpected charges or high monthly bill

**Solutions**:
```bash
# Get cost breakdown
aws ce get-cost-and-usage \
  --time-period Start=2024-01-01,End=2024-01-31 \
  --granularity DAILY \
  --metrics UnblendedCost \
  --group-by Type=DIMENSION,Key=SERVICE \
  --output text

# Find unused resources
# EC2 instances
aws ec2 describe-instances \
  --filters "Name=instance-state-name,Values=stopped" \
  --query "Reservations[].Instances[].{ID:InstanceId,LaunchTime:LaunchTime}"

# Unattached EBS volumes
aws ec2 describe-volumes \
  --filters "Name=status,Values=available" \
  --query "Volumes[].{ID:VolumeId,Size:Size}"

# NAT Gateways (expensive!)
aws ec2 describe-nat-gateways \
  --query "NatGateways[].{ID:NatGatewayId,State:State}"

# Terminate unused resources
aws ec2 delete-volume --volume-id vol-xxxxx
aws ec2 release-address --allocation-id eipalloc-xxxxx

# Use Reserved Instances (40% savings)
aws ec2 describe-reserved-instances-offerings \
  --filters Name=instance-type,Values=t3.small \
  --query "ReservedInstancesOfferings[0]"
```

---

### 8. Terraform State Issues

**Error**: `Acquiring the new state lock failed` or state corruption

**Solutions**:
```bash
# Backup state
aws s3 cp s3://carwheels-terraform-state/prod/terraform.tfstate ./terraform.tfstate.backup

# Unlock stuck lock
aws dynamodb delete-item \
  --table-name terraform-locks \
  --key '{"LockID":{"S":"carwheels-terraform-state/prod/terraform.tfstate"}}'

# Refresh state
cd infrastructure
terraform refresh

# Validate state
terraform validate

# Plan without applying
terraform plan
```

---

### 9. DNS Not Resolving

**Error**: `nslookup carwheels.com` returns wrong IP or fails

**Solutions**:
```bash
# Check Route53 records
aws route53 list-resource-record-sets \
  --hosted-zone-id ZONE_ID \
  --query "ResourceRecordSets[?Name=='carwheels.com.']"

# Flush DNS cache
# On Mac
sudo dscacheutil -flushcache

# On Linux
sudo systemctl restart systemd-resolved

# Wait for propagation
watch -n 5 "dig carwheels.com +short"

# Check DNS propagation globally
nslookup carwheels.com 1.1.1.1
nslookup carwheels.com 8.8.8.8
```

---

### 10. Application Won't Start

**Error**: Container fails to start, PM2 shows "errored" status

**Solutions**:
```bash
# SSH into instance
ssh -i carwheels-key.pem ec2-user@INSTANCE_IP

# Check PM2 logs
pm2 logs carwheels-api --err
pm2 logs carwheels-api --out

# Check environment variables
echo $DATABASE_URL
echo $REDIS_URL

# Verify .env file
cat /home/ec2-user/carwheels/backend/.env

# Test database connection
psql $DATABASE_URL -c "SELECT 1;"

# Restart application
pm2 restart carwheels-api --update-env

# Check application logs
cd /home/ec2-user/carwheels/backend
npm run dev

# Check for disk space
df -h
du -sh /home/ec2-user/carwheels

# Check file permissions
ls -la /home/ec2-user/carwheels/backend/dist/
```

---

## Quick Debugging Commands

```bash
# Get all logs from CloudWatch
aws logs tail /carwheels/api --follow

# Get recent errors
aws logs filter-log-events \
  --log-group-name /carwheels/api \
  --filter-pattern "ERROR"

# Monitor EC2 metrics in real-time
watch -n 5 'aws cloudwatch get-metric-statistics \
  --namespace AWS/EC2 \
  --metric-name CPUUtilization \
  --dimensions Name=InstanceId,Value=i-xxxxx \
  --start-time $(date -u -d "10 min ago" +"%Y-%m-%dT%H:%M:%S") \
  --end-time $(date -u +"%Y-%m-%dT%H:%M:%S") \
  --period 60 \
  --statistics Average | grep Average'

# Kill and restart everything
cd infrastructure
terraform destroy -auto-approve
terraform apply -auto-approve

# Roll back to previous Terraform state
cd infrastructure
terraform state pull > terraform.state.backup
terraform state rm aws_instance.example
terraform apply
```

---

## Prevention Tips

1. **Enable CloudWatch Monitoring**
   ```bash
   # Create alarms proactively
   aws cloudwatch put-metric-alarm \
     --alarm-name carwheels-cpu-high \
     --alarm-description "Alert when CPU > 80%" \
     --metric-name CPUUtilization \
     --namespace AWS/EC2 \
     --statistic Average \
     --period 300 \
     --threshold 80 \
     --comparison-operator GreaterThanThreshold
   ```

2. **Regular Backups**
   ```bash
   # Automated RDS backups (Terraform handles this)
   # Manual snapshot
   aws rds create-db-snapshot \
     --db-instance-identifier carwheels-db \
     --db-snapshot-identifier carwheels-manual-$(date +%Y%m%d-%H%M%S)
   ```

3. **Security Groups Audit**
   ```bash
   # Review all security groups
   aws ec2 describe-security-groups \
     --filters "Name=group-name,Values=carwheels*" \
     --query "SecurityGroups[].{Name:GroupName,Rules:IpPermissions}"
   ```

4. **Cost Optimization**
   - Use Reserved Instances for stable workloads (40% savings)
   - Use Spot Instances for non-critical workloads (70% savings)
   - Enable S3 Intelligent-Tiering for backups
   - Set up budget alerts

5. **Documentation**
   - Keep deployment notes updated
   - Document any manual changes
   - Maintain recovery procedures

---

## Getting Help

- AWS Support: https://console.aws.amazon.com/support/
- AWS Forums: https://forums.aws.amazon.com/
- Stack Overflow: Tag questions with [amazon-web-services]
- GitHub Issues: Report issues in your repository

Last Updated: February 2026
