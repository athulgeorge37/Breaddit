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
import Button from "../../components/ui/Button";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { edit_post, create_post } from "../../api/PostRequests";
import { useNavigate } from "react-router-dom";
import SearchThreadNames from "../thread/SearchThreadNames";
import useDebounce from "../../hooks/useDebounce";
import { get_thread_names } from "../../api/ThreadRequests";

function EditPost({ post_details, set_edit_btn_active, mode = "edit" }) {
    const add_notification = useNotification();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const img_input_ref = useRef();

    const [valid_title, set_valid_title] = useState(true);
    const [post_title, set_post_title] = useState(post_details?.title ?? "");
    const [post_text, set_post_text] = useState(post_details?.text ?? "");
    const [image_url, set_image_url] = useState(post_details?.image ?? null);

    const [thread_id, set_thread_id] = useState(null);

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
            return create_post(post_title, post_text, image_url, thread_id);
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
                console.log({ data });
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
