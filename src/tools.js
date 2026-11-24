import { demoData, getMonthBounds, toDateInput } from './demo-data.js';
import { knowledgeItems, searchKnowledge } from './knowledge.js';

export const roles = {
  dispatcher: {
    label: 'Диспетчер',
    tools: ['get_shipments_summary', 'list_active_shipments', 'get_shipments_list', 'find_customer', 'get_customer_details', 'get_shipment_details', 'get_dashboard_metrics', 'search_knowledge', 'get_data_dictionary']
  },
  accountant: {
    label: 'Бухгалтер',
    tools: ['get_shipments_summary', 'get_shipments_list', 'list_customer_debts', 'find_customer', 'get_customer_details', 'get_shipment_details', 'build_report', 'get_dashboard_metrics', 'search_knowledge', 'get_data_dictionary']
  },
  manager: {
    label: 'Руководитель',
    tools: ['get_shipments_summary', 'list_active_shipments', 'get_shipments_list', 'list_customer_debts', 'find_customer', 'get_customer_details', 'get_shipment_details', 'build_report', 'get_dashboard_metrics', 'search_knowledge', 'get_data_dictionary']
  },
  viewer: {
    label: 'Наблюдатель',
    tools: ['get_shipments_summary', 'search_knowledge', 'get_data_dictionary']
  },
  admin: {
    label: 'Администратор',
    tools: ['get_shipments_summary', 'list_active_shipments', 'get_shipments_list', 'list_customer_debts', 'find_customer', 'get_customer_details', 'get_shipment_details', 'build_report', 'get_dashboard_metrics', 'search_knowledge', 'get_data_dictionary']
  }
};

const periodSchema = {
  type: 'object',
  properties: {
    from: { type: 'string', description: 'Начало периода в формате YYYY-MM-DD' },
    to: { type: 'string', description: 'Конец периода в формате YYYY-MM-DD' }
  },
  additionalProperties: false
};

