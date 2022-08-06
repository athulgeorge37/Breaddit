import React, { useEffect, useState } from 'react';

import './CommentSection.scss';

import Comment from './Comment';


function CommentSection(props) {

    const [all_comments, set_all_comments] = useState([]);

    useEffect(() => {

        let all_posts = JSON.parse(localStorage.getItem("Available_Posts"))

        for (const post of all_posts) {
            if (post.post_id === props.post_id) {
                set_all_comments(post.post_comments)
            }
        }

    }, [])


  return (
    <div className="Comment_Section">
        {
            all_comments.length > 0 
            ?
            all_comments.map((comment, map_id) => {
                return (
                    <Comment 
                        post_id={props.post_id}
                        comment={comment} 
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