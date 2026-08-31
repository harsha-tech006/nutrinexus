const express = require('express');
const router = express.Router();
const multer = require('multer');
const auth = require('../middleware/auth');
const imageRecognitionService = require('../services/imageRecognitionService');

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only images are allowed'), false);
    }
  }
});

// Analyze food image
router.post('/analyze-food', auth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image uploaded' });
    }
    
    const analysis = await imageRecognitionService.analyzeFoodImage(req.file.buffer);
    
    res.json(analysis);
  } catch (error) {
    console.error('Image Recognition Route Error:', error);
    res.status(500).json({ message: 'Error processing image' });
  }
});

// Analyze multiple images
router.post('/analyze-multiple', auth, upload.array('images', 5), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No images uploaded' });
    }
    
    const results = [];
    for (const file of req.files) {
      const analysis = await imageRecognitionService.analyzeFoodImage(file.buffer);
      results.push(analysis);
    }
    
    res.json({ success: true, results });
  } catch (error) {
    console.error('Multiple Image Recognition Error:', error);
    res.status(500).json({ message: 'Error processing images' });
  }
});

// Get nutrition info by food name
router.get('/nutrition/:foodName', auth, async (req, res) => {
  try {
    const nutritionInfo = await imageRecognitionService.getNutritionInfo(req.params.foodName);
    res.json(nutritionInfo);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching nutrition info' });
  }
});

module.exports = router;