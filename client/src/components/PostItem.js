// client/src/components/PostItem.js
import React, { useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';
import { FaHeart, FaRegHeart, FaComment, FaMapMarkerAlt } from 'react-icons/fa';
import moment from 'moment';

const PostItem = ({ post }) => {
  const { isAuthenticated, user } = useContext(AuthContext);
  
  const [likes, setLikes] = useState(post.likes || []);
  const [comments, setComments] = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if the current user has liked the post
  const isLiked = isAuthenticated && likes.some(like => like === user._id);

  // Handle like/unlike
  const handleLike = async () => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    try {
      const res = await axios.put(`/api/posts/${post._id}/like`);
      
      // Update likes state based on API response
      setLikes(res.data.data.likes);
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/login';
      return;
    }
    
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await axios.post(`/api/posts/${post._id}/comments`, {
        text: commentText,
      });
      
      // Update comments state and clear input
      setComments(res.data.data);
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="post-item">
      <div className="post-header">
        <Link to={`/profile/${post.user._id}`} className="user-link">
          <img
            src={post.user.profilePicture || '/default-avatar.png'}
            alt={post.user.username}
            className="user-avatar"
          />
          <span className="username">{post.user.username}</span>
        </Link>
        <span className="post-time">{moment(post.createdAt).fromNow()}</span>
      </div>
      
      <Link to={`/post/${post._id}`} className="post-content-link">
        <div className="post-content">
          <div className="post-images">
            <div className="dish-image-container">
              <img
                src={post.image}
                alt={post.dish.name}
                className="dish-image"
              />
              <div className="dish-name">{post.dish.name}</div>
            </div>
            
            {post.restaurantImage && (
              <div className="restaurant-image-container">
                <img
                  src={post.restaurantImage}
                  alt={post.restaurant.name}
                  className="restaurant-image"
                />
              </div>
            )}
          </div>
          
          <div className="post-details">
            <div className="dish-info">
              <h3>{post.dish.name}</h3>
              {post.dish.price && (
                <span className="dish-price">${post.dish.price.toFixed(2)}</span>
              )}
            </div>
            
            {post.dish.description && (
              <p className="dish-description">{post.dish.description}</p>
            )}
            
            <Link to={`/restaurant/${post.restaurant._id}`} className="restaurant-link">
              <FaMapMarkerAlt className="map-icon" />
              <span>{post.restaurant.name}</span>
              {post.restaurant.address && (
                <span className="restaurant-address">
                  {post.restaurant.address.city}, {post.restaurant.address.state}
                </span>
              )}
            </Link>
            
            {post.dish.tags && post.dish.tags.length > 0 && (
              <div className="dish-tags">
                {post.dish.tags.map((tag, index) => (
                  <span key={index} className="tag">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Link>
      
      <div className="post-actions">
        <button
          className={`like-btn ${isLiked ? 'liked' : ''}`}
          onClick={handleLike}
        >
          {isLiked ? <FaHeart /> : <FaRegHeart />}
          <span>{likes.length}</span>
        </button>
        
        <button
          className="comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <FaComment />
          <span>{comments.length}</span>
        </button>
      </div>
      
      {showComments && (
        <div className="comments-section">
          {comments.length > 0 ? (
            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment._id} className="comment">
                  <Link to={`/profile/${comment.user._id}`} className="comment-user">
                    <img
                      src={comment.user.profilePicture || '/default-avatar.png'}
                      alt={comment.user.username}
                      className="comment-avatar"
                    />
                    <span className="comment-username">{comment.user.username}</span>
                  </Link>
                  <p className="comment-text">{comment.text}</p>
                  <span className="comment-time">
                    {moment(comment.createdAt).fromNow()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-comments">No comments yet. Be the first to comment!</p>
          )}
          
          {isAuthenticated && (
            <form onSubmit={handleCommentSubmit} className="comment-form">
              <input
                type="text"
                placeholder="Add a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={isSubmitting}
                required
              />
              <button type="submit" disabled={isSubmitting || !commentText.trim()}>
                Post
              </button>
            </form>
          )}
        </div>
      )}

      <style jsx>{`
        .post-item {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .post-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 15px;
          border-bottom: 1px solid #f0f0f0;
        }

        .user-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }

        .user-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 10px;
        }

        .username {
          font-weight: 600;
        }

        .post-time {
          color: #999;
          font-size: 14px;
        }

        .post-content-link {
          text-decoration: none;
          color: inherit;
          display: block;
        }

        .post-content {
          padding: 0 0 15px;
        }

        .post-images {
          display: flex;
          position: relative;
          height: 300px;
        }

        .dish-image-container {
          flex: 2;
          position: relative;
        }

        .dish-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dish-name {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          background: linear-gradient(transparent, rgba(0, 0, 0, 0.7));
          color: white;
          padding: 15px;
          font-weight: 600;
          font-size: 18px;
        }

        .restaurant-image-container {
          flex: 1;
          border-left: 3px solid white;
        }

        .restaurant-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-details {
          padding: 15px;
        }

        .dish-info {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .dish-info h3 {
          margin: 0;
          font-size: 18px;
        }

        .dish-price {
          font-weight: 600;
          color: #ff6b6b;
        }

        .dish-description {
          margin: 10px 0;
          color: #666;
        }

        .restaurant-link {
          display: flex;
          align-items: center;
          margin: 10px 0;
          color: #666;
          text-decoration: none;
          font-size: 14px;
        }

        .map-icon {
          margin-right: 5px;
          color: #ff6b6b;
        }

        .restaurant-address {
          margin-left: 5px;
          color: #999;
        }

        .dish-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 10px;
        }

        .tag {
          background-color: #f0f0f0;
          padding: 5px 10px;
          border-radius: 15px;
          font-size: 12px;
          color: #666;
        }

        .post-actions {
          display: flex;
          padding: 0 15px 15px;
          border-top: 1px solid #f0f0f0;
        }

        .like-btn, .comment-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          padding: 10px 15px;
          cursor: pointer;
          color: #666;
          transition: color 0.3s;
        }

        .like-btn:hover, .comment-btn:hover {
          color: #ff6b6b;
        }

        .like-btn.liked {
          color: #ff6b6b;
        }

        .comments-section {
          padding: 15px;
          border-top: 1px solid #f0f0f0;
        }

        .comments-list {
          max-height: 300px;
          overflow-y: auto;
        }

        .comment {
          padding: 10px 0;
          border-bottom: 1px solid #f0f0f0;
        }

        .comment:last-child {
          border-bottom: none;
        }

        .comment-user {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          margin-bottom: 5px;
        }

        .comment-avatar {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 10px;
        }

        .comment-username {
          font-weight: 600;
          font-size: 14px;
        }

        .comment-text {
          margin: 5px 0;
          font-size: 14px;
        }

        .comment-time {
          color: #999;
          font-size: 12px;
        }

        .no-comments {
          text-align: center;
          color: #999;
          padding: 20px 0;
        }

        .comment-form {
          display: flex;
          margin-top: 15px;
        }

        .comment-form input {
          flex: 1;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 14px;
        }

        .comment-form button {
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 15px;
          margin-left: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .comment-form button:disabled {
          background-color: #ffb6b6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default PostItem;