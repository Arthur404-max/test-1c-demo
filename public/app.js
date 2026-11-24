const ROLE_INFO = {
  dispatcher: { label: 'Диспетчер', letter: 'Д', description: 'Рейсы, перевозки, клиенты' },
  accountant: { label: 'Бухгалтер', letter: 'Б', description: 'Долги, отчёты, выручка' },
  manager: { label: 'Руководитель', letter: 'Р', description: 'Показатели и аналитика' },
  viewer: { label: 'Наблюдатель', letter: 'Н', description: 'Ограниченный просмотр' },
  admin: { label: 'Администратор', letter: 'А', description: 'Все инструменты и аудит' }
};

const SAMPLE_QUESTIONS = [
  { text: 'Сколько перевозок выполнили за прошлый месяц?', category: 'Перевозки', title: 'Итоги за месяц', icon: 'chart', roles: ['dispatcher', 'accountant', 'manager', 'viewer', 'admin'] },
  { text: 'Какие рейсы сейчас находятся в работе?', category: 'Операции', title: 'Рейсы в работе', icon: 'route', roles: ['dispatcher', 'manager', 'admin'] },
  { text: 'Какие клиенты должны нам деньги?', category: 'Финансы', title: 'Долги клиентов', icon: 'wallet', roles: ['accountant', 'manager', 'admin'] },
  { text: 'Найди информацию по клиенту ООО «Волга Трейд»', category: 'Клиенты', title: 'Карточка клиента', icon: 'search', roles: ['dispatcher', 'accountant', 'manager', 'admin'] },
  { text: 'Сформируй отчёт по маржинальности за текущий месяц', category: 'Аналитика', title: 'Маржинальность', icon: 'report', roles: ['accountant', 'manager', 'admin'] },
  { text: 'Какие показатели текущего месяца?', category: 'Показатели', title: 'Текущий месяц', icon: 'dashboard', roles: ['dispatcher', 'accountant', 'manager', 'admin'] },
  { text: 'Что считается выполненной перевозкой?', category: 'Правила', title: 'Определения', icon: 'book', roles: ['dispatcher', 'accountant', 'manager', 'viewer', 'admin'] },
  { text: 'Какие поля доступны в семантическом слое?', category: 'Справочник', title: 'Доступные данные', icon: 'database', roles: ['dispatcher', 'accountant', 'manager', 'viewer', 'admin'] }
];

const ICONS = {
  chart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19V9m6 10V5m6 14v-7m4 7H2"/></svg>',
  route: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="18" r="2"/><circle cx="18" cy="6" r="2"/><path d="M8 18h6a4 4 0 0 0 0-8H9a4 4 0 0 1 0-8h7"/></svg>',
  wallet: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 7h15a2 2 0 0 1 2 2v10H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12v3"/><path d="M16 12h6v4h-6a2 2 0 0 1 0-4Z"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></svg>',
  report: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z"/><path d="M14 2v6h6M8 13h8m-8 4h5"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>',
  book: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M8 7h8m-8 4h6"/></svg>',
  database: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v6c0 1.7 3.6 3 8 3s8-1.3 8-3V5M4 11v6c0 1.7 3.6 3 8 3s8-1.3 8-3v-6"/></svg>',
  copy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V4a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h4"/></svg>',
  arrow: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14m-5-5 5 5-5 5"/></svg>'
};

const STATUS_CLASSES = {
  'Завершена': 'status-success',
  'В пути': 'status-info',
  'Погрузка': 'status-warning',
  'Разгрузка': 'status-warning',
  'Запланирована': 'status-neutral',
  'Отменена': 'status-danger',
  'success': 'status-success',
  'error': 'status-danger'
};

const TOOL_LABELS = {
  get_shipments_summary: 'Сводка по перевозкам',
  list_active_shipments: 'Рейсы в работе',
  get_shipments_list: 'Список перевозок',
  list_customer_debts: 'Задолженность клиентов',
  find_customer: 'Поиск клиента',
  get_customer_details: 'Карточка клиента',
  get_shipment_details: 'Карточка перевозки',
  build_report: 'Формирование отчёта',
  get_dashboard_metrics: 'Ключевые показатели',
  search_knowledge: 'База знаний',
  get_data_dictionary: 'Словарь данных'
};