export const TOOLS = [
  {
    name: 'get_shipments_summary',
    description: 'Возвращает количество и финансовые показатели перевозок за период.',
    roles: Object.keys(roles),
    parameters: periodSchema,
    handler: ({ from, to }, context) => summarizeShipments(from, to, context)
  },
  {
    name: 'list_active_shipments',
    description: 'Возвращает рейсы, которые сейчас находятся в работе: погрузка, в пути или разгрузка.',
    roles: ['dispatcher', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        routeFrom: { type: 'string', description: 'Необязательный фильтр по городу отправления' },
        routeTo: { type: 'string', description: 'Необязательный фильтр по городу назначения' }
      },
      additionalProperties: false
    },
    handler: ({ routeFrom, routeTo }, context) => listActiveShipments(routeFrom, routeTo, context)
  },
  {
    name: 'get_shipments_list',
    description: 'Возвращает список перевозок за период с возможностью фильтра по статусу.',
    roles: ['dispatcher', 'accountant', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        from: { type: 'string', description: 'Начало периода YYYY-MM-DD' },
        to: { type: 'string', description: 'Конец периода YYYY-MM-DD' },
        status: { type: 'string', enum: ['completed', 'loading', 'in_transit', 'unloading', 'planned', 'cancelled'], description: 'Необязательный статус перевозки' }
      },
      additionalProperties: false
    },
    handler: (args, context) => listShipments(args.from, args.to, args.status, context)
  },
  {
    name: 'list_customer_debts',
    description: 'Возвращает задолженность клиентов на выбранную дату.',
    roles: ['accountant', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        asOf: { type: 'string', description: 'Дата расчёта долга YYYY-MM-DD' },
        onlyOverdue: { type: 'boolean', description: 'Показывать только просроченную задолженность' },
        minAmount: { type: 'number', minimum: 0, description: 'Минимальная сумма долга в рублях' }
      },
      additionalProperties: false
    },
    handler: ({ asOf, onlyOverdue, minAmount }, context) => listCustomerDebts(asOf, onlyOverdue, minAmount, context)
  },
  {
    name: 'find_customer',
    description: 'Ищет клиента по названию, ИНН или внутреннему идентификатору.',
    roles: ['dispatcher', 'accountant', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 2, description: 'Название, ИНН или идентификатор клиента' }
      },
      required: ['query'],
      additionalProperties: false
    },
    handler: ({ query }, context) => findCustomer(query, context)
  },
  {
    name: 'get_customer_details',
    description: 'Возвращает карточку клиента, его перевозки и задолженность.',
    roles: ['dispatcher', 'accountant', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        customerId: { type: 'string', description: 'Внутренний идентификатор клиента' }
      },
      required: ['customerId'],
      additionalProperties: false
    },
    handler: ({ customerId }, context) => getCustomerDetails(customerId, context)
  },
  {
    name: 'get_shipment_details',
    description: 'Возвращает подробную карточку конкретной перевозки.',
    roles: ['dispatcher', 'accountant', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        shipmentId: { type: 'string', description: 'Внутренний идентификатор или номер перевозки' }
      },
      required: ['shipmentId'],
      additionalProperties: false
    },
    handler: ({ shipmentId }, context) => getShipmentDetails(shipmentId, context)
  },
  {
    name: 'build_report',
    description: 'Формирует read-only отчёт за период: перевозки, клиенты, долги или маржинальность.',
    roles: ['accountant', 'manager', 'admin'],
    parameters: {
      type: 'object',
      properties: {
        reportType: { type: 'string', enum: ['shipments', 'customers', 'debts', 'profitability'], description: 'Тип отчёта' },
        from: { type: 'string', description: 'Начало периода YYYY-MM-DD' },
        to: { type: 'string', description: 'Конец периода YYYY-MM-DD' }
      },
      required: ['reportType'],
      additionalProperties: false
    },
    handler: ({ reportType, from, to }, context) => buildReport(reportType, from, to, context)
  },
  {
    name: 'get_dashboard_metrics',
    description: 'Возвращает ключевые показатели текущего месяца: перевозки, рейсы в работе, выручка и долги.',
    roles: ['dispatcher', 'accountant', 'manager', 'admin'],
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    handler: (args, context) => dashboardMetrics(context)
  },
  {
    name: 'search_knowledge',
    description: 'Ищет определения, регламенты и правила в базе знаний помощника.',
    roles: Object.keys(roles),
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', minLength: 2, description: 'Поисковый запрос' }
      },
      required: ['query'],
      additionalProperties: false
    },
    handler: ({ query }) => ({ knowledge: searchKnowledge(query), dataSource: 'knowledge' })
  },
  {
    name: 'get_data_dictionary',
    description: 'Возвращает доступные поля и определения семантического слоя.',
    roles: Object.keys(roles),
    parameters: { type: 'object', properties: {}, additionalProperties: false },
    handler: () => ({
      dictionary: [
        { field: 'shipment.status', definition: 'Статус перевозки: planned, loading, in_transit, unloading, completed, cancelled' },
        { field: 'shipment.actualEnd', definition: 'Фактическая дата окончания перевозки' },
        { field: 'shipment.revenue', definition: 'Выручка по перевозке в рублях' },
        { field: 'shipment.cost', definition: 'Затраты по перевозке в рублях' },
        { field: 'invoice.amount', definition: 'Сумма счёта в рублях' },
        { field: 'invoice.dueDate', definition: 'Срок оплаты счёта' },
        { field: 'customer.debt', definition: 'Текущая неоплаченная задолженность клиента' }
      ],
      dataSource: 'dictionary'
    })
  }
];

const toolsByName = new Map(TOOLS.map((tool) => [tool.name, tool]));

export class ToolError extends Error {
  constructor(message, code = 'TOOL_ERROR') {
    super(message);
    this.name = 'ToolError';
    this.code = code;
  }
}

export function getToolsForRole(role) {
  return TOOLS.filter((tool) => tool.roles.includes(role)).map(({ name, description, parameters }) => ({
    type: 'function',
    function: { name, description, parameters }
  }));
}

export function executeTool(name, args = {}, role, context = {}) {
  const tool = toolsByName.get(name);
  if (!tool) throw new ToolError('Инструмент не найден.', 'UNKNOWN_TOOL');
  if (!tool.roles.includes(role)) throw new ToolError('Недостаточно прав для выполнения инструмента.', 'FORBIDDEN');
  if (!args || typeof args !== 'object' || Array.isArray(args)) throw new ToolError('Некорректные аргументы инструмента.', 'INVALID_ARGS');

  validateArguments(tool, args);
  if (context.adapter && !['search_knowledge', 'get_data_dictionary'].includes(name)) {
    return context.adapter.execute(name, args);
  }
  return tool.handler(args, { data: context.data || demoData, ...context });
}

