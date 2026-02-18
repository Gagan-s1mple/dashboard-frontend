/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useRef } from 'react';
import { GridStack } from 'gridstack';
import 'gridstack/dist/gridstack.min.css';

interface GridStackWrapperProps {
  children: React.ReactNode[];
  columnCount?: number;
  rowHeight?: number;
  margin?: number;
}

export const GridStackWrapper: React.FC<GridStackWrapperProps> = ({
  children,
  columnCount = 12,
  rowHeight = 100,
  margin = 10,
}) => {
  const gridRef = useRef<HTMLDivElement>(null);
  const gridInstanceRef = useRef<GridStack | null>(null);

  useEffect(() => {
    if (!gridRef.current) return;

    // Small delay to ensure DOM is ready
    const initGrid = () => {
      try {
        // Initialize GridStack
        const grid = GridStack.init({
          column: columnCount,
          cellHeight: rowHeight,
          margin: margin,
          float: true,
          draggable: {
            handle: '.drag-handle',
            scroll: true,
          },
          resizable: {
            handles: 'e, w, se, sw, ne, nw',
          },
          animate: true,
          disableResize: true,
        }, gridRef.current);

        gridInstanceRef.current = grid;

        // Clear any existing widgets
        grid.removeAll();

        // Add children as widgets
        React.Children.forEach(children, (child, index) => {
          if (React.isValidElement(child)) {
            const childProps = child.props as { id?: string; 'data-type'?: string; children?: React.ReactNode };
            const widgetId = childProps.id || `widget-${index}`;
            const type = childProps['data-type'] || 'kpi';
            
            // Set dimensions based on card type
            let w = 3, h = 3;
            if (type === 'kpi') {
              w = 3; h = 3;
            } else if (type === 'chart') {
              w = 6; h = 4;
            } else if (type === 'table') {
              w = 12; h = 5;
            }

            // Calculate position
            const x = (index * 3) % 12;
            const y = Math.floor((index * 3) / 12) * 3;

            // Create widget element
            const widgetElement = document.createElement('div');
            widgetElement.className = 'grid-stack-item';
            widgetElement.setAttribute('gs-id', widgetId);
            widgetElement.setAttribute('gs-x', x.toString());
            widgetElement.setAttribute('gs-y', y.toString());
            widgetElement.setAttribute('gs-w', w.toString());
            widgetElement.setAttribute('gs-h', h.toString());
            
            const contentDiv = document.createElement('div');
            contentDiv.className = 'grid-stack-item-content';
            contentDiv.style.background = 'white';
            contentDiv.style.borderRadius = '0.5rem';
            contentDiv.style.overflow = 'hidden';
            contentDiv.style.boxShadow = '0 1px 3px rgba(0,0,0,0.1)';
            
            // Get the HTML content from the child
            if (typeof child.props.children === 'string') {
              contentDiv.innerHTML = child.props.children;
            } else {
              // For React elements, we need to append them differently
              // This is a simplified approach - for complex React children,
              // you might need a different strategy
              const tempDiv = document.createElement('div');
              // @ts-ignore - this is a simplified approach
              contentDiv.appendChild(tempDiv);
            }
            
            widgetElement.appendChild(contentDiv);
            
            gridRef.current?.appendChild(widgetElement);
            grid.addWidget(widgetElement);
          }
        });
      } catch (error) {
        console.error('Error initializing GridStack:', error);
      }
    };

    // Small delay to ensure DOM is ready
    const timer = setTimeout(initGrid, 100);

    return () => {
      clearTimeout(timer);
      if (gridInstanceRef.current) {
        try {
          gridInstanceRef.current.destroy();
        } catch (error) {
          console.error('Error destroying GridStack:', error);
        }
      }
    };
  }, [children, columnCount, rowHeight, margin]);

  return <div className="grid-stack w-full min-h-[600px]" ref={gridRef}></div>;
};