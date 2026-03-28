import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import type { editor } from "monaco-editor";
import {
  Check,
  Circle,
  Clock3,
  FileQuestion,
  Play,
  RotateCcw,
  Users,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

type OnMount = (
  editor: editor.IStandaloneCodeEditor,
  monaco: typeof import("monaco-editor"),
) => void;

interface ConnectedUser {
  userId: string;
  name: string;
}

interface SessionQuestion {
  id: string;
  title: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  description: string;
  constraints: string | null;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
}

type WsMessage =
  | { type: "init"; code: string; language: string; users: ConnectedUser[] }
  | { type: "code"; value: string; from: string }
  | { type: "language"; value: string; from: string }
  | { type: "user_joined"; userId: string; name: string }
  | { type: "user_left"; userId: string; name: string };

const DEFAULT_PROMPT: SessionQuestion = {
  id: "fallback-question",
  title: "Two Sum Problem",
  difficulty: "medium",
  category: "Data Structures & Algorithms",
  description:
    "Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.",
  examples: [
    {
      input: "nums = [2,7,11,15], target = 9",
      output: "[0,1]",
      explanation: "Because nums[0] + nums[1] = 9, we return [0, 1].",
    },
    {
      input: "nums = [3,2,4], target = 6",
      output: "[1,2]",
    },
  ],
  constraints:
    "2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9\nOnly one valid answer exists.",
};

const pageStyles = {
  appShell: {
    display: "flex",
    flexDirection: "column" as const,
    height: "100vh",
    background: "#f8fafc",
    color: "#0f172a",
    overflow: "hidden" as const,
  },
  topBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 18px",
    background: "#ffffff",
    borderBottom: "1px solid #e2e8f0",
    flexWrap: "wrap" as const,
    flexShrink: 0,
  },
  brandGroup: {
    display: "flex",
    alignItems: "center",
    gap: 16,
    minWidth: 0,
  },
  brandMark: {
    width: 38,
    height: 38,
    borderRadius: 12,
    border: "1px solid #dbe3ef",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    background: "linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)",
    boxShadow: "0 4px 18px rgba(15, 23, 42, 0.06)",
    overflow: "hidden" as const,
  },
  interviewMeta: {
    display: "flex",
    flexDirection: "column" as const,
    gap: 2,
    minWidth: 0,
  },
  topActions: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  timerChip: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "0 6px",
    color: "#64748b",
    fontSize: 15,
    fontWeight: 600,
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "320px minmax(0, 1fr)",
    flex: 1,
    minHeight: 0,
    overflow: "hidden" as const,
  },
  sidebar: {
    display: "flex",
    flexDirection: "column" as const,
    minHeight: 0,
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    overflow: "hidden" as const,
  },
  tabRow: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    borderBottom: "1px solid #e2e8f0",
  },
  tabButton: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 48,
    border: "none",
    background: "#ffffff",
    color: "#475569",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  activeTabButton: {
    background: "#f8fafc",
    color: "#0f172a",
    boxShadow: "inset 0 -2px 0 #0f172a",
  },
  sidebarScroll: {
    flex: 1,
    minHeight: 0,
    padding: 20,
    overflowY: "auto" as const,
    display: "flex",
    flexDirection: "column" as const,
    gap: 22,
  },
  exampleCard: {
    border: "1px solid #e2e8f0",
    borderRadius: 16,
    background: "#ffffff",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(15, 23, 42, 0.04)",
  },
  codeBlock: {
    marginTop: 8,
    padding: "12px 14px",
    borderRadius: 10,
    background: "#f8fafc",
    color: "#334155",
    fontSize: 13,
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    whiteSpace: "pre-wrap" as const,
    wordBreak: "break-word" as const,
  },
  workspace: {
    display: "flex",
    flexDirection: "column" as const,
    minWidth: 0,
    minHeight: 0,
    background: "#ffffff",
    overflow: "hidden" as const,
  },
  editorToolbar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    padding: "12px 18px",
    borderBottom: "1px solid #e2e8f0",
    background: "#ffffff",
    flexWrap: "wrap" as const,
  },
  toolbarGroup: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    flexWrap: "wrap" as const,
  },
  editorFrame: {
    flex: 1,
    minHeight: 0,
    background: "#0f172a",
    overflow: "hidden" as const,
  },
  outputPanel: {
    borderTop: "1px solid #1e293b",
    background: "#020617",
    color: "#e2e8f0",
    minHeight: 140,
    maxHeight: 220,
    overflowY: "auto" as const,
    padding: "14px 18px",
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
    fontSize: 13,
    lineHeight: 1.6,
    flexShrink: 0,
  },
  ghostButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #e2e8f0",
    background: "#ffffff",
    color: "#334155",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  darkButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #0f172a",
    background: "#0f172a",
    color: "#ffffff",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
  lightButton: {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    height: 36,
    padding: "0 14px",
    borderRadius: 10,
    border: "1px solid #d6dce8",
    background: "#ffffff",
    color: "#334155",
    fontSize: 14,
    fontWeight: 600,
    cursor: "pointer",
  },
};

