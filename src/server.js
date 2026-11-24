import http from 'node:http';
import { createReadStream } from 'node:fs';
import { stat } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomBytes } from 'node:crypto';
import { createChatEngine } from './llm.js';
import { executeTool, getToolsForRole, roles } from './tools.js';
import { searchKnowledge } from './knowledge.js';
import { OneCAdapter } from './onec-adapter.js';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const publicRoot = path.join(root, 'public');
const port = Number(process.env.PORT || 3000);
const host = process.env.HOST || '127.0.0.1';
const dataSource = process.env.DATA_SOURCE || 'demo';
const adapter = dataSource === 'onec' ? new OneCAdapter(process.env) : null;
const chatEngine = createChatEngine(process.env);
const sessions = new Map();
const histories = new Map();
const auditLog = [];

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

const server = http.createServer(async (request, response) => {
  setSecurityHeaders(response);
  try {
    const url = new URL(request.url, `http://${request.headers.host || 'localhost'}`);
    if (url.pathname.startsWith('/api/')) {
      await handleApi(request, response, url);
      return;
    }
    await serveStatic(request, response, url.pathname);
  } catch (error) {
    const status = error.statusCode || 500;
    response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
    response.end(JSON.stringify({ error: error.expose ? error.message : 'Внутренняя ошибка сервера.' }));
    if (status >= 500) console.error(error);
  }
});

server.listen(port, host, () => {
  console.log(`test demo: http://localhost:${port}`);
  console.log(`Data source: ${dataSource}; LLM: ${process.env.LLM_BASE_URL && process.env.LLM_MODEL ? 'API' : 'demo'}`);
});

async function handleApi(request, response, url) {
  if (request.method === 'GET' && url.pathname === '/api/health') {
    return json(response, 200, { status: 'ok', dataSource, readOnly: true });
  }

  if (request.method === 'POST' && url.pathname === '/api/login') {
    const body = await readJson(request);
    const role = body.role;
    if (!roles[role]) throw httpError('Неизвестная роль.', 400, true);
    if (process.env.DEMO_AUTH === 'false') throw httpError('Демо-авторизация отключена.', 501, true);
    const token = randomBytes(32).toString('hex');
    const user = { id: `demo-${role}`, role, label: roles[role].label };
    sessions.set(token, { user, expiresAt: Date.now() + 8 * 60 * 60 * 1000 });
    recordAudit({ user, event: 'login', status: 'success' });
    return json(response, 200, { token, user, expiresIn: 8 * 60 * 60 });
  }

  const session = authenticate(request);
  if (!session) throw httpError('Требуется авторизация.', 401, true);

  if (request.method === 'POST' && url.pathname === '/api/logout') {
    sessions.delete(session.token);
    return json(response, 200, { ok: true });
  }

  if (request.method === 'GET' && url.pathname === '/api/me') {
    return json(response, 200, { user: session.user, dataSource, readOnly: true });
  }

  if (request.method === 'GET' && url.pathname === '/api/history') {
    return json(response, 200, { messages: histories.get(session.user.id) || [] });
  }

  if (request.method === 'POST' && url.pathname === '/api/history/clear') {
    histories.set(session.user.id, []);
    return json(response, 200, { ok: true });
  }

  if (request.method === 'GET' && url.pathname === '/api/audit') {
    if (session.user.role !== 'admin') throw httpError('Журнал аудита доступен только администратору.', 403, true);
    return json(response, 200, { events: auditLog.slice(-200).reverse() });
  }

  if (request.method === 'POST' && url.pathname === '/api/chat') {
    const body = await readJson(request);
    const question = String(body.message || '').trim();
    if (!question) throw httpError('Введите вопрос.', 400, true);
    if (question.length > 2000) throw httpError('Вопрос слишком длинный.', 400, true);

    const requestId = randomBytes(8).toString('hex');
    const knowledge = searchKnowledge(question);
    const history = histories.get(session.user.id) || [];
    const messages = [...history.slice(-10), { role: 'user', content: question }];
    const context = { adapter, dataSource, onecPublicBaseUrl: process.env.ONEC_PUBLIC_BASE_URL || '' };

    const result = await chatEngine({
      messages,
      tools: getToolsForRole(session.user.role),
      knowledge,
      executeTool: async (name, args) => {
        const startedAt = Date.now();
        try {
          const toolResult = await executeTool(name, args, session.user.role, context);
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
          if (error.code === 'FORBIDDEN') throw httpError(error.message, 403, true);
          if (error.code === 'INVALID_ARGS' || error.code === 'INVALID_PERIOD') throw httpError(error.message, 400, true);
          if (error.code === 'NOT_FOUND') throw httpError(error.message, 404, true);
          throw error;
        }
      }
    });

    const nextHistory = [...history, { role: 'user', content: question }, { role: 'assistant', content: result.answer }].slice(-30);
    histories.set(session.user.id, nextHistory);
    recordAudit({ user: session.user, requestId, event: 'chat', status: 'success', question: question.slice(0, 300) });

    return json(response, 200, {
      answer: result.answer,
      requestId,
      toolCalls: result.toolCalls,
      knowledge,
      readOnly: true,
      dataSource
    });
  }

  throw httpError('Маршрут не найден.', 404, true);
}

function authenticate(request) {
  const header = String(request.headers.authorization || '');
  if (!header.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  const session = sessions.get(token);
  if (!session || session.expiresAt < Date.now()) {
    sessions.delete(token);
    return null;
  }
  return { ...session, token };
}

async function readJson(request) {
  const chunks = [];
  let size = 0;
  for await (const chunk of request) {
    size += chunk.length;
    if (size > 1024 * 1024) throw httpError('Тело запроса слишком большое.', 413, true);
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    throw httpError('Некорректный JSON.', 400, true);
  }
}

async function serveStatic(request, response, pathname) {
  if (!['GET', 'HEAD'].includes(request.method)) throw httpError('Метод не поддерживается.', 405, true);
  const requestedPath = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.resolve(publicRoot, `.${requestedPath}`);
  if (!filePath.startsWith(`${publicRoot}${path.sep}`)) throw httpError('Недопустимый путь.', 400, true);

  try {
    const info = await stat(filePath);
    if (!info.isFile()) throw httpError('Файл не найден.', 404, true);
    response.writeHead(200, {
      'Content-Type': mimeTypes[path.extname(filePath)] || 'application/octet-stream',
      'Content-Length': info.size,
      'Cache-Control': 'no-store'
    });
    if (request.method === 'HEAD') return response.end();
    createReadStream(filePath).pipe(response);
  } catch (error) {
    if (error.code === 'ENOENT') throw httpError('Файл не найден.', 404, true);
    throw error;
  }
}

function setSecurityHeaders(response) {
  response.setHeader('X-Content-Type-Options', 'nosniff');
  response.setHeader('X-Frame-Options', 'DENY');
  response.setHeader('Referrer-Policy', 'no-referrer');
  response.setHeader('Content-Security-Policy', "default-src 'self'; connect-src 'self'; style-src 'self'; script-src 'self'; img-src 'self' data:; object-src 'none'; base-uri 'none'; frame-ancestors 'none'");
}

function json(response, status, payload) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  response.end(JSON.stringify(payload));
}

function httpError(message, statusCode, expose = false) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.expose = expose;
  return error;
}

function recordAudit(event) {
  auditLog.push({ id: randomBytes(6).toString('hex'), timestamp: new Date().toISOString(), ...event });
  if (auditLog.length > 1000) auditLog.shift();
}
