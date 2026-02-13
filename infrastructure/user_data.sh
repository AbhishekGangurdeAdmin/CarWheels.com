#!/bin/bash
# EC2 User Data Script - runs on instance startup

set -e

# Log output
exec > >(tee /var/log/user-data.log)
exec 2>&1

echo "Starting CarWheels backend setup..."

# Update system
yum update -y
yum install -y git curl wget htop nginx

# Install Node.js 18
curl https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 18
npm install -g pm2

# Install PostgreSQL client
yum install -y postgresql15-contrib

# Install CloudWatch agent
wget https://s3.amazonaws.com/amazoncloudwatch-agent/amazon_linux/amd64/latest/amazon-cloudwatch-agent.rpm
rpm -U ./amazon-cloudwatch-agent.rpm

# Clone repository
cd /home/ec2-user
git clone https://github.com/YOUR_USERNAME/carwheels.git
cd carwheels/backend

# Install dependencies
npm install
npm run build

# Create .env file
cat > .env << 'EOF'
NODE_ENV=production
PORT=5000
DATABASE_URL=postgresql://${db_username}:${db_password}@${rds_endpoint}:5432/carwheels
REDIS_URL=redis://:${redis_auth_token}@${redis_endpoint}:6379/0
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRE=7d
AWS_REGION=us-east-1
CORS_ORIGIN=https://carwheels.com
LOG_LEVEL=info
EOF

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
      min_uptime: "10s",
      listen_timeout: 10000,
      kill_timeout: 5000
    }
  ]
};
EOF

# Create logs directory
mkdir -p logs

# Start application with PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup -u ec2-user --hp /home/ec2-user

# Configure Nginx as reverse proxy
systemctl stop nginx
cat > /etc/nginx/conf.d/carwheels.conf << 'EOF'
upstream carwheels_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

server {
    listen 80;
    server_name _;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name _;
    
    ssl_certificate /etc/ssl/certs/carwheels.crt;
    ssl_certificate_key /etc/ssl/private/carwheels.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
    gzip_vary on;
    
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;
    
    limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
    limit_req zone=api burst=20 nodelay;
    
    location /health {
        proxy_pass http://carwheels_backend;
        access_log off;
    }
    
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
}
EOF

# Remove default Nginx config
rm -f /etc/nginx/conf.d/default.conf

# Enable and start Nginx
systemctl enable nginx
systemctl start nginx

# Setup CloudWatch logs agent
cat > /opt/aws/amazon-cloudwatch-agent/etc/config.json << 'EOF'
{
  "agent": {
    "metrics_collection_interval": 60,
    "region": "us-east-1",
    "logfile": "/opt/aws/amazon-cloudwatch-agent/logs/amazon-cloudwatch-agent.log"
  },
  "logs": {
    "logs_collected": {
      "files": {
        "collect_list": [
          {
            "file_path": "/var/log/nginx/error.log",
            "log_group_name": "/carwheels/nginx-error",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/var/log/nginx/access.log",
            "log_group_name": "/carwheels/nginx-access",
            "log_stream_name": "{instance_id}"
          },
          {
            "file_path": "/home/ec2-user/carwheels/backend/logs/combined.log",
            "log_group_name": "/carwheels/api",
            "log_stream_name": "{instance_id}"
          }
        ]
      }
    }
  },
  "metrics": {
    "namespace": "CarWheels",
    "metrics_collected": {
      "cpu": {
        "measurement": [
          {
            "name": "cpu_usage_idle",
            "rename": "CPU_IDLE",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "totalcpu": true
      },
      "mem": {
        "measurement": [
          {
            "name": "mem_used_percent",
            "rename": "MEM_USED",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60
      },
      "disk": {
        "measurement": [
          {
            "name": "used_percent",
            "rename": "DISK_USED",
            "unit": "Percent"
          }
        ],
        "metrics_collection_interval": 60,
        "resources": [
          "*"
        ]
      }
    }
  }
}
EOF

# Start CloudWatch agent
/opt/aws/amazon-cloudwatch-agent/bin/amazon-cloudwatch-agent-ctl \
  -a fetch-config \
  -m ec2 \
  -s \
  -c file:/opt/aws/amazon-cloudwatch-agent/etc/config.json

echo "CarWheels backend setup completed!"
