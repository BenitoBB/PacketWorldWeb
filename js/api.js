const ServicioApi = {
    obtenerDetalle: async (numeroGuia) => {
        const respuesta = await fetch(`${CONFIGURACION.URL_BASE_API}/detalle/${numeroGuia}`);
        
        // Si el servidor responde 404, 204 o cualquier error
        if (!respuesta.ok || respuesta.status === 204) {
            throw new Error("El número de guía no existe o no tiene datos.");
        }

        // Verificar si hay contenido antes de parsear
        const texto = await respuesta.text();
        if (!texto) throw new Error("No se recibió información del servidor.");
        
        return JSON.parse(texto);
    },

    obtenerHistorial: async (idEnvio) => {
        const respuesta = await fetch(`${CONFIGURACION.URL_BASE_API}/historial/${idEnvio}`);
        if (!respuesta.ok) return []; // Si no hay historial, devolvemos lista vacía en lugar de error
        
        const texto = await respuesta.text();
        return texto ? JSON.parse(texto) : [];
    }
};