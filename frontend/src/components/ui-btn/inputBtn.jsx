
function Input({ type = 'text', placeholder, value, onChange, className = '', ...props }) {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-2 mb-4 border rounded ${className}`}
      {...props}
    />
  );
}

export default Input;