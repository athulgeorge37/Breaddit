// scss import
import "./EditPost.scss";

// hook imports
import { useEffect, useRef, useState } from "react";

import { upload_image } from "../../api/ImageRequests";

// component imports
import TextEditor from "../../components/form/TextEditor";
import LoginInput from "../../components/form/LoginInput";
import Loading from "../../components/ui/Loading";
import CloudinaryImage from "../../components/CloudinaryImage";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { edit_post_request, create_post } from "../../api/PostRequests";
import { useNavigate } from "react-router-dom";
import useDebounce from "../../hooks/useDebounce";
import { get_thread_names } from "../../api/ThreadRequests";
import ToolTip from "../../components/ui/ToolTip";
import Input from "../../components/form/Input";

function EditPost({ post_details, set_edit_btn_active, mode = "edit" }) {
    const add_notification = useNotification();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const img_input_ref = useRef();

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState(post_details?.title ?? "");
    const [post_text, set_post_text] = useState(post_details?.text ?? "");
    const [valid_post_text, set_valid_post_text] = useState(true);
    const [image_url, set_image_url] = useState(post_details?.image ?? null);

    const [thread_id, set_thread_id] = useState(null);

    const {
        mutate: upload_img_to_cloud,
        isLoading: upload_img_to_cloud_is_loading,
    } = useMutation(
        (new_img) => {
            return upload_image(new_img);
        },
        {
            onSuccess: (data) => {
                set_image_url(data);
                add_notification("Image Succesfully Uploaded");
            },
            onError: (data) => {
                //console.log(data);
                add_notification(
                    "Unable to upload image, try again later",
                    "ERROR"
                );
            },
        }
    );

    const { mutate: make_post, isLoading: make_post_is_loading } = useMutation(
        () => {
            return create_post(post_title, post_text, image_url, thread_id);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    //console.log(data);
                    add_notification(
                        "An Error occured when trying to create a post",
                        "ERROR"
                    );
                    return;
                }
                handle_post_cancel();
                add_notification("Succesfully Created Post");
                queryClient.invalidateQueries(["posts"]);
                navigate(`/post/${data.new_post_details.id}`);
            },
            onError: (data) => {
                //console.log(data);
                add_notification(
                    "An Error occured when trying to create a post",
                    "ERROR"
                );
            },
        }
    );

    const handle_post_submit = () => {
        // only handling post if there is a post title
        if (post_title.trim().length === 0) {
            set_valid_title(false);
            return;
        }
        if (valid_title && valid_post_text && post_title.length < 100) {
            make_post();
        }
    };

    const handle_post_cancel = () => {
        set_valid_title(true);
        set_image_url(null);
        set_post_title("");
        set_post_text("");
    };

    const { mutate: edit_post } = useMutation(
        () =>
            edit_post_request(
                post_details.id,
                post_title,
                post_text,
                image_url
            ),
        {
            onSuccess: (data) => {
                // removing post on client side when deleted from db

                if (data.error) {
                    //console.log(data);
                    add_notification(
                        "An Error occured when trying to edit the post",
                        "ERROR"
                    );
                    return;
                }
                queryClient.invalidateQueries(["posts"]);
                queryClient.invalidateQueries([
                    "post_content",
                    { post_id: post_details.id },
                ]);

                handle_cancel_edit_mode();
                add_notification("Succesfully Edited Post");
            },
            onError: (data) => {
                //console.log(data);
                add_notification(
                    "An Error occured when trying to edit the post",
                    "ERROR"
                );
            },
        }
    );

    const handle_edit_post_save = () => {
        // only handling post if post title is not empty
        if (post_title.trim().length === 0) {
            set_valid_title(false);
            return;
        }

        if (valid_title && valid_post_text) {
            edit_post();
        }
    };

    const handle_cancel_edit_mode = () => {
        if (set_edit_btn_active === undefined) {
            // negative 1 is like clicking the back button
            navigate(-1);
        } else {
            set_edit_btn_active(false);
        }
    };

    return (
        <div className="post_inputs">
            {mode === "create" && <h2>Create Post</h2>}

            {mode === "create" && <AddThread set_thread_id={set_thread_id} />}

            <div className="post_title">
                <Input
                    id="title"
                    label_text="Title:"
                    onChange={(e) => set_post_title(e.target.value)}
                    value={post_title}
                    errors={[
                        {
                            id: "required",
                            msg: "Required",
                            is_error: post_title === "",
                            hidden: false,
                        },
                        {
                            id: "max_length_100",
                            msg: "Must be smaller than 100 characters",
                            is_error: !(post_title.length < 100),
                            hidden: false,
                        },
                    ]}
                />

                <div className="img_btns">
                    <input
                        id="upload_img"
                        type="file"
                        ref={img_input_ref}
                        onChange={(e) => upload_img_to_cloud(e.target.files[0])}
                        hidden={true}
                    />

                    {image_url !== null && (
                        <ToolTip text="Remove Image">
                            <button
                                className="remove_img_btn"
                                onClick={() => set_image_url(null)}
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
                                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                </svg>
                            </button>
                        </ToolTip>
                    )}

                    <ToolTip
                        text={
                            image_url === null
                                ? "Upload Image"
                                : "Replace Image"
                        }
                    >
                        <button
                            className="image_icon_btn"
                            onClick={() => img_input_ref.current.click()}
                        >
                            <svg
                                className="image_icon"
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
                </div>
            </div>

            {upload_img_to_cloud_is_loading ? (
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

            <TextEditor
                update_text={(data) => {
                    if (data.length > 900) {
                        set_valid_post_text(false);
                    } else {
                        set_valid_post_text(true);
                    }
                    set_post_text(data);
                }}
                post_text={post_text}
            />

            <div className="bottom_row">
                <div className="post_text_info">
                    <span className="character_count">
                        Characters: {post_text.length}
                    </span>
                    {valid_post_text ? (
                        <p className="info">
                            Editing will increase character count more.
                        </p>
                    ) : (
                        <p className="error">
                            Too many characters, maximum length is 900.
                        </p>
                    )}
                </div>
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
                            disabled={
                                make_post_is_loading ||
                                upload_img_to_cloud_is_loading
                            }
                        >
                            Create Post
                        </button>
                    ) : null}
                </div>
            </div>
        </div>
    );
}

