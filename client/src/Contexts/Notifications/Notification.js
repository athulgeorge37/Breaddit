import React from 'react';
import "./Notification.scss";
import Button from '../../components/Button';
import { useState } from 'react';
import { useEffect } from 'react';

function Notification({ id, type, message, dispatch }) {

    const [exit_out_of_view, set_exit_out_of_view] = useState(false);
    const [expiration_bar_percent, set_expiration_bar_percent] = useState(0);
    const [interval_ids, set_interval_ids] = useState([]);

    const start_expiration_bar = () => {

        const curr_interval_id = setInterval(() => {

            set_expiration_bar_percent((prev_percent) => {

                if (prev_percent < 100) {
                    return prev_percent + 0.5
                }

                // prevents this loop from running 
                // over and over again when we reach 100
                clearInterval(curr_interval_id)

                return prev_percent
            })

            // runs this annonyymous function every 20 ms

        }, [30])

        // we need to keep track of the curr_interval_id
        // in order to pause the animation later
        set_interval_ids((prev_intervals) => {
            return [...prev_intervals, curr_interval_id]
        })
    }

    const pause_expiration_bar = () => {
        // if we clear the interval id, the 
        // animation for the expiration bar will stop
        for (const interval_id of interval_ids) {
            clearInterval(interval_id)
        }
        set_interval_ids([])
    }

    const handle_close_notification = () => {

        pause_expiration_bar()
        set_exit_out_of_view(true)

        setTimeout(() => {
            // remove from notifcation provider state
            // and therfore removed from the dom
            dispatch({
                type: "REMOVE_NOTIFICATION",
                payload: {
                    id: id
                    // coming from props
                }
            })

            // removes notification after 400 ms, same as animation exit
        }, [400])
    }

    useEffect(() => {

        // starting the animation when the
        // Notifcation component first mounts
        start_expiration_bar()
        
    }, [])

    useEffect(() => {

        if (expiration_bar_percent === 100) {
            handle_close_notification()
        }

    }, [expiration_bar_percent])


    return (
        <div 
            className={`Notification ${exit_out_of_view ? "slide_out_of_view" : ""}`}
            onMouseEnter={pause_expiration_bar}
            onMouseLeave={start_expiration_bar}
        >
            <div className="content">
                <div className="message">{message}</div>

                <div className="remove_notfication_btn">
                    <Button 
                        handle_btn_click={handle_close_notification}
                        type="cancel"
                        img_name="cancel"
                        margin_right={true}
                    />
                </div>
            </div>

            <div 
                className={`expiration_bar ${type}`}
                style={{ width: `${expiration_bar_percent}%` }}
            />
        </div>
    )
}

export default Notification