// styles
import "./ResizableInput.scss";

// hooks
import { useRef, useEffect } from "react";
import { motion } from "framer-motion";

// article from:
// https://medium.com/@oherterich/creating-a-textarea-with-dynamic-height-using-react-and-typescript-5ed2d78d9848

// code from:
// https://codesandbox.io/s/autosize-textarea-forked-044vh2?file=/src/useAutosizeTextArea.ts:196-668

function ResizableInput({ onChange, value, placeholder, max_height }) {
    const input_ref = useRef(null);

    useEffect(() => {
        if (input_ref.current) {
            // We need to reset the height momentarily to get the correct scrollHeight for the textarea
            input_ref.current.style.height = "0px";
            const scrollHeight = input_ref.current.scrollHeight;

            // We then set the height directly, outside of the render loop
            // Trying to set this with state or a ref will product an incorrect value.
            input_ref.current.style.height = scrollHeight + "px";
        }
    }, [input_ref.current, value]);

    return (
        <textarea
            className="ResizableInput"
            ref={input_ref}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder ?? ""}
            value={value}
            rows={1}
            style={{
                maxHeight: max_height ?? "none",
            }}
            autoFocus
        />
    );
}

export default ResizableInput;
