import { createPortal } from "react-dom";

function Portal({ children }) {
    // this component will attach the children elements
    // to the div id="root" in the
    //  index.html in the public folder
    // using createPortal, this way its always
    // at the top level of our project
    return createPortal(children, document.getElementById("root"));
}

export default Portal;
