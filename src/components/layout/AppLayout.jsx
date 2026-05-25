import Sidebar from './Sidebar'

export default function AppLayout({ children }) {
  return (
    <>
      <style>{`
        .billit-main {
          margin-left: 0;
          padding-top: 57px;
          padding-left: 16px;
          padding-right: 16px;
          padding-bottom: 16px;
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
      <div style={{ minHeight: '100vh', background: '#F8F7FF' }}>
        <Sidebar />
        <main className="billit-main">
          {children}
        </main>
      </div>
    </>
  )
}