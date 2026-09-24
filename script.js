// ===================== Константы =====================
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const STORAGE_KEY = 'yandexTicketsData';

// ===================== DOM =====================
const appRoot = document.getElementById('appRoot');
const bottomNav = document.getElementById('bottomNav');

// Экраны
const scheduleView = document.getElementById('scheduleView');
const ticketsView = document.getElementById('ticketsView');
const ticketDetailView = document.getElementById('ticketDetailView');
const createTicketView = document.getElementById('createTicketView');

// Расписание
const scheduleFrom = document.getElementById('scheduleFrom');
const scheduleTo = document.getElementById('scheduleTo');
const swapScheduleBtn = document.getElementById('swapScheduleBtn');
const findScheduleBtn = document.getElementById('findScheduleBtn');
const scheduleList = document.getElementById('scheduleList');

// Билеты
const ticketsList = document.getElementById('ticketsList');
const tabs = document.querySelectorAll('.tab');

// Детали билета
const detailDepartureTime = document.getElementById('detailDepartureTime');
const detailArrivalTime = document.getElementById('detailArrivalTime');
const detailFrom = document.getElementById('detailFrom');
const detailTo = document.getElementById('detailTo');
const detailDate = document.getElementById('detailDate');
const detailType = document.getElementById('detailType');
const detailPrice = document.getElementById('detailPrice');
const detailNo = document.getElementById('detailNo');
const barcodeImg = document.getElementById('barcodeImg');
const backFromDetail = document.getElementById('backFromDetail');
const helperToggle = document.getElementById('helperToggle');
const helperBody = document.getElementById('helperBody');
const helperChev = document.getElementById('helperChev');

// Создание билета
const createFrom = document.getElementById('createFrom');
const createTo = document.getElementById('createTo');
const createDate = document.getElementById('createDate');
const createTrainType = document.getElementById('createTrainType');
const createPrice = document.getElementById('createPrice');
const saveTicketBtn = document.getElementById('saveTicketBtn');
const backFromCreate = document.getElementById('backFromCreate');

// Навигация
const navItems = document.querySelectorAll('.nav-item');

// ===================== Состояние =====================
let tickets = [];
let currentTab = 'active';
let currentTicket = null;

// ===================== Хаптика =====================
function haptic(style){
  try{
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style || 'light');
    }
  }catch(e){}
}

// ===================== Яркость =====================
function setMaxBrightness() {
  try {
    if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.setBrightness === 'function') {
      window.Telegram.WebApp.setBrightness(1.0);
    }
  } catch(e) {}
}

function restoreBrightness() {
  try {
    if (window.Telegram && window.Telegram.WebApp && typeof window.Telegram.WebApp.setBrightness === 'function') {
      window.Telegram.WebApp.setBrightness(0.5);
    }
  } catch(e) {}
}

// ===================== LocalStorage =====================
function loadData(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  }catch(e){}
  return [];
}

function saveData(){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets)); }catch(e){}
}

// ===================== Форматирование =====================
function formatDateRu(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  if(isNaN(d)) return dateStr;
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

function generateTicketNumber(){
  let num = '3';
  for(let i=0; i<12; i++) num += Math.floor(Math.random()*10);
  return `№ ${num}`;
}

// ===================== Рендер списка билетов =====================
function renderTickets() {
  if (!ticketsList) return;
  const filtered = tickets.filter(t => t.status === currentTab);
  
  if (filtered.length === 0) {
    ticketsList.innerHTML = `<div class="empty-state">Нет ${currentTab === 'active' ? 'действующих' : 'использованных'} билетов</div>`;
    return;
  }

  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  ticketsList.innerHTML = filtered.map(t => `
    <div class="ticket-card" data-id="${t.id}">
      <div class="card-top">
        <div class="card-route">${t.from} → ${t.to}</div>
        <div class="card-date">${formatDateRu(t.date)}</div>
      </div>
      <div class="card-bottom">
        <span class="card-price">${t.price} ₽</span>
        <span class="card-no">${t.ticketNo}</span>
      </div>
    </div>
  `).join('');

  document.querySelectorAll('.ticket-card').forEach(card => {
    card.addEventListener('click', () => {
      const id = parseInt(card.dataset.id);
      const ticket = tickets.find(t => t.id === id);
      if (ticket) openTicketDetail(ticket);
    });
  });
}

// ===================== Открытие деталей билета =====================
function openTicketDetail(ticket) {
  currentTicket = ticket;
  
  detailFrom.textContent = ticket.from;
  detailTo.textContent = ticket.to;
  detailDate.textContent = formatDateRu(ticket.date);
  detailType.textContent = `Полный, ${ticket.trainType.toLowerCase()}`;
  detailPrice.textContent = `${ticket.price} ₽`;
  detailNo.textContent = ticket.ticketNo;
  
  // Генерация случайного времени для вида
  const depHour = 9 + Math.floor(Math.random() * 10);
  const depMin = Math.floor(Math.random() * 60);
  const arrHour = depHour + 1;
  const arrMin = Math.floor(Math.random() * 60);
  
  detailDepartureTime.textContent = `${String(depHour).padStart(2,'0')}:${String(depMin).padStart(2,'0')}`;
  detailArrivalTime.textContent = `${String(arrHour).padStart(2,'0')}:${String(arrMin).padStart(2,'0')}`;
  
  if (helperBody) helperBody.classList.add('hidden');
  if (helperChev) helperChev.classList.remove('open');
  
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  ticketDetailView.classList.remove('hidden');
  
  if (bottomNav) bottomNav.style.display = 'none';
  if (appRoot) appRoot.classList.add('ticket-mode');
  
  setMaxBrightness();
  haptic('medium');
}

// ===================== Навигация =====================
function switchView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  const target = document.getElementById(viewId);
  if (target) target.classList.remove('hidden');
  
  if (bottomNav) bottomNav.style.display = 'flex';
  if (appRoot) appRoot.classList.remove('ticket-mode');
  
  navItems.forEach(item => {
    item.classList.toggle('active', item.dataset.view === viewId);
  });

  if (viewId === 'ticketsView') {
    renderTickets();
  }
}

