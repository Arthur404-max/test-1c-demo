const now = new Date();

const customers = [
  {
    id: 'CUST-001',
    name: 'ООО «Северный Логистик»',
    inn: '7700000001',
    contact: 'Анна Соколова',
    phone: '+7 (900) 000-00-01',
    email: 'logistics@example.test',
    manager: 'Илья Морозов',
    debt: 485000,
    overdueDebt: 120000,
    paymentDays: 30
  },
  {
    id: 'CUST-002',
    name: 'АО «Волга Трейд»',
    inn: '7700000002',
    contact: 'Павел Орлов',
    phone: '+7 (900) 000-00-02',
    email: 'finance@example.test',
    manager: 'Илья Морозов',
    debt: 1260000,
    overdueDebt: 1260000,
    paymentDays: 21
  },
  {
    id: 'CUST-003',
    name: 'ООО «Урал Фудс»',
    inn: '7700000003',
    contact: 'Мария Белова',
    phone: '+7 (900) 000-00-03',
    email: 'supply@example.test',
    manager: 'Елена Ким',
    debt: 0,
    overdueDebt: 0,
    paymentDays: 30
  },
  {
    id: 'CUST-004',
    name: 'ООО «Сибирь Поставка»',
    inn: '7700000004',
    contact: 'Сергей Громов',
    phone: '+7 (900) 000-00-04',
    email: 'office@example.test',
    manager: 'Елена Ким',
    debt: 342500,
    overdueDebt: 0,
    paymentDays: 14
  },
  {
    id: 'CUST-005',
    name: 'ИП «Максимов А. В.»',
    inn: '7700000005',
    contact: 'Алексей Максимов',
    phone: '+7 (900) 000-00-05',
    email: 'ip@example.test',
    manager: 'Илья Морозов',
    debt: 87500,
    overdueDebt: 87500,
    paymentDays: 10
  },
  {
    id: 'CUST-006',
    name: 'ООО «Дон Ритейл»',
    inn: '7700000006',
    contact: 'Ольга Лебедева',
    phone: '+7 (900) 000-00-06',
    email: 'retail@example.test',
    manager: 'Елена Ким',
    debt: 210000,
    overdueDebt: 0,
    paymentDays: 30
  },
  {
    id: 'CUST-007',
    name: 'АО «Кама Моторс»',
    inn: '7700000007',
    contact: 'Денис Фёдоров',
    phone: '+7 (900) 000-00-07',
    email: 'parts@example.test',
    manager: 'Илья Морозов',
    debt: 764000,
    overdueDebt: 264000,
    paymentDays: 20
  },
  {
    id: 'CUST-008',
    name: 'ООО «Поволжье Строй»',
    inn: '7700000008',
    contact: 'Наталья Романова',
    phone: '+7 (900) 000-00-08',
    email: 'build@example.test',
    manager: 'Елена Ким',
    debt: 0,
    overdueDebt: 0,
    paymentDays: 25
  }
];

const routes = [
  ['Москва', 'Санкт-Петербург'],
  ['Казань', 'Екатеринбург'],
  ['Краснодар', 'Ростов-на-Дону'],
  ['Новосибирск', 'Омск'],
  ['Москва', 'Нижний Новгород'],
  ['Самара', 'Уфа'],
  ['Воронеж', 'Москва'],
  ['Пермь', 'Казань']
];

const cargo = ['Продовольственные товары', 'Строительные материалы', 'Запчасти', 'Бытовая техника', 'Текстиль'];
const drivers = ['Виктор Зайцев', 'Роман Крылов', 'Артём Соловьёв', 'Максим Волков', 'Олег Павлов'];
const vehicles = ['А 123 РУ 77', 'В 456 МО 50', 'С 789 КА 16', 'Е 321 НН 52', 'К 654 СА 63'];

