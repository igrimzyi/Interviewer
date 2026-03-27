import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import LoggedInNavbar from "../components/LoggedInNavbar";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Users,
  FileCode,
  Calendar,
  Clock,
  ChevronRight,
} from "lucide-react";

/* ===============================
   TYPES
================================= */

type InterviewStatus = "scheduled" | "active" | "completed" | "cancelled";

interface SessionInterviewee {
  firstName: string;
  lastName: string;
  email: string;
}

interface ApiSession {
  id: string;
  sessionCode: string;
  title: string;
  status: InterviewStatus;
  scheduledAt: string | null;
  updatedAt: string;
  interviewee: SessionInterviewee | null;
  question?: {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    category: string;
  } | null;
}

interface ApiActivity {
  type: "scheduled" | "completed" | "user";
  text: string;
  time: string;
  sessionId: string;
}

/* ===============================
   HELPERS
================================= */

function formatDate(iso: string | null): string {
  if (!iso) return "TBD";
  const d = new Date(iso);
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const target = new Date(d.getFullYear(), d.getMonth(), d.getDate());

  if (target.getTime() === today.getTime()) return "Today";
  if (target.getTime() === tomorrow.getTime()) return "Tomorrow";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

function formatTime(iso: string | null): string {
  if (!iso) return "TBD";
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatRelativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins} minute${mins !== 1 ? "s" : ""} ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs !== 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? "s" : ""} ago`;
}

/* ===============================
   COLORS
================================= */

const colors = {
  black: "#0F172B",
  blue: "#155DFC",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
};

/* ===============================
   COMPONENT
================================= */

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const [sessions, setSessions] = useState<ApiSession[]>([]);
  const [activities, setActivities] = useState<ApiActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [sessionsRes, activityRes] = await Promise.all([
          fetch("/api/sessions", { headers }),
          fetch("/api/activity", { headers }),
        ]);

        if (!sessionsRes.ok || !activityRes.ok) {
          setError("Failed to load dashboard data.");
          return;
        }

        const [sessionsData, activityData] = await Promise.all([
          sessionsRes.json(),
          activityRes.json(),
        ]);

        setSessions(sessionsData);
        setActivities(activityData);
      } catch {
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [token]);

  const upcomingSessions = sessions.filter(
    (s) => s.status === "scheduled" || s.status === "active"
  );

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
        <h1
          style={{
            fontSize: "clamp(24px, 5vw, 34px)",
            fontWeight: 500,
            color: colors.black,
          }}
        >
          Welcome back, {user?.firstName ?? ""}
        </h1>

        <p style={{ color: "#64748B", marginTop: 6 }}>
          Here&apos;s what&apos;s happening with your interviews today.
        </p>

        {loading ? (
          <p style={{ marginTop: 30 }}>Loading dashboard...</p>
        ) : error ? (
          <p style={{ marginTop: 30, color: "#B91C1C" }}>{error}</p>
        ) : (
          <>
            {/* ACTION CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
                gap: 20,
                marginTop: 32,
              }}
            >
              {[
                { title: "New Interview", subtitle: "Schedule session", icon: <Plus size={20} />, color: "#2563EB", route: "/session/create" },
                { title: "Invite Team", subtitle: "Add interviewers", icon: <Users size={20} />, color: "#7C3AED" },
                { title: "Question Bank", subtitle: "Browse questions", icon: <FileCode size={20} />, color: "#16A34A", route: "/questions" },
                { title: "Calendar", subtitle: "View schedule", icon: <Calendar size={20} />, color: "#EA580C" },
              ].map((card, i) => (
                <div
                  key={i}
                  onClick={() => { if (card.route) navigate(card.route); }}
                  style={{
                    background: "white",
                    padding: 20,
                    borderRadius: 16,
                    border: `1px solid ${colors.lightGray}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    boxShadow: "0 2px 6px rgba(15,23,43,0.04)",
                    cursor: card.route ? "pointer" : "default",
                  }}
                >
                  <div
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 12,
                      background: card.color,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "white",
                    }}
                  >
                    {card.icon}
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{card.title}</div>
                    <div style={{ fontSize: 14, color: "#64748B" }}>{card.subtitle}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* MAIN GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                gap: 24,
                marginTop: 40,
              }}
            >
              {/* UPCOMING INTERVIEWS */}
              <div
                style={{
                  background: "white",
                  padding: 24,
                  borderRadius: 18,
                  border: `1px solid ${colors.lightGray}`,
                  boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 20 }}>Upcoming Interviews</h3>
                <p style={{ color: "#64748B", marginBottom: 20 }}>Your scheduled interview sessions</p>

                {upcomingSessions.length === 0 ? (
                  <p style={{ color: "#64748B", fontSize: 14 }}>No upcoming sessions.</p>
                ) : (
                  upcomingSessions.map((session) => (
                    <div
                      key={session.id}
                      style={{
                        border: `1px solid ${colors.lightGray}`,
                        borderRadius: 14,
                        padding: 18,
                        marginBottom: 16,
                        display: "flex",
                        flexDirection: "column",
                        gap: 12,
                      }}
                    >
                      <div style={{ display: "flex", gap: 16 }}>
                        <div
                          style={{
                            width: 40,
                            height: 40,
                            borderRadius: 10,
                            background: "#F1F5F9",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <FileCode size={18} strokeWidth={1.8} />
                        </div>

                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 500 }}>
                            {session.title}
                            <span
                              style={{
                                marginLeft: 10,
                                fontSize: 12,
                                padding: "4px 8px",
                                borderRadius: 20,
                                background: session.status === "scheduled" ? "#DBEAFE" : "#E2E8F0",
                                color: session.status === "scheduled" ? colors.blue : colors.charcoal,
                              }}
                            >
                              {session.status}
                            </span>
                          </div>

                          <div style={{ fontSize: 14, color: "#64748B" }}>
                            Candidate:{" "}
                            {session.interviewee
                              ? `${session.interviewee.firstName} ${session.interviewee.lastName}`
                              : "TBD"}
                          </div>

                          <div style={{ fontSize: 14, color: "#64748B", marginTop: 4 }}>
                            Question: {session.question?.title ?? "No question selected"}
                          </div>

                          <div
                            style={{
                              fontSize: 13,
                              color: "#64748B",
                              display: "flex",
                              flexWrap: "wrap",
                              gap: 12,
                              marginTop: 4,
                            }}
                          >
                            <span style={{ display: "flex", gap: 4 }}>
                              <Calendar size={14} />
                              {formatDate(session.scheduledAt)}
                            </span>
                            <span style={{ display: "flex", gap: 4 }}>
                              <Clock size={14} />
                              {formatTime(session.scheduledAt)}
                            </span>
                            <span>ID: {session.sessionCode}</span>
                          </div>
                        </div>
                      </div>

                      <div
                        style={{
                          alignSelf: "flex-end",
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => navigate(`/editor/${session.sessionCode}`)}
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: 8,
                            padding: "10px 14px",
                            borderRadius: 10,
                            border: "none",
                            background: colors.blue,
                            color: "#FFFFFF",
                            fontSize: 14,
                            fontWeight: 500,
                            cursor: "pointer",
                          }}
                        >
                          Join Session
                          <ChevronRight size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}

                <button
                  style={{
                    width: "100%",
                    padding: "14px",
                    borderRadius: 14,
                    border: `1px solid ${colors.lightGray}`,
                    background: "#F8FAFC",
                    fontWeight: 500,
                    cursor: "pointer",
                    marginTop: 8,
                  }}
                >
                  View All Interviews
                </button>
              </div>

              {/* RECENT ACTIVITY */}
              <div
                style={{
                  background: "white",
                  padding: 24,
                  borderRadius: 18,
                  border: `1px solid ${colors.lightGray}`,
                  boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 20 }}>Recent Activity</h3>
                <p style={{ color: "#64748B", marginBottom: 24 }}>Latest updates</p>

                {activities.length === 0 ? (
                  <p style={{ color: "#64748B", fontSize: 14 }}>No recent activity.</p>
                ) : (
                  activities.map((activity, index) => {
                    const icon =
                      activity.type === "scheduled" ? (
                        <Calendar size={16} />
                      ) : activity.type === "user" ? (
                        <Users size={16} />
                      ) : (
                        <FileCode size={16} />
                      );

                    return (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          gap: 12,
                          paddingBottom: 18,
                          marginBottom: 18,
                          borderBottom:
                            index !== activities.length - 1
                              ? `1px solid ${colors.lightGray}`
                              : "none",
                        }}
                      >
                        <div
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: "50%",
                            background: "#DBEAFE",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#2563EB",
                            flexShrink: 0,
                          }}
                        >
                          {icon}
                        </div>

                        <div>
                          <div style={{ fontSize: 14 }}>{activity.text}</div>
                          <div style={{ fontSize: 13, color: "#64748B", marginTop: 4 }}>
                            {formatRelativeTime(activity.time)}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
