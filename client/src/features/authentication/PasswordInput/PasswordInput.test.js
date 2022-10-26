import { render, fireEvent } from "@testing-library/react";

import PasswordInput from "./PasswordInput";

// use get when u know something will be rendered
// use query when u know something may or may not be rednered, conditionally



// this unit test checks if when the error correction messages in the UI change when a user 
// inputs the correct and incorrect password character requirements
// it checks the number of elements that contain the classname "valid"


// testing on other componnets were not able to work completley cus there were many errors
// due to having useContext and useNaviagte being used in all the requireed components for unit testing

describe(PasswordInput, () => {

    it("Password is valid when it contains required characters", () => {
    
        const { getByTestId, container } = render(
            <PasswordInput 
                initial_password="Password123!" 
                label_name={"password"} 
                set_password_info={() => {
                    return null
                }}
            />
        );

        let password_to_use = "Password123!"

        let password_input = getByTestId("password_input");

        fireEvent.change(password_input, {
            target: { value: password_to_use }
        })

        // checking if the input contains the correct text
        expect(password_input.value).toBe(password_to_use)
        
        // checking if the errors contain 5 "valid" classnames for all requirements satisfied
        expect(container.getElementsByClassName("valid").length).toBe(5)


        password_to_use = "Pass"

        password_input = getByTestId("password_input");

        fireEvent.change(password_input, {
            target: { value: password_to_use }
        })

        // checking if the input contains the correct text
        expect(password_input.value).toBe(password_to_use)
        
        // checking if the errors contain 5 "valid" classnames for all requirements satisfied
        expect(container.getElementsByClassName("valid").length).toBe(2)

    })

})