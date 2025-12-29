// Datos de ejemplo simulados para la demostración
const MOCK_DATA = {
    '1A2B3C4D5E': [
        { date: '2025-11-28', time: '14:30', location: 'Ciudad de México, MX', description: 'Paquete Recibido y Procesado', complete: true },
        { date: '2025-11-28', time: '18:00', location: 'Centro de Distribución, MX', description: 'En Tránsito: Saliendo de CDMX', complete: true },
        { date: '2025-11-29', time: '07:15', location: 'Monterrey, NL, MX', description: 'Llegada a Centro Operativo Monterrey', complete: true },
        { date: '2025-11-29', time: '10:00', location: 'Monterrey, NL, MX', description: 'En Ruta de Entrega (Estimado: Hoy antes de las 18:00)', complete: false },
        { date: '2025-11-29', time: '18:00', location: 'Destino Final', description: 'Entrega Exitosa', complete: false }
    ],
    '9Z8Y7X6W5V': [
        { date: '2025-11-27', time: '09:00', location: 'Miami, FL, USA', description: 'Envío Creado y Etiqueta Impresa', complete: true },
        { date: '2025-11-27', time: '16:45', location: 'Miami, FL, USA', description: 'Recolección de Paquete por Transportista', complete: true },
        { date: '2025-11-28', time: '03:00', location: 'En Vuelo Internacional', description: 'Despacho de Aduanas de Salida', complete: false },
        { date: '2025-11-30', time: '09:00', location: 'Madrid, ES', description: 'Llegada a Aduana España', complete: false },
    ]
};

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
 * Simula la búsqueda del número de guía.
 * Después de una simulación de espera, muestra la segunda pantalla con el historial.
 */
async function searchTracking() {
    const guideNumber = trackingInput.value.trim().toUpperCase();
    
    // 1. Validar la entrada
    if (!guideNumber) {
        showError('Por favor, ingresa un número de guía.');
        return;
    }

    // 2. Simular carga
    setLoading(true);
    showError(''); // Limpiar errores previos

    // Simular una llamada a la API con un retraso de 1.5 segundos
    await new Promise(resolve => setTimeout(resolve, 1500));

    const trackingHistory = MOCK_DATA[guideNumber];

    // 3. Procesar resultado
    if (trackingHistory) {
        // Generar y mostrar el historial
        renderTrackingHistory(guideNumber, trackingHistory);
        
        // Transición a la segunda pantalla
        searchScreen.classList.add('hidden');
        trackingScreen.classList.remove('hidden');
        trackingScreen.classList.add('logo-animate'); // Reutilizar la animación para la entrada
        
    } else {
        // Mostrar error si la guía no se encuentra
        showError(`No se encontró el número de guía: ${guideNumber}. Verifica e inténtalo de nuevo.`);
    }

    // 4. Finalizar carga
    setLoading(false);
}

/**
 * Muestra el historial de seguimiento en la segunda pantalla.
 * @param {string} number - El número de guía.
 * @param {Array<Object>} history - El array de eventos de seguimiento.
 */
function renderTrackingHistory(number, history) {
    // Ordenar para asegurar que el más reciente esté al final del historial (y abajo en la lista)
    const sortedHistory = [...history];
    
    // Encuentra el estado actual (último evento completado o el más reciente si no hay completos)
    let lastCompletedIndex = sortedHistory.findIndex(event => !event.complete);
    // Si todos están completos, toma el último
    if (lastCompletedIndex === -1) {
        lastCompletedIndex = sortedHistory.length;
    }

    const currentEvent = sortedHistory[Math.max(0, lastCompletedIndex - 1)]; // El último evento *completado*
    const lastUpdate = sortedHistory[Math.max(0, lastCompletedIndex - 1)];

    // Actualizar resumen
    displayTrackingNumber.textContent = number;
    currentStatus.textContent = currentEvent ? currentEvent.description : 'Pendiente de Procesamiento';
    lastUpdateTime.textContent = lastUpdate ? `${lastUpdate.date} a las ${lastUpdate.time} en ${lastUpdate.location}` : 'N/A';
    statusIcon.textContent = getStatusIcon(currentStatus.textContent);

    // Generar la lista de eventos
    trackingList.innerHTML = ''; // Limpiar lista previa

    sortedHistory.forEach((event, index) => {
        // Determinar si el evento ya está "completo"
        const isComplete = index < lastCompletedIndex;
        const isCurrent = index === lastCompletedIndex;
        
        const cardHtml = `
            <div class="flex">
                <div class="flex-shrink-0 w-24">
                    <p class="text-sm text-gray-400">${event.date}</p>
                    <p class="text-xs text-gray-400">${event.time}</p>
                </div>
                <div class="flex-grow w-full">
                    <div class="history-card ${isComplete ? 'complete' : ''} bg-gray-50 p-4 rounded-lg shadow-sm transition duration-300 ${isCurrent ? 'bg-secondary-accent/20 border-secondary-accent font-semibold' : 'hover:bg-gray-100'}">
                        <p class="text-base text-gray-800">${event.description}</p>
                        <p class="text-sm text-gray-600 mt-1">${event.location}</p>
                    </div>
                </div>
            </div>
        `;
        trackingList.insertAdjacentHTML('beforeend', cardHtml);
    });
}

/**
 * Retorna un ícono basado en el estado actual.
 * @param {string} statusText - El texto del estado actual.
 * @returns {string} - El emoji del ícono.
 */
function getStatusIcon(statusText) {
    if (statusText.includes('Entrega Exitosa')) return '🎉';
    if (statusText.includes('En Ruta de Entrega')) return '🛵';
    if (statusText.includes('Llegada a Centro Operativo')) return '🏢';
    if (statusText.includes('En Tránsito') || statusText.includes('En Vuelo')) return '✈️';
    return '📦';
}

/**
 * Muestra u oculta el spinner de carga.
 * @param {boolean} isLoading - True para mostrar, false para ocultar.
 */
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

/**
 * Muestra un mensaje de error.
 * @param {string} message - Mensaje de error a mostrar.
 */
function showError(message) {
    errorMessage.textContent = message;
    if (message) {
        errorMessage.classList.remove('hidden');
    } else {
        errorMessage.classList.add('hidden');
    }
}

/**
 * Vuelve a la pantalla de búsqueda.
 */
function goToSearch() {
    trackingScreen.classList.add('hidden');
    searchScreen.classList.remove('hidden');
    searchScreen.classList.add('logo-animate'); // Animación de vuelta
    trackingInput.value = ''; // Limpiar input
}

// Globalizar la función searchTracking para que sea accesible desde el HTML
window.searchTracking = searchTracking;
window.goToSearch = goToSearch;

// Agregar evento para buscar al presionar Enter
trackingInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchTracking();
    }
});

// Inicializar la aplicación al cargar el DOM
document.addEventListener('DOMContentLoaded', () => {
    // Esto asegura que la pantalla de búsqueda esté visible al inicio con la animación
    searchScreen.classList.add('logo-animate');
});