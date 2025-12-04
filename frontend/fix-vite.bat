@echo off
REM Fix Vite dependency optimization issues

echo Cleaning Vite cache...
if exist node_modules\.vite rmdir /s /q node_modules\.vite
if exist .vite rmdir /s /q .vite

echo Clearing package lock...
if exist package-lock.json del package-lock.json

echo Reinstalling dependencies...
call npm install

echo Starting dev server...
call npm run dev
