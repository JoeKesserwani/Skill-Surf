import React, { useState } from "react";
import { Link } from "react-router-dom";

const HamburgerMenu = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {isOpen && <div className="overlay" onClick={closeMenu}></div>}

      <div className="hamburger-container">
        <div className="hamburger" onClick={toggleMenu}>
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </div>

        <div className={`sidebar ${isOpen ? "open" : ""}`}>
          <Link to="/">Home</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/orders">Notifications</Link>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
