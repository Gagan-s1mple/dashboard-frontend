
import React from 'react';

interface ChatHistoryProps {
  onSessionSelect: () => void;
}

export const ChatHistory: React.FC<ChatHistoryProps> = ({ onSessionSelect }) => {
  return (
    <div onClick={onSessionSelect}>
      <p>Chat History Placeholder</p>
    </div>
  );
};
