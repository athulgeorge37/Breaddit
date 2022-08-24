import './ExpandableInput.scss';

function ExpandableInput({set_input_content, max_height_px, placeholder}) {

    // ExpandableInput simply increases an input field height based
    // on the text within it
    // it will also autoshrink when text is deleted


    const handle_resize = (e) => {

        set_input_content(e.target.value)

        // alows textarea to shrink when space is not being used
        e.target.style.height = 'inherit';
        
        // e.target.style.height = `${e.target.scrollHeight}px`; 

        // ensures add comment text_area does not exceed props.max_height_px
        // if it does, it will turn into a scrollable area
        e.target.style.height = `${Math.min(e.target.scrollHeight, max_height_px)}px`;
        
    }

    return (
        <textarea 
            autoFocus
            className="expandable_input" 
            placeholder={placeholder}
            rows={1}
            onChange={handle_resize}
        />
    )
}

export default ExpandableInput