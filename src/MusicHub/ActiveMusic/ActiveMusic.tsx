import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Music {
  _id: string;
  musicname: string;
  musictitle: string;
  musiclocation: string;
  uploaderid: string;
}

function ActiveMusic() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeCount, setSwipeCount] = useState({ left: 0, right: 0 });
  const [direction, setDirection] = useState(0);
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

  const handleDragEnd = (_event: any, info: any) => {
    const offset = info.offset.x;
    if (offset < -100) {
      setDirection(-1);
      setSwipeCount((prev) => ({ ...prev, left: prev.left + 1 }));
      setCurrentIndex((prevIndex) => (prevIndex + 1 < musicList.length ? prevIndex + 1 : prevIndex));
    } else if (offset > 100) {
      setDirection(1);
      setSwipeCount((prev) => ({ ...prev, right: prev.right + 1 }));
      setCurrentIndex((prevIndex) => (prevIndex + 1 < musicList.length ? prevIndex + 1 : prevIndex));
    }
  };

  return (
    <div ref={constraintsRef} style={{ display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", height: "100vh", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 20, left: 20, background: "white", padding: "10px", borderRadius: "5px" }}>
        <p>Swiped Left: {swipeCount.left}</p>
        <p>Swiped Right: {swipeCount.right}</p>
      </div>
      <AnimatePresence>
        {currentIndex < musicList.length ? (
          <motion.div
            key={musicList[currentIndex]._id}
            className="card"
            style={{ width: "80vw", height: "80vh", display: "flex", justifyContent: "center", alignItems: "center", position: "absolute" }}
            drag="x"
            dragConstraints={constraintsRef}
            onDragEnd={handleDragEnd}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="card-body" style={{ textAlign: "center" }}>
              <h5 className="card-title">{musicList[currentIndex].musictitle}</h5>
              <p className="card-text">{musicList[currentIndex].musicname || "No description available."}</p>
              <audio controls style={{ width: "100%" }}>
                <source src={musicList[currentIndex].musiclocation} type="audio/mpeg" />
                Your browser does not support the audio element.
              </audio>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="no-more-music"
            className="card"
            style={{ width: "80vw", height: "80vh", display: "flex", justifyContent: "center", alignItems: "center", position: "absolute" }}
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
