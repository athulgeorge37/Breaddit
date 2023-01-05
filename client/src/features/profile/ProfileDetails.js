import { useState } from "react";
import { useParams } from "react-router-dom";
import { useCurrentUser } from "../../context/CurrentUser/CurrentUserProvider";

import ReadProfile from "./ReadProfileV2";
import EditProfile from "./EditProfile";

function ProfileDetails() {
    const { current_user } = useCurrentUser();

    const { username_route } = useParams();

    const [toggle_edit_page, set_toggle_edit_page] = useState(false);

    return (
        <div className="ProfileDetails">
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
                    <ReadProfile set_toggle_edit_page={set_toggle_edit_page} />
                )}
            </>
        </div>
    );
}

export default ProfileDetails;
