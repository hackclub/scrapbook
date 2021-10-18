import Icon from '@hackclub/icons'

const SearchBar = props => {
  return (
    <>
      <div className="position-wrapper">
        <div className="input-container">
          <Icon glyph="search" size={25} />
          <input
            onChange={props.onChange}
            type="text"
            placeholder={props.placeholder}
          />
        </div>
      </div>
      <style jsx>
        {`
          @media (prefers-color-scheme: dark) {
            input {
              background-color: var(--colors-darkless);
              color: white;
            }

            .input-container {
              background-color: var(--colors-darkless);
              border: 1px solid grey;
            }
          }

          @media (prefers-color-scheme: light) {
            input {
              background-color: white;
            }

            .input-container {
              background-color: white;
              border: 1px solid #ddd;
            }
          }

          .input-container {
            padding-left: 0.8rem;
            padding-right: 0.8rem;

            display: flex;
            justify-items: center;
            align-items: center;

            width: 400px;

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
            ${props.centerText ? 'text-align:center' : ''};
          }

          input:focus {
            outline: none;
          }
        `}
      </style>
    </>
  )
}

export default SearchBar
