import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { Loader2, AlertCircle, Settings } from "lucide-react";
import { API_BASE_URL } from "../config";

interface ContestDetails {
  id: number;
  title: string;
  description: string;
  startTime: string;
  endTime: string;
  creatorId: number;
  mcqs: any[];
  dsaProblems: any[];
}

export function ContestDetailsPage() {
  const { contestId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [contest, setContest] = useState<ContestDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchContestDetails = async () => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/api/contests/${contestId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setContest(data.data);
        } else {
          setError(data.error || "Contest not found");
        }
      } catch (err) {
        setError("Network error. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    if (contestId) {
      fetchContestDetails();
    }
  }, [contestId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !contest) {
    return (
      <div className="min-h-screen bg-background pt-24 pb-12 px-6 flex items-center justify-center">
        <div className="text-center max-w-md">
          <AlertCircle className="h-16 w-16 text-destructive mx-auto mb-6" />
          <h1 className="text-3xl font-bold mb-4">
            {error || "Contest Not Found"}
          </h1>
          <p className="text-muted-foreground mb-8">
            The contest you are looking for doesn't exist or you don't have
            permission to view it.
          </p>
          <Button
            onClick={() => navigate("/contests")}
            size="lg"
            className="rounded-2xl px-10"
          >
            Back to Contests
          </Button>
        </div>
      </div>
    );
  }

  const now = new Date();
  const start = new Date(contest.startTime);
  const end = new Date(contest.endTime);
  const isLive = now >= start && now <= end;
  const isUpcoming = now < start;

  const totalProblems =
    (contest.mcqs?.length || 0) + (contest.dsaProblems?.length || 0);
  const totalPoints = [
    ...(contest.mcqs || []),
    ...(contest.dsaProblems || []),
  ].reduce((acc, curr) => acc + (curr.points || 0), 0);

  const formatDuration = (ms: number) => {
    const totalSeconds = Math.floor(Math.abs(ms) / 1000);
    const days = Math.floor(totalSeconds / (24 * 3600));
    const hours = Math.floor((totalSeconds % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);

    const parts = [];
    if (days > 0) parts.push(`${days}d`);
    if (hours > 0 || days > 0) parts.push(`${hours}h`);
    parts.push(`${minutes}m`);
    return parts.join(" ");
  };

  const getTimeStatus = () => {
    if (isUpcoming) {
      const diff = start.getTime() - now.getTime();
      return `Starts in ${formatDuration(diff)}`;
    }
    if (isLive) {
      const diff = end.getTime() - now.getTime();
      return `Ends in ${formatDuration(diff)}`;
    }
    return "Official event concluded";
  };

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <Button
          variant="outline"
          className="mb-8 rounded-none border-foreground h-8 uppercase text-[10px] font-bold"
          onClick={() => navigate(-1)}
        >
          Back
        </Button>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-card border border-border rounded-none p-8">
              <div className="mb-8 text-xs font-mono uppercase tracking-widest text-muted-foreground border-b border-border pb-4 flex justify-between">
                <span>Contest Data</span>
                <span>
                  {isLive ? "LIVE" : isUpcoming ? "UPCOMING" : "CLOSED"}
                </span>
              </div>

              <h1 className="text-4xl font-extrabold tracking-tight mb-4">
                {contest.title}
              </h1>
              <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                {contest.description}
              </p>

              <div className="grid grid-cols-2 gap-px bg-border border border-border">
                <div className="p-6 bg-background">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Questions
                  </div>
                  <div className="text-lg font-bold uppercase">
                    {totalProblems}
                  </div>
                </div>
                <div className="p-6 bg-background">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">
                    Points
                  </div>
                  <div className="text-lg font-bold uppercase">
                    {totalPoints}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-muted-foreground border-b border-border pb-2">
                CURRICULUM
              </h2>

              <div className="space-y-4">
                {contest.mcqs &&
                  contest.mcqs.length > 0 &&
                  contest.mcqs.map((mcq: any, idx: number) => (
                    <div
                      key={`mcq-${idx}`}
                      className="border border-border p-4 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/contests/${contest.id}/arena`)}
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-xs font-mono text-muted-foreground">
                          0{idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-tight">
                            {mcq.questionText}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono mt-1 block">
                            MCQ / {mcq.points} PTS
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                {contest.dsaProblems &&
                  contest.dsaProblems.length > 0 &&
                  contest.dsaProblems.map((dsa: any, idx: number) => (
                    <div
                      key={`dsa-${idx}`}
                      className="border border-border p-4 flex items-center justify-between hover:bg-muted transition-colors cursor-pointer"
                      onClick={() => navigate(`/contests/${contest.id}/arena`)}
                    >
                      <div className="flex items-center gap-6">
                        <div className="text-xs font-mono text-muted-foreground">
                          0{idx + (contest.mcqs?.length || 0) + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-tight">
                            {dsa.title}
                          </h4>
                          <span className="text-[10px] text-muted-foreground uppercase font-mono mt-1 block">
                            DSA / {dsa.points} PTS
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}

                {totalProblems === 0 && (
                  <div className="bg-secondary/20 border border-border border-dashed rounded-3xl p-12 text-center">
                    <p className="text-muted-foreground italic">
                      No challenges have been added to this arena yet.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card border border-border rounded-3xl p-6 shadow-sm space-y-6">
              <div className="space-y-6 pt-6 font-mono text-xs uppercase">
                <div className="space-y-2">
                  <div className="text-muted-foreground">SCDL</div>
                  <div className="font-bold">
                    {new Date(contest.startTime).toLocaleDateString([], {
                      month: "2-digit",
                      day: "2-digit",
                    })}{" "}
                    /{" "}
                    {new Date(contest.startTime).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-muted-foreground">DUR</div>
                  <div className="font-bold">
                    {formatDuration(end.getTime() - start.getTime())}
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <Button
                  variant="outline"
                  className="w-full h-12 rounded-none border-foreground uppercase text-xs font-bold tracking-[0.2em] border-2"
                  onClick={() => navigate(`/contests/${contest.id}/arena`)}
                >
                  {isLive ? "Join" : "Review"}
                </Button>
                <p className="text-[10px] text-center text-muted-foreground mt-4 font-mono uppercase">
                  {getTimeStatus()}
                </p>
              </div>
            </div>

            {user?.id === contest.creatorId && (
              <div className="bg-primary/5 border border-primary/20 rounded-3xl p-6">
                <h4 className="text-sm font-bold uppercase tracking-tight text-primary mb-2 flex items-center gap-2">
                  <Settings className="h-4 w-4" /> Creator Access
                </h4>
                <p className="text-xs text-muted-foreground mb-4">
                  You have administrative control over this arena. You can
                  modify problems or adjust timing.
                </p>
                <div className="space-y-2">
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-bold border-primary/20 text-primary hover:bg-primary/10"
                    onClick={() => navigate(`/contests/${contestId}/manage`)}
                  >
                    Edit Configuration
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full h-10 text-xs font-bold border-primary/20 text-primary hover:bg-primary/10"
                  >
                    View Submissions
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
