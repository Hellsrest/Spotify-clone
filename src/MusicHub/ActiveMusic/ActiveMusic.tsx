import { useState, useEffect, useRef, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { defaultUserContext } from "../../Layouts/MusicLayout";
import { NavLink } from "react-router-dom";

interface Music {
  _id: string;
  musicname: string;
  musictitle: string;
  musiclocation: string;
  uploaderid: {
    _id: string;
    uusername: string;
  };
}

interface Comment {
  _id: string;
  musicid: string;
  userid: {
    _id: string;
    uusername: string;
  };
  comment: string;
  publishdate: string;
}

interface likemusic {
  userid: string;
  musicid: string;
}

interface Playlist {
  _id: string;
  name: string;
  userid: string;
  songs: string[];
}

function ActiveMusic() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  }
  const { userdetails } = userdetailscontext;

  const [musicList, setMusicList] = useState<Music[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState({ left: 0, right: 0 });
  const [direction, setDirection] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const constraintsRef = useRef(null);
  
  // Comment state
  const [isCommentPanelOpen, setIsCommentPanelOpen] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");

  // Playlist state
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [showPlaylistModal, setShowPlaylistModal] = useState(false);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [isAddingToPlaylist, setIsAddingToPlaylist] = useState(false);
  
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const response = await fetch("http://localhost:5000/activemusic");
        if (response.ok) {
          const data: Music[] = await response.json();
          console.log("Fetched music:", data);
          setMusicList(data);
        }
      } catch (error) {
        console.log("Error in fetching music", error);
      }
    };

    fetchMusic();
  }, []);

  // Fetch user playlists
  useEffect(() => {
    if (userdetails?.uid) {
      fetchUserPlaylists();
    }
  }, [userdetails]);

  const fetchUserPlaylists = async () => {
    try {
      const response = await fetch(`http://localhost:5000/playlists/user/${userdetails?.uid}`);
      if (response.ok) {
        const data = await response.json();
        setPlaylists(data);
      } else {
        console.log("Failed to fetch playlists");
      }
    } catch (error) {
      console.log("Error fetching playlists:", error);
    }
  };

  // Fetch comments when the current music changes or comment panel opens
  useEffect(() => {
    if (musicList.length > 0 && currentIndex < musicList.length && isCommentPanelOpen) {
      fetchComments(musicList[currentIndex]._id);
    }
  }, [currentIndex, musicList, isCommentPanelOpen]);

  const fetchComments = async (musicId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`http://localhost:5000/comments/${musicId}`);
      if (response.ok) {
        const data = await response.json();
        setComments(data);
      } else {
        console.log("Failed to fetch comments");
      }
    } catch (error) {
      console.log("Error fetching comments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const moveToNextMusic = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 < musicList.length ? prevIndex + 1 : prevIndex
    );
    // Close comment panel when moving to next music
    if (isCommentPanelOpen) {
      setIsCommentPanelOpen(false);
    }
    // Close playlist modal when moving to next music
    if (showPlaylistModal) {
      setShowPlaylistModal(false);
    }
    // Clear comments when changing music
    setComments([]);
  };

  // Function to send like to the server
  const sendLikeToServer = async (musicId: string) => {
    try {
      const likedmusic: likemusic = {
        userid: userdetails?.uid ? userdetails.uid.toString() : "",
        musicid: musicId,
      };

      const response = await fetch("http://localhost:5000/likemusic", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(likedmusic),
      });

      if (response.ok) {
        const data = await response.json();
        console.log("Like successful:", data);
        return true;
      }
      return false;
    } catch (error) {
      console.log("Error liking music:", error);
      return false;
    }
  };

  const handleDragEnd = async (_event: any, info: any) => {
    const offset = info.offset.x;
    if (offset < -100) {
      setDirection(-1);
      setSwipeCount((prev) => ({ ...prev, left: prev.left + 1 }));
      moveToNextMusic();
    } else if (offset > 100) {
      setDirection(1);
      setSwipeCount((prev) => ({ ...prev, right: prev.right + 1 }));

      setIsLiked(true);

      if (currentIndex < musicList.length) {
        await sendLikeToServer(musicList[currentIndex]._id);
      }

      setTimeout(() => {
        moveToNextMusic();
        setIsLiked(false);
      }, 300);
    }
  };

  const likemusic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (currentIndex >= musicList.length) return;

    try {
      setIsLiked(true);
      setDirection(1);

      setSwipeCount((prev) => ({ ...prev, right: prev.right + 1 }));

      await sendLikeToServer(musicList[currentIndex]._id);

      setTimeout(() => {
        moveToNextMusic();
        setIsLiked(false);
      }, 300);
    } catch (error) {
      console.log("Error liking music:", error);
      setIsLiked(false);
    }
  };

  const handleUserClick = () => {
    sessionStorage.setItem("selectedUserId", musicList[currentIndex].uploaderid._id);
  };
  
  // Toggle comment panel
  const toggleCommentPanel = () => {
    setIsCommentPanelOpen(!isCommentPanelOpen);
  };

  // Handle comment input change
  const handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCommentText(e.target.value);
  };

  // Handle edit input change
  const handleEditChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditText(e.target.value);
  };

  // Handle comment submission
  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!commentText.trim() || currentIndex >= musicList.length) return;
    
    try {
      const response = await fetch("http://localhost:5000/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          musicid: musicList[currentIndex]._id,
          userid: userdetails?.uid,
          comment: commentText,
        }),
      });

      if (response.ok) {
        const newComment = await response.json();
        setComments((prevComments) => [newComment, ...prevComments]);
        setCommentText("");
      } else {
        console.log("Failed to post comment");
      }
    } catch (error) {
      console.log("Error posting comment:", error);
    }
  };

  // Start editing a comment
  const handleEditStart = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditText(comment.comment);
  };

  // Cancel editing
  const handleEditCancel = () => {
    setEditingCommentId(null);
    setEditText("");
  };

  // Save edited comment
  const handleEditSave = async (commentId: string) => {
    if (!editText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userdetails?.uid,
          comment: editText,
        }),
      });

      if (response.ok) {
        const updatedComment = await response.json();
        setComments((prevComments) =>
          prevComments.map((comment) =>
            comment._id === commentId ? updatedComment : comment
          )
        );
        setEditingCommentId(null);
        setEditText("");
      } else {
        console.log("Failed to update comment");
      }
    } catch (error) {
      console.log("Error updating comment:", error);
    }
  };

  // Delete a comment
  const handleDeleteComment = async (commentId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userdetails?.uid,
        }),
      });

      if (response.ok) {
        setComments((prevComments) =>
          prevComments.filter((comment) => comment._id !== commentId)
        );
      } else {
        console.log("Failed to delete comment");
      }
    } catch (error) {
      console.log("Error deleting comment:", error);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  // Toggle playlist modal
  const togglePlaylistModal = () => {
    setShowPlaylistModal(!showPlaylistModal);
    // Reset selected playlists when opening modal
    if (!showPlaylistModal) {
      setSelectedPlaylists([]);
    }
  };

  // Handle playlist checkbox change
  const handlePlaylistCheckboxChange = (playlistId: string) => {
    setSelectedPlaylists(prev => {
      if (prev.includes(playlistId)) {
        return prev.filter(id => id !== playlistId);
      } else {
        return [...prev, playlistId];
      }
    });
  };

  // Add song to selected playlists
  const addToPlaylists = async () => {
    if (selectedPlaylists.length === 0 || currentIndex >= musicList.length) return;
    
    setIsAddingToPlaylist(true);
    
    try {
      const songId = musicList[currentIndex]._id;
      
      // Add the song to each selected playlist
      const promises = selectedPlaylists.map(playlistId => 
        fetch(`http://localhost:5000/playlists/${playlistId}/songs`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            userid: userdetails?.uid,
            songId: songId
          }),
        })
      );
      
      const results = await Promise.all(promises);
      
      // Check if all operations were successful
      const allSuccessful = results.every(response => response.ok);
      
      if (allSuccessful) {
        alert("Song added to playlists successfully!");
        setShowPlaylistModal(false);
      } else {
        alert("Failed to add song to some playlists.");
      }
    } catch (error) {
      console.log("Error adding song to playlists:", error);
      alert("Error adding song to playlists. Please try again.");
    } finally {
      setIsAddingToPlaylist(false);
    }
  };

  return (
    <div
      ref={constraintsRef}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        overflow: "hidden",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          background: "white",
          padding: "10px",
          borderRadius: "5px",
        }}
      >
        <p>Swiped Left: {swipeCount.left}</p>
        <p>Swiped Right: {swipeCount.right}</p>
      </div>
      <AnimatePresence>
        {currentIndex < musicList.length ? (
          <motion.div
            key={musicList[currentIndex]._id}
            className="card"
            style={{
              width: "80vw",
              height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
            }}
            drag="x"
            dragConstraints={constraintsRef}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{
              scale: 1,
              opacity: 1,
              x: isLiked ? 500 : 0,
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body" style={{ textAlign: "center" }}>
              <h5 className="card-title">
                {musicList[currentIndex].musictitle}
              </h5>

              <p className="card-text">
                {musicList[currentIndex].musicname ||
                  "No description available."}
              </p>

              {/* Display uploader username */}
              <NavLink to="/userprofiledisplay" className="nav-link" onClick={handleUserClick}>
                <p className="text-muted">
                  Uploaded by:{" "}
                  {musicList[currentIndex].uploaderid?.uusername || "Unknown"}
                </p>     
              </NavLink>

              <div className="d-flex justify-content-center gap-2 mb-3">
                <button
                  onClick={likemusic}
                  disabled={isLiked}
                  className="btn"
                  style={{
                    backgroundColor: isLiked ? "#ccc" : "#4CAF50",
                    color: "white",
                    border: "none",
                    cursor: isLiked ? "default" : "pointer",
                  }}
                >
                  {isLiked ? "Liked!" : "Like"}
                </button>

                {/* Comment button */}
                <button
                  onClick={toggleCommentPanel}
                  className="btn btn-primary"
                >
                  {isCommentPanelOpen ? "Hide Comments" : "Comments"}
                </button>

                {/* Add to Playlist Button */}
                <button
                  onClick={togglePlaylistModal}
                  className="btn btn-info text-white"
                >
                  Add to Playlist
                </button>
              </div>

              <audio controls style={{ width: "100%" }}>
                <source
                  src={musicList[currentIndex].musiclocation}
                  type="audio/mpeg"
                />
                Your browser does not support the audio element.
              </audio>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-more-music"
            className="card"
            style={{
              width: "80vw",
              height: "80vh",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              position: "absolute",
            }}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body" style={{ textAlign: "center" }}>
              <h5 className="card-title">No More Music</h5>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Comment Panel */}
      <motion.div
        className="comment-panel card"
        initial={{ x: '100%' }}
        animate={{ x: isCommentPanelOpen ? '0%' : '100%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '300px',
          height: '100vh',
          zIndex: 1000,
          boxShadow: '-5px 0px 15px rgba(0,0,0,0.1)',
          overflowY: 'auto'
        }}
      >
        <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Comments</h5>
          <button 
            type="button" 
            className="btn-close btn-close-white" 
            onClick={toggleCommentPanel}
            aria-label="Close"
          ></button>
        </div>
        <div className="card-body">
          <div className="comments-list mb-4" style={{ minHeight: '50vh', maxHeight: '60vh', overflowY: 'auto' }}>
            {isLoading ? (
              <div className="text-center">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : comments.length === 0 ? (
              <p className="text-muted text-center">No comments yet.</p>
            ) : (
              comments.map((comment) => (
                <div key={comment._id} className="card mb-3">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 className="card-subtitle text-muted">
                        {comment.userid.uusername}
                      </h6>
                      <small className="text-muted">
                        {formatDate(comment.publishdate)}
                      </small>
                    </div>
                    
                    {editingCommentId === comment._id ? (
                      // Edit form
                      <div>
                        <textarea
                          className="form-control mb-2"
                          value={editText}
                          onChange={handleEditChange}
                          rows={3}
                        ></textarea>
                        <div className="d-flex justify-content-end gap-2">
                          <button 
                            className="btn btn-sm btn-secondary"
                            onClick={handleEditCancel}
                          >
                            Cancel
                          </button>
                          <button 
                            className="btn btn-sm btn-primary"
                            onClick={() => handleEditSave(comment._id)}
                          >
                            Save
                          </button>
                        </div>
                      </div>
                    ) : (
                      // Comment display
                      <div>
                        <p className="card-text">{comment.comment}</p>
                        {userdetails?.uid === comment.userid._id && (
                          <div className="d-flex justify-content-end gap-2">
                            <button 
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleEditStart(comment)}
                            >
                              Edit
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteComment(comment._id)}
                            >
                              Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
          
          <form onSubmit={handleCommentSubmit}>
            <div className="form-group mb-3">
              <textarea
                className="form-control"
                placeholder="Write a comment..."
                value={commentText}
                onChange={handleCommentChange}
                rows={3}
              ></textarea>
            </div>
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={!commentText.trim()}
            >
              Post Comment
            </button>
          </form>
        </div>
      </motion.div>

      {/* Playlist Modal */}
      {showPlaylistModal && (
  <>
    {/* Modal Overlay */}
    <div 
      className="modal-overlay" 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: 1040
      }}
      onClick={togglePlaylistModal}
    ></div>

    {/* Modal Content */}
    <div 
      className="modal d-block" 
      style={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1050
      }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header bg-info text-white">
            <h5 className="modal-title">Add to Playlist</h5>
            <button 
              type="button" 
              className="btn-close btn-close-white" 
              onClick={togglePlaylistModal}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            {playlists.length === 0 ? (
              <div className="text-center p-4">
                <p className="mb-3">You don't have any playlists yet.</p>
                <NavLink to="/playlists" className="btn btn-outline-primary">
                  Create a Playlist
                </NavLink>
              </div>
            ) : (
              <div className="list-group">
                {playlists.map(playlist => (
                  <div key={playlist._id} className="list-group-item">
                    <div className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`playlist-${playlist._id}`}
                        checked={selectedPlaylists.includes(playlist._id)}
                        onChange={() => handlePlaylistCheckboxChange(playlist._id)}
                      />
                      <label className="form-check-label" htmlFor={`playlist-${playlist._id}`}>
                        {playlist.name}
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="modal-footer">
            <button 
              type="button" 
              className="btn btn-secondary" 
              onClick={togglePlaylistModal}
            >
              Cancel
            </button>
            <button 
              type="button" 
              className="btn btn-info text-white"
              onClick={addToPlaylists}
              disabled={isAddingToPlaylist || selectedPlaylists.length === 0}
            >
              {isAddingToPlaylist ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  Adding...
                </>
              ) : "Add to Selected Playlists"}
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}
    </div>
  );
}

export default ActiveMusic;