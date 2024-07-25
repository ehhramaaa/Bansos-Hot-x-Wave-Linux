#!/bin/sh

while true; do
    node index.js &
    NODE_PID=$!

    wait $NODE_PID

    RANDOM_INTERVAL=$((RANDOM % 1200 + 2400))
    
    echo "Script Completed. Rest $RANDOM_INTERVAL Before Restart..."

    sleep $RANDOM_INTERVAL
done