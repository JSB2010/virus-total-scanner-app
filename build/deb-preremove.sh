#!/bin/bash
# DropSentinel DEB Pre-removal Script
# Handles graceful shutdown and cleanup before package removal

set -e

PRODUCT_NAME="DropSentinel"
EXECUTABLE_NAME="dropsentinel"
INSTALL_DIR="/opt/DropSentinel"
LOG_FILE="/tmp/dropsentinel-preremove.log"
SERVICE_FILE="/etc/systemd/user/dropsentinel-monitor.service"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-PREREMOVE] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-PREREMOVE] ✅ $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-PREREMOVE] ⚠️  $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [DEB-PREREMOVE] ❌ $1" | tee -a "$LOG_FILE"
}

log "Starting DropSentinel pre-removal process..."

# Stop any running instances of DropSentinel
log "Stopping running DropSentinel instances..."
if pgrep -f "$EXECUTABLE_NAME" > /dev/null; then
    log "Found running DropSentinel processes, stopping them..."
    pkill -TERM -f "$EXECUTABLE_NAME" 2>/dev/null || true
    
    # Wait a moment for graceful shutdown
    sleep 3
    
    # Force kill if still running
    if pgrep -f "$EXECUTABLE_NAME" > /dev/null; then
        log_warning "Forcing termination of remaining processes..."
        pkill -KILL -f "$EXECUTABLE_NAME" 2>/dev/null || true
    fi
    
    log_success "Stopped DropSentinel processes"
else
    log "No running DropSentinel processes found"
fi

# Stop and disable systemd service
if command -v systemctl >/dev/null 2>&1 && [ -f "$SERVICE_FILE" ]; then
    log "Stopping and disabling systemd service..."
    
    # Stop the service for all users
    systemctl --global stop dropsentinel-monitor.service 2>/dev/null || true
    systemctl --global disable dropsentinel-monitor.service 2>/dev/null || true
    
    log_success "Systemd service stopped and disabled"
fi

# Backup user data before removal (optional)
if [ -d "/var/lib/dropsentinel" ]; then
    log "Creating backup of user data..."
    BACKUP_DIR="/tmp/dropsentinel-backup-$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    
    # Backup configuration and logs (but not quarantine for security)
    cp -r /var/lib/dropsentinel/logs "$BACKUP_DIR/" 2>/dev/null || true
    cp -r /var/lib/dropsentinel/cache "$BACKUP_DIR/" 2>/dev/null || true
    
    if [ -d "$BACKUP_DIR/logs" ] || [ -d "$BACKUP_DIR/cache" ]; then
        log_success "User data backed up to $BACKUP_DIR"
        echo "📁 User data has been backed up to: $BACKUP_DIR"
    fi
fi

# Notify users about the removal
if command -v notify-send >/dev/null 2>&1; then
    notify-send "DropSentinel" "DropSentinel is being removed from your system. Background monitoring has been stopped." 2>/dev/null || true
fi

log_success "Pre-removal process completed"
exit 0
