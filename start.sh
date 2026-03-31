#!/bin/sh

# Function to run geoipupdate periodically
update_geoip() {
  while true; do
    geoipupdate -f /etc/GeoIP.conf
    sleep 604800  # Sleep for one week (7 days * 24 hours * 60 minutes * 60 seconds)
  done
}

# Start the geoipupdate in the background
update_geoip &

# Start the Go application
/app/cutr