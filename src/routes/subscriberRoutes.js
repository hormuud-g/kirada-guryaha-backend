const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
  subscribe,
  unsubscribe,
  getSubscribers,
  getSubscriberStats
} = require('../controllers/subscriberController');

// Public routes
router.post('/', subscribe);
router.delete('/:email', unsubscribe);

// Admin/Editor only routes
router.get('/', protect, authorize('admin', 'editor'), getSubscribers);
router.get('/stats', protect, authorize('admin', 'editor'), getSubscriberStats);

module.exports = router;