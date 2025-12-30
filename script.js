/**
 * Script para Packet-World
 * Maneja la consulta de guías y renderiza detalles técnicos de paquetes e historial.
 */

const API_BASE_URL = 'http://localhost:8080/APIPacketWorld/api/envio';

// Referencias al DOM
const searchScreen = document.getElementById('search-screen');
const trackingScreen = document.getElementById('tracking-screen');
const trackingInput = document.getElementById('tracking-input');
const displayTrackingNumber = document.getElementById('display-tracking-number');
const currentStatus = document.getElementById('current-status');
const trackingList = document.getElementById('tracking-list');
const lastUpdateTime = document.getElementById('last-update-time');
const statusIcon = document.getElementById('status-icon');
const errorMessage = document.getElementById('error-message');
const searchButton = document.getElementById('search-button');
const buttonContent = document.getElementById('button-content');
const loadingSpinner = document.getElementById('loading-spinner');

async function searchTracking() {
    const guideNumber = trackingInput.value.trim().toUpperCase();

    if (!guideNumber) {
        showError('Por favor, ingresa un número de guía.');
        return;
    }

    setLoading(true);
    showError('');

    try {
        const response = await fetch(`${API_BASE_URL}/detalle/${guideNumber}`, {
            method: 'GET',
            headers: { 'Accept': 'application/json' }
        });

        if (!response.ok) {
            if (response.status === 404 || response.status === 204) {
                throw new Error('Número de guía no encontrado.');
            }
            throw new Error(`Error de servidor (${response.status})`);
        }

        const data = await response.json();

        if (data && data.numeroGuia) {
            renderTrackingHistory(data);
            searchScreen.classList.add('hidden');
            trackingScreen.classList.remove('hidden');
            // Aplicar animación de entrada a la pantalla de tracking
            trackingScreen.classList.add('logo-animate');
        } else {
            throw new Error('Datos de guía inválidos.');
        }

    } catch (error) {
        showError(error.message === 'Failed to fetch' ? 'Error de red. Verifica conexión y CORS.' : error.message);
        console.error('Error:', error);
    } finally {
        setLoading(false);
    }
}

function renderTrackingHistory(data) {
    displayTrackingNumber.textContent = data.numeroGuia;
    currentStatus.textContent = data.estatus || 'En proceso';
    statusIcon.textContent = getStatusIcon(data.estatus);

    const fechaActual = data.fechaEnvio || 'Hoy';
    lastUpdateTime.textContent = `${fechaActual} | Origen: ${data.sucursalOrigen || 'N/A'}`;

    trackingList.innerHTML = '';

    // 1. SECCIÓN: DETALLE DE PAQUETES (Aspecto Profesional)
    if (data.paquetes && data.paquetes.length > 0) {
        let paquetesHtml = `
            <div class="mb-10">
                <div class="flex items-center gap-3 mb-5">
                    <div class="bg-orange-100 p-2 rounded-lg"><span class="text-xl">📦</span></div>
                    <h3 class="text-[#1E3B5C] font-black uppercase text-sm tracking-widest">Información de la Carga</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        `;

        data.paquetes.forEach((p, idx) => {
            paquetesHtml += `
                <div class="bg-gray-50/50 border border-gray-100 p-5 rounded-2xl hover:bg-white hover:shadow-md transition-all">
                    <div class="flex justify-between items-start mb-3">
                        <span class="text-[10px] bg-[#1E3B5C] text-white px-2 py-0.5 rounded-md font-bold">UNIDAD ${idx + 1}</span>
                        <span class="text-[#F77F00] font-bold text-xs">ID: ${p.idPaquete || 'N/A'}</span>
                    </div>
                    <p class="text-xs text-gray-400 font-bold uppercase mb-1">Descripción</p>
                    <p class="text-sm font-bold text-[#1E3B5C] mb-4">${p.descripcion || 'Sin descripción'}</p>
                    
                    <div class="grid grid-cols-2 gap-x-4 gap-y-3 pt-3 border-t border-gray-100">
                        <div>
                            <div class="pojo-field-label">Peso Neto</div>
                            <div class="pojo-field-value">${p.peso} <span class="text-[10px] text-gray-400">kg</span></div>
                        </div>
                        <div>
                            <div class="pojo-field-label">Largo</div>
                            <div class="pojo-field-value">${p.profundidad} <span class="text-[10px] text-gray-400">cm</span></div>
                        </div>
                        <div>
                            <div class="pojo-field-label">Ancho</div>
                            <div class="pojo-field-value">${p.ancho} <span class="text-[10px] text-gray-400">cm</span></div>
                        </div>
                        <div>
                            <div class="pojo-field-label">Alto</div>
                            <div class="pojo-field-value">${p.alto} <span class="text-[10px] text-gray-400">cm</span></div>
                        </div>
                    </div>
                </div>`;
        });

        paquetesHtml += `</div></div>`;
        trackingList.insertAdjacentHTML('beforeend', paquetesHtml);
    }

    // 2. SECCIÓN: LÍNEA DE TIEMPO (Timeline)
    let historyHeader = `
        <div class="flex items-center gap-3 mb-8">
            <div class="bg-blue-100 p-2 rounded-lg"><span class="text-xl">📍</span></div>
            <h3 class="text-[#1E3B5C] font-black uppercase text-sm tracking-widest">Trayecto del Envío</h3>
        </div>
    `;
    trackingList.insertAdjacentHTML('beforeend', historyHeader);

    if (data.historial && data.historial.length > 0) {
        const sortedHistorial = [...data.historial].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));
        sortedHistorial.forEach((h, index) => {
            trackingList.insertAdjacentHTML('beforeend', createHistoryStep(h.fechaHora, h.estatusNombre || 'Actualización', h.comentario, index === 0));
        });
    } else {
        const msg = `Envío registrado desde <strong>${data.sucursalOrigen}</strong> hacia <strong>${data.dirCiudad}, ${data.dirEstado}</strong>.`;
        trackingList.insertAdjacentHTML('beforeend', createHistoryStep(data.fechaEnvio, 'Origen', msg, true));
    }
}

