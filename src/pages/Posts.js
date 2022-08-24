import React, { useState, useEffect, useContext } from 'react';
import './Posts.scss';

import CreatePost from '../components/CreatePost';
import PostContent from '../components/PostContent';

import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

// exporting so we can acces this context in useEditPost file
export const All_Posts_Context = React.createContext();

function Posts() {

    // all_posts is passed to AvailablePosts component to render
    // all of them with the appropriate
    const [all_posts, set_all_posts] = useState([]);

    useEffect(() => {
        // called on initial Post Page load
        // we check if there are any posts in local storage and set it to that
        // otherwise just a list
        const available_posts = get_item_local_storage("Available_Posts")

        if (available_posts !== null) {
            set_all_posts(available_posts)
        } else {
            set_item_local_storage("Available_Posts", [])
            set_all_posts([])  // might be redundant, cus we areleady have it initalised as []
        }

    }, [])


  return (
    <div className="Posts_Page">
        <All_Posts_Context.Provider value={{set_all_posts}}>

            <CreatePost/>

            <div className="All_Posts">
                {all_posts.map((post_details, key) => {
                    return (
                        <PostContent 
                            post_details={post_details}
                            key={key}
                        />
                    )
                })}
            </div>

        </All_Posts_Context.Provider>
        
    </div>
  )
}

export default Posts
