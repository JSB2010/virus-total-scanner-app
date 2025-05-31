#!/bin/bash
# DropSentinel RPM Post-installation Script
# Enhanced version with comprehensive system integration for RPM-based distributions

set -e

PRODUCT_NAME="DropSentinel"
EXECUTABLE_NAME="dropsentinel"
INSTALL_DIR="/opt/DropSentinel"
DESKTOP_FILE="/usr/share/applications/dropsentinel.desktop"
MIME_FILE="/usr/share/mime/packages/dropsentinel.xml"
ICON_DIR="/usr/share/icons/hicolor"
LOG_FILE="/tmp/dropsentinel-postinstall.log"
SERVICE_FILE="/etc/systemd/user/dropsentinel-monitor.service"

log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [RPM-POSTINSTALL] $1" | tee -a "$LOG_FILE"
}

log_success() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [RPM-POSTINSTALL] ✅ $1" | tee -a "$LOG_FILE"
}

log_warning() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [RPM-POSTINSTALL] ⚠️  $1" | tee -a "$LOG_FILE"
}

log_error() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') [RPM-POSTINSTALL] ❌ $1" | tee -a "$LOG_FILE"
}

log "Starting DropSentinel comprehensive RPM post-installation..."

# Set proper permissions for the application
if [ -d "$INSTALL_DIR" ]; then
    log "Setting application permissions..."
    chmod -R 755 "$INSTALL_DIR/"

    # Make the main executable file executable
    if [ -f "$INSTALL_DIR/$EXECUTABLE_NAME" ]; then
        chmod +x "$INSTALL_DIR/$EXECUTABLE_NAME"
        log_success "Made $EXECUTABLE_NAME executable"
    fi

    # Set SUID bit for file monitoring capabilities (if needed)
    if [ -f "$INSTALL_DIR/resources/file-monitor" ]; then
        chmod u+s "$INSTALL_DIR/resources/file-monitor" 2>/dev/null || log_warning "Could not set SUID bit for file monitor"
    fi

    # Set SELinux context for RPM-based systems
    if command -v semanage >/dev/null 2>&1 && command -v restorecon >/dev/null 2>&1; then
        log "Setting SELinux context..."
        semanage fcontext -a -t bin_t "$INSTALL_DIR/$EXECUTABLE_NAME" 2>/dev/null || log_warning "Could not set SELinux context"
        restorecon -R "$INSTALL_DIR" 2>/dev/null || log_warning "Could not restore SELinux context"
    fi
else
    log_error "Installation directory $INSTALL_DIR not found"
fi

# Create symlink in /usr/local/bin if it doesn't exist
if [ -f "$INSTALL_DIR/$EXECUTABLE_NAME" ] && [ ! -L "/usr/local/bin/$EXECUTABLE_NAME" ]; then
    log "Creating command-line symlink..."
    ln -sf "$INSTALL_DIR/$EXECUTABLE_NAME" "/usr/local/bin/$EXECUTABLE_NAME" 2>/dev/null || log_warning "Could not create symlink"
    log_success "Created command-line symlink"
fi

# Install custom MIME types for file associations
log "Installing MIME types..."
cat > "$MIME_FILE" << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<mime-info xmlns="http://www.freedesktop.org/standards/shared-mime-info">
  <mime-type type="application/x-dropsentinel-scan">
    <comment>DropSentinel Scan Request</comment>
    <comment xml:lang="en">DropSentinel Scan Request</comment>
    <icon name="dropsentinel"/>
    <glob pattern="*.scan"/>
  </mime-type>
</mime-info>
EOF

# Update system databases
log "Updating system databases..."

# Update desktop database
if command -v update-desktop-database >/dev/null 2>&1; then
    log "Updating desktop database..."
    update-desktop-database /usr/share/applications/ 2>/dev/null && log_success "Desktop database updated" || log_warning "Desktop database update failed"
fi

# Update MIME database
if command -v update-mime-database >/dev/null 2>&1; then
    log "Updating MIME database..."
    update-mime-database /usr/share/mime/ 2>/dev/null && log_success "MIME database updated" || log_warning "MIME database update failed"
fi

