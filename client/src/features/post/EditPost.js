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
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { edit_post } from "../../rest_api_requests/PostRequests";

function EditPost({ post_details, set_edit_btn_active }) {
    const add_notification = useNotification();
    const queryClient = useQueryClient();

    const img_input_ref = useRef();
    const [loading_img, set_loading_img] = useState(false);

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState(post_details.title);
    const [post_text, set_post_text] = useState(post_details.text);
    const [image_url, set_image_url] = useState(post_details.image);

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

    const post_edit = useMutation(
        () => edit_post(post_details.id, post_title, post_text, image_url),
        {
            onSuccess: (data) => {
                // removing post on client side when deleted from db

                if (data.error) {
                    console.log(data);
                    return;
                }
                queryClient.invalidateQueries(["posts"]);
                queryClient.invalidateQueries([
                    "post_content",
                    post_details.id,
                ]);
                set_edit_btn_active(false);
                add_notification("Succesfully Edited Post");
            },
        }
    );

    const handle_edit_post_save = () => {
        // only handling post if post title is not empty
        if (post_title.trim().length === 0) {
            set_valid_title(false);
            return;
        }

        post_edit.mutate();
    };

    return (
        <div className="post_inputs" layout>
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
                        onClick={() => img_input_ref.current.click()}
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
                            onClick={() => set_image_url(null)}
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

            <div className="edit_post_buttons">
                <button
                    onClick={() => set_edit_btn_active(false)}
                    className="cancel_btn"
                >
                    Cancel
                </button>
                <button onClick={handle_edit_post_save} className="save_btn">
                    Save
                </button>
            </div>
        </div>
    );
}

export default EditPost;
