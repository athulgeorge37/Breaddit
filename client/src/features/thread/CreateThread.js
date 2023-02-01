// styles
import "./CreateThread.scss";

// hooks
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useNavigate } from "react-router-dom";

// components
import Rule from "./Rule";
import EditThreadLogo from "./EditThreadLogo";

// ui
import CloudinaryImage from "../../components/CloudinaryImage";
import Loading from "../../components/ui/Loading";
import Input from "../../components/form/Input";

// api
import { upload_image } from "../../api/ImageRequests";
import { create_thread_request } from "../../api/ThreadRequests";
import query_string_generator from "../../helper/query_string_generator";
import ToolTip from "../../components/ui/ToolTip";

function CreateThread() {
    const add_notification = useNotification();
    const navigate = useNavigate();

    const [title, set_title] = useState("");
    const [description, set_description] = useState("");
    const [logo_url, set_logo_url] = useState(null);
    const [theme_url, set_theme_url] = useState(null);
    const [list_of_rules, set_list_of_rules] = useState([]);

    const { mutate: make_thread, isLoading: make_thread_is_loading } =
        useMutation(
            () =>
                create_thread_request(
                    title,
                    description,
                    logo_url,
                    theme_url,
                    list_of_rules
                ),
            {
                onSuccess: (data) => {
                    if (data.error) {
                        add_notification("Unable to create thread", "ERROR");
                        console.log({ data });
                        return;
                    }
                    console.log({ data });
                    add_notification("Succesfully created Thread");
                    navigate(
                        `/?${query_string_generator({
                            thread: data.new_thread_details.title,
                        })}`
                    );
                },
                onError: (data) => {
                    add_notification("Unable to create thread", "ERROR");
                    console.log({ data });
                },
            }
        );

    const create_thread = () => {
        if (title === "") {
            add_notification("Thread's title cannot be empty", "ERROR");
            return;
        }
        if (description === "") {
            add_notification("Thread's description's cannot be empty", "ERROR");
            return;
        }

        if (logo_url === null) {
            add_notification("Thread's logo cannot be empty", "ERROR");
            return;
        }
        if (theme_url === null) {
            add_notification("Thread's theme cannot be empty", "ERROR");
            return;
        }

        if (list_of_rules.length === 0) {
            add_notification("Thread's Rules cannot be empty", "ERROR");
            return;
        }

        make_thread();
    };

    return (
        <div className="CreateThread">
            <h2>Create Thread</h2>
            <div className="thread_title_and_description">
                <Input
                    id="title"
                    label_text="Thread Title:"
                    value={title}
                    onChange={(e) => set_title(e.target.value)}
                    autoFocus
                    type="text"
                    errors={[
                        {
                            id: "not_empty",
                            msg: "Cannot be empty",
                            is_error: title === "" ? true : false,
                            hidden: false,
                        },
                    ]}
                />

                <Input
                    id="thread_description"
                    label_text="Thread Description:"
                    onChange={set_description}
                    max_height={200}
                    min_height={100}
                    value={description}
                    placeholder="write something"
                    autoFocus={false}
                    resizable
                    initial_height={4}
                    errors={[
                        {
                            id: "not_empty",
                            msg: "Cannot be empty",
                            is_error: description === "" ? true : false,
                            hidden: false,
                        },
                    ]}
                />
            </div>

            <div className="edit_logo_and_theme">
                <div className="edit_logo">
                    <label htmlFor="">Logo:</label>
                    <EditThreadLogo
                        set_logo_url={set_logo_url}
                        logo_url={logo_url}
                    />
                </div>

                <div className="edit_theme">
                    <label htmlFor="">Theme:</label>
                    <CreateTheme
                        theme_url={theme_url}
                        set_theme_url={set_theme_url}
                    />
                </div>
            </div>

            <EditRules
                set_list_of_rules={set_list_of_rules}
                list_of_rules={list_of_rules}
            />

            <div className="thread_btns">
                <button className="cancel_btn" onClick={() => navigate(-1)}>
                    Cancel
                </button>
                <button className="save_btn" onClick={create_thread}>
                    Create Thread
                </button>
            </div>

            {make_thread_is_loading && <Loading />}
        </div>
    );
}

