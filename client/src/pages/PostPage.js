// style import
import "./PostPage.scss";

import { useLocation, useParams } from "react-router-dom";

// feature  component imports
import AddComment from "../features/comment/AddComment";

import CommentSectionInfiniteScroll from "../features/comment/CommentSectionInfiniteScroll";

import DynamicPostCard from "../features/post/DynamicPostCard";

function PostPage() {
    const { post_id_route } = useParams();
    const post_id = parseInt(post_id_route);

    const location = useLocation();

    return (
        <div className="PostPage">
            <DynamicPostCard post_id={post_id} location={location} />

            <div className="add_new_comment">
                <AddComment
                    placeholder="Add Comment"
                    btn_text="Comment"
                    comment_type="comment"
                    post_id={post_id}
                />
            </div>

            <CommentSectionInfiniteScroll post_id={post_id} />
        </div>
    );
}

export default PostPage;
