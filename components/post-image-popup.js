import { Close } from '../components/close'

export const PostImage = ({ closed, setImageOpen }) => {

  return (
    <div
      className="overlay-wrapper"
      style={{ display: closed ? 'none' : 'flex' }}
    >
      <div
        className="overlay"
        style={{
          display: closed ? 'none' : 'flex',
          overflowY: 'scroll',
          flexDirection: 'column',
          gap: '16px'
        }}
      >
        <img
            key={img}
            alt={img}
            src={img}
            loading="lazy"
            title={img}
        />
      </div>
      <style jsx>
        {`
          ::marker {
            list-style-type: none;
          }

          details summary::-webkit-details-marker {
            display: none;
          }

          details > summary {
            list-style: none;
          }
          details > summary::-webkit-details-marker {
            display: none;
          }
        `}
      </style>
      {!closed && (
        <style>
          {`
        body {
          height: 100%;
          overflow-y: hidden; 
        }  
      `}
        </style>
      )}
      <div
        style={{
          display: closed ? 'none' : 'block',
          position: 'fixed',
          height: '100vh',
          width: '100vw',
          top: 0,
          background: 'rgba(0,0,0,0.7)',
          zIndex: 500,
          left: 0
        }}
        onClick={() => setImageOpen(false)}
      >
        <Close />
      </div>
    </div>
  )
}
