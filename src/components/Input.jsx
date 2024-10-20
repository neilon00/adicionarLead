function Input({ className, placeholder, value, onChange }) {
  return (
    <input
      placeholder={placeholder}
      className={className}
      value={value}
      onChange={onChange}
    />
  );
}

export default Input;
