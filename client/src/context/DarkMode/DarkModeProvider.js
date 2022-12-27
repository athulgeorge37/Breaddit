import { useState, useEffect, createContext, useContext } from "react";

const DarkModeContext = createContext();

const DARK_MODE_COLORS = {
    "--background-color-primary": "#111827",
    "--background-color-secondary": "#1f2937",
    "--background-color-tertiary": "#374151",

    "--text-color-primary": "#c9d1d9",
    "--text-color-primary-inversed": "black",
    "--text-color-secondary": "#64748b",

    "--border-color": "#374151",

    "--blue": "#3f8afb",
    "--red": "#d70101",
    "--green": "#238636",
};

const LIGHT_MODE_COLORS = {
    "--background-color-primary": "#cbd5e1",
    "--background-color-secondary": "#94a3b8",
    "--background-color-tertiary": "#64748b",

    "--text-color-primary": "#1f2937",
    "--text-color-primary-inversed": "white",
    "--text-color-secondary": "#4b5563",

    "--border-color": "#64748b",

    "--blue": "#0284c7",
    "--red": "#dc2626",
    "--green": "#059669",
};

function DarkModeProvider({ children }) {
    const [is_dark_mode, set_is_dark_mode] = useState(true);

    useEffect(() => {
        let COLORS_TO_MAP = DARK_MODE_COLORS;
        if (is_dark_mode === false) {
            COLORS_TO_MAP = LIGHT_MODE_COLORS;
        }

        const root_styles = document.documentElement?.style;
        Object.keys(COLORS_TO_MAP).map((key) => {
            root_styles.setProperty(key, COLORS_TO_MAP[key]);
        });
    }, [is_dark_mode]);

    return (
        <div className="DarkModeProvider">
            <DarkModeContext.Provider
                value={{ is_dark_mode, set_is_dark_mode }}
            >
                {children}
            </DarkModeContext.Provider>
        </div>
    );
}

const useDarkMode = () => {
    const { is_dark_mode, set_is_dark_mode } = useContext(DarkModeContext);

    return { is_dark_mode, set_is_dark_mode };
};

export default DarkModeProvider;
export { useDarkMode };
