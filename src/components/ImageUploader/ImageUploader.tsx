import React, { useState } from 'react';
import { Upload, Button, message } from 'antd';
import { UploadOutlined } from '@ant-design/icons';

interface ImageUploaderProps {
  setPixelData: (x: Uint8ClampedArray, width: number, height: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setPixelData }) => {
  const [, setImageSrc] = useState<string | null>(null);

  const handleImageUpload = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.src = reader.result as string;
      img.onload = () => {
        setImageSrc(img.src);
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          setPixelData(imageData.data, img.width, img.height);
          message.success('Image uploaded successfully!');
        }
      };
    };
    reader.readAsDataURL(file);
    return false;
  };

  return (
    <div>
      <Upload
        accept="image/*"
        beforeUpload={handleImageUpload}
        showUploadList={false}
      >
        <Button icon={<UploadOutlined />}>Click to Upload Image</Button>
      </Upload>
    </div>
  );
};

export default ImageUploader;
