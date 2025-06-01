import { useEffect, useState } from "react";

interface User {
  _id: string;
  uusername: string;
  uemail: string;
}

interface Music {
  _id: string;
  musictitle: string;
  musiclocation: string;
  uploaderid: string;
}

function UserProfileDisplay() {
  const [userId, setUserId] = useState<string | null>(null);
  const [userDetails, setUserDetails] = useState<User | null>(null);
  const [userMusic, setUserMusic] = useState<Music[]>([]);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("selectedUserId");
    if (storedUserId) {
      setUserId(storedUserId);
      fetchUserDetails(storedUserId);
      fetchUserMusic(storedUserId);
    }
  }, []);

  const fetchUserDetails = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/user/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user details.");
      const data = await res.json();
      setUserDetails(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const fetchUserMusic = async (id: string) => {
    try {
      const res = await fetch(`http://localhost:5000/music/byuser/${id}`);
      if (!res.ok) throw new Error("Failed to fetch user music.");
      const data = await res.json();
      setUserMusic(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="container mt-5">
      <h2>User Profile</h2>
      {error && <div className="alert alert-danger">{error}</div>}

      {userDetails ? (
  <div className="card p-3 mb-4 shadow-sm">
    <h5 className="card-title">{userDetails.uusername}</h5>
    <p className="card-text"><strong>Email:</strong> {userDetails.uemail}</p>

    {/* Only show edit button if the profile belongs to the logged-in user */}
    {userId === userDetails._id && (
      <a href="/userprofileupdate" className="btn btn-primary mt-2">
        Edit Profile
      </a>
    )}
  </div>
) : (
  <p>No user selected or details not found.</p>
)}


      <h4 className="mt-4">Uploaded Music</h4>
      {userMusic.length > 0 ? (
        <div className="row">
          {userMusic.map((music) => (
            <div key={music._id} className="col-md-6 col-lg-4 mb-3">
              <div className="card shadow-sm p-3">
                <h6 className="card-title">{music.musictitle}</h6>
                <audio controls src={`http://localhost:5000${music.musiclocation}`} className="w-100">
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>This user has not uploaded any music yet.</p>
      )}
    </div>
  );
}

export default UserProfileDisplay;