function EditRules({ set_list_of_rules, list_of_rules }) {
    const [add_rule_is_open, set_add_rule_is_open] = useState(false);

    return (
        <div className="EditRules">
            <div className="rules_and_btns">
                <div className="heading_and_list_of_rules">
                    <h3>Thread Rules:</h3>
                    <div className="list_of_rules">
                        {list_of_rules.length > 0 ? (
                            <ol>
                                {list_of_rules.map((rule, index) => {
                                    return <Rule key={index} rule={rule} />;
                                })}
                            </ol>
                        ) : (
                            <div className="no_rules">No Rules</div>
                        )}
                    </div>
                </div>
                {add_rule_is_open === false && (
                    <button
                        className="create_rule_btn"
                        onClick={() => set_add_rule_is_open(true)}
                    >
                        Add Rule
                    </button>
                )}
            </div>

            {add_rule_is_open && (
                <CreateRule
                    set_list_of_rules={set_list_of_rules}
                    set_add_rule_is_open={set_add_rule_is_open}
                />
            )}
        </div>
    );
}

function CreateRule({ set_list_of_rules, set_add_rule_is_open }) {
    const add_notification = useNotification();

    const [title, set_title] = useState("");
    const [description, set_description] = useState("");

    const handle_add_rule = () => {
        if (title === "") {
            add_notification("Rule's title cannot be empty", "ERROR");
            return;
        }
        if (description === "") {
            add_notification(
                "Rule's description's title cannot be empty",
                "ERROR"
            );
            return;
        }

        set_list_of_rules((prev_rules) => [
            ...prev_rules,
            {
                title: title,
                description: description,
            },
        ]);
        set_add_rule_is_open(false);

        add_notification("Rule has been added");
    };

    return (
        <div className="CreateRule">
            <div className="create">
                <Input
                    id="create_rule_title"
                    label_text="Rule Title:"
                    value={title}
                    onChange={(e) => set_title(e.target.value)}
                    autoFocus
                    type="text"
                    errors={[
                        {
                            id: "not_empty",
                            msg: "Cannot be empty",
                            is_error: title === "" ? true : false,
                            hidden: false,
                        },
                    ]}
                />

                <Input
                    id="rule_description"
                    label_text="Rule Description:"
                    onChange={set_description}
                    max_height={150}
                    value={description}
                    autoFocus={false}
                    resizable
                    errors={[
                        {
                            id: "not_empty",
                            msg: "Cannot be empty",
                            is_error: description === "" ? true : false,
                            hidden: false,
                        },
                    ]}
                />
                <div className="create_rule_btns">
                    <button
                        className="cancel"
                        onClick={() => set_add_rule_is_open(false)}
                    >
                        Cancel
                    </button>
                    <button className="add_rule" onClick={handle_add_rule}>
                        Add Rule
                    </button>
                </div>
            </div>
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
            {upload_img_to_cloud.isLoading ? (
                <div className="image_display">
                    <Loading />
                </div>
            ) : (
                <>
                    {theme_url === null ? (
                        <div className="place_holder_img"></div>
                    ) : (
                        <div className="image_display">
                            <CloudinaryImage image_url={theme_url} />
                        </div>
                    )}
                </>
            )}

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

                {/* <Button
                    onClick={() => img_input_ref.current.click()}
                    type="add_img"
                    span_text={
                        theme_url === null ? "Upload Image" : "Replace Image"
                    }
                    img_name="add_img"
                /> */}
                <ToolTip
                    text={theme_url === null ? "Upload Image" : "Replace Image"}
                >
                    <button
                        className="upload_img_btn"
                        onClick={() => img_input_ref.current.click()}
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

                {theme_url !== null && (
                    <ToolTip text={"Remove Image"}>
                        <button
                            className="remove_img_btn"
                            onClick={() => set_theme_url(null)}
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
            </div>
        </div>
    );
}

export default CreateThread;
