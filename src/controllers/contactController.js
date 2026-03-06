const Contact = require('../models/Contact');
const User = require('../models/User');
const { sendContactAutoReply, sendContactNotification } = require('../services/emailService');

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
const submitContact = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, subject and message'
      });
    }

    // Create contact message
    const contact = await Contact.create({
      name,
      email,
      phone: phone || '',
      subject,
      message,
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || 'Unknown',
      status: 'new'
    });

    // Send auto-reply to user
    try {
      await sendContactAutoReply(email, name);
    } catch (emailError) {
      console.error('Failed to send auto-reply:', emailError.message);
    }

    // Notify admins and support team
    try {
      const admins = await User.find({ 
        role: { $in: ['admin', 'support', 'moderator'] },
        status: 'active'
      }).select('email');
      
      const adminEmails = admins.map(admin => admin.email);
      
      if (adminEmails.length > 0) {
        await sendContactNotification(adminEmails, contact);
      }
    } catch (notifyError) {
      console.error('Failed to notify admins:', notifyError.message);
    }

    res.status(201).json({
      success: true,
      message: 'Message sent successfully. We will get back to you soon.',
      data: {
        id: contact._id,
        name: contact.name,
        email: contact.email,
        subject: contact.subject,
        status: contact.status,
        createdAt: contact.createdAt
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all contact messages (Admin/Support only)
// @route   GET /api/contact
// @access  Private (Admin, Support, Moderator)
const getMessages = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 20, 
      status, 
      search,
      startDate,
      endDate,
      assignedTo,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by status
    if (status) {
      query.status = status;
    }

    // Filter by assigned user
    if (assignedTo) {
      query.assignedTo = assignedTo;
    }

    // Search in name, email, subject, message
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { subject: { $regex: search, $options: 'i' } },
        { message: { $regex: search, $options: 'i' } }
      ];
    }

    // Date range filter
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) {
        query.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        query.createdAt.$lte = new Date(endDate);
      }
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const messages = await Contact.find(query)
      .populate('assignedTo', 'name email role')
      .populate('replies.repliedBy', 'name email role')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Contact.countDocuments(query);

    // Get statistics
    const stats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } }
        }
      }
    ]);

    res.json({
      success: true,
      count: messages.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      stats: stats[0] || { total: 0, new: 0, read: 0, replied: 0, closed: 0 },
      data: messages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single contact message
// @route   GET /api/contact/:id
// @access  Private (Admin, Support, Moderator)
const getMessageById = async (req, res) => {
  try {
    const { id } = req.params;

    const message = await Contact.findById(id)
      .populate('assignedTo', 'name email role profileImage')
      .populate('replies.repliedBy', 'name email role profileImage');

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Mark as read if it's new and being viewed
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.json({
      success: true,
      data: message
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reply to contact message
// @route   POST /api/contact/:id/reply
// @access  Private (Admin, Support, Moderator)
const replyToMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Reply message is required'
      });
    }

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Add reply
    contact.replies.push({
      message,
      repliedBy: req.user.id,
      repliedAt: new Date()
    });

    contact.status = 'replied';
    await contact.save();

    // Send email reply to user
    try {
      const { sendContactReply } = require('../services/emailService');
      await sendContactReply(contact.email, contact.name, message, req.user.name);
    } catch (emailError) {
      console.error('Failed to send reply email:', emailError.message);
    }

    const updatedContact = await Contact.findById(id)
      .populate('assignedTo', 'name email')
      .populate('replies.repliedBy', 'name email');

    res.json({
      success: true,
      message: 'Reply sent successfully',
      data: updatedContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Assign message to staff
// @route   PUT /api/contact/:id/assign
// @access  Private (Admin, Support, Moderator)
const assignMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    contact.assignedTo = userId;
    await contact.save();

    const updatedContact = await Contact.findById(id)
      .populate('assignedTo', 'name email role');

    res.json({
      success: true,
      message: `Message assigned to ${user.name}`,
      data: updatedContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Mark message as read
// @route   PUT /api/contact/:id/read
// @access  Private (Admin, Support, Moderator)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndUpdate(
      id,
      { status: 'read' },
      { new: true }
    );

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Marked as read',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Close message (mark as resolved)
// @route   PUT /api/contact/:id/close
// @access  Private (Admin, Support, Moderator)
const closeMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { resolution } = req.body;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    contact.status = 'closed';
    
    // Add resolution note if provided
    if (resolution) {
      contact.replies.push({
        message: `[SYSTEM] Ticket closed. Resolution: ${resolution}`,
        repliedBy: req.user.id,
        repliedAt: new Date()
      });
    }

    await contact.save();

    const updatedContact = await Contact.findById(id)
      .populate('assignedTo', 'name email')
      .populate('replies.repliedBy', 'name email');

    res.json({
      success: true,
      message: 'Message closed successfully',
      data: updatedContact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Reopen closed message
// @route   PUT /api/contact/:id/reopen
// @access  Private (Admin, Support, Moderator)
const reopenMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findById(id);
    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    if (contact.status !== 'closed') {
      return res.status(400).json({
        success: false,
        message: 'Only closed messages can be reopened'
      });
    }

    contact.status = 'read';
    
    contact.replies.push({
      message: '[SYSTEM] Ticket reopened',
      repliedBy: req.user.id,
      repliedAt: new Date()
    });

    await contact.save();

    res.json({
      success: true,
      message: 'Message reopened successfully',
      data: contact
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete message (Admin only)
// @route   DELETE /api/contact/:id
// @access  Private (Admin only)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const contact = await Contact.findByIdAndDelete(id);

    if (!contact) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Bulk delete messages (Admin only)
// @route   DELETE /api/contact/bulk
// @access  Private (Admin only)
const bulkDelete = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an array of message IDs'
      });
    }

    const result = await Contact.deleteMany({ _id: { $in: ids } });

    res.json({
      success: true,
      message: `Successfully deleted ${result.deletedCount} messages`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get contact statistics (Admin only)
// @route   GET /api/contact/stats
// @access  Private (Admin, Support, Moderator)
const getContactStats = async (req, res) => {
  try {
    const { period = '30d' } = req.query;

    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch(period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    // Overall stats
    const overallStats = await Contact.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          new: { $sum: { $cond: [{ $eq: ['$status', 'new'] }, 1, 0] } },
          read: { $sum: { $cond: [{ $eq: ['$status', 'read'] }, 1, 0] } },
          replied: { $sum: { $cond: [{ $eq: ['$status', 'replied'] }, 1, 0] } },
          closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    // Messages over time
    const messagesOverTime = await Contact.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate, $lte: endDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    // Top subjects
    const topSubjects = await Contact.aggregate([
      {
        $group: {
          _id: '$subject',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Response time by staff
    const staffPerformance = await Contact.aggregate([
      {
        $match: {
          'replies.0': { $exists: true }
        }
      },
      {
        $project: {
          firstReply: { $arrayElemAt: ['$replies', 0] },
          createdAt: 1
        }
      },
      {
        $project: {
          staffId: '$firstReply.repliedBy',
          responseTime: { 
            $divide: [
              { $subtract: ['$firstReply.repliedAt', '$createdAt'] },
              1000 * 60 * 60 // Convert to hours
            ]
          }
        }
      },
      {
        $group: {
          _id: '$staffId',
          avgResponseTime: { $avg: '$responseTime' },
          count: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'staff'
        }
      },
      {
        $project: {
          staff: { $arrayElemAt: ['$staff', 0] },
          avgResponseTime: 1,
          count: 1
        }
      },
      { $sort: { avgResponseTime: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        period,
        overall: overallStats[0] || {
          total: 0,
          new: 0,
          read: 0,
          replied: 0,
          closed: 0,
          avgResponseTime: 0
        },
        messagesOverTime: messagesOverTime.map(item => ({
          date: `${item._id.year}-${item._id.month}-${item._id.day}`,
          count: item.count
        })),
        topSubjects,
        staffPerformance: staffPerformance.map(item => ({
          staff: item.staff?.name || 'Unknown',
          email: item.staff?.email,
          avgResponseTime: Math.round(item.avgResponseTime * 10) / 10,
          ticketsHandled: item.count
        }))
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Export messages (Admin only)
// @route   GET /api/contact/export
// @access  Private (Admin only)
const exportMessages = async (req, res) => {
  try {
    const { format = 'json', status, startDate, endDate } = req.query;

    const query = {};
    if (status) query.status = status;
    
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    const messages = await Contact.find(query)
      .populate('assignedTo', 'name email')
      .populate('replies.repliedBy', 'name email')
      .sort({ createdAt: -1 });

    if (format === 'csv') {
      // Convert to CSV
      const csv = convertToCSV(messages);
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=contact-messages.csv');
      return res.send(csv);
    }

    res.json({
      success: true,
      count: messages.length,
      data: messages
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
  const headers = ['id', 'name', 'email', 'phone', 'subject', 'message', 'status', 'assignedTo', 'createdAt', 'replies'];
  const rows = data.map(item => [
    item._id.toString(),
    item.name,
    item.email,
    item.phone || '',
    item.subject,
    item.message.replace(/"/g, '""'), // Escape quotes
    item.status,
    item.assignedTo?.name || '',
    item.createdAt.toISOString(),
    item.replies.length
  ]);

  return [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');
};

module.exports = {
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
};