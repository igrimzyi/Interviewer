import LoggedInNavbar from "../components/LoggedInNavbar";
import { ArrowLeft, Calendar, FileText } from "lucide-react";
import { useNavigate } from "react-router-dom";

const colors = {
  black: "#0F172B",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
};

const labelClass = "text-xs font-medium text-[#0F172B]";
const inputClass =
  "mt-1 w-full rounded-md border border-[#E2E8F0] bg-gray-50 px-3 py-2 text-sm outline-none focus:bg-white focus:ring-2 focus:ring-[#155DFC]/30";

export default function Session() {
  const navigate = useNavigate();

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
              <label className={labelClass}>Full Name *</label>
              <input className={inputClass} placeholder="e.g., Alex Johnson" />
            </div>

            <div>
              <label className={labelClass}>Email Address *</label>
              <input className={inputClass} placeholder="e.g., alex.johnson@email.com" />
            </div>
          </div>

          <div style={{ marginTop: 12 }}>
            <label className={labelClass}>Position *</label>
            <select className={inputClass}>
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
              <input type="date" className={inputClass} />
            </div>

            <div>
              <label className={labelClass}>Time *</label>
              <input type="time" className={inputClass} />
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

          {[
            { title: "Frontend Basics", count: "5 questions" },
            { title: "Data Structures & Algorithms", count: "8 questions" },
            { title: "System Design", count: "4 questions" },
            { title: "Backend & APIs", count: "6 questions" },
          ].map((item, i) => (
            <div
              key={i}
              style={{
                border: `1px solid ${colors.lightGray}`,
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                cursor: "pointer",
              }}
            >
              <div style={{ fontWeight: 500 }}>{item.title}</div>
              <div style={{ fontSize: 13, color: colors.charcoal }}>
                {item.count}
              </div>
            </div>
          ))}
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
          <div style={{ fontWeight: 500, marginBottom: 10 }}>
            Additional Notes
          </div>

          <p style={{ fontSize: 13, color: colors.charcoal, marginBottom: 10 }}>
            Optional notes or instructions (optional)
          </p>

          <textarea
            className={inputClass}
            placeholder="Add any special instructions or notes about this interview..."
            rows={3}
          />
        </div>

        {/* =========================
            ACTIONS
        ========================= */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12 }}>
          <button
            onClick={() => navigate("/dashboard")}
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
            style={{
              padding: "10px 18px",
              borderRadius: 8,
              background: "#6B7280",
              color: "white",
              border: "none",
              cursor: "pointer",
            }}
          >
            Create Interview Session
          </button>
        </div>
      </div>
    </div>
  );
}