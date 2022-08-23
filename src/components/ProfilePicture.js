import React from 'react';
import './ProfilePicture.scss';


function ProfilePicture() {
  return (
    <div className="default_profile_pic_div">
        <img 
            src="./images/default_user.png" 
            alt="profile_picture" 
            className="default_profile_pic"
        />
    </div>
  )
}

export default ProfilePicture