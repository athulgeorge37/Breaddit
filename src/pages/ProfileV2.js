
import './ProfileV2.scss';
import EditProfile from '../components/EditProfile';

import { useState } from 'react';
import ReadProfile from '../components/ReadProfile';

function ProfileV2() {

    const [toggle_edit_page, set_toggle_edit_page] = useState(false);
   

    return (
        <div className='Profile_Page_V2'>
            {
                toggle_edit_page
                ?
                <EditProfile set_toggle_edit_page={set_toggle_edit_page}/>
                :
                <ReadProfile set_toggle_edit_page={set_toggle_edit_page}/>
            }
        </div>
    )
}

export default ProfileV2