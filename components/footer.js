const Footer = () => (
  <aside className="container banner">
    <p className="post-text">
      You seem to have reached the end, why not <a href="https://hackclub.com/slack/">share your own making journey?</a>
    </p>
    <style jsx>{`
      .banner {
        padding: 12px 12px 12px;
        border-radius: 12px;
        max-width: 720px;
        background-color: var(--colors-blue);
        color: var(--colors-white);
        margin: 12px auto;
        text-align: center;
      }
      .post-text {
        line-height: 1.375;
      }
      .post-text a {
        color: inherit;
        font-weight: bold;
      }
    `}</style>
  </aside>
)

export default Footer
