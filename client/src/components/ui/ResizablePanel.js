import { useEffect, useState } from "react";
import { motion, MotionConfig, AnimatePresence } from "framer-motion";
import useMeasure from "react-use-measure";
import AdjustableButton from "./AdjustableButton";

export default function ResizablePanel({
    children,
    min_height,
    allow_show_more_btn,
    set_allow_show_more_btn,
    show_more_content,
}) {
    // this component allows anything inside it to be animated between different heights.
    // It will always have a min_height
    // but can expand further

    // required to measure the height so we can smoothly animate the height
    const [ref, { height }] = useMeasure();

    useEffect(() => {
        // only allowing component to render show more/less btn
        // if the content of the post takes up more than 500px
        if (allow_show_more_btn === false) {
            // if you want to change this value, u must also change in the css
            // where the classname is .show_less in this component for it to work
            if (height > min_height) {
                set_allow_show_more_btn(true);
            }
        }
        // runs useEffect every rerender
    });

    return (
        <motion.div
            className="ResizablePanel"
            style={{
                // allows content to take full width
                // and prevent content from overflowing while
                // panel is being animated
                width: "100%",
                overflow: "hidden",
            }}
            initial={false}
            animate={{
                // allows us to animate height when height changes
                height: height,
                transition: {
                    duration: 0.5,
                },
            }}
        >
            {
                // only rendering smaller content panel
                // when the show_more_btn is enabled
                // and show_more_content is false
                allow_show_more_btn === true && show_more_content === false ? (
                    // small panel
                    <div
                        className="content"
                        ref={ref}
                        style={{
                            height: min_height,
                            overflow: "hidden",
                        }}
                    >
                        {children}
                    </div>
                ) : (
                    // larger panel
                    <div className="content" ref={ref}>
                        {children}
                    </div>
                )
            }
        </motion.div>
    );
}

export const useResizablePanel = () => {
    const [allow_show_more_btn, set_allow_show_more_btn] = useState(false);
    const [show_more_content, set_show_more_content] = useState(false);

    const ShowMoreBtn = () => {
        return (
            <>
                {allow_show_more_btn && (
                    <AdjustableButton
                        boolean_check={show_more_content}
                        execute_onclick={() =>
                            set_show_more_content(!show_more_content)
                        }
                        original_class_name="show_more_less_btn"
                        active_name="Read Less"
                        inactive_name="Read More"
                        btn_type_txt={true}
                    />
                )}
            </>
        );
    };

    return {
        ShowMoreBtn,
        allow_show_more_btn,
        set_allow_show_more_btn,
        show_more_content,
        set_show_more_content,
    };
};

export function ResizableComponent({ children }) {
    const [ref, { height }] = useMeasure();

    return (
        <MotionConfig
            transition={{
                duration: 0.5,
            }}
        >
            <motion.div
                className="ResizableComponent"
                key={JSON.stringify(children, ignore_circular_references())}
                style={{
                    // allows content to take full width
                    // and prevent content from overflowing while
                    // panel is being animated
                    width: "100%",
                    overflow: "hidden",
                }}
                initial={false}
                animate={{
                    // allows us to animate height when height changes
                    height: height,
                }}
            >
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                    <div
                        className="content"
                        ref={ref}
                        style={{
                            overflow: "hidden",
                        }}
                    >
                        {children}
                    </div>
                </motion.div>
            </motion.div>
        </MotionConfig>
    );
}

const ignore_circular_references = () => {
    const seen = new WeakSet();
    return (key, value) => {
        if (key.startsWith("_")) {
            return;
        }
        if (typeof value === "object" && value != null) {
            if (seen.has(value)) {
                return;
            }
        }
        return value;
    };
};
