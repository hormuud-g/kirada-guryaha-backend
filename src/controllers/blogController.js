const Blog = require('../models/Blog');
const User = require('../models/User');

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin, Editor)
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, coverImage, images, status, meta } = req.body;

    // Check if blog with same title exists
    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: 'Blog with this title already exists'
      });
    }

    // Generate excerpt if not provided
    const blogExcerpt = excerpt || content.substring(0, 150) + '...';

    const blog = await Blog.create({
      title,
      content,
      excerpt: blogExcerpt,
      author: req.user.id,
      category: category || 'news',
      tags: tags || [],
      coverImage: coverImage || {
        url: 'https://via.placeholder.com/1200x600',
        alt: title
      },
      images: images || [],
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null,
      meta: meta || {
        title: title,
        description: blogExcerpt,
        keywords: tags || []
      }
    });

    // Populate author details
    await blog.populate('author', 'name email profileImage');

    res.status(201).json({
      success: true,
      message: 'Blog created successfully',
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get all blogs (with filters)
// @route   GET /api/blogs
// @access  Public
const getBlogs = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      category, 
      tag, 
      status, 
      search,
      author,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    const query = {};

    // Filter by status (default to published for public)
    if (!req.user || req.user.role === 'tenant' || req.user.role === 'landlord') {
      query.status = 'published';
    } else if (status) {
      query.status = status;
    }

    // Filter by category
    if (category) {
      query.category = category;
    }

    // Filter by tag
    if (tag) {
      query.tags = tag;
    }

    // Filter by author
    if (author) {
      query.author = author;
    }

    // Search in title, content, excerpt
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { excerpt: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const blogs = await Blog.find(query)
      .populate('author', 'name email profileImage')
      .sort(sort)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

    // Get unique categories for filter
    const categories = await Blog.distinct('category', { status: 'published' });
    
    // Get popular tags
    const popularTags = await Blog.aggregate([
      { $match: { status: 'published' } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      filters: {
        categories,
        popularTags: popularTags.map(t => ({ tag: t._id, count: t.count }))
      },
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get single blog by ID or slug
// @route   GET /api/blogs/:identifier
// @access  Public
const getBlogById = async (req, res) => {
  try {
    const { identifier } = req.params;
    let blog;

    // Check if identifier is MongoDB ObjectId or slug
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      blog = await Blog.findById(identifier)
        .populate('author', 'name email profileImage bio');
    } else {
      blog = await Blog.findOne({ slug: identifier })
        .populate('author', 'name email profileImage bio');
    }

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is published or user has access
    if (blog.status !== 'published' && (!req.user || (req.user.role !== 'admin' && req.user.role !== 'editor' && req.user.role !== 'moderator'))) {
      return res.status(403).json({
        success: false,
        message: 'This blog is not published'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    // Get related blogs (same category or tags)
    const relatedBlogs = await Blog.find({
      _id: { $ne: blog._id },
      status: 'published',
      $or: [
        { category: blog.category },
        { tags: { $in: blog.tags } }
      ]
    })
    .populate('author', 'name')
    .limit(3)
    .select('title slug excerpt coverImage views createdAt');

    res.json({
      success: true,
      data: {
        ...blog.toObject(),
        related: relatedBlogs
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Update blog
// @route   PUT /api/blogs/:id
// @access  Private (Admin, Editor)
const updateBlog = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check permission (only author or admin can update)
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin' && req.user.role !== 'editor') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    // If publishing, set publishedAt
    if (updates.status === 'published' && blog.status !== 'published') {
      updates.publishedAt = new Date();
    }

    // Update excerpt if content changed and excerpt not provided
    if (updates.content && !updates.excerpt) {
      updates.excerpt = updates.content.substring(0, 150) + '...';
    }

    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).populate('author', 'name email');

    res.json({
      success: true,
      message: 'Blog updated successfully',
      data: updatedBlog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Delete blog
// @route   DELETE /api/blogs/:id
// @access  Private (Admin, Editor)
const deleteBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check permission (only author or admin can delete)
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this blog'
      });
    }

    await blog.deleteOne();

    res.json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Like/Unlike blog
// @route   POST /api/blogs/:id/like
// @access  Private
const likeBlog = async (req, res) => {
  try {
    const { id } = req.params;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is published
    if (blog.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot like unpublished blog'
      });
    }

    const hasLiked = blog.likes.includes(req.user.id);

    if (hasLiked) {
      // Unlike
      blog.likes = blog.likes.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      // Like
      blog.likes.push(req.user.id);
    }

    await blog.save();

    res.json({
      success: true,
      message: hasLiked ? 'Blog unliked' : 'Blog liked',
      likes: blog.likes.length
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Add comment to blog
// @route   POST /api/blogs/:id/comments
// @access  Public/Private
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { comment, name, email } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: 'Comment is required'
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Check if blog is published
    if (blog.status !== 'published') {
      return res.status(400).json({
        success: false,
        message: 'Cannot comment on unpublished blog'
      });
    }

    const newComment = {
      user: req.user ? req.user.id : null,
      name: name || (req.user ? req.user.name : 'Anonymous'),
      email: email || (req.user ? req.user.email : null),
      comment,
      approved: req.user ? true : false, // Auto-approve for logged in users
      createdAt: new Date()
    };

    blog.comments.push(newComment);
    await blog.save();

    res.status(201).json({
      success: true,
      message: 'Comment added successfully',
      data: newComment
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get blog comments
// @route   GET /api/blogs/:id/comments
// @access  Public
const getComments = async (req, res) => {
  try {
    const { id } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const blog = await Blog.findById(id).select('comments');
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Filter approved comments for public
    let comments = blog.comments;
    if (!req.user || req.user.role === 'tenant' || req.user.role === 'landlord') {
      comments = comments.filter(c => c.approved);
    }

    // Paginate comments
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedComments = comments
      .sort((a, b) => b.createdAt - a.createdAt)
      .slice(skip, skip + parseInt(limit));

    res.json({
      success: true,
      count: paginatedComments.length,
      total: comments.length,
      page: parseInt(page),
      pages: Math.ceil(comments.length / parseInt(limit)),
      data: paginatedComments
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Approve/Delete comment (Moderator only)
// @route   PUT /api/blogs/:id/comments/:commentId
// @access  Private (Admin, Moderator, Editor)
const moderateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { action } = req.body; // 'approve' or 'delete'

    if (!['approve', 'delete'].includes(action)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid action. Use "approve" or "delete"'
      });
    }

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    const comment = blog.comments.id(commentId);
    if (!comment) {
      return res.status(404).json({
        success: false,
        message: 'Comment not found'
      });
    }

    if (action === 'approve') {
      comment.approved = true;
      await blog.save();
      res.json({
        success: true,
        message: 'Comment approved successfully'
      });
    } else if (action === 'delete') {
      comment.deleteOne();
      await blog.save();
      res.json({
        success: true,
        message: 'Comment deleted successfully'
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get blog stats (Admin only)
// @route   GET /api/blogs/stats
// @access  Private (Admin, Editor)
const getBlogStats = async (req, res) => {
  try {
    const stats = await Blog.aggregate([
      {
        $group: {
          _id: null,
          totalBlogs: { $sum: 1 },
          totalViews: { $sum: '$views' },
          totalLikes: { $sum: { $size: '$likes' } },
          totalComments: { $sum: { $size: '$comments' } },
          published: {
            $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
          },
          drafts: {
            $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
          },
          archived: {
            $sum: { $cond: [{ $eq: ['$status', 'archived'] }, 1, 0] }
          }
        }
      }
    ]);

    const categoryStats = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const monthlyStats = await Blog.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 },
          views: { $sum: '$views' }
        }
      },
      { $sort: { '_id.year': -1, '_id.month': -1 } },
      { $limit: 12 }
    ]);

    const topAuthors = await Blog.aggregate([
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 },
          totalViews: { $sum: '$views' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'author'
        }
      },
      {
        $project: {
          author: { $arrayElemAt: ['$author', 0] },
          count: 1,
          totalViews: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: stats[0] || {
          totalBlogs: 0,
          totalViews: 0,
          totalLikes: 0,
          totalComments: 0,
          published: 0,
          drafts: 0,
          archived: 0
        },
        byCategory: categoryStats,
        monthly: monthlyStats,
        topAuthors: topAuthors.map(a => ({
          name: a.author?.name || 'Unknown',
          email: a.author?.email,
          blogs: a.count,
          views: a.totalViews
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

// @desc    Get blog by slug (public)
// @route   GET /api/blogs/slug/:slug
// @access  Public
const getBlogBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const blog = await Blog.findOne({ slug, status: 'published' })
      .populate('author', 'name email profileImage bio');

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json({
      success: true,
      data: blog
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get blogs by author
// @route   GET /api/blogs/author/:authorId
// @access  Public
const getBlogsByAuthor = async (req, res) => {
  try {
    const { authorId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find({ 
      author: authorId, 
      status: 'published' 
    })
    .populate('author', 'name email profileImage')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Blog.countDocuments({ author: authorId, status: 'published' });

    res.json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get blogs by category
// @route   GET /api/blogs/category/:category
// @access  Public
const getBlogsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find({ 
      category, 
      status: 'published' 
    })
    .populate('author', 'name email profileImage')
    .sort({ publishedAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const total = await Blog.countDocuments({ category, status: 'published' });

    res.json({
      success: true,
      count: blogs.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

// @desc    Get popular blogs
// @route   GET /api/blogs/popular
// @access  Public
const getPopularBlogs = async (req, res) => {
  try {
    const { limit = 5 } = req.query;

    const blogs = await Blog.find({ status: 'published' })
      .populate('author', 'name')
      .sort({ views: -1, likes: -1 })
      .limit(parseInt(limit))
      .select('title slug excerpt coverImage views createdAt');

    res.json({
      success: true,
      data: blogs
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
};

module.exports = {
  createBlog,
  getBlogs,
  getBlogById,
  getBlogBySlug,
  getBlogsByAuthor,
  getBlogsByCategory,
  getPopularBlogs,
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  getComments,
  moderateComment,
  getBlogStats
};