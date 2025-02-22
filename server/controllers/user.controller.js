// server/controllers/user.controller.js
const User = require('../models/user.model');
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

// Get user profile
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-password')
      .populate('following', 'username profilePicture')
      .populate('followers', 'username profilePicture')
      .populate('favoriteRestaurants', 'name images rating');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Get user's posts
    const posts = await Post.find({ user: req.params.id })
      .sort({ createdAt: -1 })
      .populate('restaurant', 'name address');

    res.status(200).json({
      success: true,
      data: {
        user,
        posts,
      },
    });
  } catch (error) {
    console.error('Get user profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Update user profile
exports.updateProfile = async (req, res) => {
  try {
    const { username, email, bio, profilePicture } = req.body;

    // Find user
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if username is already taken
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Username already taken',
        });
      }
    }

    // Check if email is already taken
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'Email already taken',
        });
      }
    }

    // Upload profile picture to S3 if provided
    let profilePictureUrl = user.profilePicture;
    if (profilePicture && profilePicture !== user.profilePicture) {
      profilePictureUrl = await uploadToS3(profilePicture, 'profile-pictures');
    }

    // Update user
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio !== undefined ? bio : user.bio;
    user.profilePicture = profilePictureUrl;

    // Save updated user
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        id: user._id,
        username: user.username,
        email: user.email,
        bio: user.bio,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Follow/unfollow user
exports.followUser = async (req, res) => {
  try {
    const userToFollow = await User.findById(req.params.id);
    const currentUser = await User.findById(req.user.id);

    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if users are the same
    if (req.params.id === req.user.id.toString()) {
      return res.status(400).json({
        success: false,
        message: 'You cannot follow yourself',
      });
    }

    // Check if already following
    const isFollowing = currentUser.following.includes(req.params.id);

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(
        id => id.toString() !== req.params.id
      );
      userToFollow.followers = userToFollow.followers.filter(
        id => id.toString() !== req.user.id.toString()
      );
    } else {
      // Follow
      currentUser.following.push(req.params.id);
      userToFollow.followers.push(req.user.id);
    }

    // Save both users
    await Promise.all([currentUser.save(), userToFollow.save()]);

    res.status(200).json({
      success: true,
      data: {
        isFollowing: !isFollowing,
        message: isFollowing ? 'User unfollowed' : 'User followed',
      },
    });
  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get user followers
exports.getFollowers = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('followers', 'username profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.followers,
    });
  } catch (error) {
    console.error('Get followers error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Get user following
exports.getFollowing = async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .populate('following', 'username profilePicture bio');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user.following,
    });
  } catch (error) {
    console.error('Get following error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Add restaurant to favorites
exports.addFavoriteRestaurant = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    // Check if restaurant is already in favorites
    const isAlreadyFavorite = user.favoriteRestaurants.includes(req.params.restaurantId);

    if (isAlreadyFavorite) {
      // Remove from favorites
      user.favoriteRestaurants = user.favoriteRestaurants.filter(
        id => id.toString() !== req.params.restaurantId
      );
    } else {
      // Add to favorites
      user.favoriteRestaurants.push(req.params.restaurantId);
    }

    // Save user
    await user.save();

    res.status(200).json({
      success: true,
      data: {
        isFavorite: !isAlreadyFavorite,
        message: isAlreadyFavorite
          ? 'Restaurant removed from favorites'
          : 'Restaurant added to favorites',
      },
    });
  } catch (error) {
    console.error('Add favorite restaurant error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

// Search users
exports.searchUsers = async (req, res) => {
  try {
    const { query } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Search users by username or email
    const users = await User.find({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    })
      .select('username profilePicture bio')
      .skip(skip)
      .limit(limit);

    // Get total count for pagination
    const total = await User.countDocuments({
      $or: [
        { username: { $regex: query, $options: 'i' } },
        { email: { $regex: query, $options: 'i' } },
      ],
    });

    res.status(200).json({
      success: true,
      data: users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};