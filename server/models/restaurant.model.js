// server/models/restaurant.model.js
const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    default: '',
  },
  price: {
    type: Number,
  },
  category: {
    type: String,
  },
  images: [String],
  // Track the users who contributed to this menu item
  contributors: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  // Track the posts that feature this menu item
  posts: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post',
    },
  ],
  tags: [String],
});

const restaurantSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    location: {
      type: {
        type: String,
        enum: ['Point'],
        default: 'Point',
      },
      coordinates: {
        type: [Number],
        default: [0, 0],
      },
    },
    menu: [menuItemSchema],
    images: [String],
    phone: String,
    website: String,
    hours: {
      monday: { open: String, close: String },
      tuesday: { open: String, close: String },
      wednesday: { open: String, close: String },
      thursday: { open: String, close: String },
      friday: { open: String, close: String },
      saturday: { open: String, close: String },
      sunday: { open: String, close: String },
    },
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    reviews: [
      {
        user: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User',
        },
        text: String,
        rating: {
          type: Number,
          min: 0,
          max: 5,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    cuisine: [String],
    priceRange: {
      type: String,
      enum: ['$', '$$', '$$$', '$$$$'],
    },
  },
  { timestamps: true }
);

// Create index for geospatial queries
restaurantSchema.index({ location: '2dsphere' });
// Create text index for search
restaurantSchema.index({ name: 'text', 'menu.name': 'text', cuisine: 'text' });

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;