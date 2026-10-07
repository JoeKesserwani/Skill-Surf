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
        <button
          type="button"
          className="hamburger"
          onClick={toggleMenu}
          aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={isOpen}
          aria-controls="site-navigation"
        >
          <div className="bar"></div>
          <div className="bar"></div>
          <div className="bar"></div>
        </button>

        <div
          id="site-navigation"
          className={`sidebar ${isOpen ? "open" : ""}`}
          aria-hidden={!isOpen}
        >
          <Link to="/" onClick={closeMenu}>Home</Link>
          <Link to="/profile" onClick={closeMenu}>Profile</Link>
          <Link to="/orders" onClick={closeMenu}>Notifications</Link>
          <Link to="/admin" onClick={closeMenu}>Admin</Link>
        </div>
      </div>
    </>
  );
};

export default HamburgerMenu;
