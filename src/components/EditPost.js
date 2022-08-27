// scss import
import './EditPost.scss'


// component imports
import TextEditor from './TextEditor';
import LoginInput from './LoginInput';
import Loading from './Loading';
import { Image } from 'cloudinary-react';



function EditPost(props) {
    // might want to prop drill these props

    const {
        image_url,
        upload_img,  // is a function
        CLOUD_NAME,
        loading_img
    } = props.image_stuff 


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

            <div className="image_upload">
                <label htmlFor="upload_img">
                    <input 
                        id="upload_img"
                        type="file" 
                        onChange={(e) => upload_img(e.target.files[0])}
                    />
                    {image_url === "" ? "Upload Image" : "Replace Image"}
                </label>

                {
                    loading_img && <Loading/>
                }
            </div>   

            <div className="image_display">
                {
                    loading_img === false
                    &&
                    <>
                        {   
                            image_url !== ""
                            &&
                            <Image 
                                cloudName={CLOUD_NAME}
                                publicId={image_url}
                            />
                        }  
                    </>
                }
            </div>                  

            <TextEditor 
                update_text={props.set_post_text}
                post_text={props.post_text}
            />

        </div>
    )
}

export default EditPost