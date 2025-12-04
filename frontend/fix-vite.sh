#!/bin/bash

# Fix Vite dependency optimization issues

echo "Cleaning Vite cache..."
rm -rf node_modules/.vite
rm -rf .vite

echo "Clearing package lock..."
rm -f package-lock.json

echo "Reinstalling dependencies..."
npm install

echo "Starting dev server..."
npm run dev
