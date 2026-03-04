const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const notificationService = require('../services/notificationService');

// Get user notifications
router.get('/', authenticate, async (req, res) => {
  try {
    const { unreadOnly, limit } = req.query;
    
    const notifications = await notificationService.getUserNotifications(
      req.user.userId,
      parseInt(limit) || 50,
      unreadOnly === 'true'
    );

    res.json(notifications);
  } catch (error) {
    console.error('Get notifications error:', error);
    res.status(500).json({ message: 'Failed to get notifications', error: error.message });
  }
});

// Get unread count
router.get('/unread-count', authenticate, async (req, res) => {
  try {
    const count = await notificationService.getUnreadCount(req.user.userId);
    res.json({ count });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({ message: 'Failed to get unread count', error: error.message });
  }
});

// Mark notification as read
router.patch('/:id/read', authenticate, async (req, res) => {
  try {
    const notification = await notificationService.markAsRead(req.params.id, req.user.userId);
    res.json({
      message: 'Notification marked as read',
      notification
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({ message: 'Failed to mark as read', error: error.message });
  }
});

// Mark all notifications as read
router.patch('/read-all', authenticate, async (req, res) => {
  try {
    const result = await notificationService.markAllAsRead(req.user.userId);
    res.json({
      message: 'All notifications marked as read',
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Mark all as read error:', error);
    res.status(500).json({ message: 'Failed to mark all as read', error: error.message });
  }
});

module.exports = router;

