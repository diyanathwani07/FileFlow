FROM node:20-slim

# Install Ghostscript and Hindi language data for OCR and PDF rendering
RUN apt-get update && apt-get install -y \
    ghostscript \
    tesseract-ocr \
    tesseract-ocr-hin \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY . .

RUN mkdir -p uploads output

EXPOSE 5000

ENV PORT=5000
CMD ["npm", "start"]
