// server/routes/user.routes.js
const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const auth = require('../middleware/auth.middleware');

// Get user profile
// GET /api/users/:id
router.get('/:id', userController.getUserProfile);

// Update user profile
// PUT /api/users/profile
router.put('/profile', auth, userController.updateProfile);

// Follow/unfollow user
// PUT /api/users/:id/follow
router.put('/:id/follow', auth, userController.followUser);

// Get user followers
// GET /api/users/:id/followers
router.get('/:id/followers', userController.getFollowers);

// Get user following
// GET /api/users/:id/following
router.get('/:id/following', userController.getFollowing);

// Add restaurant to favorites
// PUT /api/users/favorites/:restaurantId
router.put('/favorites/:restaurantId', auth, userController.addFavoriteRestaurant);

// Search users
// GET /api/users/search?query=xxx
router.get('/search', userController.searchUsers);

module.exports = router;