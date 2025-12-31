async function buscarSeguimiento() {
    // Referencias a elementos usando los nuevos IDs en español
    const entrada = document.getElementById('entrada-guia');
    const guia = entrada.value.trim().toUpperCase();
    const mensajeError = document.getElementById('mensaje-error');
    
    if (!guia) {
        mostrarError("Por favor, introduce un número de guía.");
        return;
    }

    alternarCargando(true);
    mensajeError.classList.add('hidden');

    try {
        // 1. Obtener Datos mediante el servicio API
        const detalle = await ServicioApi.obtenerDetalle(guia);
        
        // 2. Obtener Historial usando el idEnvio que devolvió el detalle
        const historial = await ServicioApi.obtenerHistorial(detalle.idEnvio);

        // 3. Actualizar Encabezado de la Pantalla de Resultados
        document.getElementById('numero-guia-pantalla').textContent = detalle.numeroGuia;
        document.getElementById('estatus-actual').textContent = detalle.estatus;
        document.getElementById('ultima-actualizacion').textContent = `${detalle.dirCiudad}, ${detalle.dirEstado}`;
        
        // Icono dinámico según el estado (emoji)
        const elementoIcono = document.getElementById('icono-estatus');
        const estatusTexto = detalle.estatus.toLowerCase();
        
        if (estatusTexto.includes('entregado')) elementoIcono.textContent = '✅';
        else if (estatusTexto.includes('detenido') || estatusTexto.includes('cancelado')) elementoIcono.textContent = '⚠️';
        else elementoIcono.textContent = '🚚';

        // 4. Mandar a dibujar paquetes e historial (Usando el nuevo nombre Renderizador o Dibujador)
        Renderizador.pintarTodo(detalle, historial);

        // 5. Navegación de Pantalla (Ocultar búsqueda, mostrar rastreo)
        document.getElementById('pantalla-busqueda').classList.add('hidden');
        document.getElementById('pantalla-rastreo').classList.remove('hidden');

    } catch (error) {
        mostrarError(error.message);
    } finally {
        alternarCargando(false);
    }
}

function alternarCargando(estaCargando) {
    const boton = document.getElementById('boton-buscar');
    const indicador = document.getElementById('indicador-carga');
    const textoBoton = document.getElementById('contenido-boton');

    boton.disabled = estaCargando;
    indicador.classList.toggle('hidden', !estaCargando);
    textoBoton.classList.toggle('hidden', estaCargando);
}

function mostrarError(msj) {
    const divError = document.getElementById('mensaje-error');
    divError.textContent = msj;
    divError.classList.remove('hidden');
}

function regresarABusqueda() {
    document.getElementById('pantalla-rastreo').classList.add('hidden');
    document.getElementById('pantalla-busqueda').classList.remove('hidden');
    document.getElementById('entrada-guia').value = '';
}

// Hacer las funciones accesibles desde el HTML
window.buscarSeguimiento = buscarSeguimiento;
window.regresarABusqueda = regresarABusqueda;