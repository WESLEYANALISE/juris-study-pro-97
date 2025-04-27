
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import Peticoes from "./pages/Peticoes";
import NotFound from "./pages/NotFound";
import { useState } from "react";
import { type ProfileType } from "@/components/WelcomeModal";
import { Toaster } from "@/components/ui/sonner";

function App() {
  // Temporary userProfile for development purposes
  const [userProfile] = useState<ProfileType>("advogado");

  return (
    <Router>
      <Toaster />
      <Routes>
        {/* Home page - will redirect to peticoes for now */}
        <Route path="/" element={<Navigate to="/peticoes" replace />} />
        
        {/* Peticoes page */}
        <Route
          path="/peticoes"
          element={
            <RequireAuth>
              <Layout userProfile={userProfile}>
                <PageTransition>
                  <Peticoes />
                </PageTransition>
              </Layout>
            </RequireAuth>
          }
        />
        
        {/* Add other routes here in the future */}
        
        {/* Not found page */}
        <Route
          path="*"
          element={
            <Layout userProfile={userProfile}>
              <PageTransition>
                <NotFound />
              </PageTransition>
            </Layout>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;
