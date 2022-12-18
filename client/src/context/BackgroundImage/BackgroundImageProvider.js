import { createContext, useContext, useEffect, useState } from "react";
import "./BackgroundImageProvider.scss";

const BackgroundImageContext = createContext();

export default function BackgroundImageProvider({ children }) {
    const [background_img_url, set_background_img_url] = useState(null);

    return (
        <BackgroundImageContext.Provider value={{ set_background_img_url }}>
            {/* {background_img_url === null ? (
                <>{children}</>
            ) : ( */}
            <div className="background_image_parent">
                <div
                    id="background_image"
                    className="background_image"
                    style={{
                        backgroundImage: `url(${background_img_url})`,
                    }}
                />
                <div>{children}</div>
            </div>
            {/* )} */}
        </BackgroundImageContext.Provider>
    );
}

export const useBackgroundImage = () => {
    // this is a custom hook that provides
    // access to the below methods

    const { set_background_img_url } = useContext(BackgroundImageContext);

    return {
        set_background_img_url,
    };
};
