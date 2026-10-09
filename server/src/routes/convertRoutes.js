const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { convertPdf } = require('../controllers/convertController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads/'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + '.pdf');
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: fileFilter
});

router.post('/convert', upload.single('pdf'), convertPdf);

router.get('/download/:filename', (req, res) => {
  const file = path.join(__dirname, '../../output/', req.params.filename);
  res.download(file, err => {
    if (err) {
      console.error(err);
      res.status(404).send('File not found');
    }
  });
});

module.exports = router;
