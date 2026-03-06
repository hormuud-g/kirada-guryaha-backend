const Blog = require('../models/Blog');

// @desc    Create new blog
// @route   POST /api/blogs
// @access  Private (Admin, Editor)
const createBlog = async (req, res) => {
  try {
    const { title, content, excerpt, category, tags, coverImage, status } = req.body;

    // Check if blog with same title exists
    const existingBlog = await Blog.findOne({ title });
    if (existingBlog) {
      return res.status(400).json({
        success: false,
        message: 'Blog with this title already exists'
      });
    }

    const blog = await Blog.create({
      title,
      content,
      excerpt: excerpt || content.substring(0, 150) + '...',
      author: req.user.id,
      category,
      tags: tags || [],
      coverImage,
      status: status || 'draft',
      publishedAt: status === 'published' ? new Date() : null
    });

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
    const { page = 1, limit = 10, category, tag, status, search } = req.query;
    const query = {};

    // Filter by status (default to published for public)
    if (!req.user || req.user.role === 'tenant') {
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

    // Search in title and content
    if (search) {
      query.$text = { $search: search };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const blogs = await Blog.find(query)
      .populate('author', 'name email profileImage')
      .sort({ publishedAt: -1, createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Blog.countDocuments(query);

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
    if (blog.status !== 'published' && (!req.user || req.user.role === 'tenant')) {
      return res.status(403).json({
        success: false,
        message: 'This blog is not published'
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
    if (blog.author.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to update this blog'
      });
    }

    // If publishing, set publishedAt
    if (updates.status === 'published' && blog.status !== 'published') {
      updates.publishedAt = new Date();
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

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
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

    const blog = await Blog.findById(id).select('comments');
    if (!blog) {
      return res.status(404).json({
        success: false,
        message: 'Blog not found'
      });
    }

    // Filter approved comments for public
    let comments = blog.comments;
    if (!req.user || req.user.role === 'tenant') {
      comments = comments.filter(c => c.approved);
    }

    res.json({
      success: true,
      count: comments.length,
      data: comments.sort((a, b) => b.createdAt - a.createdAt)
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
// @access  Private (Admin, Moderator)
const moderateComment = async (req, res) => {
  try {
    const { id, commentId } = req.params;
    const { action } = req.body; // 'approve' or 'delete'

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
    } else {
      res.status(400).json({
        success: false,
        message: 'Invalid action'
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
// @access  Private (Admin)
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
          }
        }
      }
    ]);

    const categoryStats = await Blog.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
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
          drafts: 0
        },
        byCategory: categoryStats
      }
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
  updateBlog,
  deleteBlog,
  likeBlog,
  addComment,
  getComments,
  moderateComment,
  getBlogStats
};