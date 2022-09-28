import './ParsedText.scss';
import parse from 'html-react-parser';

function ParsedText({ children }) {
    // required to sepereate all the styling 
    // associated with text from the text editor

    return (
        <div className="parsed_text">
            {parse(children)}
            {/* {children} */}
        </div>
    )
}

export default ParsedText