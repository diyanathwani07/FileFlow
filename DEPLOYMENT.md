# Hindi PDF to Word Converter — Deployment & Setup Guide

This guide explains how to connect this repository to GitHub and deploy both the Frontend and Backend to free/low-cost cloud hosts.

---

## 1. Push to GitHub

Because Git credentials require your personal GitHub login or token, follow these quick steps:

1. Go to [github.com/new](https://github.com/new) and create a new repository (e.g., `hindi-pdf-to-word-converter`). Leave **README**, **.gitignore**, and **license** unchecked.
2. In your terminal at `c:\Users\HP\OneDrive\Desktop\Convertor`, run:

```bash
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

*(If you already have your GitHub repo URL, tell me the URL and I will configure `git remote` for you!)*

---

## 2. Deploy Backend (Render / Railway)

Because the backend processes PDFs and OCR using Ghostscript, a Docker-based deployment ensures Ghostscript and Hindi OCR libraries are available.

### Option A: Render (Recommended)
1. Go to [dashboard.render.com](https://dashboard.render.com/) and click **New > Web Service**.
2. Connect your GitHub repository.
3. Configure the service:
   - **Name:** `hindi-converter-backend`
   - **Root Directory:** (leave blank or set to `server`)
   - **Runtime / Environment:** **Docker** (it will auto-detect `server/Dockerfile`)
   - **Docker Context:** `server`
   - **Dockerfile Path:** `server/Dockerfile`
   - **Instance Type:** Free
4. Click **Deploy Web Service**.
5. Once deployed, copy your backend URL (e.g. `https://hindi-converter-backend.onrender.com`).

---

## 3. Deploy Frontend (Vercel)

Vercel hosts Vite + React frontends with zero configuration.

1. Go to [vercel.com](https://vercel.com/) and click **Add New > Project**.
2. Select your GitHub repository.
3. In the project setup:
   - **Framework Preset:** Vite
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Expand **Environment Variables** and add:
   - **Key:** `VITE_API_URL`
   - **Value:** `https://your-backend-app.onrender.com` *(your Render backend URL from Step 2, without a trailing slash)*
5. Click **Deploy**.

---

## 4. Test Everything
- Open your live Vercel URL.
- Upload any Hindi PDF (standard or Kruti Dev / scanned).
- View the live preview directly on the web page and download the editable `.docx` file!
