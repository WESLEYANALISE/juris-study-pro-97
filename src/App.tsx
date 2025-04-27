
import Peticoes from "./pages/Peticoes";

// Inside the Routes component
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
