#!/bin/bash

# Get total RAM in KB
total_ram_kb=$(grep MemTotal /proc/meminfo | awk '{print $2}')

# Calculate 70% of the RAM in pages
ppages=$(echo "0.7 * $total_ram_kb / 4" | bc)

# Add to sysctl.conf for persistence
echo "vm.max_map_count=$ppages" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

# Optional for testing
# Set the value for vm.max_map_count
# sudo sysctl -w vm.max_map_count=$ppages
