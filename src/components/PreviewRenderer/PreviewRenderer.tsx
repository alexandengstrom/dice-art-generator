import React, { useState, useEffect } from 'react';

interface PreviewRendererProps {
  darknessValues: number[][];
  width: number;
  theme: string;
}

const getDiceImageSrc = (value: number, theme: string) => {
  if (theme === 'dark') {
    value = 7 - value;
  }

  return `/dice-art-generator/dice${value < 1 ? 1 : value > 6 ? 6 : value}${theme}.png`;
};

const PreviewRenderer: React.FC<PreviewRendererProps> = ({ darknessValues, width, theme }) => {
  const [containerWidth, setContainerWidth] = useState<number>(1200);

  useEffect(() => {
    const handleResize = () => {
      const newWidth = window.innerWidth < 800 ? window.innerWidth : 800;
      setContainerWidth(newWidth);
    };

    handleResize();

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <div className="image-frame">
      <div className="image-container" style={{ width: `${containerWidth}px` }}>
        {darknessValues.map((row, i) => (
          <div key={i} className="dice-row">
            {row.map((value, j) => {
              const diceSize = containerWidth / width;
              return (
                <div key={j} className="dice" style={{ width: `${diceSize}px`, height: `${diceSize}px` }}>
                  <img
                    src={getDiceImageSrc(value, theme)}
                    alt={`dice-${value}`}
                    style={{ width: '100%', height: '100%' }}
                  />
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <p className="painting-signing">{`The Computer, ${(new Date()).getFullYear()}`}</p>
    </div>
  );
};

export default PreviewRenderer;
