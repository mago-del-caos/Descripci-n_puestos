const WORKER_URL = "https://org-juventud-puestos-api.adrian-camelot32.workers.dev/api/registros"; 
let baseDeDatos = [];

const puestosOrganigrama = [
    "Dirección General", "Asistente Dirección General", "Subdirección Académica", 
    "Dirección Técnica Preescolar", "Dirección Técnica Primaria", "Dirección Técnicas Secundaria", "Dirección técnica Preparatoria", 
    "Coordinaciones", "Coordinación Inglés", "Coordinación Psicología", "Coordinación Deportes", "Extraescolares", 
    "Acad. Pastoral", "Coordinación Francés", "Servicios Escolares", "Innovación Educativa", 
    "Área Jurídica", "Comunicación y Marketing", "Admisiones", "Marketing MFRs", 
    "Redes Sociales", "Subdirección Administrativa", "Servicios Generales", 
    "Mantenimiento", "Limpieza", "Jardinería", "Compras", "Recursos Humanos", 
    "Control Interno", "Relaciones Públicas", "Sistemas", "Cajas", "Prefectura", "Otro"
];

// Cargar las opciones (checkboxes) cuando inicie la página
document.addEventListener("DOMContentLoaded", () => {
    const listaProporciona = document.getElementById('listaProporciona');
    const listaRecibe = document.getElementById('listaRecibe');
    
    puestosOrganigrama.forEach(puesto => {
        // Crear casilla para "Proporciona"
        const lbl1 = document.createElement('label');
        lbl1.className = 'checkbox-item';
        lbl1.innerHTML = `<input type="checkbox" value="${puesto}" onchange="actualizarExplicaciones('listaProporciona', 'containerProporciona', 'Lo que proporciona a')"> <span>${puesto}</span>`;
        listaProporciona.appendChild(lbl1);

        // Crear casilla para "Recibe"
        const lbl2 = document.createElement('label');
        lbl2.className = 'checkbox-item';
        lbl2.innerHTML = `<input type="checkbox" value="${puesto}" onchange="actualizarExplicaciones('listaRecibe', 'containerRecibe', 'Lo que recibe de')"> <span>${puesto}</span>`;
        listaRecibe.appendChild(lbl2);
    });
});

// Generar cuadros de texto dinámicos leyendo las casillas marcadas
function actualizarExplicaciones(listaId, containerId, textoLabel) {
    const lista = document.getElementById(listaId);
    const container = document.getElementById(containerId);
    
    // Buscar qué casillas están marcadas en esta lista
    const checkboxesMarcados = lista.querySelectorAll('input[type="checkbox"]:checked');
    const opcionesSeleccionadas = Array.from(checkboxesMarcados).map(cb => cb.value);
    
    container.innerHTML = ''; // Limpiar el contenedor
    
    opcionesSeleccionadas.forEach(opcion => {
        const div = document.createElement('div');
        div.className = 'explicacion-item';
        
        if (opcion === "Otro") {
            div.innerHTML = `
                <label class="explicacion-label">Especifique el nombre del "Otro" Área/Puesto:</label>
                <input type="text" class="otro-nombre-input" placeholder="Ej. Vigilancia, Proveedores..." required style="margin-bottom: 8px; width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
                <label class="explicacion-label">${textoLabel} (este otro puesto):</label>
                <textarea class="explicacion-texto" rows="2" required placeholder="Describe la información o servicio..."></textarea>
            `;
        } else {
            div.innerHTML = `
                <label class="explicacion-label">${textoLabel} ${opcion.toUpperCase()}:</label>
                <textarea class="explicacion-texto" data-puesto="${opcion}" rows="2" required placeholder="Describe la información o servicio..."></textarea>
            `;
        }
        container.appendChild(div);
    });
}

// Recopilar el puesto + la explicación
function recopilarExplicaciones(containerId) {
    const container = document.getElementById(containerId);
    const items = container.querySelectorAll('.explicacion-item');
    let resultados = [];
    
    items.forEach(item => {
        const inputOtro = item.querySelector('.otro-nombre-input');
        const textarea = item.querySelector('.explicacion-texto');
        
        if (inputOtro) {
            resultados.push(`• ${inputOtro.value.trim()} (Otro): ${textarea.value.trim()}`);
        } else {
            resultados.push(`• ${textarea.getAttribute('data-puesto')}: ${textarea.value.trim()}`);
        }
    });
    return resultados.join('\n');
}

