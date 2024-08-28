import { useEffect, useState } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader/ImageUploader';

function App() {
  const [pixelData, setPixelData] = useState<Uint8ClampedArray | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [darknessValues, setDarknessValues] = useState<number[][] | null>(null);
  const [width, setWidth] = useState(200); 

  useEffect(() => {
    if (pixelData && imageWidth && imageHeight) {
      const newDarknessValues = calculateDarknessValues(pixelData, imageWidth, imageHeight, width);
      setDarknessValues(newDarknessValues);
    }
  }, [pixelData, imageWidth, imageHeight, width]);

  const calculateDarknessValues = (
    data: Uint8ClampedArray,
    imgWidth: number,
    imgHeight: number,
    targetWidth: number
  ) => {
    const aspectRatio = imgHeight / imgWidth;
    const targetHeight = Math.floor(targetWidth * aspectRatio);

    const brightnessValues: number[][] = [];

    const scaleFactorX = imgWidth / targetWidth;
    const scaleFactorY = imgHeight / targetHeight;

    for (let y = 0; y < targetHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < targetWidth; x++) {
        const startX = Math.floor(x * scaleFactorX);
        const startY = Math.floor(y * scaleFactorY);

        const endX = Math.min(Math.floor((x + 1) * scaleFactorX), imgWidth);
        const endY = Math.min(Math.floor((y + 1) * scaleFactorY), imgHeight);

        let sumBrightness = 0;
        let count = 0;

        for (let yy = startY; yy < endY; yy++) {
          for (let xx = startX; xx < endX; xx++) {
            const index = (yy * imgWidth + xx) * 4;
            const r = data[index];
            const g = data[index + 1];
            const b = data[index + 2];
            const brightness = (r + g + b) / 3;
            sumBrightness += brightness;
            count++;
          }
        }

        const avgBrightness = sumBrightness / count;

        if (isNaN(avgBrightness)) {
          row.push(1);
        } else {
          const darknessValue = Math.ceil(((255 - avgBrightness) / 255) * 6);
          row.push(darknessValue);
        }
      }
      brightnessValues.push(row);
    }

    console.log('Height', brightnessValues.length);
    console.log('Width', brightnessValues[0].length);

    return brightnessValues;
  };

  const handleSetPixelData = (data: Uint8ClampedArray, width: number, height: number) => {
    setPixelData(data);
    setImageWidth(width);
    setImageHeight(height);
  };

  const getDiceDots = (value: number) => {
    const dotsMap: { [key: number]: string } = {
      6: '   \n • \n   ',
      5: '  •\n   \n•  ',
      4: '  •\n • \n•  ',
      3: '• •\n   \n• •',
      2: '• •\n • \n• •',
      1: '• •\n• •\n• •'
    };
  
    return dotsMap[value] || '';
  };
  

  return (
    <>
      <ImageUploader setPixelData={handleSetPixelData} />
      {darknessValues && (
        <div className="image-container">
          {darknessValues.map((row, i) => (
            <div key={i} className="dice-row">
              {row.map((value, j) => {
                return (
                  <div key={j} className="dice">
                    <p>{getDiceDots(value)}</p>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </>
  );
}

export default App;
