import "./ExpandableInput.scss";

function ExpandableInput({
    set_input_content,
    max_height_px,
    placeholder,
    initial_content,
}) {
    // ExpandableInput simply increases an input field height based
    // on the text within it
    // it will also autoshrink when text is deleted

    const handle_resize = (e) => {
        set_input_content(e.target.value);

        // alows textarea to shrink when space is not being used
        e.target.style.height = "inherit";

        // e.target.style.height = `${e.target.scrollHeight}px`;

        // ensures add comment text_area does not exceed props.max_height_px
        // if it does, it will turn into a scrollable area
        e.target.style.height = `${Math.min(
            e.target.scrollHeight,
            max_height_px
        )}px`;
    };

    return (
        <div className="ExpandableInput">
            {initial_content === undefined ? (
                <textarea
                    className="expandable_input"
                    placeholder={placeholder}
                    onChange={handle_resize}
                    rows={1}
                    autoFocus
                />
            ) : (
                <>
                    {initial_content === "" ? (
                        <textarea
                            className="expandable_input"
                            placeholder={placeholder}
                            onChange={handle_resize}
                            autoFocus
                            rows={1}
                            value=""
                        />
                    ) : (
                        <textarea
                            className="expandable_input"
                            defaultValue={initial_content}
                            onChange={handle_resize}
                            rows={1}
                        />
                    )}
                </>
            )}
        </div>
    );
}

export default ExpandableInput;
