// ===================== Константы =====================
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const STORAGE_KEY = 'ticketsAppData';

// ===================== DOM =====================
const appRoot = document.getElementById('appRoot');
const bottomNav = document.getElementById('bottomNav');
const ticketsView = document.getElementById('ticketsView');
const settingsView = document.getElementById('settingsView');
const ticketDetailView = document.getElementById('ticketDetailView');
const ticketsList = document.getElementById('ticketsList');

const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const swapBtn = document.getElementById('swapBtn');
const dateInput = document.getElementById('dateInput');
const trainType = document.getElementById('trainType');
const priceInput = document.getElementById('priceInput');
const createTicketBtn = document.getElementById('createTicketBtn');

const detailRoute = document.getElementById('detailRoute');
const detailDate = document.getElementById('detailDate');
const detailValid = document.getElementById('detailValid');
const detailPrice = document.getElementById('detailPrice');
const detailNo = document.getElementById('detailNo');
const detailType = document.getElementById('detailType');
const detailTypeSub = document.getElementById('detailTypeSub');
const barcodeCard = document.getElementById('barcodeCard');
const backToTicketsBtn = document.getElementById('backToTicketsBtn');

const helperToggle = document.getElementById('helperToggle');
const helperBody = document.getElementById('helperBody');
const helperChev = document.getElementById('helperChev');

const navItems = document.querySelectorAll('.nav-item');
const tabs = document.querySelectorAll('.tab');

// ===================== Состояние =====================
let tickets = [];
let currentTab = 'active';

// ===================== Проверка Telegram =====================
function isTelegram() {
  return !!(window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData);
}

// ===================== Хаптика Telegram =====================
function haptic(style){
  try{
    if (isTelegram() && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style || 'light');
    }
  }catch(e){}
}

// ===================== Яркость =====================
function setMaxBrightness() {
  try {
    if (isTelegram() && typeof window.Telegram.WebApp.setBrightness === 'function') {
      window.Telegram.WebApp.setBrightness(1.0);
    }
  } catch(e) {}
}

function restoreBrightness() {
  try {
    if (isTelegram() && typeof window.Telegram.WebApp.setBrightness === 'function') {
      window.Telegram.WebApp.setBrightness(0.5);
    }
  } catch(e) {}
}

// ===================== Безопасный localStorage =====================
function safeGet(key) {
  try { return localStorage.getItem(key); } catch(e) { return null; }
}
function safeSet(key, value) {
  try { localStorage.setItem(key, value); } catch(e) {}
}

// ===================== Загрузка / Сохранение =====================
function loadData(){
  try{
    const raw = safeGet(STORAGE_KEY);
    if(raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  }catch(e){}
  return [];
}

function saveData(){
  try{ safeSet(STORAGE_KEY, JSON.stringify(tickets)); }catch(e){}
}

// ===================== Форматирование =====================
function formatDateRu(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  if(isNaN(d)) return dateStr;
  return `${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

function formatValidUntil(dateStr){
  const d = new Date(dateStr + 'T00:00:00');
  if(isNaN(d)) return '';
  d.setDate(d.getDate() + 1);
  return `Действителен до 01:00 ${d.getDate()} ${MONTHS_GEN[d.getMonth()]}`;
}

function generateTicketNumber(){
  let num = '3';
  for(let i=0; i<12; i++) num += Math.floor(Math.random()*10);
  return `Билет № ${num}`;
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
      <div class="card-header">
        <div class="card-route">${t.from} — ${t.to}</div>
        <div class="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15.5C4 17.43 5.57 19 7.5 19L6 20.5V21h1.6l1.5-1.5h5.8L16.4 21H18v-.5L16.5 19c1.93 0 3.5-1.57 3.5-3.5V6c0-3.5-3.58-4-8-4s-8 .5-8 4v9.5zM7.5 17c-.83 0-1.5-.67-1.5-1.5S6.67 14 7.5 14s1.5.67 1.5 1.5S8.33 17 7.5 17zm9 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM18 11H6V6h12v5z"/></svg>
        </div>
      </div>
      <div class="card-date">${formatDateRu(t.date)}</div>
      <div class="card-footer">
        <div class="card-price">${t.price} ₽</div>
        <div class="card-no">${t.ticketNo}</div>
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
  detailRoute.textContent = `${ticket.from} — ${ticket.to}`;
  detailDate.textContent = formatDateRu(ticket.date);
  detailValid.textContent = formatValidUntil(ticket.date);
  detailPrice.textContent = `${ticket.price} ₽`;
  detailNo.textContent = ticket.ticketNo;
  detailType.textContent = `Полный, в одну сторону`;
  detailTypeSub.textContent = `Билет на электричку ${ticket.trainType.toLowerCase()}`;
  
  barcodeCard.classList.remove('flipped');
  
  if (helperBody) helperBody.classList.add('hidden');
  if (helperChev) helperChev.classList.remove('open');
  
  // Скрываем все вкладки
  document.querySelectorAll('.view').forEach(v => v.classList.add('hidden'));
  ticketDetailView.classList.remove('hidden');
  
  // СКРЫВАЕМ НИЖНЮЮ НАВИГАЦИЮ
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
  
  // ПОКАЗЫВАЕМ НИЖНЮЮ НАВИГАЦИЮ
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
  const from = fromInput.value.trim() || 'Откуда';
  const to = toInput.value.trim() || 'Куда';
  const date = dateInput.value || new Date().toISOString().slice(0,10);
  const price = priceInput.value || 0;
  const type = trainType.value;

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

// ===================== Обработчики =====================
if (swapBtn) {
  swapBtn.addEventListener('click', () => {
    const tmp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmp;
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => { swapBtn.style.transform = ''; }, 250);
    haptic('light');
  });
}

if (createTicketBtn) createTicketBtn.addEventListener('click', createTicket);

if (backToTicketsBtn) {
  backToTicketsBtn.addEventListener('click', () => {
    restoreBrightness();
    switchView('ticketsView');
  });
}

// Нижняя навигация
navItems.forEach(item => {
  item.addEventListener('click', () => {
    const view = item.dataset.view;
    if (view === 'settingsView') {
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

// Переворот штрихкода
let barcodeAnimating = false;
if (barcodeCard) {
  barcodeCard.addEventListener('click', () => {
    if(barcodeAnimating) return;
    barcodeAnimating = true;
    haptic('light');
    barcodeCard.classList.add('flipped');
    setTimeout(() => {
      barcodeCard.classList.remove('flipped');
      setTimeout(() => { barcodeAnimating = false; }, 500);
    }, 550);
  });
}

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

if (dateInput) {
  const today = new Date().toISOString().slice(0,10);
  dateInput.value = today;
}

renderTickets();

// Telegram Init
try{
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    if (typeof window.Telegram.WebApp.expand === 'function') {
      window.Telegram.WebApp.expand();
    }
    if (typeof window.Telegram.WebApp.setHeaderColor === 'function') {
      window.Telegram.WebApp.setHeaderColor('#f4f3f6');
    }
  }
}catch(e){}
