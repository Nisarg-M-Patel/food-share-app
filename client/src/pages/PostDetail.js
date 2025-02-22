// client/src/pages/PostDetail.js
import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import moment from 'moment';
import { AuthContext } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import { 
  FaHeart, 
  FaRegHeart, 
  FaComment, 
  FaMapMarkerAlt, 
  FaTrash, 
  FaArrowLeft 
} from 'react-icons/fa';

const PostDetail = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Fetch post details
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await axios.get(`/api/posts/${id}`);
        setPost(res.data.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post:', err);
        setError('Error loading post. Please try again.');
        setLoading(false);
      }
    };
    
    fetchPost();
  }, [id]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    try {
      const res = await axios.put(`/api/posts/${id}/like`);
      
      // Update post state with new likes
      setPost({
        ...post,
        likes: res.data.data.likes,
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  // Handle comment submission
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    
    if (!commentText.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      const res = await axios.post(`/api/posts/${id}/comments`, {
        text: commentText,
      });
      
      // Update post state with new comments
      setPost({
        ...post,
        comments: res.data.data,
      });
      
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle post deletion
  const handleDeletePost = async () => {
    try {
      await axios.delete(`/api/posts/${id}`);
      navigate('/');
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Error deleting post. Please try again.');
    }
  };

  // Check if current user has liked the post
  const isLiked = isAuthenticated && post?.likes?.includes(user?._id);

  // Check if current user is the post owner
  const isOwner = isAuthenticated && post?.user?._id === user?._id;

  if (loading) {
    return (
      <div className="post-detail-container">
        <Navbar />
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading post...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="post-detail-container">
        <Navbar />
        <div className="error-message">
          <p>{error}</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="post-detail-container">
        <Navbar />
        <div className="error-message">
          <p>Post not found</p>
          <button onClick={() => navigate('/')} className="back-btn">
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="post-detail-container">
      <Navbar />
      
      <div className="post-detail-content">
        <div className="back-nav">
          <button onClick={() => navigate(-1)} className="back-btn">
            <FaArrowLeft /> Back
          </button>
        </div>
        
        <div className="post-detail-card">
          <div className="post-header">
            <div className="user-info">
              <Link to={`/profile/${post.user._id}`} className="user-link">
                <img
                  src={post.user.profilePicture || '/default-avatar.png'}
                  alt={post.user.username}
                  className="user-avatar"
                />
                <div>
                  <span className="username">{post.user.username}</span>
                  <span className="post-time">
                    {moment(post.createdAt).format('MMMM D, YYYY [at] h:mm A')}
                  </span>
                </div>
              </Link>
            </div>
            
            {isOwner && (
              <div className="post-actions">
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="delete-btn"
                >
                  <FaTrash />
                </button>
              </div>
            )}
          </div>
          
          <div className="post-images">
            <div className="main-image-container">
              <img
                src={post.image}
                alt={post.dish.name}
                className="dish-image"
              />
            </div>
            
            {post.restaurantImage && (
              <div className="side-image-container">
                <img
                  src={post.restaurantImage}
                  alt={post.restaurant.name}
                  className="restaurant-image"
                />
              </div>
            )}
          </div>
          
          <div className="post-content">
            <div className="dish-header">
              <h1 className="dish-name">{post.dish.name}</h1>
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
                  {post.restaurant.address.street &&
                    `${post.restaurant.address.street}, `}
                  {post.restaurant.address.city}, {post.restaurant.address.state}{' '}
                  {post.restaurant.address.zipCode}
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
            
            <div className="engagement">
              <button
                className={`like-btn ${isLiked ? 'liked' : ''}`}
                onClick={handleLike}
              >
                {isLiked ? <FaHeart /> : <FaRegHeart />}
                <span>{post.likes.length} likes</span>
              </button>
              
              <div className="comment-count">
                <FaComment />
                <span>{post.comments.length} comments</span>
              </div>
            </div>
          </div>
          
          <div className="comments-section">
            <h2>Comments</h2>
            
            {isAuthenticated ? (
              <form onSubmit={handleCommentSubmit} className="comment-form">
                <img
                  src={user.profilePicture || '/default-avatar.png'}
                  alt={user.username}
                  className="comment-avatar"
                />
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
            ) : (
              <div className="login-prompt">
                <Link to="/login">Login</Link> to add a comment
              </div>
            )}
            
            {post.comments.length > 0 ? (
              <div className="comments-list">
                {post.comments.map((comment) => (
                  <div key={comment._id} className="comment">
                    <Link to={`/profile/${comment.user._id}`} className="comment-user">
                      <img
                        src={comment.user.profilePicture || '/default-avatar.png'}
                        alt={comment.user.username}
                        className="comment-avatar"
                      />
                    </Link>
                    <div className="comment-content">
                      <div className="comment-header">
                        <Link to={`/profile/${comment.user._id}`} className="comment-username">
                          {comment.user.username}
                        </Link>
                        <span className="comment-time">
                          {moment(comment.createdAt).fromNow()}
                        </span>
                      </div>
                      <p className="comment-text">{comment.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="no-comments">
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showDeleteConfirm && (
        <div className="delete-confirm-modal">
          <div className="modal-content">
            <h2>Delete Post</h2>
            <p>Are you sure you want to delete this post? This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="cancel-btn"
              >
                Cancel
              </button>
              <button onClick={handleDeletePost} className="delete-confirm-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .post-detail-container {
          min-height: 100vh;
          background-color: #f7f7f7;
        }

        .post-detail-content {
          max-width: 900px;
          margin: 70px auto 30px;
          padding: 0 20px;
        }

        .back-nav {
          margin-bottom: 20px;
        }

        .back-btn {
          display: flex;
          align-items: center;
          gap: 5px;
          background: none;
          border: none;
          color: #666;
          font-size: 16px;
          cursor: pointer;
          padding: 5px 0;
        }

        .post-detail-card {
          background-color: white;
          border-radius: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .post-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px;
          border-bottom: 1px solid #f0f0f0;
        }

        .user-link {
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
        }

        .user-avatar {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 15px;
        }

        .username {
          display: block;
          font-weight: 600;
          margin-bottom: 5px;
        }

        .post-time {
          display: block;
          color: #999;
          font-size: 14px;
        }

        .delete-btn {
          background: none;
          border: none;
          color: #e41e3f;
          cursor: pointer;
          padding: 10px;
          font-size: 18px;
        }

        .post-images {
          display: flex;
          position: relative;
          height: 500px;
        }

        .main-image-container {
          flex: 3;
        }

        .dish-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .side-image-container {
          flex: 1;
          border-left: 3px solid white;
        }

        .restaurant-image {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .post-content {
          padding: 30px;
          border-bottom: 1px solid #f0f0f0;
        }

        .dish-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
        }

        .dish-name {
          margin: 0;
          font-size: 24px;
        }

        .dish-price {
          font-size: 20px;
          font-weight: 600;
          color: #ff6b6b;
        }

        .dish-description {
          margin: 15px 0;
          line-height: 1.6;
          color: #444;
          font-size: 16px;
        }

        .restaurant-link {
          display: flex;
          align-items: center;
          margin: 20px 0;
          color: #666;
          text-decoration: none;
          font-size: 16px;
        }

        .map-icon {
          margin-right: 10px;
          color: #ff6b6b;
        }

        .restaurant-address {
          margin-left: 5px;
          color: #999;
        }

        .dish-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin: 20px 0;
        }

        .tag {
          background-color: #f0f0f0;
          padding: 8px 15px;
          border-radius: 20px;
          font-size: 14px;
          color: #666;
        }

        .engagement {
          display: flex;
          margin-top: 30px;
        }

        .like-btn, .comment-count {
          display: flex;
          align-items: center;
          gap: 10px;
          margin-right: 30px;
          color: #666;
        }

        .like-btn {
          background: none;
          border: none;
          cursor: pointer;
          padding: 5px 0;
          font-size: 16px;
        }

        .like-btn:hover {
          color: #ff6b6b;
        }

        .like-btn.liked {
          color: #ff6b6b;
        }

        .comment-count {
          font-size: 16px;
        }

        .comments-section {
          padding: 30px;
        }

        .comments-section h2 {
          margin-top: 0;
          margin-bottom: 20px;
          font-size: 20px;
        }

        .comment-form {
          display: flex;
          align-items: center;
          margin-bottom: 30px;
        }

        .comment-avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          object-fit: cover;
          margin-right: 15px;
        }

        .comment-form input {
          flex: 1;
          padding: 12px 15px;
          border: 1px solid #ddd;
          border-radius: 20px;
          font-size: 16px;
        }

        .comment-form button {
          background-color: #ff6b6b;
          color: white;
          border: none;
          border-radius: 20px;
          padding: 10px 20px;
          margin-left: 10px;
          cursor: pointer;
          font-weight: 600;
        }

        .comment-form button:disabled {
          background-color: #ffb6b6;
          cursor: not-allowed;
        }

        .login-prompt {
          text-align: center;
          margin-bottom: 30px;
          color: #666;
        }

        .login-prompt a {
          color: #ff6b6b;
          text-decoration: none;
        }

        .comments-list {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .comment {
          display: flex;
        }

        .comment-content {
          background-color: #f9f9f9;
          border-radius: 10px;
          padding: 15px;
          flex: 1;
        }

        .comment-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
        }

        .comment-username {
          font-weight: 600;
          text-decoration: none;
          color: inherit;
        }

        .comment-time {
          color: #999;
          font-size: 14px;
        }

        .comment-text {
          margin: 0;
          line-height: 1.5;
        }

        .no-comments {
          text-align: center;
          color: #999;
          padding: 20px 0;
        }

        .loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 50vh;
        }

        .spinner {
          width: 50px;
          height: 50px;
          border: 5px solid rgba(255, 107, 107, 0.3);
          border-radius: 50%;
          border-top-color: #ff6b6b;
          animation: spin 1s linear infinite;
          margin-bottom: 20px;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        .error-message {
          text-align: center;
          padding: 50px 20px;
          color: #e41e3f;
        }

        .delete-confirm-modal {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.7);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background-color: white;
          border-radius: 10px;
          padding: 30px;
          width: 90%;
          max-width: 500px;
        }

        .modal-content h2 {
          margin-top: 0;
          color: #e41e3f;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 15px;
          margin-top: 30px;
        }

        .cancel-btn {
          background-color: #f5f5f5;
          color: #666;
          border: none;
          border-radius: 5px;
          padding: 12px 20px;
          font-weight: 500;
          cursor: pointer;
        }

        .delete-confirm-btn {
          background-color: #e41e3f;
          color: white;
          border: none;
          border-radius: 5px;
          padding: 12px 20px;
          font-weight: 600;
          cursor: pointer;
        }

        @media (max-width: 768px) {
          .post-images {
            flex-direction: column;
            height: auto;
          }

          .main-image-container, .side-image-container {
            height: 300px;
          }

          .side-image-container {
            border-left: none;
            border-top: 3px solid white;
          }
        }
      `}</style>
    </div>
  );
};

export default PostDetail;