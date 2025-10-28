# 🚀 Placement Portal - Docker Setup Guide

## 📋 Prerequisites

Before you begin, make sure you have the following installed on your system:

- **Docker Desktop** (Windows/Mac) or **Docker Engine** (Linux)
- **Docker Compose** (usually included with Docker Desktop)
- **Git** (to clone the repository)

### Installing Docker

#### Windows/Mac:
1. Download Docker Desktop from [https://www.docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop)
2. Install and start Docker Desktop
3. Verify installation: `docker --version`

#### Linux (Ubuntu/Debian):
```bash
# Update package index
sudo apt update

# Install Docker
sudo apt install docker.io docker-compose

# Start Docker service
sudo systemctl start docker
sudo systemctl enable docker

# Add your user to docker group (optional)
sudo usermod -aG docker $USER
```

## 🏃‍♂️ Quick Start

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd placement-portal-nextjs-js
```

### 2. Environment Setup
```bash
# Copy the environment template
cp env.example .env.local

# Edit the environment file with your settings
nano .env.local  # or use your preferred editor
```

### 3. Start the Application
```bash
# Build and start all services
docker-compose up --build

# Or run in detached mode (background)
docker-compose up -d --build
```

### 4. Access the Application
- **Main Application**: http://localhost:3000
- **MongoDB Express** (Database UI): http://localhost:8081
  - Username: `admin`
  - Password: `admin123`

## 🔧 Detailed Setup Instructions

### Environment Configuration

Edit `.env.local` file with your specific settings:

```bash
# Database Configuration
MONGODB_URI=mongodb://admin:password123@localhost:27017/placement_portal?authSource=admin

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-change-this-in-production

# Admin Configuration
ADMIN_EMAIL=admin@college.edu
ADMIN_PASSWORD=admin123
```

### Docker Services

The setup includes three main services:

1. **MongoDB Database** (`mongodb`)
   - Port: 27017
   - Username: `admin`
   - Password: `password123`
   - Database: `placement_portal`

2. **MongoDB Express** (`mongo-express`)
   - Port: 8081
   - Web UI for database management
   - Username: `admin`, Password: `admin123`

3. **Next.js Application** (`app`)
   - Port: 3000
   - Main application server

## 🛠️ Development Commands

### Basic Commands
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop all services
docker-compose down

# Stop and remove volumes (⚠️ This will delete all data)
docker-compose down -v

# View logs
docker-compose logs

# View logs for specific service
docker-compose logs app
docker-compose logs mongodb
```

### Development Commands
```bash
# Rebuild and restart
docker-compose up --build

# Restart specific service
docker-compose restart app

# Execute commands in running container
docker-compose exec app npm run seed
docker-compose exec app npm run create-admin

# Access MongoDB shell
docker-compose exec mongodb mongosh -u admin -p password123 --authenticationDatabase admin
```

### Database Management
```bash
# Create admin user
docker-compose exec app npm run create-admin

# Seed database with sample data
docker-compose exec app npm run seed

# List existing admins
docker-compose exec app npm run list-admins
```

## 📁 File Structure

```
placement-portal-nextjs-js/
├── Dockerfile                 # Docker image configuration
├── docker-compose.yml        # Multi-container setup
├── .dockerignore             # Files to exclude from Docker build
├── env.example               # Environment variables template
├── docker.env               # Docker-specific environment
├── scripts/
│   └── mongo-init.js        # MongoDB initialization script
└── public/uploads/          # File uploads (mounted as volume)
```

## 🔒 Security Considerations

### Production Deployment

1. **Change Default Passwords**:
   ```bash
   # Update in docker-compose.yml
   MONGO_INITDB_ROOT_PASSWORD=your-secure-password
   ME_CONFIG_BASICAUTH_PASSWORD=your-secure-password
   ```

2. **Update Environment Variables**:
   ```bash
   NEXTAUTH_SECRET=your-production-secret-key
   JWT_SECRET=your-production-jwt-secret
   ```

3. **Use HTTPS**:
   ```bash
   NEXTAUTH_URL=https://your-domain.com
   ```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Check what's using the port
netstat -tulpn | grep :3000

# Kill the process or change port in docker-compose.yml
```

#### 2. Permission Issues (Linux)
```bash
# Fix file permissions
sudo chown -R $USER:$USER public/uploads/
sudo chmod -R 755 public/uploads/
```

#### 3. MongoDB Connection Issues
```bash
# Check MongoDB logs
docker-compose logs mongodb

# Restart MongoDB service
docker-compose restart mongodb
```

#### 4. Application Won't Start
```bash
# Check application logs
docker-compose logs app

# Rebuild the application
docker-compose up --build --force-recreate app
```

### Reset Everything
```bash
# Stop all services and remove volumes
docker-compose down -v

# Remove all images
docker-compose down --rmi all

# Start fresh
docker-compose up --build
```

## 📊 Monitoring

### Health Checks
The application includes health checks:
```bash
# Check application health
curl http://localhost:3000/api/health

# Check container status
docker-compose ps
```

### Logs
```bash
# Follow logs in real-time
docker-compose logs -f

# View specific service logs
docker-compose logs -f app
```

## 🚀 Production Deployment

### Using Docker Swarm
```bash
# Initialize swarm
docker swarm init

# Deploy stack
docker stack deploy -c docker-compose.yml placement-portal
```

### Using Kubernetes
```bash
# Convert docker-compose to Kubernetes manifests
kompose convert -f docker-compose.yml
```

## 📞 Support

If you encounter any issues:

1. Check the logs: `docker-compose logs`
2. Verify environment variables
3. Ensure all ports are available
4. Check Docker daemon is running

## 🎯 Next Steps

After successful setup:

1. **Create Admin Account**: Use the admin creation script
2. **Seed Sample Data**: Run the seed script for testing
3. **Configure Email**: Set up SMTP for notifications
4. **Customize Branding**: Update logos and colors
5. **Set Up SSL**: Configure HTTPS for production

---

**Happy Coding! 🎉**

For more detailed information, check the main README.md file.
