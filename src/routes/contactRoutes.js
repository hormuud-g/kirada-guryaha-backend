const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  submitContact,
  getMessages,
  getMessageById,
  replyToMessage,
  assignMessage,
  markAsRead,
  closeMessage,
  reopenMessage,
  deleteMessage,
  bulkDelete,
  getContactStats,
  exportMessages
} = require('../controllers/contactController');

// ==================== Public Routes ====================
router.post('/', submitContact);

// ==================== Protected Routes (Admin/Support/Moderator) ====================
router.get('/', protect, authorize('admin', 'support', 'moderator'), getMessages);
router.get('/stats', protect, authorize('admin', 'support', 'moderator'), getContactStats);
router.get('/export', protect, authorize('admin'), exportMessages);
router.get('/:id', protect, authorize('admin', 'support', 'moderator'), getMessageById);

router.post('/:id/reply', protect, authorize('admin', 'support', 'moderator'), replyToMessage);
router.put('/:id/assign', protect, authorize('admin', 'support', 'moderator'), assignMessage);
router.put('/:id/read', protect, authorize('admin', 'support', 'moderator'), markAsRead);
router.put('/:id/close', protect, authorize('admin', 'support', 'moderator'), closeMessage);
router.put('/:id/reopen', protect, authorize('admin', 'support', 'moderator'), reopenMessage);

// ==================== Admin Only Routes ====================
router.delete('/bulk', protect, authorize('admin'), bulkDelete);
router.delete('/:id', protect, authorize('admin'), deleteMessage);

module.exports = router;