const METRIC_LABELS = {
  total: 'Всего',
  completed: 'Выполнено',
  active: 'В работе',
  planned: 'Запланировано',
  cancelled: 'Отменено',
  revenue: 'Выручка',
  cost: 'Затраты',
  profit: 'Прибыль',
  marginPercent: 'Маржа',
  customers: 'Клиентов',
  overdueTotal: 'Просрочено',
  debt: 'Долг',
  overdue: 'Просрочено'
};

const staticDemo = document.body.dataset.staticDemo === 'true';

const state = {
  token: localStorage.getItem('test-token') || '',
  user: null,
  dataSource: 'demo',
  selectedRole: 'dispatcher',
  busy: false,
  view: 'chat'
};

const elements = {
  loginScreen: document.querySelector('#login-screen'),
  appScreen: document.querySelector('#app-screen'),
  roleGrid: document.querySelector('#role-grid'),
  loginButton: document.querySelector('#login-button'),
  userAvatar: document.querySelector('#user-avatar'),
  userName: document.querySelector('#user-name'),
  userRole: document.querySelector('#user-role'),
  sourceChip: document.querySelector('#source-chip'),
  sampleQuestions: document.querySelector('#sample-questions'),
  messages: document.querySelector('#messages'),
  questionInput: document.querySelector('#question-input'),
  sendButton: document.querySelector('#send-button'),
  chatNav: document.querySelector('#chat-nav'),
  auditNav: document.querySelector('#audit-nav'),
  newChatButton: document.querySelector('#new-chat-button'),
  logoutButton: document.querySelector('#logout-button'),
  chatView: document.querySelector('#chat-view'),
  auditView: document.querySelector('#audit-view'),
  viewTitle: document.querySelector('#view-title'),
  viewSubtitle: document.querySelector('#view-subtitle'),
  auditSummary: document.querySelector('#audit-summary'),
  auditTable: document.querySelector('#audit-table'),
  toast: document.querySelector('#toast')
};

initialize();

async function initialize() {
  renderRoleCards();
  if (!state.token) return;
  try {
    const me = await api('/api/me');
    enterApp(me.user, me.dataSource);
  } catch {
    state.token = '';
    localStorage.removeItem('test-token');
  }
}

function renderRoleCards() {
  elements.roleGrid.replaceChildren();
  for (const [role, info] of Object.entries(ROLE_INFO)) {
    const button = createElement('button', `role-card${state.selectedRole === role ? ' selected' : ''}`);
    button.type = 'button';
    button.dataset.role = role;
    button.setAttribute('aria-pressed', String(state.selectedRole === role));
    button.append(
      createElement('span', 'role-icon', info.letter),
      createElement('strong', '', info.label),
      createElement('small', '', info.description)
    );
    button.addEventListener('click', () => {
      state.selectedRole = role;
      renderRoleCards();
      elements.loginButton.disabled = false;
    });
    elements.roleGrid.append(button);
  }
}

elements.loginButton.addEventListener('click', async () => {
  elements.loginButton.disabled = true;
  try {
    const result = await api('/api/login', { method: 'POST', body: JSON.stringify({ role: state.selectedRole }) });
    state.token = result.token;
    localStorage.setItem('test-token', state.token);
    enterApp(result.user, 'demo');
  } catch (error) {
    showToast(error.message);
  } finally {
    elements.loginButton.disabled = false;
  }
});

function enterApp(user, dataSource) {
  state.user = user;
  state.dataSource = dataSource;
  elements.loginScreen.hidden = true;
  elements.appScreen.hidden = false;
  elements.userAvatar.textContent = ROLE_INFO[user.role]?.letter || 'П';
  elements.userName.textContent = user.label;
  elements.userRole.textContent = user.id;
  elements.sourceChip.textContent = `Источник: ${dataSource === 'onec' ? '1С' : 'демо'}`;
  elements.auditNav.hidden = user.role !== 'admin';
  renderSampleQuestions();
  showView('chat');
  loadHistory();
}

async function loadHistory() {
  try {
    const result = await api('/api/history');
    renderHistory(result.messages || []);
  } catch (error) {
    if (!error.authExpired) showToast(error.message);
  }
}

