// style import
import "./PostPage.scss";

import { useParams } from "react-router-dom";

// feature  component imports
import AddComment from "../features/comment/AddComment";

import CommentSectionInfiniteScroll from "../features/comment/CommentSectionInfiniteScroll";

import DynamicPostCard from "../features/post/DynamicPostCard";

function PostPage() {
    const { post_id_route } = useParams();
    const post_id = parseInt(post_id_route);

    return (
        <div className="PostPage">
            <DynamicPostCard post_id={post_id} />

            <AddComment
                execute_after_add_comment={() => null}
                initial_content=""
                placeholder="Add Comment"
                btn_text="Comment"
                comment_type="comment"
                post_id={post_id}
                add_comment_or_reply_to_list={() => null}
            />

            <CommentSectionInfiniteScroll post_id={post_id} />
        </div>
    );
}

export default PostPage;
