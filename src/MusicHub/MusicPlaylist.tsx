import { useState, useEffect, useContext } from "react";
import { defaultUserContext } from "../Layouts/MusicLayout";

interface Playlist {
  _id: string;
  name: string;
  userid: string;
  songs: Song[];
}

interface Song {
  _id: string;
  musicname: string;
  musictitle: string;
  musiclocation: string;
  uploaderid: {
    _id: string;
    uusername: string;
  };
}

function MusicPlaylist() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  }
  const { userdetails } = userdetailscontext;

  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [activePlaylist, setActivePlaylist] = useState<Playlist | null>(null);
  const [currentSongIndex, setCurrentSongIndex] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (userdetails?.uid) {
      fetchUserPlaylists();
    }
  }, [userdetails]);

  const fetchUserPlaylists = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:5000/playlists/user/${userdetails?.uid}`, {
        method: "GET"
      });
  
      if (response.ok) {
        const data = await response.json();
        console.log("Fetched playlists:", data);
        setPlaylists(data);
      } else {
        const errorText = await response.text();
        console.error("Failed to fetch playlists:", errorText);
        setError(`Failed to fetch playlists: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log("Error fetching playlists:", error);
      setError(`Error fetching playlists: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  };
  
  const createPlaylist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlaylistName.trim()) return;

    try {
      const response = await fetch("http://localhost:5000/playlists", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newPlaylistName,
          userid: userdetails?.uid,
        }),
      });

      if (response.ok) {
        const newPlaylist = await response.json();
        setPlaylists([...playlists, newPlaylist]);
        setNewPlaylistName("");
        setShowCreateForm(false);
      } else {
        const errorText = await response.text();
        console.error("Failed to create playlist:", errorText);
        setError(`Failed to create playlist: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log("Error creating playlist:", error);
      setError(`Error creating playlist: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const deletePlaylist = async (playlistId: string) => {
    if (!confirm("Are you sure you want to delete this playlist?")) return;

    try {
      const response = await fetch(`http://localhost:5000/playlists/${playlistId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userdetails?.uid,
        }),
      });

      if (response.ok) {
        setPlaylists(playlists.filter(playlist => playlist._id !== playlistId));
        if (activePlaylist?._id === playlistId) {
          setActivePlaylist(null);
          stopAudio();
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to delete playlist:", errorText);
        setError(`Failed to delete playlist: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log("Error deleting playlist:", error);
      setError(`Error deleting playlist: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const removeSongFromPlaylist = async (playlistId: string, songId: string) => {
    try {
      const response = await fetch(`http://localhost:5000/playlists/${playlistId}/songs/${songId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userid: userdetails?.uid,
        }),
      });

      if (response.ok) {
        // Update the playlists state
        setPlaylists(prevPlaylists => 
          prevPlaylists.map(playlist => {
            if (playlist._id === playlistId) {
              return {
                ...playlist,
                songs: playlist.songs.filter(song => song._id !== songId)
              };
            }
            return playlist;
          })
        );

        // Update the active playlist if it's the one being modified
        if (activePlaylist?._id === playlistId) {
          setActivePlaylist({
            ...activePlaylist,
            songs: activePlaylist.songs.filter(song => song._id !== songId)
          });

          // If the current playing song is removed, stop playing
          if (currentSongIndex !== null && 
              activePlaylist.songs[currentSongIndex]._id === songId) {
            stopAudio();
            setCurrentSongIndex(null);
          }
        }
      } else {
        const errorText = await response.text();
        console.error("Failed to remove song from playlist:", errorText);
        setError(`Failed to remove song: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      console.log("Error removing song from playlist:", error);
      setError(`Error removing song: ${error instanceof Error ? error.message : String(error)}`);
    }
  };

  const viewPlaylistDetails = (playlist: Playlist) => {
    setActivePlaylist(playlist);
    stopAudio();
    setCurrentSongIndex(null);
  };

  const backToPlaylists = () => {
    setActivePlaylist(null);
    stopAudio();
    setCurrentSongIndex(null);
  };

  const playSong = (index: number) => {
    if (!activePlaylist || !activePlaylist.songs[index]) return;
    
    // Stop current audio if playing
    stopAudio();
    
    // Create new audio element
    const audio = new Audio(activePlaylist.songs[index].musiclocation);
    setAudioElement(audio);
    
    // Play the audio
    audio.play().then(() => {
      setIsPlaying(true);
      setCurrentSongIndex(index);
      
      // Handle audio ended event
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        // Auto play next song if available
        if (index < activePlaylist.songs.length - 1) {
          playSong(index + 1);
        } else {
          setCurrentSongIndex(null);
        }
      });
    }).catch(error => {
      console.log("Error playing audio:", error);
      setError(`Error playing audio: ${error instanceof Error ? error.message : String(error)}`);
    });
  };

  const togglePlayPause = () => {
    if (!audioElement || currentSongIndex === null) return;
    
    if (isPlaying) {
      audioElement.pause();
    } else {
      audioElement.play();
    }
    
    setIsPlaying(!isPlaying);
  };

  const stopAudio = () => {
    if (audioElement) {
      audioElement.pause();
      audioElement.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const playNext = () => {
    if (activePlaylist && currentSongIndex !== null && currentSongIndex < activePlaylist.songs.length - 1) {
      playSong(currentSongIndex + 1);
    }
  };

  const playPrevious = () => {
    if (activePlaylist && currentSongIndex !== null && currentSongIndex > 0) {
      playSong(currentSongIndex - 1);
    }
  };

  return (
    <div className="container py-5">
      {/* Error message display */}
      {error && (
        <div className="alert alert-danger alert-dismissible fade show" role="alert">
          {error}
          <button type="button" className="btn-close" onClick={() => setError(null)}></button>
        </div>
      )}
      
      {activePlaylist ? (
        // Playlist Detail View
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <button className="btn btn-outline-secondary" onClick={backToPlaylists}>
              <i className="bi bi-arrow-left"></i> Back to Playlists
            </button>
            <h2>{activePlaylist.name}</h2>
            <div></div> {/* Empty div for flex alignment */}
          </div>

          {/* Player Controls */}
          {currentSongIndex !== null && activePlaylist.songs[currentSongIndex] && (
            <div className="card mb-4">
              <div className="card-body">
                <h5 className="card-title">Now Playing</h5>
                <p className="card-text">
                  {activePlaylist.songs[currentSongIndex].musictitle} - Uploaded by: {activePlaylist.songs[currentSongIndex].uploaderid.uusername}
                </p>
                <div className="d-flex justify-content-center gap-3">
                  <button 
                    className="btn btn-outline-secondary" 
                    onClick={playPrevious}
                    disabled={currentSongIndex === 0}
                  >
                    <i className="bi bi-skip-backward-fill"></i>
                  </button>
                  <button 
                    className="btn btn-primary"
                    onClick={togglePlayPause}
                  >
                    {isPlaying ? <i className="bi bi-pause-fill"></i> : <i className="bi bi-play-fill"></i>}
                  </button>
                  <button 
                    className="btn btn-outline-secondary"
                    onClick={playNext}
                    disabled={currentSongIndex === activePlaylist.songs.length - 1}
                  >
                    <i className="bi bi-skip-forward-fill"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Songs List */}
          {activePlaylist.songs.length === 0 ? (
            <div className="text-center p-5">
              <p className="lead">This playlist is empty.</p>
              <p>Add songs to this playlist by using the "Add to Playlist" button when browsing music.</p>
            </div>
          ) : (
            <div className="list-group">
              {activePlaylist.songs.map((song, index) => (
                <div 
                  key={song._id} 
                  className={`list-group-item list-group-item-action ${currentSongIndex === index ? 'active' : ''}`}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <button 
                        className="btn btn-sm me-3"
                        onClick={() => playSong(index)}
                      >
                        {currentSongIndex === index && isPlaying ? 
                          <i className="bi bi-pause-circle"></i> : 
                          <i className="bi bi-play-circle"></i>
                        }
                      </button>
                      <div>
                        <h6 className={`mb-0 ${currentSongIndex === index ? 'text-white' : ''}`}>
                          {song.musictitle}
                        </h6>
                        <small className={currentSongIndex === index ? 'text-white-50' : 'text-muted'}>
                          Uploaded by: {song.uploaderid.uusername}
                        </small>
                      </div>
                    </div>
                    <button 
                      className={`btn btn-sm ${currentSongIndex === index ? 'btn-outline-light' : 'btn-outline-danger'}`}
                      onClick={() => removeSongFromPlaylist(activePlaylist._id, song._id)}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Playlists List View
        <div>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2>Your Playlists</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'Cancel' : 'Create New Playlist'}
            </button>
          </div>

          {/* Create Playlist Form */}
          {showCreateForm && (
            <div className="card mb-4">
              <div className="card-body">
                <form onSubmit={createPlaylist}>
                  <div className="mb-3">
                    <label htmlFor="playlistName" className="form-label">Playlist Name</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      id="playlistName"
                      value={newPlaylistName}
                      onChange={(e) => setNewPlaylistName(e.target.value)}
                      required
                    />
                  </div>
                  <button type="submit" className="btn btn-success">Create Playlist</button>
                </form>
              </div>
            </div>
          )}

          {/* Playlists */}
          {loading ? (
            <div className="text-center p-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : playlists.length === 0 ? (
            <div className="text-center p-5">
              <p className="lead">You don't have any playlists yet.</p>
              <button 
                className="btn btn-primary mt-3" 
                onClick={() => setShowCreateForm(true)}
              >
                Create Your First Playlist
              </button>
            </div>
          ) : (
            <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
              {playlists.map(playlist => (
                <div key={playlist._id} className="col">
                  <div className="card h-100">
                    <div className="card-body">
                      <h5 className="card-title">{playlist.name}</h5>
                      <p className="card-text">
                        {playlist.songs?.length || 0} songs
                      </p>
                    </div>
                    <div className="card-footer bg-transparent d-flex justify-content-between">
                      <button 
                        className="btn btn-outline-primary"
                        onClick={() => viewPlaylistDetails(playlist)}
                      >
                        View Details
                      </button>
                      <button 
                        className="btn btn-outline-danger"
                        onClick={() => deletePlaylist(playlist._id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default MusicPlaylist;