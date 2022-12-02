// style import
import "./PostPage.scss";

import { useParams } from "react-router-dom";

// feature  component imports
import AddComment from "../features/comment/AddComment";

import CommentSectionInfiniteScroll from "../features/comment/CommentSectionInfiniteScroll";

import DynamicPostCard from "../features/post/DynamicPostCard";
import { useQueryClient } from "@tanstack/react-query";

function PostPage() {
    const { post_id_route } = useParams();
    const post_id = parseInt(post_id_route);

    const queryClient = useQueryClient();

    return (
        <div className="PostPage">
            <DynamicPostCard post_id={post_id} />

            <AddComment
                execute_after_add_comment={() => {
                    queryClient.invalidateQueries([
                        "comments_of_post_id",
                        post_id,
                    ]);
                }}
                placeholder="Add Comment"
                btn_text="Comment"
                comment_type="comment"
                post_id={post_id}
            />

            <CommentSectionInfiniteScroll post_id={post_id} />
        </div>
    );
}

export default PostPage;
