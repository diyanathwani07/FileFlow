# Deployment Guide

Your project is built with a separate React frontend (client) and Node.js backend (server). This is an excellent architecture that gives you a lot of flexibility for deployment. 

The most common and cost-effective way to deploy this structure is:
* **Frontend:** Vercel or Netlify (Free)
* **Backend:** Render or Railway (Free/Cheap)

Before deploying, make sure you push your code to GitHub. 

## Step 1: Push to GitHub

1. Create a new repository on [GitHub](https://github.com/new).
2. Run these commands in your root `Convertor` folder:

```bash
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
git push -u origin main
```

*(Note: I have already run `git init` and `git commit` for you locally).*

---

## Step 2: Deploy the Backend (Render)

Because the backend handles file uploads, PDF processing, and requires Node.js, we need a standard hosting provider like [Render](https://render.com).

1. Sign up/log in to Render and click **New > Web Service**.
2. Connect your GitHub account and select your repository.
3. Configure the service:
   * **Root Directory:** `server`
   * **Environment:** `Node`
   * **Build Command:** `npm install`
   * **Start Command:** `npm start`
4. **Environment Variables:**
   * Wait for it to build, and you'll get a URL like `https://convertor-backend-xxxx.onrender.com`.

**Note on Ghostscript:** Render's base Docker image might not have Ghostscript installed by default. If you need scanned PDF (OCR) support on Render, you may need to deploy using a `Dockerfile` that installs `ghostscript` via `apt-get install -y ghostscript` or choose a provider where you can easily install OS-level packages.

---

## Step 3: Deploy the Frontend (Vercel)

Vercel is the easiest place to host Vite/React applications.

1. **Important Before Deploying:** Open `client/src/App.jsx` and change the backend URL in the `axios.post` call from `http://localhost:5000` to your new Render backend URL (e.g., `https://convertor-backend-xxxx.onrender.com/api/convert`). Same for the download URL link!
2. Commit and push that change to GitHub.
3. Go to [Vercel](https://vercel.com/) and click **Add New > Project**.
4. Import your GitHub repository.
5. In the configuration:
   * **Root Directory:** `client`
   * **Framework Preset:** Vite
   * **Build Command:** `npm run build`
   * **Output Directory:** `dist`
6. Click **Deploy**.

You will instantly get a live URL for your React app!

---

## Summary of Environment Settings

Whenever moving to production:
- Use environment variables (like `process.env.VITE_API_URL` in React) instead of hardcoding `localhost`.
- Ensure CORS on the backend allows requests from your Vercel URL. Currently, `cors()` is configured to allow all origins in `server.js`, which is fine for getting started.
