import "./ThreadPage.scss";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { get_thread_details } from "../rest_api_requests/ThreadRequests";
import CloudinaryImage from "../components/CloudinaryImage";
import Loading from "../components/ui/Loading";
import ThreadLogo from "../features/thread/ThreadLogo";

function ThreadPage() {
    const { thread_id_route } = useParams();
    const thread_id = parseInt(thread_id_route);

    const { data, isError, isLoading } = useQuery(
        ["thread_id", thread_id],
        () => {
            return get_thread_details(thread_id);
        },
        {
            onSuccess: (data) => {
                console.log({ data });
            },
            onError: (data) => {
                console.log({ data });
            },
        }
    );

    if (isError) {
        return <div>An Error Occurred</div>;
    }

    if (isLoading) {
        return <Loading />;
    }

    return (
        <div className="ThreadPage">
            <div className="theme">
                <CloudinaryImage
                    image_url={data.thread_details.theme}
                    alt="Thread Theme"
                />
            </div>

            <div className="main_content">
                <div className="title_and_logo">
                    <div className="logo">
                        <ThreadLogo
                            img_url={data.thread_details.logo}
                            thread_id={thread_id}
                        />
                    </div>
                    <h2>{data.thread_details.title}</h2>
                </div>
            </div>
        </div>
    );
}

export default ThreadPage;