// ===================== Создание билета =====================
function createTicket() {
  const from = createFrom.value.trim() || 'Откуда';
  const to = createTo.value.trim() || 'Куда';
  const date = createDate.value || new Date().toISOString().slice(0,10);
  const price = createPrice.value || 0;
  const type = createTrainType.value;

  const newTicket = {
    id: Date.now(),
    from,
    to,
    date,
    price,
    trainType: type,
    ticketNo: generateTicketNumber(),
    status: 'active'
  };

  tickets.push(newTicket);
  saveData();
  haptic('medium');

  switchView('ticketsView');
  setTimeout(() => { renderTickets(); }, 50);
}

// ===================== Расписание (Заглушка) =====================
function findSchedule() {
  const from = scheduleFrom.value.trim();
  const to = scheduleTo.value.trim();
  
  if (!from || !to) {
    scheduleList.innerHTML = `<div class="empty-state">Заполните поля «Откуда» и «Куда»</div>`;
    return;
  }

  // Имитация загрузки
  scheduleList.innerHTML = `<div class="loader">Поиск рейсов...</div>`;
  
  setTimeout(() => {
    // Генерируем фейковые рейсы для вида
    const times = ['10:15', '10:45', '11:20', '12:05', '12:50', '13:30'];
    scheduleList.innerHTML = times.map(t => `
      <div class="schedule-item">
        <div class="schedule-time">${t}</div>
        <div class="schedule-info">
          <div class="schedule-route">${from} → ${to}</div>
          <div class="schedule-sub">В пути 1 ч 10 мин • 65 ₽</div>
        </div>
        <div class="schedule-arrow">›</div>
      </div>
    `).join('');
  }, 500);
}

// ===================== Обработчики =====================
if (swapScheduleBtn) {
  swapScheduleBtn.addEventListener('click', () => {
    const tmp = scheduleFrom.value;
    scheduleFrom.value = scheduleTo.value;
    scheduleTo.value = tmp;
    haptic('light');
  });
}

if (findScheduleBtn) findScheduleBtn.addEventListener('click', findSchedule);

if (saveTicketBtn) saveTicketBtn.addEventListener('click', createTicket);

if (backFromDetail) {
  backFromDetail.addEventListener('click', () => {
    restoreBrightness();
    switchView('ticketsView');
  });
}

if (backFromCreate) {
  backFromCreate.addEventListener('click', () => {
    switchView('ticketsView');
  });
}

// Нижняя навигация
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    if (view !== 'ticketDetailView') {
      restoreBrightness();
    }
    switchView(view);
  });
});

// Табы
tabs.forEach(tab => {
  tab.addEventListener('click', () => {
    tabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    currentTab = tab.dataset.tab;
    renderTickets();
    haptic('light');
  });
});

// Аккордеон помощи
if (helperToggle && helperBody && helperChev) {
  helperToggle.addEventListener('click', () => {
    const isHidden = helperBody.classList.contains('hidden');
    if (isHidden) {
      helperBody.classList.remove('hidden');
      helperChev.classList.add('open');
    } else {
      helperBody.classList.add('hidden');
      helperChev.classList.remove('open');
    }
    haptic('light');
  });
}

// ===================== Инициализация =====================
tickets = loadData();
createDate.value = new Date().toISOString().slice(0,10);
renderTickets();

try{
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    if (typeof window.Telegram.WebApp.expand === 'function') window.Telegram.WebApp.expand();
  }
}catch(e){}
