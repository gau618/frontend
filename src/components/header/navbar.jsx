import React, { useState } from 'react';
import './Layout.scss';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <>
      <nav className="navbar">
        <div className="navbar__logo">MyApp</div>
        <div className="navbar__toggle" onClick={toggleSidebar}>
          ☰
        </div>
        <ul className="navbar__links">
          <li><a href="/">Home</a></li>
          <li><a href="/profile">Profile</a></li>
          <li><a href="/logout">Logout</a></li>
        </ul>
      </nav>

      <div className={`sidebar ${isOpen ? 'open' : ''}`}>
        <ul>
          <li><a href="/" onClick={toggleSidebar}>Home</a></li>
          <li><a href="/profile" onClick={toggleSidebar}>Profile</a></li>
          <li><a href="/logout" onClick={toggleSidebar}>Logout</a></li>
        </ul>
      </div>

      {isOpen && <div className="overlay" onClick={toggleSidebar}></div>}
    </>
  );
}
