import './ParsedText.scss';
import parse from 'html-react-parser';

import DOMPurify from 'dompurify';
// might not even need purfiy cus either parse or ckeditor is stringifying the inputs

function ParsedText({ children }) {
    // required to sepereate all the styling 
    // associated with text from the text editor

    return (
        <div 
            className="parsed_text"  
            dangerouslySetInnerHTML={{__html: DOMPurify.sanitize(children)}}
        >
            {/* {parse(children)} */}
        </div>
    )
}

export default ParsedText