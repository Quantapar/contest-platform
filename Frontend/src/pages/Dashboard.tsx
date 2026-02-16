import { useState, useEffect } from "react";
import { Button } from "../components/ui/Button";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import {
  Trophy,
  Code2,
  Settings,
  LogOut,
  LayoutDashboard,
  PlusCircle,
  BookOpen,
  Loader2,
} from "lucide-react";
import { API_BASE_URL } from "../config";

export function Dashboard() {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({ contests: 0, submissions: 0 });
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/stats`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await res.json();
        if (data.success) {
          setStats(data.data);
        }
      } catch (err) {
        console.error("Failed to fetch stats", err);
      } finally {
        setStatsLoading(false);
      }
    };
    fetchStats();
  }, []);

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login");
    }
  }, [isLoading, user, navigate]);

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="h-12 w-12 bg-primary/20 rounded-full" />
          <div className="text-muted-foreground font-medium">
            Loading your profile...
          </div>
        </div>
      </div>
    );
  }

  const isCreator = user.role === "creator";

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6 text-foreground">
      <div className="container mx-auto max-w-5xl">
        <div className="bg-card border border-border rounded-2xl p-8 shadow-sm mb-8">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="h-24 w-24 bg-primary text-primary-foreground rounded-2xl flex items-center justify-center text-4xl font-bold shadow-lg shadow-primary/20">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex-1 text-center md:text-left">
              <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                <h1 className="text-3xl font-bold">{user.name}</h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-primary/10 text-primary border border-primary/20">
                  {user.role}
                </span>
              </div>
              <p className="text-muted-foreground text-lg mb-4">{user.email}</p>
              <div className="flex flex-wrap justify-center md:justify-start gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/settings")}
                >
                  <Settings className="h-4 w-4 mr-2" />
                  Settings
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="text-red-500 border-red-500/20 hover:bg-red-500/5"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
              <div
                onClick={() =>
                  user?.role === "creator" && navigate("/contests/my")
                }
                className={`bg-secondary/30 rounded-xl p-4 text-center border border-border min-w-30 ${user?.role === "creator" ? "cursor-pointer hover:bg-secondary/50 transition-colors" : ""}`}
              >
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    stats.contests
                  )}
                </div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                  {user?.role === "creator"
                    ? "Contests Created"
                    : "Contests Participated"}
                </div>
              </div>
              <div className="bg-secondary/30 rounded-xl p-4 text-center border border-border min-w-30">
                <div className="text-2xl font-bold">
                  {statsLoading ? (
                    <Loader2 className="h-5 w-5 animate-spin mx-auto" />
                  ) : (
                    stats.submissions
                  )}
                </div>
                <div className="text-xs text-muted-foreground uppercase font-bold tracking-tight">
                  {user?.role === "creator"
                    ? "Contest Submissions"
                    : "Total Submissions"}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {user?.role === "creator" ? (
            <div
              onClick={() => navigate("/contests/my")}
              className="group cursor-pointer bg-card border border-border rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">My Contests</h3>
              <p className="text-sm text-muted-foreground">
                Manage your created contests, view results, and update details.
              </p>
            </div>
          ) : (
            <div
              onClick={() => navigate("/contests")}
              className="group cursor-pointer bg-card border border-border rounded-2xl p-6 transition-all hover:border-primary/50 hover:shadow-lg"
            >
              <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                <Trophy className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Contests</h3>
              <p className="text-sm text-muted-foreground">
                Join active competitions and compete with other developers.
              </p>
            </div>
          )}

          <div
            onClick={() => navigate("/problems")}
            className="group cursor-pointer bg-card border border-border rounded-2xl p-6 shadow-sm hover:border-primary/50 transition-all hover:shadow-md"
          >
            <div className="h-12 w-12 bg-green-500/10 text-green-500 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500 group-hover:text-white transition-colors">
              <Code2 className="h-6 w-6" />
            </div>
            <h3 className="text-xl font-bold mb-2">Practice</h3>
            <p className="text-sm text-muted-foreground">
              Sharpen your skills with our library of algorithmic challenges.
            </p>
          </div>

          {isCreator ? (
            <div
              onClick={() => navigate("/contests/create")}
              className="group cursor-pointer bg-primary text-primary-foreground rounded-2xl p-6 shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5"
            >
              <div className="h-12 w-12 bg-white/10 rounded-xl flex items-center justify-center mb-4">
                <PlusCircle className="h-6 w-6" />
              </div>
              <h3 className="text-xl font-bold mb-2">Create Contest</h3>
              <p className="text-sm text-primary-foreground/80">
                Design your own competition, add problems, and host an event.
              </p>
            </div>
          ) : (
            <div className="bg-card border border-border border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-center opacity-70">
              <div className="h-12 w-12 bg-secondary rounded-full flex items-center justify-center mb-4">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-1">Learning Center</h3>
              <p className="text-xs text-muted-foreground">
                Resources coming soon...
              </p>
            </div>
          )}
        </div>

        <div className="mt-12">
          <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
            <LayoutDashboard className="h-5 w-5 text-primary" />
            Recent Announcements
          </h2>
          <div className="bg-card border border-border rounded-2xl p-6 text-center">
            <p className="text-muted-foreground italic">
              No new announcements at this time. Check back later!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
