# Echo

Echo is a modern, Twitter-like social media app built with TypeScript, Node.js, Express, and EJS. Host your data on Supabase, assets on AWS S3, and deploy the app seamlessly on Railway.

---

## 📋 Table of Contents

1. [✨ Features](#-features)  
2. [🛠️ Tech Stack](#️-tech-stack)  
3. [🖼️ Screenshots & Demo](#️-screenshots--demo)  
4. [🚀 Getting Started](#-getting-started)  
   - [Prerequisites](#prerequisites)  
   - [Environment Variables](#environment-variables)  
   - [Docker Setup](#docker-setup)  
5. [⚙️ Usage](#️-usage)  
6. [📖 API Documentation](#-api-documentation)  
7. [🌐 Architecture & Hosting](#-architecture--hosting)  
8. [📄 License](#-license)  
9. [✉️ Contact](#️-contact)  

---

## ✨ Features

- 🔄 **Real-Time Messaging** & live feed updates  
- 👥 **Follow / Unfollow** users  
- 📰 **Personalized Feed**  
- 🔔 **Notifications** for mentions, likes, reposts  
- 👤 **User Profiles** with bio, posts, followers  
- 🔍 **Search** posts and users  

---

## 🛠️ Tech Stack

- **Backend:** TypeScript • Node.js • Express  
- **Templating:** EJS  
- **Database:** PostgreSQL (Supabase) • Prisma ORM  
- **Storage:** AWS S3 Buckets  
- **HTTP Client:** Axios  
- **Containerization:** Docker  
- **Hosting:** Railway (app), Supabase (DB), AWS S3 (assets)  

---

## 🖼️ Screenshots & Demo

## 🚀 Getting Started
### Prerequisites
- Docker & Docker Compose
- A Supabase project (with your Prisma schema pushed)
- AWS S3 bucket credentials
- Railway account

### Environment Variables
Create a .env file in your project root and set the following:
```
DATABASE_URL=…
PORT=…
JWT_SECRET=…
JWT_EXPIRES_IN=…
JWT_COOKIE_EXPIRES_IN=…
NODE_ENV=production
CLIENT_URL=…
COOKIE_SECRET=…
AWS_ACCESS_KEY_ID=…
AWS_SECRET_ACCESS_KEY=…
AWS_REGION=…
S3_BUCKET_NAME=…
```

### Docker Setup
1. Build & start containers:
```
docker-compose up --build -d
```
2. Run migrations:
```
docker-compose exec app npx prisma migrate deploy
```
3. Access:
  - App at http://localhost:`<PORT>`

  - Supabase DB via Supabase Dashboard

## ⚙️ Usage

- Build the code & copy assets: npm run build
- Start the server: npm start
Your server will run on the port you configured (default 3000).

## 📖 API Documentation

Every endpoint, request schema, and response example is documented here:
https://documenter.getpostman.com/view/35992979/2sB2jAd9BZ

## 🌐 Architecture & Hosting

- **Railway** — Deploys and hosts the Node.js/Express application
- **Supabase** — Managed PostgreSQL database for production data
- **AWS S3** — Stores user‑uploaded files & media assets

## 📄 License

This project is licensed under the **MIT License**.

## ✉️ Contact

Marko Kornajčík
✉️ marko.kornajcik6@gmail.com
