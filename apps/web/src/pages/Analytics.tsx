import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoggedInNavbar from "../components/LoggedInNavbar";
import { useAuth } from "../context/AuthContext";
import {
  BarChart2,
  Clock,
  CheckCircle,
  TrendingUp,
  FileCode,
  ChevronLeft,
  X,
} from "lucide-react";

/* ===============================
   TYPES
================================= */

interface OverviewStats {
  total: number;
  completed: number;
  active: number;
  scheduled: number;
  cancelled: number;
  completionRate: number;
  avgDurationMinutes: number | null;
}

interface DifficultyBreakdown {
  easy: { total: number; completed: number };
  medium: { total: number; completed: number };
  hard: { total: number; completed: number };
}

interface QuestionStat {
  questionId: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  sessionCount: number;
  completedCount: number;
  avgDurationMinutes: number | null;
}

interface CompletedSession {
  id: string;
  sessionCode: string;
  title: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  durationMinutes: number | null;
  selectedLanguage: string;
  submittedCode: string | null;
  question: {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
  } | null;
  interviewee: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface AnalyticsData {
  overview: OverviewStats;
  byDifficulty: DifficultyBreakdown;
  byQuestion: QuestionStat[];
  completedSessions: CompletedSession[];
}

/* ===============================
   CONSTANTS
================================= */

const colors = {
  black: "#0F172B",
  blue: "#155DFC",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
};

const difficultyColor: Record<string, { bg: string; text: string; bar: string }> = {
  easy: { bg: "#DCFCE7", text: "#15803D", bar: "#22C55E" },
  medium: { bg: "#FEF9C3", text: "#A16207", bar: "#EAB308" },
  hard: { bg: "#FEE2E2", text: "#B91C1C", bar: "#EF4444" },
};

/* ===============================
   HELPERS
================================= */

function formatDuration(mins: number | null): string {
  if (mins === null) return "—";
  if (mins < 60) return `${mins}m`;
  return `${Math.floor(mins / 60)}h ${mins % 60}m`;
}

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/* ===============================
   SUB-COMPONENTS
================================= */

function StatCard({
  icon,
  label,
  value,
  sub,
  iconColor,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconColor: string;
}) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: 16,
        border: `1px solid ${colors.lightGray}`,
        padding: "20px 24px",
        boxShadow: "0 2px 6px rgba(15,23,43,0.04)",
        display: "flex",
        alignItems: "center",
        gap: 16,
      }}
    >
      <div
        style={{
          width: 48,
          height: 48,
          borderRadius: 14,
          background: iconColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: "#64748B" }}>{label}</div>
        <div style={{ fontSize: 26, fontWeight: 600, color: colors.black, lineHeight: 1.2 }}>
          {value}
        </div>
        {sub && <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function DifficultyBar({
  label,
  total,
  completed,
  maxTotal,
  style: diffStyle,
}: {
  label: string;
  total: number;
  completed: number;
  maxTotal: number;
  style: { bg: string; text: string; bar: string };
}) {
  const widthPct = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
  const completedPct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div style={{ marginBottom: 20 }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 8,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span
            style={{
              padding: "3px 10px",
              borderRadius: 20,
              background: diffStyle.bg,
              color: diffStyle.text,
              fontSize: 12,
              fontWeight: 500,
            }}
          >
            {label}
          </span>
          <span style={{ fontSize: 13, color: colors.charcoal }}>
            {completed}/{total} completed
          </span>
        </div>
        <span style={{ fontSize: 13, fontWeight: 500, color: colors.black }}>
          {total > 0 ? `${Math.round(completedPct)}%` : "—"}
        </span>
      </div>
      <div
        style={{
          height: 10,
          borderRadius: 99,
          background: "#F1F5F9",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            height: "100%",
            width: `${widthPct}%`,
            background: "#E2E8F0",
            borderRadius: 99,
            position: "relative",
            overflow: "hidden",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${completedPct}%`,
              background: diffStyle.bar,
              borderRadius: 99,
              transition: "width 0.6s ease",
            }}
          />
        </div>
      </div>
    </div>
  );
}

/* ===============================
   MAIN COMPONENT
================================= */

const Analytics: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<"date" | "duration" | "difficulty">("date");
  const [filterQuestion, setFilterQuestion] = useState<string>("all");
  const [viewCodeSession, setViewCodeSession] = useState<CompletedSession | null>(null);

  useEffect(() => {
    if (user?.role !== "interviewer") {
      navigate("/dashboard");
      return;
    }

    async function load() {
      try {
        const res = await fetch("/api/analytics", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) {
          setError("Failed to load analytics.");
          return;
        }
        setData(await res.json());
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token, user, navigate]);

  const sortedSessions = React.useMemo(() => {
    if (!data) return [];
    let sessions = [...data.completedSessions];

    if (filterQuestion !== "all") {
      sessions = sessions.filter((s) => s.question?.id === filterQuestion);
    }

    switch (sortField) {
      case "duration":
        sessions.sort((a, b) => (a.durationMinutes ?? 999) - (b.durationMinutes ?? 999));
        break;
      case "difficulty": {
        const order = { easy: 0, medium: 1, hard: 2 };
        sessions.sort(
          (a, b) =>
            (order[a.question?.difficulty ?? "easy"] ?? 0) -
            (order[b.question?.difficulty ?? "easy"] ?? 0)
        );
        break;
      }
      default:
        sessions.sort(
          (a, b) =>
            new Date(b.scheduledAt ?? 0).getTime() - new Date(a.scheduledAt ?? 0).getTime()
        );
    }

    return sessions;
  }, [data, sortField, filterQuestion]);

  const maxDiffTotal = data
    ? Math.max(
        data.byDifficulty.easy.total,
        data.byDifficulty.medium.total,
        data.byDifficulty.hard.total,
        1
      )
    : 1;

  return (
    <div
      style={{
        background: "#F8FAFC",
        minHeight: "100vh",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <LoggedInNavbar />

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          padding: "40px 20px",
        }}
      >
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 4 }}>
          <button
            onClick={() => navigate("/dashboard")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "none",
              border: "none",
              color: "#64748B",
              cursor: "pointer",
              fontSize: 14,
              padding: 0,
            }}
          >
            <ChevronLeft size={16} />
            Dashboard
          </button>
        </div>

        <h1
          style={{
            fontSize: "clamp(22px, 4vw, 32px)",
            fontWeight: 500,
            color: colors.black,
            marginTop: 8,
          }}
        >
          Interview Analytics
        </h1>
        <p style={{ color: "#64748B", marginTop: 6 }}>
          Compare and review all interviews you have conducted.
        </p>

        {loading ? (
          <p style={{ marginTop: 30 }}>Loading analytics...</p>
        ) : error ? (
          <p style={{ marginTop: 30, color: "#B91C1C" }}>{error}</p>
        ) : data ? (
          <>
            {/* STAT CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: 16,
                marginTop: 32,
              }}
            >
              <StatCard
                icon={<BarChart2 size={22} />}
                label="Total Interviews"
                value={data.overview.total}
                iconColor="#2563EB"
              />
              <StatCard
                icon={<CheckCircle size={22} />}
                label="Completed"
                value={data.overview.completed}
                sub={`${data.overview.completionRate}% completion rate`}
                iconColor="#16A34A"
              />
              <StatCard
                icon={<Clock size={22} />}
                label="Avg Duration"
                value={formatDuration(data.overview.avgDurationMinutes)}
                sub="across completed sessions"
                iconColor="#7C3AED"
              />
              <StatCard
                icon={<TrendingUp size={22} />}
                label="In Progress / Upcoming"
                value={data.overview.active + data.overview.scheduled}
                sub={`${data.overview.active} active · ${data.overview.scheduled} scheduled`}
                iconColor="#EA580C"
              />
            </div>

            {/* MID ROW: difficulty + by question */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
                gap: 24,
                marginTop: 32,
              }}
            >
              {/* DIFFICULTY BREAKDOWN */}
              <div
                style={{
                  background: "white",
                  borderRadius: 18,
                  border: `1px solid ${colors.lightGray}`,
                  padding: 24,
                  boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 4 }}>
                  Sessions by Difficulty
                </h3>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                  Completion rate per difficulty level
                </p>

                <DifficultyBar
                  label="Easy"
                  total={data.byDifficulty.easy.total}
                  completed={data.byDifficulty.easy.completed}
                  maxTotal={maxDiffTotal}
                  style={difficultyColor.easy}
                />
                <DifficultyBar
                  label="Medium"
                  total={data.byDifficulty.medium.total}
                  completed={data.byDifficulty.medium.completed}
                  maxTotal={maxDiffTotal}
                  style={difficultyColor.medium}
                />
                <DifficultyBar
                  label="Hard"
                  total={data.byDifficulty.hard.total}
                  completed={data.byDifficulty.hard.completed}
                  maxTotal={maxDiffTotal}
                  style={difficultyColor.hard}
                />
              </div>

              {/* BY QUESTION */}
              <div
                style={{
                  background: "white",
                  borderRadius: 18,
                  border: `1px solid ${colors.lightGray}`,
                  padding: 24,
                  boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 4 }}>
                  Per-Question Summary
                </h3>
                <p style={{ color: "#64748B", fontSize: 14, marginBottom: 24 }}>
                  Sessions and avg duration by question
                </p>

                {data.byQuestion.length === 0 ? (
                  <p style={{ color: "#64748B", fontSize: 14 }}>No data yet.</p>
                ) : (
                  data.byQuestion.map((q) => {
                    const ds = difficultyColor[q.difficulty] ?? difficultyColor.easy;
                    return (
                      <div
                        key={q.questionId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 14,
                          padding: "12px 0",
                          borderBottom: `1px solid ${colors.lightGray}`,
                        }}
                      >
                        <div
                          style={{
                            width: 38,
                            height: 38,
                            borderRadius: 10,
                            background: "#F1F5F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0,
                          }}
                        >
                          <FileCode size={16} strokeWidth={1.8} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontWeight: 500,
                              fontSize: 14,
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {q.title}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B", marginTop: 2 }}>
                            {q.category}
                          </div>
                        </div>
                        <div style={{ textAlign: "right", flexShrink: 0 }}>
                          <div
                            style={{
                              padding: "2px 8px",
                              borderRadius: 20,
                              background: ds.bg,
                              color: ds.text,
                              fontSize: 11,
                              fontWeight: 500,
                              marginBottom: 4,
                            }}
                          >
                            {q.difficulty}
                          </div>
                          <div style={{ fontSize: 12, color: "#64748B" }}>
                            {q.completedCount}/{q.sessionCount} done ·{" "}
                            {formatDuration(q.avgDurationMinutes)} avg
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* COMPLETED SESSIONS TABLE */}
            <div
              style={{
                background: "white",
                borderRadius: 18,
                border: `1px solid ${colors.lightGray}`,
                padding: 24,
                boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                marginTop: 32,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  flexWrap: "wrap",
                  gap: 16,
                  marginBottom: 24,
                }}
              >
                <div>
                  <h3 style={{ fontWeight: 500, fontSize: 18, marginBottom: 4 }}>
                    Completed Sessions
                  </h3>
                  <p style={{ color: "#64748B", fontSize: 14 }}>
                    {sortedSessions.length} session{sortedSessions.length !== 1 ? "s" : ""}
                    {filterQuestion !== "all" ? " (filtered)" : ""}
                  </p>
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {/* Filter by question */}
                  <select
                    value={filterQuestion}
                    onChange={(e) => setFilterQuestion(e.target.value)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: `1px solid ${colors.lightGray}`,
                      fontSize: 13,
                      color: colors.black,
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="all">All Questions</option>
                    {data.byQuestion.map((q) => (
                      <option key={q.questionId} value={q.questionId}>
                        {q.title}
                      </option>
                    ))}
                  </select>

                  {/* Sort */}
                  <select
                    value={sortField}
                    onChange={(e) => setSortField(e.target.value as typeof sortField)}
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: `1px solid ${colors.lightGray}`,
                      fontSize: 13,
                      color: colors.black,
                      background: "white",
                      cursor: "pointer",
                    }}
                  >
                    <option value="date">Sort: Most Recent</option>
                    <option value="duration">Sort: Fastest First</option>
                    <option value="difficulty">Sort: Difficulty</option>
                  </select>
                </div>
              </div>

              {sortedSessions.length === 0 ? (
                <p style={{ color: "#64748B", fontSize: 14 }}>No completed sessions yet.</p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                    <thead>
                      <tr>
                        {["Candidate", "Question", "Difficulty", "Language", "Duration", "Date", "Code"].map(
                          (h) => (
                            <th
                              key={h}
                              style={{
                                textAlign: "left",
                                padding: "10px 12px",
                                color: "#64748B",
                                fontWeight: 500,
                                fontSize: 12,
                                borderBottom: `1px solid ${colors.lightGray}`,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {h}
                            </th>
                          )
                        )}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedSessions.map((session) => {
                        const ds = session.question
                          ? difficultyColor[session.question.difficulty] ?? difficultyColor.easy
                          : difficultyColor.easy;
                        return (
                          <tr
                            key={session.id}
                            style={{ borderBottom: `1px solid ${colors.lightGray}` }}
                          >
                            <td style={{ padding: "14px 12px" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div
                                  style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: "50%",
                                    background: colors.blue,
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontSize: 12,
                                    fontWeight: 600,
                                    flexShrink: 0,
                                  }}
                                >
                                  {session.interviewee
                                    ? `${session.interviewee.firstName[0]}${session.interviewee.lastName[0]}`
                                    : "?"}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 500 }}>
                                    {session.interviewee
                                      ? `${session.interviewee.firstName} ${session.interviewee.lastName}`
                                      : "Unknown"}
                                  </div>
                                  <div style={{ fontSize: 12, color: "#64748B" }}>
                                    {session.title}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td style={{ padding: "14px 12px", color: colors.black }}>
                              {session.question?.title ?? "—"}
                            </td>
                            <td style={{ padding: "14px 12px" }}>
                              {session.question ? (
                                <span
                                  style={{
                                    padding: "3px 10px",
                                    borderRadius: 20,
                                    background: ds.bg,
                                    color: ds.text,
                                    fontSize: 12,
                                    fontWeight: 500,
                                  }}
                                >
                                  {session.question.difficulty}
                                </span>
                              ) : (
                                "—"
                              )}
                            </td>
                            <td style={{ padding: "14px 12px", color: colors.charcoal }}>
                              {session.selectedLanguage || "—"}
                            </td>
                            <td style={{ padding: "14px 12px" }}>
                              <span
                                style={{
                                  fontWeight: 500,
                                  color:
                                    session.durationMinutes !== null &&
                                    session.durationMinutes < 30
                                      ? "#15803D"
                                      : colors.black,
                                }}
                              >
                                {formatDuration(session.durationMinutes)}
                              </span>
                            </td>
                            <td
                              style={{
                                padding: "14px 12px",
                                color: colors.charcoal,
                                whiteSpace: "nowrap",
                              }}
                            >
                              {formatDate(session.scheduledAt)}
                            </td>
                            <td style={{ padding: "14px 12px" }}>
                              {session.submittedCode ? (
                                <button
                                  onClick={() => setViewCodeSession(session)}
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: 6,
                                    padding: "6px 12px",
                                    borderRadius: 8,
                                    border: `1px solid ${colors.lightGray}`,
                                    background: "white",
                                    color: colors.blue,
                                    fontSize: 12,
                                    fontWeight: 500,
                                    cursor: "pointer",
                                  }}
                                >
                                  <FileCode size={13} />
                                  View Code
                                </button>
                              ) : (
                                <span style={{ fontSize: 12, color: "#94A3B8" }}>—</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </>
        ) : null}
      </div>

      {/* CODE VIEWER MODAL */}
      {viewCodeSession && (
        <div
          onClick={() => setViewCodeSession(null)}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,43,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1E293B",
              borderRadius: 16,
              width: "100%",
              maxWidth: 760,
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
              boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
            }}
          >
            {/* Modal header */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "16px 20px",
                borderBottom: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <div>
                <div style={{ fontWeight: 500, color: "#F1F5F9", fontSize: 15 }}>
                  {viewCodeSession.interviewee
                    ? `${viewCodeSession.interviewee.firstName} ${viewCodeSession.interviewee.lastName}`
                    : "Unknown"}{" "}
                  — {viewCodeSession.question?.title ?? "Submitted Code"}
                </div>
                <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 3 }}>
                  {viewCodeSession.selectedLanguage} · {formatDate(viewCodeSession.scheduledAt)} ·{" "}
                  {formatDuration(viewCodeSession.durationMinutes)}
                </div>
              </div>
              <button
                onClick={() => setViewCodeSession(null)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#94A3B8",
                  cursor: "pointer",
                  padding: 4,
                  display: "flex",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* Code body */}
            <pre
              style={{
                margin: 0,
                padding: "20px 24px",
                overflowY: "auto",
                flex: 1,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                fontSize: 13,
                lineHeight: 1.7,
                color: "#E2E8F0",
                whiteSpace: "pre",
              }}
            >
              {viewCodeSession.submittedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