function validateArguments(tool, args) {
  const properties = tool.parameters?.properties || {};
  for (const required of tool.parameters?.required || []) {
    if (args[required] === undefined || args[required] === null || args[required] === '') {
      throw new ToolError(`Не указан обязательный аргумент: ${required}.`, 'INVALID_ARGS');
    }
  }
  for (const [key, value] of Object.entries(args)) {
    if (!(key in properties)) throw new ToolError(`Неизвестный аргумент: ${key}.`, 'INVALID_ARGS');
    const schema = properties[key];
    if (schema.enum && !schema.enum.includes(value)) throw new ToolError(`Недопустимое значение аргумента: ${key}.`, 'INVALID_ARGS');
    if (schema.type === 'string' && typeof value !== 'string') throw new ToolError(`Аргумент ${key} должен быть строкой.`, 'INVALID_ARGS');
    if (schema.type === 'number' && (typeof value !== 'number' || Number.isNaN(value))) throw new ToolError(`Аргумент ${key} должен быть числом.`, 'INVALID_ARGS');
    if (schema.type === 'boolean' && typeof value !== 'boolean') throw new ToolError(`Аргумент ${key} должен быть логическим.`, 'INVALID_ARGS');
    if (schema.minLength && value.length < schema.minLength) throw new ToolError(`Аргумент ${key} слишком короткий.`, 'INVALID_ARGS');
    if (schema.minimum !== undefined && value < schema.minimum) throw new ToolError(`Аргумент ${key} меньше допустимого значения.`, 'INVALID_ARGS');
    if ((key === 'from' || key === 'to' || key === 'asOf') && !isValidDate(value)) throw new ToolError(`Аргумент ${key} должен быть корректной датой YYYY-MM-DD.`, 'INVALID_ARGS');
  }
}

function isValidDate(value) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && toDateInput(date) === value;
}

function resolvePeriod(from, to) {
  const resolvedFrom = from || getMonthBounds(0).from;
  const resolvedTo = to || getMonthBounds(0).to;
  if (resolvedFrom > resolvedTo) throw new ToolError('Начало периода позже конца периода.', 'INVALID_PERIOD');
  return { from: resolvedFrom, to: resolvedTo };
}

function inPeriod(shipment, from, to) {
  const date = shipment.actualEnd || shipment.plannedStart;
  return date >= from && date <= to;
}

function shipmentLinks(shipments, context) {
  return shipments.map((shipment) => ({
    label: `${shipment.number}: ${shipment.route.from} → ${shipment.route.to}`,
    href: context.onecPublicBaseUrl
      ? `${context.onecPublicBaseUrl.replace(/\/$/, '')}/${encodeURIComponent(shipment.documentRef)}`
      : `#/shipments/${encodeURIComponent(shipment.number)}`,
    query: `Покажи детали перевозки ${shipment.number}`,
    documentRef: shipment.documentRef,
    external: Boolean(context.onecPublicBaseUrl)
  }));
}

function summarizeShipments(from, to, context) {
  const period = resolvePeriod(from, to);
  const selected = context.data.shipments.filter((shipment) => inPeriod(shipment, period.from, period.to));
  const completed = selected.filter((shipment) => shipment.status === 'completed');
  const active = selected.filter((shipment) => ['loading', 'in_transit', 'unloading'].includes(shipment.status));
  const revenue = completed.reduce((sum, shipment) => sum + shipment.revenue, 0);
  const cost = completed.reduce((sum, shipment) => sum + shipment.cost, 0);
  return {
    summary: `За период ${period.from} — ${period.to} выполнено ${completed.length} перевозок.`,
    period,
    metrics: {
      total: selected.length,
      completed: completed.length,
      active: active.length,
      planned: selected.filter((shipment) => shipment.status === 'planned').length,
      cancelled: selected.filter((shipment) => shipment.status === 'cancelled').length,
      revenue,
      cost,
      profit: revenue - cost,
      marginPercent: revenue ? Math.round(((revenue - cost) / revenue) * 1000) / 10 : 0
    },
    links: shipmentLinks(completed.slice(0, 10), context),
    dataSource: context.dataSource || 'demo'
  };
}

