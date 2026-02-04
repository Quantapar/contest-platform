import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "../components/ui/Button";
import {
  Plus,
  Trash2,
  LayoutDashboard,
  ArrowLeft,
  HelpCircle,
  Code2,
  Loader2,
} from "lucide-react";

export function ManageContestPage() {
  const { contestId } = useParams();
  const navigate = useNavigate();
  const [contest, setContest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"mcq" | "dsa">("mcq");

  const [mcqForm, setMcqForm] = useState({
    questionText: "",
    options: ["", "", "", ""],
    correctOptionIndex: 0,
    points: 10,
  });

  const [dsaForm, setDsaForm] = useState({
    title: "",
    description: "",
    tags: "",
    points: 100,
    timeLimit: 2000,
    memoryLimit: 256,
    testCases: [{ input: "", expectedOutput: "", isHidden: false }],
  });

  const fetchContest = async () => {
    try {
      const res = await fetch(
        `http://localhost:3000/api/contests/${contestId}`,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      const data = await res.json();
      if (data.success) {
        setContest(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContest();
  }, [contestId]);

  const handleCreateMcq = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch(
        `http://localhost:3000/api/contests/${contestId}/mcq`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify(mcqForm),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert("MCQ added successfully!");
        setMcqForm({
          questionText: "",
          options: ["", "", "", ""],
          correctOptionIndex: 0,
          points: 10,
        });
        fetchContest();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error adding MCQ");
    }
  };

  const handleCreateDsa = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const tagsArray = dsaForm.tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t);
      const res = await fetch(
        `http://localhost:3000/api/contests/${contestId}/dsa`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            ...dsaForm,
            tags: tagsArray,
          }),
        },
      );
      const data = await res.json();
      if (data.success) {
        alert("DSA Problem added successfully!");
        setDsaForm({
          title: "",
          description: "",
          tags: "",
          points: 100,
          timeLimit: 2000,
          memoryLimit: 256,
          testCases: [{ input: "", expectedOutput: "", isHidden: false }],
        });
        fetchContest();
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert("Error adding DSA problem");
    }
  };

  const handleDeleteMcq = async (mcqId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this MCQ? This will also delete all submissions for this question.",
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/contests/${contestId}/mcq/${mcqId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if ((await res.json()).success) {
        fetchContest();
      }
    } catch (err) {
      alert("Error deleting MCQ");
    }
  };

  const handleDeleteDsa = async (dsaId: number) => {
    if (
      !confirm(
        "Are you sure you want to delete this problem? This will also delete all test cases and submissions.",
      )
    )
      return;
    try {
      const res = await fetch(
        `http://localhost:3000/api/contests/${contestId}/dsa/${dsaId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        },
      );
      if ((await res.json()).success) {
        fetchContest();
      }
    } catch (err) {
      alert("Error deleting problem");
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="min-h-screen bg-background pt-24 pb-12 px-6">
      <div className="container mx-auto max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate(-1)}>
              <ArrowLeft className="h-4 w-4 mr-2" /> Back
            </Button>
            <h1 className="text-3xl font-bold">{contest?.title}</h1>
          </div>
          <Button
            onClick={() => navigate(`/contests/${contestId}/arena`)}
            variant="outline"
          >
            View as Participant
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <LayoutDashboard className="h-5 w-5 text-primary" />
                Contest Content
              </h2>
              <div className="space-y-3">
                <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest mt-4">
                  MCQs ({contest?.mcqs?.length})
                </div>
                {contest?.mcqs?.map((m: any) => (
                  <div
                    key={m.id}
                    className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl text-sm border border-border group hover:border-primary/50 transition-colors"
                  >
                    <span className="truncate flex-1">{m.questionText}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                        {m.points}p
                      </span>
                      <button
                        onClick={() => handleDeleteMcq(m.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="text-xs font-bold uppercase text-muted-foreground tracking-widest mt-6">
                  DSA ({contest?.dsaProblems?.length})
                </div>
                {contest?.dsaProblems?.map((d: any) => (
                  <div
                    key={d.id}
                    className="flex items-center justify-between p-3 bg-secondary/20 rounded-xl text-sm border border-border group hover:border-primary/50 transition-colors"
                  >
                    <span className="truncate flex-1">{d.title}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-primary font-bold bg-primary/10 px-1.5 py-0.5 rounded">
                        {d.points}p
                      </span>
                      <button
                        onClick={() => handleDeleteDsa(d.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-card border border-border rounded-2xl p-1 flex mb-6">
              <button
                onClick={() => setActiveTab("mcq")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === "mcq"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-secondary/50 text-muted-foreground"
                }`}
              >
                <HelpCircle className="h-4 w-4" /> Add MCQ
              </button>
              <button
                onClick={() => setActiveTab("dsa")}
                className={`flex-1 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                  activeTab === "dsa"
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "hover:bg-secondary/50 text-muted-foreground"
                }`}
              >
                <Code2 className="h-4 w-4" /> Add DSA Problem
              </button>
            </div>

            {activeTab === "mcq" ? (
              <form
                onSubmit={handleCreateMcq}
                className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6"
              >
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> New Multiple Choice
                  Question
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Question Text
                    </label>
                    <textarea
                      required
                      className="w-full mt-1.5 bg-secondary/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary min-h-25"
                      value={mcqForm.questionText}
                      onChange={(e) =>
                        setMcqForm({ ...mcqForm, questionText: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {mcqForm.options.map((_, i) => (
                      <div key={i}>
                        <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                          Option {i + 1}
                        </label>
                        <div className="flex items-center gap-2 mt-1.5">
                          <input
                            required
                            className="flex-1 bg-secondary/20 border border-border rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                            value={mcqForm.options[i]}
                            onChange={(e) => {
                              const newOpts = [...mcqForm.options];
                              newOpts[i] = e.target.value;
                              setMcqForm({ ...mcqForm, options: newOpts });
                            }}
                          />
                          <input
                            type="radio"
                            name="correct"
                            checked={mcqForm.correctOptionIndex === i}
                            onChange={() =>
                              setMcqForm({ ...mcqForm, correctOptionIndex: i })
                            }
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="pt-4">
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Points
                    </label>
                    <input
                      type="number"
                      className="w-full mt-1.5 bg-secondary/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={mcqForm.points}
                      onChange={(e) =>
                        setMcqForm({
                          ...mcqForm,
                          points: parseInt(e.target.value),
                        })
                      }
                    />
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl">
                  Add Question
                </Button>
              </form>
            ) : (
              <form
                onSubmit={handleCreateDsa}
                className="bg-card border border-border rounded-2xl p-8 shadow-sm space-y-6"
              >
                <h3 className="text-xl font-bold flex items-center gap-2">
                  <Plus className="h-5 w-5 text-primary" /> New DSA Problem
                </h3>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Problem Title
                    </label>
                    <input
                      required
                      className="w-full mt-1.5 bg-secondary/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                      value={dsaForm.title}
                      onChange={(e) =>
                        setDsaForm({ ...dsaForm, title: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                      Description (Markdown supported)
                    </label>
                    <textarea
                      required
                      className="w-full mt-1.5 bg-secondary/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary min-h-37.5"
                      value={dsaForm.description}
                      onChange={(e) =>
                        setDsaForm({ ...dsaForm, description: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                        Points
                      </label>
                      <input
                        type="number"
                        className="w-full mt-1.5 bg-secondary/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                        value={dsaForm.points}
                        onChange={(e) =>
                          setDsaForm({
                            ...dsaForm,
                            points: parseInt(e.target.value),
                          })
                        }
                      />
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                        Tags (comma separated)
                      </label>
                      <input
                        className="w-full mt-1.5 bg-secondary/20 border border-border rounded-xl px-4 py-3 focus:outline-none focus:ring-1 focus:ring-primary"
                        placeholder="Arrays, Strings, Dynamic Programming"
                        value={dsaForm.tags}
                        onChange={(e) =>
                          setDsaForm({ ...dsaForm, tags: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-4 pt-4">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold uppercase text-muted-foreground ml-1">
                        Test Cases
                      </label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setDsaForm({
                            ...dsaForm,
                            testCases: [
                              ...dsaForm.testCases,
                              {
                                input: "",
                                expectedOutput: "",
                                isHidden: false,
                              },
                            ],
                          })
                        }
                      >
                        <Plus className="h-4 w-4 mr-1" /> Add Test Case
                      </Button>
                    </div>

                    {dsaForm.testCases.map((tc, i) => (
                      <div
                        key={i}
                        className="p-4 border border-border rounded-xl space-y-3 relative group"
                      >
                        <button
                          type="button"
                          onClick={() => {
                            const newTc = dsaForm.testCases.filter(
                              (_, idx) => idx !== i,
                            );
                            setDsaForm({ ...dsaForm, testCases: newTc });
                          }}
                          className="absolute right-2 top-2 text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">
                              Input
                            </label>
                            <input
                              required
                              className="w-full mt-1 bg-secondary/10 border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                              value={tc.input}
                              onChange={(e) => {
                                const newTc = [...dsaForm.testCases];
                                newTc[i].input = e.target.value;
                                setDsaForm({ ...dsaForm, testCases: newTc });
                              }}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] font-bold uppercase text-muted-foreground">
                              Expected Output
                            </label>
                            <input
                              required
                              className="w-full mt-1 bg-secondary/10 border border-border rounded-lg px-3 py-1.5 text-xs focus:ring-1 focus:ring-primary outline-none"
                              value={tc.expectedOutput}
                              onChange={(e) => {
                                const newTc = [...dsaForm.testCases];
                                newTc[i].expectedOutput = e.target.value;
                                setDsaForm({ ...dsaForm, testCases: newTc });
                              }}
                            />
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={tc.isHidden}
                            onChange={(e) => {
                              const newTc = [...dsaForm.testCases];
                              newTc[i].isHidden = e.target.checked;
                              setDsaForm({ ...dsaForm, testCases: newTc });
                            }}
                          />
                          <label className="text-[10px] font-bold uppercase text-muted-foreground">
                            Hidden Testcase
                          </label>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Button type="submit" className="w-full h-12 rounded-xl">
                  Create Problem
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
