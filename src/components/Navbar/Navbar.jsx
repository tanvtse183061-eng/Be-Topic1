import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faUser, faBars } from '@fortawesome/free-solid-svg-icons';
import { Link } from "react-router-dom";
import './Navbar.css';

export default function Navbar() {
  return (
    <header className="nav-container">
      <div className="logo">EVM CAR</div>

      <nav className="navbar">
        <ul>
          <li><Link to="/home">TRANG CHỦ</Link></li>
        </ul>
      </nav>

      <div className="actions">
        <Link to="/login" className="sign">SIGN IN</Link>
        <FontAwesomeIcon icon={faUser} className="icon-nav" />
      </div>

      <div className="bar">
        <FontAwesomeIcon icon={faBars} size="2x" />
      </div>
    </header>
  );
}