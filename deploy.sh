#!/bin/bash

# FitLife Gym Buddy Deployment Script
# This script handles deployment for different environments

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default values
ENVIRONMENT=${1:-production}
ACTION=${2:-deploy}
DOCKER_COMPOSE_FILE="docker-compose.yml"

# Print colored output
print_message() {
    echo -e "${2}${1}${NC}"
}

print_header() {
    echo
    print_message "=================================" "$BLUE"
    print_message "$1" "$BLUE"
    print_message "=================================" "$BLUE"
    echo
}

# Check if Docker is installed and running
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_message "❌ Docker is not installed. Please install Docker first." "$RED"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_message "❌ Docker is not running. Please start Docker first." "$RED"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        print_message "❌ Docker Compose is not installed. Please install Docker Compose first." "$RED"
        exit 1
    fi
    
    print_message "✅ Docker and Docker Compose are available" "$GREEN"
}

# Check if .env file exists
check_env_file() {
    if [ ! -f .env ]; then
        print_message "⚠️  No .env file found. Creating from template..." "$YELLOW"
        if [ -f .env.example ]; then
            cp .env.example .env
            print_message "✅ .env file created from template" "$GREEN"
            print_message "⚠️  Please update the .env file with your configuration before continuing." "$YELLOW"
            print_message "Press Enter to continue after updating .env file..."
            read
        else
            print_message "❌ No .env.example file found. Cannot create .env file." "$RED"
            exit 1
        fi
    else
        print_message "✅ .env file found" "$GREEN"
    fi
}

# Build and deploy the application
deploy_app() {
    print_header "Deploying FitLife Gym Buddy - $ENVIRONMENT"
    
    print_message "📋 Pre-deployment checks..." "$BLUE"
    check_docker
    check_env_file
    
    print_message "🔨 Building application images..." "$BLUE"
    docker-compose -f $DOCKER_COMPOSE_FILE build --no-cache
    
    print_message "🚀 Starting services..." "$BLUE"
    docker-compose -f $DOCKER_COMPOSE_FILE up -d
    
    print_message "⏳ Waiting for services to be healthy..." "$BLUE"
    sleep 30
    
    # Check service health
    if docker-compose -f $DOCKER_COMPOSE_FILE ps | grep -q "Up (healthy)"; then
        print_message "✅ Services are healthy and running" "$GREEN"
    else
        print_message "⚠️  Some services might not be healthy. Check logs:" "$YELLOW"
        docker-compose -f $DOCKER_COMPOSE_FILE ps
    fi
    
    print_message "🌐 Application URLs:" "$GREEN"
    print_message "  Frontend: http://localhost:3000" "$GREEN"
    print_message "  Backend API: http://localhost:5000/api" "$GREEN"
    print_message "  Health Check: http://localhost:5000/health" "$GREEN"
}

# Stop the application
stop_app() {
    print_header "Stopping FitLife Gym Buddy"
    
    print_message "🛑 Stopping services..." "$BLUE"
    docker-compose -f $DOCKER_COMPOSE_FILE down
    
    print_message "✅ Services stopped" "$GREEN"
}

# Restart the application
restart_app() {
    print_header "Restarting FitLife Gym Buddy"
    
    stop_app
    sleep 5
    deploy_app
}

# View logs
view_logs() {
    print_header "Viewing Application Logs"
    
    SERVICE=${3:-all}
    
    if [ "$SERVICE" = "all" ]; then
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f
    else
        docker-compose -f $DOCKER_COMPOSE_FILE logs -f $SERVICE
    fi
}

# Clean up (remove containers, volumes, networks)
cleanup() {
    print_header "Cleaning Up FitLife Gym Buddy"
    
    print_message "🧹 Stopping and removing containers..." "$BLUE"
    docker-compose -f $DOCKER_COMPOSE_FILE down -v --remove-orphans
    
    print_message "🗑️  Removing unused Docker objects..." "$BLUE"
    docker system prune -f
    
    print_message "✅ Cleanup complete" "$GREEN"
}

# Backup database
backup_database() {
    print_header "Backing Up Database"
    
    BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
    BACKUP_DIR="./backups"
    BACKUP_FILE="$BACKUP_DIR/fitlife_backup_$BACKUP_DATE.gz"
    
    mkdir -p $BACKUP_DIR
    
    print_message "📦 Creating database backup..." "$BLUE"
    docker-compose -f $DOCKER_COMPOSE_FILE exec -T mongodb mongodump --db fitlife --gzip --archive > $BACKUP_FILE
    
    if [ -f $BACKUP_FILE ]; then
        print_message "✅ Database backup created: $BACKUP_FILE" "$GREEN"
    else
        print_message "❌ Database backup failed" "$RED"
        exit 1
    fi
}

# Update application (pull latest changes and redeploy)
update_app() {
    print_header "Updating FitLife Gym Buddy"
    
    print_message "📥 Pulling latest changes..." "$BLUE"
    git pull origin main
    
    print_message "🔄 Restarting application..." "$BLUE"
    restart_app
}

# Show system status
show_status() {
    print_header "FitLife Gym Buddy Status"
    
    print_message "🐳 Docker containers:" "$BLUE"
    docker-compose -f $DOCKER_COMPOSE_FILE ps
    
    echo
    print_message "💾 Disk usage:" "$BLUE"
    docker system df
    
    echo
    print_message "🌐 Service health checks:" "$BLUE"
    
    # Check backend health
    if curl -f -s http://localhost:5000/health > /dev/null; then
        print_message "  Backend API: ✅ Healthy" "$GREEN"
    else
        print_message "  Backend API: ❌ Unhealthy" "$RED"
    fi
    
    # Check frontend
    if curl -f -s http://localhost:3000 > /dev/null; then
        print_message "  Frontend: ✅ Healthy" "$GREEN"
    else
        print_message "  Frontend: ❌ Unhealthy" "$RED"
    fi
    
    # Check database
    if docker-compose -f $DOCKER_COMPOSE_FILE exec -T mongodb mongosh --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
        print_message "  MongoDB: ✅ Healthy" "$GREEN"
    else
        print_message "  MongoDB: ❌ Unhealthy" "$RED"
    fi
}

# Show usage
show_usage() {
    echo "FitLife Gym Buddy Deployment Script"
    echo
    echo "Usage: $0 [environment] [action]"
    echo
    echo "Environments:"
    echo "  production (default)"
    echo "  development"
    echo
    echo "Actions:"
    echo "  deploy      - Deploy the application (default)"
    echo "  stop        - Stop all services"
    echo "  restart     - Restart all services"
    echo "  logs        - View logs (optionally specify service name)"
    echo "  cleanup     - Stop services and clean up Docker objects"
    echo "  backup      - Create database backup"
    echo "  update      - Update application and redeploy"
    echo "  status      - Show application status"
    echo "  help        - Show this help message"
    echo
    echo "Examples:"
    echo "  $0                          # Deploy in production"
    echo "  $0 production deploy        # Deploy in production"
    echo "  $0 production stop          # Stop production services"
    echo "  $0 production logs backend  # View backend logs"
    echo "  $0 production status        # Show system status"
}

# Main execution
main() {
    case $ACTION in
        deploy)
            deploy_app
            ;;
        stop)
            stop_app
            ;;
        restart)
            restart_app
            ;;
        logs)
            view_logs
            ;;
        cleanup)
            cleanup
            ;;
        backup)
            backup_database
            ;;
        update)
            update_app
            ;;
        status)
            show_status
            ;;
        help)
            show_usage
            ;;
        *)
            print_message "❌ Unknown action: $ACTION" "$RED"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function
main