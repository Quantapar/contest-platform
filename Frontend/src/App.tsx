import { Navbar } from "./components/Navbar";
import { LandingPage } from "./pages/LandingPage";
import { ThemeProvider } from "./components/ThemeProvider";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <div className="relative flex min-h-screen flex-col">
        <Navbar />
        <main className="flex-1">
          <LandingPage />
        </main>
      </div>
    </ThemeProvider>
  );
}

export default App;
