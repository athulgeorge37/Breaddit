import "./OTPInput.scss";

import { useState, useRef } from "react";

function OTPInput({ input_length, onComplete }) {
    // OTP means one time password
    const [OTP, set_OTP] = useState(new Array(input_length).fill(""));

    const input_refs = useRef([]);

    const handle_on_change = (e, index) => {
        const value = e.target.value;

        if (/[^0-9]/.test(value)) {
            return;
        }

        // creating a new array for OTP
        const newOTP = [...OTP];

        // adding the last value the user put into the input in OTP
        newOTP[index] = value.substring(value.length - 1);

        set_OTP(newOTP);

        // when the index is not the end, we will move the focus to the next input
        if (index !== input_length - 1) {
            input_refs.current[index + 1].focus();
        }

        // if every item in OTP is not empty
        // then execute onComplete
        if (newOTP.every((item) => item !== "")) {
            onComplete(newOTP.join(""));
        }
    };

    const handele_on_key_up = (e, index) => {
        // if the key pressed is Backspace and we are not
        // at the first input and the value at index is not empty
        if (e.key === "Backspace" && index !== 0 && !OTP[index]) {
            const newOTP = [...OTP];
            newOTP[index - 1] = "";
            set_OTP(newOTP); // making the input = "" and focusing on last element
            input_refs.current[index - 1].focus();
        }
        // if (e.key === "ArrowLeft" && index !== 0) {
        //     input_refs.current[index - 1].setSelectionRange(1, 1);
        //     input_refs.current[index - 1].focus();
        // }
        // if (e.key === "ArrowRight" && index !== input_length - 1) {
        //     input_refs.current[index + 1].focus();
        // }
    };

    return (
        <div className="OTPInput">
            {OTP.map((value, index) => {
                return (
                    <input
                        key={index}
                        type="text"
                        inputMode="numeric"
                        ref={(ref) => input_refs.current.push(ref)}
                        value={OTP[index]}
                        onChange={(e) => handle_on_change(e, index)}
                        onKeyDown={(e) => handele_on_key_up(e, index)}
                    />
                );
            })}
        </div>
    );
}

export default OTPInput;
