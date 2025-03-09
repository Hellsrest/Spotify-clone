import { defaultUserContext } from "../Layouts/MusicLayout";
import { useContext, useState , useEffect} from "react";

function MusicUpload() {
  const userdetailscontext = useContext(defaultUserContext);
  if (!userdetailscontext) {
    throw new Error("useContext must be used within a Provider");
  }

  const { userdetails } = userdetailscontext;
  const [musicname, setMusicName] = useState("");
  const [Uploadedmusic, setUploadedmusic] = useState<string>("");
  const [Uploadedmusicfile, setUploadedmusicfile] = useState<File | null>(null);
  const [trackname, setTrackname] = useState<string>("");
  const [musictitle, setMusictitle] = useState<string>("");

  function handelmusicname(e: React.ChangeEvent<HTMLInputElement>) {
    setMusicName(e.target.value);
  }

  function handelmusicupload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    console.log(file?.name);
    if (file) {
      const url = URL.createObjectURL(file);
      setUploadedmusic(url);
      setUploadedmusicfile(file);
      setTrackname(file?.name);
      setMusictitle(musicname);
    }
  }

  const uploadMusic = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    if (!Uploadedmusicfile) {
      alert("No file selected.");
      return;
    }
    console.log(Uploadedmusicfile);
    console.log(trackname);
    console.log(musictitle);
    console.log(userdetails?.uid);
    const formData = new FormData();
    formData.append("trackname", trackname);
    formData.append("musictitle", musictitle);
    formData.append("tracklocation", Uploadedmusicfile, Uploadedmusicfile.name);
    formData.append("trackuploader", userdetails?.uid || "");

    console.log(formData);
    const response = await fetch("http://localhost:5000/musicupload", {
      method: "post",
      body: formData,
    });
    console.log(response);
    if (response.ok) {
      const data = await response.json();
      console.log(data);
    }
  };

  useEffect(() => {
    setMusictitle(musicname);
  }, [musicname]);

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
