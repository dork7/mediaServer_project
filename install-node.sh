#!/bin/bash

echo "Installing Node.js 20 on Raspberry Pi..."

curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

echo ""
echo "Installed versions:"
node -v
npm -v
