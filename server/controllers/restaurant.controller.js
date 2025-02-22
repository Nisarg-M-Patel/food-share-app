// server/controllers/restaurant.controller.js
const Restaurant = require('../models/restaurant.model');
const Post = require('../models/post.model');
const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
});

const s3 = new AWS.S3();

// Upload image to S3
const uploadToS3 = async (base64Image, folder) => {
  // Remove data:image/jpeg;base64, from the string
  const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');
  const buffer = Buffer.from(base64Data, 'base64');
  
  const params = {
    Bucket: process.env.S3_BUCKET_NAME,
    Key: `${folder}/${uuidv4()}.jpg`,
    Body: buffer,
    ContentEncoding: 'base64',
    ContentType: 'image/jpeg',
    ACL: 'public-read',
  };
  
  const { Location } = await s3.upload(params).promise();
  return Location;
};

// Create a new restaurant
exports.createRestaurant = async (req, res) => {
  try {
    const { 
      name, 
      street, 
      city, 
      state, 
      zipCode, 
      country,
      latitude,
      longitude,
      phone,
      website,
      cuisine,
      priceRange,
      image
    } = req.body;

    // Check if restaurant already exists
    const existingRestaurant = await Restaurant.findOne({ 
      name, 
      'address.street': street,
      'address.city': city
    });

    if (existingRestaurant) {
      return res.status(400).json({
        success: false,
        message: 'Restaurant already exists',
        data: existingRestaurant,
      });
    }

    // Upload image to S3 if provided
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToS3(image, 'restaurants');
    }

    // Create new restaurant
    const newRestaurant = new Restaurant({
      name,
      address: {
        street,
        city,
        state,
        zipCode,
        country,
      },
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
      phone,
      website,
      cuisine: cuisine ? cuisine.split(',').map(item => item.trim()) : [],
      priceRange,
      images: imageUrl ? [imageUrl] : [],
    });

    // Save restaurant
    await newRestaurant.save();

    res.status(201).json({
      success: true,
      data: newRestaurant,
    });
  } catch (error) {
    console.error('Create restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all restaurants (with pagination)
exports.getRestaurants = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const restaurants = await Restaurant.find()
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Restaurant.countDocuments();

    res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get nearby restaurants based on user location
exports.getNearbyRestaurants = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in km
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find restaurants near the location
    const restaurants = await Restaurant.find({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1000, // convert km to meters
        },
      },
    })
      .sort({ name: 1 })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Restaurant.countDocuments({
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)],
          },
          $maxDistance: radius * 1000,
        },
      },
    });

    res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get nearby restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Search restaurants
exports.searchRestaurants = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search restaurants using text index
    const restaurants = await Restaurant.find(
      { $text: { $search: query } },
      { score: { $meta: 'textScore' } }
    )
      .sort({ score: { $meta: 'textScore' } })
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await Restaurant.countDocuments({ $text: { $search: query } });

    res.status(200).json({
      success: true,
      data: restaurants,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search restaurants error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get restaurant by ID
exports.getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Get recent posts for this restaurant
    const recentPosts = await Post.find({ restaurant: req.params.id })
      .sort({ createdAt: -1 })
      .limit(10)
      .populate('user', 'username profilePicture');

    res.status(200).json({
      success: true,
      data: {
        restaurant,
        recentPosts,
      },
    });
  } catch (error) {
    console.error('Get restaurant by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update restaurant
exports.updateRestaurant = async (req, res) => {
  try {
    const { 
      name, 
      street, 
      city, 
      state, 
      zipCode, 
      country,
      latitude,
      longitude,
      phone,
      website,
      cuisine,
      priceRange,
      hours,
      image
    } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Upload image to S3 if provided
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToS3(image, 'restaurants');
      if (!restaurant.images.includes(imageUrl)) {
        restaurant.images.push(imageUrl);
      }
    }

    // Update restaurant
    if (name) restaurant.name = name;
    if (street || city || state || zipCode || country) {
      restaurant.address = {
        street: street || restaurant.address.street,
        city: city || restaurant.address.city,
        state: state || restaurant.address.state,
        zipCode: zipCode || restaurant.address.zipCode,
        country: country || restaurant.address.country,
      };
    }
    if (latitude && longitude) {
      restaurant.location = {
        type: 'Point',
        coordinates: [longitude, latitude],
      };
    }
    if (phone) restaurant.phone = phone;
    if (website) restaurant.website = website;
    if (cuisine) {
      restaurant.cuisine = cuisine.split(',').map(item => item.trim());
    }
    if (priceRange) restaurant.priceRange = priceRange;
    if (hours) restaurant.hours = hours;

    // Save updated restaurant
    await restaurant.save();

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Update restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Add menu item to restaurant
exports.addMenuItem = async (req, res) => {
  try {
    const { 
      name, 
      description, 
      price, 
      category,
      image,
      tags
    } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Check if menu item already exists
    const existingMenuItem = restaurant.menu.find(
      item => item.name.toLowerCase() === name.toLowerCase()
    );

    // Upload image to S3 if provided
    let imageUrl = null;
    if (image) {
      imageUrl = await uploadToS3(image, 'menu-items');
    }

    if (existingMenuItem) {
      // Update existing menu item
      existingMenuItem.description = description || existingMenuItem.description;
      existingMenuItem.price = price || existingMenuItem.price;
      existingMenuItem.category = category || existingMenuItem.category;
      if (imageUrl && !existingMenuItem.images.includes(imageUrl)) {
        existingMenuItem.images.push(imageUrl);
      }
      if (tags) {
        const newTags = tags.split(',').map(tag => tag.trim());
        newTags.forEach(tag => {
          if (!existingMenuItem.tags.includes(tag)) {
            existingMenuItem.tags.push(tag);
          }
        });
      }
      if (!existingMenuItem.contributors.includes(req.user.id)) {
        existingMenuItem.contributors.push(req.user.id);
      }
    } else {
      // Add new menu item
      restaurant.menu.push({
        name,
        description,
        price,
        category: category || 'Uncategorized',
        images: imageUrl ? [imageUrl] : [],
        contributors: [req.user.id],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
    }

    // Save updated restaurant
    await restaurant.save();

    res.status(200).json({
      success: true,
      data: restaurant,
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Add review to restaurant
exports.addReview = async (req, res) => {
  try {
    const { text, rating } = req.body;

    // Find restaurant
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: 'Restaurant not found',
      });
    }

    // Check if user has already reviewed this restaurant
    const existingReview = restaurant.reviews.find(
      review => review.user.toString() === req.user.id
    );

    if (existingReview) {
      // Update existing review
      existingReview.text = text;
      existingReview.rating = rating;
      existingReview.createdAt = Date.now();
    } else {
      // Add new review
      restaurant.reviews.push({
        user: req.user.id,
        text,
        rating,
      });
    }

    // Calculate new average rating
    const totalRating = restaurant.reviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    restaurant.rating = totalRating / restaurant.reviews.length;

    // Save updated restaurant
    await restaurant.save();

    // Get updated restaurant with populated reviews
    const updatedRestaurant = await Restaurant.findById(req.params.id)
      .populate('reviews.user', 'username profilePicture');

    res.status(200).json({
      success: true,
      data: updatedRestaurant,
    });
  } catch (error) {
    console.error('Add review error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};