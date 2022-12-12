import { Image } from "cloudinary-react";

function CloudinaryImage({ image_url, alt }) {
    return (
        <Image
            cloudName={process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}
            publicId={image_url}
            loading="lazy"
            alt={alt}
        />
    );
}

export default CloudinaryImage;
