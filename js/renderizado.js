const Renderizador = {
    pintarTodo: (datos, historial) => {

        const contenedor = document.getElementById('lista-rastreo');
        contenedor.innerHTML = '';

        // --- SECCIÓN: INFORMACIÓN DE LA CARGA ---
        let htmlPaquetes = `
            <div class="mb-10">
                <div class="flex items-center gap-3 mb-6">
                    <div class="bg-orange-50 p-3 rounded-xl text-orange-600 shadow-sm">📦</div>
                    <h3 class="text-[#1E3B5C] font-black uppercase text-sm tracking-widest">Información de la Carga</h3>
                </div>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        `;
// Itera sobre la lista de paquetes para generar dinámicamente las tarjetas 
        datos.paquetes.forEach((p, i) => {
            htmlPaquetes += `
                <div class="bg-white border border-gray-100 p-6 rounded-[2rem] shadow-sm relative overflow-hidden">
                    <div class="flex justify-between items-start mb-4">
                        <div>
                            <span class="bg-[#1E3B5C] text-white text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-tighter">Unidad ${i + 1}</span>
                            <p class="text-[10px] text-gray-400 font-bold mt-3 uppercase">Descripción</p>
                            <h4 class="text-[#1E3B5C] font-extrabold text-lg leading-tight">${p.descripcion || 'Sin descripción'}</h4>
                        </div>
                        <span class="text-orange-500 font-bold text-xs">ID: ${p.idPaquete || (i + 1)}</span>
                    </div>

                    <hr class="border-gray-50 mb-4">

                    <div class="grid grid-cols-2 gap-y-5 gap-x-4">
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Peso Neto</p>
                            <p class="text-[#1E3B5C] font-black text-base">${p.peso} <span class="text-gray-400 font-medium text-xs">kg</span></p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Largo</p>
                            <p class="text-[#1E3B5C] font-black text-base">${p.alto} <span class="text-gray-400 font-medium text-xs">cm</span></p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Ancho</p>
                            <p class="text-[#1E3B5C] font-black text-base">${p.ancho} <span class="text-gray-400 font-medium text-xs">cm</span></p>
                        </div>
                        <div>
                            <p class="text-[10px] text-gray-400 font-bold uppercase mb-1">Alto</p>
                            <p class="text-[#1E3B5C] font-black text-base">${p.profundidad} <span class="text-gray-400 font-medium text-xs">cm</span></p>
                        </div>
                    </div>
                </div>`;
        });
        htmlPaquetes += `</div></div> <hr class="border-gray-100 my-10">`;

        // --- SECCIÓN: TRAYECTO DEL ENVÍO ---
        // Usamos let para permitir que el contenido se actualice dinámicamente según los datos de la base de datos
        let htmlHistorial = `
            <div>
                <div class="flex items-center gap-3 mb-8">
                    <div class="bg-blue-50 p-3 rounded-xl text-blue-600 shadow-sm">📍</div>
                    <h3 class="text-[#1E3B5C] font-black uppercase text-sm tracking-widest">Trayecto del Envío</h3>
                </div>
                <div class="relative pl-8 border-l-2 border-gray-100 ml-4 space-y-10">
        `;

        const historialOrdenado = [...historial].sort((a, b) => new Date(b.fechaHora) - new Date(a.fechaHora));

        historialOrdenado.forEach((h, index) => {
            const esUltimo = index === 0;
            const fecha = new Date(h.fechaHora).toLocaleString('es-MX', {
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit', hour12: true
            });

            const tituloEstatus = h.nombreEstatus || 'Actualización de trayecto';

            htmlHistorial += `
                <div class="relative">
                    <div class="absolute -left-[41px] top-1 w-5 h-5 rounded-full ${esUltimo ? 'bg-orange-500 ring-4 ring-orange-100' : 'bg-gray-300'} border-4 border-white"></div>
                    
                    <div>
                        <p class="text-[10px] font-bold ${esUltimo ? 'text-orange-500' : 'text-gray-400'} uppercase mb-1">${fecha}</p>
                        <p class="text-sm font-extrabold text-[#1E3B5C] uppercase tracking-tight">${tituloEstatus}</p>
                        <p class="text-[11px] text-gray-400 mt-1 italic leading-relaxed">"${h.comentario || 'Sin observaciones'}"</p>
                    </div>
                </div>`;
        });

        htmlHistorial += `
    <div class="relative">
        <div class="absolute -left-[41px] top-1 w-5 h-5 rounded-full bg-gray-300 border-4 border-white"></div>
        <div>
            <p class="text-[10px] font-bold text-gray-400 uppercase mb-1">Punto de Partida</p>
            <p class="text-sm font-extrabold text-[#1E3B5C] uppercase tracking-tight">ORIGEN</p>
            <p class="text-[11px] text-gray-400 mt-1">
                Envío registrado desde <span class="font-bold text-gray-600">${datos.sucursalOrigen || 'Sucursal de Origen'}</span> 
                hacia <span class="font-bold text-gray-600">${datos.dirCiudad}, ${datos.dirEstado}</span>.
            </p>
        </div>
    </div>
`;

        htmlHistorial += `</div></div>`;

        contenedor.innerHTML = htmlPaquetes + htmlHistorial;
    }
};