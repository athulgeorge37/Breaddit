import { Image } from 'cloudinary-react';

import './ProfilePicture.scss';

const CLOUD_NAME = "dhnxodaho";

function ProfilePicture({ profile_picture_url }) {

	return (
		<div className="profile_picture_div">
			{
				profile_picture_url === ""
				?
				<div className="default_profile_pic">
					<img 
						src="./images/default_user.png" 
						alt="profile_picture" 
						className="default_profile_pic_img"
					/>
				</div>
				:
				<Image 
					cloudName={CLOUD_NAME}
					publicId={profile_picture_url}
				/>

			}
		</div>
	)
}

export default ProfilePicture