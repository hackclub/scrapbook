export const Close = ({ onClick, background = false }) => (
  <>
    {background && <div className="background" onClick={onClick} />}
    <div className="close" onClick={onClick}>
      ×
    </div>
    <style>{`
    .close {
      position: absolute;
      right: 16px;
      top: -12px;
      font-size: 4rem;
      font-weight: 600;
      color: rgb(220,220,220);
      cursor: pointer;
    }
    .close:hover {
      color: var(--colors-icon);
    }
    .background {
      position: absolute;
      left: 0;
      top: 0;
      height: 100vh;
      width: 100vw;
      cursor: pointer;
    }
    `}</style>
  </>
)
