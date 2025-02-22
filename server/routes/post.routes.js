// server/routes/post.routes.js
const express = require('express');
const router = express.Router();
const postController = require('../controllers/post.controller');
const auth = require('../middleware/auth.middleware');

// Create a new post
// POST /api/posts
router.post('/', auth, postController.createPost);

// Get all posts (with pagination)
// GET /api/posts
router.get('/', postController.getPosts);

// Get posts from users the current user follows
// GET /api/posts/feed
router.get('/feed', auth, postController.getFeedPosts);

// Get nearby posts based on user location
// GET /api/posts/nearby?latitude=xx&longitude=yy&radius=5
router.get('/nearby', postController.getNearbyPosts);

// Get post by ID
// GET /api/posts/:id
router.get('/:id', postController.getPostById);

// Like/unlike a post
// PUT /api/posts/:id/like
router.put('/:id/like', auth, postController.likePost);

// Add comment to a post
// POST /api/posts/:id/comments
router.post('/:id/comments', auth, postController.addComment);

// Delete a post
// DELETE /api/posts/:id
router.delete('/:id', auth, postController.deletePost);

module.exports = router;