import "./CreateThread.scss";
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { upload_image } from "../../rest_api_requests/ImageRequests";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";
import CloudinaryImage from "../../components/CloudinaryImage";

import LoginInput from "../../components/form/LoginInput";
import ExpandableInput from "../../components/form/ExpandableInput";
import EditProfilePic from "../profile/profile_picture/EditProfilePic";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useNavigate } from "react-router-dom";

import { create_thread } from "../../rest_api_requests/ThreadRequests";

function CreateThread() {
    const add_notification = useNotification();
    const navigate = useNavigate();

    const [title, set_title] = useState("");
    const [description, set_description] = useState("");
    const [logo_url, set_logo_url] = useState(null);
    const [theme_url, set_theme_url] = useState(null);

    const make_thread = useMutation(
        () => create_thread(title, description, logo_url, theme_url),
        {
            onSuccess: (data) => {
                console.log({ data });
                add_notification("Succesfully created Thread");
            },
        }
    );

    return (
        <div className="CreateThread">
            <h2>Create Thread</h2>
            <LoginInput
                htmlFor="title"
                input_type="text"
                label_name="Title"
                value={title}
                update_on_change={set_title}
                boolean_check={true}
                autoFocus={true}
            >
                Title cannot be empty!
            </LoginInput>

            <span>Thread Description:</span>
            <ExpandableInput
                set_input_content={set_description}
                max_height_px={150}
                initial_content={description}
            />

            <EditProfilePic
                profile_picture_url={logo_url}
                set_profile_picture_url={set_logo_url}
            />

            <CreateTheme theme_url={theme_url} set_theme_url={set_theme_url} />

            <button className="cancel_btn" onClick={() => navigate("/posts")}>
                Cancel
            </button>
            <button className="save_btn" onClick={() => make_thread.mutate()}>
                Save
            </button>

            {make_thread.isLoading && <Loading />}
        </div>
    );
}

function CreateTheme({ theme_url, set_theme_url }) {
    const add_notification = useNotification();
    // const [image_url, set_image_url] = useState(null);
    const img_input_ref = useRef();

    const upload_img_to_cloud = useMutation(
        (new_img) => {
            return upload_image(new_img);
        },
        {
            onSuccess: (data) => {
                set_theme_url(data);
                add_notification("Image Succesfully Uploaded");
            },
        }
    );

    return (
        <div className="CreateTheme">
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
                        theme_url === null ? "Upload Image" : "Replace Image"
                    }
                    img_name="add_img"
                />

                {theme_url !== null && (
                    <Button
                        onClick={() => set_theme_url(null)}
                        type="remove_img"
                        span_text="Remove Image"
                        img_name="remove_img"
                        margin_left={true}
                    />
                )}
            </div>

            {upload_img_to_cloud.isLoading ? (
                <div className="image_display">
                    <Loading />
                </div>
            ) : (
                <>
                    {theme_url !== null && (
                        <div className="image_display">
                            <CloudinaryImage image_url={theme_url} />
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

export default CreateThread;
