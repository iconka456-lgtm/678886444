// ===================== Константы =====================
const MONTHS_GEN = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря'];
const STORAGE_KEY = 'ticketAppSettings';

// ===================== DOM =====================
const settingsView = document.getElementById('settingsView');
const ticketView = document.getElementById('ticketView');

const fromInput = document.getElementById('fromInput');
const toInput = document.getElementById('toInput');
const swapBtn = document.getElementById('swapBtn');
const dateInput = document.getElementById('dateInput');
const priceInput = document.getElementById('priceInput');
const showTicketBtn = document.getElementById('showTicketBtn');
const backBtn = document.getElementById('backBtn');

const ticketRoute = document.getElementById('ticketRoute');
const ticketDate = document.getElementById('ticketDate');
const ticketValid = document.getElementById('ticketValid');
const ticketPrice = document.getElementById('ticketPrice');
const ticketNo = document.getElementById('ticketNo');

const barcodeCard = document.getElementById('barcode');

const helperToggle = document.getElementById('helperToggle');
const helperBody = document.getElementById('helperBody');
const helperChev = document.getElementById('helperChev');

// ===================== Хаптика Telegram =====================
function haptic(style){
  try{
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred(style || 'light');
    }
  }catch(e){}
}

// ===================== Загрузка / сохранение настроек =====================
function loadSettings(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    if(raw) return JSON.parse(raw);
  }catch(e){}
  const today = new Date();
  return {
    from: 'Санкт-Петербург (Финляндский вокзал)',
    to: 'Пискарёвка',
    date: today.toISOString().slice(0,10),
    price: 65
  };
}

function saveSettings(settings){
  try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(settings)); }catch(e){}
}

function applySettingsToForm(settings){
  fromInput.value = settings.from;
  toInput.value = settings.to;
  dateInput.value = settings.date;
  priceInput.value = settings.price;
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
  let num = '';
  for(let i=0; i<13; i++) num += Math.floor(Math.random()*10);
  return `Билет № ${num}`;
}

// ===================== Рендер билета =====================
function renderTicket(settings){
  ticketRoute.textContent = `${settings.from} — ${settings.to}`;
  ticketDate.textContent = formatDateRu(settings.date);
  ticketValid.textContent = formatValidUntil(settings.date);
  ticketPrice.textContent = `${settings.price} ₽`;
  ticketNo.textContent = generateTicketNumber();
  barcodeCard.classList.remove('flipped');
}

// ===================== Переключение экранов =====================
function showTicketScreen(){
  const settings = {
    from: fromInput.value.trim() || 'Откуда',
    to: toInput.value.trim() || 'Куда',
    date: dateInput.value || new Date().toISOString().slice(0,10),
    price: priceInput.value || 0
  };
  saveSettings(settings);
  renderTicket(settings);
  settingsView.classList.add('hidden');
  ticketView.classList.remove('hidden');
  haptic('medium');
}

function showSettingsScreen(){
  ticketView.classList.add('hidden');
  settingsView.classList.remove('hidden');
  haptic('light');
}

// ===================== Обработчики =====================
swapBtn.addEventListener('click', () => {
  const tmp = fromInput.value;
  fromInput.value = toInput.value;
  toInput.value = tmp;
  swapBtn.style.transform = 'rotate(180deg)';
  setTimeout(() => { swapBtn.style.transform = ''; }, 250);
  haptic('light');
});

showTicketBtn.addEventListener('click', showTicketScreen);
backBtn.addEventListener('click', showSettingsScreen);

let barcodeAnimating = false;
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

helperToggle.addEventListener('click', () => {
  helperBody.classList.toggle('open');
  helperChev.classList.toggle('open');
});

// ===================== Инициализация =====================
const initialSettings = loadSettings();
applySettingsToForm(initialSettings);

// ===================== Telegram Mini Apps init =====================
try{
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
}catch(e){}
