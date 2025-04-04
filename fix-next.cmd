@echo off
echo Cleaning Next.js build directory...
rmdir /s /q .next

echo Reinstalling dependencies...
call npm install

echo Building Next.js application...
call npx next build

echo Starting development server...
call npx next dev

pause 