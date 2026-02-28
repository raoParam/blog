@echo off
echo Setting up Flagger Frontend...

:: Create client folder
mkdir client
cd client

:: Initialize Vite + React
npm create vite@latest . -- --template react

:: Install core dependencies
npm install axios react-router-dom react-hook-form @hookform/resolvers zod
npm install framer-motion lucide-react react-markdown remark-gfm date-fns react-dropzone

:: Install Tailwind
npm install -D tailwindcss postcss autoprefixer
npm install daisyui

:: Initialize Tailwind
npx tailwindcss init -p

:: Create folder structure
cd src
mkdir assets components pages services context hooks utils routes
cd components
mkdir layout feed blog profile write auth common admin landing
cd ..
cd pages
mkdir auth feed post user admin public
cd ..
cd ..

:: Create .env file
echo VITE_API_URL=http://localhost:5000/api > .env

echo Setup complete! Run: cd client && npm run dev
pause