function formatElapsedTime(startTime: number) {
  const totalSeconds = Math.floor((Date.now() - startTime) / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":");
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Editor() {
  const { sessionCode } = useParams<{ sessionCode: string }>();
  const navigate = useNavigate();
  const { token, user } = useAuth();

  const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const isRemoteChange = useRef(false);
  const sessionStartedAt = useRef(Date.now());

  const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
  const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">(
    "connecting",
  );
  const [activeTab, setActiveTab] = useState<"question" | "participants">("question");
  const [elapsedTime, setElapsedTime] = useState("00:00:00");
  const [isNarrowLayout, setIsNarrowLayout] = useState(() => window.innerWidth < 960);
  const [sessionQuestion, setSessionQuestion] = useState<SessionQuestion>(DEFAULT_PROMPT);
  const [runOutput, setRunOutput] = useState<string[]>([
    "// Run Code to execute your JavaScript against this question's test cases.",
  ]);
  const [runError, setRunError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleEditorMount: OnMount = useCallback((editorInstance) => {
    editorRef.current = editorInstance;
  }, []);

  const handleEditorChange = useCallback((value: string | undefined) => {
    if (isRemoteChange.current) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "code", value: value ?? "" }));
    }
  }, []);

  const resetCode = useCallback(() => {
    if (!editorRef.current) return;
    isRemoteChange.current = true;
    editorRef.current.setValue("// Start coding here\n");
    isRemoteChange.current = false;
    setRunOutput(["// Editor reset."]);
    setRunError(null);

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({ type: "code", value: "// Start coding here\n" }));
    }
  }, []);

  const runCode = useCallback(async () => {
    if (!token || !editorRef.current || !sessionCode) return;

    setIsRunning(true);
    setRunError(null);
    setRunOutput(["// Running JavaScript..."]);

    try {
      const response = await fetch("/api/code/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: editorRef.current.getValue(),
          sessionCode,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setRunOutput(Array.isArray(data.output) && data.output.length > 0 ? data.output : []);
        setRunError(typeof data.message === "string" ? data.message : data.error ?? "Run failed.");
        return;
      }

      setRunOutput(
        Array.isArray(data.output) && data.output.length > 0
          ? data.output
          : ["// Code executed, but no test output was returned."],
      );
    } catch {
      setRunOutput([]);
      setRunError("Unable to reach the code runner.");
    } finally {
      setIsRunning(false);
    }
  }, [sessionCode, token]);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setElapsedTime(formatElapsedTime(sessionStartedAt.current));
    }, 1000);

    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleResize = () => setIsNarrowLayout(window.innerWidth < 960);

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    async function loadSessionQuestion() {
      if (!token || !sessionCode) return;

      try {
        const response = await fetch(`/api/sessions/${sessionCode}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (!response.ok || !data.question) {
          return;
        }

        setSessionQuestion({
          id: data.question.id,
          title: data.question.title,
          difficulty: data.question.difficulty,
          category: data.question.category,
          description: data.question.description,
          constraints: data.question.constraints,
          examples: Array.isArray(data.question.examples) ? data.question.examples : [],
        });
      } catch {
        // Keep the fallback prompt when the question cannot be loaded.
      }
    }

    loadSessionQuestion();
  }, [sessionCode, token]);

  useEffect(() => {
    if (!token || !sessionCode) return;

    const protocol = window.location.protocol === "https:" ? "wss" : "ws";
    const wsUrl = `${protocol}://${window.location.host}/ws?sessionCode=${sessionCode}&token=${token}`;
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => setStatus("connected");

    ws.onmessage = (event) => {
      let msg: WsMessage;
      try {
        msg = JSON.parse(event.data);
      } catch {
        return;
      }

      if (msg.type === "init") {
        setConnectedUsers(msg.users);
        if (editorRef.current && msg.code !== editorRef.current.getValue()) {
          isRemoteChange.current = true;
          editorRef.current.setValue(msg.code);
          isRemoteChange.current = false;
        }
      } else if (msg.type === "code") {
        if (editorRef.current) {
          isRemoteChange.current = true;
          editorRef.current.setValue(msg.value);
          isRemoteChange.current = false;
        }
      } else if (msg.type === "language") {
        return;
      } else if (msg.type === "user_joined") {
        setConnectedUsers((prev) => {
          if (prev.some((existingUser) => existingUser.userId === msg.userId)) return prev;
          return [...prev, { userId: msg.userId, name: msg.name }];
        });
      } else if (msg.type === "user_left") {
        setConnectedUsers((prev) =>
          prev.filter((existingUser) => existingUser.userId !== msg.userId),
        );
      }
    };

    ws.onclose = () => setStatus("disconnected");
    ws.onerror = () => setStatus("disconnected");

    return () => {
      ws.close();
    };
  }, [sessionCode, token]);

  const statusColor =
    status === "connected" ? "#16a34a" : status === "connecting" ? "#d97706" : "#dc2626";

  return (
    <div style={pageStyles.appShell}>
      <div style={pageStyles.topBar}>
        <div style={pageStyles.brandGroup}>
          <div style={pageStyles.brandMark}>
            <img
              src="/src/assets/logo.png"
              alt="EnterView logo"
              style={{ width: 24, height: 24, objectFit: "contain" }}
            />
          </div>

          <div style={{ ...pageStyles.interviewMeta, minWidth: 110 }}>
            <span style={{ fontSize: 33 / 2, fontWeight: 700, color: "#1e293b" }}>EnterView</span>
          </div>

          <div
            style={{
              width: 1,
              alignSelf: "stretch",
              background: "#e2e8f0",
            }}
          />

          <div style={pageStyles.interviewMeta}>
            <span
              style={{
                fontSize: 20,
                fontWeight: 700,
                color: "#1e293b",
                lineHeight: 1.2,
              }}
            >
              Senior Frontend Engineer Interview
            </span>
            <span style={{ fontSize: 13, color: "#64748b", fontWeight: 500 }}>
              Session ID: {sessionCode ? `INT-${sessionCode}` : "INT-2024-4872"}
            </span>
          </div>
        </div>

        <div style={pageStyles.topActions}>
          <div style={pageStyles.timerChip}>
            <Clock3 size={16} />
            <span>{elapsedTime}</span>
          </div>

          <button style={pageStyles.lightButton} onClick={() => navigate("/dashboard")}>
            End Session
          </button>
        </div>
      </div>

      <div
        style={{
          ...pageStyles.mainGrid,
          gridTemplateColumns: isNarrowLayout ? "1fr" : "320px minmax(0, 1fr)",
        }}
      >
        <aside
          style={{
            ...pageStyles.sidebar,
            minHeight: isNarrowLayout ? "auto" : 0,
          }}
        >
          <div style={pageStyles.tabRow}>
            <button
              style={{
                ...pageStyles.tabButton,
                ...(activeTab === "question" ? pageStyles.activeTabButton : {}),
              }}
              onClick={() => setActiveTab("question")}
            >
              <FileQuestion size={16} />
              Question
            </button>

            <button
              style={{
                ...pageStyles.tabButton,
                ...(activeTab === "participants" ? pageStyles.activeTabButton : {}),
              }}
              onClick={() => setActiveTab("participants")}
            >
              <Users size={16} />
              Participants
            </button>
          </div>

          <div style={pageStyles.sidebarScroll}>
            {activeTab === "question" ? (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <h2 style={{ margin: 0, fontSize: 20, color: "#1e293b" }}>
                      {sessionQuestion.title}
                    </h2>
                    <span
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        height: 24,
                        padding: "0 10px",
                        borderRadius: 999,
                        background: "#fde68a",
                        color: "#92400e",
                        fontSize: 12,
                        fontWeight: 700,
                      }}
                    >
                      {sessionQuestion.difficulty.charAt(0).toUpperCase() + sessionQuestion.difficulty.slice(1)}
                    </span>
                  </div>

                  <div style={{ fontSize: 13, color: "#64748b", fontWeight: 600 }}>
                    {sessionQuestion.category}
                  </div>

                  <p
                    style={{
                      margin: 0,
                      color: "#64748b",
                      fontSize: 15,
                      lineHeight: 1.65,
                    }}
                  >
                    {sessionQuestion.description}
                  </p>
                </div>

                <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: "#334155" }}>Examples</h3>

                  {sessionQuestion.examples.map((example, index) => (
                    <div key={index} style={pageStyles.exampleCard}>
                      <div style={{ padding: 14 }}>
                        <div style={{ fontSize: 13, color: "#94a3b8", fontWeight: 600 }}>
                          Input:
                        </div>
                        <div style={pageStyles.codeBlock}>{example.input}</div>

                        <div
                          style={{
                            marginTop: 14,
                            fontSize: 13,
                            color: "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          Output:
                        </div>
                        <div style={pageStyles.codeBlock}>{example.output}</div>

                        {example.explanation ? (
                          <>
                            <div
                              style={{
                                marginTop: 14,
                                fontSize: 13,
                                color: "#94a3b8",
                                fontWeight: 600,
                              }}
                            >
                              Explanation:
                            </div>
                            <p
                              style={{
                                margin: "8px 0 0",
                                color: "#64748b",
                                fontSize: 13,
                                lineHeight: 1.6,
                              }}
                            >
                              {example.explanation}
                            </p>
                          </>
                        ) : null}
                      </div>
                    </div>
                  ))}
                </section>

                <section style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <h3 style={{ margin: 0, fontSize: 15, color: "#334155" }}>Constraints</h3>
                  <ul
                    style={{
                      margin: 0,
                      paddingLeft: 18,
                      color: "#64748b",
                      fontSize: 14,
                      lineHeight: 1.8,
                    }}
                  >
                    {(sessionQuestion.constraints ?? "")
                      .split("\n")
                      .filter(Boolean)
                      .map((constraint) => (
                        <li key={constraint}>{constraint}</li>
                      ))}
                  </ul>
                </section>
              </>
            ) : (
              <section style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Circle size={10} fill={statusColor} color={statusColor} />
                  <span style={{ fontSize: 14, fontWeight: 700, color: "#334155" }}>
                    {status === "connected"
                      ? "Live collaboration"
                      : status === "connecting"
                        ? "Connecting..."
                        : "Disconnected"}
                  </span>
                </div>

                {connectedUsers.length === 0 ? (
                  <div
                    style={{
                      border: "1px dashed #cbd5e1",
                      borderRadius: 16,
                      padding: 18,
                      color: "#64748b",
                      fontSize: 14,
                      background: "#f8fafc",
                    }}
                  >
                    Waiting for participants to join this session.
                  </div>
                ) : (
                  connectedUsers.map((participant) => {
                    const hue = (participant.userId.charCodeAt(0) * 37) % 360;
                    const isCurrentUser = participant.userId === user?.id;

                    return (
                      <div
                        key={participant.userId}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: 14,
                          borderRadius: 16,
                          border: "1px solid #e2e8f0",
                          background: "#ffffff",
                          boxShadow: "0 10px 26px rgba(15, 23, 42, 0.04)",
                        }}
                      >
                        <div
                          style={{
                            width: 42,
                            height: 42,
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            background: `hsl(${hue}, 65%, 45%)`,
                            color: "#ffffff",
                            fontSize: 13,
                            fontWeight: 700,
                          }}
                        >
                          {getInitials(participant.name)}
                        </div>

                        <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                          <span style={{ fontSize: 15, fontWeight: 700, color: "#1e293b" }}>
                            {participant.name}
                          </span>
                          <span style={{ fontSize: 13, color: "#64748b" }}>
                            {isCurrentUser ? "You" : "Participant"}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </section>
            )}
          </div>
        </aside>

        <section style={pageStyles.workspace}>
          <div style={pageStyles.editorToolbar}>
            <div style={pageStyles.toolbarGroup}>
              <div
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  height: 36,
                  padding: "0 14px",
                  borderRadius: 10,
                  border: "1px solid #d6dce8",
                  background: "#ffffff",
                  color: "#334155",
                  fontSize: 14,
                  fontWeight: 700,
                }}
              >
                JavaScript
              </div>

              <button style={pageStyles.ghostButton} onClick={resetCode}>
                <RotateCcw size={15} />
                Reset
              </button>
            </div>

            <div style={pageStyles.toolbarGroup}>
              <button style={pageStyles.darkButton} type="button" onClick={runCode} disabled={isRunning}>
                <Play size={15} />
                {isRunning ? "Running..." : "Run Code"}
              </button>
              <button style={pageStyles.lightButton} type="button">
                <Check size={15} />
                Submit
              </button>
            </div>
          </div>

          <div style={pageStyles.editorFrame}>
            {status === "disconnected" ? (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  height: "100%",
                  color: "#cbd5e1",
                  gap: 12,
                }}
              >
                <p style={{ fontSize: 16, margin: 0 }}>Connection lost.</p>
                <button
                  onClick={() => window.location.reload()}
                  style={{
                    ...pageStyles.lightButton,
                    borderColor: "#475569",
                    background: "#ffffff",
                  }}
                >
                  Reconnect
                </button>
              </div>
            ) : (
              <MonacoEditor
                height="100%"
                language="javascript"
                theme="vs-dark"
                defaultValue="// Start coding here\n"
                onMount={handleEditorMount}
                onChange={handleEditorChange}
                options={{
                  fontSize: 14,
                  minimap: { enabled: false },
                  scrollBeyondLastLine: false,
                  wordWrap: "on",
                  tabSize: 2,
                  automaticLayout: true,
                  padding: { top: 16 },
                  lineNumbersMinChars: 3,
                  glyphMargin: false,
                }}
              />
            )}
          </div>

          <div style={pageStyles.outputPanel}>
            {runOutput.map((line, index) => (
              <div key={`${index}-${line}`}>{line}</div>
            ))}
            {runError ? <div style={{ color: "#fca5a5", marginTop: 8 }}>Error: {runError}</div> : null}
          </div>
        </section>
      </div>
    </div>
  );
}
