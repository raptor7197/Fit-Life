# FitLife Gym Buddy - Deployment Guide

This guide provides comprehensive instructions for deploying the FitLife Gym Buddy application in different environments.

## 🚀 Quick Start

### Prerequisites

- **Docker** (v20.10+)
- **Docker Compose** (v2.0+)
- **Git**
- **Node.js** (v18+) - for development
- **MongoDB** (v7.0+) - if not using Docker
- **Redis** (v7.0+) - for production caching

### Environment Setup

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd fitlife-app
   ```

2. **Create environment configuration**:
   ```bash
   cp .env.example .env
   ```

3. **Update `.env` file** with your configuration:
   ```bash
   nano .env  # or your preferred editor
   ```

4. **Deploy the application**:
   ```bash
   ./deploy.sh production deploy
   ```

## 📋 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Application environment | `production` |
| `PORT` | Backend server port | `5000` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/fitlife` |
| `JWT_SECRET` | JWT signing secret | `your-super-secret-key` |
| `JWT_REFRESH_SECRET` | JWT refresh token secret | `your-refresh-secret-key` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini AI API key | *(disabled)* |
| `EMAIL_HOST` | SMTP server host | `smtp.gmail.com` |
| `EMAIL_PORT` | SMTP server port | `587` |
| `EMAIL_USER` | SMTP username | *(none)* |
| `EMAIL_PASS` | SMTP password/app password | *(none)* |
| `REDIS_URL` | Redis connection string | `redis://localhost:6379` |
| `RATE_LIMIT_WINDOW_MS` | Rate limiting window | `900000` (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | `100` |

## 🏗️ Deployment Methods

### Method 1: Docker Compose (Recommended)

This method uses Docker Compose to orchestrate all services including MongoDB, Redis, backend API, frontend, and Nginx.

```bash
# Deploy all services
./deploy.sh production deploy

# View status
./deploy.sh production status

# View logs
./deploy.sh production logs

# Stop all services
./deploy.sh production stop
```

**Services included:**
- **MongoDB** (port 27017)
- **Redis** (port 6379)
- **Backend API** (port 5000)
- **Frontend** (port 3000)
- **Nginx** (ports 80, 443)

### Method 2: Manual Deployment

#### Backend Only

```bash
cd server
npm install --production
npm start
```

#### Frontend Only

```bash
npm install
npm run build
# Serve build folder with web server
```

### Method 3: Development Mode

```bash
# Backend development
cd server
npm run dev

# Frontend development (separate terminal)
npm start
```

## 🐳 Docker Configuration

### Dockerfile Features

- **Multi-stage build** for optimized production images
- **Non-root user** for enhanced security
- **Health checks** for service monitoring
- **Minimal Alpine Linux** base image

### Docker Compose Services

```yaml
services:
  mongodb:    # Database
  redis:      # Caching & rate limiting
  backend:    # Node.js API server
  frontend:   # React application
  nginx:      # Reverse proxy & load balancer
```

### Volume Mounts

```yaml
volumes:
  mongodb_data:    # Persistent database storage
  redis_data:      # Redis persistence
  nginx_logs:      # Web server logs
```

## 🌐 Production Configuration

### SSL/HTTPS Setup

1. **Obtain SSL certificates**:
   ```bash
   # Using Let's Encrypt (recommended)
   sudo certbot --nginx -d yourdomain.com
   
   # Or place your certificates in:
   # nginx/ssl/certificate.crt
   # nginx/ssl/private.key
   ```

2. **Update Nginx configuration**:
   ```bash
   # Edit nginx/nginx.conf
   # Update server_name and SSL certificate paths
   ```

### Environment-Specific Configuration

#### Production
- Enable SSL/HTTPS
- Use production database
- Enable Redis caching
- Set strong secrets
- Enable email notifications
- Configure monitoring

#### Staging
- Similar to production but separate database
- Optional SSL
- Test configurations

#### Development
- Disable SSL
- Use development database
- Optional caching
- Debug logging enabled

## 📊 Monitoring & Health Checks

### Health Check Endpoints

| Service | Endpoint | Description |
|---------|----------|-------------|
| Backend | `GET /health` | API server status |
| Frontend | `GET /` | React app availability |
| Database | Internal Docker health check | MongoDB connectivity |
| Redis | Internal Docker health check | Redis connectivity |

### Monitoring Commands

```bash
# Check all services status
./deploy.sh production status

# View real-time logs
./deploy.sh production logs

# Check specific service
docker-compose logs backend

# Monitor resource usage
docker stats
```

### Log Files

- **Application logs**: `server/logs/`
- **Nginx logs**: Stored in Docker volume `nginx_logs`
- **MongoDB logs**: Docker container logs
- **Redis logs**: Docker container logs

## 🛠️ Maintenance

### Database Backup

```bash
# Create backup
./deploy.sh production backup

# Backup files stored in: ./backups/
```

### Updates

```bash
# Update application
./deploy.sh production update

# Manual update process:
git pull origin main
./deploy.sh production restart
```

### Cleanup

```bash
# Remove stopped containers and unused images
./deploy.sh production cleanup

# Complete cleanup (removes volumes too)
docker-compose down -v --remove-orphans
docker system prune -a
```

## 🔧 Troubleshooting

### Common Issues

#### 1. Services Won't Start

```bash
# Check service logs
docker-compose logs [service-name]

# Check Docker resources
docker system df
docker system prune
```

#### 2. Database Connection Failed

```bash
# Check MongoDB logs
docker-compose logs mongodb

# Test connection
docker-compose exec mongodb mongosh --eval "db.adminCommand('ping')"
```

#### 3. High Memory Usage

```bash
# Check resource usage
docker stats

# Restart services
./deploy.sh production restart
```

#### 4. SSL Certificate Issues

```bash
# Check certificate validity
openssl x509 -in nginx/ssl/certificate.crt -text -noout

# Renew Let's Encrypt certificate
sudo certbot renew
```

### Debug Mode

Enable debug logging:

```bash
# Set in .env file
DEBUG=true
VERBOSE_LOGGING=true
LOG_LEVEL=debug

# Restart services
./deploy.sh production restart
```

## 📈 Performance Optimization

### Database Optimization

- **Indexes**: Automatically created by `mongo-init.js`
- **Connection pooling**: Configured in application
- **Query optimization**: Implemented in models

### Caching Strategy

- **Redis caching**: For API responses and sessions
- **Browser caching**: Configured in Nginx for static assets
- **Application caching**: In-memory caching for frequent queries

### Load Balancing

- **Nginx**: Reverse proxy with upstream configuration
- **Health checks**: Automatic failover for unhealthy services
- **Rate limiting**: Per-IP and per-user limits

## 🔒 Security

### Security Features Implemented

- **HTTPS**: SSL/TLS encryption
- **JWT Authentication**: Secure token-based auth
- **Password hashing**: bcrypt with salt
- **Input validation**: Joi schema validation
- **SQL injection prevention**: MongoDB parameterized queries
- **XSS protection**: Input sanitization
- **CORS**: Configurable cross-origin policies
- **Rate limiting**: Multiple levels of protection
- **Security headers**: Comprehensive header configuration

### Security Checklist

- [ ] Update default passwords
- [ ] Configure strong JWT secrets
- [ ] Enable SSL/HTTPS
- [ ] Set up firewall rules
- [ ] Configure rate limiting
- [ ] Enable audit logging
- [ ] Regular security updates
- [ ] Monitor for vulnerabilities

## 📞 Support

### Deployment Script Commands

```bash
# Show all available commands
./deploy.sh help

# Available actions:
./deploy.sh [environment] [action]

# Actions:
# - deploy: Deploy the application
# - stop: Stop all services
# - restart: Restart all services
# - logs: View logs
# - cleanup: Clean up Docker resources
# - backup: Create database backup
# - update: Update and redeploy
# - status: Show system status
```

### Getting Help

1. **Check logs**: `./deploy.sh production logs`
2. **Verify configuration**: Review `.env` file
3. **Test connectivity**: `./deploy.sh production status`
4. **Resource monitoring**: `docker stats`

### Performance Metrics

The application includes built-in monitoring for:
- Response times
- Error rates
- Database query performance
- Memory and CPU usage
- Active user sessions
- API endpoint usage

---

## 📝 Additional Notes

- Always test deployments in staging environment first
- Keep regular backups of your database
- Monitor logs for any security issues
- Update dependencies regularly
- Use environment-specific configuration files
- Implement proper CI/CD pipelines for automated deployments

For development setup, see the main `README.md` file.