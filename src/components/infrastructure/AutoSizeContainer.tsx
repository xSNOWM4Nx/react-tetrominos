import React, { useState, useRef, useLayoutEffect } from 'react';
import { Box } from '@mui/material';

interface ILocalProps {
  children?: React.ReactNode;
  isScrollLocked?: boolean;
  showContentOnResize?: boolean;
  onSizeChanged?: (height: number, width: number) => void;
  onRenderSizedChild?: (height: number, width: number) => React.ReactNode;
}
type Props = ILocalProps;

export const AutoSizeContainer: React.FC<Props> = (props) => {
  const [height, setHeight] = useState<number>(0);
  const [width, setWidth] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const handleResize = () => {
      setTimeout(() => {
        if (containerRef.current) {
          const newHeight = containerRef.current.offsetHeight;
          const newWidth = containerRef.current.offsetWidth;
          if (newHeight !== height || newWidth !== width) {
            setHeight(newHeight);
            setWidth(newWidth);
            if (props.onSizeChanged) {
              props.onSizeChanged(newHeight, newWidth);
            }
          }
        }
      }, 100); // 100ms Verzögerung
    };

    const resizeObserver = new ResizeObserver(handleResize);
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current);
    }

    return () => {
      if (containerRef.current) {
        resizeObserver.unobserve(containerRef.current);
      }
    };
  }, [height, width, props]);

  const renderContent = () => {
    if (!props.onRenderSizedChild) {
      return props.children;
    }

    if (props.showContentOnResize) {
      return props.onRenderSizedChild(height, width);
    } else {
      return props.onRenderSizedChild(height, width);
    }
  };

  const isScrollLocked = props.isScrollLocked !== undefined ? props.isScrollLocked : false;

  return (
    <Box
      ref={containerRef}
      sx={{
        height: '100%',
        width: '100%',
        overflowX: isScrollLocked ? undefined : 'hidden',
        overflowY: isScrollLocked ? undefined : 'auto',
        scrollbarWidth: isScrollLocked ? undefined : 'thin',
      }}
    >
      {renderContent()}
    </Box>
  );
};

export default AutoSizeContainer;