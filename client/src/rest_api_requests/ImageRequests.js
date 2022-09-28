import axios from 'axios';

const UPLOAD_PRESET = "yqbnco9l"
const CLOUD_NAME = "dhnxodaho";

const upload_image = async (new_img) => {

    const formData = new FormData()
    formData.append("file", new_img)
    formData.append("upload_preset", UPLOAD_PRESET)

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, formData
    )

    // returning the image url
    return response.data.secure_url
}



export {
    upload_image,
    CLOUD_NAME
}