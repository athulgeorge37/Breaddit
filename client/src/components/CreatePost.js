import { useState } from 'react';
import './CreatePost.scss';

import ProfilePicture from './ProfilePicture';
import EditPost from './EditPost';

import { useNavigate } from 'react-router-dom';

import { create_post } from '../rest_api_requests/PostRequests';

import { useNotification } from '../Contexts/Notifications/NotificationProvider';
import { useCurrentUser } from '../Contexts/CurrentUser/CurrentUserProvider';

import { motion, AnimatePresence, AnimateSharedLayout, LayoutGroup } from "framer-motion";


const MAX_POST_TEXT_CHARACTERS = 250

function CreatePost({ add_post_to_list }) {

    const add_notification = useNotification();
    const { current_user } = useCurrentUser();

    const navigate = useNavigate();

    const [expanded_view, set_expanded_view] = useState(false);

    const [post_title, set_post_title] = useState("");
    const [post_text, set_post_text] = useState("");
    const [valid_title, set_valid_title] = useState(true);
    const [image_url, set_image_url] = useState(null)


    const handle_post_submit = async () => {

        // only handling post if there is a post title
        if (post_title.trim().length === 0) {
            set_valid_title(false)
            return
        }

        // adding post to localstorage
        // handle_add_post(post_title, post_text, image_url)

        // adding post to db
        const response = await create_post(post_title, post_text, image_url)

        console.log(response)

        if (response.error) {
            return
        }

        const new_post_details = {
            ...response.new_post_details,
            author_details: {
                username: current_user.username,
                profile_pic: current_user.profile_pic
            }
        }

        // setting all_posts to reflect the changes made in the db
        add_post_to_list(new_post_details)

        set_valid_title(true)
        set_post_title("")
        set_post_text("")
        set_image_url(null)

        set_expanded_view(false)

        add_notification("Succesfully Created Post")
    }


    const handle_post_cancel = () => {
        set_expanded_view(false)
        set_valid_title(true)
        set_image_url(null)
        set_post_title("")
        set_post_text("")
    }

    return (
        <div className="Create_Post">
            <LayoutGroup>
                <AnimatePresence>
                {
                    expanded_view ?
                    
                    <>
                        {
                            current_user.authenticated
                            ?
                            <motion.div 
                                className="expanded_post_view"
                                layout
                            >
                                <h2>Create Post</h2>

                                <EditPost
                                    image_url={image_url}
                                    set_image_url={set_image_url}

                                    post_title={post_title}
                                    set_post_title={set_post_title}

                                    post_text={post_text}
                                    set_post_text={set_post_text}

                                    valid_title={valid_title}
                                />

                                <div className="characters_and_btns">
                                    
                                    <span className="characters_left">
                                        {MAX_POST_TEXT_CHARACTERS - post_text.length}
                                        {" "}
                                        characters left
                                    </span>

                                    <div className="post_btns">
                                        <button 
                                            className="cancel_btn"
                                            onClick={handle_post_cancel}
                                        >
                                            Cancel
                                        </button>

                                        <button
                                            className="post_btn"
                                            onClick={handle_post_submit}
                                        >
                                            Post
                                        </button>
                                    </div>

                                </div>
                            </motion.div>
                            :
                            <div className="redirect_from_posts">
                                Please{" "}
                                <button 
                                    className='sign_in_btn'
                                    onClick={() => navigate("/signin")}
                                >
                                    Sign In
                                </button>
                                {" "}
                                to Post
                            </div>  
                        }
                    </>

                    :

                    <motion.div 
                        className="collapsed_post_view"
                        layout
                       
                    >
                        <ProfilePicture
                            profile_picture_url={current_user.profile_pic}
                        />
                        <motion.input
                            layout 
                            type="text" 
                            placeholder="Create Post"
                            onFocus={() => set_expanded_view(true)}
                        />
                    </motion.div>
                }
                </AnimatePresence>
            </LayoutGroup>
        </div>
    )
}

export default CreatePost