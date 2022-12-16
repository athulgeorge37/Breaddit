import "./Modal.scss";
import { useState, forwardRef, useImperativeHandle, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";

function Modal({ children, btn_color, width }, ref) {
    // this component require a ref to be attached to it
    // we can use this ref to call methods that were before
    // only available in the scope of this component

    const [show_modal, set_show_modal] = useState(false);
    const [disable_scroll, set_disable_scroll] = useState(false);

    // this allows us to call these methods from a parent component
    // to open a modal write:
    // modal_ref.current.open_modal()
    useImperativeHandle(ref, () => {
        return {
            open_modal: open_modal,
            close_modal: close_modal,
        };
    });

    const open_modal = () => {
        set_show_modal(true);
        set_disable_scroll(true);
    };

    const close_modal = () => {
        set_show_modal(false);
        set_disable_scroll(false);
    };

    // whenever disable_scroll state changes
    // we make the body have a hidden style
    // so we can disable scroll
    useEffect(() => {
        if (disable_scroll) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [disable_scroll]);

    // when show_modal is true
    // we attach this component to
    // modal_root div in index.html in the public folder
    // using createPortal, this way its always
    // at the top level of our project
    return createPortal(
        <AnimatePresence>
            {show_modal ? (
                <div className="Modal">
                    <motion.div
                        className="modal_backdrop"
                        initial={{
                            opacity: 0,
                        }}
                        animate={{
                            opacity: 1,
                            transition: {
                                duration: 0.3,
                            },
                        }}
                        exit={{
                            opacity: 0,
                            transition: {
                                duration: 0.1,
                            },
                        }}
                    />

                    <motion.div
                        className="modal_wrapper"
                        onClick={close_modal}
                        initial={{
                            scale: 0,
                        }}
                        animate={{
                            scale: 1,
                            transition: {
                                duration: 0.5,
                            },
                        }}
                        exit={{
                            scale: 0,
                            transition: {
                                duration: 0.3,
                            },
                        }}
                    >
                        <motion.div
                            className={`modal_content ${btn_color}_btn`}
                            style={{
                                width: `${width}px`,
                            }}
                        >
                            {children}
                        </motion.div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>,

        document.getElementById("modal_root")
    );
}

export default forwardRef(Modal);
