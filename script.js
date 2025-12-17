// --- CONFIGURACIÓN DE LA GALERÍA ---
// Pueden ser rutas locales ('img/paisaje.jpg') o URLs.
const backgroundImages = [
    { name: "Paisaje", url: "img/wallhaven-83w6vo.jpg" },
    { name: "Cyberpunk", url: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=600&auto=format&fit=crop" },
    { name: "Montañas", url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=600&auto=format&fit=crop" },
    { name: "Lluvia", url: "https://images.unsplash.com/photo-1515694346937-94d85e41e6f0?q=80&w=600&auto=format&fit=crop" },
    { name: "Abstracto", url: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=600&auto=format&fit=crop" },
    { name: "Minimal", url: "https://images.unsplash.com/photo-1494438639946-1ebd1d20bf85?q=80&w=600&auto=format&fit=crop" },
    { name: "Espacio", url: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=600&auto=format&fit=crop" }
];

// --- VARIABLES ---
const root = document.documentElement;
const galleryContainer = document.getElementById('bg-gallery');
const clockWrapper = document.getElementById('clock-wrapper');
let is12Hour = false;
let currentAnimation = 'anim-flip'; 

// --- 1. INICIALIZAR ESTRUCTURA DEL RELOJ ---
function initClock() {
    clockWrapper.innerHTML = `
        <div class="digit-group" id="h-val">00</div>
        <div class="separator">:</div>
        <div class="digit-group" id="m-val">00</div>
        <div class="separator">:</div>
        <div class="digit-group" id="s-val">00</div>
        <span class="ampm-box" id="ampm-val"></span>
    `;
}
initClock();

const hEl = document.getElementById('h-val');
const mEl = document.getElementById('m-val');
const sEl = document.getElementById('s-val');
const ampmEl = document.getElementById('ampm-val');

// --- 2. GENERAR GALERÍA VISUAL ---
function renderGallery() {
    galleryContainer.innerHTML = '';
    backgroundImages.forEach((bg, index) => {
        const img = document.createElement('img');
        img.src = bg.url;
        img.alt = bg.name;
        img.className = 'bg-thumb';
        
        img.addEventListener('click', () => {
            // Cambiar fondo
            root.style.setProperty('--bg-image', `url('${bg.url}')`);
            
            // Gestionar clase 'selected'
            document.querySelectorAll('.bg-thumb').forEach(el => el.classList.remove('selected'));
            img.classList.add('selected');
        });

        galleryContainer.appendChild(img);
    });
}
renderGallery();

// Subida de Archivo Local
document.getElementById('bg-file-input').addEventListener('change', function(e) {
    if (this.files && this.files[0]) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            root.style.setProperty('--bg-image', `url('${evt.target.result}')`);
            // Quitar selección de la galería
            document.querySelectorAll('.bg-thumb').forEach(el => el.classList.remove('selected'));
        };
        reader.readAsDataURL(this.files[0]);
    }
});

// --- 3. LÓGICA DEL RELOJ Y ANIMACIÓN ---
function updateClock() {
    const now = new Date();
    let h = now.getHours();
    const m = String(now.getMinutes()).padStart(2, '0');
    const s = String(now.getSeconds()).padStart(2, '0');
    let ampm = '';

    if (is12Hour) {
        ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
    }
    const hStr = String(h).padStart(2, '0');

    // Actualizar cada grupo
    updateDigit(hEl, hStr);
    updateDigit(mEl, m);
    updateDigit(sEl, s);

    if(ampmEl.textContent !== ampm) ampmEl.textContent = ampm;

    // Fecha
    const dateStr = now.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    document.getElementById('date-display').textContent = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);
}

// Función CRÍTICA para las animaciones
function updateDigit(element, newValue) {
    // Solo si el valor cambia
    if (element.textContent !== newValue) {
        element.textContent = newValue;

        // Si hay animación seleccionada
        if (currentAnimation !== 'none') {
            // 1. Remover clase
            element.classList.remove(currentAnimation);
            
            // 2. Forzar Reflow (Reiniciar el ciclo de renderizado del navegador)
            void element.offsetWidth; 
            
            // 3. Volver a añadir clase
            element.classList.add(currentAnimation);
        }
    }
}

setInterval(updateClock, 1000);
updateClock();

// --- 4. LISTENERS DE CONTROLES ---
document.getElementById('settings-toggle').addEventListener('click', () => 
    document.getElementById('settings-panel').classList.remove('hidden'));

document.getElementById('close-settings').addEventListener('click', () => 
    document.getElementById('settings-panel').classList.add('hidden'));

document.getElementById('overlay-slider').addEventListener('input', (e) => 
    root.style.setProperty('--overlay-opacity', e.target.value));

document.getElementById('color-picker').addEventListener('input', (e) => 
    root.style.setProperty('--primary-color', e.target.value));

document.getElementById('effect-select').addEventListener('change', (e) => 
    clockWrapper.className = `clock-wrapper ${e.target.value}`);

document.getElementById('font-select').addEventListener('change', (e) => 
    root.style.setProperty('--font-family', e.target.value));

document.getElementById('anim-select').addEventListener('change', (e) => 
    currentAnimation = e.target.value);

document.getElementById('format-select').addEventListener('change', (e) => {
    is12Hour = e.target.value === '12';
    if(!is12Hour) ampmEl.textContent = '';
    updateClock();
});

document.getElementById('fullscreen-toggle').addEventListener('click', () => {
    if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
    } else {
        if (document.exitFullscreen) document.exitFullscreen();
    }
});

// --- 5. POMODORO (Simplificado) ---
let pTime = 1500, pInterval;
const pDisplay = document.getElementById('pomodoro-display');
const pStartBtn = document.getElementById('pomodoro-start');

pStartBtn.addEventListener('click', () => {
    if (pStartBtn.textContent === "INICIAR") {
        pStartBtn.textContent = "PAUSAR";
        pInterval = setInterval(() => {
            pTime--;
            let min = Math.floor(pTime/60);
            let sec = pTime%60;
            pDisplay.textContent = `${min}:${sec<10?'0':''}${sec}`;
            if(pTime<=0) { clearInterval(pInterval); alert("¡Fin!"); pStartBtn.textContent="INICIAR"; }
        }, 1000);
    } else {
        clearInterval(pInterval);
        pStartBtn.textContent = "INICIAR";
    }
});
document.getElementById('pomodoro-reset').addEventListener('click', () => {
    clearInterval(pInterval); pTime=1500; pDisplay.textContent="25:00"; pStartBtn.textContent="INICIAR";
});