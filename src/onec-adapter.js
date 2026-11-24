export class OneCAdapter {
  constructor(env = process.env) {
    this.baseUrl = String(env.ONEC_BASE_URL || '').replace(/\/$/, '');
    this.username = env.ONEC_USERNAME || '';
    this.password = env.ONEC_PASSWORD || '';
    this.timeoutMs = Number(env.ONEC_TIMEOUT_MS || 15000);
  }

  async execute(toolName, args = {}) {
    if (!this.baseUrl) throw new Error('ONEC_BASE_URL is not configured.');
    const { path, query } = mapTool(toolName, args);
    const url = new URL(`${this.baseUrl}/${path}`);
    for (const [key, value] of Object.entries(query)) {
      if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, String(value));
    }

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        ...(this.username ? { Authorization: `Basic ${Buffer.from(`${this.username}:${this.password}`).toString('base64')}` } : {})
      },
      signal: AbortSignal.timeout(this.timeoutMs)
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`1C HTTP service returned HTTP ${response.status}: ${body.slice(0, 300)}`);
    }

    const payload = await response.json();
    const result = payload?.result ?? payload;
    if (!result || typeof result !== 'object') throw new Error('1C HTTP service returned an invalid payload.');
    return { ...result, dataSource: 'onec' };
  }
}

function mapTool(toolName, args) {
  const query = { ...args };
  switch (toolName) {
    case 'get_shipments_summary':
      return { path: 'summary', query };
    case 'list_active_shipments':
      return { path: 'active-shipments', query };
    case 'get_shipments_list':
      return { path: 'shipments', query };
    case 'list_customer_debts':
      return { path: 'debts', query };
    case 'find_customer':
      return { path: 'customers', query };
    case 'get_customer_details':
      return { path: `customers/${encodeURIComponent(args.customerId)}`, query: {} };
    case 'get_shipment_details':
      return { path: `shipments/${encodeURIComponent(args.shipmentId)}`, query: {} };
    case 'build_report':
      return { path: `reports/${encodeURIComponent(args.reportType)}`, query: { from: args.from, to: args.to } };
    case 'get_dashboard_metrics':
      return { path: 'metrics', query: {} };
    default:
      throw new Error(`Tool ${toolName} is not mapped to the 1C HTTP service.`);
  }
}
