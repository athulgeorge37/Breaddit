// scss import
import './EditPost.scss'

// hook imports
import { useRef } from 'react';

// component imports
import TextEditor from './TextEditor';
import LoginInput from './LoginInput';
import Loading from './Loading';
import { Image } from 'cloudinary-react';
import Button from './Button';

function EditPost(props) {
    // might want to prop drill these props

    const {
        image_url,
        upload_img,  // is a function
        CLOUD_NAME,
        loading_img,
        set_image_url
    } = props.image_stuff 

    const img_input_ref = useRef();

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

                <div className="img_btns">
                    <input 
                        id="upload_img"
                        type="file" 
                        ref={img_input_ref}
                        onChange={(e) => upload_img(e.target.files[0])}
                        hidden={true}
                    />
                    
                    <Button 
                        handle_btn_click={() => img_input_ref.current.click()}
                        type="add_img"
                        span_text={image_url === "" ? "Upload Image" : "Replace Image"}
                        img_name="add_img"
                    />   

                    {
                        image_url !== "" 
                        &&
                        <Button 
                            handle_btn_click={() => set_image_url("")}
                            type="remove_img"
                            span_text="Remove Image"
                            img_name="remove_img"
                            margin_left={true}
                        />
                    }
                </div>
            </div>


            
                {       
                    loading_img && 
                    <div className="image_display">
                        <Loading/>
                    </div>
                    
                }

                {
                    loading_img === false
                    &&
                    <>
                        {   
                            image_url !== ""
                            &&
                            <div className="image_display">
                                <Image 
                                    cloudName={CLOUD_NAME}
                                    publicId={image_url}
                                />
                            </div>
                        }  
                    </>
                }
                          

            <TextEditor 
                update_text={props.set_post_text}
                post_text={props.post_text}
            />

        </div>
    )
}

export default EditPost