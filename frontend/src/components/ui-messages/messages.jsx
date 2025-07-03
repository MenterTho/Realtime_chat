import React from 'react';

const ChatBody = ({ messages, auth, messagesEndRef, formatTime }) => {
  const renderFile = (url, name, isOwnMessage) => {
    if (!url) return null;
    const ext = name.split('.').pop()?.toLowerCase();

    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) {
      return <img src={url} alt={name} className="max-w-xs rounded mt-2" />;
    }

    return (
      <div className={`mt-2 p-2 rounded ${isOwnMessage ? 'bg-white' : 'bg-gray-100'}`}>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="text-sm text-blue-600 hover:underline break-all"
        >
          📄 {name}
        </a>
      </div>
    );
  };

  return (
    <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
      {messages.map((msg) => {
        const isOwnMessage = msg.sender._id === auth.userId;
        return (
          <div
            key={msg._id}
            className={`mb-2 flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`px-3 py-2 rounded-[8px] ${
                isOwnMessage
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-white text-gray-800 rounded-bl-none'
              } max-w-[300px] break-words shadow`}
            >
              {msg.content && <p className="text-sm">{msg.content}</p>}
              {renderFile(msg.fileUrl, msg.fileName, isOwnMessage)}
              <p className="text-[10px] text-right mt-1 text-gray-300">{formatTime(msg.createdAt)}</p>
            </div>
          </div>
        );
      })}
      <div ref={messagesEndRef} />
    </div>
  );
};

export default ChatBody;
