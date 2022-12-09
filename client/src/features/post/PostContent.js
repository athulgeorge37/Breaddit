import "./PostContent.scss";
import CloudinaryImage from "../../components/CloudinaryImage";
import ParsedText from "../../components/form/ParsedText";
import DOMPurify from "dompurify";

function PostContent({ post_details }) {
    const { title, image, text } = post_details;
    return (
        <div className="display_text">
            <h1
                className="Title"
                dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(title),
                }}
            />
            {image !== null && (
                <div className="image_display">
                    <CloudinaryImage image_url={image} alt="post_image" t />
                </div>
            )}
            <ParsedText>{text}</ParsedText>
        </div>
    );
}

export default PostContent;
