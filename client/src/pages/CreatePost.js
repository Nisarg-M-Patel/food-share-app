// client/src/pages/CreatePost.js
import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import Camera from '../components/Camera';
import Navbar from '../components/Navbar';
import { FaCamera, FaMapMarkerAlt, FaTag, FaDollarSign } from 'react-icons/fa';

const CreatePost = () => {
  const { isAuthenticated } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [showDishCamera, setShowDishCamera] = useState(false);
  const [showRestaurantCamera, setShowRestaurantCamera] = useState(false);
  const [dishImage, setDishImage] = useState(null);
  const [restaurantImage, setRestaurantImage] = useState(null);
  const [dishName, setDishName] = useState('');
  const [dishDescription, setDishDescription] = useState('');
  const [dishPrice, setDishPrice] = useState('');
  const [tags, setTags] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRestaurant, setSelectedRestaurant] = useState(null);
  const [isCreatingRestaurant, setIsCreatingRestaurant] = useState(false);
  const [newRestaurant, setNewRestaurant] = useState({
    name: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
  });
  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if user is authenticated
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }, []);

  // Handle dish image capture
  const handleDishCapture = (imageSrc) => {
    setDishImage(imageSrc);
    setShowDishCamera(false);
  };

  // Handle restaurant image capture
  const handleRestaurantCapture = (imageSrc) => {
    setRestaurantImage(imageSrc);
    setShowRestaurantCamera(false);
  };

  // Search restaurants
  const searchRestaurants = async () => {
    if (!searchQuery.trim()) return;
    
    try {
      const res = await axios.get(`/api/restaurants/search?query=${searchQuery}`);
      setSearchResults(res.data.data);
    } catch (err) {
      console.error('Error searching restaurants:', err);
      setError('Error searching restaurants. Please try again.');
    }
  };

  // Handle restaurant selection
  const handleSelectRestaurant = (restaurant) => {
    setSelectedRestaurant(restaurant);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Handle creating a new restaurant
  const handleCreateRestaurant = async () => {
    if (!newRestaurant.name || !newRestaurant.city) {
      setError('Restaurant name and city are required');
      return;
    }
    
    try {
      const restaurantData = {
        ...newRestaurant,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
        image: restaurantImage,
      };
      
      const res = await axios.post('/api/restaurants', restaurantData);
      setSelectedRestaurant(res.data.data);
      setIsCreatingRestaurant(false);
      setNewRestaurant({
        name: '',
        street: '',
        city: '',
        state: '',
        zipCode: '',
        country: '',
      });
    } catch (err) {
      console.error('Error creating restaurant:', err);
      setError('Error creating restaurant. Please try again.');
    }
  };

  // Handle post creation
  const handleCreatePost = async () => {
    if (!dishImage) {
      setError('Dish image is required');
      return;
    }
    
    if (!dishName.trim()) {
      setError('Dish name is required');
      return;
    }
    
    if (!selectedRestaurant) {
      setError('Please select or create a restaurant');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const postData = {
        restaurantId: selectedRestaurant._id,
        dishName,
        dishDescription,
        dishPrice: dishPrice ? parseFloat(dishPrice) : null,
        tags,
        dishImage,
        restaurantImage,
        latitude: userLocation?.latitude,
        longitude: userLocation?.longitude,
      };
      
      const res = await axios.post('/api/posts', postData);
      
      // Redirect to the new post
      navigate(`/post/${res.data.data._id}`);
    } catch (err) {
      console.error('Error creating post:', err);
      setError('Error creating post. Please try again.');
      setIsLoading(false);
    }
  };

  return (
    <div className="create-post-container">
      <Navbar />
      
      {showDishCamera && (
        <Camera
          onCapture={handleDishCapture}
          onClose={() => setShowDishCamera(false)}
        />
      )}
      
      {showRestaurantCamera && (
        <Camera
          onCapture={handleRestaurantCapture}
          onClose={() => setShowRestaurantCamera(false)}
        />
      )}
      
      <div className="create-post-content">
        <h1>Share Your Food Discovery</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="create-post-form">
          <div className="form-section">
            <h2>Dish Photos</h2>
            <div className="photo-upload-area">
              <div className="dish-photo">
                {dishImage ? (
                  <div className="photo-preview">
                    <img src={dishImage} alt="Dish" />
                    <button
                      className="retake-btn"
                      onClick={() => setShowDishCamera(true)}
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    className="camera-btn"
                    onClick={() => setShowDishCamera(true)}
                  >
                    <FaCamera />
                    <span>Take Dish Photo</span>
                  </button>
                )}
              </div>
              
              <div className="restaurant-photo">
                {restaurantImage ? (
                  <div className="photo-preview">
                    <img src={restaurantImage} alt="Restaurant" />
                    <button
                      className="retake-btn"
                      onClick={() => setShowRestaurantCamera(true)}
                    >
                      Retake
                    </button>
                  </div>
                ) : (
                  <button
                    className="camera-btn"
                    onClick={() => setShowRestaurantCamera(true)}
                  >
                    <FaCamera />
                    <span>Take Restaurant Photo (Optional)</span>
                  </button>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Dish Information</h2>
            <div className="form-group">
              <label htmlFor="dishName">Dish Name*</label>
              <input
                type="text"
                id="dishName"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                placeholder="What's this dish called?"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="dishDescription">Description</label>
              <textarea
                id="dishDescription"
                value={dishDescription}
                onChange={(e) => setDishDescription(e.target.value)}
                placeholder="How was it? What did it taste like?"
                rows={3}
              />
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="dishPrice">
                  <FaDollarSign /> Price
                </label>
                <input
                  type="number"
                  id="dishPrice"
                  value={dishPrice}
                  onChange={(e) => setDishPrice(e.target.value)}
                  placeholder="$0.00"
                  step="0.01"
                  min="0"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="tags">
                  <FaTag /> Tags
                </label>
                <input
                  type="text"
                  id="tags"
                  value={tags}
                  onChange={(e) => setTags(e.target.value)}
                  placeholder="spicy, vegan, dessert, etc. (comma separated)"
                />
              </div>
            </div>
          </div>
          
          <div className="form-section">
            <h2>Restaurant</h2>
            
            {selectedRestaurant ? (
              <div className="selected-restaurant">
                <div className="restaurant-info">
                  <h3>{selectedRestaurant.name}</h3>
                  {selectedRestaurant.address && (
                    <p className="restaurant-address">
                      {selectedRestaurant.address.street &&
                        `${selectedRestaurant.address.street}, `}
                      {selectedRestaurant.address.city}, {selectedRestaurant.address.state}{' '}
                      {selectedRestaurant.address.zipCode}
                    </p>
                  )}
                </div>
                <button
                  className="change-restaurant-btn"
                  onClick={() => setSelectedRestaurant(null)}
                >
                  Change
                </button>
              </div>
            ) : isCreatingRestaurant ? (
              <div className="create-restaurant-form">
                <div className="form-group">
                  <label htmlFor="restaurantName">Restaurant Name*</label>
                  <input
                    type="text"
                    id="restaurantName"
                    value={newRestaurant.name}
                    onChange={(e) =>
                      setNewRestaurant({ ...newRestaurant, name: e.target.value })
                    }
                    placeholder="Restaurant name"
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="street">Street Address</label>
                  <input
                    type="text"
                    id="street"
                    value={newRestaurant.street}
                    onChange={(e) =>
                      setNewRestaurant({ ...newRestaurant, street: e.target.value })
                    }
                    placeholder="123 Main St"
                  />
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="city">City*</label>
                    <input
                      type="text"
                      id="city"
                      value={newRestaurant.city}
                      onChange={(e) =>
                        setNewRestaurant({ ...newRestaurant, city: e.target.value })
                      }
                      placeholder="City"
                      required
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="state">State/Province*</label>
                    <input
                      type="text"
                      id="state"
                      value={newRestaurant.state}
                      onChange={(e) =>
                        setNewRestaurant({ ...newRestaurant, state: e.target.value })
                      }
                      placeholder="State"
                      required
                    />
                  </div>
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="zipCode">Zip/Postal Code</label>
                    <input
                      type="text"
                      id="zipCode"
                      value={newRestaurant.zipCode}
                      onChange={(e) =>
                        setNewRestaurant({
                          ...newRestaurant,
                          zipCode: e.target.value,
                        })
                      }
                      placeholder="12345"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label htmlFor="country">Country</label>
                    <input
                      type="text"
                      id="country"
                      value={newRestaurant.country}
                      onChange={(e) =>
                        setNewRestaurant({
                          ...newRestaurant,
                          country: e.target.value,
                        })
                      }
                      placeholder="Country"
                    />
                  </div>
                </div>
                
                <div className="form-actions">
                  <button
                    type="button"
                    className="cancel-btn"
                    onClick={() => setIsCreatingRestaurant(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="create-btn"
                    onClick={handleCreateRestaurant}
                  >
                    Create Restaurant
                  </button>
                </div>
              </div>
            ) : (
              <div className="restaurant-search">
                <div className="search-box">
                  <FaMapMarkerAlt className="search-icon" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search for a restaurant..."
                  />
                  <button
                    type="button"
                    className="search-btn"
                    onClick={searchRestaurants}
                  >
                    Search
                  </button>
                </div>
                
                {searchResults.length > 0 && (
                  <div className="search-results">
                    {searchResults.map((restaurant) => (
                      <div
                        key={restaurant._id}
                        className="restaurant-item"
                        onClick={() => handleSelectRestaurant(restaurant)}
                      >
                        <h3>{restaurant.name}</h3>
                        {restaurant.address && (
                          <p className="restaurant-address">
                            {restaurant.address.street &&
                              `${restaurant.address.street}, `}
                            {restaurant.address.city}, {restaurant.address.state}{' '}
                            {restaurant.address.zipCode}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="create-restaurant">
                  <p>Can't find the restaurant?</p>
                  <button
                    type="button"
                    className="create-restaurant-btn"
                    onClick={() => setIsCreatingRestaurant(true)}
                  >
                    Add a New Restaurant
                  </button>
                </div>
              </div>
            )}
          </div>
          
          <div className="form-actions">
            <button
              type="button"
              className="cancel-btn"
              onClick={() => navigate('/')}
            >
              Cancel
            </button>
            <button
              type="button"
              className="post-btn"
              onClick={handleCreatePost}
              disabled={isLoading || !dishImage || !dishName || !selectedRestaurant}
            >
              {isLoading ? 'Posting...' : 'Share Post'}
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .create-post-container {
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .create-post-content {
          max-width: 800px;
          margin: 70px auto 30px;
          padding: 20px;
        }

        h1 {
          text-align: center;
          margin-bottom: 30px;
          color: #333;
        }

        .error-message {
          background-color: #ffe3e3;
          color: #e41e3f;
          padding: 15px;
          border-radius: 5px;
          margin-bottom: 20px;
          text-align: center;
        }

        .create-post-form {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .form-section {
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .form-section h2 {
          margin-bottom: 20px;
          font-size: 18px;
          color: #333;
        }

        .photo-upload-area {
          display: flex;
          gap: 20px;
        }

        .dish-photo,
        .restaurant-photo {
          flex: 1;
          height: 200px;
          border: 2px dashed #ddd;
          border-radius: 10px;
          display: flex;
          justify-content: center;
          align-items: center;
          overflow: hidden;
        }

        .camera-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          background: none;
          border: none;
          color: #666;
          cursor: pointer;
          padding: 20px;
          width: 100%;
          height: 100%;
        }

        .camera-btn svg {
          font-size: 30px;
        }

        .photo-preview {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .photo-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .retake-btn {
          position: absolute;
          bottom: 10px;
          right: 10px;
          background-color: rgba(0, 0, 0, 0.7);
          color: white;
          border: none;
          border-radius: 5px;
          padding: 5px 10px;
          cursor: pointer;
        }

        .form-group {
          margin-bottom: 20px;
        }

        .form-row {
          display: flex;
          gap: 20px;
        }

        .form-row .form-group {
          flex: 1;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 500;
          color: #333;
        }

        input,
        textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 5px;
          font-size: 16px;
          transition: border-color 0.3s;
        }

        input:focus,
        textarea:focus {
          border-color: #ff6b6b;
          outline: none;
        }

        .restaurant-search {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background-color: #f5f5f5;
          border-radius: 5px;
          padding: 5px 10px;
        }

        .search-icon {
          color: #666;
          margin-right: 10px;
        }

        .search-box input {
          flex: 1;
          border: none;
          background: none;
          padding: 10px 0;
        }

        .search-btn {
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 8px 15px;
          cursor: pointer;
        }

        .search-results {
          max-height: 300px;
          overflow-y: auto;
          border: 1px solid #ddd;
          border-radius: 5px;
        }

        .restaurant-item {
          padding: 15px;
          border-bottom: 1px solid #f0f0f0;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .restaurant-item:hover {
          background-color: #f9f9f9;
        }

        .restaurant-item h3 {
          margin: 0 0 5px;
          font-size: 16px;
        }

        .restaurant-address {
          margin: 0;
          color: #666;
          font-size: 14px;
        }

        .create-restaurant {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          margin-top: 10px;
        }

        .create-restaurant p {
          margin: 0;
          color: #666;
        }

        .create-restaurant-btn {
          background: none;
          border: none;
          color: #ff6b6b;
          font-weight: 500;
          cursor: pointer;
          padding: 5px;
        }

        .selected-restaurant {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          background-color: #f9f9f9;
          border-radius: 5px;
        }

        .restaurant-info h3 {
          margin: 0 0 5px;
        }

        .change-restaurant-btn {
          background: none;
          border: none;
          color: #ff6b6b;
          cursor: pointer;
        }

        .create-restaurant-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          padding: 20px;
        }

        .cancel-btn {
          background-color: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 5px;
          padding: 12px 20px;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .cancel-btn:hover {
          background-color: #eaeaea;
        }

        .post-btn,
        .create-btn {
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 12px 25px;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        .post-btn:hover,
        .create-btn:hover {
          background-color: #ff5252;
        }

        .post-btn:disabled {
          background-color: #ffb6b6;
          cursor: not-allowed;
        }

        @media (max-width: 768px) {
          .photo-upload-area {
            flex-direction: column;
          }
          
          .form-row {
            flex-direction: column;
            gap: 10px;
          }
        }
      `}</style>
    </div>
  );
};

export default CreatePost;