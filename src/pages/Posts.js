import { useEffect, useState } from 'react';
import './Posts.scss';

import CreatePost from '../components/CreatePost';
import PostContent from '../components/PostContent';

import { get_item_local_storage, set_item_local_storage } from '../helper_functions/local_storage';



function Posts() {

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
        }

    }, [])


  return (
    <div className="Posts_Page">
        
            <CreatePost 
                set_all_posts={set_all_posts}
            />

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
                                set_all_posts={set_all_posts}
                            />
                        )
                    })}
                </div>
            }
        
        
    </div>
  )
}

export default Posts
