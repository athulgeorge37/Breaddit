import { useEffect, useState } from 'react';
import './Posts.scss';

import CreatePost from '../components/CreatePost';
import PostContent from '../components/PostContent';
import PostContent2 from '../components/PostContent2';

import { get_all_posts } from '../rest_api_requests/PostRequests';



function Posts() {

    const [all_posts2, set_all_posts2] = useState([]);

    useEffect(() => {
        initialise_all_posts()
    }, [])

    const initialise_all_posts = async () => {
        // called on initial Post Page load
        // we check if there are any posts in local storage and set it to that
        // otherwise just a list
        const response = await get_all_posts();

        if (response.error) {
            console.log(response.error)
            return
        }
        set_all_posts2(response.all_posts)
        //console.log(response.msg)
    }

    const add_post_to_list = (new_post_details) => {
        // when adding new_post_details, ensure that
        // it has all the post details including updatedAt and 
        // author_details = { username, profile_pic }

        set_all_posts2([
            ...all_posts2,
            new_post_details
        ])
    }

    const remove_post_from_list = (post_to_remove_id) => {

        const new_post_list = all_posts2.filter((my_post) => {
            return my_post.id !== post_to_remove_id
        })

        set_all_posts2(new_post_list)
    }


  return (
    <div className="Posts_Page">
        
        <CreatePost 
            add_post_to_list={add_post_to_list}
        />

        {
            all_posts2.length === 0 
            ?
            <div className="no_posts">
                There are no posts in this thread. Be the first to Post!
            </div>
            :
            <div className="All_Posts">
                {all_posts2.map((post_details) => {
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
  )
}

export default Posts
