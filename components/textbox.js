import Icon from '@hackclub/icons'

const TextBox = props => {
  return (
    <>
      <div className="position-wrapper">
        <div className="input-container">
          <Icon glyph="search" size={25} />
          <input
            onChange={event => {
              props.textSetter(event.target.value)
            }}
            type="text"
            placeholder={props.placeholder}
          />
        </div>
      </div>
      <style jsx>
        {`
          .input-container {
            padding-left: 0.8rem;
            padding-right: 0.8rem;

            background-color: white;
            border: 1px solid #ddd;

            display: flex;
            justify-items: center;
            align-items: center;

            width: 500px;

            border-radius: 25px;
          }

          .position-wrapper {
            display: grid;
            place-items: center;
            width: 100%;
          }

          input {
            border: none;
            width: 100%;
            margin-left: 0.5rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
          }

          input:focus {
            outline: none;
          }
        `}
      </style>
    </>
  )
}

export default TextBox
