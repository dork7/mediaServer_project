#!/bin/bash

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
APP_NAME="mediaserver"

echo "=== PM2 Setup for Media Server ==="

# Install pm2 globally
if ! command -v pm2 &>/dev/null; then
    echo "Installing pm2..."
    sudo npm install -g pm2
else
    echo "pm2 already installed: $(pm2 -v)"
fi

# Stop existing instance if running
pm2 delete "$APP_NAME" 2>/dev/null

# Start the app using yarn dev
echo "Starting $APP_NAME with yarn dev..."
pm2 start "yarn dev" \
    --name "$APP_NAME" \
    --cwd "$PROJECT_DIR" \
    --max-restarts=10 \
    --restart-delay=3000

# Save the process list so pm2 remembers it
pm2 save

# Set pm2 to start on boot
echo "Configuring pm2 to start on boot..."
sudo env PATH=$PATH:$(dirname $(which node)) $(which pm2) startup systemd -u $(whoami) --hp $HOME
pm2 save

echo ""
echo "=== Done ==="
echo ""
echo "Commands:"
echo "  pm2 status              — check running apps"
echo "  pm2 logs $APP_NAME      — view logs"
echo "  pm2 restart $APP_NAME   — restart"
echo "  pm2 stop $APP_NAME      — stop"
echo "  pm2 monit               — live dashboard"