function renderHistory(messages) {
  elements.messages.replaceChildren();
  if (!messages.length) {
    elements.messages.append(createEmptyState());
    return;
  }
  for (const message of messages) {
    if (message.role === 'user') appendUserMessage(message.content);
    else if (message.role === 'assistant') appendAssistantMessage(message.content, { toolCalls: [], knowledge: [], historical: true });
  }
  scrollToBottom();
}

function renderSampleQuestions() {
  const allowed = SAMPLE_QUESTIONS.filter((question) => question.roles.includes(state.user.role));
  elements.sampleQuestions.replaceChildren();
  for (const question of allowed) {
    const sidebarButton = createElement('button', 'sample-question', question.text);
    sidebarButton.type = 'button';
    sidebarButton.addEventListener('click', () => sendQuestion(question.text));
    elements.sampleQuestions.append(sidebarButton);
  }
}

function createEmptyState() {
  const container = createElement('div', 'empty-state');
  const head = createElement('div', 'empty-state-head');
  head.append(
    createElement('div', 'empty-kicker', 'Быстрый старт'),
    createElement('h2', '', 'Что хотите узнать?'),
    createElement('p', '', 'Выберите вопрос или сформулируйте свой.')
  );

  const grid = createElement('div', 'prompt-grid');
  const allowed = SAMPLE_QUESTIONS.filter((item) => item.roles.includes(state.user.role)).slice(0, 4);
  for (const question of allowed) {
    const button = createElement('button', 'prompt-card');
    button.type = 'button';
    const top = createElement('div', 'prompt-card-top');
    top.append(createIcon(question.icon), createElement('span', 'prompt-category', question.category), createIcon('arrow', 'prompt-arrow'));
    const title = createElement('strong', '', question.title);
    const text = createElement('span', 'prompt-text', question.text);
    button.append(top, title, text);
    button.addEventListener('click', () => sendQuestion(question.text));
    grid.append(button);
  }

  const hint = createElement('div', 'empty-shortcut');
  hint.append(createElement('kbd', '', 'Ctrl'), createElement('span', '', '+'), createElement('kbd', '', 'K'), createElement('span', '', 'чтобы перейти к вопросу'));
  container.append(head, grid, hint);
  return container;
}

async function sendQuestion(question) {
  const text = String(question || '').trim();
  if (!text || state.busy) return;
  state.busy = true;
  setBusy(true);
  showView('chat');
  elements.messages.querySelector('.empty-state')?.remove();
  appendUserMessage(text);
  const loadingMessage = appendLoadingMessage();
  scrollToBottom();

  try {
    const result = await api('/api/chat', { method: 'POST', body: JSON.stringify({ message: text }) });
    loadingMessage.remove();
    appendAssistantMessage(result.answer, result);
  } catch (error) {
    loadingMessage.remove();
    if (error.authExpired) return;
    appendAssistantMessage(`Не удалось получить ответ: ${error.message}`, { toolCalls: [], knowledge: [], error: true });
    showToast(error.message);
  } finally {
    state.busy = false;
    setBusy(false);
    elements.questionInput.value = '';
    resizeInput();
    scrollToBottom();
  }
}

function appendUserMessage(text) {
  const message = createElement('article', 'message user');
  message.append(
    createElement('div', 'message-avatar', 'Вы'),
    createMessageBody('Вы', [text])
  );
  elements.messages.append(message);
}

function appendLoadingMessage() {
  const message = createElement('article', 'message assistant loading');
  message.append(
    createElement('div', 'message-avatar', 'AI'),
    createMessageBody('Помощник', ['Анализирую вопрос и получаю данные…'])
  );
  elements.messages.append(message);
  return message;
}

