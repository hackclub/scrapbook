const Scrappy = ({ children, isVisible = true }) =>
  isVisible ? (
    <aside className="container banner">
      <img className="banner-avatar" src="https://dl.airtable.com/.attachmentThumbnails/169b73adf87cc2d0695b220e137611ba/e6f06147" width={48} />
      <div>
        <strong className="post-header-name">@scrappy</strong>
        <p className="post-text">{children}</p>
      </div>
      <style jsx>{`
        .banner {
          display: grid;
          grid-gap: 16px;
          grid-template-columns: 48px 1fr;
          padding: 12px;
          border-radius: 9px;
          max-width: 640px;
          background-color: var(--colors-elevated);
          margin: 0 auto 24px;
        }
        .banner-avatar {
          border-radius: 6px;
        }
      `}</style>
    </aside>
  ) : null

export default Scrappy
