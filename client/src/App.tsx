import { Switch, Route, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { useEffect } from "react";

import { queryClient } from "@/lib/queryClient";
import { AuthProvider } from "@/contexts/AuthContext";
import { useAuth } from "@/hooks/useAuth";
import { initGA } from "../lib/analytics";
import { useAnalytics } from "../hooks/use-analytics";
import { useEnhancedTracking } from "../hooks/use-enhanced-tracking";

import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { LoadingState } from "@/components/ui/loading";
import { ErrorBoundary } from "@/components/error-boundary";

import Dashboard from "@/pages/dashboard";
import Landing from "@/pages/landing";
import SignupPage from "@/pages/signup";
import NotFound from "@/pages/not-found";
import LoginForm from "@/components/auth/LoginForm";
import ResetPassword from "@/components/auth/ResetPassword";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingState text="Authenticating..." size="lg" className="min-h-screen" />;
  }

  if (!user) {
    return <Redirect to="/login" />;
  }

  return <>{children}</>;
}

function Router() {
  const { user, loading } = useAuth();
  
  // Track page views when routes change
  useAnalytics();
  
  // Enhanced tracking for detailed user behavior analytics
  useEnhancedTracking();

  if (loading) {
    return <LoadingState text="Loading..." size="lg" className="min-h-screen" />;
  }

  return (
    <Switch>
      {/* Public Routes */}
      <Route path="/login">
        {() => user ? <Redirect to="/dashboard" /> : <LoginForm />}
      </Route>
      <Route path="/signup">
        {() => user ? <Redirect to="/dashboard" /> : <SignupPage />}
      </Route>
      <Route path="/reset-password" component={ResetPassword} />
      
      {/* Protected Routes */}
      <Route path="/messages">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="messages" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/stream-messages">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="stream-messages" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/inbox">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="inbox" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/suggestions">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="suggestions" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/governance">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="governance" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/google-sheets">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="google-sheets" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/meetings">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="meetings" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects">
        {() => (
          <ProtectedRoute>
            <Dashboard initialSection="projects" />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/projects/:id">
        {(params) => (
          <ProtectedRoute>
            <Dashboard initialSection={`project-${params.id}`} />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard">
        {() => (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        )}
      </Route>
      <Route path="/dashboard/:section">
        {(params) => (
          <ProtectedRoute>
            <Dashboard initialSection={params.section} />
          </ProtectedRoute>
        )}
      </Route>
      
      {/* Root Route */}
      <Route path="/">
        {() => user ? <Redirect to="/dashboard" /> : <Redirect to="/login" />}
      </Route>
      
      {/* 404 Route */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;