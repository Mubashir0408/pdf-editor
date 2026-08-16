# PDF Editor

A full-stack PDF processing web application built with **Next.js, TypeScript, Supabase, and Vercel**. It provides tools for converting, merging, splitting, compressing, editing, and managing PDF files through a simple web interface.

## Features

* 📄 PDF Merge
* ✂️ PDF Split
* 🗜️ PDF Compression
* 🔄 PDF Conversion
* 🖼️ Image/Document conversion
* 🔒 Password protection
* 💧 Watermark PDFs
* 🔃 Rotate PDF pages
* 📑 Extract pages
* 🗑️ Delete pages
* 🔍 OCR support
* 🌐 PDF translation
* 🤖 AI-powered PDF features
* ☁️ Supabase Storage
* 🔐 Supabase authentication
* 📧 Welcome emails with Resend
* 🐛 Error monitoring with Sentry
* 📚 Swagger API documentation
* 📱 Responsive interface
* 🌙 Modern UI

## Tech Stack

### Frontend

* Next.js
* React
* TypeScript
* Tailwind CSS
* shadcn/ui
* Framer Motion
* React Hook Form
* Zod

### Backend & Services

* Next.js API Routes
* Supabase
* Supabase Storage
* Supabase Authentication
* Resend
* Sentry
* OpenRouter
* Swagger / OpenAPI

### Deployment

* Vercel
* Supabase

## Authentication

Users can create an account and log in using Supabase Authentication.

Guest users can also use a limited number of free operations without creating an account.

## File Processing

Generated files are stored in Supabase Storage and are served through secure download endpoints.

The application supports document conversion using a server-side Chromium environment on Vercel.

## API Documentation

Swagger documentation is available at:

`/api-docs`

Example:

`https://your-domain.vercel.app/api-docs`

## Error Monitoring

Sentry is integrated for application error monitoring and debugging.

## Email Integration

Resend is integrated to send a welcome email after successful account creation.

## Environment Variables

Create a `.env.local` file and configure the required environment variables:

```env
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=

RESEND_API_KEY=
RESEND_FROM_EMAIL=

OPENROUTER_API_KEY=
OPENROUTER_MODEL=

NEXT_PUBLIC_SENTRY_DSN=
```

**Never commit secret keys to GitHub.**

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/Mubashir0408/pdf-editor.git
cd pdf-editor
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create `.env.local` and add the required values.

### 4. Run the development server

```bash
npm run dev
```

Open:

`http://localhost:3000`

### 5. Build for production

```bash
npm run build
```

## Deployment

The application is deployed using **Vercel**.

Push changes to the `main` branch to trigger a new deployment.

## Project Purpose

This project was developed to build practical experience with:

* Full-stack web development
* Next.js and TypeScript
* REST APIs
* Authentication
* File processing
* Cloud storage
* AI API integration
* Email services
* Error monitoring
* API documentation
* Serverless deployment

## Author

**Mubashir Ijaz**

GitHub: https://github.com/Mubashir0408
