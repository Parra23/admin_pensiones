window._habitaciones = [];
// Helper para crear un select
function crearSelect({ name, label, options, value, placeholder = "Seleccione una opción" }) {
    return `
        <div style="margin-bottom:1em;">
            <label style="font-weight:600;">${label}:</label>
            <select name="${name}" class="modal-input modal-select" style="width:100%;padding:0.7em 1em;border-radius:7px;border:1.5px solid #A32232;outline:none;font-size:1em;">
                <option value="">${placeholder}</option>
                ${options.map(opt => `
                    <option value="${opt.value}" ${opt.value == value ? 'selected' : ''}>${opt.label}</option>
                `).join('')}
            </select>
        </div>
    `;
}
// Función para obtener el HTML del formulario según los campos y tipo
async function getFormHtml(campos, departamentos = null, tipo = 'insertar', API_BASE_URL = null, currentEndpoint = "") {
    let html = '';
    let pensiones = [];
    let habitaciones = [];
    let ciudades = [];
    let usuarios = [];
    let servicios = [];
    let reservas = [];
    let metodosPago = [];

    // --- Carga los datos primero ---
    // Siempre cargar pensiones y servicios si el endpoint es pensiones_servicios
    if (
        (currentEndpoint && currentEndpoint.includes("pension") && currentEndpoint.includes("servicio")) ||
        Object.keys(campos).includes('id_pension')
    ) {
        try {
            const resp = await fetch(`${API_BASE_URL}/v_pensiones`);
            pensiones = await resp.json();
        } catch {}
    }
    if (
        (currentEndpoint && currentEndpoint.includes("servicio")) ||
        Object.keys(campos).includes('id_servicio') ||
        Object.keys(campos).includes('id_pension_servicio')
    ) {
        try {
            const resp = await fetch(`${API_BASE_URL}/servicios`);
            servicios = await resp.json();
        } catch {}
    }
    if (
        currentEndpoint === "habitaciones_servicios" ||
        Object.keys(campos).includes('id_habitacion')
    ) {
        try {
            const resp = await fetch(`${API_BASE_URL}/v_habitaciones`);
            habitaciones = await resp.json();
        } catch {}
    }
    if ((Object.keys(campos).includes('id_propietario') || Object.keys(campos).includes('id_usuario')) && API_BASE_URL) {
        try {
            const resp = await fetch(`${API_BASE_URL}/v_usuarios`);
            usuarios = await resp.json();
        } catch {}
    }
    if ((Object.keys(campos).includes('id_ciudad')) && API_BASE_URL) {
        try {
            const resp = await fetch(`${API_BASE_URL}/v_ciudades`);
            ciudades = await resp.json();
        } catch {}
    }
    // Cargar reservas si el formulario es de pagos
    if (Object.keys(campos).includes('id_reserva') && API_BASE_URL) {
        try {
            const resp = await fetch(`${API_BASE_URL}/v_reservas`);
            reservas = await resp.json();
        } catch {}
    }
    // Cargar métodos de pago si el formulario es de pagos
    if (Object.keys(campos).includes('id_metodo_pago') && API_BASE_URL) {
        try {
            const resp = await fetch(`${API_BASE_URL}/metodos_pago`);
            metodosPago = await resp.json();
        } catch {}
    }

    // --- Ahora define config ---
    const config = {
        imagen: [
            { key: 'id_imagen', type: 'readonly', show: tipo === 'editar' },
            { key: 'id_pension', type: 'select', options: pensiones.map(p => ({ value: p.id_pension, label: p.nombre })), placeholder: "Seleccione una pensión" },
            { key: 'id_habitacion', type: 'select', options: habitaciones.map(h => ({ value: h.id_habitacion, label: h.descripcion })), placeholder: "Sin habitación" },
            { key: 'url', type: 'text' },
            { key: 'descripcion', type: 'text' }
        ],
        habitacion: [
            { key: 'id_habitacion', type: 'readonly', show: tipo === 'editar' },
            { key: 'id_pension', type: 'select', options: pensiones.map(p => ({ value: p.id_pension, label: p.nombre })), placeholder: "Seleccione una pensión" },
            { key: 'descripcion', type: 'text' },
            { key: 'capacidad', type: 'number' },
            { key: 'sobreocupacion', type: 'text', label: 'Sobreocupación', readonly: true, show: true }, // <-- Añade esto
            { key: 'estado_habitacion', type: 'select', options: [
                { value: 1, label: "Disponible" },
                { value: 0, label: "Ocupada" }
            ]}
        ],
        ciudad: [
            { key: 'id_ciudad', type: 'readonly', show: tipo === 'editar', label: 'ID Ciudad' },
            { key: 'nombre', type: 'text', label: 'Ciudad' }, // <-- Cambia 'ciudad' por 'nombre'
            { key: 'id_departamento', type: 'select', label: 'Departamento', options: (departamentos || []).map(dep => ({ value: dep.id_departamento, label: dep.nombre })), placeholder: "Seleccione un departamento" }
        ],
        departamentos: [
            { key: 'id_departamento', type: 'readonly', show: tipo === 'editar', label: 'ID Departamento' },
            { key: 'nombre', type: 'text', label: 'Nombre' }
        ],
        pensiones: [
            { key: 'id_pension', type: 'readonly', show: tipo === 'editar', label: 'ID Pensión' },
            { key: 'nombre', type: 'text', label: 'Nombre' },
            { key: 'descripcion', type: 'text', label: 'Descripción' },
            { key: 'direccion', type: 'text', label: 'Dirección' },
            { key: 'precio_mensual', type: 'number', step: "0.01", label: 'Precio Mensual' },
            { key: 'reglas', type: 'text', label: 'Reglas' },
            { key: 'estado_pension', type: 'select', label: 'Estado', options: [
                { value: 1, label: "Activa" },
                { value: 0, label: "Inactiva" }
            ]},
            { key: 'id_propietario', type: 'select', label: 'Propietario', options: (usuarios || []).filter(u => u.rol === 2).map(u => ({ value: u.id_usuario, label: u.nombre })), placeholder: "Seleccione un propietario" },
            { key: 'id_ciudad', type: 'select', label: 'Ciudad', options: (ciudades || []).map(c => ({ value: c.id_ciudad, label: c.ciudad })), placeholder: "Seleccione una ciudad" }
        ],
        resena: [
            { key: 'id_resena', type: 'readonly', show: tipo === 'editar', label: 'ID Reseña' },
            { key: 'id_pension', type: 'select', label: 'Pensión', options: pensiones.map(p => ({ value: p.id_pension, label: p.nombre })), placeholder: "Seleccione una pensión" },
            { key: 'id_usuario', type: 'select', label: 'Usuario', options: usuarios.map(u => ({ value: u.id_usuario, label: u.nombre })), placeholder: "Seleccione un usuario" },
            { key: 'calificacion', type: 'number', step: "1", label: 'Calificación (1-5)' },
            { key: 'comentario', type: 'text', label: 'Comentario' }
        ],
        servicios: [
            { key: 'id_servicio', type: 'readonly', show: tipo === 'editar', label: 'ID Servicio' },
            { key: 'nombre', type: 'text', label: 'Nombre del Servicio' }
        ],
        pensiones_servicios: [
            { key: 'id_pension', type: 'select', label: 'Pensión', options: pensiones.map(p => ({ value: p.id_pension, label: p.nombre })), placeholder: "Seleccione una pensión" },
            { key: 'id_servicio', type: 'select', label: 'Servicio', options: servicios.map(s => ({ value: s.id_servicio, label: s.nombre })), placeholder: "Seleccione un servicio" }
        ],
        habitaciones_servicios: [
            // Solo para insertar: habitación y servicio como select
            { key: 'id_habitacion', type: 'select', label: 'Habitación', options: habitaciones.map(h => ({ value: h.id_habitacion, label: `[${h.id_habitacion}] ${h.descripcion}` })), placeholder: "Seleccione una habitación" },
            { key: 'id_servicio', type: 'select', label: 'Servicio', options: servicios.map(s => ({ value: s.id_servicio, label: s.nombre })), placeholder: "Seleccione un servicio" }
        ],
        reservas: [
            { key: 'id_reserva', type: 'readonly', show: tipo === 'editar', label: 'ID Reserva' },
            { key: 'id_usuario', type: 'select', label: 'Usuario', options: usuarios.map(u => ({ value: u.id_usuario, label: u.nombre })), placeholder: "Seleccione un usuario" },
            { key: 'id_pension', type: 'select', label: 'Pensión', options: pensiones.map(p => ({ value: p.id_pension, label: p.nombre })), placeholder: "Seleccione una pensión" },
            { key: 'id_habitacion', type: 'select', label: 'Habitación', options: [], placeholder: "Seleccione una habitación" }, // Se llenará dinámicamente
            { key: 'fecha_inicio', type: 'date', label: 'Fecha de Inicio' },
            { key: 'fecha_fin', type: 'date', label: 'Fecha de Fin' },
            { key: 'estado_reserva', type: 'select', label: 'Estado Reserva', options: [
                { value: 1, label: "Pendiente" },
                { value: 2, label: "Confirmada" },
                { value: 3, label: "Cancelada" }
            ]},
            { key: 'total', type: 'number', step: "0.01", label: 'Total' }
        ],
        
        usuarios: [
            { key: 'id_usuario', type: 'readonly', show: tipo === 'editar', label: 'ID Usuario' },
            { key: 'nombre', type: 'text', label: 'Nombre' },
            { key: 'apellido', type: 'text', label: 'Apellido' },
            { key: 'contrasenna', type: 'password', label: 'Contraseña' },
            { key: 'email', type: 'email', label: 'Email' },
            { key: 'telefono', type: 'text', label: 'Teléfono' },
            { key: 'rol', type: 'select', label: 'Rol', options: [
                { value: 1, label: "Cliente" },
                { value: 2, label: "Propietario" },
                { value: 3, label: "Administrador" }
            ]},
            { key: 'estado_usuario', type: 'select', label: 'Estado Usuario', options: [
                { value: 1, label: "Activo" },
                { value: 0, label: "Inactivo" }
            ]}
        ],
        metodos_pago: [
            { key: 'id_metodo_pago', type: 'readonly', show: tipo === 'editar', label: 'ID Método de Pago' },
            { key: 'nombre', type: 'text', label: 'Nombre del Método de Pago' },
        ],pagos: [
            { key: 'id_pago', type: 'readonly', show: tipo === 'editar', label: 'ID Pago' },
            { key: 'id_reserva', type: 'select', label: 'Reserva', options: reservas.map(r => ({ value: r.id_reserva, label: `[${r.id_reserva}] ${r.usuario} - ${r.pension}` })), placeholder: "Seleccione una reserva" },
            { key: 'monto', type: 'number', step: "0.01", label: 'Monto' },
            { key: 'id_metodo_pago', type: 'select', label: 'Método de Pago', options: metodosPago.map(m => ({ value: m.id_metodo_pago, label: m.nombre })), placeholder: "Seleccione un método de pago" },
            { key: 'pendiente', type: 'text', label: 'Pendiente', readonly: true, show: tipo === 'insertar' || (tipo === 'editar') }       
        ]
    };

    // Detectar tipo de formulario
    let entidad = null;
    if (API_BASE_URL && typeof currentEndpoint === "string") {
        if (currentEndpoint.includes("pension") && currentEndpoint.includes("servicio")) {
            entidad = "pensiones_servicios";
        } else if (currentEndpoint.includes("habitacion") && currentEndpoint.includes("servicio")) {
            entidad = "habitaciones_servicios";
        }
    }
    if (!entidad) {
        if (campos.hasOwnProperty('id_pago')) entidad = 'pagos';
        else if (campos.hasOwnProperty('id_reserva')) entidad = 'reservas';
        else if (campos.hasOwnProperty('id_imagen')) entidad = 'imagen';
        else if (campos.hasOwnProperty('id_habitacion_servicio')) entidad = 'habitaciones_servicios';
        else if (campos.hasOwnProperty('id_habitacion')) entidad = 'habitacion';
        else if (campos.hasOwnProperty('id_resena')) entidad = 'resena';
        else if (campos.hasOwnProperty('id_pension_servicio')) entidad = 'pensiones_servicios';
        else if (campos.hasOwnProperty('id_pension')) entidad = 'pensiones';
        else if (campos.hasOwnProperty('id_ciudad')) entidad = 'ciudad';
        else if (campos.hasOwnProperty('id_departamento')) entidad = 'departamentos';
        else if (campos.hasOwnProperty('id_servicio')) entidad = 'servicios';
        else if (campos.hasOwnProperty('id_usuario')) entidad = 'usuarios';
        else if (campos.hasOwnProperty('id_metodo_pago')) entidad = 'metodos_pago';
    }
    if (entidad) {
        // Ordena los campos por el key alfabéticamente
        const camposOrdenados = [...config[entidad]].sort((a, b) => a.key.localeCompare(b.key));
        for (const field of camposOrdenados) {
            if (field.show === false) continue;
            let value = campos[field.key] ?? '';
            let label = field.label || field.key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            if (field.type === 'readonly') {
                html += `
                    <div style="margin-bottom:1em;">
                        <label style="font-weight:600;">${label}:</label>
                        <input type="text" name="${field.key}" value="${value}" class="modal-input" readonly
                        style="width:100%;padding:0.7em 1em;border-radius:7px;border:1.5px solid #A32232;outline:none;font-size:1em;"/>
                    </div>
                `;
            } else if (field.type === 'select') {
                html += crearSelect({
                    name: field.key,
                    label,
                    options: field.options,
                    value,
                    placeholder: field.placeholder
                });
            } else {
                html += `
                    <div style="margin-bottom:1em;">
                        <label style="font-weight:600;">${label}:</label>
                        <input type="${field.type}" name="${field.key}" value="${value}" class="modal-input"
                        style="width:100%;padding:0.7em 1em;border-radius:7px;border:1.5px solid #A32232;outline:none;font-size:1em;"
                        ${field.step ? `step="${field.step}"` : ''}/>
                    </div>
                `;
            }
        }
    }

    html += `<button type="submit" class="modal-btn-guardar">Guardar</button>`;
    window._habitaciones = habitaciones;
    return { html, entidad };
}

