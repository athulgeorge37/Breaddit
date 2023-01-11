// styles
import "./SearchThreadNames.scss";

// hooks
import { useState, useRef, useEffect } from "react";
import useDebounce from "../../hooks/useDebounce";
import { usePostsPage } from "../../pages/PostsPage";

// api
import { get_thread_names } from "../../api/ThreadRequests";

// ui
import Loading from "../../components/ui/Loading";
import ToolTip from "../../components/ui/ToolTip";

function SearchThreadNames() {
    const {
        thread_title,
        set_thread_title,
        update_search_param,
        delete_search_param,
    } = usePostsPage();

    const [search_term, set_search_term] = useState(thread_title ?? "");
    const [is_loading, set_is_loading] = useState(false);
    const [threads_list, set_threads_list] = useState([]);

    const input_ref = useRef();

    const debounced_search = useDebounce(search_term, 500);

    useEffect(() => {
        // searching the api for thread names
        const search_api_for_thread_names = async () => {
            set_is_loading(true);

            const data = await get_thread_names(debounced_search);
            if (data.error) {
                console.log({ data });
                return;
            }
            set_threads_list(data.threads);
            set_is_loading(false);
        };

        if (debounced_search) {
            search_api_for_thread_names();
        }
    }, [debounced_search]);

    const handle_search_term_change = (new_value) => {
        if (new_value === "") {
            set_threads_list([]);
            set_thread_title(null);
            delete_search_param("thread");
        }
        set_search_term(new_value);
    };

    useEffect(() => {
        // used to ensure the input's value correctly matches the url search param

        if (thread_title === null) {
            set_threads_list([]);
            set_search_term("");
        } else {
            set_search_term(thread_title);
        }
    }, [thread_title]);

    return (
        <div className="SearchThreadNames">
            <div className="search_thread_names_input_div">
                <input
                    className="search_thread_names_input"
                    ref={input_ref}
                    type="search"
                    placeholder="Find A Thread"
                    value={search_term}
                    onChange={(e) => handle_search_term_change(e.target.value)}
                />
                {thread_title !== null && (
                    <ToolTip text={"Remove Thread"}>
                        <button
                            className="cancel_icon"
                            onClick={() => {
                                handle_search_term_change("");
                                input_ref.current.focus();
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

            {is_loading && thread_title === null ? (
                <div className="loader">
                    <Loading />
                </div>
            ) : (
                <>
                    {threads_list.length > 0 && thread_title === null ? (
                        <div className="thread_name_list">
                            {threads_list.map((thread) => {
                                return (
                                    <button
                                        key={thread.id}
                                        className="thread_name"
                                        onClick={() => {
                                            set_thread_title(thread.title);
                                            set_search_term(thread.title);
                                            set_threads_list([]);
                                            update_search_param(
                                                "thread",
                                                thread.title
                                            );
                                        }}
                                    >
                                        <img src={thread.logo} alt="" />
                                        {thread.title}
                                    </button>
                                );
                            })}
                        </div>
                    ) : null}
                </>
            )}
        </div>
    );
}

export default SearchThreadNames;
