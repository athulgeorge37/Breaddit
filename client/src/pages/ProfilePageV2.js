import "./ProfilePageV2.scss";

// hooks
import { useLocation, useParams } from "react-router-dom";

// components
import { Outlet, NavLink } from "react-router-dom";

function ProfilePageV2() {
    return (
        <div className="ProfilePageV2">
            <ProfileNavBar />
            <div className="profile_page_outlet">
                <Outlet />
            </div>
        </div>
    );
}

function ProfileNavBar() {
    const { username_route } = useParams();

    return (
        <div className="ProfileNavBar">
            <div className="links">
                <NavLink to={`/user/${username_route}/profile`}>
                    Profile
                </NavLink>
                <NavLink to={`/user/${username_route}/posts`}>Posts</NavLink>
            </div>
        </div>
    );
}

export default ProfilePageV2;
