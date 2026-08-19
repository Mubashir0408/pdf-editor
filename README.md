# PDF Editor

A full-stack PDF processing web application built with **Next.js, TypeScript, Supabase, and Vercel**. It provides tools for converting, merging, splitting, compressing, editing, and managing PDF files through a simple web interface.

##Features

*  PDF Merge
*  PDF Split
*  PDF Compression
*  PDF Conversion
*  Image/Document conversion
*  Password protection
*  Watermark PDFs
*  Rotate PDF pages
*  Extract pages
*  Delete pages
*  OCR support
*  PDF translation
*  AI-powered PDF features
*  Supabase Storage
*  Supabase authentication
*  Welcome emails with Resend
*  Error monitoring with Sentry
*  Swagger API documentation
*  Responsive interface
*  Modern UI

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


### Build for production

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

