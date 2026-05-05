import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  type LucideIcon,
  Building2,
  User,
  Calendar,
  Clock4,
} from "lucide-react";
import { buttonStyles } from "../styles/shared";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

type SessionPreview = {
  id: string;
  sessionCode: string;
  title: string;
  status: string;
  scheduledAt: string | null;
  interviewer: {
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  organization: {
    id: string;
    name: string;
  } | null;
  question: {
    id: string;
    title: string;
    difficulty: "easy" | "medium" | "hard";
    suggestedTimeLimitMinutes: number;
  } | null;
};

type Interview = {
  position: string;
  org: string;
  interviewer: string;
  start: Date;
  end: Date;
  sessionID: string;
};

type Props = {
  interview: Interview;
};

function mapSessionToInterview(session: SessionPreview): Interview {
  const start = session.scheduledAt ? new Date(session.scheduledAt) : new Date();
  const durationMinutes = session.question?.suggestedTimeLimitMinutes ?? 60;
  const end = new Date(start.getTime() + durationMinutes * 60000);

  return {
    position: session.title,
    org: session.organization?.name ?? "EnterView",
    interviewer: session.interviewer
      ? `${session.interviewer.firstName} ${session.interviewer.lastName}`
      : "Interview Team",
    start,
    end,
    sessionID: session.sessionCode,
  };
}

function InfoCard({ interview }: Props) {
  const fields: { icon: LucideIcon; key: string; label: string }[] = [
    { icon: Building2, key: "org", label: "Organization" },
    { icon: User, key: "interviewer", label: "Interviewer" },
    { icon: Calendar, key: "start", label: "Date" },
    { icon: Clock4, key: "time", label: "Time" },
  ];

  const formattedDate = interview.start.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = `${interview.start.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })} - ${interview.end.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  })}`;

  return (
    <div className="flex flex-col bg-neutral-100 rounded-2xl p-4 gap-4 items-center justify-center w-full">
      <div className="grid grid-cols-2 gap-4 w-full">
        {fields.map((field) => {
          const Icon = field.icon;
          let val: string;

          if (field.key === "start") val = formattedDate;
          else if (field.key === "time") val = formattedTime;
          else val = interview[field.key as keyof Interview] as string;

          return (
            <div className="flex gap-2" key={field.key}>
              <div className="flex items-center justify-center bg-white border p-2 rounded-xl h-9 w-9">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-xs text-gray-500">{field.label}</h3>
                <span className="text-xs">{val}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border-t border-gray-300 pt-4 mt-4 space-y-2 text-xs w-full">
        <div className="flex justify-between">
          <span className="text-gray-500">Position:</span>
          <span>{interview.position}</span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Duration:</span>
          <span>
            {Math.round(
              (interview.end.getTime() - interview.start.getTime()) / 60000
            )}{" "}
            minutes
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-500">Session ID:</span>
          <span>{interview.sessionID}</span>
        </div>
      </div>
    </div>
  );
}

function JoinAction({ isSignedIn }: { isSignedIn: boolean }) {
  const navigate = useNavigate();
  const { id } = useParams();

  const [password, setPassword] = useState("");
  const [joinError, setJoinError] = useState("");
  const [isJoining, setIsJoining] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setJoinError("");

    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    if (!password.trim()) {
      setJoinError("Session password is required.");
      return;
    }

    setIsJoining(true);

    try {
      const res = await fetch(`/api/sessions/join/${id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setJoinError(data.message ?? "Invalid session password.");
        return;
      }

      navigate(`/editor/${data.sessionCode}`);
    } catch {
      setJoinError("Unable to verify session password.");
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <form className="flex flex-col text-xs" onSubmit={handleSubmit}>
      <div className="flex flex-col py-4 gap-3">
        <span className="font-medium">
          {isSignedIn ? "Session password required" : "Sign in required"}
        </span>

        <span className="text-[10px] text-gray-500">
          {isSignedIn
            ? "Enter the password provided for this session."
            : "Please sign in to continue."}
        </span>

        {isSignedIn && (
          <>
            <input
              type="password"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setJoinError("");
              }}
              placeholder="Enter session password"
              className="w-full border px-3 py-2 text-sm rounded-md"
            />

            {joinError && (
              <p className="text-xs text-red-600">{joinError}</p>
            )}
          </>
        )}

        <button
          type="submit"
          disabled={isJoining}
          className={`${buttonStyles} bg-black text-white`}
        >
          {isJoining
            ? "Verifying..."
            : isSignedIn
              ? "Join Interview Session >"
              : "Sign In to Join >"}
        </button>
      </div>
    </form>
  );
}

export default function JoinSession() {
  const { id } = useParams();
  const { token } = useAuth();
  const [session, setSession] = useState<SessionPreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadSession() {
      try {
        const res = await fetch(`/api/sessions/join/${id}`);
        const data = await res.json();

        if (!res.ok) {
          setError(data.message ?? "Unable to load session.");
          return;
        }

        setSession(data);
      } catch {
        setError("Unable to load session.");
      } finally {
        setLoading(false);
      }
    }

    if (id) loadSession();
  }, [id]);

  const interview = useMemo(() => {
    return session ? mapSessionToInterview(session) : null;
  }, [session]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white px-4">
      {loading ? (
        <div>Loading...</div>
      ) : error || !interview ? (
        <div>{error || "Session not found"}</div>
      ) : (
        <>
          <InfoCard interview={interview} />
          <JoinAction isSignedIn={Boolean(token)} />
        </>
      )}
    </div>
  );
}