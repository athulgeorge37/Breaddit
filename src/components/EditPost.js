import TextEditor from './TextEditor';
import LoginInput from './LoginInput';

import './EditPost.scss'

function EditPost(props) {

    // might want to prop drill this

    return (
        <div className="post_inputs">

            <div className="post_title">
                <LoginInput 
                    htmlFor="title" 
                    input_type="text" 
                    label_name="Title"
                    value={props.post_title}
                    update_on_change={props.set_post_title} 
                    boolean_check={props.valid_title}
                    autoFocus={true}
                >
                    Title cannot be empty!
                </LoginInput>
            </div>                       

            <TextEditor 
                update_text={props.set_post_text}
                post_text={props.post_text}
            />

        </div>
    )
}

export default EditPost