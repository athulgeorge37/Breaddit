// styles
import "./CreateThread.scss";

// hooks
import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { useNotification } from "../../context/Notifications/NotificationProvider";
import { useNavigate } from "react-router-dom";

// components
import EditProfilePic from "../profile/profile_picture/EditProfilePic";
import Rule from "./Rule";

// ui
import CloudinaryImage from "../../components/CloudinaryImage";
import ExpandableInput from "../../components/form/ExpandableInput";
import LoginInput from "../../components/form/LoginInput";
import Button from "../../components/ui/Button";
import Loading from "../../components/ui/Loading";

// api
import { upload_image } from "../../api/ImageRequests";
import { create_thread } from "../../api/ThreadRequests";
import query_string_generator from "../../helper/query_string_generator";

function CreateThread() {
    const add_notification = useNotification();
    const navigate = useNavigate();

    const [title, set_title] = useState("");
    const [description, set_description] = useState("");
    const [logo_url, set_logo_url] = useState(null);
    const [theme_url, set_theme_url] = useState(null);
    const [list_of_rules, set_list_of_rules] = useState([]);

    const make_thread = useMutation(
        () =>
            create_thread(
                title,
                description,
                logo_url,
                theme_url,
                list_of_rules
            ),
        {
            onSuccess: (data) => {
                console.log({ data });
                add_notification("Succesfully created Thread");
                navigate(
                    `/posts?${query_string_generator({
                        thread: data.new_thread_details.title,
                    })}`
                );
            },
        }
    );

    return (
        <div className="CreateThread">
            <h2>Create Thread</h2>
            <div className="thread_title_and_description">
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

                <label className="description">Description:</label>
                <ExpandableInput
                    set_input_content={set_description}
                    max_height_px={150}
                    initial_content={description}
                />
            </div>

            <div className="edit_logo_and_theme">
                <div className="edit_logo">
                    <label htmlFor="">Logo:</label>
                    <EditProfilePic
                        profile_picture_url={logo_url}
                        set_profile_picture_url={set_logo_url}
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
                <button
                    className="save_btn"
                    onClick={() => make_thread.mutate()}
                >
                    Create Thread
                </button>
            </div>

            {make_thread.isLoading && <Loading />}
        </div>
    );
}

function EditRules({ set_list_of_rules, list_of_rules }) {
    const [add_rule_is_open, set_add_rule_is_open] = useState(false);

    return (
        <div className="EditRules">
            <h3>Rules:</h3>
            <div className="list_of_rules">
                <ol>
                    {list_of_rules.map((rule, index) => {
                        return <Rule key={index} rule={rule} />;
                    })}
                </ol>
            </div>

            {add_rule_is_open ? (
                <CreateRule
                    set_list_of_rules={set_list_of_rules}
                    set_add_rule_is_open={set_add_rule_is_open}
                />
            ) : (
                <button
                    className="create_rule_btn"
                    onClick={() => set_add_rule_is_open(true)}
                >
                    Create Rule
                </button>
            )}
        </div>
    );
}

function CreateRule({ set_list_of_rules, set_add_rule_is_open }) {
    const [title, set_title] = useState("");
    const [description, set_description] = useState("");

    return (
        <div className="CreateRule">
            <div className="create">
                <LoginInput
                    htmlFor="create_rule_title"
                    input_type="text"
                    label_name="Rule Title"
                    value={title}
                    update_on_change={set_title}
                    boolean_check={true}
                    autoFocus={true}
                >
                    Rule Title cannot be empty!
                </LoginInput>

                <label className="description">Rule Description:</label>
                <ExpandableInput
                    set_input_content={set_description}
                    max_height_px={150}
                    initial_content={description}
                />
                <div className="create_rule_btns">
                    <button
                        className="cancel"
                        onClick={() => set_add_rule_is_open(false)}
                    >
                        Cancel
                    </button>
                    <button
                        className="add_rule"
                        onClick={() => {
                            set_list_of_rules((prev_rules) => [
                                ...prev_rules,
                                {
                                    title: title,
                                    description: description,
                                },
                            ]);
                            set_add_rule_is_open(false);
                        }}
                    >
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
        </div>
    );
}

export default CreateThread;
