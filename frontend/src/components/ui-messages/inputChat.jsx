import React from 'react';

const ChatInput = ({ content, setContent, handleSendMessage, handleFileChange }) => {
  return (
    <form onSubmit={handleSendMessage} className="bg-white px-4 py-3 flex items-center space-x-2">
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Write something..."
        className="flex-1 px-4 py-2 rounded-full border border-gray-300 focus:outline-none"
      />
      <label htmlFor="fileInput" className="cursor-pointer text-blue-500 text-xl">📎</label>
      <input
        id="fileInput"
        type="file"
        accept="image/*,video/mp4,application/pdf"
        onChange={handleFileChange}
        className="hidden"
      />
      <button type="submit" className="transition p-2 hover:opacity-80">
        <img src="../../public/icon/send-message.png" alt="send" className="w-6 h-6" />
      </button>
    </form>
  );
};

export default ChatInput;
