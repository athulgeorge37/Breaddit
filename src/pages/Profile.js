// styles
import './Profile.scss';

// components
import EditProfile from '../components/EditProfile';
import ReadProfile from '../components/ReadProfile';
import PostContent from '../components/PostContent';

// hooks
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// helper functions
import { get_item_local_storage } from '../helper_functions/local_storage';
import { get_user_details } from '../helper_functions/get_user_details';


const initialise_user_posts = () => {
 
    const all_user_posts = []
    let all_posts = get_item_local_storage("Available_Posts")
    if (all_posts === null) {
        all_posts = []
    }

    let current_author = get_item_local_storage("Current_User")
    for (const post of all_posts){
        if (post.post_author === current_author){
            all_user_posts.push(post)
        }
    }
    return all_user_posts

}


function Profile() {

    const navigate = useNavigate();

    const [toggle_edit_page, set_toggle_edit_page] = useState(false);

    const [all_user_posts, set_all_user_posts] = useState(initialise_user_posts());


   

    return (
        <div className='Profile_Page'>
            {
                get_user_details(get_item_local_storage("Current_User")).user_id === "unknown"
                ?
                <div>
                    To view your profile, please 
                    <button 
                        onClick={() => navigate("/signin")}
                    >
                        Sign In
                    </button>
                </div>
                :
                <>
                    {
                        toggle_edit_page
                        ?
                        <EditProfile 
                            set_toggle_edit_page={set_toggle_edit_page}
                        />
                        :
                        <div className='read_profile_div'>
                            <ReadProfile 
                                set_toggle_edit_page={set_toggle_edit_page}
                            />

                            <div className='user_posts'>
                                {
                                    all_user_posts.length === 0
                                    ?
                                    <div className='no_posts'>
                                        You have not made any posts
                                        <button 
                                            onClick={() => navigate("/posts")}
                                        >
                                            Create Post
                                        </button>
                                    </div>
                                    :
                                    <div className="All_Posts">
                                        {all_user_posts.map((post_details) => {
                                            return (
                                                <PostContent 
                                                    post_details={post_details}
                                                    key={post_details.post_id}
                                                    set_all_posts={set_all_user_posts}
                                                />
                                            )
                                        })}
                                    </div>
                                    
                                }
                            </div>
                        </div>
                    }
                </>
            }
           
        </div>
    )
}

export default Profile