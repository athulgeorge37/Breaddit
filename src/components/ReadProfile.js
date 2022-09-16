import ProfilePicture from '../components/ProfilePicture';
import { get_user_details } from '../helper_functions/get_user_details';
import { get_item_local_storage } from '../helper_functions/local_storage';
import { useNavigate } from 'react-router-dom';
import './ReadProfile.scss';

import { remove_item_local_storage } from '../helper_functions/local_storage';

function ReadProfile({ set_toggle_edit_page }) {

    const user_details = get_user_details(get_item_local_storage("Current_User"));

    const navigate = useNavigate();

    const handle_sign_out = () => {
        remove_item_local_storage("Current_User")
        navigate("/signin")
    }

    return (
        <div className="read_only_profile_page">
            <div className="section_one">
                <ProfilePicture 
                    profile_picture_url={user_details.profile_picture_url}
                />

                <div className="name_and_date_joined">
                    <div className="username">{user_details.username}</div>
                    <div className="date_joined">{user_details.date_joined}</div>
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
                        user_details.about_me === ""
                        ?
                        "Click Edit Profile to add your own bio"
                        :
                        user_details.about_me
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
                        Sign Out
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ReadProfile