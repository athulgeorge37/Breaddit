// styles
import "./EditProfilePic.scss";

// hooks
import { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../../context/Notifications/NotificationProvider";
import { useCurrentUser } from "../../../context/CurrentUser/CurrentUserProvider";

// ui
import Loading from "../../../components/ui/Loading";
import ToolTip from "../../../components/ui/ToolTip";

// components
import AvatarEditor from "react-avatar-editor";
import ProfilePicture from "../profile_picture/ProfilePicture";

// api
import { upload_image } from "../../../api/ImageRequests";
import { edit_user_details } from "../../../api/UserRequests";

function EditProfilePic({ original_profile_pic, original_username }) {
    const { update_current_user_profile_pic } = useCurrentUser();
    const queryClient = useQueryClient();
    const add_notification = useNotification();

    const [editing_img, set_editing_img] = useState(false);
    const img_input_ref = useRef();

    // profile_picture_url is the current profile pic saved in the DB
    const [profile_picture_url, set_profile_picture_url] =
        useState(original_profile_pic);

    var editor = "";
    const [picture, setPicture] = useState({
        cropperOpen: false,
        img: null,
        rotation: 0,
        zoom: 2,
        croppedImg: false,
    });

    const handle_zoom = (value) => {
        // updating zoom value for avatar editor
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
        // removing img from avatar editor cropper
        setPicture({
            ...picture,
            cropperOpen: false,
            img: null,
        });

        // closing the avatar editor cropper
        set_editing_img(false);
    };

    const setEditorRef = (ed) => {
        editor = ed;
    };

    const handleRemoveImage = () => {
        // removing img from avatar editor cropper
        setPicture({
            ...picture,
            img: null,
        });
        if (profile_picture_url !== null) {
            // only updating profile pic in DB
            // when we previously had a profile pic in DB
            // that was not empty (not null)
            edit_profile_pic("null");
            update_current_user_profile_pic(null);
        }
        // so we know what the profile pic in DB, for future ref
        set_profile_picture_url(null);

        // closing the avatar editor cropper
        set_editing_img(false);
    };

    const handleSave = () => {
        // this function only executes when there is an img in
        // picture.img
        if (picture.img === null) {
            return;
        }

        if (setEditorRef) {
            // converting the img from cropper to usable URL
            const canvasScaled = editor.getImageScaledToCanvas();
            const croppedImg = canvasScaled.toDataURL();

            // to get an object of height, width, x, y values of the crop
            // console.log(editor.getCroppingRect())

            // when trying to edit again,
            // we remove the last img in the cropper we used
            setPicture({
                ...picture,
                img: null,
                cropperOpen: false,
                croppedImg: croppedImg,
            });

            // closing the editor
            set_editing_img(false);

            // uploading the cropped img to the cloud
            upload_img_to_cloud(croppedImg);
        }
    };

    const handleFileChange = (new_img) => {
        // converting img from file to usable URL
        let url = URL.createObjectURL(new_img);
        // console.log(url);

        // putting the URL into avatar editor cropper
        // so we can crop
        setPicture({
            ...picture,
            img: url,
            zoom: 2,
            cropperOpen: true,
        });
    };

    const {
        mutate: upload_img_to_cloud,
        isLoading: upload_img_to_cloud_loading,
    } = useMutation(
        (new_img) => {
            return upload_image(new_img);
        },
        {
            onSuccess: (data) => {
                // ensuring the
                set_profile_picture_url(data);
                // save to DB new profile pic here
                edit_profile_pic(data);
                update_current_user_profile_pic(data);
            },
        }
    );

    const { mutate: edit_profile_pic, isLoading: edit_profile_pic_loading } =
        useMutation(
            (new_profile_pic) => {
                return edit_user_details({ profile_pic: new_profile_pic });
            },
            {
                onSuccess: () => {
                    add_notification("Succesfully Edited Profile Picture");
                    queryClient.invalidateQueries([
                        "user_details",
                        {
                            username: original_username,
                        },
                    ]);
                },
                onError: () => {
                    add_notification(
                        "Unable to edit profile picture, please try again later.",
                        "ERROR"
                    );
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

                    <div className="img_btns_and_sliders">
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
                                onChange={(e) =>
                                    handle_rotation(e.target.value)
                                }
                            />
                        </div>

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

                            {(picture.img === null ||
                                profile_picture_url === null) && (
                                <ToolTip text={"Remove Image"}>
                                    <button
                                        className="remove_img_btn"
                                        onClick={handleRemoveImage}
                                    >
                                        <svg
                                            className="remove_img_icon"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M15 12H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </button>
                                </ToolTip>
                            )}

                            <ToolTip
                                text={
                                    picture.img === null
                                        ? "Upload Image"
                                        : "Replace Image"
                                }
                            >
                                <button
                                    className="upload_img_btn"
                                    onClick={() =>
                                        img_input_ref.current.click()
                                    }
                                >
                                    <svg
                                        className="upload_img_icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                                        />
                                    </svg>
                                </button>
                            </ToolTip>

                            <ToolTip text={"Cancel"}>
                                <button
                                    className="cancel_btn"
                                    onClick={handleCancel}
                                >
                                    <svg
                                        className="cancel_icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                </button>
                            </ToolTip>

                            {picture.img !== null && (
                                <ToolTip text={"Save"}>
                                    <button
                                        className="save_btn"
                                        onClick={handleSave}
                                    >
                                        <svg
                                            className="save_icon"
                                            fill="none"
                                            stroke="currentColor"
                                            viewBox="0 0 24 24"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                            />
                                        </svg>
                                    </button>
                                </ToolTip>
                            )}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="closed_edit_mode">
                    {upload_img_to_cloud_loading || edit_profile_pic_loading ? (
                        <div className="loading_div">
                            <Loading />
                        </div>
                    ) : (
                        <ProfilePicture
                            profile_picture_url={profile_picture_url}
                            disable_tooltip
                            img_size={200}
                            margin_right={0}
                        />
                    )}
                    <button
                        className="edit_profile_picture_btn"
                        onClick={() => set_editing_img(true)}
                    >
                        <svg
                            className="edit_icon"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                        </svg>
                        Edit
                    </button>
                </div>
            )}
        </div>
    );
}

export default EditProfilePic;
