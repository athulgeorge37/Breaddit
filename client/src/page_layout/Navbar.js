import "./Navbar.scss";

import { NavLink } from "react-router-dom";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

function Navbar() {
    const { current_user } = useCurrentUser();

    const determine_active_page = ({ isActive }) => {
        return "page_link " + (isActive ? "active" : "");
    };

    return (
        <nav>
            <div className="nav_content">
                <div className="logo">
                    <img
                        src="../images/breaddit_logo.png"
                        alt="logo"
                        className="logo_img"
                    />
                    Breaddit
                </div>

                <div className="links">
                    <NavLink to="/" className={determine_active_page}>
                        Home
                    </NavLink>

                    <NavLink to="/posts" className={determine_active_page}>
                        Posts
                    </NavLink>

                    {current_user.authenticated === true ? (
                        <>
                            {current_user.role === "user" && (
                                <NavLink
                                    to={`/profile/${current_user.username}`}
                                    className={determine_active_page}
                                >
                                    Profile
                                </NavLink>
                            )}

                            {current_user.role === "admin" && (
                                <NavLink
                                    to="/admin_dashboard"
                                    className={determine_active_page}
                                >
                                    Admin Dashboard
                                </NavLink>
                            )}
                        </>
                    ) : (
                        <>
                            <NavLink
                                to="/signup"
                                className={determine_active_page}
                            >
                                Sign Up
                            </NavLink>

                            <NavLink
                                to="/signin"
                                className={determine_active_page}
                            >
                                Sign In
                            </NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
