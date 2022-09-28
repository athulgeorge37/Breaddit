import { CLOUD_NAME } from "../rest_api_requests/ImageRequests";
import { Image } from 'cloudinary-react';

function CloudinaryImage({ image_url }) {
    return (
        <Image 
            cloudName={CLOUD_NAME}
            publicId={image_url}
        />
    )
}

export default CloudinaryImage