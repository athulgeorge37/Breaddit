import { useState } from "react";
import "./Toggle.scss";

function Toggle({ set_toggle, default_value }) {
    return (
        <label className="Toggle">
            <input
                type="checkbox"
                checked={default_value}
                onChange={(e) => set_toggle(e.target.checked)}
            />
            <span />
        </label>
    );
}

export default Toggle;
