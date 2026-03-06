import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route, Outlet } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { ThemeProvider } from "./components/ThemeProvider";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";

const LandingPage = lazy(() =>
  import("./pages/LandingPage").then((m) => ({ default: m.LandingPage })),
);
const Dashboard = lazy(() =>
  import("./pages/Dashboard").then((m) => ({ default: m.Dashboard })),
);
const ContestsPage = lazy(() =>
  import("./pages/ContestsPage").then((m) => ({ default: m.ContestsPage })),
);
const ContestDetailsPage = lazy(() =>
  import("./pages/ContestDetailsPage").then((m) => ({
    default: m.ContestDetailsPage,
  })),
);
const ManageContestPage = lazy(() =>
  import("./pages/ManageContestPage").then((m) => ({
    default: m.ManageContestPage,
  })),
);
const MyContests = lazy(() =>
  import("./pages/MyContests").then((m) => ({ default: m.MyContests })),
);
const CreateContest = lazy(() =>
  import("./pages/CreateContest").then((m) => ({ default: m.CreateContest })),
);
const ContestArenaPage = lazy(() =>
  import("./pages/ContestArenaPage").then((m) => ({
    default: m.ContestArenaPage,
  })),
);
const Login = lazy(() =>
  import("./pages/Login").then((m) => ({ default: m.Login })),
);
const Signup = lazy(() =>
  import("./pages/Signup").then((m) => ({ default: m.Signup })),
);
const NotFound = lazy(() =>
  import("./pages/NotFound").then((m) => ({ default: m.NotFound })),
);

function RouteLoader() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="h-8 w-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin" />
    </div>
  );
}

function Layout() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Toaster position="top-center" richColors />
    </div>
  );
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <BrowserRouter>
        <AuthProvider>
          <Suspense fallback={<RouteLoader />}>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
