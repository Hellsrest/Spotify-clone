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

interface likemusic {
  userid: string;
  musicid: string;
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

  const moveToNextMusic = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 < musicList.length ? prevIndex + 1 : prevIndex
    );
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


              <button
                onClick={likemusic}
                disabled={isLiked}
                style={{
                  padding: "8px 16px",
                  backgroundColor: isLiked ? "#ccc" : "#4CAF50",
                  color: "white",
                  border: "none",
                  borderRadius: "4px",
                  cursor: isLiked ? "default" : "pointer",
                  marginBottom: "10px",
                }}
              >
                {isLiked ? "Liked!" : "Like"}
              </button>
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
    </div>
  );
}

export default ActiveMusic;
