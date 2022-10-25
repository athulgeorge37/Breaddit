import { CLOUD_NAME } from "../rest_api_requests/ImageRequests";
import { Image } from "cloudinary-react";

function CloudinaryImage({ image_url, alt }) {
    return (
        <Image
            cloudName={CLOUD_NAME}
            publicId={image_url}
            loading="lazy"
            alt={alt}
        />
    );
}

export default CloudinaryImage;
