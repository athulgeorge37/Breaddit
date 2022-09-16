import './EditProfilePic.scss';

import { useState, useRef } from "react";
import AvatarEditor from "react-avatar-editor";
import Axios from 'axios';
import { Image } from 'cloudinary-react';
import { get_item_local_storage, set_item_local_storage } from "../helper_functions/local_storage";
import { get_user_details } from "../helper_functions/get_user_details";

import ProfilePicture from './ProfilePicture';
import Loading from './Loading';
import Button from './Button'

const UPLOAD_PRESET = "yqbnco9l"
const CLOUD_NAME = "dhnxodaho";


function EditProfilePic({ profile_picture_url, set_profile_picture_url }) {

    const [loading_img, set_loading_img] = useState(false);
    const [editing_img, set_editing_img] = useState(false);
    const img_input_ref = useRef();
    
    var editor = "";
    const [picture, setPicture] = useState({
        cropperOpen: false,
        img: null,
        rotation: 0,
        zoom: 2,
        croppedImg: false
        }
    );
    
    
    const handle_zoom = (value) => {
        setPicture({
            ...picture,
            zoom: parseFloat(value)
        });
        
    }

    const handle_rotation = (value) => {
        setPicture({
            ...picture,
            rotation: parseInt(value)
        })
    }

    const handleCancel = () => {
        setPicture({
            ...picture,
            cropperOpen: false
        });

        set_editing_img(false)
    }

    const setEditorRef = (ed) => {
        editor = ed;
    }
    
    const handleSave = () => {
        if (picture.img === null) {
            // update_profile_details("")
            set_profile_picture_url("")

            set_loading_img(true)
            setTimeout(() => {
                set_loading_img(false)
            }, 1000)
            set_editing_img(false)
            return
        }

        if (setEditorRef) {
            const canvasScaled = editor.getImageScaledToCanvas();
            const croppedImg = canvasScaled.toDataURL();

            // to get an object of height, width, x, y values of the crop
            // console.log(editor.getCroppingRect())

            setPicture({
                ...picture,
                img: null,
                cropperOpen: false,
                croppedImg: croppedImg
            });
            upload_img(croppedImg)
            set_editing_img(false)
        }
    };
    
    const handleFileChange = (new_img) => {
        let url = URL.createObjectURL(new_img);
        // console.log(url);
        
        setPicture({
            ...picture,
            img: url,
            zoom: 2,
            cropperOpen: true,
        })
    }



    const upload_img = (new_img) => {

        const formData = new FormData()

        formData.append("file", new_img)
        formData.append("upload_preset", UPLOAD_PRESET)

        set_loading_img(true)
        
        Axios.post(
            `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData
        ).then((response) => {

            const new_image_url = response.data.secure_url
            set_loading_img(false)
            set_profile_picture_url(new_image_url)
            // update_profile_details(new_image_url)
        })
    }

    return (
        <div className="EditProfilePic">
            {
                editing_img 
                ?

                <div className='open_edit_mode'>
                    <AvatarEditor
                        ref={setEditorRef}
                        image={picture.img}
                        width={160}
                        height={160}
                        border={20}
                        color={[60, 60, 60, 0.6]} // RGBA: color of the border
                        rotate={picture.rotation}
                        scale={picture.zoom}
                    />

                    <div className="img_btns">
                        <input 
                            id="upload_img"
                            type="file" 
                            ref={img_input_ref}
                            onChange={(e) => handleFileChange(e.target.files[0])}
                            hidden={true}
                        />

                        {
                            picture.img === null
                            &&
                            <Button 
                                handle_btn_click={() => {
                                    setPicture({
                                        ...picture,
                                        img: null
                                    })
                                    handleSave()
                                }}
                                type="remove_img"
                                span_text="Remove Image"
                                img_name="remove_img"
                            />
                        }

                        <Button 
                            handle_btn_click={() => img_input_ref.current.click()}
                            type="add_img"
                            span_text={picture.img === null ? "Upload Image" : "Replace Image"}
                            img_name="add_img"
                        />

                        <Button 
                            handle_btn_click={handleCancel}
                            type="cancel"
                            span_text="Cancel"
                            img_name="cancel"
                        />

                        <Button 
                            handle_btn_click={handleSave}
                            type="save"
                            span_text="Save"
                            img_name="confirm"
                        />

                    </div>
                    
                    <div className="sliders">
                        <label 
                            htmlFor="zoom"
                            className='zoom_label'
                        >
                            Zoom
                        </label>
                        <input 
                            className='zoom_slider'
                            id='zoom'
                            type="range"
                            defaultValue={2}
                            min={1}
                            max={10}
                            step={0.1}
                            onChange={(e) => handle_zoom(e.target.value)} 
                        />

                        <label 
                            className='rotate_label'
                            htmlFor="rotate"
                        >
                            Rotate
                        </label>
                        <input 
                            className='rotate_slider'
                            id='rotate'
                            type="range"
                            defaultValue={0}
                            min={0}
                            max={360}
                            step={1}
                            onChange={(e) => handle_rotation(e.target.value)} 
                        />
                    </div>

                </div>
                :
                <div
                    className='closed_edit_mode'
                >
                    
                    {
                        loading_img
                        ?
                        <div className="loading_div">
                            <Loading/>
                        </div>
                        :
                        <ProfilePicture
                            profile_picture_url={profile_picture_url}
                        />

                    }
                    <button 
                        className="edit_profile_picture"
                        onClick={() => set_editing_img(true)}
                    >
                        Change Profile Picture
                    </button>
                </div>
            }
        </div>
    )
}

export default EditProfilePic