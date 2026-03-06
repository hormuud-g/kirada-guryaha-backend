module.exports = {
  // User roles
  ROLES: {
    TENANT: 'tenant',
    LANDLORD: 'landlord',
    ADMIN: 'admin',
    MODERATOR: 'moderator',
    EDITOR: 'editor',
    SUPPORT: 'support',
    AGENT: 'agent'
  },
  
  // Role hierarchy (higher number = more privileges)
  ROLE_HIERARCHY: {
    admin: 6,
    moderator: 5,
    editor: 4,
    landlord: 3,
    agent: 2,
    support: 2,
    tenant: 1
  },
  
  // Role permissions matrix
  PERMISSIONS: {
    tenant: [
      'read:properties',
      'read:property',
      'create:booking',
      'read:ownBookings',
      'update:ownBooking',
      'cancel:ownBooking',
      'create:inquiry',
      'read:ownInquiries',
      'create:review',
      'read:ownReviews',
      'update:ownReview',
      'delete:ownReview',
      'create:favorite',
      'delete:favorite',
      'read:ownFavorites',
      'read:notifications',
      'update:notification',
      'read:blogs',
      'read:blog',
      'create:blogComment',
      'create:contact',
      'subscribe:newsletter',
      'unsubscribe:newsletter'
    ],
    
    landlord: [
      'read:properties',
      'read:property',
      'create:property',
      'update:ownProperties',
      'delete:ownProperties',
      'read:ownProperties',
      'read:bookings',
      'update:booking',
      'confirm:booking',
      'complete:booking',
      'cancel:booking',
      'read:inquiries',
      'reply:inquiry',
      'close:inquiry',
      'reply:review',
      'read:analytics',
      'read:notifications',
      'update:notification',
      'read:blogs',
      'read:blog',
      'create:blogComment',
      'create:contact'
    ],
    
    support: [
      'read:contacts',
      'read:contact',
      'reply:contact',
      'close:contact',
      'read:inquiries',
      'read:inquiry',
      'read:reports',
      'read:report',
      'update:report',
      'read:users',
      'read:user',
      'read:properties',
      'read:property',
      'read:bookings',
      'read:booking',
      'read:notifications',
      'update:notification',
      'read:blogs',
      'read:blog'
    ],
    
    agent: [
      'read:properties',
      'read:property',
      'create:property',
      'update:property',
      'delete:property',
      'read:bookings',
      'update:booking',
      'confirm:booking',
      'complete:booking',
      'cancel:booking',
      'read:inquiries',
      'reply:inquiry',
      'close:inquiry',
      'read:users',
      'read:user',
      'read:analytics',
      'read:notifications',
      'update:notification',
      'read:blogs',
      'read:blog'
    ],
    
    editor: [
      'read:all',
      'create:blog',
      'read:blog',
      'read:blogs',
      'update:blog',
      'delete:blog',
      'publish:blog',
      'unpublish:blog',
      'archive:blog',
      'manage:blogComments',
      'approve:comment',
      'delete:comment',
      'create:category',
      'read:categories',
      'update:category',
      'delete:category',
      'upload:media',
      'delete:media',
      'read:subscribers',
      'export:subscribers',
      'read:properties',
      'read:analytics'
    ],
    
    moderator: [
      'read:all',
      'moderate:properties',
      'approve:property',
      'reject:property',
      'moderate:reviews',
      'approve:review',
      'reject:review',
      'moderate:inquiries',
      'manage:reports',
      'read:reports',
      'resolve:report',
      'dismiss:report',
      'manage:contacts',
      'read:contacts',
      'reply:contact',
      'close:contact',
      'warn:users',
      'suspend:users',
      'read:logs',
      'read:analytics',
      'manage:blogComments',
      'delete:comment'
    ],
    
    admin: [
      'read:all',
      'create:all',
      'update:all',
      'delete:all',
      'manage:users',
      'create:user',
      'read:user',
      'update:user',
      'delete:user',
      'verify:users',
      'manage:roles',
      'assign:roles',
      'moderate:properties',
      'approve:property',
      'reject:property',
      'moderate:reviews',
      'moderate:inquiries',
      'manage:reports',
      'resolve:report',
      'read:analytics',
      'manage:system',
      'manage:settings',
      'view:logs',
      'export:data',
      'import:data',
      'manage:subscriptions',
      'send:newsletter',
      'manage:admins',
      'view:audit',
      'manage:backup',
      'restore:backup',
      'manage:blogs',
      'manage:categories',
      'manage:media',
      'manage:contacts'
    ]
  },
  
  // Role descriptions
  ROLE_DESCRIPTIONS: {
    tenant: 'Property seeker who can search, inquire, book, and review properties',
    landlord: 'Property owner who can list and manage properties and respond to inquiries',
    support: 'Customer support agent who handles contact forms and user inquiries',
    agent: 'Real estate agent who can manage properties on behalf of landlords',
    editor: 'Content manager who creates and manages blogs, categories, and media',
    moderator: 'Content moderator who approves properties, reviews, and manages reports',
    admin: 'Platform administrator with full access to manage users, content, and system settings'
  },
  
  // Role capabilities by feature
  ROLE_CAPABILITIES: {
    property: {
      tenant: ['read'],
      landlord: ['create', 'read', 'updateOwn', 'deleteOwn'],
      support: ['read'],
      agent: ['create', 'read', 'update', 'delete'],
      editor: ['read'],
      moderator: ['read', 'approve', 'reject'],
      admin: ['create', 'read', 'update', 'delete', 'approve', 'reject']
    },
    booking: {
      tenant: ['create', 'readOwn', 'cancelOwn'],
      landlord: ['read', 'confirm', 'complete', 'cancel'],
      support: ['read'],
      agent: ['read', 'confirm', 'complete', 'cancel'],
      admin: ['create', 'read', 'update', 'delete', 'cancel']
    },
    inquiry: {
      tenant: ['create', 'readOwn'],
      landlord: ['read', 'reply', 'close'],
      support: ['read'],
      agent: ['read', 'reply', 'close'],
      admin: ['create', 'read', 'update', 'delete', 'reply', 'close']
    },
    review: {
      tenant: ['create', 'readOwn', 'updateOwn', 'deleteOwn'],
      landlord: ['read', 'reply'],
      moderator: ['read', 'approve', 'reject', 'delete'],
      admin: ['create', 'read', 'update', 'delete', 'approve', 'reject']
    },
    blog: {
      tenant: ['read', 'comment'],
      landlord: ['read', 'comment'],
      support: ['read'],
      agent: ['read'],
      editor: ['create', 'read', 'update', 'delete', 'publish', 'manageComments'],
      moderator: ['read', 'moderateComments'],
      admin: ['create', 'read', 'update', 'delete', 'publish', 'manageComments']
    },
    contact: {
      tenant: ['create'],
      landlord: ['create'],
      support: ['read', 'reply', 'close'],
      moderator: ['read', 'reply', 'close'],
      admin: ['read', 'reply', 'close', 'delete']
    },
    subscriber: {
      tenant: ['subscribe', 'unsubscribe'],
      landlord: ['subscribe', 'unsubscribe'],
      editor: ['read', 'export'],
      admin: ['create', 'read', 'update', 'delete', 'export', 'sendNewsletter']
    },
    report: {
      tenant: ['create'],
      landlord: ['create'],
      support: ['read', 'update'],
      moderator: ['read', 'update', 'resolve', 'dismiss'],
      admin: ['create', 'read', 'update', 'delete', 'resolve', 'dismiss']
    },
    user: {
      support: ['read'],
      moderator: ['read', 'warn', 'suspend'],
      admin: ['create', 'read', 'update', 'delete', 'verify', 'manageRoles']
    },
    analytics: {
      landlord: ['readOwn'],
      agent: ['read'],
      editor: ['read'],
      moderator: ['read'],
      admin: ['read']
    }
  },
  
  // Default role for new registrations
  DEFAULT_ROLE: 'tenant',
  
  // Roles that require verification
  VERIFICATION_REQUIRED: ['landlord', 'agent'],
  
  // Roles that can list properties
  CAN_LIST_PROPERTIES: ['landlord', 'agent', 'admin'],
  
  // Roles that can book properties
  CAN_BOOK_PROPERTIES: ['tenant', 'admin'],
  
  // Roles that can review properties
  CAN_REVIEW_PROPERTIES: ['tenant', 'admin'],
  
  // Roles that can access admin dashboard
  CAN_ACCESS_ADMIN: ['admin', 'moderator', 'editor', 'support', 'agent'],
  
  // Roles that can manage blogs
  CAN_MANAGE_BLOGS: ['editor', 'admin'],
  
  // Roles that can manage contacts
  CAN_MANAGE_CONTACTS: ['support', 'moderator', 'admin'],
  
  // Roles that can manage subscribers
  CAN_MANAGE_SUBSCRIBERS: ['editor', 'admin'],
  
  // Roles that can send newsletters
  CAN_SEND_NEWSLETTER: ['admin'],
  
  // Roles that can moderate content
  CAN_MODERATE_CONTENT: ['moderator', 'admin'],
  
  // Roles that can manage users
  CAN_MANAGE_USERS: ['admin'],
  
  // Role colors (for UI)
  ROLE_COLORS: {
    tenant: '#10b981',      // green
    landlord: '#3b82f6',    // blue
    support: '#8b5cf6',     // purple
    agent: '#f97316',       // orange
    editor: '#f59e0b',      // amber
    moderator: '#ec4899',   // pink
    admin: '#ef4444'        // red
  },
  
  // Role icons (for UI)
  ROLE_ICONS: {
    tenant: '👤',
    landlord: '🏠',
    support: '🎧',
    agent: '🤝',
    editor: '✍️',
    moderator: '🛡️',
    admin: '⚙️'
  },
  
  // Role badges (for UI)
  ROLE_BADGES: {
    tenant: 'Tenant',
    landlord: 'Landlord',
    support: 'Support Agent',
    agent: 'Real Estate Agent',
    editor: 'Content Editor',
    moderator: 'Moderator',
    admin: 'Administrator'
  },
  
  // Check if role has specific permission
  hasPermission: (role, permission) => {
    const permissions = module.exports.PERMISSIONS[role];
    return permissions ? permissions.includes(permission) : false;
  },
  
  // Check if role can perform action on feature
  can: (role, feature, action) => {
    const capabilities = module.exports.ROLE_CAPABILITIES[feature];
    return capabilities && capabilities[role] && capabilities[role].includes(action);
  },
  
  // Get all roles
  getAllRoles: () => {
    return Object.values(module.exports.ROLES);
  },
  
  // Get roles by hierarchy (highest first)
  getRolesByHierarchy: () => {
    return Object.entries(module.exports.ROLE_HIERARCHY)
      .sort(([,a], [,b]) => b - a)
      .map(([role]) => role);
  },
  
  // Get role color
  getRoleColor: (role) => {
    return module.exports.ROLE_COLORS[role] || '#6b7280';
  },
  
  // Get role icon
  getRoleIcon: (role) => {
    return module.exports.ROLE_ICONS[role] || '👤';
  },
  
  // Get role badge
  getRoleBadge: (role) => {
    return module.exports.ROLE_BADGES[role] || role;
  },
  
  // Check if role requires verification
  requiresVerification: (role) => {
    return module.exports.VERIFICATION_REQUIRED.includes(role);
  },
  
  // Check if role can access admin
  canAccessAdmin: (role) => {
    return module.exports.CAN_ACCESS_ADMIN.includes(role);
  },
  
  // Get roles by feature
  getRolesByFeature: (feature, action) => {
    const roles = [];
    for (const role of module.exports.getAllRoles()) {
      if (module.exports.can(role, feature, action)) {
        roles.push(role);
      }
    }
    return roles;
  }
};