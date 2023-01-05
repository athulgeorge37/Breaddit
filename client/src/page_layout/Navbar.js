// styles
import "./Navbar.scss";

// hooks
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";
import { useDarkMode } from "../context/DarkMode/DarkModeProvider";

// components
import { NavLink } from "react-router-dom";

// ui
import Toggle from "../components/ui/Toggle";
import ToolTip from "../components/ui/ToolTip";

function Navbar() {
    const { current_user } = useCurrentUser();
    const { is_dark_mode, set_is_dark_mode } = useDarkMode();

    // const determine_active_page = ({ isActive }) => {
    //     return "page_link " + (isActive ? "active" : "");
    // };

    // we determine which link is active by a.active

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

                <div className="dark_mode_toggle">
                    <ToolTip text="Light Mode" placement="bottom">
                        <button
                            type="button"
                            className="sun_icon_btn"
                            onClick={() => set_is_dark_mode(false)}
                        >
                            <svg
                                className="sun_icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                                />
                            </svg>
                        </button>
                    </ToolTip>

                    <Toggle
                        set_toggle={set_is_dark_mode}
                        default_value={is_dark_mode}
                    />

                    <ToolTip text="Dark Mode" placement="bottom">
                        <button
                            type="button"
                            className="moon_icon_btn"
                            onClick={() => set_is_dark_mode(true)}
                        >
                            <svg
                                className="moon_icon"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                                />
                            </svg>
                        </button>
                    </ToolTip>
                </div>

                <div className="links">
                    <NavLink to="/">Home</NavLink>

                    <NavLink to="/posts">Posts</NavLink>

                    {current_user.authenticated === true ? (
                        <>
                            {current_user.role === "user" && (
                                <NavLink to={`/user/${current_user.username}`}>
                                    Profile
                                </NavLink>
                            )}

                            {current_user.role === "admin" && (
                                <NavLink to="/admin_dashboard">
                                    Admin Dashboard
                                </NavLink>
                            )}
                        </>
                    ) : (
                        <>
                            <NavLink to="/signup">Sign Up</NavLink>

                            <NavLink to="/signin">Sign In</NavLink>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Navbar;
