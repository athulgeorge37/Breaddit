// styles
import "./Modal.scss";

// hooks
import { useEffect, useState } from "react";

// helper
import Portal from "../Portal";

// animations
import { motion, AnimatePresence } from "framer-motion";

function Modal({ children, close_modal, show_modal }) {
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

    return (
        <Portal>
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
                                className="modal_content"
                                onClick={(e) => {
                                    // stopPropagation prevents the modal from closing
                                    // when clicking inside this div, ie: the children content
                                    e.stopPropagation();
                                }}
                            >
                                {children}
                            </motion.div>
                        </motion.div>
                    </div>
                ) : null}
            </AnimatePresence>
        </Portal>
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

    // closing animation is not working for somereason when using this approach
    // const Modal = useMemo(() => {
    //     // this function only reruns to genereate a new modal component
    //     // when show_modal changes

    //     return ({ children }) => {
    //         return (
    //             <AnimatedModal
    //                 show_modal={show_modal}
    //                 set_show_modal={set_show_modal}
    //             >
    //                 {children}
    //             </AnimatedModal>
    //         );
    //     };
    // }, [show_modal]);

    return {
        show_modal,
        open_modal,
        close_modal,
        // Modal,
    };
};

export { useModal };
export default Modal;