function listActiveShipments(routeFrom, routeTo, context) {
  const selected = context.data.shipments.filter((shipment) =>
    ['loading', 'in_transit', 'unloading'].includes(shipment.status)
    && (!routeFrom || shipment.route.from.toLocaleLowerCase('ru-RU').includes(routeFrom.toLocaleLowerCase('ru-RU')))
    && (!routeTo || shipment.route.to.toLocaleLowerCase('ru-RU').includes(routeTo.toLocaleLowerCase('ru-RU')))
  );
  return {
    summary: `Сейчас в работе ${selected.length} рейсов.`,
    table: {
      columns: [
        { key: 'number', label: 'Рейс', type: 'text' },
        { key: 'customerName', label: 'Клиент', type: 'text' },
        { key: 'route', label: 'Маршрут', type: 'text' },
        { key: 'statusLabel', label: 'Статус', type: 'status' },
        { key: 'driver', label: 'Водитель', type: 'text' },
        { key: 'vehicle', label: 'Автомобиль', type: 'text' },
        { key: 'plannedEnd', label: 'План, окончание', type: 'date' }
      ],
      rows: selected.map((shipment) => ({
        number: shipment.number,
        customerName: shipment.customerName,
        route: `${shipment.route.from} → ${shipment.route.to}`,
        statusLabel: statusLabel(shipment.status),
        driver: shipment.driver,
        vehicle: shipment.vehicle,
        plannedEnd: shipment.plannedEnd
      }))
    },
    links: shipmentLinks(selected, context),
    dataSource: context.dataSource || 'demo'
  };
}

function listShipments(from, to, status, context) {
  const period = resolvePeriod(from, to);
  const selected = context.data.shipments.filter((shipment) =>
    inPeriod(shipment, period.from, period.to) && (!status || shipment.status === status)
  );
  return {
    summary: `Найдено ${selected.length} перевозок за ${period.from} — ${period.to}.`,
    period,
    table: {
      columns: [
        { key: 'number', label: 'Рейс', type: 'text' },
        { key: 'customerName', label: 'Клиент', type: 'text' },
        { key: 'route', label: 'Маршрут', type: 'text' },
        { key: 'statusLabel', label: 'Статус', type: 'status' },
        { key: 'plannedStart', label: 'Дата', type: 'date' },
        { key: 'revenue', label: 'Выручка, ₽', type: 'money' }
      ],
      rows: selected.map((shipment) => ({
        number: shipment.number,
        customerName: shipment.customerName,
        route: `${shipment.route.from} → ${shipment.route.to}`,
        statusLabel: statusLabel(shipment.status),
        plannedStart: shipment.plannedStart,
        revenue: shipment.revenue
      }))
    },
    links: shipmentLinks(selected.slice(0, 30), context),
    dataSource: context.dataSource || 'demo'
  };
}

function listCustomerDebts(asOf, onlyOverdue, minAmount, context) {
  const date = asOf || toDateInput();
  const minimum = minAmount || 0;
  const rows = context.data.invoices
    .filter((invoice) => invoice.issuedDate <= date && invoice.amount - invoice.paidAmount >= minimum)
    .map((invoice) => {
      const customer = context.data.customers.find((item) => item.id === invoice.customerId);
      const amount = invoice.amount - invoice.paidAmount;
      const overdue = invoice.dueDate < date;
      return {
        customerId: customer.id,
        customer: customer.name,
        inn: customer.inn,
        amount,
        overdueAmount: overdue ? amount : 0,
        dueDate: invoice.dueDate,
        overdue,
        manager: customer.manager
      };
    })
    .filter((row) => !onlyOverdue || row.overdue)
    .sort((a, b) => b.amount - a.amount);
  const total = rows.reduce((sum, row) => sum + row.amount, 0);
  const overdueTotal = rows.reduce((sum, row) => sum + row.overdueAmount, 0);
  return {
    summary: `На ${date} задолженность ${rows.length} клиентов составляет ${formatMoney(total)}. Просрочено: ${formatMoney(overdueTotal)}.`,
    asOf: date,
    metrics: { customers: rows.length, total, overdueTotal },
    table: {
      columns: [
        { key: 'customer', label: 'Клиент', type: 'text' },
        { key: 'inn', label: 'ИНН', type: 'text' },
        { key: 'amount', label: 'Долг, ₽', type: 'money' },
        { key: 'overdueAmount', label: 'Просрочено, ₽', type: 'money' },
        { key: 'dueDate', label: 'Срок оплаты', type: 'date' },
        { key: 'manager', label: 'Менеджер', type: 'text' }
      ],
      rows
    },
    dataSource: context.dataSource || 'demo'
  };
}

