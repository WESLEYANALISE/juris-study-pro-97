
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { lazy, Suspense } from 'react'
import PodcastLayout from './components/PodcastLayout'
import { LoadingSpinner } from './components/ui/loading-spinner'
import { AuthProvider } from './hooks/use-auth'

// Lazy-loaded pages for better performance
const Home = lazy(() => import('./pages/Home'))
const VadeMecumViewer = lazy(() => import('./pages/VadeMecumViewer'))
// Add more lazy-loaded pages as needed

function App() {
  return (
    <AuthProvider>
      <Router>
        <PodcastLayout>
          <Suspense fallback={
            <div className="flex justify-center items-center h-[60vh]">
              <LoadingSpinner className="h-8 w-8 text-primary" />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/vademecum/:lawId" element={<VadeMecumViewer />} />
              {/* Add more routes as needed */}
            </Routes>
          </Suspense>
        </PodcastLayout>
      </Router>
    </AuthProvider>
  )
}

export default App
