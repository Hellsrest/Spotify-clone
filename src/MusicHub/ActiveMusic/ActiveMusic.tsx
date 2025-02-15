import { useState, useEffect } from "react";

interface Music {
  _id: string;
  musicname: string;
  musictitle: string;
  musiclocation: string;
  uploaderid: string;
}

function ActiveMusic() {
  const [musicList, setMusicList] = useState<Music[]>([]);
  useEffect(() => {
    const fetchmusic = async () => {
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

    fetchmusic();
  }, []);

  return (
    <>
      <h2>Active Music</h2>
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

export default ActiveMusic;
