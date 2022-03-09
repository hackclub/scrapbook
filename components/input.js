export default function Input({label, onChange, value, placeholder, type, id }){
  if(type == "textarea"){
    return (
      <textarea
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={label}
        className="form-item"
      ></textarea>
    )
  }
  return (
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={label}
      className="form-item"
    />
  )
}