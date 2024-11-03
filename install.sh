#!/bin/bash

# Update system packages
sudo apt update && sudo apt upgrade -y

# Install Node.js and npm
curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
sudo apt install -y nodejs

# Install pm2 globally
sudo npm install -g pm2

# Install NGINX
sudo apt install -y nginx

# Configure Firewall
sudo ufw allow 'Nginx Full'
sudo ufw allow OpenSSH
sudo ufw enable

# Install Certbot for SSL
sudo apt install -y certbot python3-certbot-nginx

# Set up directory structure for the React build files
sudo mkdir -p /root/content-aware-note-taker/cant-fe/build /root/content-aware-note-taker/app-fe/build
sudo chown -R $USER:$USER /root/content-aware-note-taker/cant-fe/build /root/content-aware-note-taker/app-fe/build

# Configure NGINX for cant.study React application
sudo tee /etc/nginx/sites-available/cant.study > /dev/null <<EOL
server {
    listen 80;
    server_name cant.study www.cant.study;

    root /root/content-aware-note-taker/cant-fe/build;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Configure NGINX for wehelpyou.study React application
sudo tee /etc/nginx/sites-available/wehelpyou.study > /dev/null <<EOL
server {
    listen 80;
    server_name wehelpyou.study www.wehelpyou.study;

    root /root/content-aware-note-taker/app-fe/build;
    index index.html;

    location / {
        try_files \$uri /index.html;
    }

    location /api/ {
        proxy_pass http://localhost:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Configure NGINX for backend.wehelpyou.study API server
sudo tee /etc/nginx/sites-available/backend.wehelpyou.study > /dev/null <<EOL
server {
    listen 80;
    server_name backend.wehelpyou.study;

    location / {
        proxy_pass http://localhost:3005;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOL

# Enable all server blocks
sudo ln -s /etc/nginx/sites-available/cant.study /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/wehelpyou.study /etc/nginx/sites-enabled/
sudo ln -s /etc/nginx/sites-available/backend.wehelpyou.study /etc/nginx/sites-enabled/

# Test NGINX configuration
sudo nginx -t

# Reload NGINX
sudo systemctl reload nginx

# Obtain SSL certificates for all domains
sudo certbot --nginx -d cant.study -d www.cant.study
sudo certbot --nginx -d wehelpyou.study -d www.wehelpyou.study
sudo certbot --nginx -d backend.wehelpyou.study

# Set up automatic renewal for SSL certificates
sudo systemctl enable certbot.timer

echo "Setup complete! Node.js, NGINX, and SSL certificates for cant.study, wehelpyou.study, and backend.wehelpyou.study are configured."

