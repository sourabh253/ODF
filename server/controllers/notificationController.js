import asyncHandler from '../utils/asyncHandler.js';
import Notification from '../models/Notification.js';

// Get notifications for the current user
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({ userId: req.user._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('bookingId', 'status totalAmount');

  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });

  res.json({ notifications, unreadCount });
});

// Mark a notification as read
export const markAsRead = asyncHandler(async (req, res) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );

  if (!notification) {
    res.status(404);
    throw new Error('Notification not found');
  }

  res.json(notification);
});

// Mark all notifications as read
export const markAllAsRead = asyncHandler(async (req, res) => {
  await Notification.updateMany(
    { userId: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: 'All notifications marked as read' });
});