function findCustomer(query, context) {
  const normalized = normalizeCustomerSearch(query);
  const terms = normalized.split(' ').filter(Boolean);
  const rows = context.data.customers.filter((customer) => {
    const name = normalizeCustomerSearch(customer.name);
    const direct = `${customer.id} ${customer.inn}`.toLocaleLowerCase('ru-RU').includes(query.toLocaleLowerCase('ru-RU'));
    return direct || (normalized.length > 1 && name.includes(normalized)) || (terms.length > 0 && terms.every((term) => name.includes(term)));
  });
  return {
    summary: rows.length ? `Найдено клиентов: ${rows.length}.` : 'Клиенты по заданному запросу не найдены.',
    table: {
      columns: [
        { key: 'id', label: 'ID', type: 'text' },
        { key: 'name', label: 'Клиент', type: 'text' },
        { key: 'inn', label: 'ИНН', type: 'text' },
        { key: 'manager', label: 'Менеджер', type: 'text' },
        { key: 'debt', label: 'Долг, ₽', type: 'money' }
      ],
      rows
    },
    dataSource: context.dataSource || 'demo'
  };
}

function getCustomerDetails(customerId, context) {
  const customer = context.data.customers.find((item) => item.id === customerId || item.inn === customerId);
  if (!customer) throw new ToolError('Клиент не найден.', 'NOT_FOUND');
  const shipments = context.data.shipments.filter((shipment) => shipment.customerId === customer.id);
  const revenue = shipments.filter((shipment) => shipment.status === 'completed').reduce((sum, shipment) => sum + shipment.revenue, 0);
  return {
    summary: `${customer.name}, ИНН ${customer.inn}. Долг: ${formatMoney(customer.debt)}.`,
    customer: {
      id: customer.id,
      name: customer.name,
      inn: customer.inn,
      contact: customer.contact,
      phone: customer.phone,
      email: customer.email,
      manager: customer.manager,
      debt: customer.debt,
      overdueDebt: customer.overdueDebt,
      completedShipments: shipments.filter((shipment) => shipment.status === 'completed').length,
      revenue
    },
    table: {
      columns: [
        { key: 'number', label: 'Рейс', type: 'text' },
        { key: 'route', label: 'Маршрут', type: 'text' },
        { key: 'statusLabel', label: 'Статус', type: 'status' },
        { key: 'plannedStart', label: 'Дата', type: 'date' },
        { key: 'revenue', label: 'Выручка, ₽', type: 'money' }
      ],
      rows: shipments.map((shipment) => ({
        number: shipment.number,
        route: `${shipment.route.from} → ${shipment.route.to}`,
        statusLabel: statusLabel(shipment.status),
        plannedStart: shipment.plannedStart,
        revenue: shipment.revenue
      }))
    },
    links: shipmentLinks(shipments, context),
    dataSource: context.dataSource || 'demo'
  };
}

function getShipmentDetails(shipmentId, context) {
  const shipment = context.data.shipments.find((item) => item.id === shipmentId || item.number.toLocaleLowerCase('ru-RU') === shipmentId.toLocaleLowerCase('ru-RU'));
  if (!shipment) throw new ToolError('Перевозка не найдена.', 'NOT_FOUND');
  return {
    summary: `${shipment.number}: ${shipment.route.from} → ${shipment.route.to}, статус «${statusLabel(shipment.status)}».`,
    shipment: {
      ...shipment,
      statusLabel: statusLabel(shipment.status),
      profit: shipment.revenue - shipment.cost
    },
    links: shipmentLinks([shipment], context),
    dataSource: context.dataSource || 'demo'
  };
}