function appendAssistantMessage(answer, payload = {}) {
  const message = createElement('article', `message assistant${payload.error ? ' message-error' : ''}`);
  const body = createMessageBody('Помощник', String(answer || '').split('\n').filter(Boolean));

  if (payload.toolCalls?.length) {
    const details = createElement('details', 'tool-details');
    details.append(createElement('summary', '', `Использовано инструментов: ${payload.toolCalls.length}`));
    for (const call of payload.toolCalls) details.append(renderToolCall(call));
    body.append(details);
  }

  if (payload.knowledge?.length) {
    const knowledge = createElement('details', 'knowledge-details');
    knowledge.append(createElement('summary', '', 'Использованные правила и определения'));
    for (const item of payload.knowledge) {
      const block = createElement('div', 'knowledge-item');
      block.append(createElement('strong', '', item.title), document.createTextNode(` — ${item.text}`));
      knowledge.append(block);
    }
    body.append(knowledge);
  }

  if (!payload.historical && !payload.error) {
    const meta = createElement('div', 'message-meta-row');
    const copyButton = createElement('button', 'message-action');
    copyButton.type = 'button';
    copyButton.append(createIcon('copy'), createElement('span', '', 'Копировать'));
    copyButton.addEventListener('click', async () => {
      try {
        await copyText(answer);
        showToast('Ответ скопирован');
      } catch {
        showToast('Не удалось скопировать ответ');
      }
    });
    meta.append(copyButton);
    if (payload.requestId) meta.append(createElement('span', 'request-id', `Request ID: ${payload.requestId}`));
    body.append(meta);
  }

  message.append(createElement('div', 'message-avatar', 'AI'), body);
  elements.messages.append(message);
  return message;
}

function createMessageBody(label, paragraphs) {
  const body = createElement('div', 'message-body');
  body.append(createElement('div', 'message-label', label));
  const content = createElement('div', 'message-content');
  for (const paragraph of paragraphs) content.append(createElement('p', '', paragraph));
  body.append(content);
  return body;
}

function renderToolCall(call) {
  const container = createElement('div', 'tool-call');
  const head = createElement('div', 'tool-call-head');
  head.append(
    createElement('span', 'tool-name', TOOL_LABELS[call.name] || call.name),
    createElement('span', 'badge badge-readonly', 'read-only')
  );
  container.append(head);
  if (call.args && Object.keys(call.args).length) {
    container.append(createElement('div', 'tool-args', JSON.stringify(call.args)));
  }
  const result = call.result || {};
  if (result.summary) container.append(createElement('div', 'tool-summary', result.summary));

  if (result.metrics) container.append(renderMetrics(result.metrics));
  if (result.customer) container.append(renderDetailCard(result.customer, {
    id: 'ID клиента',
    inn: 'ИНН',
    contact: 'Контакт',
    phone: 'Телефон',
    email: 'E-mail',
    manager: 'Менеджер',
    debt: 'Долг',
    overdueDebt: 'Просрочено',
    completedShipments: 'Выполнено рейсов',
    revenue: 'Выручка'
  }));
  if (result.shipment) container.append(renderDetailCard(result.shipment, {
    number: 'Номер',
    customerName: 'Клиент',
    statusLabel: 'Статус',
    driver: 'Водитель',
    vehicle: 'Автомобиль',
    cargo: 'Груз',
    weightTons: 'Вес, т',
    plannedStart: 'Начало',
    plannedEnd: 'Окончание',
    revenue: 'Выручка',
    cost: 'Затраты',
    profit: 'Прибыль'
  }));
  if (result.table) container.append(renderTable(result.table));
  if (result.links?.length) container.append(renderLinks(result.links));
  return container;
}

function renderMetrics(metrics) {
  const container = createElement('div', 'metrics');
  for (const [key, value] of Object.entries(metrics)) {
    const metric = createElement('div', 'metric');
    metric.append(
      createElement('div', 'metric-label', METRIC_LABELS[key] || key),
      createElement('div', 'metric-value', formatValue(value, ['revenue', 'cost', 'profit', 'debt', 'overdue', 'overdueTotal'].includes(key) ? 'money' : key === 'marginPercent' ? 'percent' : 'number'))
    );
    container.append(metric);
  }
  return container;
}

function renderDetailCard(data, labels) {
  const container = createElement('div', 'detail-card');
  for (const [key, label] of Object.entries(labels)) {
    if (data[key] === undefined || data[key] === null || data[key] === '') continue;
    const field = createElement('div', 'detail-field');
    field.append(
      createElement('div', 'detail-field-label', label),
      createElement('div', 'detail-field-value', formatValue(data[key], ['debt', 'overdueDebt', 'revenue', 'cost', 'profit'].includes(key) ? 'money' : 'text'))
    );
    container.append(field);
  }
  return container;
}

