const express = require('express');
const router = express.Router();
const Message = require('../models/message');
const { authenticate } = require('../middleware/auth');

// Send message
router.post('/', authenticate, async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    
    if (!receiverId || !content) {
      return res.status(400).json({ message: 'Receiver ID and content are required' });
    }
    
    const message = new Message({
      senderId: req.user.userId,
      receiverId,
      content
    });
    
    await message.save();
    
    res.status(201).json(message);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get conversation between two users
router.get('/conversation/:userId', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.userId, receiverId: req.params.userId },
        { senderId: req.params.userId, receiverId: req.user.userId }
      ]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .sort({ createdAt: 1 });
    
    // Mark messages as read
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user.userId, isRead: false },
      { isRead: true }
    );
    
    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all conversations for user
router.get('/conversations', authenticate, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { senderId: req.user.userId },
        { receiverId: req.user.userId }
      ]
    })
    .populate('senderId', 'name email')
    .populate('receiverId', 'name email')
    .sort({ createdAt: -1 });
    
    // Group by conversation partner
    const conversations = {};
    messages.forEach(msg => {
      const partnerId = msg.senderId._id.toString() === req.user.userId 
        ? msg.receiverId._id.toString()
        : msg.senderId._id.toString();
      
      if (!conversations[partnerId]) {
        conversations[partnerId] = {
          partner: msg.senderId._id.toString() === req.user.userId ? msg.receiverId : msg.senderId,
          lastMessage: msg,
          unreadCount: 0
        };
      }
      
      if (!msg.isRead && msg.receiverId._id.toString() === req.user.userId) {
        conversations[partnerId].unreadCount++;
      }
    });
    
    res.json(Object.values(conversations));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Mark messages as read
router.patch('/read/:userId', authenticate, async (req, res) => {
  try {
    await Message.updateMany(
      { senderId: req.params.userId, receiverId: req.user.userId, isRead: false },
      { isRead: true }
    );
    
    res.json({ message: 'Messages marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;