// Sistema de Login
function login() {
    const u = document.getElementById('loginUser').value;
    const p = document.getElementById('loginPass').value;
    
    if (u === 'juventud' && p === 'juventud1234') {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('formView').classList.remove('hidden');
        document.getElementById('loginError').style.display = 'none';
        window.scrollTo(0, 0);
    } else if (u === 'admin' && p === 'admin1234') {
        document.getElementById('loginView').classList.add('hidden');
        document.getElementById('adminView').classList.remove('hidden');
        document.getElementById('loginError').style.display = 'none';
        cargarDatosAdmin(); 
        window.scrollTo(0, 0);
    } else {
        document.getElementById('loginError').style.display = 'block';
    }
}

function logout() {
    document.getElementById('loginUser').value = '';
    document.getElementById('loginPass').value = '';
    document.getElementById('formView').classList.add('hidden');
    document.getElementById('adminView').classList.add('hidden');
    document.getElementById('loginView').classList.remove('hidden');
    baseDeDatos = []; 
    document.getElementById('tableBody').innerHTML = '';
    window.scrollTo(0, 0);
}

// Enviar datos
async function enviarDatos(e) {
    e.preventDefault();

    // Validar que se haya seleccionado al menos una casilla
    if (document.querySelectorAll('#listaProporciona input:checked').length === 0) {
        alert("Por favor, selecciona al menos un área a la que proporciona información.");
        return;
    }
    if (document.querySelectorAll('#listaRecibe input:checked').length === 0) {
        alert("Por favor, selecciona al menos un área de la que recibe información.");
        return;
    }
    
    const botonGuardar = e.target.querySelector('button[type="submit"]');
    botonGuardar.disabled = true;
    botonGuardar.textContent = "Guardando...";

    const payload = {
        empleado: document.getElementById('nombreUsuario').value,
        denominacionPuesto: document.getElementById('denominacionPuesto').value,
        areaPuesto: document.getElementById('areaPuesto').value,
        reportaA: document.getElementById('reportaA').value,
        objetivo: document.getElementById('objetivo').value,
        resultados: document.getElementById('resultados').value,
        funciones: document.getElementById('funciones').value,
        proporcionaInfo: recopilarExplicaciones('containerProporciona'),
        recibeInfo: recopilarExplicaciones('containerRecibe'),
        tareasNoPropias: document.getElementById('tareasNoPropias').value
    };

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const otro = confirm("Ficha guardada exitosamente.\n\n¿Hay otro puesto que debes reportar?");
        if (otro) {
            const empleadoActual = document.getElementById('nombreUsuario').value;
            document.getElementById('fichaForm').reset();
            document.getElementById('nombreUsuario').value = empleadoActual;
            
            // Desmarcar todas las casillas y limpiar contenedores
            document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
            document.getElementById('containerProporciona').innerHTML = '';
            document.getElementById('containerRecibe').innerHTML = '';
            window.scrollTo(0, 0);
        } else {
            alert("Gracias por completar tus registros.");
            logout();
        }
    } catch (error) {
        alert("Hubo un error al guardar los datos. Error: " + error.message);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar Ficha";
    }
}

