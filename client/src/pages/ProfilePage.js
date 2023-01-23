import "./ProfilePage.scss";

// hooks
import { useEffect } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

// components
import { Outlet, NavLink } from "react-router-dom";

//api
import { make_profile_visit } from "../api/ProfileVisitRequests";

// helper
import { get_last_minute } from "../helper/get_list_of_dates";

function ProfilePage() {
    const { current_user } = useCurrentUser();

    const { username_route } = useParams();

    const { refetch: add_profile_visit } = useQuery(
        ["profile_visit_query"],
        () => {
            if (
                current_user.role === "user" &&
                username_route !== current_user.username
            ) {
                return make_profile_visit(
                    get_last_minute(),
                    new Date(),
                    username_route
                );
            } else {
                return null;
            }
        },
        {
            enabled: false,
            staleTime: Infinity,
            // prevents the request from being made multiple times on render
        }
    );

    useEffect(() => {
        // tries to make post requsest of profile visit on first render
        // whenever the username_route changes
        add_profile_visit();
    }, [username_route]);

    return (
        <div className="ProfilePage">
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

export default ProfilePage;
