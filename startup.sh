#!/bin/bash

SERVICE_NAME="mediaserver"
PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="${PROJECT_DIR}/mediaserver.log"
REPO_URL="https://github.com/dork7/mediaServer_project.git"

fresh_install() {
    echo "Cleaning old files and installing from fresh code..."

    # Save cron config if it exists
    local cron_backup=""
    if [[ -f "${PROJECT_DIR}/cron-jobs.json" ]]; then
        cron_backup=$(cat "${PROJECT_DIR}/cron-jobs.json")
    fi

    # Remove everything except .git and this script
    find "${PROJECT_DIR}" -mindepth 1 \
        ! -path "${PROJECT_DIR}/.git" \
        ! -path "${PROJECT_DIR}/.git/*" \
        ! -path "${PROJECT_DIR}/startup.sh" \
        ! -path "${PROJECT_DIR}/mediaserver.log" \
        -delete 2>/dev/null

    # Pull fresh code
    cd "${PROJECT_DIR}"
    git fetch origin
    git reset --hard origin/main
    git clean -fd

    # Install dependencies
    npm install --production

    # Restore cron config
    if [[ -n "$cron_backup" ]]; then
        echo "$cron_backup" > "${PROJECT_DIR}/cron-jobs.json"
        echo "Restored cron-jobs.json"
    fi

    echo "Fresh install complete."
}

if [[ "$(uname)" == "Darwin" ]]; then
    # ─── macOS (Launch Agent) ───
    PLIST_NAME="com.hamza.mediaserver"
    PLIST_PATH="$HOME/Library/LaunchAgents/${PLIST_NAME}.plist"
    ELECTRON_PATH="${PROJECT_DIR}/node_modules/.bin/electron"

    install() {
        fresh_install
        cat > "$PLIST_PATH" <<EOF
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>Label</key>
    <string>${PLIST_NAME}</string>
    <key>ProgramArguments</key>
    <array>
        <string>${ELECTRON_PATH}</string>
        <string>${PROJECT_DIR}</string>
    </array>
    <key>WorkingDirectory</key>
    <string>${PROJECT_DIR}</string>
    <key>RunAtLoad</key>
    <true/>
    <key>KeepAlive</key>
    <false/>
    <key>StandardOutPath</key>
    <string>${LOG_FILE}</string>
    <key>StandardErrorPath</key>
    <string>${LOG_FILE}</string>
    <key>EnvironmentVariables</key>
    <dict>
        <key>PATH</key>
        <string>/usr/local/bin:/usr/bin:/bin</string>
    </dict>
</dict>
</plist>
EOF
        launchctl load "$PLIST_PATH"
        echo "Media server installed (macOS Launch Agent)."
        echo "Logs: ${LOG_FILE}"
    }

    uninstall() {
        launchctl unload "$PLIST_PATH" 2>/dev/null
        rm -f "$PLIST_PATH"
        echo "Media server removed from startup."
    }

    status() {
        if launchctl list | grep -q "$PLIST_NAME"; then
            echo "Media server is registered and running."
        else
            echo "Media server is NOT registered."
        fi
    }

else
    # ─── Linux / Raspberry Pi (systemd) ───
    SERVICE_FILE="/etc/systemd/system/${SERVICE_NAME}.service"
    NODE_PATH="$(which node)"

    install() {
        fresh_install
        sudo bash -c "cat > ${SERVICE_FILE}" <<EOF
[Unit]
Description=Media Server
After=network.target

[Service]
Type=simple
User=$(whoami)
WorkingDirectory=${PROJECT_DIR}
ExecStart=${NODE_PATH} ${PROJECT_DIR}/to_run_in_browser/index.js
Restart=on-failure
RestartSec=5
Environment=PORT=2266
Environment=DISPLAY=:0
StandardOutput=append:${LOG_FILE}
StandardError=append:${LOG_FILE}

[Install]
WantedBy=multi-user.target
EOF
        sudo systemctl daemon-reload
        sudo systemctl enable "${SERVICE_NAME}"
        sudo systemctl start "${SERVICE_NAME}"
        echo "Media server installed (systemd service)."
        echo "Logs: ${LOG_FILE}"
        echo "Commands: sudo systemctl {start|stop|restart|status} ${SERVICE_NAME}"
    }

    uninstall() {
        sudo systemctl stop "${SERVICE_NAME}" 2>/dev/null
        sudo systemctl disable "${SERVICE_NAME}" 2>/dev/null
        sudo rm -f "${SERVICE_FILE}"
        sudo systemctl daemon-reload
        echo "Media server removed from startup."
    }

    status() {
        sudo systemctl status "${SERVICE_NAME}"
    }
fi

case "$1" in
    install)   install ;;
    uninstall) uninstall ;;
    fresh)     fresh_install ;;
    status)    status ;;
    *)
        echo "Usage: ./startup.sh {install|uninstall|fresh|status}"
        exit 1
        ;;
esac
