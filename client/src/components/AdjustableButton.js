import React from 'react';
import './AdjustableButton.scss'

function AdjustableButton(props) {
    // to change the color of buttons, you must add the new styles in the 
    // corresponding scss file where this component is used

    // to use this compoent put this into your jsx

    // <AdjustableButton
    //     boolean_check={state}
    //     execute_onclick={update_state}
    //     original_class_name="any_class_name"
    //     active_name="text to show on active"
    //     inactive_name="text to show when inactive"
    //     btn_type_txt={true}
    // />

    // make btn_type_txt true if you want a text version of the button
    // otherwise you an leave it empty
    
    return (
        <button 
            className={
                (props.original_class_name ? props.original_class_name : "") + " " +
                (props.boolean_check ? "active_btn" : "inactive_btn") +
                ((props.btn_type_txt ? props.btn_type_txt : "") && "_text")
            }
            onClick={props.execute_onclick}
        >
            {props.boolean_check ? props.active_name : props.inactive_name}
        </button>
    )
}

export default AdjustableButton