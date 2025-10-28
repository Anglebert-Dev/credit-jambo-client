import { AppRoutes } from './routes/AppRoutes';
import { ToastContainer } from './common/components/Toast';
import { ErrorBoundary } from './common/components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <AppRoutes />
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
