#!/bin/bash

# Run clean with npm
echo "Removing node_modules and running node install..."
npm ci --legacy-peer-deps --ignore-scripts
