# 🐳 Docker Commands Cheat Sheet

## Quick Commands for Colleagues

### 🚀 Getting Started
```bash
# Clone and setup
git clone <repository-url>
cd placement-portal-nextjs-js
cp env.example .env.local

# Start everything
docker-compose up --build
```

### 🔧 Development Commands
```bash
# Start in background
docker-compose up -d

# Stop everything
docker-compose down

# Restart specific service
docker-compose restart app

# View logs
docker-compose logs -f app
```

### 🗄️ Database Commands
```bash
# Create admin user
docker-compose exec app npm run create-admin

# Seed with sample data
docker-compose exec app npm run seed

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

### 🐛 Troubleshooting
```bash
# Reset everything (⚠️ deletes all data)
docker-compose down -v

# Rebuild from scratch
docker-compose up --build --force-recreate

# Check what's running
docker-compose ps

# Check logs
docker-compose logs
```

### 🌐 Access Points
- **App**: http://localhost:3000
- **Database UI**: http://localhost:8081 (admin/admin123)
- **Database**: localhost:27017

### 📁 Important Files
- `docker-compose.yml` - Main configuration
- `.env.local` - Your environment settings
- `DOCKER_SETUP.md` - Detailed setup guide
