import { useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import {
  type LucideIcon,
  Building2,
  User,
  Calendar,
  Clock4,
  CircleAlert,
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
      <div className="grid grid-cols-2 gap-4 items-center justify-center w-full">
        {fields.map((field) => {
          const Icon = field.icon;
          let val: string;

          if (field.key === "start") {
            val = formattedDate;
          } else if (field.key === "time") {
            val = formattedTime;
          } else {
            val = interview[field.key as keyof Interview] as string;
          }

          return (
            <div className="flex gap-2" key={field.key}>
              <div className="flex items-center justify-center bg-white border border-border shadow-sm p-2 rounded-xl h-9 w-9">
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex flex-col gap-1">
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

function JoinAction({ interview, isSignedIn }: Props & { isSignedIn: boolean }) {
  const navigate = useNavigate();

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (isSignedIn) {
      navigate(`/editor/${interview.sessionID}`);
      return;
    }

    navigate("/login");
  }

  return (
    <form className="flex flex-col text-xs" onSubmit={handleSubmit}>
      <div className="flex flex-col py-4 gap-2">
        <div className="flex gap-1 items-center">
          <span className="font-medium">
            {isSignedIn ? "You're ready to join" : "Sign in required"}
          </span>
        </div>

        <span className="text-[10px] text-gray-500 pb-1">
          {isSignedIn
            ? "Join the live interview session and open the collaborative editor."
            : "Please sign in with your invited account to access this interview session."}
        </span>

        <button
          type="submit"
          className={`${buttonStyles} bg-black text-white text-xs hover:opacity-90 transition-colors duration-300 cursor-pointer`}
        >
          {isSignedIn ? "Join Interview Session >" : "Sign In to Join >"}
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
        const response = await fetch(`/api/sessions/join/${id}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.message ?? "Unable to load interview session.");
          return;
        }

        setSession(data);
      } catch {
        setError("Unable to load interview session.");
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadSession();
    }
  }, [id]);

  const interview = useMemo(() => {
    return session ? mapSessionToInterview(session) : null;
  }, [session]);

  const subTextStyle = "text-xs";

  return (
    <div className="flex flex-col items-center justify-center w-screen min-h-screen bg-white px-4">
      <div className="flex items-center gap-2 p-8">
        <img className="w-8" src="/src/assets/logo.png" alt="EnterView Logo" />
        <h1 className="text-2xl pt-2">EnterView</h1>
      </div>

      <div className="flex flex-col w-full max-w-140 rounded-2xl bg-white border border-border shadow-xl px-5 pt-3 pb-10">
        {loading ? (
          <div className="py-10 text-sm text-gray-500">Loading interview session...</div>
        ) : error || !interview ? (
          <div className="py-10">
            <h2 className="text-xl font-semibold">Session unavailable</h2>
            <p className="text-sm text-gray-500 mt-2">
              {error || "We couldn't find that interview session."}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center gap-2 pt-2 pb-8">
              <div className="bg-blue-200 rounded-lg px-2 py-0.5">
                <p className="text-[10px] font-semibold text-blue-600">
                  Interview Session
                </p>
              </div>

              <h2 className="text-xl font-semibold">
                {interview.position} Interview
              </h2>

              <p className={`${subTextStyle} text-gray-400`}>
                You've been invited to join this interview session
              </p>
            </div>

            <div className="border-b border-gray-300 pb-4">
              <InfoCard interview={interview} />
              <JoinAction interview={interview} isSignedIn={Boolean(token)} />

              <div className="flex gap-3 bg-blue-100 border border-blue-200 rounded-lg p-4">
                <CircleAlert className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
                <div className="flex flex-col text-[11px] gap-2 py-1">
                  <span className="text-xs font-semibold text-blue-900">
                    Need help?
                  </span>
                  <span className="text-blue-700">
                    If you can't access your interview session, please contact
                    <span className="text-[11px] font-bold">
                      {" "}
                      {interview.interviewer}
                    </span>{" "}
                    or an interview coordinator.
                  </span>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      <span className="text-xs text-gray-400 pt-4">
        Powered by EnterView • Secure Interview Platform
      </span>
    </div>
  );
}
