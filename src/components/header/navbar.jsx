import React, { Fragment, useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./navbar.scss";

function classNames(...classes) {
  return classes.filter(Boolean).join(" ");
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleUserMenu = () => {
    setUserMenuOpen(!userMenuOpen);
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    await logout();
    setUserMenuOpen(false);
  };

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close menus on route change
  useEffect(() => {
    setIsOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const navigationItems = [
    { name: 'Home', path: '/', icon: '🏠' },
    { name: 'Profile', path: '/profile', icon: '👤' },
    { name: 'Enter Code', path: '/code', icon: '🔐' },
  ];

  return (
    <>
      <nav className={classNames("navbar", scrolled && "navbar--scrolled")}>
        <div className="navbar__container">
          {/* Logo */}
          <div className="navbar__brand">
            <Link to="/" className="navbar__logo">
              <div className="navbar__logo-icon">
                <span>🎯</span>
              </div>
              <span className="navbar__logo-text">InterviewPro</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="navbar__nav">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={classNames(
                  "navbar__nav-item",
                  location.pathname === item.path && "navbar__nav-item--active"
                )}
              >
                <span className="navbar__nav-icon">{item.icon}</span>
                {item.name}
              </Link>
            ))}
            
            {/* Admin Link */}
            {user?.role === "admin" && (
              <Link
                to="/admin"
                className={classNames(
                  "navbar__nav-item navbar__nav-item--admin",
                  location.pathname === "/admin" && "navbar__nav-item--active"
                )}
              >
                <span className="navbar__nav-icon">⚙️</span>
                Admin
              </Link>
            )}
          </div>

          {/* User Menu / Auth Buttons */}
          <div className="navbar__actions">
            {user ? (
              <div className="navbar__user">
                <button
                  onClick={toggleUserMenu}
                  className="navbar__user-button"
                  aria-expanded={userMenuOpen}
                >
                  <div className="navbar__user-avatar">
                    {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                  </div>
                  <span className="navbar__user-name">{user.name || 'User'}</span>
                  <svg
                    className={classNames(
                      "navbar__user-chevron",
                      userMenuOpen && "navbar__user-chevron--open"
                    )}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* User Dropdown */}
                {userMenuOpen && (
                  <div className="navbar__user-menu">
                    <div className="navbar__user-menu-header">
                      <div className="navbar__user-menu-avatar">
                        {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
                      </div>
                      <div>
                        <div className="navbar__user-menu-name">{user.name || 'User'}</div>
                        <div className="navbar__user-menu-email">{user.email}</div>
                        {user.role && (
                          <span className="navbar__user-menu-role">{user.role}</span>
                        )}
                      </div>
                    </div>
                    <hr className="navbar__user-menu-divider" />
                    <Link to="/profile" className="navbar__user-menu-item">
                      <span>👤</span>
                      Profile Settings
                    </Link>
                    {user.role !== "admin" && (
                      <Link to="/admin/auth" className="navbar__user-menu-item">
                        <span>🔑</span>
                        Admin Access
                      </Link>
                    )}
                    <button onClick={handleLogout} className="navbar__user-menu-item navbar__user-menu-item--logout">
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="navbar__auth">
                <Link to="/auth" className="navbar__auth-link">
                  Sign In
                </Link>
                <Link to="/auth?mode=signup" className="navbar__auth-button">
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={toggleSidebar}
              className="navbar__mobile-toggle"
              aria-label="Toggle menu"
            >
              <span className={classNames("hamburger", isOpen && "hamburger--active")}>
                <span></span>
                <span></span>
                <span></span>
              </span>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Sidebar */}
      <div className={classNames("mobile-sidebar", isOpen && "mobile-sidebar--open")}>
        <div className="mobile-sidebar__header">
          <div className="mobile-sidebar__logo">
            <span>🎯</span>
            <span>InterviewPro</span>
          </div>
          <button onClick={toggleSidebar} className="mobile-sidebar__close">
            ✕
          </button>
        </div>

        <div className="mobile-sidebar__content">
          {/* User Info (Mobile) */}
          {user && (
            <div className="mobile-sidebar__user">
              <div className="mobile-sidebar__user-avatar">
                {user.name ? user.name.charAt(0).toUpperCase() : '👤'}
              </div>
              <div>
                <div className="mobile-sidebar__user-name">{user.name || 'User'}</div>
                <div className="mobile-sidebar__user-email">{user.email}</div>
              </div>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="mobile-sidebar__nav">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={toggleSidebar}
                className={classNames(
                  "mobile-sidebar__nav-item",
                  location.pathname === item.path && "mobile-sidebar__nav-item--active"
                )}
              >
                <span>{item.icon}</span>
                {item.name}
              </Link>
            ))}

            {user?.role === "admin" && (
              <Link
                to="/admin"
                onClick={toggleSidebar}
                className="mobile-sidebar__nav-item mobile-sidebar__nav-item--admin"
              >
                <span>⚙️</span>
                Admin Panel
              </Link>
            )}

            {!user || user.role !== "admin" ? (
              <Link
                to="/admin/auth"
                onClick={toggleSidebar}
                className="mobile-sidebar__nav-item"
              >
                <span>🔑</span>
                Admin Login
              </Link>
            ) : null}
          </nav>

          {/* Auth Actions (Mobile) */}
          <div className="mobile-sidebar__actions">
            {user ? (
              <button
                onClick={(e) => {
                  handleLogout(e);
                  toggleSidebar();
                }}
                className="mobile-sidebar__logout"
              >
                <span>🚪</span>
                Sign Out
              </button>
            ) : (
              <div className="mobile-sidebar__auth">
                <Link to="/auth" onClick={toggleSidebar} className="mobile-sidebar__auth-link">
                  Sign In
                </Link>
                <Link to="/auth?mode=signup" onClick={toggleSidebar} className="mobile-sidebar__auth-button">
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Overlay */}
      {(isOpen || userMenuOpen) && (
        <div
          className="overlay"
          onClick={() => {
            setIsOpen(false);
            setUserMenuOpen(false);
          }}
        />
      )}
    </>
  );
}
