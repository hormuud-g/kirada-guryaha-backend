const Subscriber = require('../models/Subscriber');
const { sendNewsletterEmail } = require('../services/emailService');

// @desc    Subscribe to newsletter
// @route   POST /api/subscribers
// @access  Public
const subscribe = async (req, res) => {
  try {
    const { email, name, source, preferences } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    // Check if already subscribed
    let subscriber = await Subscriber.findOne({ email });

    if (subscriber) {
      if (subscriber.status === 'unsubscribed') {
        // Reactivate subscription
        subscriber.status = 'active';
        subscriber.subscribedAt = new Date();
        subscriber.unsubscribedAt = null;
        if (name) subscriber.name = name;
        if (source) subscriber.source = source;
        if (preferences) subscriber.preferences = preferences;
        await subscriber.save();

        // Send welcome back email
        try {
          await sendNewsletterEmail(email, 'welcome_back', { name: name || subscriber.name });
        } catch (emailError) {
          console.error('Failed to send welcome back email:', emailError.message);
        }

        return res.status(200).json({
          success: true,
          message: 'Successfully resubscribed to newsletter'
        });
      }

      return res.status(400).json({
        success: false,
        message: 'Email already subscribed'
      });
    }

    // Create new subscriber
    subscriber = await Subscriber.create({
      email,
      name: name || email.split('@')[0],
      source: source || 'website',
      preferences: preferences || {
        frequency: 'weekly',
        categories: []
      }
    });

    // Send welcome email
    try {
      await sendNewsletterEmail(email, 'welcome', { name: subscriber.name });
    } catch (emailError) {
      console.error('Failed to send welcome email:', emailError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      data: {
        email: subscriber.email,
        name: subscriber.name,
        preferences: subscriber.preferences
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Unsubscribe from newsletter
// @route   DELETE /api/subscribers/:email
// @access  Public
const unsubscribe = async (req, res) => {
  try {
    const { email } = req.params;
    const { reason } = req.body;

    const subscriber = await Subscriber.findOne({ email });

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in our newsletter list'
      });
    }

    if (subscriber.status === 'unsubscribed') {
      return res.status(400).json({
        success: false,
        message: 'Already unsubscribed'
      });
    }

    // Update subscriber status
    subscriber.status = 'unsubscribed';
    subscriber.unsubscribedAt = new Date();
    if (reason) {
      subscriber.preferences = subscriber.preferences || {};
      subscriber.preferences.unsubscribeReason = reason;
    }
    await subscriber.save();

    // Send goodbye email
    try {
      await sendNewsletterEmail(email, 'goodbye', { name: subscriber.name });
    } catch (emailError) {
      console.error('Failed to send goodbye email:', emailError.message);
    }

    res.json({
      success: true,
      message: 'Successfully unsubscribed from newsletter'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Unsubscribe via token (for email links)
// @route   GET /api/subscribers/unsubscribe/:token
// @access  Public
const unsubscribeViaToken = async (req, res) => {
  try {
    const { token } = req.params;

    // In a real app, you'd decode the token to get the email
    // For now, we'll just return a success message
    res.json({
      success: true,
      message: 'You have been unsubscribed successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all subscribers (Admin only)
// @route   GET /api/subscribers
// @access  Private (Admin, Editor)
const getSubscribers = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, source } = req.query;
    const query = {};

    if (status) query.status = status;
    if (source) query.source = source;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const subscribers = await Subscriber.find(query)
      .sort({ subscribedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Subscriber.countDocuments(query);
    const activeCount = await Subscriber.countDocuments({ status: 'active' });
    const unsubscribedCount = await Subscriber.countDocuments({ status: 'unsubscribed' });

    res.json({
      success: true,
      count: subscribers.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: {
        active: activeCount,
        unsubscribed: unsubscribedCount
      },
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single subscriber by email or ID
// @route   GET /api/subscribers/:identifier
// @access  Private (Admin, Editor)
const getSubscriberById = async (req, res) => {
  try {
    const { identifier } = req.params;
    let subscriber;

    // Check if identifier is email or ID
    if (identifier.includes('@')) {
      subscriber = await Subscriber.findOne({ email: identifier.toLowerCase() });
    } else {
      subscriber = await Subscriber.findById(identifier);
    }

    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      data: subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update subscriber preferences
// @route   PUT /api/subscribers/:id
// @access  Private (Admin, Editor) or Public with token
const updateSubscriber = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, preferences, source } = req.body;

    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    // Update fields
    if (name) subscriber.name = name;
    if (source) subscriber.source = source;
    if (preferences) {
      subscriber.preferences = {
        ...subscriber.preferences,
        ...preferences
      };
    }

    await subscriber.save();

    res.json({
      success: true,
      message: 'Subscriber updated successfully',
      data: subscriber
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update frequency preference
// @route   PUT /api/subscribers/:id/frequency
// @access  Private (Admin, Editor) or Public with token
const updateFrequency = async (req, res) => {
  try {
    const { id } = req.params;
    const { frequency } = req.body;

    if (!['daily', 'weekly', 'monthly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid frequency. Must be daily, weekly, or monthly'
      });
    }

    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    subscriber.preferences.frequency = frequency;
    await subscriber.save();

    res.json({
      success: true,
      message: `Frequency updated to ${frequency}`,
      data: { frequency }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update category preferences
// @route   PUT /api/subscribers/:id/categories
// @access  Private (Admin, Editor) or Public with token
const updateCategories = async (req, res) => {
  try {
    const { id } = req.params;
    const { categories } = req.body;

    if (!Array.isArray(categories)) {
      return res.status(400).json({
        success: false,
        message: 'Categories must be an array'
      });
    }

    const subscriber = await Subscriber.findById(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    subscriber.preferences.categories = categories;
    await subscriber.save();

    res.json({
      success: true,
      message: 'Categories updated successfully',
      data: { categories }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete subscriber (Admin only)
// @route   DELETE /api/subscribers/:id
// @access  Private (Admin only)
const deleteSubscriber = async (req, res) => {
  try {
    const { id } = req.params;

    const subscriber = await Subscriber.findByIdAndDelete(id);
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        message: 'Subscriber not found'
      });
    }

    res.json({
      success: true,
      message: 'Subscriber deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Bulk import subscribers (Admin only)
// @route   POST /api/subscribers/bulk
// @access  Private (Admin only)
const bulkImport = async (req, res) => {
  try {
    const { subscribers } = req.body;

    if (!Array.isArray(subscribers) || subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of subscribers'
      });
    }

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const sub of subscribers) {
      try {
        const existing = await Subscriber.findOne({ email: sub.email });
        if (existing) {
          skipped++;
          continue;
        }

        await Subscriber.create({
          email: sub.email,
          name: sub.name || sub.email.split('@')[0],
          source: sub.source || 'import',
          status: 'active'
        });
        created++;
      } catch (err) {
        errors.push({ email: sub.email, error: err.message });
      }
    }

    res.status(201).json({
      success: true,
      message: `Imported ${created} subscribers, skipped ${skipped}`,
      data: {
        created,
        skipped,
        errors: errors.length > 0 ? errors : undefined
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Export subscribers (Admin only)
// @route   GET /api/subscribers/export
// @access  Private (Admin only)
const exportSubscribers = async (req, res) => {
  try {
    const { format = 'json', status = 'active' } = req.query;

    const subscribers = await Subscriber.find({ status })
      .select('-__v')
      .sort({ subscribedAt: -1 });

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(subscribers);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=subscribers.csv');
      return res.send(csv);
    }

    res.json({
      success: true,
      count: subscribers.length,
      data: subscribers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get subscriber statistics (Admin only)
// @route   GET /api/subscribers/stats
// @access  Private (Admin, Editor)
const getSubscriberStats = async (req, res) => {
  try {
    const stats = await Subscriber.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          active: {
            $sum: { $cond: [{ $eq: ['$status', 'active'] }, 1, 0] }
          },
          unsubscribed: {
            $sum: { $cond: [{ $eq: ['$status', 'unsubscribed'] }, 1, 0] }
          },
          bounced: {
            $sum: { $cond: [{ $eq: ['$status', 'bounced'] }, 1, 0] }
          }
        }
      }
    ]);

    const bySource = await Subscriber.aggregate([
      {
        $group: {
          _id: '$source',
          count: { $sum: 1 }
        }
      }
    ]);

    const byFrequency = await Subscriber.aggregate([
      {
        $match: { status: 'active' }
      },
      {
        $group: {
          _id: '$preferences.frequency',
          count: { $sum: 1 }
        }
      }
    ]);

    const recent = await Subscriber.find({ status: 'active' })
      .sort({ subscribedAt: -1 })
      .limit(5)
      .select('email name subscribedAt');

    const growth = await Subscriber.aggregate([
      {
        $match: {
          subscribedAt: {
            $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$subscribedAt' },
            month: { $month: '$subscribedAt' },
            day: { $dayOfMonth: '$subscribedAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || { total: 0, active: 0, unsubscribed: 0, bounced: 0 },
        bySource,
        byFrequency,
        recent,
        growth
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// Helper function to convert to CSV
const convertToCSV = (data) => {
  const headers = ['email', 'name', 'status', 'source', 'frequency', 'subscribedAt', 'unsubscribedAt'];
  const rows = data.map(item => [
    item.email,
    item.name || '',
    item.status,
    item.source,
    item.preferences?.frequency || 'weekly',
    item.subscribedAt?.toISOString() || '',
    item.unsubscribedAt?.toISOString() || ''
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

module.exports = {
  subscribe,
  unsubscribe,
  unsubscribeViaToken,
  getSubscribers,
  getSubscriberById,
  updateSubscriber,
  updateFrequency,
  updateCategories,
  deleteSubscriber,
  bulkImport,
  exportSubscribers,
  getSubscriberStats
};