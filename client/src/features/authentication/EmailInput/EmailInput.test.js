import { render, fireEvent } from "@testing-library/react";

import EmailInput from "./EmailInput";


// code required for test to work with useNavigate
import * as router from "react-router";
const navigate = jest.fn();

beforeEach(() => {
  jest.spyOn(router, "useNavigate").mockImplementation(() => navigate);
});

// use get when u know something will be rendered
// use query when u know something may or may not be rednered, conditionally



// this unit test checks if when the error correction messages in the UI change when a user 
// inputs the correct and incorrect password character requirements
// it checks the number of elements that contain the classname "valid"


describe(EmailInput, () => {

    it("Password is valid when it contains required characters", () => {
    
        const { getByTestId, container } = render(
            <EmailInput 
                initial_email="" 
                set_email_info={() => {
                    return null
                }}
            />
        );

        let email_to_use = "helloWorldgmail.com"

        let email_input = getByTestId("email_input");

        fireEvent.change(email_input, {
            target: { value: email_to_use }
        })

        // checking if the input contains the correct text
        expect(email_input.value).toBe(email_to_use)
        
        // checking if the errors contain 1 "valid" classnames for all requirements satisfied
        expect(container.getElementsByClassName("valid").length).toBe(1)




    })

})