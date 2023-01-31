import "./Input.scss";
import ResizableInput from "./ResizableInput";

// errors is a list of object that looks like this
// {
//     id: "min_three_char",
//     msg: "Must contain atleast 3 characters",
//     is_error: !min_three_char,
//     hidden: username === "" ? true : false,
// },

function Input({
    type,
    onChange,
    value,
    placeholder,
    label_text,
    id,
    maxLength,
    minLength,
    max_height,
    min_height,
    icon, // svg element for an icon, which is on the right side of the input with left margin
    errors = [],
    label_hidden = false,
    autoFocus = false,
    resizable = false,
}) {
    return (
        <div className="Input">
            {label_text && (
                <label
                    htmlFor={id}
                    className={`input_label ${id}_label`}
                    //style={{ visibility: label_hidden ? "hidden" : "visible" }}
                    hidden={label_hidden}
                >
                    {label_text}
                </label>
            )}
            {icon ? (
                <div className={`input_field ${id}_input input_with_icon`}>
                    <input
                        id={id}
                        type={type}
                        value={value}
                        onChange={onChange}
                        placeholder={placeholder}
                        autoFocus={autoFocus}
                        maxLength={maxLength}
                        minLength={minLength}
                    />
                    {icon}
                </div>
            ) : (
                <>
                    {resizable === true ? (
                        <ResizableInput
                            id={id}
                            className={`input_field ${id}_input`}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            autoFocus={autoFocus}
                            maxLength={maxLength}
                            minLength={minLength}
                            max_height={max_height}
                            min_height={min_height}
                        />
                    ) : (
                        <input
                            id={id}
                            className={`input_field ${id}_input`}
                            type={type}
                            value={value}
                            onChange={onChange}
                            placeholder={placeholder}
                            autoFocus={autoFocus}
                            maxLength={maxLength}
                            minLength={minLength}
                        />
                    )}
                </>
            )}
            {errors.length === 0 ? null : (
                <ul className={`error_list ${id}_input_errors`}>
                    {errors.map((error) => {
                        if (error.hidden) {
                            return null;
                        }
                        return (
                            <li
                                key={error.id}
                                className={`error_item ${error.id}_error ${
                                    error.is_error ? "error" : "not_error"
                                } `}
                            >
                                {error.is_error ? (
                                    <svg
                                        className="error_icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                ) : (
                                    <svg
                                        className="not_error_icon"
                                        fill="none"
                                        stroke="currentColor"
                                        viewBox="0 0 24 24"
                                        xmlns="http://www.w3.org/2000/svg"
                                    >
                                        <path
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                            strokeWidth={2}
                                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                        />
                                    </svg>
                                )}
                                <p className="error_msg">{error.msg}</p>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}

export default Input;
