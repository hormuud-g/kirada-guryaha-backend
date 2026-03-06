const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  // Report Identification
  reportNumber: {
    type: String,
    required: true,
    unique: true
  },
  
  // Reporter
  reporterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  reporterRole: {
    type: String,
    enum: ['tenant', 'landlord', 'admin']
  },
  
  // Reported Item
  reportedItemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'reportedItemType'
  },
  reportedItemType: {
    type: String,
    required: true,
    enum: ['Property', 'User', 'Review', 'Inquiry', 'Booking', 'Message']
  },
  
  // Report Details
  reason: {
    type: String,
    required: true,
    enum: [
      'spam',
      'inappropriate',
      'fake',
      'harassment',
      'scam',
      'misleading',
      'offensive',
      'illegal',
      'duplicate',
      'wrong_category',
      'incorrect_info',
      'other'
    ]
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    default: 'medium'
  },
  
  // Evidence
  evidence: [{
    url: String,
    type: {
      type: String,
      enum: ['image', 'document', 'screenshot', 'other']
    },
    description: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  
  // Status
  status: {
    type: String,
    enum: ['pending', 'reviewing', 'resolved', 'dismissed', 'escalated'],
    default: 'pending'
  },
  
  // Assignment
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  assignedAt: Date,
  
  // Actions Taken
  actions: [{
    type: {
      type: String,
      enum: [
        'warning_issued',
        'content_removed',
        'user_suspended',
        'user_banned',
        'property_removed',
        'review_removed',
        'no_action',
        'escalated'
      ]
    },
    description: String,
    takenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    takenAt: {
      type: Date,
      default: Date.now
    },
    effectiveUntil: Date
  }],
  
  // Resolution
  resolution: {
    summary: String,
    decision: {
      type: String,
      enum: ['upheld', 'rejected', 'partially_upheld']
    },
    resolvedAt: Date,
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    notifiedReporter: {
      type: Boolean,
      default: false
    },
    notifiedReported: {
      type: Boolean,
      default: false
    }
  },
  
  // Notes
  notes: [{
    note: String,
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    addedAt: {
      type: Date,
      default: Date.now
    },
    isPrivate: {
      type: Boolean,
      default: true
    }
  }],
  
  // Appeal
  appeal: {
    requested: {
      type: Boolean,
      default: false
    },
    reason: String,
    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    requestedAt: Date,
    decision: String,
    decidedAt: Date,
    decidedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  
  // Metadata
  meta: {
    ipAddress: String,
    userAgent: String,
    source: {
      type: String,
      enum: ['web', 'mobile', 'email', 'api'],
      default: 'web'
    },
    tags: [String],
    relatedReports: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Report'
    }]
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
reportSchema.virtual('age').get(function() {
  const diffMs = Date.now() - this.createdAt;
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
});

reportSchema.virtual('responseTime').get(function() {
  if (!this.assignedAt) return null;
  const diffMs = this.assignedAt - this.createdAt;
  return Math.round(diffMs / (1000 * 60 * 60));
});

reportSchema.virtual('resolutionTime').get(function() {
  if (!this.resolution?.resolvedAt) return null;
  const diffMs = this.resolution.resolvedAt - this.createdAt;
  return Math.round(diffMs / (1000 * 60 * 60));
});

// Indexes
reportSchema.index({ reportNumber: 1 }, { unique: true });
reportSchema.index({ reporterId: 1 });
reportSchema.index({ reportedItemId: 1, reportedItemType: 1 });
reportSchema.index({ status: 1 });
reportSchema.index({ priority: 1 });
reportSchema.index({ assignedTo: 1 });
reportSchema.index({ createdAt: -1 });
reportSchema.index({ 'resolution.resolvedAt': -1 });

// Pre-save middleware
reportSchema.pre('save', async function(next) {
  if (!this.reportNumber) {
    const date = new Date();
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
    this.reportNumber = `RPT${year}${month}${random}`;
  }
  
  if (!this.priority) {
    const priorityMap = {
      'illegal': 'critical',
      'harassment': 'high',
      'scam': 'high',
      'offensive': 'medium',
      'inappropriate': 'medium',
      'spam': 'low',
      'fake': 'medium',
      'misleading': 'medium',
      'duplicate': 'low',
      'wrong_category': 'low',
      'incorrect_info': 'low',
      'other': 'medium'
    };
    this.priority = priorityMap[this.reason] || 'medium';
  }
  
  next();
});

// ============================================
// METHODS (All method names are different from schema fields)
// ============================================

// Assign report to admin
reportSchema.methods.assignTo = async function(adminId) {
  this.assignedTo = adminId;
  this.assignedAt = new Date();
  this.status = 'reviewing';
  return this.save();
};

// Add action to report
reportSchema.methods.addActionItem = async function(action, description, takenBy, effectiveUntil = null) {
  this.actions.push({
    type: action,
    description,
    takenBy,
    takenAt: new Date(),
    effectiveUntil
  });
  return this.save();
};

// Resolve report
reportSchema.methods.resolveReport = async function(decision, summary, resolvedBy) {
  this.status = 'resolved';
  this.resolution = {
    decision,
    summary,
    resolvedAt: new Date(),
    resolvedBy
  };
  return this.save();
};

// Dismiss report
reportSchema.methods.dismissReport = async function(reason, dismissedBy) {
  this.status = 'dismissed';
  this.notes.push({
    note: `Report dismissed: ${reason}`,
    addedBy: dismissedBy,
    addedAt: new Date(),
    isPrivate: true
  });
  return this.save();
};

// Escalate report
reportSchema.methods.escalateReport = async function(reason, escalatedBy) {
  this.status = 'escalated';
  this.priority = 'critical';
  this.notes.push({
    note: `Report escalated: ${reason}`,
    addedBy: escalatedBy,
    addedAt: new Date(),
    isPrivate: true
  });
  return this.save();
};

// Add note to report
reportSchema.methods.addNoteToReport = async function(note, addedBy, isPrivate = true) {
  this.notes.push({
    note,
    addedBy,
    addedAt: new Date(),
    isPrivate
  });
  return this.save();
};

// Submit appeal - ⚠️ MAGACA WAA LA BEDDELAY "submitAppeal"
reportSchema.methods.submitAppeal = async function(reason, requestedBy) {
  this.appeal = {
    requested: true,
    reason,
    requestedBy,
    requestedAt: new Date()
  };
  return this.save();
};

// Decide on appeal
reportSchema.methods.decideOnAppeal = async function(decision, decidedBy) {
  if (this.appeal && this.appeal.requested) {
    this.appeal.decision = decision;
    this.appeal.decidedAt = new Date();
    this.appeal.decidedBy = decidedBy;
    await this.save();
  }
  return this;
};

// ============================================
// STATIC METHODS
// ============================================

reportSchema.statics.getPendingReports = function(limit = 50) {
  return this.find({ 
    status: { $in: ['pending', 'reviewing'] } 
  })
  .sort({ priority: -1, createdAt: 1 })
  .limit(limit)
  .populate('reporterId', 'name email')
  .populate('assignedTo', 'name');
};

reportSchema.statics.getReportsByItem = function(itemId, itemType) {
  return this.find({ 
    reportedItemId: itemId, 
    reportedItemType: itemType 
  })
  .sort({ createdAt: -1 })
  .populate('reporterId', 'name email');
};

reportSchema.statics.getReportsByUser = function(userId) {
  return this.find({ reporterId: userId })
    .sort({ createdAt: -1 })
    .populate('reportedItemId');
};

reportSchema.statics.getStats = async function() {
  const stats = await this.aggregate([
    { $group: {
      _id: null,
      total: { $sum: 1 },
      pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
      reviewing: { $sum: { $cond: [{ $eq: ['$status', 'reviewing'] }, 1, 0] } },
      resolved: { $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] } },
      dismissed: { $sum: { $cond: [{ $eq: ['$status', 'dismissed'] }, 1, 0] } },
      escalated: { $sum: { $cond: [{ $eq: ['$status', 'escalated'] }, 1, 0] } }
    }},
    { $project: { _id: 0 } }
  ]);
  
  const reasonStats = await this.aggregate([
    { $group: {
      _id: '$reason',
      count: { $sum: 1 }
    }},
    { $sort: { count: -1 } }
  ]);
  
  return {
    ...(stats[0] || {
      total: 0,
      pending: 0,
      reviewing: 0,
      resolved: 0,
      dismissed: 0,
      escalated: 0
    }),
    byReason: reasonStats
  };
};

reportSchema.statics.getAverageResolutionTime = async function() {
  const result = await this.aggregate([
    { $match: { 
      'resolution.resolvedAt': { $exists: true },
      createdAt: { $exists: true }
    }},
    { $project: {
      resolutionTime: { 
        $divide: [
          { $subtract: ['$resolution.resolvedAt', '$createdAt'] },
          1000 * 60 * 60
        ]
      }
    }},
    { $group: {
      _id: null,
      avgHours: { $avg: '$resolutionTime' },
      minHours: { $min: '$resolutionTime' },
      maxHours: { $max: '$resolutionTime' }
    }}
  ]);
  
  return result[0] || { avgHours: 0, minHours: 0, maxHours: 0 };
};

module.exports = mongoose.model('Report', reportSchema);