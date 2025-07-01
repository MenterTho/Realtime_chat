function Message({ content, isSender }) {
  return (
    <div
      className={`mb-4 flex ${isSender ? 'justify-end' : 'justify-start'}`}
    >
      <div
        className={`max-w-xs p-3 rounded-lg ${
          isSender ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'
        }`}
      >
        {content}
      </div>
    </div>
  );
}

export default Message;