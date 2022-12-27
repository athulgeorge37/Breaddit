import { useState } from "react";
import "./Toggle.scss";

function Toggle({ set_toggle }) {
    return (
        <label className="Toggle">
            <input
                type="checkbox"
                onChange={(e) => set_toggle(e.target.checked)}
            />
            <span />
        </label>
    );
}

export default Toggle;
