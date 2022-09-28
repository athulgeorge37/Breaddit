// styles
import './Profile.scss';

// components
import EditProfile from '../components/EditProfile';
import ReadProfile from '../components/ReadProfile';
import PostContent from '../components/PostContent';
import PostContent2 from '../components/PostContent2';

// hooks
import { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';

// context import
import { VALID_USER_CONTEXT } from '../App';

// rest api requert imports
import { get_curr_user_details } from "../rest_api_requests/UserRequests";
import { get_all_posts_by_curr_user } from '../rest_api_requests/PostRequests';




function Profile() {

    const { current_user } = useContext(VALID_USER_CONTEXT);

    const navigate = useNavigate();

    const [all_user_posts, set_all_user_posts] = useState([]);

    const [toggle_edit_page, set_toggle_edit_page] = useState(false);
    const [curr_user_details, set_curr_user_details] = useState({
        email: "unknown",
        username: "uknown",
        profile_pic: null,
        createdAt: "2000-01-01T01:01:01.000Z",
        bio: null,

    });

    useEffect(() => {
        initialise_curr_user_details()
        initialise_curr_user_posts()
    }, [])

    const initialise_curr_user_posts = async () => {
         // called on initial Post Page load
        // we check if there are any posts in local storage and set it to that
        // otherwise just a list
        const response = await get_all_posts_by_curr_user();
            
        if (response.error) {
            console.log(response)
            return
        } 
        set_all_user_posts(response.all_posts)
        // console.log("profile posts", response)
    }

    const initialise_curr_user_details = async () => {
        // called on initial Post Page load
       // we check if there are any posts in local storage and set it to that
       // otherwise just a list
       const response = await get_curr_user_details();
           
        if (response.error) {
            console.log(response)
            return
        }

        // console.log(response.user_details)
        set_curr_user_details(response.user_details)
   }

    const remove_post_from_list = (post_to_remove_id) => {

        const new_post_list = all_user_posts.filter((my_post) => {
            return my_post.id !== post_to_remove_id
        })

        set_all_user_posts(new_post_list)
    }
   

    return (
        <div className='Profile_Page'>
            {
                current_user.authenticated === false
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
                            curr_user_details={curr_user_details}
                            set_curr_user_details={set_curr_user_details}
                        />
                        :
                        <div className='read_profile_div'>
                            <ReadProfile 
                                set_toggle_edit_page={set_toggle_edit_page}
                                curr_user_details={curr_user_details}
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
                                                <PostContent2
                                                    key={post_details.id}
                                                    post_details={post_details}
                                                    remove_post_from_list={remove_post_from_list}
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