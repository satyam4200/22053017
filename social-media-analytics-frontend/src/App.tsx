import { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Navbar from './components/Navbar';
import FeedPage from './pages/FeedPage'; 
import TopUsersPage from './pages/TopUsersPage';
import TrendingPostsPage from './pages/TrendingPostsPage'; 
import { checkHealth } from './services/api'; 
import ErrorMessage from './components/ErrorMessage';
import { HealthStatus, ApiError, isApiError } from './types';

const HEALTH_CHECK_INTERVAL = 15000;

function App() {
    const [isBackendReady, setIsBackendReady] = useState<boolean>(false);
    const [initialCheckDone, setInitialCheckDone] = useState<boolean>(false);
    const healthIntervalRef = useRef<NodeJS.Timeout | null>(null);

    const performHealthCheck = async () => {
        const result: HealthStatus | ApiError = await checkHealth();
        let ready = false;
        if (!isApiError(result)) {
            ready = result.dataReady === true;
        }
        setIsBackendReady(ready);

        if (!initialCheckDone) {
            setInitialCheckDone(true);
        }
    };

    useEffect(() => {
        performHealthCheck(); 
        healthIntervalRef.current = setInterval(performHealthCheck, HEALTH_CHECK_INTERVAL);
        return () => { 
            if (healthIntervalRef.current) {
                clearInterval(healthIntervalRef.current);
            }
        };
    }, []); 

  return (
    <Router>
      <div className="flex flex-col min-h-screen">
        <Navbar isBackendReady={isBackendReady} />
        <main className="flex-grow">
          { initialCheckDone && !isBackendReady && (
             <div className="max-w-4xl mx-auto px-4 pt-4">
               <ErrorMessage message="Backend service is initializing or unavailable. Data might be stale or incomplete." />
             </div>
          )}
           <Routes>
                <Route path="/" element={<FeedPage />} />
                <Route path="/top-users" element={<TopUsersPage />} />
                <Route path="/trending-posts" element={<TrendingPostsPage />} />
                <Route path="*" element={
                    <div className="text-center py-10">
                        <h1 className="text-xl font-semibold text-gray-700">404: Page Not Found</h1>
                    </div>
                } />
           </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;