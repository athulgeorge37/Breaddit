// styles
import "./ThreadDetails.scss";

// hooks
import { usePostsPage } from "../../pages/PostsPage";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

// api
import { get_thread_details } from "../../api/ThreadRequests";

// components
import Loading from "../../components/ui/Loading";
import ThreadLogo from "./ThreadLogo";
import Rule from "./Rule";
import ProfilePicture from "../profile/profile_picture/ProfilePicture";

// helper
import { human_readable_date } from "../../helper/time";

function ThreadDetails() {
    const { thread_title } = usePostsPage();

    const navigate = useNavigate();

    const thread_data = useQuery(
        ["thread_details", thread_title],
        () => {
            return get_thread_details(thread_title);
        },
        {
            onSuccess: (data) => {
                //console.log({ thread_data: data });
            },
            onError: (data) => {
                console.log({ thread_data_error: data });
            },
        }
    );

    const thread_details = thread_data.data?.thread_details;

    return (
        <div className="ThreadDetails">
            {thread_data.isLoading && <Loading />}

            {thread_data.error && (
                <div className="error">
                    Error: {JSON.stringify(thread_data.error)}
                </div>
            )}

            {thread_details !== null && (
                <>
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
                                <h2 className="title">
                                    {thread_details?.title}
                                </h2>
                            </div>
                        </div>

                        <div className="content">
                            <div className="description">
                                <span>Description:</span>
                                <p>{thread_details?.description}</p>
                            </div>
                            <div className="createdAt">
                                <span>Created On:</span>
                                <p>
                                    {human_readable_date(
                                        thread_details?.createdAt
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="thread_rules">
                        <h3>Rules:</h3>
                        {thread_details?.thread_rules.map((rule) => {
                            return <Rule key={rule.id} rule={rule} />;
                        })}
                    </div>

                    <div className="creator_details">
                        <h3>Creator:</h3>

                        <button
                            className="profile_pic_and_username"
                            onClick={() =>
                                navigate(
                                    `/profile/${thread_details?.creator_details.username}`
                                )
                            }
                        >
                            <ProfilePicture
                                profile_picture_url={
                                    thread_details?.creator_details.profile_pic
                                }
                                username={
                                    thread_details?.creator_details.username
                                }
                            />

                            <b className="username">
                                {thread_details?.creator_details.username}
                            </b>
                        </button>
                    </div>
                </>
            )}
        </div>
    );
}

export default ThreadDetails;
