import { useEffect, useState } from "react";

function UserProfileDisplay() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const storedUserId = sessionStorage.getItem("selectedUserId");
    setUserId(storedUserId);
  }, []);

  return (
    <div>
      <h2>User Profile</h2>
      {userId ? <p>User ID: {userId}</p> : <p>No user selected</p>}
    </div>
  );
}

export default UserProfileDisplay;
