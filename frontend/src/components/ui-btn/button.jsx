function Button({ children, type = 'button', className = '', ...props }) {
  return (
    <button
      type={type}
      className={`bg-blue-500 text-white p-2 rounded hover:bg-blue-600 ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;