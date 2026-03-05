curl --location 'http://localhost:2266/cron/batch' \
--header 'Content-Type: application/json' \
--header 'Cookie: logUuid=anpysut127' \
--data '{
    "urls": [
        {
            "url": "http://localhost:2266/?url=KILL_app",
            "intervalSeconds": 100
        },
           {
            "url": "https://www.youtube.com/watch?v=oGl00PA_NgQ,
            "intervalSeconds": 20
        },
        {
            "url": "https://www.youtube.com/watch?v=gaA2Eyhxjg8",
            "intervalSeconds": 450
        },
        {
            "url": "https://www.youtube.com/watch?v=gaA2Eyhxjg8",
            "intervalSeconds": 1500
        },
        {
            "url": "https://www.youtube.com/shorts/knMUPLK4dQk",
            "intervalSeconds": 800
        },
        {
            "url": "https://www.youtube.com/shorts/knMUPLK4dQk",
            "intervalSeconds": 6600,
            "runOnce": false
        },
        {
            "url": "https://www.youtube.com/shorts/knMUPLK4dQk",
            "intervalSeconds": 6000
        },
        {
            "url": "https://www.youtube.com/shorts/knMUPLK4dQk",
            "intervalSeconds": 2536
        },
        {
            "url": "https://www.youtube.com/shorts/iO4TaNc47w4",
            "intervalSeconds": 8096
        },
        {
            "url": "https://www.youtube.com/shorts/ghopXR2bgYc",
            "intervalSeconds": 550
        },
        {
            "url": "https://www.youtube.com/shorts/ghopXR2bgYc",
            "intervalSeconds": 180,
            "runOnce": false
        },
        {
            "url": "https://www.youtube.com/shorts/ghopXR2bgYc",
            "intervalSeconds": 6800
        },
        {
            "url": "https://www.youtube.com/shorts/ghopXR2bgYc",
            "intervalSeconds": 400
        },
        {
            "url": "http://localhost:2266/volume?level=80&system=true",
            "intervalSeconds": 300
        },
        {
            "url": "http://localhost:2266/volume?level=70&system=true",
            "intervalSeconds": 900
        },
        {
            "url": "http://localhost:2266/volume?level=70&system=true",
            "intervalSeconds": 400
        },
        {
            "url": "http://localhost:2266/volume?level=50&system=true",
            "intervalSeconds": 800
        },
        {
            "url": "http://localhost:2266/volume?level=80&system=true",
            "intervalSeconds": 1450
        },
        {
            "url": "http://localhost:2266/volume?level=75&system=true",
            "intervalSeconds": 1600
        },
        {
            "url": "http://localhost:2266/volume?level=85&system=true",
            "intervalSeconds": 10002
        },
        {
            "url": "https://www.youtube.com/shorts/AaBxnc84UCU",
            "intervalSeconds": 11000
        },
        {
            "url": "http://localhost:2266/volume?level=60&system=true",
            "intervalSeconds": 11005
        },
        {
            "url": "https://www.youtube.com/shorts/6ZN69be827c",
            "intervalSeconds": 32400
        },
        {
            "url": "https://www.youtube.com/shorts/kCU3YzgpC5Q",
            "intervalSeconds": 43200
        },
        {
            "url": "https://www.youtube.com/shorts/ZhhtrqArhQA",
            "intervalSeconds": 18000
        }
    ],
    "intervalSeconds": 10
}'