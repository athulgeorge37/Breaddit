// styles
import "./SortByOptions.scss";

// hooks
import { usePostsPage } from "../../pages/PostsPage";

function SortByOptions({ SORT_BY_OPTIONS }) {
    const { sort_by, set_sort_by, update_search_param } = usePostsPage();

    const handle_sort_by_change = (new_option) => {
        set_sort_by(new_option);
        update_search_param("sort_by", new_option);
    };

    return (
        <div className="SortByOptions">
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
        </div>
    );
}
export default SortByOptions;
