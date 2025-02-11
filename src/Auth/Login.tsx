import { useNavigate } from "react-router-dom";
import { useState, useContext, useEffect } from "react";
import { defaultUserContext } from "../Layouts/Layout";

function Login() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  } 
  const { userdetails, setUserDetails } = userdetailscontext;
  
  interface luser {
    lemail: string;
    lpassword: string;
  }

  const navigate = useNavigate();
  
  function GoToRegister() {
    navigate("/register");
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  function handleEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

 
  useEffect(() => {
    const storedUser = sessionStorage.getItem("userdetails");
    if (storedUser) {
      setUserDetails(JSON.parse(storedUser));
    }
  }, [setUserDetails]);

  const loginUser = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const logindata: luser = {
      lemail: email,
      lpassword: password,
    };

    console.log(logindata);
    const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify(logindata),
    });

    console.log(response);
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
      console.log(data);
      console.log("i m work");
      navigate("/main");
    }
  };

  return (
    <>
      <p>ID: {userdetails?.uid || "guestid"}</p>
      <p>Username: {userdetails?.uusername || "guest"}</p>
      <p>Email: {userdetails?.uemail || "guestemail"}</p>
      <p>Password: {userdetails?.upassword || "guestpassword"}</p>

      <form>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            placeholder="Enter email"
            value={email}
            onChange={handleEmailChange}
          />
          <small id="emailHelp" className="form-text text-muted">
            We'll never share your email with anyone else.
          </small>
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            placeholder="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <div className="form-group form-check">
          <input type="checkbox" className="form-check-input" id="exampleCheck1" />
          <label className="form-check-label" htmlFor="exampleCheck1">
            Check me out
          </label>
        </div>
        <button type="submit" className="btn btn-primary" onClick={loginUser}>
          Submit
        </button>
      </form>
      <button onClick={GoToRegister}>Register Now</button>
    </>
  );
}

export default Login;
