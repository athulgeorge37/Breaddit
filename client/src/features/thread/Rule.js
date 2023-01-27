// styles
import "./Rule.scss";

// hooks
import { useState } from "react";
import ToolTip from "../../components/ui/ToolTip";

function Rule({ rule }) {
    const [is_open, set_is_open] = useState(false);

    return (
        <div className="Rule" onClick={() => set_is_open(!is_open)}>
            <div className="title_and_chevron">
                <div className="title">{rule.title}</div>

                <ToolTip text={is_open ? "Hide" : "Expand"}>
                    <button
                        className="chevron"
                        onClick={() => set_is_open(!is_open)}
                    >
                        {is_open ? (
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
                                    d="M19 9l-7 7-7-7"
                                />
                            </svg>
                        ) : (
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
                                    d="M5 15l7-7 7 7"
                                />
                            </svg>
                        )}
                    </button>
                </ToolTip>
            </div>

            {is_open && <div className="description">{rule.description}</div>}
        </div>
    );
}

export default Rule;