// Función para abrir el modal y cargar el formulario

async function abrirModal(tipo, rowData, currentEndpoint, modal, modalTitle, modalFormContent, API_BASE_URL) {
    modal.style.display = 'flex';
    modalTitle.textContent = tipo === 'insertar' ? 'Insertar Registro' : 'Editar Registro';

    let campos = {};
    let departamentos = null;

    // Caso especial: Ciudades
    if (currentEndpoint === "v_ciudades") {
        try {
            const resp = await fetch(`${API_BASE_URL}/Departamentos`);
            departamentos = await resp.json();
        } catch {
            departamentos = [];
        }
        campos = {
            id_ciudad: rowData ? rowData.id_ciudad : '',
            nombre: rowData ? rowData.nombre || rowData.ciudad : '', // <-- usa 'nombre'
            id_departamento: rowData ? rowData.id_departamento : ''
        };
    } else if (rowData) {
        // Para editar: usa los datos de la fila
        Object.entries(rowData).forEach(([key, value]) => {
            campos[key] = value;
        });
        // Para pensiones_servicios, guarda el id_servicio original
        if (currentEndpoint.includes("pension") && currentEndpoint.includes("servicio")) {
            campos.id_servicio_original = rowData.id_servicio;
        }
    } else {
        // Para insertar: obtener campos vacíos desde la API para cualquier tabla
        try {
            const data = await fetch(`${API_BASE_URL}/${currentEndpoint}`).then(r => r.json());
            if (Array.isArray(data) && data.length > 0) {
                Object.keys(data[0]).forEach(key => campos[key] = '');
            } else {
                // Fuerza los campos vacíos para cada entidad conocida
                if (currentEndpoint === "Departamentos") {
                    campos.id_departamento = '';
                    campos.nombre = '';
                }else if (
                    currentEndpoint === "habitacion" ||
                    currentEndpoint === "habitaciones" ||
                    currentEndpoint === "v_habitaciones"
                ) {
                    campos.id_habitacion = '';
                    campos.id_pension = '';
                    campos.descripcion = '';
                    campos.capacidad = '';
                    
                    campos.estado_habitacion = '';
                } else if (currentEndpoint === "servicios") {
                    campos.id_servicio = '';
                    campos.nombre = '';
                } else if (currentEndpoint === "usuarios") {
                    campos.id_usuario = '';
                    campos.nombre = '';
                    campos.apellido = '';
                    campos.contrasenna = '';
                    campos.email = '';
                    campos.telefono = '';
                    campos.rol = '';
                    campos.estado_usuario = '';
                } else if (currentEndpoint === "resena" || currentEndpoint === "resenas" || currentEndpoint === "v_resenas") {
                    campos.id_resena = '';
                    campos.id_pension = '';
                    campos.id_usuario = '';
                    campos.calificacion = '';
                    campos.comentario = '';
                } else if (currentEndpoint === "pagos") {
                    campos.id_pago = '';
                    campos.id_reserva = '';
                    campos.monto = '';
                    campos.id_metodo_pago = '';
                    campos.pendiente = '';
                }
                // Agrega aquí más entidades según tu necesidad
            }
        } catch (e) {
            showToast('No se pudieron obtener los campos para el formulario', "#c0392b");
        }
        
    }

    const { html, entidad } = await getFormHtml(campos, departamentos, tipo, API_BASE_URL, currentEndpoint);
    modalFormContent.innerHTML = html;

    // Estilos para el botón guardar
    const style = document.createElement('style');
    style.innerHTML = `
        .modal-btn-guardar {
            display: block;
            width: 100%;
            background: linear-gradient(90deg,#A32232 60%,#8F1B28 100%);
            color: #fff;
            padding: 0.9em 0;
            border: none;
            border-radius: 7px;
            font-size: 1.1em;
            font-weight: 700;
            cursor: pointer;
            margin: 1.2em auto 0 auto;
            transition: background 0.2s;
            text-align: center;
        }
        .modal-btn-guardar:hover {
            background: linear-gradient(90deg,#8F1B28 60%,#A32232 100%);
        }
        .modal-input:focus, .modal-select:focus {
            border-color: #8F1B28;
            box-shadow: 0 0 0 2px #A3223233;
        }
        /* Scroll y tamaño fijo para el modal */
        #modal-form > div {
            max-width: 480px;
            max-height: 80vh;
            overflow-y: auto;
            overflow-x: hidden;
            min-width: 320px;
            box-sizing: border-box;
        }
    `;
    document.head.appendChild(style);

    const form = modalFormContent;
    const originalData = {...campos};

    // --- Mueve este bloque AQUÍ, fuera de form.onsubmit ---
    if (entidad === 'reservas') {
    const selectPension = form.querySelector('select[name="id_pension"]');
    const selectHabitacion = form.querySelector('select[name="id_habitacion"]');

    function actualizarHabitaciones() {
        if (!window._habitaciones || !Array.isArray(window._habitaciones)) {
            selectHabitacion.innerHTML = `<option value="">Seleccione una habitación</option>`;
            return;
        }
        const idPension = Number(selectPension.value);
        const habitacionesFiltradas = window._habitaciones.filter(h => {
            if (typeof h.id_pension === 'object' && h.id_pension !== null) {
                return Number(h.id_pension.id_pension) === idPension;
            }
            return Number(h.id_pension) === idPension;
        });
        selectHabitacion.innerHTML = `<option value="">Seleccione una habitación</option>` +
            habitacionesFiltradas.map(h => `<option value="${h.id_habitacion}">[${h.id_habitacion}] ${h.descripcion}</option>`).join('');
        // Selecciona la habitación actual si existe (al editar)
        if (form.originalData && form.originalData.id_habitacion) {
            selectHabitacion.value = form.originalData.id_habitacion;
        }
    }

    // Guarda los datos originales para usarlos en actualizarHabitaciones
    form.originalData = originalData;

    setTimeout(() => {
        if (selectPension.value) actualizarHabitaciones();
        selectPension.addEventListener('change', actualizarHabitaciones);
    }, 0);
}
    // --- Fin del bloque dinámico ---

    // --- Agrega este bloque para la entidad 'imagen' ---
    if (entidad === 'imagen') {
    const selectPension = form.querySelector('select[name="id_pension"]');
    const selectHabitacion = form.querySelector('select[name="id_habitacion"]');

    function actualizarHabitacionesImagen() {
        if (!window._habitaciones || !Array.isArray(window._habitaciones)) {
            selectHabitacion.innerHTML = `<option value="">Sin habitación</option>`;
            return;
        }
        const idPension = Number(selectPension.value);
        const habitacionesFiltradas = window._habitaciones.filter(h => {
            if (typeof h.id_pension === 'object' && h.id_pension !== null) {
                return Number(h.id_pension.id_pension) === idPension;
            }
            return Number(h.id_pension) === idPension;
        });
        selectHabitacion.innerHTML = `<option value="">Sin habitación</option>` +
            habitacionesFiltradas.map(h => `<option value="${h.id_habitacion}">[${h.id_habitacion}] ${h.descripcion}</option>`).join('');
        // Selecciona la habitación actual si existe (al editar)
        if (form.originalData && form.originalData.id_habitacion) {
            selectHabitacion.value = form.originalData.id_habitacion;
        }
    }

    form.originalData = originalData;

    setTimeout(() => {
        if (selectPension.value) actualizarHabitacionesImagen();
        selectPension.addEventListener('change', actualizarHabitacionesImagen);
    }, 0);
}
    // --- Fin del bloque para la entidad 'imagen' ---

    // --- Fin del bloque para la entidad 'habitaciones_servicios' ---

    form.onsubmit = async function(e) {
        e.preventDefault();
        const formData = new FormData(form);
        let data = {};
        let changed = false;
        formData.forEach((value, key) => {
            if (key === 'id_habitacion' && value === "") {
                data[key] = null;
            } else {
                data[key] = key.startsWith('id_') ? Number(value) : value;
            }
            if (String(data[key]) !== String(originalData[key])) changed = true;
        });

        // Validación para imágenes
        if (campos.hasOwnProperty('id_imagen')) {
            if (!data.id_pension || data.id_pension === 0) {
                showToast('Debes seleccionar una pensión válida', "#c0392b");
                return;
            }
            // id_habitacion puede ser null, no validar
            if (!data.url || !data.descripcion) {
                showToast('URL y descripción son obligatorios', "#c0392b");
                return;
            }
        }

        // Bloquear edición para pensiones_servicios y habitaciones_servicios
        if (
            (entidad === 'pensiones_servicios' || entidad === 'habitaciones_servicios')
            && tipo === 'editar'
        ) {
            showToast('No se permite editar este registro. Solo insertar o eliminar.', "#c0392b");
            return;
        }

        // Validación para ciudades
        if (entidad === 'ciudad') {
            if (!data.nombre || !data.id_departamento) {
                showToast('Debes ingresar el nombre y seleccionar un departamento', "#c0392b");
                return;
            }
        }

        if (!changed) {
            showToast('No hay cambios para guardar', "#f39c12");
            return;
        }

        let url = `${API_BASE_URL}/${currentEndpoint}`;
let method = tipo === 'editar' ? 'PUT' : 'POST';
        // No cambies el endpoint, usa currentEndpoint tal cual para POST y PUT


        // --- BLOQUE DE RESERVAS DEBE IR AQUÍ ---
        if (entidad === 'reservas') {
            const dataReserva = {
                id_usuario: data.id_usuario,
                id_habitacion: data.id_habitacion,
                fecha_inicio: data.fecha_inicio,
                fecha_fin: data.fecha_fin,
                estado_reserva: data.estado_reserva,
                total: data.total
            };
            if (tipo === 'editar') {
                dataReserva.id_reserva = data.id_reserva;
                url += `/${data.id_reserva}`;
            }
            data = dataReserva;
        } else if (entidad === 'pagos') {
            const dataPago = {
                id_reserva: data.id_reserva,
                monto: data.monto,
                id_metodo_pago: data.id_metodo_pago
            };
            if (tipo === 'editar') {
                dataPago.id_pago = data.id_pago;
                url += `/${data.id_pago}`;
            }
            data = dataPago;
        } else if (entidad === 'habitacion') {
            const dataHabitacion = {
                id_pension: data.id_pension,
                descripcion: data.descripcion,
                capacidad: data.capacidad,
                estado_habitacion: data.estado_habitacion
            };
            if (tipo === 'editar') {
                dataHabitacion.id_habitacion = data.id_habitacion;
                url += `/${data.id_habitacion}`;
            }
            data = dataHabitacion;
        } else if (campos.hasOwnProperty('id_imagen')) {
            const dataImagen = {
                id_pension: data.id_pension,
                id_habitacion: data.id_habitacion,
                url: data.url,
                descripcion: data.descripcion
            };
            if (tipo === 'editar') {
                dataImagen.id_imagen = data.id_imagen;
                url += `/${data.id_imagen}`;
            }
            data = dataImagen;
        } else if (currentEndpoint === "v_ciudades" || entidad === "ciudad") {
            url = `${API_BASE_URL}/v_ciudades`;
            const dataCiudad = {
                ciudad: data.nombre, // <-- Cambia 'nombre' por 'ciudad'
                id_departamento: data.id_departamento
            };
            if (tipo === 'editar') {
                dataCiudad.id_ciudad = data.id_ciudad;
                url += `/${data.id_ciudad}`;
            }
            data = dataCiudad;
        } else if (campos.hasOwnProperty('id_resena')) {
            const dataResena = {
                id_pension: data.id_pension,
                id_usuario: data.id_usuario,
                calificacion: data.calificacion,
                comentario: data.comentario
            };
            if (tipo === 'editar') {
                dataResena.id_resena = data.id_resena;
                url += `/${data.id_resena}`;
            }
            data = dataResena;
        } else if (entidad === 'pensiones_servicios') {
            data = {
                id_pension: Number(formData.get('id_pension')),
                id_servicio: Number(formData.get('id_servicio'))
            };
            // SOLO para POST, NO agregues los IDs a la URL:
            // url += `/${data.id_pension}/${data.id_servicio}`; // <-- QUITA ESTA LÍNEA
            console.log("Enviando:", data);
        } else if (entidad === 'habitaciones_servicios') {
            data = {
                id_habitacion: Number(formData.get('id_habitacion')),
                id_servicio: Number(formData.get('id_servicio'))
            };
            console.log("Enviando:", data);
        } else if (entidad === 'habitacion') {
            const dataHabitacion = {
                id_pension: data.id_pension,
                descripcion: data.descripcion,
                capacidad: data.capacidad,
                estado_habitacion: data.estado_habitacion
            };
            if (tipo === 'editar') {
                dataHabitacion.id_habitacion = data.id_habitacion;
                url += `/${data.id_habitacion}`;
            }
            data = dataHabitacion;
        } else if (campos.hasOwnProperty('id_habitacion')) {
            const dataHabitacion = {
                id_pension: data.id_pension,
                descripcion: data.descripcion,
                capacidad: data.capacidad,
                estado_habitacion: data.estado_habitacion
            };
            if (tipo === 'editar') {
                dataHabitacion.id_habitacion = data.id_habitacion;
                url += `/${data.id_habitacion}`;
            }
            data = dataHabitacion;
        } else if (campos.hasOwnProperty('id_pension')) {
            const dataPension = {
                id_pension: data.id_pension,
                nombre: data.nombre,
                descripcion: data.descripcion,
                direccion: data.direccion,
                precio_mensual: data.precio_mensual,
                reglas: data.reglas,
                estado_pension: data.estado_pension,
                id_propietario: data.id_propietario,
                id_ciudad: data.id_ciudad
            };
            if (tipo === 'editar') {
                url += `/${data.id_pension}`;
            }
            data = dataPension;
        } else if (campos.hasOwnProperty('id_departamento')) {
            const dataDepartamento = { nombre: data.nombre };
            if (tipo === 'editar') {
                dataDepartamento.id_departamento = data.id_departamento;
                url += `/${data.id_departamento}`;
            }
            data = dataDepartamento;
        }else if (campos.hasOwnProperty('id_servicio')) {
            const dataServicio = {
                nombre: data.nombre
            };
            if (tipo === 'editar') {
                dataServicio.id_servicio = data.id_servicio;
                url += `/${data.id_servicio}`;
            }
            data = dataServicio;
        } else if (campos.hasOwnProperty('id_pension_servicio')) {
            const dataPensionServicio = {
                id_pension: data.id_pension,
                id_servicio: data.id_servicio
            };
            if (tipo === 'editar') {
                dataPensionServicio.id_pension_servicio = data.id_pension_servicio;
                url += `/${data.id_pension_servicio}`;
            }
            data = dataPensionServicio;
        } else if (campos.hasOwnProperty('id_pension') && campos.hasOwnproperty('id_servicio') && tipo === 'editar' && currentEndpoint.includes("pension") && currentEndpoint.includes("servicio")) {
            // Para pensiones_servicios editar
            const dataPensionServicio = {
                id_pension: data.id_pension,
                id_servicio: data.id_servicio_original, // el original
                id_servicio_nuevo: data.id_servicio     // el nuevo seleccionado
            };
            url += `/${data.id_pension}/${data.id_servicio}`;
            data = dataPensionServicio;
        } else if (entidad === 'metodos_pago') {
    const dataMetodoPago = {
        nombre: data.nombre
    };
    if (tipo === 'editar') {
        dataMetodoPago.id_metodo_pago = data.id_metodo_pago;
        url += `/${data.id_metodo_pago}`; // Agrega el ID a la URL para PUT
    }
    data = dataMetodoPago;
    }else if (entidad === 'usuarios') {
    const dataUsuario = {
        nombre: data.nombre,
        apellido: data.apellido,
        contrasenna: data.contrasenna,
        email: data.email,
        telefono: data.telefono,
        rol: data.rol,
        estado_usuario: data.estado_usuario
    };
    if (tipo === 'editar') {
        dataUsuario.id_usuario = data.id_usuario;
        url += `/${data.id_usuario}`;
    }
    data = dataUsuario;
    }  else if (entidad === 'pagos') {
        const dataPago = {
            id_reserva: data.id_reserva,
            monto: data.monto,
            id_metodo_pago: data.id_metodo_pago,
        };
        if (tipo === 'editar') {
            dataPago.id_pago = data.id_pago;
            url += `/${data.id_pago}`;
        }
        data = dataPago;
    }
    else {
            if (tipo === 'editar' && data.id_ciudad) url += `/${data.id_ciudad}`;
            if (tipo === 'editar' && data.id && !data.id_ciudad) url += `/${data.id}`;
        }

        console.log("Enviando:", data);

        const resp = await fetch(url, {
            method,
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(data)
        });

        if (resp.ok) {
            showToast('Registro guardado correctamente', "#27ae60");
            modal.style.display = 'none';
            location.reload(); // <-- Recarga la página después de guardar o editar
        } else {
            showToast('Error al guardar', "#c0392b");
        }
    };
}

// Helper para obtener departamentos
async function obtenerDepartamentos(API_BASE_URL) {
    const resp = await fetch(`${API_BASE_URL}/Departamentos`);
    return await resp.json();
}

function showToast(message, color = "#A32232") {
    let toast = document.getElementById("toast-msg");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "toast-msg";
        document.body.appendChild(toast);
        toast.style.cssText = `
            visibility:hidden;min-width:250px;background-color:${color};color:#fff;text-align:center;
            border-radius:8px;padding:1em 2em;position:fixed;z-index:99999;left:50%;bottom:40px;
            font-size:1.1em;transform:translateX(-50%);opacity:0;transition:opacity 0.4s,visibility 0.4s;
        `;
    }
    toast.textContent = message;
    toast.style.backgroundColor = color;
    toast.className = "show";
    toast.style.visibility = "visible";
    toast.style.opacity = "1";
    setTimeout(() => {
        toast.className = toast.className.replace("show", "");
        toast.style.opacity = "0";
        toast.style.visibility = "hidden";
    }, 2500);
}
window.abrirModal = abrirModal;
