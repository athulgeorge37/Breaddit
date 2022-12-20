import "./Rule.scss";
import { useState } from "react";

function Rule({ rule }) {
    const [is_open, set_is_open] = useState(false);

    return (
        <button className="Rule" onClick={() => set_is_open(!is_open)}>
            <div className="title_and_chevron">
                <div className="title">{rule.title}</div>

                <div className="chevron">
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
                </div>
            </div>

            {is_open && <div className="description">{rule.description}</div>}
        </button>
    );
}

export default Rule;
