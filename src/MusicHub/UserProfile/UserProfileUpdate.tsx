import { useState, useContext } from "react";
import { defaultUserContext } from "../../Layouts/MusicLayout";

function UserProfileUpdate() {
  const userContext = useContext(defaultUserContext);
  if (!userContext) {
    throw new Error("UserProfileUpdate must be used within a Provider");
  }
  const { userdetails } = userContext;

  const [uusername, setUusername] = useState<string>(userdetails?.uusername || "");
  const [uemail, setUemail] = useState<string>(userdetails?.uemail || "");
  const [upassword, setUpassword] = useState<string>(userdetails?.upassword || "");
  const [errorMsg, setErrorMsg] = useState<string>("");

  interface UUser {
    id: string;
    uusername: string;
    uemail: string;
    upassword: string;
  }

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUusername(e.target.value);
  }

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUemail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUpassword(e.target.value);
  }

  const validateForm = (): boolean => {
    if (!uusername || !uemail || !upassword) {
      setErrorMsg("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(uemail)) {
      setErrorMsg("Invalid email format.");
      return false;
    }
    if (upassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const updateProfile = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const updatedData: UUser = {
      id: userdetails?.uid || "",
      uusername,
      uemail,
      upassword,
    };

    try {
      const response = await fetch("http://localhost:5000/updateuser", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      });

      const result = await response.json();
      console.log(result);

      if (response.ok) {
        alert("Profile updated successfully!");
      } else {
        setErrorMsg(result.message || "Update failed.");
      }
    } catch (error) {
      setErrorMsg("Server error. Please try again later.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Update Profile</h2>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form>
        <div className="mb-3">
          <label htmlFor="username" className="form-label">Username</label>
          <input
            type="text"
            id="username"
            className="form-control"
            placeholder="Enter new username"
            value={uusername}
            onChange={handleUsernameChange}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="email" className="form-label">Email</label>
          <input
            type="email"
            id="email"
            className="form-control"
            placeholder="Enter new email"
            value={uemail}
            onChange={handleEmailChange}
          />
        </div>

        <div className="mb-4">
          <label htmlFor="password" className="form-label">Password</label>
          <input
            type="password"
            id="password"
            className="form-control"
            placeholder="Enter new password"
            value={upassword}
            onChange={handlePasswordChange}
          />
        </div>

        <div className="d-grid">
          <button type="submit" onClick={updateProfile} className="btn btn-primary">
            Update Profile
          </button>
        </div>
      </form>
    </div>
  );
}

export default UserProfileUpdate;
