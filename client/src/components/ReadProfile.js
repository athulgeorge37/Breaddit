import ProfilePicture from '../components/ProfilePicture';
import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage } from '../helper_functions/local_storage';
import { useNavigate } from 'react-router-dom';
import './ReadProfile.scss';

import { remove_item_local_storage } from '../helper_functions/local_storage';
import { useContext } from 'react';
import { VALID_USER_CONTEXT } from '../App';
import { useState } from 'react';
import { useEffect } from 'react';



import { get_current_date } from "../helper_functions/time";

function ReadProfile({ set_toggle_edit_page, curr_user_details }) {

    const navigate = useNavigate();
    const { remove_current_user } = useContext(VALID_USER_CONTEXT);

    const [is_signing_out, set_is_signing_out] = useState(false);

    


    const handle_sign_out = () => {
        set_is_signing_out(true)
        setTimeout(() => {
            navigate("/signin")

            // removing web token from localstorage and
            // updating current_user in App.js, 
            // to remove users access to certain pages
            remove_current_user()
        }, 1000)
    }

    return (
        <div className="read_only_profile_page">
            <div className="section_one">
                <ProfilePicture 
                    profile_picture_url={curr_user_details.profile_pic}
                />

                <div className="name_and_date_joined">
                    <div className="username">{curr_user_details.username}</div>
                    <div className="date_joined">{get_current_date(curr_user_details.createdAt)}</div>
                </div>
            </div>

            <div className="section_two">
                <div className="profile_stats">
                    <div className="followers count_and_text">
                        <div className="follower_count">500</div>
                        <div className="follower_text">Followers</div>
                    </div>

                    <div className="following count_and_text">
                        <div className="following_count">399</div>
                        <div className="following_text">Following</div>
                    </div>

                    <div className="bread_crumbs count_and_text">
                        <div className="bread_crumbs_count">1000</div>
                        <div className="bread_crumbs_text">Bread Crumbs</div>
                    </div>
                </div>

                <div className="about_me">
                    {
                        curr_user_details.bio === null
                        ?
                        "Click Edit Profile to add your own bio"
                        :
                        curr_user_details.bio
                    }
                </div>

                <div className="profile_btns">
                    <button 
                        className="edit_profile"
                        onClick={() => set_toggle_edit_page(true)}
                    >
                        Edit Profile
                    </button>

                    <button 
                        className="sign_out"
                        onClick={handle_sign_out}
                    >
                        {is_signing_out ? "...Signing Out" : "Sign Out"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReadProfile