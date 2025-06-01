import { useState, useContext } from "react";
import { NavLink } from "react-router-dom";
import { defaultUserContext } from "../Layouts/MusicLayout";

function MusicNavbar() {
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const userContext = useContext(defaultUserContext);
  if (!userContext) {
    throw new Error("MusicNavbar must be used within a Provider");
  }

  const { setUserDetails, userdetails } = userContext;

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  
  const logout = () => {
    setUserDetails(null); 
    sessionStorage.removeItem("userdetails"); 
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand d-flex align-items-center" href="/main">
        <img
          src="src/assets/logo/voltify-logo-image-only.png"
          width="50"
          height="50"
          className="d-inline-block align-top"
          alt="no logo found"
        />
        <img
          src="src/assets/logo/voltify-logo-text-only.png"
          width="50"
          height="50"
          className="d-inline-block align-top"
          alt="no logo found"
        />
      </a>

      <button
        className="navbar-toggler"
        type="button"
        onClick={handleNavCollapse}
        aria-controls="navbarSupportedContent"
        aria-expanded={!isNavCollapsed}
        aria-label="Toggle navigation"
      >
        <span className="navbar-toggler-icon"></span>
      </button>

      <div
        className={`${isNavCollapsed ? "collapse" : ""} navbar-collapse`}
        id="navbarSupportedContent"
      >
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink to="/main" className="nav-link">
              Home
            </NavLink>
          </li>
          <li className="nav-item">
          <NavLink
  to="/userprofiledisplay"
  className="nav-link"
  onClick={() => {
    if (userdetails?.uid) {
      sessionStorage.setItem("selectedUserId", userdetails.uid);
    }
  }}
>
  {userdetails?.uusername || "guestid"}
</NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/playlists" className="nav-link">
              Playlists
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/upload" className="nav-link">
              Upload Songs
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/liked" className="nav-link">
              View Liked
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/" className="nav-link" onClick={logout}>
              Log out
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
}

export default MusicNavbar;