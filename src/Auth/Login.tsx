import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { defaultUserContext } from "../Layouts/Layout";

function Login() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  }

  const { setUserDetails } = userdetailscontext;
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const storedUser = sessionStorage.getItem("userdetails");
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser));
    }
  }, [setUserDetails]);

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

  const validateForm = (): boolean => {
    if (!email || !password) {
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

  const loginUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!validateForm()) return;

    const logindata = {
      lemail: email,
      lpassword: password,
    };

    try {
      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(logindata),
      });

      if (response.ok) {
        const data = await response.json();
        const userData = {
          uid: data.user._id,
          uusername: data.user.uusername,
          uemail: data.user.uemail,
          upassword: data.user.upassword,
        };

        setUserDetails(userData);
        sessionStorage.setItem("userdetails", JSON.stringify(userData));
        navigate("/main");
      } else {
        const errorData = await response.json();
        setErrorMsg(errorData.message || "Login failed.");
      }
    } catch (error) {
      setErrorMsg("Server error. Please try again later.");
    }
  };

  const goToRegister = () => {
    navigate("/register");
  };

  return (
    <div className="container mt-5" style={{ maxWidth: "500px" }}>
      <h2 className="mb-4 text-center">Login</h2>

      {errorMsg && <div className="alert alert-danger">{errorMsg}</div>}

      <form>
        <div className="mb-3">
          <label htmlFor="inputEmail" className="form-label">Email address</label>
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
          <button type="submit" className="btn btn-primary" onClick={loginUser}>
            Login
          </button>
          <button type="button" className="btn btn-secondary" onClick={goToRegister}>
            Register Now
          </button>
        </div>
      </form>
    </div>
  );
}

export default Login;
