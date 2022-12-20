import axios from "axios";

const upload_image = async (new_img) => {
    const formData = new FormData();
    formData.append("file", new_img);
    formData.append(
        "upload_preset",
        process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );

    const response = await axios.post(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        formData
    );

    // returning the image url
    return response.data.secure_url;
};

export { upload_image };