function AddThread({ set_thread_id }) {
    const [search_term, set_search_term] = useState("");
    const [is_loading, set_is_loading] = useState(false);
    const [threads_list, set_threads_list] = useState([]);

    const [current_thread, set_current_thread] = useState(null);

    const input_ref = useRef();

    const debounced_search = useDebounce(search_term, 500);

    useEffect(() => {
        // searching the api for thread names
        const search_api_for_thread_names = async () => {
            set_is_loading(true);

            const data = await get_thread_names(debounced_search);
            if (data.error) {
                //console.log({ data });
                return;
            }
            set_threads_list(data.threads);
            set_is_loading(false);
        };

        if (debounced_search) {
            search_api_for_thread_names();
        }
    }, [debounced_search]);

    return (
        <div className="AddThread">
            {current_thread === null ? (
                <div className="find_a_thread">
                    <label htmlFor="for_thread">Add A Thread:</label>
                    <div className="search_thread_names_input_div">
                        <input
                            className="search_thread_names_input"
                            ref={input_ref}
                            id="for_thread"
                            type="search"
                            placeholder="Find A Thread"
                            value={search_term}
                            onChange={(e) => {
                                set_search_term(e.target.value);
                            }}
                        />
                        {search_term !== "" && (
                            <button
                                className="cancel_icon"
                                onClick={() => {
                                    input_ref.current.focus();
                                    set_search_term("");
                                    set_threads_list([]);
                                }}
                            >
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>

                    {is_loading ? (
                        <div className="loader">
                            <Loading />
                        </div>
                    ) : (
                        <>
                            {threads_list.length > 0 ? (
                                <div className="thread_name_list">
                                    {threads_list.map((thread) => {
                                        return (
                                            <button
                                                key={thread.id}
                                                className="thread_name"
                                                onClick={() => {
                                                    set_search_term(
                                                        thread.title
                                                    );
                                                    set_threads_list([]);
                                                    set_current_thread(thread);
                                                    set_thread_id(thread.id);
                                                }}
                                            >
                                                <img src={thread.logo} alt="" />
                                                {thread.title}
                                            </button>
                                        );
                                    })}
                                </div>
                            ) : null}
                        </>
                    )}
                </div>
            ) : (
                <div className="current_thread">
                    <div className="logo_and_title">
                        <img
                            src={current_thread.logo}
                            alt="thread logo"
                            className="logo"
                        />
                        <span className="title">{current_thread.title}</span>
                    </div>
                    <button
                        className="remove_thread"
                        onClick={() => {
                            set_current_thread(null);
                            set_search_term("");
                            set_threads_list([]);
                        }}
                    >
                        Remove Thread
                    </button>
                </div>
            )}
        </div>
    );
}

export default EditPost;
