#!/bin/bash

NODE_VERSION=22

echo "Installing Node.js ${NODE_VERSION} on Raspberry Pi..."

# Remove old system Node if present
sudo apt remove -y nodejs npm 2>/dev/null

# Install build dependencies
sudo apt update && sudo apt install -y curl wget build-essential

# Install nvm
export NVM_DIR="$HOME/.nvm"
if [ ! -d "$NVM_DIR" ]; then
    echo "Installing nvm..."
    curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
fi

# Load nvm
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"

# Install and use Node
nvm install $NODE_VERSION
nvm alias default $NODE_VERSION
nvm use $NODE_VERSION

# Make node available system-wide for services
sudo ln -sf "$(which node)" /usr/local/bin/node
sudo ln -sf "$(which npm)" /usr/local/bin/npm
sudo ln -sf "$(which npx)" /usr/local/bin/npx

echo ""
echo "Installed versions:"
node -v
npm -v
echo ""
echo "Add this to your ~/.bashrc if not already present:"
echo '  export NVM_DIR="$HOME/.nvm"'
echo '  [ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"'
