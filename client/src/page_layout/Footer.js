// styles
import "./Footer.scss";

// hooks
import { useState } from "react";
import { useModal } from "../components/ui/Modal";

// ui
import Modal from "../components/ui/Modal";
import Loading from "../components/ui/Loading";

// form
import Input from "../components/form/Input";
import ToolTip from "../components/ui/ToolTip";
import { useMutation } from "@tanstack/react-query";

// api
import { report_issue_request } from "../api/EmailRequests";
import { useNotification } from "../context/Notifications/NotificationProvider";

function Footer() {
    const add_notification = useNotification();
    const { open_modal, close_modal, show_modal } = useModal();

    const [topic, set_topic] = useState("");
    const [description, set_description] = useState("");

    const { mutate: report_issue, isLoading } = useMutation(
        () => {
            return report_issue_request(topic, description);
        },
        {
            onSuccess: (data) => {
                if (data.error) {
                    add_notification(
                        "Unable to report an issue, try again later",
                        "ERROR"
                    );
                    //console.log({ data });
                    return;
                }

                handle_close_report_issue();

                add_notification(data.msg);
            },
        }
    );

    const handle_close_report_issue = () => {
        close_modal();
        set_description("");
        set_topic("");
    };

    return (
        <footer>
            <Modal show_modal={show_modal} close_modal={close_modal}>
                <div className="report_issue_modal">
                    <div className="header">
                        <h2>Report An Issue</h2>
                        <ToolTip text="Close">
                            <button onClick={handle_close_report_issue}>
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.5"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                    aria-hidden="true"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        d="M6 18L18 6M6 6l12 12"
                                    ></path>
                                </svg>
                            </button>
                        </ToolTip>
                    </div>
                    <Input
                        label_text={"Topic:"}
                        placeholder="eg: this website is trash"
                        autoFocus
                        onChange={(e) => set_topic(e.target.value)}
                        value={topic}
                        errors={[
                            {
                                id: "required_topic",
                                msg: "Required",
                                is_error: topic === "",
                                hidden: false,
                            },
                        ]}
                    />
                    <Input
                        label_text={"Description:"}
                        placeholder="just look at the styles, did a 5 year old design this?"
                        onChange={set_description}
                        value={description}
                        max_height={300}
                        min_height={150}
                        resizable
                        errors={[
                            {
                                id: "required_description",
                                msg: "Required",
                                is_error: description === "",
                                hidden: false,
                            },
                        ]}
                    />

                    <div className="modal_btns">
                        <button
                            className="cancel_btn"
                            onClick={handle_close_report_issue}
                        >
                            Cancel
                        </button>
                        {isLoading ? (
                            <Loading />
                        ) : (
                            <button
                                className="send_btn"
                                onClick={() => {
                                    if (topic === "" || description === "") {
                                        return;
                                    }
                                    report_issue();
                                }}
                                disabled={isLoading}
                            >
                                Send
                            </button>
                        )}
                    </div>
                </div>
            </Modal>
            <span>Created By Athul George</span>
            <a href="https://github.com/athulgeorge37/Breaddit" target="blank">
                Code
            </a>
            <button onClick={open_modal}>Report An Issue</button>
        </footer>
    );
}

export default Footer;
