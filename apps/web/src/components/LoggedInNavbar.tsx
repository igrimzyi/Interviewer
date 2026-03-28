import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import logo from "../assets/Group_Logo.png";
import { useAuth } from "../context/AuthContext";

const colors = {
  black: "#0F172B",
  charcoal: "#45556C",
  lightGray: "#E2E8F0",
  blue: "#155DFC",
};

const LoggedInNavbar = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  function handleLogout() {
    signOut();
    navigate("/login");
  }

  const initials = user
    ? `${user.firstName[0] ?? ""}${user.lastName[0] ?? ""}`.toUpperCase()
    : "?";

  const displayName = user ? `${user.firstName} ${user.lastName}` : "";
  const displayRole = user?.role
    ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
    : "";

  return (
    <div
      className="LoggedInNavbar-container"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 48px",
        background: "white",
        borderBottom: `1px solid ${colors.lightGray}`,
        boxShadow: "0 1px 2px rgba(15,23,43,0.04)",
        flexWrap: "wrap",
        rowGap: 12,
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
        <img src={logo} alt="Logo" style={{ width: 28 }} />
        <div style={{ fontWeight: 500, fontSize: 18, color: colors.black }}>
          EnterView
        </div>
        <div style={{ color: colors.charcoal }}>Dashboard</div>
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <div
          style={{
            width: 38,
            height: 38,
            borderRadius: "50%",
            background: colors.blue,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          {initials}
        </div>

        <div>
          <div style={{ fontWeight: 500 }}>{displayName}</div>
          <div style={{ fontSize: 12, color: colors.charcoal }}>{displayRole}</div>
        </div>

        <LogOut
          size={20}
          color={colors.charcoal}
          style={{ cursor: "pointer" }}
          onClick={handleLogout}
        />
      </div>
    </div>
  );
};

export default LoggedInNavbar;
