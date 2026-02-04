import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import Editor from "@monaco-editor/react";

import { Loader2 } from "lucide-react";

interface Problem {
  id: number;
  type: "mcq" | "dsa";
  title: string;
  points: number;
  data: any;
  submitted?: boolean;
  pointsEarned?: number;
}

const languageBoilerplates: Record<string, string> = {
  javascript: `// Write your solution here\n\nfunction solve() {\n    console.log("Hello World");\n}\n\nsolve();`,
  python: `# Write your solution here\nimport sys\n\ndef solve():\n    # input = sys.stdin.read().split()\n    print("Hello World")\n\nif __name__ == "__main__":\n    solve()`,
  cpp: `#include <bits/stdc++.h>\nusing namespace std;\n\nvoid solve() {\n    cout << "Hello World" << endl;\n}\n\nint main() {\n    solve();\n    return 0;\n}`,
  java: `import java.util.*;\nimport java.io.*;\n\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello World");\n    }\n}`,
};

export function ContestArenaPage() {
  const { contestId } = useParams();

  const [contest, setContest] = useState<any>(null);
  const [problems, setProblems] = useState<Problem[]>([]);
  const [currentProblemIdx, setCurrentProblemIdx] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [selectedOption, setSelectedOption] = useState<number | null>(null);

  const [codes, setCodes] = useState<Record<string, string>>({});
  const [language, setLanguage] = useState("javascript");
  const [submissionResult, setSubmissionResult] = useState<any>(null);

  const getProblemCodeKey = (probId: number, lang: string) =>
    `${probId}-${lang}`;

  const currentProblem = problems[currentProblemIdx];
  const currentCode = currentProblem
    ? codes[getProblemCodeKey(currentProblem.id, language)] ||
      languageBoilerplates[language] ||
      ""
    : "";

  const handleCodeChange = (newCode: string | undefined) => {
    if (currentProblem) {
      setCodes((prev) => ({
        ...prev,
        [getProblemCodeKey(currentProblem.id, language)]: newCode || "",
      }));
    }
  };

  useEffect(() => {
    const fetchArenaData = async () => {
      try {
        const response = await fetch(
          `http://localhost:3000/api/contests/${contestId}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("token")}`,
            },
          },
        );
        const data = await response.json();
        if (data.success) {
          setContest(data.data);

          const mcqs = data.data.mcqs.map((m: any) => ({
            id: m.id,
            type: "mcq",
            title: m.questionText,
            points: m.points,
            data: m,
            submitted: !!m.userSubmission,
            pointsEarned: m.userSubmission?.pointsEarned || 0,
          }));

          const dsas = data.data.dsaProblems.map((d: any) => ({
            id: d.id,
            type: "dsa",
            title: d.title,
            points: d.points,
            data: d,
            submitted: !!d.userSubmission,
            pointsEarned: d.userSubmission?.pointsEarned || 0,
          }));

          setProblems([...mcqs, ...dsas]);
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
      fetchArenaData();
    }
  }, [contestId]);

  const handleMcqSubmit = async () => {
    if (selectedOption === null) return;
    setSubmitting(true);
    try {
      if (!currentProblem) return;
      const res = await fetch(
        `http://localhost:3000/api/contests/${contestId}/mcq/${currentProblem.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ selectedOptionIndex: selectedOption }),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert(
          data.data.isCorrect
            ? `Correct! You earned ${currentProblem.points} points.`
            : "Incorrect answer.",
        );
        const updatedProblems = [...problems];
        updatedProblems[currentProblemIdx].submitted = true;
        if (data.data.isCorrect) {
          updatedProblems[currentProblemIdx].pointsEarned =
            currentProblem.points;
        }
        setProblems(updatedProblems);
      } else {
        alert(data.error || "Submission failed");
      }
    } catch (err) {
      alert("Submission error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDsaSubmit = async () => {
    if (!currentProblem || !currentCode.trim()) return;
    setSubmitting(true);
    setSubmissionResult(null);
    try {
      const res = await fetch(
        `http://localhost:3000/api/problems/${currentProblem.id}/submit`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({ code: currentCode, language }),
        },
      );
      const data = await res.json();
      if (data.success) {
        pollSubmission(data.data.submissionId);
      } else {
        alert(data.error || "Submission failed");
        setSubmitting(false);
      }
    } catch (err) {
      alert("Submission error");
      setSubmitting(false);
    }
  };

  const pollSubmission = async (submissionId: number) => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/problems/submission/${submissionId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        },
      );
      const data = await res.json();

      if (!data.success) {
        setSubmitting(false);
        alert(data.error || "Failed to get submission status");
        return;
      }

      if (data.data.status !== "processing") {
        setSubmissionResult(data.data);
        setSubmitting(false);
        const updatedProblems = [...problems];
        updatedProblems[currentProblemIdx].submitted = true;
        updatedProblems[currentProblemIdx].pointsEarned =
          data.data.pointsEarned || 0;
        setProblems(updatedProblems);
        if (data.data.status === "accepted") {
          alert(
            `Success! All test cases passed. You earned ${data.data.pointsEarned} points.`,
          );
        }
      } else {
        setTimeout(() => pollSubmission(submissionId), 2000);
      }
    } catch (err) {
      setSubmitting(false);
      alert("Error polling submission");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );
  if (error || !contest)
    return (
      <div className="min-h-screen flex items-center justify-center text-destructive">
        {error}
      </div>
    );

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="h-14 border-b border-border bg-background px-6 flex items-center justify-between sticky top-0 z-50">
        <div className="flex items-center gap-4">
          <Link
            to="/dashboard"
            className="font-bold tracking-tighter text-lg uppercase"
          >
            CYPHER
          </Link>
          <div className="h-4 w-px bg-border mx-1" />
          <h1 className="text-xs font-mono uppercase text-muted-foreground truncate max-w-50 tracking-widest">
            {contest.title}
          </h1>
        </div>

        <div className="flex items-center gap-8 font-mono text-[10px] uppercase tracking-widest">
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Score</span>
            <span className="font-bold text-foreground">
              {problems.reduce((sum, p) => sum + (p.pointsEarned || 0), 0)}
            </span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-muted-foreground">Progress</span>
            <span className="font-bold text-foreground">
              {problems.filter((p) => p.submitted).length} / {problems.length}
            </span>
          </div>
        </div>
      </div>

      <div className="flex-1 flex overflow-hidden">
        <div className="w-64 border-r border-border bg-background overflow-y-auto hidden lg:block">
          <div className="flex flex-col">
            {problems.map((p, idx) => (
              <button
                key={`${p.type}-${p.id}`}
                onClick={() => {
                  setCurrentProblemIdx(idx);
                  setSelectedOption(null);
                  setSubmissionResult(null);
                  setSubmitting(false);
                }}
                className={`w-full flex items-center justify-between px-6 py-4 text-left transition-colors border-b border-border/50 ${
                  currentProblemIdx === idx
                    ? "bg-foreground text-background"
                    : "hover:bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] uppercase tracking-widest font-mono opacity-70">
                    PROBLEM {String(idx + 1).padStart(2, "0")}
                  </span>
                  <span className="text-xs font-bold uppercase tracking-tight line-clamp-1">
                    {p.title}
                  </span>
                </div>
                {p.submitted && (
                  <span className="text-[10px] font-mono border border-current px-1">
                    ✓
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {}
        <div className="flex-1 overflow-y-auto flex flex-col">
          <div className="p-8 max-w-4xl mx-auto w-full">
            <div className="mb-8">
              <h2 className="text-3xl font-bold mb-6">
                {currentProblem?.title}
              </h2>

              {currentProblem?.type === "mcq" ? (
                <div className="space-y-4">
                  {(currentProblem.data.options as string[]).map(
                    (option, idx) => (
                      <button
                        key={idx}
                        onClick={() => setSelectedOption(idx)}
                        className={`w-full p-4 border text-left transition-all flex items-center justify-between group ${
                          selectedOption === idx
                            ? "border-foreground bg-foreground text-background"
                            : "border-border hover:border-foreground"
                        }`}
                      >
                        <span className="font-mono text-sm uppercase">
                          {option}
                        </span>
                        <div
                          className={`h-4 w-4 border flex items-center justify-center ${
                            selectedOption === idx
                              ? "border-background bg-background"
                              : "border-foreground group-hover:bg-foreground"
                          }`}
                        >
                          {selectedOption === idx && (
                            <div className="h-2 w-2 bg-foreground" />
                          )}
                        </div>
                      </button>
                    ),
                  )}

                  <div className="pt-6">
                    {currentProblem.submitted && (
                      <div className="mb-4 p-4 border border-border bg-muted/50 text-xs font-mono uppercase">
                        {currentProblem.pointsEarned ? "PASSED" : "FAILED"} —{" "}
                        {currentProblem.pointsEarned || 0}/
                        {currentProblem.points} PTS
                      </div>
                    )}
                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors uppercase text-xs font-bold tracking-[0.2em]"
                      onClick={handleMcqSubmit}
                      disabled={
                        selectedOption === null ||
                        submitting ||
                        currentProblem.submitted
                      }
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Confirm Selection"
                      )}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-muted p-6 rounded-2xl border border-border">
                    <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                      {currentProblem?.data.description}
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b border-border pb-4">
                      <h3 className="text-xs font-mono uppercase tracking-[0.2em] font-bold">
                        Implementation
                      </h3>
                      <select
                        value={language}
                        onChange={(e) => setLanguage(e.target.value)}
                        className="bg-background border border-border px-3 py-1 text-xs font-mono uppercase outline-none focus:border-foreground"
                      >
                        <option value="javascript">JavaScript</option>
                        <option value="python">Python</option>
                        <option value="cpp">C++</option>
                        <option value="java">Java</option>
                      </select>
                    </div>

                    <div className="h-112.5 border border-border bg-[#1e1e1e]">
                      <Editor
                        key={`${currentProblem.id}-${language}`}
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        defaultValue={currentCode}
                        onChange={handleCodeChange}
                        options={{
                          minimap: { enabled: false },
                          fontSize: 13,
                          fontFamily:
                            "ia-writer-mono, JetBrains Mono, monospace",
                          padding: { top: 20 },
                          scrollBeyondLastLine: false,
                          automaticLayout: true,
                          cursorBlinking: "solid",
                        }}
                      />
                    </div>

                    {submissionResult && (
                      <div className="fixed inset-0 bg-background/95 z-50 flex items-center justify-center p-6">
                        <div className="w-full max-w-sm border border-border p-8 bg-background">
                          <div className="space-y-6">
                            <div className="space-y-2">
                              <h2 className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                                Result
                              </h2>
                              <p className="text-xl font-bold tracking-tight uppercase">
                                {submissionResult.status.replace(/_/g, " ")}
                              </p>
                            </div>

                            <div className="py-4 border-y border-border space-y-4">
                              <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                                <span>Test Cases</span>
                                <span>
                                  {submissionResult.testCasesPassed} /{" "}
                                  {submissionResult.totalTestCases}
                                </span>
                              </div>
                              <div className="flex justify-between items-center text-[10px] font-mono uppercase">
                                <span>Points</span>
                                <span>
                                  {submissionResult.pointsEarned || 0} /{" "}
                                  {currentProblem?.points}
                                </span>
                              </div>
                            </div>

                            <Button
                              variant="outline"
                              className="w-full h-10 border-foreground hover:bg-foreground hover:text-background text-xs font-bold uppercase transition-all"
                              onClick={() => setSubmissionResult(null)}
                            >
                              Continue
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="outline"
                      className="w-full h-12 rounded-none border-foreground hover:bg-foreground hover:text-background transition-colors uppercase text-xs font-bold tracking-[0.2em]"
                      onClick={handleDsaSubmit}
                      disabled={!currentCode.trim() || submitting}
                    >
                      {submitting ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Run Tests"
                      )}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
