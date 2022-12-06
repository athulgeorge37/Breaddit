// Styles import
import "./Button.scss";

function Button({
    onClick,
    type,
    active,
    span_class_name,
    img_name,
    span_text = null,
    img_path = "..",
    margin_right = false,
    margin_left = false,
    size = "large",
}) {
    // DESCRIPTION:
    // - Button takes in the above props to generate a reusable component
    //   that can be used to create a button using a pre-existing image.
    // - Updating the props can change how the button looks using classname.
    // - Each button has a tooltip, which can also dynamically change by updating span_text

    // PROPS:
    // - handle_btn_click: function to be exectued on button click
    // - type: helps initiate button styles, using the classname
    // - active: boolean that helps change the color of a button
    // - span_text: the text you want for your tooltip
    // - span_class_name: useful to update tooltip width based on span_text
    // - img_name: should be the name of the image you want to use, eg: "edit.png" ==> "edit"
    // - margin_right / margin_left: boolean that puts 10px margin to the respective side,
    //   intially false

    // TIPS:
    // - To add new button, that does not already exist, add a new image
    //   to the Breaddit/public/images folder.
    // - Also add the required styles in Button.scss.
    // - Use the existing styles as a template to create your own.

    // up and down votes do not make use of Button component,
    // due to differnt requirements

    return (
        <button
            className={`${type}_btn ${margin_right ? "margin_right" : ""} ${
                margin_left ? "margin_left" : ""
            }`}
            onClick={onClick}
        >
            {span_text !== null && (
                <span className={span_class_name}>{span_text}</span>
            )}

            <img
                className={`${type}_img ${active && "active"} size_${size}`}
                src={`${img_path}/images/${img_name}.png`}
                alt={`${type}_btn`}
                loading="lazy"
            />
        </button>
    );
}

export default Button;
