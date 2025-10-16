import Web3Provider from './context/Web3Provider'
import { routes } from './routes/routes'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import PageLoader from './components/Loader/PageLoader'

function App() {
  return (
    <>
     {/* ✅ Page Loader - Shows on initial website load */}
     <PageLoader />
     
     <Web3Provider>
      {/* ✅ Improved Toast Notifications */}
      <Toaster 
        position="top-center"
        gutter={12}
        containerStyle={{
          top: 80,
          zIndex: 99999,
        }}
        toastOptions={{
          duration: 4000,
          // Success Toast
          success: {
            style: {
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#ffffff',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(16, 185, 129, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '15px',
              fontWeight: '600',
              maxWidth: '500px',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#10b981',
            },
          },
          // Error Toast
          error: {
            style: {
              background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
              color: '#ffffff',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(239, 68, 68, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '15px',
              fontWeight: '600',
              maxWidth: '500px',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#ef4444',
            },
          },
          // Loading Toast
          loading: {
            style: {
              background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
              color: '#ffffff',
              padding: '16px 24px',
              borderRadius: '12px',
              boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              fontSize: '15px',
              fontWeight: '600',
              maxWidth: '500px',
            },
            iconTheme: {
              primary: '#ffffff',
              secondary: '#3b82f6',
            },
          },
          // Default Toast
          style: {
            background: 'linear-gradient(135deg, #1f2937 0%, #111827 100%)',
            color: '#ffffff',
            padding: '16px 24px',
            borderRadius: '12px',
            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            fontSize: '15px',
            fontWeight: '500',
            maxWidth: '500px',
          },
        }}
      />
      <RouterProvider router={routes}></RouterProvider>
     </Web3Provider>
    </>
  )
}

export default App