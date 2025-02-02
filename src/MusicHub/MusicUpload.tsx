import { defaultUserContext } from "../Layouts/MusicLayout";
import { useContext, useState } from "react";

function MusicUpload() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  }

  interface umusic{
    trackname:string,
    tracklocation:string,
    trackuploader:string|undefined,
  }

  const { userdetails } = userdetailscontext;
  const [musicname, setMusicName] = useState("");
  const [Uploadedmusic, setUploadedmusic] = useState<string>("");
  const [trackname, setTrackname] = useState<string>("");

  function handelmusicname(e: React.ChangeEvent<HTMLInputElement>) {
    setMusicName(e.target.value);
  }
  function handelmusicupload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log(file?.name);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedmusic(url);
      setTrackname(file?.name);
    }
  }

  const uploadMusic= async (e:React.MouseEvent<HTMLButtonElement>) =>{
    e.preventDefault();
    const music:umusic={
        trackname:musicname,
        tracklocation:trackname,
        trackuploader:userdetails?.uid,
    }
    console.log(music);
    const response=await fetch("http://localhost:5000/musicupload",{
      method:"post",
      headers:{
        "content-type":"application/json",
      },
      body:JSON.stringify(music),
    });
    console.log(response);
    if(response.ok){
      const data=await response.json();
      console.log(data);
    }
    }
  

  return (
    <>
      <p>ID: {userdetails?.uid || "guestid"}</p>
      <p>Username: {userdetails?.uusername || "guest"}</p>
      <p>Email: {userdetails?.uemail || "guestemail"}</p>
      <p>Password: {userdetails?.upassword || "guestpassword"}</p>
      <p>uploadedmusic:{Uploadedmusic}</p>
      {Uploadedmusic && (
        <audio controls>
          <source src={Uploadedmusic} type="audio/mpeg" />
          Your browser does not support the audio element.
        </audio>
      )}

      <input
        type="text"
        className="form-control"
        id="inputUsername"
        placeholder="Username"
        onChange={handelmusicname}
        value={musicname}
      />
      <div className="input-group mb-3">
        <div className="custom-file">
          <input
            type="file"
            className="custom-file-input"
            id="inputGroupFile01"
            aria-describedby="inputGroupFileAddon01"
            style={{ border: "5px solid black" }}
            accept="audio/*"
            onChange={handelmusicupload}
          />
        </div>
        <button type="submit" onClick={uploadMusic} className="btn btn-primary">
          Upload
        </button>
      </div>
    </>
  );
}

export default MusicUpload;
