import { useContext } from "react";
import { useReducer, createContext } from "react";
import { v4 as uuid } from "uuid";

import Notification from "./Notification";
import "./NotificationProvider.scss";

const NotificationContext = createContext();

const NOTIFICATION_ACTIONS = {
    ADD_NOTIFICATION: "ADD_NOTIFICATION",
    REMOVE_NOTIFICATION: "REMOVE_NOTIFICATION",
};

const notification_reducer = (state, action) => {
    // this is a function that handles our action.
    // state represents the previous state

    // action = {
    //     type: "some_name",
    //     payload: {
    //         // content for our action
    //     }
    // }

    switch (action.type) {
        case NOTIFICATION_ACTIONS.ADD_NOTIFICATION:
            // adding the contents of the payload
            // at the end of the notification array
            return [...state, { ...action.payload }];

        case NOTIFICATION_ACTIONS.REMOVE_NOTIFICATION:
            // returns an array, that does not
            // contain the id passed through the payload
            return state.filter((notification) => {
                return notification.id !== action.payload.id;
            });

        default:
            return state;
    }
};

export default function NotificationProvider({ children }) {
    const [all_notifications, dispatch] = useReducer(notification_reducer, []);
    // this empty array is the initial state

    return (
        <NotificationContext.Provider value={dispatch}>
            <div className="NotificationProvider">
                <div className="notification_list">
                    <div className="all_notifications">
                        {all_notifications.map((notification) => {
                            return (
                                <Notification
                                    key={notification.id}
                                    dispatch={dispatch}
                                    {...notification}
                                />
                            );
                        })}
                    </div>
                </div>

                {children}
            </div>
        </NotificationContext.Provider>
    );
}

export const useNotification = () => {
    // this is a custom hook we can
    // use anywhere in our app to  add_notifications

    // when creating the context provider above
    // we have access to dispatch, which we are using below
    const dispatch = useContext(NotificationContext);

    const add_notification = (message, type = "SUCCESS") => {
        dispatch({
            type: "ADD_NOTIFICATION",
            payload: {
                id: uuid(),
                type: type,
                message: message,
            },
        });
    };

    return add_notification;
};
