// styles
import "./SearchWithinThread.scss";

// hooks
import { useState, useRef } from "react";
import { usePostsPage } from "../../pages/PostsPage";

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

    return (
        <div className="SearchWithinThread">
            <div className="search_thread_input">
                <input
                    ref={input_ref}
                    type="search"
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
                <button
                    className="clear_btn"
                    onClick={() => {
                        set_search_input("");
                        set_search_within_thread(null);
                        input_ref.current.focus();

                        delete_search_param("search");
                    }}
                >
                    Clear
                </button>
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
