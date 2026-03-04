const Notification = require('../models/notification');
const { sendEmail } = require('./emailService');
const User = require('../models/user');

// Create notification
const createNotification = async (userId, type, title, message, relatedId = null, relatedType = null) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      relatedId,
      relatedType
    });

    await notification.save();

    // Send email notification if user has email notifications enabled
    try {
      const user = await User.findById(userId);
      if (user && user.email) {
        await sendEmail(user.email, title, `<p>${message}</p>`, message);
        notification.emailSent = true;
        notification.emailSentAt = new Date();
        await notification.save();
      }
    } catch (emailError) {
      console.error('Email notification error:', emailError);
    }

    return notification;
  } catch (error) {
    console.error('Notification creation error:', error);
    throw error;
  }
};

// Get user notifications
const getUserNotifications = async (userId, limit = 50, unreadOnly = false) => {
  try {
    let query = { userId };
    if (unreadOnly) {
      query.isRead = false;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit);

    return notifications;
  } catch (error) {
    console.error('Get notifications error:', error);
    throw error;
  }
};

// Mark notification as read
const markAsRead = async (notificationId, userId) => {
  try {
    const notification = await Notification.findOne({ _id: notificationId, userId });
    
    if (!notification) {
      throw new Error('Notification not found');
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    return notification;
  } catch (error) {
    console.error('Mark as read error:', error);
    throw error;
  }
};

// Mark all notifications as read
const markAllAsRead = async (userId) => {
  try {
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { isRead: true, readAt: new Date() }
    );

    return result;
  } catch (error) {
    console.error('Mark all as read error:', error);
    throw error;
  }
};

// Get unread count
const getUnreadCount = async (userId) => {
  try {
    const count = await Notification.countDocuments({ userId, isRead: false });
    return count;
  } catch (error) {
    console.error('Get unread count error:', error);
    throw error;
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  getUnreadCount
};

