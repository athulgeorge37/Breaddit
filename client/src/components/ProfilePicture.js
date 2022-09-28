import CloudinaryImage from './CloudinaryImage';

import './ProfilePicture.scss';

function ProfilePicture({ profile_picture_url }) {

	return (
		<div className="profile_picture_div">
			{
				profile_picture_url === null
				?
				<div className="default_profile_pic">
					<img 
						src="./images/default_user.png" 
						alt="profile_picture" 
						className="default_profile_pic_img"
					/>
				</div>
				:
				<CloudinaryImage image_url={profile_picture_url}/>

			}
		</div>
	)
}

export default ProfilePicture