// styles
import "./SearchWithinThread.scss";

// hooks
import { useState, useRef, useEffect } from "react";
import { usePostsPage } from "../../pages/PostsPage";

// ui
import ToolTip from "../../components/ui/ToolTip";

function SearchWithinThread() {
    const {
        thread_title,
        search_within_thread,
        set_search_within_thread,
        update_search_param,
        delete_search_param,
    } = usePostsPage();

    const [search_input, set_search_input] = useState(
        search_within_thread ?? ""
    );
    const input_ref = useRef();

    const handle_search_input = (new_value) => {
        if (new_value === "") {
            set_search_within_thread(null);
            delete_search_param("search");
        }
        set_search_input(new_value);
    };

    useEffect(() => {
        // ensuring the search within thread input matches the search param
        if (search_within_thread === null) {
            set_search_input("");
        } else {
            set_search_input(search_within_thread);
        }
    }, [search_within_thread]);

    return (
        <div className="SearchWithinThread">
            <div className="search_thread_input">
                <div className="search_within_thread_input_div">
                    <input
                        className="search_within_thread_input"
                        ref={input_ref}
                        type="text"
                        placeholder={
                            thread_title !== null
                                ? `Search within ${thread_title}`
                                : search_input === ""
                                ? "Search for a post"
                                : ""
                        }
                        value={search_input}
                        onChange={(e) => handle_search_input(e.target.value)}
                    />
                    {search_within_thread !== null && (
                        <ToolTip text="Remove Search">
                            <button
                                className="cancel_icon"
                                onClick={() => {
                                    set_search_input("");
                                    set_search_within_thread(null);
                                    input_ref.current.focus();

                                    delete_search_param("search");
                                }}
                            >
                                <svg
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M6 18L18 6M6 6l12 12"
                                    />
                                </svg>
                            </button>
                        </ToolTip>
                    )}
                </div>

                <button
                    className="search_btn"
                    onClick={() => {
                        set_search_within_thread(search_input);
                        update_search_param("search", search_input);
                    }}
                >
                    Search
                </button>
            </div>
        </div>
    );
}

export default SearchWithinThread;
