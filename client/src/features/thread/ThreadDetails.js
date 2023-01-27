// styles
import "./ThreadDetails.scss";

// hooks
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useNotification } from "../../context/Notifications/NotificationProvider";

// api
import { get_thread_details } from "../../api/ThreadRequests";

// components
import Loading from "../../components/ui/Loading";
import ThreadLogo from "./ThreadLogo";
import Rule from "./Rule";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";

// helper
import { human_readable_date } from "../../helper/time";
import query_string_generator from "../../helper/query_string_generator";

function ThreadDetails({ thread_title = null, post_id = null }) {
    const navigate = useNavigate();
    const add_notification = useNotification();

    const thread_data = useQuery(
        ["thread_details", { thread_title, post_id }],
        () => {
            return get_thread_details(thread_title, post_id);
        },
        {
            onSuccess: (data) => {
                //console.log({ thread_data: data });
                if (data.error) {
                    add_notification(
                        "An error occured while getting thread details",
                        "ERROR"
                    );
                    console.log({ data });
                    return;
                }
            },
            onError: (data) => {
                add_notification(
                    "An error occured while getting thread details",
                    "ERROR"
                );
                console.log({ thread_data_error: data });
            },
        }
    );

    const thread_details = thread_data.data?.thread_details;

    return (
        <div className="ThreadDetails">
            {thread_data.isLoading && <Loading />}

            {thread_details !== null && (
                <>
                    <div className="thread_div">
                        <h3>Thread</h3>
                        <div className="thread_details">
                            <div
                                className="theme"
                                style={{
                                    backgroundImage: `url(${thread_details?.theme})`,
                                }}
                            >
                                <div className="title_and_logo">
                                    <ThreadLogo
                                        img_url={thread_details?.logo}
                                        thread_title={thread_details?.title}
                                    />
                                    <button
                                        className="title_btn"
                                        onClick={() =>
                                            navigate(
                                                `/posts?${query_string_generator(
                                                    {
                                                        thread: thread_details?.title,
                                                    }
                                                )}`
                                            )
                                        }
                                    >
                                        <h2 className="title">
                                            {thread_details?.title}
                                        </h2>
                                    </button>
                                </div>
                            </div>

                            <div className="content">
                                <div className="description">
                                    <span>Description:</span>
                                    <p>{thread_details?.description}</p>
                                </div>
                                <div className="createdAt">
                                    <span>Since:</span>
                                    <p>
                                        {human_readable_date(
                                            thread_details?.createdAt
                                        )}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="creator_details">
                        <h3>Creator</h3>

                        <div className="profile_pic_and_username_div">
                            <ProfilePicture
                                profile_picture_url={
                                    thread_details?.creator_details.profile_pic
                                }
                                username={
                                    thread_details?.creator_details.username
                                }
                            />

                            <b
                                className="username"
                                onClick={() =>
                                    navigate(
                                        `/user/${thread_details?.creator_details.username}/profile`
                                    )
                                }
                            >
                                {thread_details?.creator_details.username}
                            </b>
                        </div>
                    </div>

                    <div className="thread_rules">
                        <h3>Rules</h3>
                        {thread_details?.thread_rules.map((rule) => {
                            return <Rule key={rule.id} rule={rule} />;
                        })}
                    </div>
                </>
            )}
        </div>
    );
}

export default ThreadDetails;
