# FileFlow — Hindi PDF to Word Converter

> Convert Hindi PDFs into editable Microsoft Word (.docx) documents with accurate Unicode Devanagari text, legacy font auto-conversion, and OCR support.

[![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css)](https://tailwindcss.com/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=node.js)](https://nodejs.org/)
[![Docker](https://img.shields.io/badge/Deploy-Docker-2496ED?logo=docker)](https://www.docker.com/)

---

## 🌐 Live Demo

* **Web Application (Vercel):** [https://file-flow-teal.vercel.app/](https://file-flow-teal.vercel.app/)
* **Backend API (Render):** [https://fileflow-bp10.onrender.com/](https://fileflow-bp10.onrender.com/)

---

## ✨ Features

- **Selectable & Unicode Hindi Extraction:** Extracts native Devanagari Unicode text accurately using modern PDF parsing engines.
- **Kruti Dev Auto-Detection & Conversion:** Automatically identifies legacy non-Unicode fonts (such as Kruti Dev / Devlys) that typically render as English gibberish, transliterating them into standard Unicode Hindi.
- **Scanned PDF & Image OCR:** Converts image-based or scanned PDFs into high-resolution images via `pdftoppm` and applies bilingual (`hin+eng`) Tesseract OCR.
- **Real Editable Word Documents (.docx):** Produces authentic Microsoft Word files formatted with standard Devanagari fonts (Mangal) — never screenshots or embedded images.
- **Layout & Structure Preservation:** Maintains line breaks, paragraphs, numbers, names, addresses, and spacing.
- **Live In-Browser Preview:** View the converted Hindi text directly on screen to inspect accuracy before downloading.
- **Clean, Modern UI:** Responsive drag-and-drop interface built with React, Vite, and Tailwind CSS.

---

## 📂 Project Structure

```text
FileFlow/
├── client/                     # Frontend application (React + Vite + Tailwind CSS)
│   ├── src/
│   │   ├── App.jsx             # Main application component & dropzone UI
│   │   ├── main.jsx            # Application entry point
│   │   └── index.css           # Tailwind styling
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                     # Backend API (Node.js + Express)
│   ├── src/
│   │   ├── controllers/
│   │   │   └── convertController.js  # Conversion orchestration & Kruti Dev detection
│   │   ├── routes/
│   │   │   └── convertRoutes.js      # API routes (/api/convert, /api/download)
│   │   ├── services/
│   │   │   ├── ocrService.js         # Poppler (pdftoppm) & Tesseract OCR pipeline
│   │   │   └── wordService.js        # DOCX file generation with Mangal Devanagari font
│   │   └── server.js                 # Express server configuration & health checks
│   ├── uploads/                      # Temporary storage for uploaded PDFs
│   ├── output/                       # Output directory for generated DOCX files
│   └── package.json
│
├── Dockerfile                  # Production container definition (Ghostscript, Poppler, Tesseract)
├── DEPLOYMENT.md               # Step-by-step cloud deployment guide (Vercel + Render)
├── .gitignore                  # Git ignore rules for node_modules, temp files, and envs
└── README.md                   # Project overview and documentation
```

---

## 🚀 Getting Started Locally

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [Git](https://git-scm.com/)
- *(Optional for local OCR)* [Poppler](https://github.com/oschwartz10612/poppler-windows/releases) and [Tesseract OCR](https://github.com/UB-Mannheim/tesseract/wiki) with Hindi language pack (`hin.traineddata`).

### 1. Clone the repository
```bash
git clone https://github.com/diyanathwani07/FileFlow.git
cd FileFlow
```

### 2. Set up Backend
```bash
cd server
npm install
npm run dev
```
The backend server will run on `http://localhost:5000`.

### 3. Set up Frontend
In a new terminal window:
```bash
cd client
npm install
npm run dev
```
The frontend will open on `http://localhost:5173`.

---

## ☁️ Deployment

For detailed instructions on deploying the frontend to **Vercel** and containerized backend to **Render**, see [DEPLOYMENT.md](DEPLOYMENT.md).

---

## 🛠️ Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, Lucide React, Axios, React Dropzone
- **Backend:** Node.js, Express, Multer, docx, unpdf, `@anthro-ai/krutidev-unicode`
- **OCR Engine:** Poppler (`pdftoppm`), Tesseract OCR (`hin`, `eng`)
- **Infrastructure:** Docker, Render, Vercel

---

## 📄 License

This project is licensed under the MIT License.
