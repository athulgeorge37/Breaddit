import React, { useState, useEffect, createContext } from 'react';
import './Posts.scss';

import CreatePost from '../components/CreatePost';
import PostContent from '../components/PostContent';

import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';

// exporting so we can acces this context in useEditPost file
export const ALL_POSTS_CONTEXT = createContext();

function Posts() {

    // all_posts is passed to PostContent component to render
    // all of them with the appropriate data
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
            //set_all_posts([])  // might be redundant, cus we areleady have it initalised as []
        }

    }, [])

    // useEffect(() => {
    //     console.table(all_posts)
    // }, [all_posts])

  return (
    <div className="Posts_Page">
        <ALL_POSTS_CONTEXT.Provider value={{set_all_posts}}>

            <CreatePost/>

            {
                all_posts.length === 0 

                ?

                <div className="no_posts">
                    There are no posts in this thread. Be the first to Post!
                </div>

                :
                
                <div className="All_Posts">
                    {all_posts.map((post_details) => {
                        return (
                            <PostContent 
                                post_details={post_details}
                                key={post_details.post_id}
                            />
                        )
                    })}
                </div>
            }

        </ALL_POSTS_CONTEXT.Provider>
        
    </div>
  )
}

export default Posts
