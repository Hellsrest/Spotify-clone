import { useState } from 'react';
import { NavLink } from 'react-router-dom';

function MusicNavbar(){
  const [isNavCollapsed, setIsNavCollapsed] = useState(true);

  const handleNavCollapse = () => setIsNavCollapsed(!isNavCollapsed);

  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <a className="navbar-brand d-flex align-items-center" href="/">
        <img
          src="/logo-slug.png"
          width="50"
          height="50"
          className="d-inline-block align-top"
          alt="no logo found"
        />
        <div className="ms-2">Chat App</div>
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
        className={`${isNavCollapsed ? 'collapse' : ''} navbar-collapse`}
        id="navbarSupportedContent"
      >
        <ul className="navbar-nav ms-auto">
          <li className="nav-item">
            <NavLink
              to="/main"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Home
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/upload"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Upload Songs
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/liked"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              View liked
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink
              to="/"
              className={({ isActive }) =>
                isActive ? "nav-link active" : "nav-link"
              }
            >
              Log out
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default MusicNavbar;