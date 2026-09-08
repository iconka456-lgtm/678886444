// Generate a pseudo-random 2D barcode (Aztec/PDF417-style pattern) as SVG
  function drawBarcode(svg){
    const cols = 46, rows = 16;
    const cell = 340 / cols;
    const rowH = 130 / rows;
    let markup = '';
    // seeded-ish randomness for consistent look each load
    for(let r=0; r<rows; r++){
      for(let c=0; c<cols; c++){
        if(Math.random() > 0.46){
          markup += `<rect x="${(c*cell).toFixed(2)}" y="${(r*rowH).toFixed(2)}" width="${cell.toFixed(2)}" height="${rowH.toFixed(2)}" fill="#2b2b33"/>`;
        }
      }
    }
    // solid guard bars on left/right like the reference ticket
    markup = `<rect x="0" y="0" width="${cell*1.4}" height="130" fill="#2b2b33"/>` +
             `<rect x="${340-cell*1.4}" y="0" width="${cell*1.4}" height="130" fill="#2b2b33"/>` +
             markup;
    svg.innerHTML = markup;
  }

  const svg = document.getElementById('barcodeSvg');
  drawBarcode(svg);

  // Editable departure / arrival fields
  const fromInput = document.getElementById('fromInput');
  const toInput = document.getElementById('toInput');
  const swapBtn = document.getElementById('swapBtn');

  swapBtn.addEventListener('click', () => {
    const tmp = fromInput.value;
    fromInput.value = toInput.value;
    toInput.value = tmp;
    swapBtn.style.transform = 'rotate(180deg)';
    setTimeout(() => { swapBtn.style.transform = ''; }, 250);
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  });

  const card = document.getElementById('barcode');
  card.addEventListener('click', () => {
    card.classList.toggle('flipped');
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.HapticFeedback) {
      window.Telegram.WebApp.HapticFeedback.impactOccurred('light');
    }
  });

  // Telegram Mini Apps init (safe no-op outside Telegram)
  if (window.Telegram && window.Telegram.WebApp) {
    window.Telegram.WebApp.ready();
    window.Telegram.WebApp.expand();
  }
