import { createContext, useContext, useEffect, useState } from "react";
import "./BackgroundImageProvider.scss";

const BackgroundImageContext = createContext();

export default function BackgroundImageProvider({ children }) {
    const [background_img_url, set_background_img_url] = useState(null);

    const [disable_scroll, set_disable_scroll] = useState(false);

    useEffect(() => {
        if (disable_scroll) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
    }, [disable_scroll]);

    return (
        <BackgroundImageContext.Provider
            value={{ set_background_img_url, set_disable_scroll }}
        >
            {background_img_url === null ? (
                <>{children}</>
            ) : (
                <div className="background_image_parent">
                    <div
                        className="background_image"
                        style={{
                            backgroundImage: `url(${background_img_url})`,
                        }}
                    />
                    <div>{children}</div>
                </div>
            )}
        </BackgroundImageContext.Provider>
    );
}

export const useBackgroundImage = () => {
    // this is a custom hook that provides
    // access to the below methods

    const { set_background_img_url, set_disable_scroll } = useContext(
        BackgroundImageContext
    );

    return {
        set_background_img_url,
        set_disable_scroll,
    };
};
