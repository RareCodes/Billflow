import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <>
      <style>{`
        html,
        body,
        #root {
          width: 100%;
          overflow-x: hidden;
        }

        .billit-main {
          margin-left: 0;
          padding-top: 57px;
          padding-left: 16px;
          padding-right: 16px;
          padding-bottom: 16px;

          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
          box-sizing: border-box;
        }

        @media (min-width: 768px) {
          .billit-main {
            margin-left: 224px;
            padding-top: 32px;
            padding-left: 32px;
            padding-right: 32px;
            padding-bottom: 32px;
          }
        }
      `}</style>

      <div
        style={{
          minHeight: '100vh',
          background: '#F8F7FF',
          overflowX: 'hidden',
          width: '100%',
          maxWidth: '100vw'
        }}
      >
        <Sidebar />

        <main className="billit-main">
          {children}
        </main>
      </div>
    </>
  )
}