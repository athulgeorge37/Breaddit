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
import { get_user_details } from "../api/UserRequests";

// ui
import Loading from "../components/ui/Loading";

// helper
import { get_last_minute } from "../helper/get_list_of_dates";
import ProfilePicture from "../features/profile/profile_picture/ProfilePicture";

function ProfilePage() {
    const { current_user } = useCurrentUser();

    const { username_route } = useParams();

    const { data, isLoading, isError } = useQuery(
        ["user_details", { username: username_route }],
        () => {
            return get_user_details(username_route);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log("user_details error", data.error);
                    return;
                }
                // set_user_id(data.user_details.id);
            },
        }
    );

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

    if (isLoading) {
        return <Loading />;
    }

    if (isError) {
        console.log(data);
        return <p>An Error has occured, check console</p>;
    }

    return (
        <div className="ProfilePage">
            <ProfileNavBar user_details={data.user_details} />
            <div className="profile_page_outlet">
                <Outlet />
            </div>
        </div>
    );
}

function ProfileNavBar({ user_details }) {
    const { username_route } = useParams();

    return (
        <div className="ProfileNavBar">
            <div className="user">
                <ProfilePicture
                    username={user_details.username}
                    profile_picture_url={user_details.profile_pic}
                />
                <h2>{username_route}</h2>
            </div>
            <div className="links">
                <NavLink to={`/user/${username_route}/profile`}>
                    Profile
                </NavLink>
                <NavLink to={`/user/${username_route}/posts`}>Posts</NavLink>
                <NavLink to={`/user/${username_route}/comments`}>
                    Comments / Replies
                </NavLink>
            </div>
        </div>
    );
}

export default ProfilePage;
