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
import { edit_post, create_post } from "../../rest_api_requests/PostRequests";
import { useNavigate } from "react-router-dom";

function EditPost({ post_details, set_edit_btn_active, mode = "edit" }) {
    const add_notification = useNotification();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const img_input_ref = useRef();

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState(
        post_details === undefined ? "" : post_details.title
    );
    const [post_text, set_post_text] = useState(
        post_details === undefined ? "" : post_details.text
    );
    const [image_url, set_image_url] = useState(
        post_details === undefined ? null : post_details.image
    );

    const upload_img_to_cloud = useMutation(
        (new_img) => {
            return upload_image(new_img);
        },
        {
            onSuccess: (data) => {
                set_image_url(data);
                add_notification("Image Succesfully Uploaded");
            },
        }
    );

    const make_post = useMutation(
        () => {
            return create_post(post_title, post_text, image_url);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    console.log(data);
                    return;
                }
                handle_post_cancel();
                add_notification("Succesfully Created Post");
                queryClient.invalidateQueries(["posts"]);
                navigate(`/post/${data.new_post_details.id}`);
            },
        }
    );

    const handle_post_submit = () => {
        // only handling post if there is a post title
        if (post_title.trim().length === 0) {
            set_valid_title(false);
            return;
        }

        make_post.mutate();
    };

    const handle_post_cancel = () => {
        set_valid_title(true);
        set_image_url(null);
        set_post_title("");
        set_post_text("");
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

                handle_cancel_edit_mode();
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

    const handle_cancel_edit_mode = () => {
        if (set_edit_btn_active === undefined) {
            navigate("/posts");
        } else {
            set_edit_btn_active(false);
        }
    };

    return (
        <div className="post_inputs">
            {mode === "create" && <h2>Create Post</h2>}
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
                        onChange={(e) =>
                            upload_img_to_cloud.mutate(e.target.files[0])
                        }
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

            {upload_img_to_cloud.isLoading ? (
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
                    onClick={handle_cancel_edit_mode}
                    className="cancel_btn"
                >
                    Cancel
                </button>

                {mode === "edit" ? (
                    <button
                        onClick={handle_edit_post_save}
                        className="save_btn"
                    >
                        Save
                    </button>
                ) : mode === "create" ? (
                    <button
                        className="create_post_btn"
                        onClick={handle_post_submit}
                    >
                        Create Post
                    </button>
                ) : null}
            </div>
        </div>
    );
}

export default EditPost;
