curl --location 'http://localhost:2266/cron/batch' \
--header 'Content-Type: application/json' \
--header 'Cookie: logUuid=anpysut127; logUuid=anpysut127' \
--data '{
    "urls": [
        {
            "url": "http://localhost:2266/volume?level=50&system=true",
            "intervalSeconds": 1600
        },
        {
            "url": "http://localhost:2266/volume?level=80&system=true",
            "intervalSeconds": 900
        },
        {
            "url": "http://localhost:2266/volume?level=70&system=true",
            "intervalSeconds": 1500
        }
    ],
    "intervalSeconds": 10
}'