function buildReport(reportType, from, to, context) {
  const period = resolvePeriod(from, to);
  const selected = context.data.shipments.filter((shipment) => inPeriod(shipment, period.from, period.to));

  if (reportType === 'shipments') return listShipments(period.from, period.to, undefined, context);

  if (reportType === 'debts') return listCustomerDebts(period.to, false, 0, context);

  if (reportType === 'customers') {
    const grouped = new Map();
    for (const shipment of selected) {
      const key = shipment.customerId;
      const row = grouped.get(key) || { customer: shipment.customerName, shipments: 0, completed: 0, revenue: 0, cost: 0 };
      row.shipments += 1;
      row.revenue += shipment.revenue;
      row.cost += shipment.cost;
      if (shipment.status === 'completed') row.completed += 1;
      grouped.set(key, row);
    }
    const rows = [...grouped.values()].map((row) => ({ ...row, profit: row.revenue - row.cost }));
    return {
      summary: `Отчёт по клиентам за ${period.from} — ${period.to}: ${rows.length} клиентов.`,
      period,
      table: {
        columns: [
          { key: 'customer', label: 'Клиент', type: 'text' },
          { key: 'shipments', label: 'Перевозок', type: 'number' },
          { key: 'completed', label: 'Выполнено', type: 'number' },
          { key: 'revenue', label: 'Выручка, ₽', type: 'money' },
          { key: 'cost', label: 'Затраты, ₽', type: 'money' },
          { key: 'profit', label: 'Прибыль, ₽', type: 'money' }
        ],
        rows
      },
      dataSource: context.dataSource || 'demo'
    };
  }

  const grouped = new Map();
  for (const shipment of selected.filter((item) => item.status === 'completed')) {
    const key = `${shipment.route.from} → ${shipment.route.to}`;
    const row = grouped.get(key) || { route: key, completed: 0, revenue: 0, cost: 0 };
    row.completed += 1;
    row.revenue += shipment.revenue;
    row.cost += shipment.cost;
    grouped.set(key, row);
  }
  const rows = [...grouped.values()].map((row) => ({
    ...row,
    profit: row.revenue - row.cost,
    marginPercent: row.revenue ? Math.round(((row.revenue - row.cost) / row.revenue) * 1000) / 10 : 0
  }));
  return {
    summary: `Отчёт по маржинальности за ${period.from} — ${period.to}: ${rows.length} маршрутов.`,
    period,
    table: {
      columns: [
        { key: 'route', label: 'Маршрут', type: 'text' },
        { key: 'completed', label: 'Выполнено', type: 'number' },
        { key: 'revenue', label: 'Выручка, ₽', type: 'money' },
        { key: 'cost', label: 'Затраты, ₽', type: 'money' },
        { key: 'profit', label: 'Прибыль, ₽', type: 'money' },
        { key: 'marginPercent', label: 'Маржа, %', type: 'percent' }
      ],
      rows
    },
    dataSource: context.dataSource || 'demo'
  };
}

function dashboardMetrics(context) {
  const bounds = getMonthBounds(0);
  const month = context.data.shipments.filter((shipment) => inPeriod(shipment, bounds.from, bounds.to));
  const completed = month.filter((shipment) => shipment.status === 'completed');
  const active = context.data.shipments.filter((shipment) => ['loading', 'in_transit', 'unloading'].includes(shipment.status));
  const debt = context.data.customers.reduce((sum, customer) => sum + customer.debt, 0);
  const overdue = context.data.customers.reduce((sum, customer) => sum + customer.overdueDebt, 0);
  const revenue = completed.reduce((sum, shipment) => sum + shipment.revenue, 0);
  const cost = completed.reduce((sum, shipment) => sum + shipment.cost, 0);
  return {
    summary: `Текущий месяц: выполнено ${completed.length} перевозок, в работе ${active.length} рейсов.`,
    period: bounds,
    metrics: { completed: completed.length, active: active.length, debt, overdue, revenue, cost, profit: revenue - cost },
    links: shipmentLinks(active, context),
    dataSource: context.dataSource || 'demo'
  };
}

function statusLabel(status) {
  return {
    completed: 'Завершена',
    loading: 'Погрузка',
    in_transit: 'В пути',
    unloading: 'Разгрузка',
    planned: 'Запланирована',
    cancelled: 'Отменена'
  }[status] || status;
}

function normalizeCustomerSearch(value) {
  return String(value)
    .toLocaleLowerCase('ru-RU')
    .replaceAll('ё', 'е')
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .replace(/(^|\s)(ооо|ао|пао|зао|ип)(?=\s|$)/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function formatMoney(value) {
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 }).format(value);
}

export const knowledgeCatalog = knowledgeItems;
