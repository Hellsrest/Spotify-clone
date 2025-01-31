import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Homepage from "./LandingPages/Homepage";
import AboutUs from "./LandingPages/AboutUs";
import ContactUs from "./LandingPages/ContactUs";

import Layout from "./Layouts/Layout";

import Login from "./Auth/Login";
import Register from "./Auth/Register";
import MainHub from "./MusicHub/MainHub";
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
          <Route path="/main" element={<Layout><MainHub/></Layout>}/>
        </Routes>
      </Router>
    </>
  )
}

export default App;
