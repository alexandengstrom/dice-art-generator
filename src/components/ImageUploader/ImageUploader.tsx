import React, { useState } from 'react';

interface ImageUploaderProps {
    setPixelData: (x: Uint8ClampedArray, width: number, height: number) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ setPixelData }) => {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
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
          }
        };
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <input type="file" accept="image/*" onChange={handleImageUpload} />
      {imageSrc && <img src={imageSrc} alt="Uploaded" />}
    </div>
  );
};

export default ImageUploader;
