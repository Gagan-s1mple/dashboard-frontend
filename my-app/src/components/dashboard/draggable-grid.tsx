/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import GridLayout from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

interface DraggableGridProps {
  children: React.ReactNode[];
  onLayoutChange?: (layout: GridLayout.Layout[]) => void;
  isDraggable?: boolean;
  isResizable?: boolean;
}

export const DraggableGrid: React.FC<DraggableGridProps> = ({
  children,
  onLayoutChange,
  isDraggable = true,
  isResizable = false,
}) => {
  // Filter out null/undefined children and generate layout
  const validChildren = React.Children.toArray(children).filter(
    (child) => React.isValidElement(child) && child.key !== null
  );

  // Generate layout for each child based on its type
  const layout = validChildren.map((child, index) => {
    if (!React.isValidElement(child)) return null;
    
    const type = child.props['data-type'] || 'kpi';
    const key = child.key?.toString() || `item-${index}`;
    
    // Set dimensions based on card type
    let w = 3, h = 3;
    if (type === 'kpi') {
      w = 3; h = 1; 
    } else if (type === 'chart') {
      w = 5; h = 3; // Chart cards (6x4 grid cells)
    } else if (type === 'table') {
      w = 11.5; h = 2; // Table cards (full width)
    }

    // Calculate position in a grid pattern
    const x = (index * 3) % 12;
    const y = Math.floor((index * 3) / 12) * 3;

    return {
      i: key,
      x,
      y,
      w,
      h,
      minW: w,
      minH: h,
      maxW: w,
      maxH: h,
    };
  }).filter(Boolean) as GridLayout.Layout[];

  return (
    <GridLayout
      className="layout"
      layout={layout}
      cols={12}
      rowHeight={100}
      width={1190}
      margin={[16, 16]}
      containerPadding={[16, 16]}
      isDraggable={isDraggable}
      isResizable={isResizable}
      draggableHandle=".drag-handle"
      onLayoutChange={onLayoutChange}
      compactType={null} // Prevents automatic compaction
      preventCollision={false}
      useCSSTransforms={true}
    >
      {validChildren.map((child) => {
        if (!React.isValidElement(child)) return null;
        return (
          <div key={child.key} className="h-full w-full">
            {child}
          </div>
        );
      })}
    </GridLayout>
  );
};