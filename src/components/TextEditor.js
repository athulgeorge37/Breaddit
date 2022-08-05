import React from 'react';
import './TextEditor.scss';

// CK Editor got from
// https://ckeditor.com/docs/ckeditor5/latest/installation/getting-started/frameworks/react.html

// default editor
// import { CKEditor } from '@ckeditor/ckeditor5-react';
// import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

// custom editor
import Editor from 'ckeditor5-custom-build/build/ckeditor';
import { CKEditor } from '@ckeditor/ckeditor5-react';

function TextEditor(props) {
  return (
    <div className="text_editor">
            <CKEditor
                editor={Editor}
                data="text"
                onChange={(e, editor) => {
                    const data = editor.getData();
                    props.update_text(data)
                }}
            />
        </div>
  )
}

export default TextEditor