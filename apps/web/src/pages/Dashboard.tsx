import React, { useState, useEffect } from "react";
import Navbar from "../components/Navbar";
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

type InterviewStatus = "scheduled" | "completed";

interface Interview {
  id: string;
  title: string;
  candidate: string;
  date: string;
  time: string;
  status: InterviewStatus;
}

type ActivityType = "scheduled" | "user" | "completed";

interface Activity {
  type: ActivityType;
  text: string;
  time: string;
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
   MOCK DATA
================================= */

const mockInterviews: Interview[] = [
  {
    id: "INT-2024-4872",
    title: "Senior Frontend Engineer Interview",
    candidate: "Shane Shackleford",
    date: "Today",
    time: "2:00 PM",
    status: "scheduled",
  },
  {
    id: "INT-2024-4873",
    title: "Backend Developer Assessment",
    candidate: "Benjamin Harrity",
    date: "Tomorrow",
    time: "10:30 AM",
    status: "scheduled",
  },
  {
    id: "INT-2024-4871",
    title: "Full Stack Interview",
    candidate: "Abhinay Goud Adhire",
    date: "Feb 20",
    time: "3:00 PM",
    status: "completed",
  },
];

const mockActivities: Activity[] = [
  {
    type: "scheduled",
    text: "Interview with Alex Johnson scheduled",
    time: "2 hours ago",
  },
  {
    type: "user",
    text: "Arthur Smith joined your organization",
    time: "5 hours ago",
  },
  {
    type: "completed",
    text: "Session completed with David Gallo",
    time: "1 day ago",
  },
];

/* ===============================
   COMPONENT
================================= */

const Dashboard: React.FC = () => {
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setInterviews(mockInterviews);
      setActivities(mockActivities);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "Inter, sans-serif" }}>
      <Navbar />

      <div style={{ maxWidth: 1400, margin: "0 auto", padding: "40px 48px" }}>
        <h1 style={{ fontSize: 34, fontWeight: 500, color: colors.black }}>
          Welcome back, Isaiah
        </h1>

        <p style={{ color: "#64748B", marginTop: 6 }}>
          Here's what's happening with your interviews today.
        </p>

        {loading ? (
          <p style={{ marginTop: 30 }}>Loading dashboard...</p>
        ) : (
          <>
            {/* ACTION CARDS */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: 24,
                marginTop: 32,
              }}
            >
              {[
                { title: "New Interview", subtitle: "Schedule session", icon: <Plus size={20} />, color: "#2563EB" },
                { title: "Invite Team", subtitle: "Add interviewers", icon: <Users size={20} />, color: "#7C3AED" },
                { title: "Question Bank", subtitle: "Browse questions", icon: <FileCode size={20} />, color: "#16A34A" },
                { title: "Calendar", subtitle: "View schedule", icon: <Calendar size={20} />, color: "#EA580C" },
              ].map((card, i) => (
                <div
                  key={i}
                  style={{
                    background: "white",
                    padding: 24,
                    borderRadius: 16,
                    border: `1px solid ${colors.lightGray}`,
                    display: "flex",
                    alignItems: "center",
                    gap: 16,
                    boxShadow: "0 2px 6px rgba(15,23,43,0.04)",
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
                    <div style={{ fontSize: 14, color: "#64748B" }}>
                      {card.subtitle}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* MAIN GRID */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr",
                gap: 28,
                marginTop: 40,
              }}
            >
              {/* UPCOMING INTERVIEWS */}
              <div
                style={{
                  background: "white",
                  padding: 28,
                  borderRadius: 18,
                  border: `1px solid ${colors.lightGray}`,
                  boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 20 }}>
                  Upcoming Interviews
                </h3>

                <p style={{ color: "#64748B", marginBottom: 20 }}>
                  Your scheduled interview sessions
                </p>

                {interviews.map((interview) => (
                  <div
                    key={interview.id}
                    style={{
                      border: `1px solid ${colors.lightGray}`,
                      borderRadius: 14,
                      padding: 20,
                      marginBottom: 16,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
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

                      <div>
                        <div style={{ fontWeight: 500 }}>
                          {interview.title}
                          <span
                            style={{
                              marginLeft: 12,
                              fontSize: 12,
                              padding: "5px 10px",
                              borderRadius: 20,
                              background:
                                interview.status === "scheduled"
                                  ? "#DBEAFE"
                                  : "#E2E8F0",
                              color:
                                interview.status === "scheduled"
                                  ? colors.blue
                                  : colors.charcoal,
                            }}
                          >
                            {interview.status}
                          </span>
                        </div>

                        <div style={{ fontSize: 14, color: "#64748B" }}>
                          Candidate: {interview.candidate}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748B",
                            display: "flex",
                            gap: 14,
                            marginTop: 4,
                          }}
                        >
                          <span style={{ display: "flex", gap: 4 }}>
                            <Calendar size={14} />
                            {interview.date}
                          </span>

                          <span style={{ display: "flex", gap: 4 }}>
                            <Clock size={14} />
                            {interview.time}
                          </span>

                          <span>ID: {interview.id}</span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight size={20} color={colors.charcoal} />
                  </div>
                ))}

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
                  padding: 28,
                  borderRadius: 18,
                  border: `1px solid ${colors.lightGray}`,
                  boxShadow: "0 2px 8px rgba(15,23,43,0.04)",
                }}
              >
                <h3 style={{ fontWeight: 500, fontSize: 20 }}>
                  Recent Activity
                </h3>

                <p style={{ color: "#64748B", marginBottom: 24 }}>
                  Latest updates
                </p>

                {activities.map((activity, index) => {
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
                        }}
                      >
                        {icon}
                      </div>

                      <div>
                        <div style={{ fontSize: 14 }}>
                          {activity.text}
                        </div>

                        <div
                          style={{
                            fontSize: 13,
                            color: "#64748B",
                            marginTop: 4,
                          }}
                        >
                          {activity.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dashboard;