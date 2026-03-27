import { useState } from "react";
import LoggedInNavbar from "../components/LoggedInNavbar";
import { ArrowLeft, FileText} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Style Tokens
const colors = {
  black: "#0F172B",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
};

const labelClass = "text-xs font-medium text-[#0F172B]";
const inputClass =
  "mt-1 w-full rounded-md border border-[#E2E8F0] bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#155DFC]/30";

// Contraints per Task
const difficulty = ["easy", "medium", "hard"] as const;

const categories = [
  "Arrays",
  "Strings",
  "Hash Tables",
  "Linked Lists",
  "Trees",
  "Graphs",
  "Sorting",
  "Searching",
  "Dynamic Programming",
  "Recursion",
  "System Design",
  "Database",
  "API Design",
  "Other",
];

const timeLimits = [15, 30, 45, 60, 90];

type Example = {
  input: string;
  output: string;
  explanation: string;
};

type QuestionState = {
  // Basic Details Tab
  title: string;
  difficulty: string;
  category: string;
  description: string;
  constraints: string;
  timeLimit: number;
  
  //Examples Tab
  examples: Example[];
  

  //Starter Code Tab
  starterCode: { language: string; code: string }[];
};

type Tab = "basic" | "examples" | "starter";

export default function QuestionPage() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [activeTab, setActiveTab] = useState<Tab>("basic");
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  //Question
  const [question, setQuestion] = useState<QuestionState>({
    title: "",
    difficulty: "",
    category: "",
    description: "",
    constraints: "",
    timeLimit: 60,
    examples: [{ input: "", output: "", explanation: "" }],
    starterCode: [{
         language: "JavaScript",
         code: "// Function signature for JavaScript\nfunction solution() {\n  // Your code here\n}",
        }],
});

  // Helper to update top-level
  function set<K extends keyof QuestionState>(field: K, value: QuestionState[K]) {
    setQuestion((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  // Example helpers
  function setExample(index: number, field: keyof Example, value: string) {
    const updated = question.examples.map((ex, i) =>
      i === index ? { ...ex, [field]: value } : ex
    );
    set("examples", updated);
  }

  function addExample() {
    set("examples", [...question.examples, { input: "", output: "", explanation: "" }]);
  }

  function removeExample(index: number) {
    set(
      "examples",
      question.examples.filter((_, i) => i !== index)
    );
  }

  // Submission
  async function handleSubmit() {
    //Asterisk Errors
    if (!question.title.trim()) {
      setError("Question Title is required.");
      setActiveTab("basic");
      return;
    }
    if (!question.difficulty) {
      setError("Difficulty is required.");
      setActiveTab("basic");
      return;
    }
    if (!question.category) {
      setError("Category is required.");
      setActiveTab("basic");
      return;
    }
    if (!question.description.trim()) {
      setError("Problem Description is required.");
      setActiveTab("basic");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(question),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Failed to create question.");
        return;
      }

      navigate("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Tab Style
  function tabStyle(tab: Tab) {
    const isActive = activeTab === tab;
    return {
      flex: 1,
      padding: "10px 0",
      fontSize: 14,
      fontWeight: isActive ? 600 : 400,
      color: isActive ? colors.black : colors.charcoal,
      background: isActive ? "white" : "transparent",
      border: "none",
      borderRadius: 8,
      cursor: "pointer",
      transition: "all 0.15s",
    } as React.CSSProperties;
  }

  // Render
  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <LoggedInNavbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* Back */}
        <div
          onClick={() => navigate("/dashboard")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            cursor: "pointer",
            marginBottom: 16,
            color: colors.charcoal,
            fontSize: 14,
          }}
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </div>

        {/* Header */}
        <h1 style={{ fontSize: 28, fontWeight: 500, color: colors.black }}>
          Create Question
        </h1>
        <p style={{ color: colors.charcoal, marginTop: 6, marginBottom: 24 }}>
          Add a new coding question to your question bank
        </p>

        {/* Tab Bar */}
        <div
          style={{
            display: "flex",
            background: colors.lightGray,
            borderRadius: 10,
            padding: 4,
            marginBottom: 24,
          }}
        >
          <button style={tabStyle("basic")} onClick={() => setActiveTab("basic")}>
            Basic Details
          </button>
          <button style={tabStyle("examples")} onClick={() => setActiveTab("examples")}>
            Examples &amp; Test Cases
          </button>
          <button style={tabStyle("starter")} onClick={() => setActiveTab("starter")}>
            Starter Code
          </button>
        </div>

        {/* Tab1: Basic Details */}
        {activeTab === "basic" && (
          <div
            style={{
              background: "white",
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            {/* Section header */}
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <FileText size={16} />
              <span style={{ fontWeight: 500 }}>Question Information</span>
            </div>
            <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 18 }}>
              Basic details about the question
            </p>

            {/* Question Title */}
            <div style={{ marginBottom: 14 }}>
              <label className={labelClass}>
                Question Title <span style={{ color: "red" }}>*</span>
              </label>
              <input
                className={inputClass}
                placeholder="e.g., Two Sum Problem"
                value={question.title}
                onChange={(e) => set("title", e.target.value)}
                required
              />
            </div>

            {/* Difficulty + Category */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
              <div>
                <label className={labelClass}>
                  Difficulty <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  className={inputClass}
                  value={question.difficulty}
                  onChange={(e) => set("difficulty", e.target.value)}
                  required
                >
                  <option value="">Select difficulty</option>
                  {difficulty.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className={labelClass}>
                  Category <span style={{ color: "red" }}>*</span>
                </label>
                <select
                  className={inputClass}
                  value={question.category}
                  onChange={(e) => set("category", e.target.value)}
                  required
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Problem Description */}
            <div style={{ marginBottom: 6 }}>
              <label className={labelClass}>
                Problem Description <span style={{ color: "red" }}>*</span>
              </label>
              <textarea
                className={inputClass}
                placeholder="Describe the problem in detail. Include what the function should do, input format, output format, etc."
                rows={5}
                value={question.description}
                onChange={(e) => set("description", e.target.value)}
                required
              />
              <p style={{ fontSize: 12, color: colors.charcoal, marginTop: 4 }}>
                Use clear language and provide all necessary context for candidates
              </p>
            </div>

            {/* Constraints */}
            <div style={{ marginBottom: 14, marginTop: 14 }}>
              <label className={labelClass}>Constraints (Optional)</label>
              <textarea
                className={inputClass}
                placeholder={`e.g., 1 ≤ nums.length ≤ 10^4\n-10^9 ≤ nums[i] ≤ 10^9\nTime complexity should be O(n)`}
                rows={3}
                value={question.constraints}
                onChange={(e) => set("constraints", e.target.value)}
              />
            </div>

            {/* Time Limit */}
            <div>
              <label className={labelClass}>Suggested Time Limit (minutes)</label>
              <select
                className={inputClass}
                value={question.timeLimit}
                onChange={(e) => set("timeLimit", Number(e.target.value))}
              >
                {timeLimits.map((t) => (
                  <option key={t} value={t}>{t} Minutes</option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Tab2: Examples & Test Cases */}
        {activeTab === "examples" && (
          <div
            style={{
              background: "white",
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontWeight: 500 }}>Examples &amp; Test Cases</span>
              </div>
              <button
                onClick={addExample}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                  fontSize: 13,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontWeight: 500,
                }}
              >
                + Add Example
              </button>
            </div>
            <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 18 }}>
              Provide examples to help candidates understand the problem
            </p>

            {question.examples.map((ex, i) => (
              <div
                key={i}
                style={{
                  border: `1px solid ${colors.lightGray}`,
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 14,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                  <span style={{ fontWeight: 500, fontSize: 14 }}>Example {i + 1}</span>
                  {question.examples.length > 1 && (
                    <button
                      onClick={() => removeExample(i)}
                      style={{
                        fontSize: 12,
                        color: "#B91C1C",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      Remove
                    </button>
                  )}
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label className={labelClass}>Input</label>
                  <input
                    className={inputClass}
                    placeholder="e.g., nums = [2,7,11,15], target = 9"
                    value={ex.input}
                    onChange={(e) => setExample(i, "input", e.target.value)}
                  />
                </div>

                <div style={{ marginBottom: 10 }}>
                  <label className={labelClass}>Output</label>
                  <input
                    className={inputClass}
                    placeholder="e.g., [0,1]"
                    value={ex.output}
                    onChange={(e) => setExample(i, "output", e.target.value)}
                  />
                </div>

                <div>
                  <label className={labelClass}>Explanation (Optional)</label>
                  <textarea
                    className={inputClass}
                    placeholder="Explain why this is the correct output"
                    rows={2}
                    value={ex.explanation}
                    onChange={(e) => setExample(i, "explanation", e.target.value)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab3: Starter Code */}
        {activeTab === "starter" && (
          <div
            style={{
              background: "white",
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 16,
              padding: 24,
              marginBottom: 20,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span style={{ fontWeight: 500 }}>Starter Code Templates</span>
            </div>
            <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 18 }}>
              Provide an initial code template
            </p>

            <div style={{ marginBottom: 14 }}>
                <label className={labelClass}>Programming Language</label>
                <select
                className={inputClass}
                value={question.starterCode[0].language}
                onChange={(e) =>
              set("starterCode", [{ ...question.starterCode[0], language: e.target.value }])
                }
            >
                <option value="JavaScript">JavaScript</option>
                {/* Additional Languages to be implemented */}
            </select>
            </div>

            <div>
                 <label className={labelClass}>Starter Code</label>
                 <textarea
                    className={inputClass}
                     rows={8}
                     value={question.starterCode[0].code}
                     onChange={(e) =>
                         set("starterCode", [{ ...question.starterCode[0], code: e.target.value }])
                        }
                style={{ fontFamily: "monospace", fontSize: 13 }}
             />
            </div>
          </div>
        )}

        {/* ERROR */}
        {error && (
          <p style={{ color: "#B91C1C", fontSize: 14, marginBottom: 12, textAlign: "right" }}>
            {error}
          </p>
        )}

        {/* Footer */}
        <div
          style={{
            background: "white",
            border: `1px solid ${colors.lightGray}`,
            borderRadius: 16,
            padding: "16px 20px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 13, color: colors.charcoal, display: "flex", alignItems: "center", gap: 6 }}>
            Review your question before saving
          </span>

          <div style={{ display: "flex", gap: 12 }}>
            <button
              onClick={() => navigate("/dashboard")}
              disabled={isSubmitting}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                border: `1px solid ${colors.lightGray}`,
                background: "white",
                cursor: "pointer",
                fontSize: 14,
              }}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              style={{
                padding: "10px 18px",
                borderRadius: 8,
                background: isSubmitting ? "#9CA3AF" : colors.black,
                color: "white",
                border: "none",
                cursor: isSubmitting ? "not-allowed" : "pointer",
                fontSize: 14,
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              {isSubmitting ? "Saving..." : "<> Save Question"}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}