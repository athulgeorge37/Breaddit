// styles
import "./ProfilePage.scss";

// components
import EditProfile from "../features/profile/EditProfile";
import ReadProfile from "../features/profile/ReadProfile";

// hooks
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { make_profile_visit } from "../api/ProfileVisitRequests";

import { get_last_minute } from "../helper/get_list_of_dates";

import { useQuery } from "@tanstack/react-query";
import { useCurrentUser } from "../context/CurrentUser/CurrentUserProvider";

function ProfilePage() {
    const navigate = useNavigate();

    const { current_user } = useCurrentUser();

    const { username_route } = useParams();

    const [toggle_edit_page, set_toggle_edit_page] = useState(false);

    const { data, refetch } = useQuery(
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

    // console.log(data);

    useEffect(() => {
        // tries to make post requsest of profile visit on first render
        // whenever the username_route changes
        refetch();
    }, [username_route]);

    return (
        <div className="Profile_Page">
            {current_user.authenticated ? (
                <>
                    {username_route === current_user.username ? (
                        <>
                            {toggle_edit_page ? (
                                <EditProfile
                                    set_toggle_edit_page={set_toggle_edit_page}
                                />
                            ) : (
                                <ReadProfile
                                    set_toggle_edit_page={set_toggle_edit_page}
                                />
                            )}
                        </>
                    ) : (
                        <ReadProfile
                            set_toggle_edit_page={set_toggle_edit_page}
                        />
                    )}
                </>
            ) : (
                <div className="not_signed_in">
                    To view profiles, please
                    <button
                        onClick={() =>
                            setTimeout(() => navigate("/signin"), 1000)
                        }
                    >
                        Sign In
                    </button>
                </div>
            )}
        </div>
    );
}

export default ProfilePage;
