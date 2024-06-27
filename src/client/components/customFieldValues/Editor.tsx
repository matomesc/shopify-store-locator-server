/* eslint-disable react/require-default-props */
import { Labelled } from '@shopify/polaris';
import { Editor as TinymceEditor } from '@tinymce/tinymce-react';
import React from 'react';
import { InputError } from '../InputError';

export interface EditorProps {
  label?: string;
  value: string;
  height?: number;
  error?: string;
  onChange: (value: string) => void;
}

export const Editor: React.FC<EditorProps> = ({
  label,
  value,
  height,
  error,
  onChange,
}) => {
  const editor = (
    <TinymceEditor
      init={{
        inline: true,
        promotion: false,
        menubar: false,
        indentation: '5px',
        plugins: 'link',
        toolbar: 'bold italic link',
      }}
      tinymceScriptSrc="/tinymce/tinymce.min.js"
      value={value}
      onEditorChange={(v) => {
        onChange(v);
      }}
      licenseKey="gpl"
    />
  );
  return (
    <div>
      <style jsx>{`
        // These styles were taken from a Polaris TextField's
        // .Polaris-TextField__Backdrop element

        div :global(.mce-content-body) {
          padding: 6px 12px;
          background-color: ${error
            ? 'rgb(254, 233, 232)'
            : 'rgb(253, 253, 253)'};
          border: 0.667px solid
            ${error ? 'rgb(142, 31, 11)' : 'rgb(138, 138, 138)'};
          border-radius: 8px;
          height: ${height ? `${height}px` : '80px'};
          overflow: auto;
        }

        div :global(.mce-content-body:focus) {
          outline: 2px solid rgb(0, 91, 211);
        }
      `}</style>
      {label ? (
        <div>
          <Labelled id="" label={label}>
            {editor}
          </Labelled>
          {error && <InputError message={error} style={{ marginTop: '4px' }} />}
        </div>
      ) : (
        <div>
          {editor}
          {error && <InputError message={error} style={{ marginTop: '4px' }} />}
        </div>
      )}
    </div>
  );
};
