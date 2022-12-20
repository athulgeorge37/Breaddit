import "./FilterOptions.scss";
import { useNavigate } from "react-router-dom";
import { usePostsPage } from "../../pages/PostsPage";

import SearchThreadNames from "./SearchThreadNames";

function FilterOptions({ SORT_BY_OPTIONS }) {
    const navigate = useNavigate();
    const { sort_by, set_sort_by, update_search_param } = usePostsPage();

    const handle_sort_by_change = (new_option) => {
        set_sort_by(new_option);
        update_search_param("sort_by", new_option);
    };

    return (
        <div className="FilterOptions">
            <div className="sort_by_options">
                {SORT_BY_OPTIONS.map((option) => {
                    return (
                        <button
                            key={option}
                            onClick={() => handle_sort_by_change(option)}
                            className={sort_by === option ? "active" : ""}
                        >
                            {option}
                        </button>
                    );
                })}
            </div>
            <div className="create_btns">
                <button
                    className="create_thread"
                    onClick={() => navigate("/create_thread")}
                >
                    Create Thread
                </button>

                <button
                    className="create_post"
                    onClick={() => navigate("/create_post")}
                >
                    Create Post
                </button>
            </div>

            <div className="search_thread_names">
                <SearchThreadNames />
            </div>
        </div>
    );
}
export default FilterOptions;
