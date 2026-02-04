import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import { Button } from "../components/ui/Button";

export function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleStartCompeting = () => {
    if (user) {
      navigate("/contests");
    } else {
      navigate("/signup");
    }
  };

  const handleHostContest = () => {
    if (user) {
      if (user.role === "creator") {
        navigate("/contests/create");
      } else {
        navigate("/dashboard");
      }
    } else {
      navigate("/signup?role=creator");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <section className="pt-32 pb-22 px-6 border-b border-border">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="text-5xl md:text-8xl font-bold tracking-tighter mb-8 uppercase">
            Competitive Programming
          </h1>

          <p className="text-lg text-muted-foreground mb-12 max-w-xl mx-auto uppercase tracking-tight">
            Build contests. Solve problems. Compete on logic.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              className="h-10 px-8 rounded-none border-foreground uppercase text-xs font-bold font-mono"
              onClick={handleStartCompeting}
            >
              Start Competing
            </Button>
            <Button
              variant="outline"
              className="h-10 px-8 rounded-none border-foreground uppercase text-xs font-bold font-mono"
              onClick={handleHostContest}
            >
              Host Contest
            </Button>
          </div>

          <div className="mt-20 pt-12 border-t border-border grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Accounts", value: "10k" },
              { label: "Traffic", value: "50k" },
              { label: "Events", value: "100" },
              { label: "Regions", value: "45" },
            ].map((stat) => (
              <div key={stat.label} className="text-center font-mono uppercase">
                <span className="block text-2xl font-bold">{stat.value}</span>
                <span className="text-[10px] text-muted-foreground tracking-widest">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-b border-border">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid md:grid-cols-2 gap-px bg-border border border-border">
            <div className="p-12 bg-background space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Participation
              </h3>
              <h4 className="text-2xl font-bold uppercase tracking-tighter">
                Developer
              </h4>
              <ul className="space-y-4 text-xs font-mono uppercase text-muted-foreground">
                <li>• Algorithm Challenges</li>
                <li>• Real-time events</li>
                <li>• Analytics data</li>
                <li>• Certification</li>
              </ul>
              <Button
                variant="outline"
                className="w-full h-10 rounded-none border-foreground uppercase text-[10px] font-bold"
                onClick={handleStartCompeting}
              >
                Enter
              </Button>
            </div>

            <div className="p-12 bg-background space-y-6">
              <h3 className="text-xs font-mono uppercase tracking-[0.3em] text-muted-foreground">
                Organization
              </h3>
              <h4 className="text-2xl font-bold uppercase tracking-tighter">
                Creator
              </h4>
              <ul className="space-y-4 text-xs font-mono uppercase text-muted-foreground">
                <li>• Custom Arenas</li>
                <li>• Problemsets</li>
                <li>• Auto Judging</li>
                <li>• Ranking Tools</li>
              </ul>
              <Button
                variant="outline"
                className="w-full h-10 rounded-none border-foreground uppercase text-[10px] font-bold"
                onClick={handleHostContest}
              >
                Create
              </Button>
            </div>
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="container mx-auto px-6 max-w-4xl">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-12 border-t border-border pt-12">
            {[
              { title: "Fast", desc: "Isolated instances." },
              { title: "Global", desc: "No boundaries." },
              { title: "Insight", desc: "Core patterns." },
              { title: "Team", desc: "Collaborative." },
              { title: "Tools", desc: "Standardized." },
              { title: "Fair", desc: "Verifiable." },
            ].map((f, i) => (
              <div key={i} className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-widest">
                  {f.title}
                </h3>
                <p className="text-[10px] uppercase font-mono text-muted-foreground leading-tight">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <footer className="py-12 border-t border-border bg-muted/20">
        <div className="container mx-auto px-6 max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2">
              <h4 className="font-bold text-lg mb-4 uppercase tracking-tighter">
                CYPHER
              </h4>
              <p className="text-xs uppercase font-mono text-muted-foreground max-w-xs leading-relaxed">
                Standardized logic assessment platform for high-performance
                development teams and individuals.
              </p>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    Contests
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Problem Set
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Gym
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    API
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-[10px] mb-4 uppercase tracking-[0.2em]">
                Company
              </h4>
              <ul className="space-y-2 text-[10px] uppercase font-mono text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Terms
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground">
                    Policy
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex justify-between items-center pt-8 border-t border-border text-[10px] uppercase font-mono text-muted-foreground">
            <p>&copy; 2026 CYPHER. VER 1.0.0</p>
            <div className="flex gap-6">
              <a
                href="https://x.com/quantapar"
                className="hover:text-foreground"
              >
                X
              </a>
              <a
                href="https://github.com/quantapar"
                className="hover:text-foreground"
              >
                GitHub
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
