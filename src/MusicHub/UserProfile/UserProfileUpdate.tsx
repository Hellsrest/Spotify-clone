import { useState, useContext } from "react";
import { defaultUserContext } from "../../Layouts/MusicLayout";

function UserProfileUpdate() {
  const userContext = useContext(defaultUserContext);
  if (!userContext) {
    throw new Error("MusicNavbar must be used within a Provider");
  }
  const {userdetails } = userContext;

  const [uusername, setUusername] = useState<string>(userdetails?.uusername || "");
  const [uemail, setUemail] = useState<string>(userdetails?.uemail || "");
  const [upassword, setUpassword] = useState<string>(userdetails?.upassword || "");

  interface uuser {
    id:string;
    uusername:string;
    uemail: string;
    upassword: string;
  }

  function handleUsernamechange(e: React.ChangeEvent<HTMLInputElement>) {
    setUusername(e.target.value);
  }

  function handleEmailchange(e: React.ChangeEvent<HTMLInputElement>) {
    setUemail(e.target.value);
  }

  function handlePasswordChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUpassword(e.target.value);
  }

  const updateProfile=async(e:React.MouseEvent<HTMLButtonElement>)=>{
    e.preventDefault();
    const updatedata: uuser = {
        id:userdetails?.uid||"",
        uusername:uusername,
        uemail: uemail,
        upassword: upassword,
      };
      console.log(updatedata);
      const response = await fetch("http://localhost:5000/updateuser", {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(updatedata),
      });
      console.log(response);
  }

  
  return (
    <>
      <form className="row g-3">
        <div className="mb-3">
          <label htmlFor="formGroupExampleInput" className="form-label">
            Username
          </label>
          <input
            type="text"
            className="form-control"
            id="formGroupExampleInput"
            placeholder="Example input placeholder"
            value={uusername}
            onChange={handleUsernamechange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="formGroupExampleInput2" className="form-label">
            Email
          </label>
          <input
            type="text"
            className="form-control"
            id="formGroupExampleInput2"
            placeholder="Another input placeholder"
            value={uemail}
            onChange={handleEmailchange}
          />
        </div>
        <div className="mb-3">
          <label htmlFor="formGroupExampleInput" className="form-label">
           Password
          </label>
          <input
            type="text"
            className="form-control"
            id="formGroupExampleInput"
            placeholder="Example input placeholder"
            value={upassword}
            onChange={handlePasswordChange}
          />
        </div>
        <button type="submit" onClick={updateProfile} className="btn btn-primary">
          Upload
        </button>
      </form>
    </>
  );
}
export default UserProfileUpdate;
