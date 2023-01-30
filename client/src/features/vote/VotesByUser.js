// styles
import "./VotesByUser.scss";

// hooks
import { useState } from "react";
import { useLocation } from "react-router-dom";
// components
import VotedPostsInfiniteScroll from "./VotedPostsInfiniteScroll";

// constants
const PARENT_TYPES = ["Posts", "Comments", "Replies"];
const SORT_BY_OPTIONS = ["New", "Old"];

function VotesByUser() {
    const { pathname } = useLocation();

    const username = pathname.split("/")[2];

    const [parent_type, set_parent_type] = useState(PARENT_TYPES[0]);
    const [up_voted, set_up_voted] = useState(true);
    const [sort_by, set_sort_by] = useState(SORT_BY_OPTIONS[0]);

    return (
        <div className="VotesByUser">
            <div className="header">
                <div className="toggle_voted_mode">
                    <button
                        className={`up_vote_toggle_btn ${
                            up_voted ? "active" : ""
                        }`}
                        onClick={() => set_up_voted(true)}
                    >
                        Up Voted
                    </button>

                    <button
                        className={`down_vote_toggle_btn ${
                            up_voted ? "" : "active"
                        }`}
                        onClick={() => set_up_voted(false)}
                    >
                        Down Voted
                    </button>
                </div>

                <div className="parent_type_options">
                    {PARENT_TYPES.map((type) => {
                        return (
                            <button
                                key={type}
                                className={`parent_type_option ${
                                    type === parent_type ? "active" : ""
                                }`}
                                onClick={() => set_parent_type(type)}
                            >
                                {type}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="header_two">
                <div className="info">
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
                            d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z"
                        ></path>
                    </svg>
                    <p>
                        Showing all {parent_type.toLowerCase()} that {username}{" "}
                        has {up_voted ? "up" : "down"} voted
                    </p>
                </div>
                <div className="sort_by_options">
                    {SORT_BY_OPTIONS.map((option) => {
                        return (
                            <button
                                key={option}
                                className={`sort_by_option ${
                                    option === sort_by ? "active" : ""
                                }`}
                                onClick={() => set_sort_by(option)}
                            >
                                {option}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="infinte_scroll_content">
                <VotedPostsInfiniteScroll
                    username={username}
                    up_voted={up_voted}
                    sort_by={sort_by}
                    parent_type={parent_type}
                />
            </div>
        </div>
    );
}

export default VotesByUser;
