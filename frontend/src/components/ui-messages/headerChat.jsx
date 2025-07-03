import React from 'react';

const ChatHeader = ({ selectedUser, onlineUsers }) => {
  const isOnline = onlineUsers.some((u) => u._id === selectedUser._id);
  return (
    <div className="flex items-center bg-white p-4">
      <img
        src={selectedUser.avatar || 'https://via.placeholder.com/40'}
        className="w-10 h-10 rounded-full mr-3"
      />
      <div>
        <p className="font-semibold text-sm">{selectedUser.username}</p>
        <p className={`text-xs ${isOnline ? 'text-green-500' : 'text-gray-400'}`}>
          ● {isOnline ? 'Online' : 'Offline'}
        </p>
      </div>
    </div>
  );
};

export default ChatHeader;
