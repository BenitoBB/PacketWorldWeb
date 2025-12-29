// Configuración de la API con el contexto correcto de tu proyecto
const API_BASE_URL = 'http://localhost:8080/APIPacketWorld/api/envio';

// Referencias a elementos del DOM
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

/**
 * Realiza la petición real a la API de Java
 */
async function searchTracking() {
    const guideNumber = trackingInput.value.trim().toUpperCase();

    if (!guideNumber) {
        showError('Por favor, ingresa un número de guía.');
        return;
    }

    setLoading(true);
    showError('');

    try {
        // Llamada al endpoint detalle/{numeroGuia}
        // Nota: Si el error persiste, es debido a la política CORS en el servidor Java.
        const response = await fetch(`${API_BASE_URL}/detalle/${guideNumber}`, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            if (response.status === 404 || response.status === 204) {
                throw new Error('El número de guía no existe en nuestro sistema.');
            }
            throw new Error(`Error del servidor: ${response.status}`);
        }

        const data = await response.json();

        if (data && data.numeroGuia) {
            renderTrackingHistory(data);

            searchScreen.classList.add('hidden');
            trackingScreen.classList.remove('hidden');
            trackingScreen.classList.add('logo-animate');
        } else {
            throw new Error('No se encontraron datos válidos para esta guía.');
        }

    } catch (error) {
        // Si el error es por CORS, entrará aquí como TypeError: Failed to fetch
        if (error.message === 'Failed to fetch') {
            showError('Error de conexión (CORS). El servidor Java debe permitir peticiones desde este origen.');
        } else {
            showError(error.message);
        }
        console.error('Error detallado:', error);
    } finally {
        setLoading(false);
    }
}

/**
 * Renderiza la información basada en el objeto que devuelve tu API
 */
function renderTrackingHistory(detalle) {
    displayTrackingNumber.textContent = detalle.numeroGuia;

    // Mapeo de campos según tu JSON de ejemplo
    currentStatus.textContent = detalle.estatus || 'Procesando';

    // Si no hay fecha detallada, usamos una genérica o el campo que tengas disponible
    const fechaActualizacion = detalle.fechaEnvio || new Date().toLocaleDateString();
    const ubicacion = detalle.destino || detalle.sucursalOrigen || 'Ubicación no disponible';

    lastUpdateTime.textContent = `${fechaActualizacion} - ${ubicacion}`;
    statusIcon.textContent = getStatusIcon(detalle.estatus);

    // Limpiar lista e insertar estado actual
    trackingList.innerHTML = '';

    // Mostramos el origen como punto inicial
    const origenHtml = createHistoryStep(
        fechaActualizacion,
        "Envío registrado",
        `Origen: ${detalle.sucursalOrigen}`,
        true
    );
    trackingList.insertAdjacentHTML('beforeend', origenHtml);

    // Paso de estado actual (Basado en el estatus que recibimos)
    const statusHtml = createHistoryStep(
        fechaActualizacion,
        detalle.estatus,
        `Destino: ${detalle.destino}`,
        false
    );
    trackingList.insertAdjacentHTML('beforeend', statusHtml);
}

function createHistoryStep(date, title, location, isComplete) {
    return `
        <div class="flex">
            <div class="flex-shrink-0 w-24">
                <p class="text-sm text-gray-400">${date}</p>
            </div>
            <div class="flex-grow w-full">
                <div class="history-card ${isComplete ? 'complete' : ''} bg-gray-50 p-4 rounded-lg shadow-sm mb-4">
                    <p class="text-base text-gray-800 font-bold">${title}</p>
                    <p class="text-sm text-gray-600 mt-1">${location}</p>
                </div>
            </div>
        </div>
    `;
}

function getStatusIcon(statusText) {
    if (!statusText) return '📦';
    const s = statusText.toLowerCase();
    if (s.includes('recibido')) return '🏢';
    if (s.includes('transito') || s.includes('ruta')) return '🚚';
    if (s.includes('entregado')) return '✅';
    return '📦';
}

function setLoading(isLoading) {
    if (isLoading) {
        buttonContent.classList.add('hidden');
        loadingSpinner.classList.remove('hidden');
        searchButton.disabled = true;
    } else {
        buttonContent.classList.remove('hidden');
        loadingSpinner.classList.add('hidden');
        searchButton.disabled = false;
    }
}

function showError(message) {
    errorMessage.textContent = message;
    message ? errorMessage.classList.remove('hidden') : errorMessage.classList.add('hidden');
}

function goToSearch() {
    trackingScreen.classList.add('hidden');
    searchScreen.classList.remove('hidden');
    trackingInput.value = '';
}

window.searchTracking = searchTracking;
window.goToSearch = goToSearch;

trackingInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') searchTracking(); });