import { createChatEngine } from './llm.js';
import { executeTool, getToolsForRole, roles } from './tools.js';
import { searchKnowledge } from './knowledge.js';

const SESSION_KEY = 'test-static-session';
const chatEngine = createChatEngine({});
const histories = new Map();
const auditLog = [];

export async function staticApi(pathname, options = {}) {
  const method = String(options.method || 'GET').toUpperCase();

  if (method === 'GET' && pathname === '/api/health') {
    return json(200, { status: 'ok', dataSource: 'demo-static', readOnly: true });
  }

  if (method === 'POST' && pathname === '/api/login') {
    const body = readBody(options);
    if (!roles[body.role]) return json(400, { error: 'Неизвестная роль.' });
    const token = createToken();
    const user = { id: `demo-${body.role}`, role: body.role, label: roles[body.role].label };
    const session = { token, user, expiresAt: Date.now() + 8 * 60 * 60 * 1000 };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    recordAudit({ user, event: 'login', status: 'success' });
    return json(200, { token, user, expiresIn: 8 * 60 * 60 });
  }

  const session = readSession();
  if (!session) return json(401, { error: 'Требуется авторизация.' });

  if (method === 'POST' && pathname === '/api/logout') {
    sessionStorage.removeItem(SESSION_KEY);
    return json(200, { ok: true });
  }

  if (method === 'GET' && pathname === '/api/me') {
    return json(200, { user: session.user, dataSource: 'demo-static', readOnly: true });
  }

  if (method === 'GET' && pathname === '/api/history') {
    return json(200, { messages: histories.get(session.user.id) || [] });
  }

  if (method === 'POST' && pathname === '/api/history/clear') {
    histories.set(session.user.id, []);
    return json(200, { ok: true });
  }

  if (method === 'GET' && pathname === '/api/audit') {
    if (session.user.role !== 'admin') return json(403, { error: 'Журнал аудита доступен только администратору.' });
    return json(200, { events: auditLog.slice(-200).reverse() });
  }

  if (method === 'POST' && pathname === '/api/chat') {
    const body = readBody(options);
    const question = String(body.message || '').trim();
    if (!question) return json(400, { error: 'Введите вопрос.' });
    if (question.length > 2000) return json(400, { error: 'Вопрос слишком длинный.' });

    const requestId = createToken().slice(0, 8);
    const knowledge = searchKnowledge(question);
    const history = histories.get(session.user.id) || [];
    const messages = [...history.slice(-10), { role: 'user', content: question }];

    try {
      const result = await chatEngine({
        messages,
        tools: getToolsForRole(session.user.role),
        knowledge,
        executeTool: (name, args) => {
          const startedAt = Date.now();
          try {
            const toolResult = executeTool(name, args, session.user.role, { dataSource: 'demo-static' });
            recordAudit({
              user: session.user,
              requestId,
              event: 'tool_call',
              tool: name,
              args,
              status: 'success',
              durationMs: Date.now() - startedAt,
              resultSummary: toolResult?.summary || null
            });
            return toolResult;
          } catch (error) {
            recordAudit({
              user: session.user,
              requestId,
              event: 'tool_call',
              tool: name,
              args,
              status: 'error',
              durationMs: Date.now() - startedAt,
              error: error.message
            });
            throw error;
          }
        }
      });

      histories.set(session.user.id, [...history, { role: 'user', content: question }, { role: 'assistant', content: result.answer }].slice(-30));
      recordAudit({ user: session.user, requestId, event: 'chat', status: 'success', question: question.slice(0, 300) });
      return json(200, { answer: result.answer, requestId, toolCalls: result.toolCalls, knowledge, readOnly: true, dataSource: 'demo-static' });
    } catch (error) {
      const status = error.code === 'FORBIDDEN' ? 403 : error.code === 'NOT_FOUND' ? 404 : 400;
      return json(status, { error: error.message || 'Не удалось выполнить запрос.' });
    }
  }

  return json(404, { error: 'Маршрут не найден.' });
}

function readBody(options) {
  if (!options.body) return {};
  try {
    return JSON.parse(options.body);
  } catch {
    return {};
  }
}

function readSession() {
  try {
    const session = JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null');
    if (!session || session.expiresAt < Date.now()) {
      sessionStorage.removeItem(SESSION_KEY);
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

function createToken() {
  return globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function recordAudit(event) {
  auditLog.push({ id: createToken().slice(0, 6), timestamp: new Date().toISOString(), ...event });
  if (auditLog.length > 1000) auditLog.shift();
}

function json(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }
  });
}
