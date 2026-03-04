const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const Lecture = require('../models/lecture');
const { authenticate } = require('../middleware/auth');

// Configure multer for file uploads (memory storage for GridFS)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 500 * 1024 * 1024 // 500MB max file size
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('video/')) {
      cb(null, true);
    } else {
      cb(new Error('Only video files are allowed'), false);
    }
  }
});

// Initialize GridFS bucket
const getGridFSBucket = () => {
  const conn = mongoose.connection;
  return new GridFSBucket(conn.db, { bucketName: 'lectureVideos' });
};

// Upload lecture video
router.post('/upload', authenticate, upload.single('video'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No video file uploaded' });
    }

    const { title, description, courseId, duration } = req.body;
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

    // Convert buffer to stream
    const bufferStream = require('stream').PassThrough();
    bufferStream.end(req.file.buffer);
    
    bufferStream.pipe(uploadStream);

    uploadStream.on('error', (error) => {
      console.error('GridFS upload error:', error);
      res.status(500).json({ message: 'Failed to upload video', error: error.message });
    });

    uploadStream.on('finish', async () => {
      try {
        // Create lecture document
        const lecture = new Lecture({
          title,
          description: description || '',
          tutorId,
          courseId: courseId || 'default-course',
          videoFileId: uploadStream.id,
          videoFileName: req.file.originalname,
          videoFileSize: req.file.size,
          videoMimeType: req.file.mimetype,
          duration: duration || '0:00',
          durationSeconds: parseDurationToSeconds(duration || '0:00'),
          isPublished: false
        });

        await lecture.save();

        res.status(201).json({
          message: 'Lecture uploaded successfully',
          lecture: {
            id: lecture._id,
            title: lecture.title,
            videoFileId: lecture.videoFileId,
            duration: lecture.duration
          }
        });
      } catch (error) {
        console.error('Lecture creation error:', error);
        res.status(500).json({ message: 'Failed to create lecture', error: error.message });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed', error: error.message });
  }
});

// Get lecture video stream
router.get('/:id/video', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);
    
    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    const bucket = getGridFSBucket();
    const downloadStream = bucket.openDownloadStream(lecture.videoFileId);

    // Set content type
    res.setHeader('Content-Type', lecture.videoMimeType);
    res.setHeader('Content-Disposition', `inline; filename="${lecture.videoFileName}"`);

    // Handle range requests for video streaming
    const range = req.headers.range;
    if (range) {
      // Get file info
      const files = await bucket.find({ _id: lecture.videoFileId }).toArray();
      if (files.length === 0) {
        return res.status(404).json({ message: 'Video file not found' });
      }
      const file = files[0];
      const fileSize = file.length;
      
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunksize,
        'Content-Type': lecture.videoMimeType
      });
      
      bucket.openDownloadStream(lecture.videoFileId, { start, end }).pipe(res);
    } else {
      downloadStream.pipe(res);
    }

    // Increment views
    lecture.views += 1;
    await lecture.save();
  } catch (error) {
    console.error('Video stream error:', error);
    res.status(500).json({ message: 'Failed to stream video', error: error.message });
  }
});

// Get all lectures (filtered by tutor or public)
router.get('/', async (req, res) => {
  try {
    const { tutorId, courseId, isPublished } = req.query;
    
    let query = {};
    if (tutorId) query.tutorId = tutorId;
    if (courseId) query.courseId = courseId;
    if (isPublished !== undefined) query.isPublished = isPublished === 'true';

    const lectures = await Lecture.find(query)
      .populate('tutorId', 'name email')
      .sort({ createdAt: -1 });

    res.json(lectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single lecture
router.get('/:id', async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id)
      .populate('tutorId', 'name email');

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update lecture
router.put('/:id', authenticate, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (lecture.tutorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    const { title, description, courseId, duration, isPublished } = req.body;

    if (title !== undefined) lecture.title = title;
    if (description !== undefined) lecture.description = description;
    if (courseId !== undefined) lecture.courseId = courseId;
    if (duration !== undefined) {
      lecture.duration = duration;
      lecture.durationSeconds = parseDurationToSeconds(duration);
    }
    if (isPublished !== undefined) lecture.isPublished = isPublished;
    lecture.updatedAt = new Date();

    await lecture.save();

    res.json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete lecture
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const lecture = await Lecture.findById(req.params.id);

    if (!lecture) {
      return res.status(404).json({ message: 'Lecture not found' });
    }

    if (lecture.tutorId.toString() !== req.user.userId) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Delete video file from GridFS
    const bucket = getGridFSBucket();
    await bucket.delete(lecture.videoFileId);

    // Delete lecture document
    await Lecture.findByIdAndDelete(req.params.id);

    res.json({ message: 'Lecture deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Helper function to parse duration string to seconds
function parseDurationToSeconds(duration) {
  const parts = duration.split(':');
  if (parts.length === 2) {
    return parseInt(parts[0]) * 60 + parseInt(parts[1]);
  } else if (parts.length === 3) {
    return parseInt(parts[0]) * 3600 + parseInt(parts[1]) * 60 + parseInt(parts[2]);
  }
  return 0;
}

module.exports = router;

