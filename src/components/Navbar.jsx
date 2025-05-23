import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    
    const navigate = useNavigate();

    function logout() {
        localStorage.removeItem("access_token");
        localStorage.removeItem("user");
        navigate("/login");
    }


    return (
        <nav className="navbar navbar-expand-lg navbar-light bg-body-tertiary">
            <div className="container">
                <button
                    data-mdb-collapse-init
                    className="navbar-toggler"
                    type="button"
                    data-mdb-target="#navbarButtonsExample"
                    aria-controls="navbarButtonsExample"
                    aria-expanded="false"
                    aria-label="Toggle navigation"
                >
                    <i className="fas fa-bars"></i>
                </button>

                <div className="collapse navbar-collapse" id="navbarButtonsExample">
                    <ul className="navbar-nav me-auto mb-2 mb-lg-0">
                        <Link to="/" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-link" href="#">INVENTARIS APP</span>
                        </Link>

                        <Link to="/member" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-link" href="#">Member</span>
                        </Link>

                        <Link to="/buku" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-link" href="#">Buku</span>
                        </Link>

                        <Link to="/peminjaman" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-link" href="#">Peminjaman</span>
                        </Link>

                        <Link to="/denda" className="nav-item" style={{ textDecoration: 'none' }}>
                            <span className="nav-link" href="#">Denda</span>
                        </Link>
                    </ul>

                    <div className="d-flex align-items-center">
                        <Link to="/login" data-mdb-ripple-init type="button" className="btn btn-primary me-3">
                            Login
                        </Link>

                        <div data-mdb-ripple-init type="button" className="btn btn-danger me-3" onClick={logout}>
                            Logout
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
}