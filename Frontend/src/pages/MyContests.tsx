import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { API_BASE_URL } from "../config";
import { Button } from "../components/ui/Button";
import { Settings, Plus, Loader2, AlertCircle } from "lucide-react";

interface Contest {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creatorId: number;
  creatorName: string;
}

export function MyContests() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [contests, setContests] = useState<Contest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || user.role !== "creator")) {
      navigate("/dashboard");
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    const fetchMyContests = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/contests/my`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        const data = await response.json();
        if (data.success) {
          setContests(data.data);
        } else {
          setError(data.error || "Failed to fetch your contests");
        }
      } catch (err) {
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (user && user.role === "creator") {
      fetchMyContests();
    }
  }, [user]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  const now = new Date();

  const liveContests = contests.filter((c) => {
    const start = new Date(c.startTime);
    const end = new Date(c.endTime);
    return now >= start && now <= end;
  });

  const upcomingContests = contests.filter((c) => {
    const start = new Date(c.startTime);
    return now < start;
  });

  const pastContests = contests.filter((c) => {
    const end = new Date(c.endTime);
    return now > end;
  });

  const ContestCard = ({
    contest,
    status,
  }: {
    contest: Contest;
    status: "live" | "upcoming" | "past";
  }) => (
    <div
      onClick={() => navigate(`/contests/${contest.id}`)}
      className="group relative bg-background border border-border p-6 hover:bg-muted/50 transition-colors cursor-pointer"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          {status === "live"
            ? "LIVE NOW"
            : status === "upcoming"
              ? "SCHEDULED"
              : "ARCHIVED"}
        </div>

        <div className="flex gap-2">
          {status === "live" && (
            <span className="h-2 w-2 rounded-full bg-foreground animate-pulse" />
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/contests/${contest.id}/manage`);
            }}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>

      <h3 className="text-lg font-bold mb-2 uppercase tracking-tight">
        {contest.title}
      </h3>
      <p className="text-xs text-muted-foreground mb-6 line-clamp-2 font-mono uppercase">
        {contest.description}
      </p>

      <div className="space-y-1 border-t border-border pt-4 font-mono text-[10px] uppercase text-muted-foreground">
        <div className="flex justify-between">
          <span>Date</span>
          <span className="text-foreground">
            {new Date(contest.startTime).toLocaleDateString([], {
              month: "2-digit",
              day: "2-digit",
              year: "2-digit",
            })}
          </span>
        </div>
        <div className="flex justify-between">
          <span>Time</span>
          <span className="text-foreground">
            {new Date(contest.startTime).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            })}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <Button
          variant="outline"
          className="w-full rounded-none h-8 text-[10px] uppercase font-bold border-foreground hover:bg-foreground hover:text-background"
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/contests/${contest.id}/manage`);
          }}
        >
          Manage
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-6xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-border pb-6">
          <div>
            <Button
              variant="outline"
              className="mb-6 rounded-none border-foreground h-8 uppercase text-[10px] font-bold"
              onClick={() => navigate("/dashboard")}
            >
              Dashboard
            </Button>
            <h1 className="text-3xl font-bold tracking-tighter uppercase mb-2">
              My Contests
            </h1>
            <p className="text-xs font-mono uppercase text-muted-foreground tracking-widest">
              Creator Dashboard
            </p>
          </div>
          <Button
            onClick={() => navigate("/contests/create")}
            variant="outline"
            className="rounded-none border-foreground h-10 uppercase text-xs font-bold gap-2 hover:bg-foreground hover:text-background"
          >
            <Plus className="h-4 w-4" />
            New Contest
          </Button>
        </div>

        {error && (
          <div className="bg-destructive/10 border border-destructive/20 text-destructive px-4 py-4 rounded-2xl flex items-center gap-3 mb-8">
            <AlertCircle className="h-5 w-5" />
            <p className="font-medium">{error}</p>
          </div>
        )}

        {contests.length === 0 ? (
          <div className="bg-card/50 border border-border border-dashed p-16 text-center">
            <h3 className="text-xl font-bold text-foreground mb-4 uppercase tracking-tight">
              No contests initialized
            </h3>
            <Button
              onClick={() => navigate("/contests/create")}
              variant="outline"
              className="rounded-none border-foreground h-10 uppercase text-xs font-bold px-8 hover:bg-foreground hover:text-background"
            >
              Initialize Contest
            </Button>
          </div>
        ) : (
          <div className="space-y-16">
            <section>
              <h2 className="text-xs font-mono font-bold mb-6 uppercase tracking-widest border-b border-border pb-2 flex justify-between">
                <span>Active Events</span>
                <span>{liveContests.length}</span>
              </h2>
              {liveContests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {liveContests.map((c) => (
                    <ContestCard key={c.id} contest={c} status="live" />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono uppercase text-muted-foreground">
                  No active contests.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xs font-mono font-bold mb-6 uppercase tracking-widest border-b border-border pb-2 flex justify-between">
                <span>Scheduled</span>
                <span>{upcomingContests.length}</span>
              </h2>
              {upcomingContests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingContests.map((c) => (
                    <ContestCard key={c.id} contest={c} status="upcoming" />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono uppercase text-muted-foreground">
                  No scheduled contests.
                </p>
              )}
            </section>

            <section>
              <h2 className="text-xs font-mono font-bold mb-6 uppercase tracking-widest border-b border-border pb-2 flex justify-between">
                <span>Archive</span>
                <span>{pastContests.length}</span>
              </h2>
              {pastContests.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {pastContests.map((c) => (
                    <ContestCard key={c.id} contest={c} status="past" />
                  ))}
                </div>
              ) : (
                <p className="text-[10px] font-mono uppercase text-muted-foreground">
                  No condensed history.
                </p>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
}
