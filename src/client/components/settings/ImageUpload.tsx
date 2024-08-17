import { Button, DropZone, Labelled, Thumbnail } from '@shopify/polaris';

function blobToDataURL(blob: Blob): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.onabort = () => reject(new Error('Read aborted'));
    reader.readAsDataURL(blob);
  });
}

export interface ImageUploadProps {
  value: string;
  label: string;
  error?: string;
  onChange: (value: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  label,
  error,
  onChange,
}) => {
  return (
    <Labelled id="ImageUploadLabel" label={label} error={error}>
      <div style={{ display: 'flex', gap: '10px' }}>
        <div style={{ width: '40px', height: '40px' }}>
          <DropZone
            id="ImageUpload"
            accept="image/gif,image/jpeg,image/png,image/svg+xml"
            allowMultiple={false}
            error={!!error}
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onDrop={async (_files, acceptedFiles) => {
              const [file] = acceptedFiles;

              if (!file) {
                return;
              }

              const dataUrl = await blobToDataURL(file);

              onChange(dataUrl);
            }}
          >
            <DropZone.FileUpload />
          </DropZone>
        </div>
        {value && (
          <div
            style={{
              display: 'flex',
              height: '100%',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Thumbnail size="small" alt="Marker image" source={value} />
            <Button
              onClick={() => {
                onChange('');
              }}
            >
              Remove
            </Button>
          </div>
        )}
      </div>
    </Labelled>
  );
};
