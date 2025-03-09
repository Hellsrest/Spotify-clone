import { useState, useEffect, useRef, useContext } from "react";
import { defaultUserContext } from "../Layouts/MusicLayout";

interface Music {
  _id: string;
  musicname: string;
  musictitle: string;
  musiclocation: string;
  uploaderid: string;
}

function MusicLiked() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  }
  const { userdetails } = userdetailscontext;
  const [musicList, setMusicList] = useState<Music[]>([]);
  const [loading, setLoading] = useState(true);
  const constraintsRef = useRef(null);

  useEffect(() => {
    const fetchMusic = async () => {
      if (!userdetails?.uid) {
        console.warn("User ID is missing, skipping fetch.");
        return;
      }

      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/likedmusic/${userdetails.uid}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch liked music");
        }

        const data: Music[] = await response.json();
        console.log("Fetched liked music:", data);
        setMusicList(data);
      } catch (error) {
        console.error("Error fetching liked music:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMusic();
  }, [userdetails?.uid]);

  return (
    <>
      <h2>Liked Music</h2>
      {loading ? <p>Loading...</p> : musicList.length === 0 ? <p>No liked music found.</p> : null}
      <ul>
        {musicList.map((music) => (
          <li key={music._id}>
            <p>{music.musictitle}</p>
            <audio controls>
              <source src={music.musiclocation} type="audio/mpeg" />
              Your browser does not support the audio element.
            </audio>
          </li>
        ))}
      </ul>
    </>
  );
}

export default MusicLiked;
