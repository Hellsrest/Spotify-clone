import { useNavigate } from "react-router-dom";
import { useState } from "react";

function Register() {
  const navigate = useNavigate();

  function goToLogin() {
    navigate("/login");
  }

  interface User {
    uemail: string;
    uusername: string;
    upassword: string;
  }

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handleUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  const validateForm = (): boolean => {
    if (!email || !username || !password) {
      setErrorMsg("All fields are required.");
      return false;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setErrorMsg("Invalid email format.");
      return false;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters long.");
      return false;
    }
    setErrorMsg("");
    return true;
  };

  const createUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newUser: User = {
      uemail: email,
      uusername: username,
      upassword: password,
    };

    try {
      const response = await fetch("http://localhost:5000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });

      const data = await response.json();
      console.log(data);

      if (response.ok) {
        navigate("/login");
      } else {
        setErrorMsg(data.message || "Registration failed.");
      }
    } catch (error) {
      setErrorMsg("Server error. Please try again later.");
    }
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Register</h2>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form>
        <div className="mb-3">
          <label htmlFor="inputEmail" className="form-label">Email</label>
          <input
            type="email"
            className="form-control"
            id="inputEmail"
            placeholder="Enter your email"
            value={email}
            onChange={handleEmailChange}
            required
          />
        </div>

        <div className="mb-3">
          <label htmlFor="inputUsername" className="form-label">Username</label>
          <input
            type="text"
            className="form-control"
            id="inputUsername"
            placeholder="Enter your username"
            value={username}
            onChange={handleUsernameChange}
            required
          />
        </div>

        <div className="mb-4">
          <label htmlFor="inputPassword" className="form-label">Password</label>
          <input
            type="password"
            className="form-control"
            id="inputPassword"
            placeholder="Enter your password"
            value={password}
            onChange={handlePasswordChange}
            required
          />
        </div>

        <div className="d-grid gap-2">
          <button className="btn btn-primary" onClick={createUser}>
            Sign Up
          </button>
          <button type="button" className="btn btn-secondary" onClick={goToLogin}>
            Already have an account? Login
          </button>
        </div>
      </form>
    </div>
  );
}

export default Register;
