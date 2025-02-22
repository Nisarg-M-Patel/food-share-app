// server/routes/restaurant.routes.js
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurant.controller');
const auth = require('../middleware/auth.middleware');

// Create a new restaurant
// POST /api/restaurants
router.post('/', auth, restaurantController.createRestaurant);

// Get all restaurants (with pagination)
// GET /api/restaurants
router.get('/', restaurantController.getRestaurants);

// Get nearby restaurants based on user location
// GET /api/restaurants/nearby?latitude=xx&longitude=yy&radius=5
router.get('/nearby', restaurantController.getNearbyRestaurants);

// Search restaurants
// GET /api/restaurants/search?query=xxx
router.get('/search', restaurantController.searchRestaurants);

// Get restaurant by ID
// GET /api/restaurants/:id
router.get('/:id', restaurantController.getRestaurantById);

// Update restaurant
// PUT /api/restaurants/:id
router.put('/:id', auth, restaurantController.updateRestaurant);

// Add menu item to restaurant
// POST /api/restaurants/:id/menu
router.post('/:id/menu', auth, restaurantController.addMenuItem);

// Add review to restaurant
// POST /api/restaurants/:id/reviews
router.post('/:id/reviews', auth, restaurantController.addReview);

module.exports = router;