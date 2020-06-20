const Banner = ({
  children,
  isVisible = true
}) =>
  isVisible ? (
    <aside className="container banner">
      
      <p className="post-text">You seem to have reached the end, why not <a href="https://hackclub.com/slack/">share your own making journey?</a></p>
      
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
        .banner-avatar {
          border-radius: 6px;
        }
        .post-header-name {
          font-size: 18px;
        }
        .post-text {
          line-height: 1.375;
          
        }
        .post-text :global(a) {
          color: inherit;
          font-weight: bold;
        }
      `}</style>
    </aside>
  ) : null

export default Banner
