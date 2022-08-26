import React, { useEffect, useState } from 'react';

import './CommentSection.scss';

import Comment from './Comment';
import { get_item_local_storage } from '../helper_functions/local_storage';

function CommentSection({ post_details }) {

    const [all_comments, set_all_comments] = useState(post_details.post_comments);

    // useEffect(() => {

    //     let all_posts = get_item_local_storage("Available_Posts")

    //     for (const post of all_posts) {
    //         if (post.post_id === post_details.post_id) {
    //             set_all_comments(post.post_comments)
    //         }
    //     }

    // }, [])


  return (
    <div className="Comment_Section">
        {
            all_comments.length > 0 

            ?

            all_comments.map((comment, map_id) => {
                return (
                    <Comment 
                        post_id={post_details.post_id}
                        comment={comment} 
                        indented={false}
                        key={map_id}
                    />
                )
            })

            :

            <div className="No_Comments">
                No Comments
            </div>
        }
    </div>
  )
}

export default CommentSection