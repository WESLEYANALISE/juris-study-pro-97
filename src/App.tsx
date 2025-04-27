
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { RequireAuth } from "@/components/RequireAuth";
import Layout from "@/components/Layout";
import { PageTransition } from "@/components/PageTransition";
import Peticoes from "./pages/Peticoes";
import { useState } from "react";

function App() {
  // Temporary userProfile for development purposes
  const [userProfile] = useState("advogado");

  return (
    <Router>
      <Routes>
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
      </Routes>
    </Router>
  );
}

export default App;
