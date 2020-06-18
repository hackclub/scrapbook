const Message = ({ text, color1 = 'yellow', color2 = 'green' }) => (
  <main className="container">
    <h1>{text}</h1>
    <style jsx>{`
      main {
        text-align: center;
        padding: 32px 16px;
      }
      h1 {
        color: var(--colors-${color2});
        font-family: var(--fonts-display);
        margin: 0;
        font-size: 56px;
        line-height: 1;
        padding-bottom: 12px;
      }
      @media (min-width: 32em) {
        h1 {
          font-size: 64px;
        }
      }
      @supports (-webkit-background-clip: text) {
        h1 {
          background-image: radial-gradient(
            ellipse farthest-corner at top left,
            var(--colors-${color1}),
            var(--colors-${color2})
          );
          background-repeat: no-repeat;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      }
    `}</style>
  </main>
)

export default Message
