import React from 'react';

const Sidebar = ({ auth, allUsers, onlineUsers, selectedUser, setSelectedUser }) => {
  return (
    <aside className="w-[300px] bg-white flex flex-col">
      <div className="flex items-center p-4">
        {auth.username ? (
          <>
            <img
              src={auth.avatar || 'https://via.placeholder.com/40'}
              className="w-10 h-10 rounded-full"
              alt="avatar"
            />
            <div className="ml-3">
              <p className="font-semibold text-sm">{auth.username}</p>
              <p className="text-xs text-gray-500">
                {auth.isOnline === true ? 'Online' : 'Offline'}
              </p>
            </div>
          </>
        ) : (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 animate-pulse"></div>
            <div>
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-gray-200 rounded mt-2 animate-pulse"></div>
            </div>
          </div>
        )}
      </div>

      <div className="p-4">
        <input
          type="text"
          placeholder="Search here..."
          className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:outline-none"
        />
      </div>

      <div className="flex-1 overflow-y-auto">
        {allUsers.length === 0 ? (
          <div className="text-gray-500 text-center p-4">Không có người dùng</div>
        ) : (
          allUsers.map((user) => {
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
          })
        )}
      </div>
    </aside>
  );
};

export default Sidebar;