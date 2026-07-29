# Installation Guide

Follow these steps to set up PlaySphere on a local development machine.

## Step 1: Clone the Repository
```bash
git clone https://github.com/your-org/playsphere.git
cd playsphere
```

## Step 2: Install Dependencies
PlaySphere uses `npm` for package management.
```bash
npm install
```

## Step 3: Configure Environment Variables
Copy the example environment file and populate it with your Firebase and Razorpay credentials.
```bash
cp .env.example .env.local
```
*(Refer to `Environment Setup.md` for exact variable requirements).*

## Step 4: Run the Development Server
```bash
npm run dev
```
The application will be available at `http://localhost:3000`.

## Step 5: Build for Production
To simulate a production build locally:
```bash
npm run build
npm run start
```