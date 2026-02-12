
import React from 'react';

interface ColumnInfoProps {
  selectedFiles: string[];
}

const ColumnInfo: React.FC<ColumnInfoProps> = ({ selectedFiles }) => {
  return (
    <div>
      <p>Column Info Placeholder</p>
      {selectedFiles && selectedFiles.length > 0 && (
        <ul>
          {selectedFiles.map((file, index) => (
            <li key={index}>{file}</li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ColumnInfo;
