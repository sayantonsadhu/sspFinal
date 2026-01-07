# 🚀 Deployment Guide - Sayanton Sadhu Photography Website

## 📚 Table of Contents
1. [Technology Stack](#technology-stack)
2. [Local Development](#local-development)
3. [Environment Variables](#environment-variables)
4. [Deployment Options](#deployment-options)
5. [Troubleshooting](#troubleshooting)

---

## 🛠️ Technology Stack

**Language:** JavaScript (React) + Python (FastAPI)
**Frontend:** React 19, Tailwind CSS, Shadcn/UI
**Backend:** FastAPI (Python), MongoDB, JWT Auth
**Server:** Uvicorn (ASGI), Nginx (optional)

---

## 💻 Local Development

### Prerequisites
- Node.js 18+ & Yarn
- Python 3.11+
- MongoDB

### Quick Start
```bash
# Start Backend
cd /app/backend
uvicorn server:app --reload --port 8001

# Start Frontend  
cd /app/frontend
yarn start

# Access
Frontend: http://localhost:3000
Backend: http://localhost:8001
Admin: http://localhost:3000/admin/login
```

---

## 🔐 Environment Variables

### Frontend `.env`
```env
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Backend `.env`
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=photography_portfolio
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
JWT_SECRET=change-this-secret-key
```

---

## 🌍 Deployment Options

### Option 1: Vercel (Frontend) + Railway (Backend)

#### Deploy Frontend to Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
cd /app/frontend
vercel

# Set environment variable in Vercel dashboard:
# REACT_APP_BACKEND_URL=https://your-backend.railway.app
```

#### Deploy Backend to Railway
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy
cd /app/backend
railway login
railway init
railway up

# Add MongoDB service in Railway dashboard
# Set environment variables:
# MONGO_URL, DB_NAME, ADMIN_USERNAME, ADMIN_PASSWORD, JWT_SECRET
```

---

### Option 2: DigitalOcean/AWS (Full Stack)

#### 1. Setup Ubuntu Server
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install -y python3.11 python3-pip nodejs npm mongodb nginx
sudo npm install -g yarn pm2
```

#### 2. Deploy Backend
```bash
cd /app/backend
pip3 install -r requirements.txt

# Create .env file
echo "MONGO_URL=mongodb://localhost:27017" > .env
echo "DB_NAME=photography_portfolio" >> .env
echo "ADMIN_USERNAME=admin" >> .env
echo "ADMIN_PASSWORD=your_secure_password" >> .env
echo "JWT_SECRET=$(openssl rand -hex 32)" >> .env

# Start with PM2
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001" --name backend
pm2 save
pm2 startup
```

#### 3. Deploy Frontend
```bash
cd /app/frontend
yarn install

# Create .env
echo "REACT_APP_BACKEND_URL=http://your-ip:8001" > .env

# Build and serve
yarn build
pm2 serve build 3000 --name frontend --spa
pm2 save
```

#### 4. Setup Nginx (Production)
```bash
sudo nano /etc/nginx/sites-available/photography
```

Add configuration:
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /app/backend/uploads;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/photography /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### 5. Setup SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
sudo systemctl reload nginx
```

---

### Option 3: Heroku

#### Deploy Backend
```bash
cd /app/backend

# Create Procfile
echo "web: uvicorn server:app --host=0.0.0.0 --port=\$PORT" > Procfile

# Create runtime.txt
echo "python-3.11" > runtime.txt

# Deploy
heroku create your-app-backend
heroku addons:create mongolab
git init
git add .
git commit -m "Initial commit"
git push heroku main

# Set environment variables
heroku config:set ADMIN_USERNAME=admin
heroku config:set ADMIN_PASSWORD=your_password
heroku config:set JWT_SECRET=$(openssl rand -hex 32)
```

#### Deploy Frontend
```bash
cd /app/frontend

# Update REACT_APP_BACKEND_URL in .env
echo "REACT_APP_BACKEND_URL=https://your-app-backend.herokuapp.com" > .env

# Deploy
heroku create your-app-frontend
heroku buildpacks:set heroku/nodejs
git init
git add .
git commit -m "Initial commit"
git push heroku main
```

---

### Option 4: Docker

#### Create Dockerfile for Backend
```dockerfile
# /app/backend/Dockerfile
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
EXPOSE 8001
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8001"]
```

#### Create Dockerfile for Frontend
```dockerfile
# /app/frontend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install
COPY . .
RUN yarn build
RUN npm install -g serve
EXPOSE 3000
CMD ["serve", "-s", "build", "-l", "3000"]
```

#### Docker Compose
```yaml
# docker-compose.yml
version: '3.8'
services:
  mongodb:
    image: mongo:latest
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db

  backend:
    build: ./backend
    ports:
      - "8001:8001"
    environment:
      - MONGO_URL=mongodb://mongodb:27017
      - DB_NAME=photography_portfolio
      - ADMIN_USERNAME=admin
      - ADMIN_PASSWORD=admin123
      - JWT_SECRET=your-secret-key
    depends_on:
      - mongodb

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - REACT_APP_BACKEND_URL=http://localhost:8001
    depends_on:
      - backend

volumes:
  mongo-data:
```

Deploy:
```bash
docker-compose up -d
```

---

## 🐛 Troubleshooting

### Frontend Issues
```bash
# Check logs
tail -f /var/log/supervisor/frontend.*.log

# Clear cache
cd /app/frontend
rm -rf node_modules yarn.lock
yarn install
yarn start
```

### Backend Issues
```bash
# Check logs
tail -f /var/log/supervisor/backend.*.log

# Reinstall dependencies
cd /app/backend
pip install -r requirements.txt --force-reinstall
```

### MongoDB Connection
```bash
# Check MongoDB status
sudo systemctl status mongodb

# Restart MongoDB
sudo systemctl restart mongodb

# Test connection
mongo --eval "db.adminCommand('ping')"
```

### Port Already in Use
```bash
# Find process using port 8001
sudo lsof -i :8001
sudo kill -9 <PID>

# Find process using port 3000
sudo lsof -i :3000
sudo kill -9 <PID>
```

### Permission Issues
```bash
# Fix uploads directory
sudo chown -R $USER:$USER /app/backend/uploads
sudo chmod -R 755 /app/backend/uploads
```

---

## 📊 Performance Optimization

### Frontend
```bash
# Enable production build
yarn build

# Use PM2 with clustering
pm2 start "serve -s build -l 3000" --name frontend -i max
```

### Backend
```bash
# Use multiple workers
pm2 start "uvicorn server:app --host 0.0.0.0 --port 8001 --workers 4" --name backend
```

### Database
```bash
# Create MongoDB indexes
mongo photography_portfolio --eval "
  db.weddings.createIndex({date: -1});
  db.hero_carousel.createIndex({order: 1});
  db.packages.createIndex({order: 1});
"
```

---

## 🔒 Security Checklist

- [ ] Change default admin credentials
- [ ] Use strong JWT secret (32+ characters)
- [ ] Enable HTTPS (SSL certificate)
- [ ] Set up firewall (UFW)
- [ ] Regular backups of MongoDB
- [ ] Update dependencies regularly
- [ ] Use environment variables (never commit secrets)
- [ ] Enable CORS only for your domain
- [ ] Set up rate limiting
- [ ] Monitor server logs

---

## 📞 Quick Commands Reference

```bash
# Restart services
sudo supervisorctl restart all

# View all logs
tail -f /var/log/supervisor/*.log

# Check service status
sudo supervisorctl status

# MongoDB backup
mongodump --db photography_portfolio --out /backup/

# MongoDB restore
mongorestore --db photography_portfolio /backup/photography_portfolio/
```

---

**Need help? Check the logs first!** 🔍
