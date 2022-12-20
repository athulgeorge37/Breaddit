import "./EditProfilePic.scss";

import { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";

import ProfilePicture from "./ProfilePicture";
import Loading from "../../../components/ui/Loading";
import Button from "../../../components/ui/Button";
import { upload_image } from "../../../api/ImageRequests";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../../../context/Notifications/NotificationProvider";

function EditProfilePic({ profile_picture_url, set_profile_picture_url }) {
    const add_notification = useNotification();
    const [loading_img, set_loading_img] = useState(false);
    const [editing_img, set_editing_img] = useState(false);
    const img_input_ref = useRef();

    var editor = "";
    const [picture, setPicture] = useState({
        cropperOpen: false,
        img: null,
        rotation: 0,
        zoom: 2,
        croppedImg: false,
    });

    const handle_zoom = (value) => {
        setPicture({
            ...picture,
            zoom: parseFloat(value),
        });
    };

    const handle_rotation = (value) => {
        setPicture({
            ...picture,
            rotation: parseInt(value),
        });
    };

    const handleCancel = () => {
        setPicture({
            ...picture,
            cropperOpen: false,
        });

        set_editing_img(false);
    };

    const setEditorRef = (ed) => {
        editor = ed;
    };

    const handleSave = () => {
        if (picture.img === null) {
            // update_profile_details("")
            set_profile_picture_url(null);

            set_loading_img(true);
            setTimeout(() => {
                set_loading_img(false);
            }, 1000);
            set_editing_img(false);
            return;
        }

        if (setEditorRef) {
            const canvasScaled = editor.getImageScaledToCanvas();
            const croppedImg = canvasScaled.toDataURL();

            // to get an object of height, width, x, y values of the crop
            // console.log(editor.getCroppingRect())

            setPicture({
                ...picture,
                img: null,
                cropperOpen: false,
                croppedImg: croppedImg,
            });
            //upload_img(croppedImg)
            upload_img_to_cloud.mutate(croppedImg);
            // handle_upload_image(croppedImg);
            set_editing_img(false);
        }
    };

    const handleFileChange = (new_img) => {
        let url = URL.createObjectURL(new_img);
        // console.log(url);

        setPicture({
            ...picture,
            img: url,
            zoom: 2,
            cropperOpen: true,
        });
    };

    const upload_img_to_cloud = useMutation(
        (new_img) => {
            return upload_image(new_img);
        },
        {
            onSuccess: (data) => {
                set_profile_picture_url(data);
                add_notification("Image Succesfully Uploaded");
            },
        }
    );

    return (
        <div className="EditProfilePic">
            {editing_img ? (
                <div className="open_edit_mode">
                    <AvatarEditor
                        ref={setEditorRef}
                        image={picture.img}
                        width={160}
                        height={160}
                        border={20}
                        color={[60, 60, 60, 0.6]} // RGBA: color of the border
                        rotate={picture.rotation}
                        scale={picture.zoom}
                    />

                    <div className="img_btns">
                        <input
                            id="upload_img"
                            type="file"
                            ref={img_input_ref}
                            onChange={(e) =>
                                handleFileChange(e.target.files[0])
                            }
                            hidden={true}
                        />

                        {picture.img === null && (
                            <Button
                                onClick={() => {
                                    setPicture({
                                        ...picture,
                                        img: null,
                                    });
                                    handleSave();
                                }}
                                type="remove_img"
                                span_text="Remove Image"
                                img_name="remove_img"
                            />
                        )}

                        <Button
                            onClick={() => img_input_ref.current.click()}
                            type="add_img"
                            span_text={
                                picture.img === null
                                    ? "Upload Image"
                                    : "Replace Image"
                            }
                            img_name="add_img"
                        />

                        <Button
                            onClick={handleCancel}
                            type="cancel"
                            span_text="Cancel"
                            img_name="cancel"
                        />

                        <Button
                            onClick={handleSave}
                            type="save"
                            span_text="Save"
                            img_name="confirm"
                        />
                    </div>

                    <div className="sliders">
                        <label htmlFor="zoom" className="zoom_label">
                            Zoom
                        </label>
                        <input
                            className="zoom_slider"
                            id="zoom"
                            type="range"
                            defaultValue={2}
                            min={1}
                            max={10}
                            step={0.1}
                            onChange={(e) => handle_zoom(e.target.value)}
                        />

                        <label className="rotate_label" htmlFor="rotate">
                            Rotate
                        </label>
                        <input
                            className="rotate_slider"
                            id="rotate"
                            type="range"
                            defaultValue={0}
                            min={0}
                            max={360}
                            step={1}
                            onChange={(e) => handle_rotation(e.target.value)}
                        />
                    </div>
                </div>
            ) : (
                <div className="closed_edit_mode">
                    {loading_img || upload_img_to_cloud.isLoading ? (
                        <div className="loading_div">
                            <Loading />
                        </div>
                    ) : (
                        <ProfilePicture
                            profile_picture_url={profile_picture_url}
                        />
                    )}
                    <button
                        className="edit_profile_picture"
                        onClick={() => set_editing_img(true)}
                    >
                        Edit Image
                    </button>
                </div>
            )}
        </div>
    );
}

export default EditProfilePic;
