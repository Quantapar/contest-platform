import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { ThemeProvider } from "./components/ThemeProvider";
import { Login } from "./pages/Login";
import { Signup } from "./pages/Signup";
import { AuthProvider } from "./context/AuthContext";
import { Dashboard } from "./pages/Dashboard";
import { CreateContest } from "./pages/CreateContest";
import { ContestsPage } from "./pages/ContestsPage";
import { MyContests } from "./pages/MyContests";
import { ContestDetailsPage } from "./pages/ContestDetailsPage";
import { ContestArenaPage } from "./pages/ContestArenaPage";
import { ManageContestPage } from "./pages/ManageContestPage";

function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/contests" element={<ContestsPage />} />
              <Route
                path="/contests/:contestId"
                element={<ContestDetailsPage />}
              />
              <Route
                path="/contests/:contestId/manage"
                element={<ManageContestPage />}
              />
              <Route path="/contests/my" element={<MyContests />} />
              <Route path="/contests/create" element={<CreateContest />} />
            </Route>
            <Route
              path="/contests/:contestId/arena"
              element={<ContestArenaPage />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
