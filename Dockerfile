FROM node:20-slim

# Install Ghostscript and Hindi language data for OCR and PDF rendering
RUN apt-get update && apt-get install -y \
    ghostscript \
    graphicsmagick \
    imagemagick \
    tesseract-ocr \
    tesseract-ocr-hin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy server package files and install dependencies
COPY server/package*.json ./
RUN npm install --omit=dev

# Copy server source code
COPY server/ ./

# Ensure uploads and output directories exist
RUN mkdir -p uploads output

EXPOSE 5000

ENV PORT=5000
CMD ["npm", "start"]
