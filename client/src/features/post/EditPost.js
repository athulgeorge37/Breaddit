// scss import
import "./EditPost.scss";

// hook imports
import { useRef, useState } from "react";

import { upload_image } from "../../rest_api_requests/ImageRequests";

// component imports
import TextEditor from "../../components/form/TextEditor";
import LoginInput from "../../components/form/LoginInput";
import Loading from "../../components/ui/Loading";
import CloudinaryImage from "../../components/CloudinaryImage";
import Button from "../../components/ui/Button";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { motion } from "framer-motion";

function EditPost({
    image_url,
    set_image_url,
    post_title,
    set_post_title,
    post_text,
    set_post_text,
    valid_title,
}) {
    const add_notification = useNotification();

    const img_input_ref = useRef();

    const [loading_img, set_loading_img] = useState(false);

    const handle_img_upload = async (new_img) => {
        try {
            set_loading_img(true);

            const img_url = await upload_image(new_img);
            set_image_url(img_url);

            set_loading_img(false);
            add_notification("Image Succesfully Uploaded");
        } catch (e) {
            console.log(e);
        }
    };

    return (
        <motion.div className="post_inputs" layout>
            <div className="post_title">
                <LoginInput
                    htmlFor="title"
                    input_type="text"
                    label_name="Title"
                    value={post_title}
                    update_on_change={set_post_title}
                    boolean_check={valid_title}
                    autoFocus={true}
                >
                    Title cannot be empty!
                </LoginInput>

                <div className="img_btns">
                    <input
                        id="upload_img"
                        type="file"
                        ref={img_input_ref}
                        onChange={(e) => handle_img_upload(e.target.files[0])}
                        hidden={true}
                    />

                    <Button
                        handle_btn_click={() => img_input_ref.current.click()}
                        type="add_img"
                        span_text={
                            image_url === null
                                ? "Upload Image"
                                : "Replace Image"
                        }
                        img_name="add_img"
                    />

                    {image_url !== null && (
                        <Button
                            handle_btn_click={() => set_image_url(null)}
                            type="remove_img"
                            span_text="Remove Image"
                            img_name="remove_img"
                            margin_left={true}
                        />
                    )}
                </div>
            </div>

            {loading_img ? (
                <div className="image_display">
                    <Loading />
                </div>
            ) : (
                <>
                    {image_url !== null && (
                        <div className="image_display">
                            <CloudinaryImage image_url={image_url} />
                        </div>
                    )}
                </>
            )}

            <TextEditor update_text={set_post_text} post_text={post_text} />
        </motion.div>
    );
}

export default EditPost;
