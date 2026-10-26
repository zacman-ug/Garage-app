export default function Input({ label, id, className = '', ...props }) {
  return (
    <label className={`input-field ${className}`.trim()} htmlFor={id}>
      {label ? <span>{label}</span> : null}
      <input id={id} {...props} />
    </label>
  );
}