# Update icon cache
if command -v gtk-update-icon-cache >/dev/null 2>&1; then
    log "Updating icon cache..."
    gtk-update-icon-cache -f -t "$ICON_DIR/" 2>/dev/null && log_success "Icon cache updated" || log_warning "Icon cache update failed"
fi

# Update font cache (if needed)
if command -v fc-cache >/dev/null 2>&1; then
    log "Updating font cache..."
    fc-cache -f 2>/dev/null && log_success "Font cache updated" || log_warning "Font cache update failed"
fi

# Install systemd user service for background monitoring
if command -v systemctl >/dev/null 2>&1; then
    log "Installing systemd user service..."
    mkdir -p "$(dirname "$SERVICE_FILE")"
    cat > "$SERVICE_FILE" << EOF
[Unit]
Description=DropSentinel Background Monitor
After=graphical-session.target

[Service]
Type=simple
ExecStart=$INSTALL_DIR/$EXECUTABLE_NAME --background-monitor
Restart=on-failure
RestartSec=5
Environment=DISPLAY=:0

[Install]
WantedBy=default.target
EOF

    # Enable the service for all users (they can disable it if they want)
    systemctl --global enable dropsentinel-monitor.service 2>/dev/null && log_success "Systemd service installed" || log_warning "Could not enable systemd service"
fi

# Add to system PATH if not already there
if ! echo "$PATH" | grep -q "/usr/local/bin"; then
    log "Adding /usr/local/bin to system PATH..."
    echo 'export PATH="/usr/local/bin:$PATH"' >> /etc/profile.d/dropsentinel.sh 2>/dev/null && log_success "Added to system PATH" || log_warning "Could not add to system PATH"
fi

# Create application data directories
log "Creating application data directories..."
mkdir -p /var/lib/dropsentinel/{quarantine,logs,cache} 2>/dev/null && log_success "Created data directories" || log_warning "Could not create data directories"
chmod 755 /var/lib/dropsentinel 2>/dev/null || true
chmod 700 /var/lib/dropsentinel/quarantine 2>/dev/null || true

# Install udev rules for USB device monitoring (if applicable)
if [ -d "/etc/udev/rules.d" ]; then
    log "Installing udev rules for USB monitoring..."
    cat > /etc/udev/rules.d/99-dropsentinel.rules << 'EOF'
# DropSentinel USB device monitoring
ACTION=="add", SUBSYSTEM=="block", ENV{ID_BUS}=="usb", RUN+="/usr/local/bin/dropsentinel --scan-usb %E{DEVNAME}"
EOF

    # Reload udev rules
    if command -v udevadm >/dev/null 2>&1; then
        udevadm control --reload-rules 2>/dev/null && log_success "Udev rules installed" || log_warning "Could not reload udev rules"
    fi
fi

# Configure logrotate for application logs
if [ -d "/etc/logrotate.d" ]; then
    log "Configuring log rotation..."
    cat > /etc/logrotate.d/dropsentinel << 'EOF'
/var/lib/dropsentinel/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 root root
    postrotate
        /usr/bin/killall -USR1 dropsentinel 2>/dev/null || true
    endscript
}
EOF
    log_success "Log rotation configured"
fi

# RPM-specific: Update package database
if command -v rpm >/dev/null 2>&1; then
    log "Updating RPM database..."
    rpm --rebuilddb 2>/dev/null && log_success "RPM database updated" || log_warning "RPM database update failed"
fi

# Display installation success message
log_success "DropSentinel RPM installation completed successfully!"

# Show user notification if possible
if command -v notify-send >/dev/null 2>&1; then
    notify-send "DropSentinel" "Installation completed successfully! You can now launch DropSentinel from your applications menu or run 'dropsentinel' from the command line." 2>/dev/null || true
fi

# Display helpful information
echo ""
echo "🎉 DropSentinel has been successfully installed!"
echo ""
echo "📍 Installation location: $INSTALL_DIR"
echo "🔗 Command-line access: dropsentinel"
echo "🖥️  Desktop launcher: Available in Applications → Security"
echo "🔧 Background service: Enabled (can be disabled with 'systemctl --user disable dropsentinel-monitor')"
echo ""
echo "To get started:"
echo "  • Launch from Applications menu"
echo "  • Run 'dropsentinel' in terminal"
echo "  • Right-click files to scan with DropSentinel"
echo ""

log "RPM post-installation script completed successfully"
exit 0