function localDateInput(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function dateInMonth(monthOffset, day, hour = 9) {
  const date = new Date(now.getFullYear(), now.getMonth() + monthOffset, day, hour, 0, 0);
  return localDateInput(date);
}

function addHours(dateInput, hours) {
  const date = new Date(`${dateInput}T09:00:00`);
  date.setHours(date.getHours() + hours);
  return localDateInput(date);
}

const shipments = [];
let shipmentNumber = 1;

function addShipment({ monthOffset, day, status, customerIndex, revenue, cost, actualStart, actualEnd }) {
  const customer = customers[customerIndex % customers.length];
  const route = routes[(shipmentNumber - 1) % routes.length];
  const plannedStart = dateInMonth(monthOffset, day);
  const id = `SHIP-${localDateInput(now).replaceAll('-', '')}-${String(shipmentNumber).padStart(4, '0')}`;
  shipments.push({
    id,
    number: `Р-${String(shipmentNumber).padStart(4, '0')}`,
    customerId: customer.id,
    customerName: customer.name,
    route: { from: route[0], to: route[1] },
    plannedStart,
    plannedEnd: addHours(plannedStart, 18),
    actualStart: actualStart || null,
    actualEnd: actualEnd || null,
    status,
    vehicle: vehicles[(shipmentNumber - 1) % vehicles.length],
    driver: drivers[(shipmentNumber - 1) % drivers.length],
    cargo: cargo[(shipmentNumber - 1) % cargo.length],
    weightTons: 4 + (shipmentNumber % 8) * 1.5,
    revenue,
    cost,
    documentRef: `Документ.Перевозка/${id}`
  });
  shipmentNumber += 1;
}

for (let day = 2; day <= 27; day += 3) {
  addShipment({
    monthOffset: -1,
    day,
    status: 'completed',
    customerIndex: day,
    revenue: 145000 + day * 3200,
    cost: 118000 + day * 2100,
    actualStart: dateInMonth(-1, day),
    actualEnd: addHours(dateInMonth(-1, day), 17)
  });
}

addShipment({ monthOffset: 0, day: 2, status: 'completed', customerIndex: 2, revenue: 188000, cost: 151000, actualStart: dateInMonth(0, 2), actualEnd: addHours(dateInMonth(0, 2), 16) });
addShipment({ monthOffset: 0, day: 5, status: 'completed', customerIndex: 3, revenue: 212000, cost: 173000, actualStart: dateInMonth(0, 5), actualEnd: addHours(dateInMonth(0, 5), 20) });
addShipment({ monthOffset: 0, day: Math.max(1, now.getDate() - 1), status: 'in_transit', customerIndex: 0, revenue: 196000, cost: 162000, actualStart: dateInMonth(0, Math.max(1, now.getDate() - 1)) });
addShipment({ monthOffset: 0, day: Math.max(1, now.getDate()), status: 'loading', customerIndex: 6, revenue: 245000, cost: 201000, actualStart: dateInMonth(0, Math.max(1, now.getDate())) });
addShipment({ monthOffset: 0, day: Math.min(28, now.getDate() + 1), status: 'planned', customerIndex: 1, revenue: 174000, cost: 139000 });
addShipment({ monthOffset: 0, day: Math.min(28, now.getDate() + 2), status: 'planned', customerIndex: 4, revenue: 159000, cost: 128000 });
addShipment({ monthOffset: 0, day: Math.min(28, now.getDate() + 3), status: 'planned', customerIndex: 5, revenue: 223000, cost: 182000 });
addShipment({ monthOffset: 0, day: Math.min(28, now.getDate() + 4), status: 'cancelled', customerIndex: 7, revenue: 132000, cost: 98000 });

const invoices = customers.flatMap((customer, index) => {
  if (customer.debt === 0) return [];
  return [{
    id: `INV-${String(index + 1).padStart(4, '0')}`,
    customerId: customer.id,
    amount: customer.debt,
    paidAmount: 0,
    dueDate: customer.overdueDebt > 0
      ? dateInMonth(-1, 5 + index)
      : dateInMonth(0, Math.min(28, now.getDate() + 7 + index)),
    issuedDate: dateInMonth(customer.overdueDebt > 0 ? -1 : 0, 1 + index)
  }];
});

export const demoData = {
  generatedAt: now.toISOString(),
  customers,
  shipments,
  invoices
};

export function getMonthBounds(offset = 0) {
  const start = new Date(now.getFullYear(), now.getMonth() + offset, 1);
  const end = new Date(now.getFullYear(), now.getMonth() + offset + 1, 0);
  return { from: localDateInput(start), to: localDateInput(end) };
}

export function toDateInput(value = new Date()) {
  return localDateInput(value);
}
