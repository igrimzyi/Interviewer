import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Search, ArrowLeft, FileCode } from "lucide-react";
import LoggedInNavbar from "../components/LoggedInNavbar";
import { useAuth } from "../context/AuthContext";

type QuestionItem = {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  testCaseCount: number;
  suggestedTimeLimitMinutes: number;
};

const colors = {
  black: "#0F172B",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
  blue: "#155DFC",
};

function difficultyStyles(difficulty: QuestionItem["difficulty"]) {
  if (difficulty === "easy") {
    return { background: "#DCFCE7", color: "#166534" };
  }

  if (difficulty === "hard") {
    return { background: "#FEE2E2", color: "#991B1B" };
  }

  return { background: "#FEF3C7", color: "#92400E" };
}

export default function QuestionBank() {
  const navigate = useNavigate();
  const { token } = useAuth();

  const [questions, setQuestions] = useState<QuestionItem[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadQuestions() {
      try {
        const response = await fetch("/api/questions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok) {
          setError(data.message ?? "Failed to load questions.");
          return;
        }

        setQuestions(data);
      } catch {
        setError("Unable to load questions.");
      } finally {
        setLoading(false);
      }
    }

    if (token) {
      loadQuestions();
    }
  }, [token]);

  const filteredQuestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return questions;
    }

    return questions.filter((question) =>
      [question.title, question.category, question.description, question.difficulty]
        .join(" ")
        .toLowerCase()
        .includes(normalizedQuery),
    );
  }, [questions, query]);

  return (
    <div style={{ minHeight: "100vh", background: "#F8FAFC" }}>
      <LoggedInNavbar />

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 20px" }}>
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

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: 16,
            flexWrap: "wrap",
            marginBottom: 24,
          }}
        >
          <div>
            <h1 style={{ margin: 0, fontSize: 30, fontWeight: 600, color: colors.black }}>
              Question Bank
            </h1>
            <p style={{ margin: "8px 0 0", color: "#64748B" }}>
              View, search, and manage your coding interview questions.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/question/create")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "12px 16px",
              borderRadius: 12,
              border: "none",
              background: colors.black,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            <Plus size={16} />
            Create New
          </button>
        </div>

        <div
          style={{
            background: "#FFFFFF",
            border: `1px solid ${colors.lightGray}`,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 12,
              padding: "0 14px",
              background: "#F8FAFC",
            }}
          >
            <Search size={16} color="#64748B" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by title, category, difficulty, or description"
              style={{
                width: "100%",
                height: 46,
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                color: colors.black,
              }}
            />
          </div>
        </div>

        {loading ? (
          <div style={{ color: colors.charcoal }}>Loading questions...</div>
        ) : error ? (
          <div style={{ color: "#B91C1C" }}>{error}</div>
        ) : filteredQuestions.length === 0 ? (
          <div
            style={{
              background: "#FFFFFF",
              border: `1px solid ${colors.lightGray}`,
              borderRadius: 16,
              padding: 24,
              color: colors.charcoal,
            }}
          >
            No questions matched your search.
          </div>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: 18,
            }}
          >
            {filteredQuestions.map((question) => {
              const badge = difficultyStyles(question.difficulty);

              return (
                <div
                  key={question.id}
                  style={{
                    background: "#FFFFFF",
                    border: `1px solid ${colors.lightGray}`,
                    borderRadius: 18,
                    padding: 20,
                    boxShadow: "0 8px 24px rgba(15, 23, 42, 0.04)",
                    display: "flex",
                    flexDirection: "column",
                    gap: 12,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 40,
                          height: 40,
                          borderRadius: 12,
                          background: "#EFF6FF",
                          color: colors.blue,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <FileCode size={18} />
                      </div>
                      <div style={{ fontSize: 18, fontWeight: 600, color: colors.black }}>
                        {question.title}
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: 12,
                        textTransform: "capitalize",
                        padding: "4px 8px",
                        borderRadius: 999,
                        ...badge,
                      }}
                    >
                      {question.difficulty}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: colors.charcoal }}>
                    {question.category} • {question.testCaseCount} test cases • {question.suggestedTimeLimitMinutes} min
                  </div>

                  <div style={{ fontSize: 14, color: "#64748B", lineHeight: 1.6 }}>
                    {question.description}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
