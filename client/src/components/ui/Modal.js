// styles
import "./Modal.scss";

// hooks
import { useEffect, useState, useMemo } from "react";

// helper
import { createPortal } from "react-dom";

// animations
import { motion, AnimatePresence } from "framer-motion";

function AnimatedModal({ children, show_modal, set_show_modal }) {
    // this component requires a
    // const [show_modal, set_show_modal] = useState(false);
    // to be defined where u want to call the modal
    // amd both show_modal and set_show_modal to be passed down via refs

    useEffect(() => {
        // whenever disable_scroll state changes
        // we make the body have a hidden style
        // so we can disable scroll
        if (show_modal) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [show_modal]);

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
                        onClick={() => set_show_modal(false)}
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
                        <motion.div className="modal_content">
                            {children}
                        </motion.div>
                    </motion.div>
                </div>
            ) : null}
        </AnimatePresence>,

        // attaching to modal_root will require you to use inline styles for the modal's children
        // if u want to use this method you have to uncomment modal_root div in index.html
        // document.getElementById("modal_root")

        // using "root" allows styles to be used from the component itself
        // and works just like the above method
        document.getElementById("root")
    );
}

const useModal = () => {
    // this hook not only provides the states for a modal
    // but also to open and close it
    // and a Modal component that already has the required props passed in

    const [show_modal, set_show_modal] = useState(false);

    const open_modal = () => {
        set_show_modal(true);
    };

    const close_modal = () => {
        set_show_modal(false);
    };

    const Modal = useMemo(() => {
        // this function only reruns to genereate a new modal component
        // when show_modal changes

        return ({ children }) => {
            return (
                <AnimatedModal
                    show_modal={show_modal}
                    set_show_modal={set_show_modal}
                >
                    {children}
                </AnimatedModal>
            );
        };
    }, [show_modal]);

    return {
        open_modal,
        close_modal,
        Modal,
    };
};

export { useModal };