function renderTable(table) {
  const wrap = createElement('div', 'table-wrap');
  const element = createElement('table');
  const thead = createElement('thead');
  const headerRow = createElement('tr');
  for (const column of table.columns || []) headerRow.append(createElement('th', '', column.label));
  thead.append(headerRow);
  const tbody = createElement('tbody');
  for (const row of (table.rows || []).slice(0, 50)) {
    const rowElement = createElement('tr');
    for (const column of table.columns || []) {
      const value = row[column.key];
      const cell = createElement('td', column.type, column.type === 'status' ? '' : formatValue(value, column.type));
      if (column.type === 'status') {
        const label = formatValue(value, 'text');
        cell.append(createElement('span', `status ${STATUS_CLASSES[label] || 'status-neutral'}`, label));
      }
      rowElement.append(cell);
    }
    tbody.append(rowElement);
  }
  element.append(thead, tbody);
  wrap.append(element);
  return wrap;
}

function renderLinks(links) {
  const container = createElement('div', 'document-links');
  for (const link of links.slice(0, 12)) {
    const anchor = createElement('a', 'document-link', link.label);
    anchor.href = link.href;
    if (link.external) {
      anchor.target = '_blank';
      anchor.rel = 'noopener noreferrer';
    } else {
      anchor.href = '#';
      anchor.addEventListener('click', (event) => {
        event.preventDefault();
        sendQuestion(link.query);
      });
    }
    container.append(anchor);
  }
  return container;
}

function formatValue(value, type) {
  if (value === undefined || value === null) return '—';
  if (type === 'money') return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(Number(value));
  if (type === 'percent') return `${Number(value).toLocaleString('ru-RU')}%`;
  if (type === 'number') return Number(value).toLocaleString('ru-RU');
  if (type === 'date') {
    const date = new Date(`${value}T00:00:00`);
    return Number.isNaN(date.getTime()) ? String(value) : date.toLocaleDateString('ru-RU');
  }
  return String(value);
}

function showView(view) {
  state.view = view;
  const isChat = view === 'chat';
  elements.chatView.hidden = !isChat;
  elements.auditView.hidden = isChat;
  elements.chatNav.classList.toggle('active', isChat);
  elements.auditNav.classList.toggle('active', !isChat);
  elements.viewTitle.textContent = isChat ? 'Диалог с помощником' : 'Журнал аудита';
  elements.viewSubtitle.textContent = isChat ? 'Ответы строятся на данных и правилах семантического слоя.' : 'Каждый вызов инструмента записан с пользователем, аргументами и результатом.';
  if (!isChat) loadAudit();
  else scrollToBottom();
}

async function loadAudit() {
  try {
    const result = await api('/api/audit');
    renderAudit(result.events || []);
  } catch (error) {
    if (!error.authExpired) showToast(error.message);
  }
}

function renderAudit(events) {
  elements.auditSummary.replaceChildren();
  const success = events.filter((event) => event.status === 'success').length;
  const errors = events.length - success;
  const tools = new Set(events.map((event) => event.tool).filter(Boolean));
  elements.auditSummary.append(
    createMetricCard('Событий', events.length, 'number'),
    createMetricCard('Успешных', success, 'number'),
    createMetricCard('Ошибок', errors, 'number'),
    createMetricCard('Инструментов', tools.size, 'number')
  );

  const table = {
    columns: [
      { key: 'timestamp', label: 'Время', type: 'text' },
      { key: 'user', label: 'Пользователь', type: 'text' },
      { key: 'event', label: 'Событие', type: 'text' },
      { key: 'tool', label: 'Инструмент', type: 'text' },
      { key: 'args', label: 'Аргументы', type: 'text' },
      { key: 'status', label: 'Статус', type: 'status' },
      { key: 'durationMs', label: 'мс', type: 'number' }
    ],
    rows: events.map((event) => ({
      timestamp: new Date(event.timestamp).toLocaleString('ru-RU'),
      user: event.user?.label || '—',
      event: event.event,
      tool: TOOL_LABELS[event.tool] || event.tool || '—',
      args: event.args && Object.keys(event.args).length ? JSON.stringify(event.args) : '—',
      status: event.status,
      durationMs: event.durationMs ?? '—'
    }))
  };
  elements.auditTable.replaceChildren(renderTable(table));
}

