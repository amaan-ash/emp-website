import { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { LoginForm } from './components/auth/LoginForm';
import { SignupForm } from './components/auth/SignupForm';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { EmployeeList } from './components/EmployeeList';
import { EmployeeForm } from './components/EmployeeForm';
import { EmployeeDetails } from './components/EmployeeDetails';
import { ErrorBoundary } from './components/ErrorBoundary';
import { Toaster } from './components/ui/sonner';

type ViewType = 'dashboard' | 'employees' | 'add' | 'edit' | 'details';

interface AppState {
  currentView: ViewType;
  selectedEmployeeId?: string;
}

// Main app component that requires authentication
const MainApp = () => {
  const [appState, setAppState] = useState<AppState>({
    currentView: 'dashboard'
  });

  const handleViewChange = (view: string) => {
    setAppState({ currentView: view as ViewType });
  };

  const handleAddEmployee = () => {
    setAppState({ currentView: 'add' });
  };

  const handleEditEmployee = (id: string) => {
    setAppState({ currentView: 'edit', selectedEmployeeId: id });
  };

  const handleViewEmployee = (id: string) => {
    setAppState({ currentView: 'details', selectedEmployeeId: id });
  };

  const handleFormSuccess = () => {
    setAppState({ currentView: 'employees' });
  };

  const handleBack = () => {
    setAppState({ currentView: 'employees' });
  };

  const renderCurrentView = () => {
    switch (appState.currentView) {
      case 'dashboard':
        return <Dashboard />;
      
      case 'employees':
        return (
          <EmployeeList
            onAddEmployee={handleAddEmployee}
            onEditEmployee={handleEditEmployee}
            onViewEmployee={handleViewEmployee}
          />
        );
      
      case 'add':
        return (
          <EmployeeForm
            onBack={handleBack}
            onSuccess={handleFormSuccess}
          />
        );
      
      case 'edit':
        return (
          <EmployeeForm
            employeeId={appState.selectedEmployeeId}
            onBack={handleBack}
            onSuccess={handleFormSuccess}
          />
        );
      
      case 'details':
        return (
          <EmployeeDetails
            employeeId={appState.selectedEmployeeId!}
            onBack={handleBack}
            onEdit={handleEditEmployee}
          />
        );
      
      default:
        return <Dashboard />;
    }
  };

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-background">
        <Header 
          currentView={appState.currentView} 
          onViewChange={handleViewChange} 
        />
        <main className="container mx-auto px-6 py-8">
          <ErrorBoundary>
            {renderCurrentView()}
          </ErrorBoundary>
        </main>
        <Toaster position="top-right" />
      </div>
    </ErrorBoundary>
  );
};

// Authentication wrapper component
const AuthWrapper = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signin');

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        {authMode === 'signin' ? (
          <LoginForm onToggleMode={() => setAuthMode('signup')} />
        ) : (
          <SignupForm 
            onToggleMode={() => setAuthMode('signin')}
            onSignupSuccess={() => setAuthMode('signin')}
          />
        )}
        <Toaster position="top-right" />
      </>
    );
  }

  return <MainApp />;
};

// Root app component with providers
export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <AuthWrapper />
      </AuthProvider>
    </ErrorBoundary>
  );
}