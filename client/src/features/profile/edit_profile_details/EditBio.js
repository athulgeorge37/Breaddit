// styles
import "./EditBio.scss";

// hooks
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNotification } from "../../../context/Notifications/NotificationProvider";

// ui
import ResizableInput from "../../../components/form/ResizableInput";

// api
import { edit_user_details } from "../../../api/UserRequests";

function EditBio({ original_bio, original_username }) {
    const queryClient = useQueryClient();
    const add_notification = useNotification();

    const [bio, set_bio] = useState(original_bio ?? "");
    const [is_editing, set_is_editing] = useState(false);

    const { mutate: update_bio } = useMutation(
        (new_bio) => {
            return edit_user_details({ bio: new_bio });
        },
        {
            onSuccess: () => {
                add_notification("Succesfully Edited Bio");
                queryClient.invalidateQueries([
                    "user_details",
                    {
                        username: original_username,
                    },
                ]);
            },
            onError: () => {
                add_notification(
                    "Unable to edit bio, please try again later.",
                    "ERROR"
                );
            },
        }
    );

    const handle_save_bio = () => {
        // not updating bio, if we are saving the same details
        if (bio !== original_bio) {
            // updating bio in DB
            update_bio(bio === "" ? "null" : bio);
        }

        // closing edit mode
        set_is_editing(false);
    };

    return (
        <div className={`EditBio ${is_editing ? "edit_mode" : ""}`}>
            {is_editing ? (
                <div className="edit_bio_input">
                    <label>Bio:</label>
                    <ResizableInput
                        onChange={set_bio}
                        value={bio}
                        placeholder={"Write something dont be boring"}
                        max_height={200}
                    />
                </div>
            ) : (
                <div className="bio_content">
                    <label htmlFor="bio">Bio:</label>
                    <p id="bio" className="bio">
                        {bio === "" ? "No Bio" : bio}
                    </p>
                </div>
            )}

            <div className="bio_btns">
                {is_editing ? (
                    <>
                        <button
                            className="cancel_bio_btn bio_btn"
                            onClick={() => {
                                set_is_editing(!is_editing);
                                set_bio(original_bio ?? "");
                            }}
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
                            Cancel
                        </button>
                        <button
                            className="save_bio_btn bio_btn"
                            onClick={handle_save_bio}
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
                            Save
                        </button>
                    </>
                ) : (
                    <button
                        className="edit_bio_btn bio_btn"
                        onClick={() => {
                            set_is_editing(!is_editing);
                            set_bio(original_bio ?? "");
                        }}
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
                )}
            </div>
        </div>
    );
}

export default EditBio;
