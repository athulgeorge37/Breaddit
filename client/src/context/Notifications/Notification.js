import React from "react";
import "./Notification.scss";
import ToolTip from "../../components/ui/ToolTip";
import { useState } from "react";
import { useEffect } from "react";

function Notification({ id, type, message, dispatch }) {
    const [exit_out_of_view, set_exit_out_of_view] = useState(false);
    const [expiration_bar_percent, set_expiration_bar_percent] = useState(0);
    const [interval_ids, set_interval_ids] = useState([]);

    const start_expiration_bar = () => {
        const curr_interval_id = setInterval(() => {
            set_expiration_bar_percent((prev_percent) => {
                if (prev_percent < 100) {
                    return prev_percent + 0.5;
                }

                // prevents this loop from running
                // over and over again when we reach 100
                clearInterval(curr_interval_id);

                return prev_percent;
            });

            // runs this annonyymous function every 20 ms
        }, [30]);

        // we need to keep track of the curr_interval_id
        // in order to pause the animation later
        set_interval_ids((prev_intervals) => {
            return [...prev_intervals, curr_interval_id];
        });
    };

    const pause_expiration_bar = () => {
        // if we clear the interval id, the
        // animation for the expiration bar will stop
        for (const interval_id of interval_ids) {
            clearInterval(interval_id);
        }
        set_interval_ids([]);
    };

    const handle_close_notification = () => {
        pause_expiration_bar();
        set_exit_out_of_view(true);

        setTimeout(() => {
            // remove from notifcation provider state
            // and therfore removed from the dom
            dispatch({
                type: "REMOVE_NOTIFICATION",
                payload: {
                    id: id,
                    // coming from props
                },
            });

            // removes notification after 400 ms, same as animation exit
        }, [400]);
    };

    useEffect(() => {
        // starting the animation when the
        // Notifcation component first mounts
        start_expiration_bar();
    }, []);

    useEffect(() => {
        if (expiration_bar_percent === 100) {
            handle_close_notification();
        }
    }, [expiration_bar_percent]);

    return (
        <div
            className={`Notification ${
                exit_out_of_view ? "slide_out_of_view" : ""
            }`}
            onMouseEnter={pause_expiration_bar}
            onMouseLeave={start_expiration_bar}
        >
            <div className="content">
                <div className="message">{message}</div>

                <ToolTip text="Dismiss">
                    <button
                        className={`dismiss_btn ${type}_btn`}
                        onClick={handle_close_notification}
                    >
                        {type === "SUCCESS" ? (
                            <svg
                                className="success_icon icon"
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
                        ) : (
                            <svg
                                className="remove_icon icon"
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
                        )}
                    </button>
                </ToolTip>
            </div>

            <div
                className={`expiration_bar ${type}`}
                style={{ width: `${expiration_bar_percent}%` }}
            />
        </div>
    );
}

export default Notification;
