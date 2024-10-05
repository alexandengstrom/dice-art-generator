import { useEffect, useState } from 'react';
import './App.css';
import ImageUploader from './components/ImageUploader/ImageUploader';
import PreviewRenderer from './components/PreviewRenderer/PreviewRenderer';
import { Switch, Select, InputNumber, Button } from 'antd';

function App() {
  const [pixelData, setPixelData] = useState<Uint8ClampedArray | null>(null);
  const [imageWidth, setImageWidth] = useState<number>(0);
  const [imageHeight, setImageHeight] = useState<number>(0);
  const [darknessValues, setDarknessValues] = useState<number[][] | null>(null);
  const [width, setWidth] = useState(65);
  const [realWidth, setRealWidth] = useState(0);
  const [realHeight, setRealHeight] = useState(0);
  const [diceDiameter, setDiceDiameter] = useState<number>(16);
  const [theme, setTheme] = useState<string>('dark');
  const [diceCost, setDiceCost] = useState<number>(0.04);
  const [isMouseDown, setIsMouseDown] = useState(false);

  useEffect(() => {
    if (pixelData && imageWidth && imageHeight) {
      const newDarknessValues = calculateDarknessValues(pixelData, imageWidth, imageHeight, width);
      setDarknessValues(newDarknessValues);
      setRealWidth(diceDiameter * newDarknessValues[0].length);
      setRealHeight(diceDiameter * newDarknessValues.length);
    }
  }, [pixelData, imageWidth, imageHeight, width, diceDiameter]);

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

    const brightnessSum = new Float32Array(imgWidth * imgHeight);

    for (let y = 0; y < imgHeight; y++) {
      let rowSum = 0;
      for (let x = 0; x < imgWidth; x++) {
        const index = (y * imgWidth + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = (r + g + b) / 3;

        rowSum += brightness;
        const previousSum = y > 0 ? brightnessSum[(y - 1) * imgWidth + x] : 0;
        brightnessSum[y * imgWidth + x] = rowSum + previousSum;
      }
    }

    const getBrightnessSum = (x1: number, y1: number, x2: number, y2: number) => {
      const bottomRight = brightnessSum[y2 * imgWidth + x2];
      const topRight = y1 > 0 ? brightnessSum[(y1 - 1) * imgWidth + x2] : 0;
      const bottomLeft = x1 > 0 ? brightnessSum[y2 * imgWidth + (x1 - 1)] : 0;
      const topLeft = (x1 > 0 && y1 > 0) ? brightnessSum[(y1 - 1) * imgWidth + (x1 - 1)] : 0;
      return bottomRight - topRight - bottomLeft + topLeft;
    };

    for (let y = 0; y < targetHeight; y++) {
      const row: number[] = [];
      for (let x = 0; x < targetWidth; x++) {
        const startX = Math.floor(x * scaleFactorX);
        const startY = Math.floor(y * scaleFactorY);

        const endX = Math.min(Math.floor((x + 1) * scaleFactorX) - 1, imgWidth - 1);
        const endY = Math.min(Math.floor((y + 1) * scaleFactorY) - 1, imgHeight - 1);

        const pixelCount = (endX - startX + 1) * (endY - startY + 1);

        const sumBrightness = getBrightnessSum(startX, startY, endX, endY);
        const avgBrightness = sumBrightness / pixelCount;

        const darknessValue = Math.ceil(((255 - avgBrightness) / 255) * 6);
        const finalValue = darknessValue < 1 ? 1 : darknessValue > 6 ? 6 : darknessValue;
        row.push(isNaN(avgBrightness) ? 1 : finalValue);
      }
      brightnessValues.push(row);
    }

    return brightnessValues;
  };

  const exportToCSV = () => {
    if (!darknessValues) {
      return;
    }
  
    let csvContent = 'data:text/csv;charset=utf-8,';
  
  
    darknessValues.forEach((row) => {
      const rowString = row
        .map((value) => (theme === 'light' ? value : 7 - value))
        .join(',');
      csvContent += rowString + '\r\n';
    });
  
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'dice_schema.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  

  useEffect(() => {
    const handleMouseDown = () => {
      setIsMouseDown(true);
    };

    const handleMouseUp = () => {
      if (isMouseDown) {
        setIsMouseDown(false);
      }
    };

    window.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isMouseDown]);

  const handleSetPixelData = (data: Uint8ClampedArray, width: number, height: number) => {
    setPixelData(data);
    setImageWidth(width);
    setImageHeight(height);
  };

  const handleSizeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setWidth(parseInt(event.target.value));
  };

  const toggleTheme = (checked: boolean) => {
    setTheme(checked ? 'light' : 'dark');
  };

  return (
    <div className={`app-container`}>
      <div className='side-divider'>
        <div>
        <div className="control-panel">
          <h1>Dice Art Generator</h1>
          <ImageUploader setPixelData={handleSetPixelData} />
          <div className="controls">
            <div className="control-item">
              <p>Invert:</p>
              <Switch onChange={toggleTheme} />
            </div>
            <div className="control-item">
              <p>Dice Size:</p>
              <Select onChange={setDiceDiameter} defaultValue={16} className='select'>
                <Select.Option value={5}>5mm</Select.Option>
                <Select.Option value={8}>8mm</Select.Option>
                <Select.Option value={12}>12mm</Select.Option>
                <Select.Option value={16}>16mm</Select.Option>
                <Select.Option value={19}>19mm</Select.Option>
              </Select>
            </div>
            <div className="control-item">
              <p>Artwork Size (Width):</p>
              <input type='range' max={100} min={30} step={1} value={width} onChange={handleSizeChange} />
            </div>
            <div className="control-item">
              <p>Dice Cost:</p>
              <InputNumber className='select' min={0} max={2} step={0.01} value={diceCost} prefix={"$"} onChange={(value) => setDiceCost(value!)} />
            </div>
          </div>
          </div>
          {darknessValues && (
            <div className="control-panel">
              <div className="info-section">
                <p>Dices needed: {darknessValues.length * darknessValues[0].length}</p>
                <p>The artwork will be {realWidth / 10}cm wide and {realHeight / 10}cm tall with dice diameter {diceDiameter} millimeter.</p>
                <p>Estimated cost for the artwork is ${Math.round(darknessValues.length * darknessValues[0].length * diceCost)}.</p>
                <Button type="primary" onClick={exportToCSV}>Export Dice Schema as CSV</Button>
              </div>
            </div>
          )}
        </div>
        <div>
          {darknessValues && <PreviewRenderer darknessValues={darknessValues} width={width} theme={theme} />}
        </div>
      </div>
    </div>
  );
}

export default App;