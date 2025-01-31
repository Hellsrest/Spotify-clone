import { useNavigate } from "react-router-dom";
import { useState } from "react";
function Register() {
  const navigate = useNavigate();

  function GoToLogin() {
    navigate("/login");
  }

  interface User{
    uemail:string;
    uusername:string;
    upassword:string;
  }


  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  function handelEmailChange(e: React.ChangeEvent<HTMLInputElement>) {
    setEmail(e.target.value);
  }

  function handelUsernameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUsername(e.target.value);
  }

  function handelPasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setPassword(e.target.value);
  }

  const createUser = async(e:React.MouseEvent<HTMLButtonElement>)=>{
    e.preventDefault();
    const newuser:User={
        uemail:email,
        uusername:username,
        upassword:password
    }

    const response = await fetch ("http://localhost:5000/register",{
        method:"POST",
        headers:{
            "content-type": "application/json",
        },
        body:JSON.stringify(newuser)
        
    });
    console.log(response);
    const data=await response.json();
    console.log(data);

  }

  return (
    <>
      <form>
        <div className="form-row">
          <div className="form-group col-md-6">
            <label htmlFor="inputEmail4">Email</label>
            <input
              type="email"
              className="form-control"
              id="inputEmail4"
              placeholder="Email"
              onChange={handelEmailChange}
              value={email}
            />
          </div>
          <div className="form-group col-md-6">
            <label htmlFor="inputPassword4">Password</label>
            <input
              type="password"
              className="form-control"
              id="inputPassword4"
              placeholder="Password"
              onChange={handelPasswordChange}
              value={password}
            />
          </div>
        </div>
        <div className="form-group">
          <label htmlFor="inputUsername">UserName</label>
          <input
            type="text"
            className="form-control"
            id="inputUsername"
            placeholder="Username"
            onChange={handelUsernameChange}
              value={username}
          />
        </div>

        <button type="submit" onClick={createUser} className="btn btn-primary">
          Sign in
        </button>
      </form>
      <button onClick={GoToLogin}>Login Now</button>
    </>
  );
}

export default Register;
