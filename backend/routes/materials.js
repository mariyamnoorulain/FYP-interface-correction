const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const Material = require('../models/material');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 100 * 1024 * 1024 // 100MB max file size
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'text/plain',
      'application/zip'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// Initialize GridFS bucket
const getGridFSBucket = () => {
  const conn = mongoose.connection;
  return new GridFSBucket(conn.db, { bucketName: 'materials' });
};

// Helper function to get file type from mime type
function getFileTypeFromMimeType(mimeType) {
  const mimeToType = {
    'application/pdf': 'pdf',
    'application/msword': 'doc',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docx',
    'application/vnd.ms-powerpoint': 'ppt',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'pptx',
    'application/vnd.ms-excel': 'xls',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'xlsx',
    'text/plain': 'txt',
    'application/zip': 'zip'
  };
  return mimeToType[mimeType] || 'other';
}

// Upload material
router.post('/upload', authenticate, upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const { title, description, courseId } = req.body;
    const tutorId = req.user.userId;

    if (!title) {
      return res.status(400).json({ message: 'Title is required' });
    }

    const bucket = getGridFSBucket();
    const fileName = `${tutorId}_${Date.now()}_${req.file.originalname}`;

    // Upload to GridFS
    const uploadStream = bucket.openUploadStream(fileName, {
      contentType: req.file.mimetype,
      metadata: {
        tutorId: tutorId.toString(),
        originalName: req.file.originalname
      }
    });

    const bufferStream = require('stream').PassThrough();
    bufferStream.end(req.file.buffer);
    
    bufferStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      console.error('GridFS upload error:', error);
      res.status(500).json({ message: 'Failed to upload file', error: error.message });
    });

    uploadStream.on('finish', async () => {
      try {
        // Create material document
        const material = new Material({
          title,
          description: description || '',
          tutorId,
          courseId: courseId || 'default-course',
          fileId: uploadStream.id,
          fileName: req.file.originalname,
          fileSize: req.file.size,
          mimeType: req.file.mimetype,
          fileType: getFileTypeFromMimeType(req.file.mimetype),
          isPublished: false
        });

        await material.save();

        res.status(201).json({
          message: 'Material uploaded successfully',
          material: {
            id: material._id,
            title: material.title,
            fileId: material.fileId,
            fileType: material.fileType
          }
        });
      } catch (error) {
        console.error('Material creation error:', error);
        res.status(500).json({ message: 'Failed to create material', error: error.message });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Download material file
router.get('/:id/download', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);
    
    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(material.fileId);

    res.setHeader('Content-Type', material.mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${material.fileName}"`);

    downloadStream.on('error', (error) => {
      console.error('Download error:', error);
      res.status(500).json({ message: 'Failed to download file', error: error.message });
    });

    downloadStream.pipe(res);

    // Increment downloads
    material.downloads += 1;
    await material.save();
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Failed to download material', error: error.message });
  }
});

// Get all materials (filtered by tutor or public)
router.get('/', async (req, res) => {
  try {
    const { tutorId, courseId, fileType, isPublished } = req.query;
    
    let query = {};
    if (tutorId) query.tutorId = tutorId;
    if (courseId) query.courseId = courseId;
    if (fileType) query.fileType = fileType;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const materials = await Material.find(query)
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });

    res.json(materials);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single material
router.get('/:id', async (req, res) => {
  try {
    const material = await Material.findById(req.params.id)
      .populate('tutorId', 'name email');

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update material
router.put('/:id', authenticate, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.tutorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, courseId, isPublished } = req.body;

    if (title !== undefined) material.title = title;
    if (description !== undefined) material.description = description;
    if (courseId !== undefined) material.courseId = courseId;
    if (isPublished !== undefined) material.isPublished = isPublished;
    material.updatedAt = new Date();

    await material.save();

    res.json(material);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete material
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const material = await Material.findById(req.params.id);

    if (!material) {
      return res.status(404).json({ message: 'Material not found' });
    }

    if (material.tutorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete file from GridFS
    const bucket = getGridFSBucket();
    await bucket.delete(material.fileId);

    // Delete material document
    await Material.findByIdAndDelete(req.params.id);

    res.json({ message: 'Material deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;

