import React from 'react';
import './PopUpMenu.scss';

function PopUpMenu(props) {
  return (
    <div className="PopUpMenu">
        <h2 className="pop_up_title">{props.title}</h2>
        <div className="pop_up_info">
            {props.children}
        </div>
        <div className="pop_up_btns">

            <button 
                className="btn_1"
                onClick={() => props.btn_1_handler()}
            >
                {props.btn_1_txt}
            </button>

            <button 
                className="btn_2"
                onClick={() => props.btn_2_handler()}
            >
                {props.btn_2_txt}
            </button>

        </div>
    </div>
  )
}

export default PopUpMenu