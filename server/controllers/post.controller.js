// server/controllers/post.controller.js
const Post = require('../models/post.model');
const Restaurant = require('../models/restaurant.model');
const User = require('../models/user.model');
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

// Create a new post
exports.createPost = async (req, res) => {
  try {
    const { 
      restaurantId, 
      dishName, 
      dishDescription, 
      dishPrice, 
      tags, 
      dishImage, 
      restaurantImage,
      latitude,
      longitude
    } = req.body;

    // Upload images to S3
    const dishImageUrl = await uploadToS3(dishImage, 'dishes');
    let restaurantImageUrl = null;
    if (restaurantImage) {
      restaurantImageUrl = await uploadToS3(restaurantImage, 'restaurants');
    }

    // Find or create restaurant
    let restaurant = await Restaurant.findById(restaurantId);
    
    // Create new post
    const newPost = new Post({
      user: req.user.id,
      restaurant: restaurant._id,
      dish: {
        name: dishName,
        description: dishDescription,
        price: dishPrice,
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      },
      image: dishImageUrl,
      restaurantImage: restaurantImageUrl,
      location: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    });

    // Save post
    await newPost.save();

    // Update restaurant menu if the dish doesn't exist
    const existingMenuItem = restaurant.menu.find(
      item => item.name.toLowerCase() === dishName.toLowerCase()
    );

    if (!existingMenuItem) {
      restaurant.menu.push({
        name: dishName,
        description: dishDescription,
        price: dishPrice,
        category: 'Uncategorized',
        images: [dishImageUrl],
        contributors: [req.user.id],
        posts: [newPost._id],
        tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      });
    } else {
      // Update existing menu item
      existingMenuItem.images.push(dishImageUrl);
      if (!existingMenuItem.contributors.includes(req.user.id)) {
        existingMenuItem.contributors.push(req.user.id);
      }
      existingMenuItem.posts.push(newPost._id);
    }

    // Add restaurant image if provided
    if (restaurantImageUrl && !restaurant.images.includes(restaurantImageUrl)) {
      restaurant.images.push(restaurantImageUrl);
    }

    await restaurant.save();

    // Populate user and restaurant details
    const populatedPost = await Post.findById(newPost._id)
      .populate('user', 'username profilePicture')
      .populate('restaurant', 'name address');

    res.status(201).json({
      success: true,
      data: populatedPost,
    });
  } catch (error) {
    console.error('Create post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get all posts (with pagination)
exports.getPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('restaurant', 'name address');

    // Get total count for pagination
    const total = await Post.countDocuments();

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get posts from users the current user follows
exports.getFeedPosts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get current user
    const currentUser = await User.findById(req.user.id);
    
    // Get posts from users the current user follows
    const posts = await Post.find({
      user: { $in: [...currentUser.following, req.user.id] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('restaurant', 'name address');

    // Get total count for pagination
    const total = await Post.countDocuments({
      user: { $in: [...currentUser.following, req.user.id] },
    });

    res.status(200).json({
      success: true,
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get feed posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get nearby posts based on user location
exports.getNearbyPosts = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5 } = req.query; // radius in km
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Find posts near the location
    const posts = await Post.find({
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
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user', 'username profilePicture')
      .populate('restaurant', 'name address');

    // Get total count for pagination (this might be expensive for large datasets)
    const total = await Post.countDocuments({
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
      data: posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Get nearby posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get post by ID
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('restaurant', 'name address')
      .populate('comments.user', 'username profilePicture');

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    res.status(200).json({
      success: true,
      data: post,
    });
  } catch (error) {
    console.error('Get post by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Like/unlike a post
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if the post has already been liked by the user
    const alreadyLiked = post.likes.includes(req.user.id);

    // If already liked, remove the like, otherwise add it
    if (alreadyLiked) {
      post.likes = post.likes.filter(
        userId => userId.toString() !== req.user.id
      );
    } else {
      post.likes.push(req.user.id);
    }

    await post.save();

    res.status(200).json({
      success: true,
      data: post,
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
    });
  } catch (error) {
    console.error('Like post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Add comment to a post
exports.addComment = async (req, res) => {
  try {
    const { text } = req.body;
    
    if (!text) {
      return res.status(400).json({
        success: false,
        message: 'Comment text is required',
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Add comment
    post.comments.push({
      user: req.user.id,
      text,
    });

    await post.save();

    // Get updated post with populated comments
    const updatedPost = await Post.findById(req.params.id)
      .populate('comments.user', 'username profilePicture');

    res.status(200).json({
      success: true,
      data: updatedPost.comments,
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Delete a post
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found',
      });
    }

    // Check if the user is the post owner
    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to delete this post',
      });
    }

    // Remove post
    await post.remove();

    res.status(200).json({
      success: true,
      message: 'Post deleted successfully',
    });
  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};