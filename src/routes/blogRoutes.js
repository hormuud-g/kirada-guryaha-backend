const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const {
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
} = require('../controllers/blogController');

// ==================== Public Routes ====================
router.get('/', getBlogs);
router.get('/popular', getPopularBlogs);
router.get('/category/:category', getBlogsByCategory);
router.get('/author/:authorId', getBlogsByAuthor);
router.get('/slug/:slug', getBlogBySlug);
router.get('/:identifier', getBlogById);
router.get('/:id/comments', getComments);

// ==================== Protected Routes ====================
router.post('/:id/like', protect, likeBlog);
router.post('/:id/comments', addComment); // Public can comment with name/email

// ==================== Admin/Editor Routes ====================
router.post('/', protect, authorize('admin', 'editor'), createBlog);
router.put('/:id', protect, authorize('admin', 'editor'), updateBlog);
router.delete('/:id', protect, authorize('admin', 'editor'), deleteBlog);
router.get('/stats/all', protect, authorize('admin', 'editor'), getBlogStats);

// ==================== Moderator Routes ====================
router.put('/:id/comments/:commentId', protect, authorize('admin', 'moderator', 'editor'), moderateComment);

module.exports = router;