import React from 'react';

const Sidebar = ({ auth, allUsers, onlineUsers, selectedUser, setSelectedUser }) => {
  return (
    <aside className="w-[300px] bg-white flex flex-col">
      <div className="flex items-center p-4">
        <img src={auth.avatar || 'https://via.placeholder.com/40'} className="w-10 h-10 rounded-full" />
        <div className="ml-3">
          <p className="font-semibold text-sm">{auth.username}</p>
          <p className="text-xs text-gray-500">Senior Developer</p>
        </div>
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Search here..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {allUsers.map((user) => {
          const isOnline = onlineUsers.some((u) => u._id === user.userId);
          return (
            <div
              key={user.userId}
              onClick={() => setSelectedUser({ _id: user.userId, username: user.username, avatar: user.avatar })}
              className={`flex items-center px-4 py-3 cursor-pointer hover:bg-gray-100 ${
                selectedUser?._id === user.userId ? 'bg-blue-100' : ''
              }`}
            >
              <img
                src={user.avatar || 'https://via.placeholder.com/32'}
                className="w-8 h-8 rounded-full mr-3"
                alt="avatar"
              />
              <div className="flex-1">
                <p className="font-medium text-sm">{user.username}</p>
                <p className="text-xs text-gray-500">{isOnline ? 'Online' : 'Offline'}</p>
              </div>
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
