import './FollowerCard.scss';

import ProfilePicture from '../components/ProfilePicture';
import Button from '../components/Button';

function FollowerCard({ state_object, set_state_object, state_name, state_type }) {




    return (
        <div className='FollowerCard'>
            <div className="header">
                <div className="heading"><b>{state_name}</b></div>
                <Button 
                    handle_btn_click={() => {
                        set_state_object({
                            ...state_object,
                            show_data: false
                        })
                    }}
                    type="cancel"
                    span_text="Cancel"
                    img_name="cancel"
                />
            </div>
            {
                state_object.show_data
                &&
                <div className="all_followers">
                    {state_object.data.map((item) => {
                        let user_details = "follower"
                        if (state_type === "follower") {
                            user_details = item.followed_by_user_details
                        } else if (state_type === "following") {
                            user_details = item.user_id_details
                        } else {
                            return
                        }

                        return (
                            <div className="follower_card" key={item.id}>
                                <div className="profile_pic_and_username">
                                    <ProfilePicture
                                        profile_picture_url={user_details.profile_pic}
                                        username={user_details.username}
                                    />
                                    <p>{user_details.username}</p>
                                </div>

                                <button>Following</button>
                            </div>
                        )
                    })}
                </div>
            }
        </div>
    )
}

export default FollowerCard