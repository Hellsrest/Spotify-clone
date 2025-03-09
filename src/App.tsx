import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./LandingPages/Homepage";
import AboutUs from "./LandingPages/AboutUs";
import ContactUs from "./LandingPages/ContactUs";

import Layout from "./Layouts/Layout";
import MusicLayout from "./Layouts/MusicLayout";

import Login from "./Auth/Login";
import Register from "./Auth/Register";

import MainHub from "./MusicHub/MainHub";
import MusicUpload from "./MusicHub/MusicUpload";
import MusicLiked from "./MusicHub/MusicLiked";

import UserProfile from "./MusicHub/UserProfile";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout><Homepage/></Layout>}/>
          <Route path="/aboutus" element={<Layout><AboutUs/></Layout>}/>
          <Route path="/contactus" element={<Layout><ContactUs/></Layout>}/>
          <Route path="/login" element={<Layout><Login/></Layout>}/>
          <Route path="/register" element={<Layout><Register/></Layout>}/>
          <Route path="/main" element={<MusicLayout><MainHub/></MusicLayout>}/>
          <Route path="/upload" element={<MusicLayout><MusicUpload/></MusicLayout>}/>
          <Route path="/liked" element={<MusicLayout><MusicLiked/></MusicLayout>}/>
          <Route path="/userprofile" element={<MusicLayout><UserProfile/></MusicLayout>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App;
