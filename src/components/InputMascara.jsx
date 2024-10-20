import InputMask from "react-input-mask";

function Input({ type, placeholder, value, onChange, className, mask }) {
  return (
    <InputMask
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={className}
      mask={mask}
    />
  );
}

export default Input;