// Leer datos (Admin)
async function cargarDatosAdmin() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando datos...</td></tr>';
    try {
        const response = await fetch(WORKER_URL);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        baseDeDatos = await response.json();
        filtrarTabla();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Error: ${error.message}</td></tr>`;
    }
}

// Borrar registro
async function borrarRegistro(id) {
    if (!confirm("¿Estás seguro de que deseas eliminar este registro permanentemente?")) return;
    try {
        const response = await fetch(WORKER_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        baseDeDatos = baseDeDatos.filter(item => item.id !== id);
        filtrarTabla();
        alert("Registro eliminado.");
        cerrarModal();
    } catch (error) {
        alert("Error al borrar: " + error.message);
    }
}

// Filtrar tabla
function filtrarTabla() {
    const textFilter = document.getElementById('searchUser').value.toLowerCase();
    const areaFilter = document.getElementById('filterArea').value;
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '';

    if (baseDeDatos.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No hay registros disponibles.</td></tr>';
        return;
    }

    const filtrados = baseDeDatos.filter(item => {
        const matchText = item.empleado && item.empleado.toLowerCase().includes(textFilter);
        const matchArea = (areaFilter === 'Todas' || item.areaPuesto === areaFilter);
        return matchText && matchArea;
    });

    if (filtrados.length === 0) {
         tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">No se encontraron coincidencias.</td></tr>';
         return;
    }

    filtrados.forEach((item) => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${item.empleado || 'Sin nombre'}</td>
            <td>${item.denominacionPuesto || '-'}</td>
            <td>${item.areaPuesto || '-'}</td>
            <td style="display: flex; gap: 5px;">
                <button class="btn-yellow" onclick="verDetalle('${item.id}')">Ver Detalle</button>
                <button class="btn-logout" style="padding: 12px; margin-top:0;" onclick="borrarRegistro('${item.id}')">Borrar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Ver Detalle
function verDetalle(id) {
    const registro = baseDeDatos.find(r => r.id === id);
    if(!registro) return;

    const body = document.getElementById('modalContentBody');
    body.innerHTML = `
        <div class="detail-item"><strong>Empleado:</strong> ${registro.empleado}</div>
        <div class="detail-item"><strong>Puesto:</strong> ${registro.denominacionPuesto}</div>
        <div class="detail-item"><strong>Área:</strong> ${registro.areaPuesto}</div>
        <div class="detail-item"><strong>Reporta a:</strong> ${registro.reportaA}</div>
        <hr>
        <div class="detail-item"><strong>Objetivo:</strong><br><span style="white-space: pre-wrap;">${registro.objetivo}</span></div>
        <div class="detail-item"><strong>Resultados:</strong><br><span style="white-space: pre-wrap;">${registro.resultados}</span></div>
        <div class="detail-item"><strong>Funciones:</strong><br><span style="white-space: pre-wrap;">${registro.funciones}</span></div>
        <hr>
        <div class="detail-item"><strong>Proporciona Info a:</strong><br><span style="white-space: pre-wrap;">${registro.proporcionaInfo || "N/A"}</span></div>
        <div class="detail-item"><strong>Recibe Info de:</strong><br><span style="white-space: pre-wrap;">${registro.recibeInfo || "N/A"}</span></div>
        <div class="detail-item"><strong>Tareas NO propias:</strong><br><span style="white-space: pre-wrap;">${registro.tareasNoPropias}</span></div>
    `;
    document.getElementById('detailModal').classList.remove('hidden');
}

function cerrarModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// Descargar Excel
function descargarExcel() {
    if(baseDeDatos.length === 0) return alert("No hay datos para exportar.");
    
    const textFilter = document.getElementById('searchUser').value.toLowerCase();
    const areaFilter = document.getElementById('filterArea').value;
    
    const filtrados = baseDeDatos.filter(item => {
        const matchText = item.empleado && item.empleado.toLowerCase().includes(textFilter);
        const matchArea = (areaFilter === 'Todas' || item.areaPuesto === areaFilter);
        return matchText && matchArea;
    });

    const dataParaExcel = filtrados.map(item => ({
        "Nombre del Empleado": item.empleado,
        "Denominación del Puesto": item.denominacionPuesto,
        "Área": item.areaPuesto,
        "Reporta a": item.reportaA,
        "Objetivo del Puesto": item.objetivo,
        "Áreas de Eficacia / Resultados": item.resultados,
        "Funciones y Tareas": item.funciones,
        "Proporciona Info a": item.proporcionaInfo,
        "Recibe Info de": item.recibeInfo,
        "Tareas No Propias": item.tareasNoPropias,
        "Fecha de Registro": new Date(item.fechaRegistro).toLocaleString()
    }));

    const hoja = XLSX.utils.json_to_sheet(dataParaExcel);
    const libro = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(libro, hoja, "Puestos Registrados");
    XLSX.writeFile(libro, "Registros_Puestos_Juventud.xlsx");
}
