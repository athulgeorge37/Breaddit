import "./PostContent.scss";
import CloudinaryImage from "../../components/CloudinaryImage";
import ParsedText from "../../components/form/ParsedText";
import DOMPurify from "dompurify";

function PostContent({ post_title, post_image, post_text }) {
    return (
        <div className="display_text">
            <h1
                className="Title"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(post_title),
                }}
            />
            {post_image !== null && (
                <div className="image_display">
                    <CloudinaryImage
                        image_url={post_image}
                        alt="post_image"
                        t
                    />
                </div>
            )}
            <ParsedText>{post_text}</ParsedText>
        </div>
    );
}

export default PostContent;
