import React, { useState } from 'react';

interface ChatBarProps {
  collapsed: boolean;
  projectId: string;
  onSearch: (query: string) => Promise<void>;
}

const ChatBar: React.FC<ChatBarProps> = ({ collapsed, projectId, onSearch }) => {
  const [inputValue, setInputValue] = useState('');

  const handleSearchClick = async () => {
    if (inputValue.trim()) {
      await onSearch(inputValue);  // Pass the search query to the onSearch function
      setInputValue(''); // Clear the input after search
    }
  };

  const handleKeyPress = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      await handleSearchClick();
    }
  };

  return (
    <div
      className="fixed bottom-0 bg-white transition-all duration-300 z-50"
      style={{
        left: collapsed ? '80px' : '240px', // Set the left position to align with the sidebar width
        right: '0px', // Set the right position to 0 to extend fully to the right
        paddingBottom: '16px',
      }}
    >
      <div
        className="flex items-center space-x-4 mb-8 max-w-full mx-auto rounded-full"
        style={{
          padding: '8px 16px',
          backgroundColor: 'white',
          width: '70%',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        }}
      >
        <input
          type="text"
          placeholder="Type your search..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyPress={handleKeyPress}
          className="flex-grow rounded-full border border-transparent focus:outline-none focus:ring-0"
          style={{ paddingLeft: '16px' }}
        />
        <button
          onClick={handleSearchClick}
          className={`py-2 px-4 rounded-full transition ${
            inputValue.trim() ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-400'
          }`}
          style={{
            padding: '0 12px',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          disabled={!inputValue.trim()}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 10a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default ChatBar;