function createMetricCard(label, value, type) {
  const card = createElement('div', 'metric');
  card.append(createElement('div', 'metric-label', label), createElement('div', 'metric-value', formatValue(value, type)));
  return card;
}

elements.chatNav.addEventListener('click', () => showView('chat'));
elements.auditNav.addEventListener('click', () => showView('audit'));

elements.newChatButton.addEventListener('click', async () => {
  try {
    await api('/api/history/clear', { method: 'POST' });
    elements.messages.replaceChildren(createEmptyState());
    showView('chat');
  } catch (error) {
    if (!error.authExpired) showToast(error.message);
  }
});

elements.logoutButton.addEventListener('click', async () => {
  try { await api('/api/logout', { method: 'POST' }); } catch { }
  state.token = '';
  state.user = null;
  localStorage.removeItem('test-token');
  elements.appScreen.hidden = true;
  elements.loginScreen.hidden = false;
});

document.querySelector('#composer').addEventListener('submit', (event) => {
  event.preventDefault();
  sendQuestion(elements.questionInput.value);
});

elements.questionInput.addEventListener('input', () => {
  resizeInput();
  elements.sendButton.disabled = state.busy || !elements.questionInput.value.trim();
});

elements.questionInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    sendQuestion(elements.questionInput.value);
  }
});

document.addEventListener('keydown', (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k' && state.user) {
    event.preventDefault();
    showView('chat');
    elements.questionInput.focus();
  }
});

function resizeInput() {
  elements.questionInput.style.height = 'auto';
  elements.questionInput.style.height = `${Math.min(elements.questionInput.scrollHeight, 130)}px`;
  elements.sendButton.disabled = state.busy || !elements.questionInput.value.trim();
}

function setBusy(busy) {
  elements.sendButton.disabled = busy || !elements.questionInput.value.trim();
  elements.questionInput.disabled = busy;
  elements.questionInput.placeholder = busy ? 'Получаю данные…' : 'Задайте вопрос по данным 1С…';
}

function scrollToBottom() {
  requestAnimationFrame(() => { elements.messages.scrollTop = elements.messages.scrollHeight; });
}

async function api(pathname, options = {}) {
  const headers = { ...(options.headers || {}) };
  if (state.token) headers.Authorization = `Bearer ${state.token}`;
  if (options.body) headers['Content-Type'] = 'application/json';
  const response = staticDemo
    ? await (await import('./src/static-api.js')).staticApi(pathname, options)
    : await fetch(pathname, { ...options, headers });
  let payload = {};
  try { payload = await response.json(); } catch { }
  if (response.status === 401 && pathname !== '/api/login') {
    resetSession();
    const error = new Error('Сессия истекла. Войдите в демо повторно.');
    error.authExpired = true;
    throw error;
  }
  if (!response.ok) throw new Error(payload.error || `HTTP ${response.status}`);
  return payload;
}

function resetSession() {
  const wasLoggedIn = Boolean(state.user);
  state.token = '';
  state.user = null;
  localStorage.removeItem('test-token');
  elements.appScreen.hidden = true;
  elements.loginScreen.hidden = false;
  elements.messages.replaceChildren();
  if (wasLoggedIn) showToast('Сессия истекла. Войдите в демо повторно.');
}

function createElement(tag, className = '', text = '') {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== '') element.textContent = text;
  return element;
}

function createIcon(name, className = '') {
  const wrapper = createElement('span', `icon${className ? ` ${className}` : ''}`);
  wrapper.setAttribute('aria-hidden', 'true');
  wrapper.innerHTML = ICONS[name] || '';
  return wrapper;
}

async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    try {
      await navigator.clipboard.writeText(text);
      return;
    } catch { }
  }
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.setAttribute('readonly', '');
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.append(textarea);
  textarea.select();
  const copied = document.execCommand('copy');
  textarea.remove();
  if (!copied) throw new Error('Copy command failed');
}

let toastTimer;
function showToast(message) {
  elements.toast.textContent = message;
  elements.toast.hidden = false;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { elements.toast.hidden = true; }, 4500);
}
