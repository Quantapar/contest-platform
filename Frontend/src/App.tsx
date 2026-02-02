import Navbar from "./components/Navbar";

function App() {
  return (
    <>
      <div className="min-h-screen w-full bg-[#020617] relative">
        <div
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `radial-gradient(circle 500px at 50% 200px, #3e3e3e, transparent)`,
          }}
        />
        <Navbar />
      </div>
    </>
  );
}

export default App;
