import { WebSocketServer, WebSocket } from 'ws';
import { IncomingMessage, Server } from 'http';
import jwt from 'jsonwebtoken';
import { parse } from 'url';
import { User } from '../../database/index.js';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';

interface EditorClient {
  ws: WebSocket;
  userId: string;
  name: string;
}

interface EditorSession {
  code: string;
  language: string;
  clients: Set<EditorClient>;
}

// In-memory store: sessionCode → editor state + connected clients
const sessions = new Map<string, EditorSession>();

function broadcast(session: EditorSession, message: object, exclude?: WebSocket) {
  const payload = JSON.stringify(message);
  for (const client of session.clients) {
    if (client.ws !== exclude && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(payload);
    }
  }
}

function sendTo(ws: WebSocket, message: object) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(message));
  }
}

export function attachEditorWS(server: Server) {
  const wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', async (ws: WebSocket, req: IncomingMessage) => {
    const { query } = parse(req.url ?? '', true);
    const token = query.token as string;
    const sessionCode = query.sessionCode as string;

    if (!token || !sessionCode) {
      ws.close(4001, 'Missing token or sessionCode');
      return;
    }

    let userId: string;

    try {
      const payload = jwt.verify(token, JWT_SECRET) as { userId: string };
      userId = payload.userId;
    } catch {
      ws.close(4001, 'Invalid token');
      return;
    }

    // Look up user for display name
    let name = 'Unknown';
    try {
      const user = await (User as any).findByPk(userId, {
        attributes: ['firstName', 'lastName'],
      });
      if (user) name = `${user.firstName} ${user.lastName}`;
    } catch {
      // non-fatal, keep default name
    }

    // Get or create in-memory session state
    if (!sessions.has(sessionCode)) {
      sessions.set(sessionCode, {
        code: '// Start coding here\n',
        language: 'javascript',
        clients: new Set(),
      });
    }

    const session = sessions.get(sessionCode)!;
    const client: EditorClient = { ws, userId, name };
    session.clients.add(client);

    // Send current state to the joining client
    sendTo(ws, {
      type: 'init',
      code: session.code,
      language: session.language,
      users: Array.from(session.clients).map((c) => ({
        userId: c.userId,
        name: c.name,
      })),
    });

    // Tell everyone else a new user joined
    broadcast(session, { type: 'user_joined', userId, name }, ws);

    ws.on('message', (raw) => {
      let msg: { type: string; value?: string };
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        return;
      }

      if (msg.type === 'code' && typeof msg.value === 'string') {
        session.code = msg.value;
        broadcast(session, { type: 'code', value: msg.value, from: userId }, ws);
      } else if (msg.type === 'language' && typeof msg.value === 'string') {
        session.language = msg.value;
        broadcast(session, { type: 'language', value: msg.value, from: userId });
      }
    });

    ws.on('close', () => {
      session.clients.delete(client);
      broadcast(session, { type: 'user_left', userId, name });
      // Clean up empty sessions after a delay
      if (session.clients.size === 0) {
        setTimeout(() => {
          if (sessions.get(sessionCode)?.clients.size === 0) {
            sessions.delete(sessionCode);
          }
        }, 5 * 60 * 1000); // 5 minutes
      }
    });

    ws.on('error', () => {
      session.clients.delete(client);
    });
  });

  return wss;
}
