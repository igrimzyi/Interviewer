import { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MonacoEditor from "@monaco-editor/react";
import type { editor as MonacoEditorNS } from "monaco-editor";
import type { editor } from "monaco-editor";
import { useAuth } from "../context/AuthContext";
import { ArrowLeft, Users, Circle } from "lucide-react";

type OnMount = (editor: editor.IStandaloneCodeEditor, monaco: typeof import("monaco-editor")) => void;

interface ConnectedUser {
    userId: string;
    name: string;
}

type WsMessage =
    | { type: "init"; code: string; language: string; users: ConnectedUser[] }
    | { type: "code"; value: string; from: string }
    | { type: "language"; value: string; from: string }
    | { type: "user_joined"; userId: string; name: string }
    | { type: "user_left"; userId: string; name: string };

const LANGUAGES = [
    { label: "JavaScript", value: "javascript" },
    { label: "TypeScript", value: "typescript" },
    { label: "Python", value: "python" },
    { label: "Java", value: "java" },
    { label: "C++", value: "cpp" },
    { label: "Go", value: "go" },
    { label: "Rust", value: "rust" },
];

const colors = {
    black: "#0F172B",
    charcoal: "#45556C",
    lightGray: "#E2E8F0",
    blue: "#155DFC",
};

/* ===============================
   COMPONENT
================================= */

export default function Editor() {
    const { sessionCode } = useParams<{ sessionCode: string }>();
    const navigate = useNavigate();
    const { token, user } = useAuth();

    const editorRef = useRef<MonacoEditorNS.IStandaloneCodeEditor | null>(null);
    const wsRef = useRef<WebSocket | null>(null);
    const isRemoteChange = useRef(false);

    const [language, setLanguage] = useState("javascript");
    const [connectedUsers, setConnectedUsers] = useState<ConnectedUser[]>([]);
    const [status, setStatus] = useState<"connecting" | "connected" | "disconnected">("connecting");

    const handleEditorMount: OnMount = useCallback((editorInstance) => {
        editorRef.current = editorInstance;
    }, []);

    const handleEditorChange = useCallback((value: string | undefined) => {
        if (isRemoteChange.current) return;
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "code", value: value ?? "" }));
        }
    }, []);

    function changeLanguage(lang: string) {
        setLanguage(lang);
        if (wsRef.current?.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({ type: "language", value: lang }));
        }
    }

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
                setLanguage(msg.language);
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
                setLanguage(msg.value);
            } else if (msg.type === "user_joined") {
                setConnectedUsers((prev) => {
                    if (prev.some((u) => u.userId === msg.userId)) return prev;
                    return [...prev, { userId: msg.userId, name: msg.name }];
                });
            } else if (msg.type === "user_left") {
                setConnectedUsers((prev) => prev.filter((u) => u.userId !== msg.userId));
            }
        };

        ws.onclose = () => setStatus("disconnected");
        ws.onerror = () => setStatus("disconnected");

        return () => {
            ws.close();
        };
    }, [token, sessionCode]);

    const statusColor =
        status === "connected" ? "#16A34A" : status === "connecting" ? "#D97706" : "#DC2626";
    const statusLabel =
        status === "connected" ? "Live" : status === "connecting" ? "Connecting…" : "Disconnected";

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100vh", background: "#1E1E1E" }}>

            {/* TOP BAR */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "10px 20px",
                    background: "#0F172B",
                    borderBottom: "1px solid #1E293B",
                    flexShrink: 0,
                    gap: 16,
                    flexWrap: "wrap",
                }}
            >
                {/* Left: back + session code */}
                <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                    <button
                        onClick={() => navigate("/dashboard")}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: 6,
                            background: "transparent",
                            border: "none",
                            color: "#94A3B8",
                            cursor: "pointer",
                            fontSize: 13,
                        }}
                    >
                        <ArrowLeft size={15} />
                        Dashboard
                    </button>

                    <div style={{ width: 1, height: 18, background: "#1E293B" }} />

                    <div>
                        <span style={{ fontSize: 12, color: "#64748B" }}>Session</span>
                        <span
                            style={{
                                marginLeft: 8,
                                fontFamily: "monospace",
                                fontSize: 13,
                                fontWeight: 600,
                                color: "#E2E8F0",
                                letterSpacing: 1,
                            }}
                        >
              {sessionCode}
            </span>
                    </div>

                    {/* Live indicator */}
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <Circle size={8} fill={statusColor} color={statusColor} />
                        <span style={{ fontSize: 12, color: statusColor }}>{statusLabel}</span>
                    </div>
                </div>

                {/* Center: language selector */}
                <select
                    value={language}
                    onChange={(e) => changeLanguage(e.target.value)}
                    style={{
                        background: "#1E293B",
                        border: "1px solid #334155",
                        borderRadius: 6,
                        color: "#E2E8F0",
                        padding: "4px 10px",
                        fontSize: 13,
                        cursor: "pointer",
                    }}
                >
                    {LANGUAGES.map((l) => (
                        <option key={l.value} value={l.value}>
                            {l.label}
                        </option>
                    ))}
                </select>

                {/* Right: connected users */}
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Users size={15} color="#64748B" />
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {connectedUsers.map((u, i) => {
                            const initials = u.name
                                .split(" ")
                                .map((p) => p[0])
                                .join("")
                                .toUpperCase()
                                .slice(0, 2);
                            const isMe = u.userId === user?.id;
                            const hue = (u.userId.charCodeAt(0) * 37) % 360;
                            return (
                                <div
                                    key={u.userId}
                                    title={`${u.name}${isMe ? " (you)" : ""}`}
                                    style={{
                                        width: 28,
                                        height: 28,
                                        borderRadius: "50%",
                                        background: `hsl(${hue}, 65%, 45%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontSize: 11,
                                        fontWeight: 600,
                                        color: "white",
                                        marginLeft: i > 0 ? -6 : 0,
                                        border: "2px solid #0F172B",
                                        zIndex: connectedUsers.length - i,
                                        position: "relative",
                                    }}
                                >
                                    {initials}
                                </div>
                            );
                        })}
                        <span style={{ fontSize: 12, color: "#64748B", marginLeft: 6 }}>
              {connectedUsers.length} online
            </span>
                    </div>
                </div>
            </div>

            {/* EDITOR */}
            <div style={{ flex: 1, overflow: "hidden" }}>
                {status === "disconnected" ? (
                    <div
                        style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            height: "100%",
                            color: "#64748B",
                            gap: 12,
                        }}
                    >
                        <p style={{ fontSize: 16 }}>Connection lost.</p>
                        <button
                            onClick={() => window.location.reload()}
                            style={{
                                padding: "8px 16px",
                                background: colors.blue,
                                color: "white",
                                border: "none",
                                borderRadius: 8,
                                cursor: "pointer",
                            }}
                        >
                            Reconnect
                        </button>
                    </div>
                ) : (
                    <MonacoEditor
                        height="100%"
                        language={language}
                        theme="vs-dark"
                        defaultValue="// Start coding here&#10;"
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
                        }}
                    />
                )}
            </div>
        </div>
    );
}
