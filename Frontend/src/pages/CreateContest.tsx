import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import {
  Trophy,
  Calendar,
  Clock,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Loader2,
} from "lucide-react";

export function CreateContest() {
  const { user, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split("T")[0];
  });
  const [startTime, setStartTime] = useState("10:00");
  const [endDate, setEndDate] = useState("");
  const [endTime, setEndTime] = useState("12:00");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (startDate && startTime) {
      if (!endDate) setEndDate(startDate);

      const start = new Date(`${startDate}T${startTime}`);
      const durationHours = 2;
      const end = new Date(start.getTime() + durationHours * 60 * 60 * 1000);

      if (!endDate || endDate === startDate) {
        setEndDate(end.toISOString().split("T")[0]);
        setEndTime(end.toTimeString().split(" ")[0].substring(0, 5));
      }
    }
  }, [startDate, startTime]);

  useEffect(() => {
    if (!authLoading) {
      if (!user) {
        navigate("/login");
      } else if (user.role !== "creator") {
        navigate("/dashboard");
      }
    }
  }, [user, authLoading, navigate]);

  const validateTimeline = () => {
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);
    const now = new Date();

    if (start.getFullYear() > 2099 || end.getFullYear() > 2099) {
      return "Year cannot exceed 2099.";
    }

    if (start <= now) {
      return "Start time must be in the future.";
    }
    if (end <= start) {
      return "End time must be after the start time.";
    }
    return null;
  };

  if (authLoading || !user || user.role !== "creator") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateTimeline();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);

    try {
      const startDateTime = new Date(`${startDate}T${startTime}`).toISOString();
      const endDateTime = new Date(`${endDate}T${endTime}`).toISOString();

      const response = await fetch("http://localhost:3000/api/contests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          startTime: startDateTime,
          endTime: endDateTime,
        }),
      });

      const data = await response.json();

      if (data.success) {
        navigate(`/contests/my`);
      } else {
        setError(data.error || "Failed to create contest");
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDuration = () => {
    if (!startDate || !startTime || !endDate || !endTime) return null;
    const start = new Date(`${startDate}T${startTime}`);
    const end = new Date(`${endDate}T${endTime}`);

    if (start.getFullYear() > 2099 || end.getFullYear() > 2099)
      return "Invalid Year";

    const diff = end.getTime() - start.getTime();
    if (diff <= 0) return "Invalid Range";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  const durationText = getDuration();

  useEffect(() => {
    const error = validateTimeline();
    if (error && (startDate || endDate)) {
      setError(error);
    } else {
      setError(null);
    }
  }, [startDate, startTime, endDate, endTime]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-2xl">
        <Button
          variant="ghost"
          className="mb-8 hover:bg-primary/5 -ml-4"
          onClick={() => navigate("/dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        <div className="bg-card border border-border rounded-3xl p-8 shadow-md">
          <div className="flex items-center gap-4 mb-10">
            <div className="h-14 w-14 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <Trophy className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Create Contest
              </h1>
              <p className="text-muted-foreground">
                Configure the schedule and details for your competition.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 text-destructive px-5 py-4 rounded-2xl flex items-center gap-3 animate-in fade-in slide-in-from-top-4">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <p className="text-sm font-semibold">{error}</p>
              </div>
            )}

            <div className="grid gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold tracking-tight text-foreground/80 ml-1 uppercase">
                  Title
                </label>
                <input
                  required
                  type="text"
                  placeholder="e.g., Summer Coding Sprint 2026"
                  className="w-full bg-secondary/20 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium placeholder:text-muted-foreground/50 shadow-inner"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold tracking-tight text-foreground/80 ml-1 uppercase">
                  Details
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Provide an overview of the contest, including rules and any specific guidelines for participants."
                  className="w-full bg-secondary/20 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-muted-foreground/50 shadow-inner"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-2">
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold tracking-tight text-foreground/80 ml-1 uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> Start Date
                  </label>
                  <input
                    required
                    type="date"
                    min={new Date().toISOString().split("T")[0]}
                    max="2099-12-31"
                    className={`w-full bg-secondary/20 border ${error?.includes("Start") ? "border-destructive/50" : "border-border"} rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner`}
                    value={startDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 10) setStartDate(val);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold tracking-tight text-foreground/80 ml-1 uppercase flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> Start Time
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full bg-secondary/20 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold tracking-tight text-foreground/80 ml-1 uppercase flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-primary" /> End Date
                  </label>
                  <input
                    required
                    type="date"
                    min={startDate}
                    max="2099-12-31"
                    className={`w-full bg-secondary/20 border ${error?.includes("End") ? "border-destructive/50" : "border-border"} rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner`}
                    value={endDate}
                    onChange={(e) => {
                      const val = e.target.value;
                      if (val.length <= 10) setEndDate(val);
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold tracking-tight text-foreground/80 ml-1 uppercase flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" /> End Time
                  </label>
                  <input
                    required
                    type="time"
                    className="w-full bg-secondary/20 border border-border rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-inner"
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                  />
                </div>

                {durationText && (
                  <div className="absolute right-4 md:right-8 -bottom-3 bg-primary text-primary-foreground text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl animate-in fade-in zoom-in duration-300">
                    Duration: {durationText}
                  </div>
                )}
              </div>
            </div>

            <div className="pt-10">
              <Button
                type="submit"
                className="w-full py-8 text-xl font-extrabold shadow-2xl shadow-primary/30 rounded-2xl h-16 transition-all active:scale-[0.98]"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-6 w-6" />
                    <span>Create Contest Arena</span>
                  </div>
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