function createHistoryStep(dateStr, title, detail, isCurrent) {
    const date = new Date(dateStr);
    const d = isNaN(date.getTime()) ? dateStr : date.toLocaleDateString('es-MX', { day: '2-digit', month: 'short' });
    const t = isNaN(date.getTime()) ? '' : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    return `
        <div class="flex group">
            <div class="flex-shrink-0 w-20 pt-1 text-right pr-6">
                <p class="text-xs font-black text-[#1E3B5C] uppercase">${d}</p>
                <p class="text-[10px] text-gray-400 font-bold">${t}</p>
            </div>
            <div class="flex-grow border-l-2 ${isCurrent ? 'border-[#F77F00]' : 'border-gray-100'} pb-10 relative pl-8">
                <!-- Indicador visual en el eje -->
                <div class="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full border-4 border-white ${isCurrent ? 'bg-[#F77F00] ring-4 ring-orange-100' : 'bg-gray-200'}"></div>
                
                <div class="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm history-card">
                    <p class="text-sm font-black text-[#1E3B5C] uppercase tracking-tight">${title}</p>
                    <p class="text-xs text-gray-500 mt-2 leading-relaxed">${detail || 'Operación logística en curso.'}</p>
                </div>
            </div>
        </div>
    `;
}

function getStatusIcon(statusText) {
    if (!statusText) return '📦';
    const s = statusText.toLowerCase();
    if (s.includes('recibido')) return '🏢';
    if (s.includes('tránsito') || s.includes('ruta')) return '🚚';
    if (s.includes('entregado')) return '✅';
    return '📦';
}

function setLoading(isLoading) {
    buttonContent.style.display = isLoading ? 'none' : 'block';
    loadingSpinner.classList.toggle('hidden', !isLoading);
    searchButton.disabled = isLoading;
}

function showError(message) {
    if (!errorMessage) return;
    errorMessage.textContent = message;
    errorMessage.classList.toggle('hidden', !message);
}

function goToSearch() {
    trackingScreen.classList.add('hidden');
    searchScreen.classList.remove('hidden');
    trackingInput.value = '';
}

// Globalización y Eventos
window.searchTracking = searchTracking;
window.goToSearch = goToSearch;
trackingInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchTracking(); });