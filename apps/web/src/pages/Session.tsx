import { useEffect, useState } from "react";
import LoggedInNavbar from "../components/LoggedInNavbar";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const colors = {
  black: "#0F172B",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
};

const labelClass = "text-xs font-medium text-[#0F172B]";
const inputClass =
  "mt-1 w-full rounded-md border border-[#E2E8F0] bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#155DFC]/30";

type FormState = {
  candidateName: string;
  candidateEmail: string;
  position: string;
  date: string;
  time: string;
  questionId: string;
  notes: string;
};

type QuestionOption = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  testCaseCount: number;
};

export default function Session() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [form, setForm] = useState<FormState>({
    candidateName: "",
    candidateEmail: "",
    position: "",
    date: "",
    time: "",
    questionId: "",
    notes: "",
  });

  const [questions, setQuestions] = useState<QuestionOption[]>([]);
  const [questionsLoading, setQuestionsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    async function loadQuestions() {
      try {
        const res = await fetch("/api/questions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data.message ?? "Failed to load questions.");
          return;
        }

        setQuestions(data);
      } catch {
        setError("Unable to load questions.");
      } finally {
        setQuestionsLoading(false);
      }
    }

    if (token) {
      loadQuestions();
    }
  }, [token]);

  function set(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError("");
  }

  async function handleSubmit() {
    if (!form.position || !form.date || !form.time || !form.questionId) {
      setError("Position, date, time, and question are required.");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          candidateName: form.candidateName,
          candidateEmail: form.candidateEmail,
          position: form.position,
          date: form.date,
          time: form.time,
          questionId: form.questionId,
          notes: form.notes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message ?? "Failed to create session.");
        return;
      }

      navigate("/dashboard");
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <LoggedInNavbar />

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* BACK */}
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

        {/* HEADER */}
        <h1 style={{ fontSize: 28, fontWeight: 500, color: colors.black }}>
          Create Interview Session
        </h1>

        <p style={{ color: colors.charcoal, marginTop: 6, marginBottom: 24 }}>
          Set up a new interview session and invite your candidate
        </p>

        {/* =========================
            Candidate Information
        ========================= */}
        <div
          style={{
            background: "white",
            border: `1px solid ${colors.lightGray}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <FileText size={16} />
            <span style={{ fontWeight: 500 }}>Candidate Information</span>
          </div>

          <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 14 }}>
            Enter the candidate's details
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
            <div>
              <label className={labelClass}>Full Name</label>
              <input
                className={inputClass}
                placeholder="e.g., Alex Johnson"
                value={form.candidateName}
                onChange={(e) => set("candidateName", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Email Address</label>
              <input
                className={inputClass}
                type="email"
                placeholder="e.g., alex.johnson@email.com"
                value={form.candidateEmail}
                onChange={(e) => set("candidateEmail", e.target.value)}
              />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>Position *</label>
            <select
              className={inputClass}
              value={form.position}
              onChange={(e) => set("position", e.target.value)}
            >
              <option value="">Select position</option>
              <option value="Technical Lead">Technical Lead</option>
              <option value="Project Manager">Project Manager</option>
              <option value="Senior Frontend Engineer">Senior Frontend Engineer</option>
              <option value="Senior Backend Engineer">Senior Backend Engineer</option>
              <option value="Junior Fullstack Engineer">Junior Fullstack Engineer</option>
              <option value="UI/UX Designer">UI/UX Designer</option>
              <option value="DevOps Engineer">DevOps Engineer</option>
              <option value="QA Engineer">QA Engineer</option>
            </select>
          </div>
        </div>

        {/* =========================
            Session Details
        ========================= */}
        <div
          style={{
            background: "white",
            border: `1px solid ${colors.lightGray}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <Calendar size={16} />
            <span style={{ fontWeight: 500 }}>Session Details</span>
          </div>

          <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 14 }}>
            Schedule and configure the interview
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 12 }}>
            <div>
              <label className={labelClass}>Date *</label>
              <input
                type="date"
                className={inputClass}
                value={form.date}
                onChange={(e) => set("date", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Time *</label>
              <input
                type="time"
                className={inputClass}
                value={form.time}
                onChange={(e) => set("time", e.target.value)}
              />
            </div>

            <div>
              <label className={labelClass}>Duration</label>
              <select className={inputClass}>
                <option>60 minutes</option>
              </select>
            </div>
          </div>
        </div>

        {/* =========================
            Question Set
        ========================= */}
        <div
          style={{
            background: "white",
            border: `1px solid ${colors.lightGray}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 10 }}>
            Question Set
          </div>

          <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 14 }}>
            Choose the questions for this interview
          </p>

          {questionsLoading ? (
            <div style={{ color: colors.charcoal, fontSize: 14 }}>Loading questions...</div>
          ) : questions.length === 0 ? (
            <div style={{ color: colors.charcoal, fontSize: 14 }}>
              No questions found yet. Run the question seed script or create a question first.
            </div>
          ) : (
            questions.map((question) => {
              const isSelected = form.questionId === question.id;

              return (
                <button
                  key={question.id}
                  type="button"
                  onClick={() => set("questionId", question.id)}
                  style={{
                    width: "100%",
                    textAlign: "left",
                    border: isSelected ? "1px solid #155DFC" : `1px solid ${colors.lightGray}`,
                    borderRadius: 12,
                    padding: 14,
                    marginBottom: 10,
                    cursor: "pointer",
                    background: isSelected ? "#EFF6FF" : "#FFFFFF",
                    boxShadow: isSelected ? "0 0 0 2px rgba(21,93,252,0.08)" : "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 12,
                      marginBottom: 6,
                    }}
                  >
                    <div style={{ fontWeight: 500 }}>{question.title}</div>
                    <span
                      style={{
                        fontSize: 12,
                        textTransform: "capitalize",
                        padding: "4px 8px",
                        borderRadius: 999,
                        background:
                          question.difficulty === "easy"
                            ? "#DCFCE7"
                            : question.difficulty === "medium"
                              ? "#FEF3C7"
                              : "#FEE2E2",
                        color:
                          question.difficulty === "easy"
                            ? "#166534"
                            : question.difficulty === "medium"
                              ? "#92400E"
                              : "#991B1B",
                      }}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: colors.charcoal, marginBottom: 6 }}>
                    {question.category} • {question.testCaseCount} test cases
                  </div>

                  <div style={{ fontSize: 13, color: "#64748B", lineHeight: 1.5 }}>
                    {question.description}
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* =========================
            Notes
        ========================= */}
        <div
          style={{
            background: "white",
            border: `1px solid ${colors.lightGray}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
          }}
        >
          <div style={{ fontWeight: 500, marginBottom: 10 }}>Additional Notes</div>

          <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 10 }}>
            Optional notes or instructions (optional)
          </p>

          <textarea
            className={inputClass}
            placeholder="Add any special instructions or notes about this interview..."
            rows={3}
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
          />
        </div>

        {error && (
          <p style={{ color: "#B91C1C", fontSize: 14, marginBottom: 12, textAlign: "right" }}>
            {error}
          </p>
        )}

        {/* =========================
            ACTIONS
        ========================= */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={() => navigate("/dashboard")}
            disabled={isSubmitting}
            style={{
              padding: "10px 16px",
              borderRadius: 8,
              border: `1px solid ${colors.lightGray}`,
              background: "white",
              cursor: "pointer",
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
              background: isSubmitting ? "#9CA3AF" : "#0F172B",
              color: "white",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            {isSubmitting ? "Creating..." : "Create Interview Session"}
          </button>
        </div>
      </div>
    </div>
  );
}
