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
const barcodeSvg = document.getElementById('barcodeSvg');

const helperToggle = document.getElementById('helperToggle');
const helperBody = document.getElementById('helperBody');
const helperChev = document.getElementById('helperChev');

const statusTime = document.getElementById('statusTime');

// ===================== Хаптика Telegram =====================
function haptic(style){
  if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
    window.Telegram.WebApp.HapticFeedback.impactOccurred(style || 'light');
  }
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

// ===================== Штрихкод (декоративный, в стиле PDF417) =====================
function drawBarcode(svg){
  const width = 340, height = 130;
  const groups = 6;            // число «плотных» блоков
  const groupGap = 4;
  const guardWidth = 12;
  let x = 0;
  let markup = '';

  function guard(w){
    markup += `<rect x="${x.toFixed(2)}" y="0" width="${w}" height="${height}" fill="#2b2a30"/>`;
    x += w + groupGap;
  }
  function thinLines(){
    markup += `<rect x="${x.toFixed(2)}" y="0" width="2" height="${height}" fill="#2b2a30"/>`;
    x += 5;
    markup += `<rect x="${x.toFixed(2)}" y="0" width="2" height="${height}" fill="#2b2a30"/>`;
    x += 8;
  }
  function noiseBlock(w){
    const cols = Math.round(w / 6);
    const cellW = w / cols;
    const rows = 16;
    const rowH = height / rows;
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        if(Math.random() > 0.45){
          markup += `<rect x="${(x + c*cellW).toFixed(2)}" y="${(r*rowH).toFixed(2)}" width="${cellW.toFixed(2)}" height="${rowH.toFixed(2)}" fill="#2b2a30"/>`;
        }
      }
    }
    x += w + groupGap;
  }

  guard(guardWidth);
  thinLines();

  const remaining = width - x - guardWidth - 8 - 5 - 2 - 2 - groupGap; // резерв под финальный guard+lines
  const blockW = remaining / groups - groupGap;
  for(let i=0; i<groups; i++){
    noiseBlock(blockW);
    if(i === Math.floor(groups/2) - 1){
      guard(guardWidth * 0.7);
    }
  }

  thinLines();
  guard(guardWidth);

  svg.innerHTML = markup;
}

// ===================== Рендер билета =====================
function renderTicket(settings){
  ticketRoute.textContent = `${settings.from} — ${settings.to}`;
  ticketDate.textContent = formatDateRu(settings.date);
  ticketValid.textContent = formatValidUntil(settings.date);
  ticketPrice.textContent = `${settings.price} ₽`;
  ticketNo.textContent = generateTicketNumber();
  barcodeCard.classList.remove('flipped');
  drawBarcode(barcodeSvg);
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

barcodeCard.addEventListener('click', () => {
  barcodeCard.classList.toggle('flipped');
  haptic('light');
});

helperToggle.addEventListener('click', () => {
  helperBody.classList.toggle('open');
  helperChev.classList.toggle('open');
});

// ===================== Фейковый статус-бар (реальное время) =====================
function updateStatusTime(){
  const now = new Date();
  const hh = String(now.getHours()).padStart(2,'0');
  const mm = String(now.getMinutes()).padStart(2,'0');
  if(statusTime) statusTime.textContent = `${hh}:${mm}`;
}
updateStatusTime();
setInterval(updateStatusTime, 15000);

// ===================== Инициализация =====================
const initialSettings = loadSettings();
applySettingsToForm(initialSettings);

// ===================== Telegram Mini Apps init =====================
if (window.Telegram && window.Telegram.WebApp) {
  window.Telegram.WebApp.ready();
  window.Telegram.WebApp.expand();
}
