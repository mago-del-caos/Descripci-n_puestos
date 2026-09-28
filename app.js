// URL de tu Worker de Cloudflare
const WORKER_URL = "https://org-juventud-puestos-api.adrian-camelot32.workers.dev/api/registros"; 
let baseDeDatos = [];

// Nueva lista oficial de departamentos solicitada
const departamentos = [
   "Dirección General", "Asistente Dirección General", "Subdirección Académica", 
    "Dirección Técnica Preescolar", "Dirección Técnica Primaria", "Dirección Técnicas Secundaria", "Dirección técnica Preparatoria", 
    "Coordinaciones", "Coordinación Inglés", "Coordinación Psicología", "Coordinación Deportes", "Extraescolares", 
    "Acad. Pastoral", "Coordinación Francés", "Servicios Escolares", "Innovación Educativa", 
    "Área Jurídica", "Comunicación y Marketing", "Admisiones", "Marketing MFRs", 
    "Redes Sociales", "Subdirección Administrativa", "Servicios Generales", 
    "Mantenimiento", "Limpieza", "Jardinería", "Compras", "Recursos Humanos", 
    "Control Interno", "Relaciones Públicas", "Sistemas", "Cajas", "Prefectura", "Otro"
];

// Función principal para dibujar las preguntas
function inicializarPreguntas() {
    const containerProp = document.getElementById('preguntasProporciona');
    const containerRec = document.getElementById('preguntasRecibe');
    
    // Seguridad: Si ya se dibujaron o no existen los contenedores, detener.
    if (!containerProp || !containerRec || containerProp.innerHTML.trim() !== '') return;
    
    departamentos.forEach((depto, index) => {
        // Generar pregunta para PROPORCIONA
        containerProp.innerHTML += crearHTMLPregunta('prop', index, depto, 'Lo que proporciona a');
        
        // Generar pregunta para RECIBE
        containerRec.innerHTML += crearHTMLPregunta('rec', index, depto, 'Lo que recibe de');
    });
}

// ARRANQUE SEGURO A PRUEBA DE CARGA DINÁMICA
if (document.readyState === "loading") {
    // Si la página aún está cargando, esperar a que termine
    document.addEventListener("DOMContentLoaded", inicializarPreguntas);
} else {
    // Si la página ya cargó (por culpa del version.js), ejecutar inmediatamente
    inicializarPreguntas();
}

// Plantilla HTML para generar cada bloque de pregunta Sí/No
function crearHTMLPregunta(prefijo, index, depto, labelExplicacion) {
    let inputOtroHTML = '';
    
    if (depto === "Otro") {
        inputOtroHTML = `
            <label class="explicacion-label" style="margin-top:5px;">Especifique el nombre del "Otro" Área/Puesto:</label>
            <input type="text" class="otro-nombre-input" placeholder="Ej. Vigilancia, Proveedores..." style="margin-bottom: 12px; width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 4px;">
        `;
    }

    return `
    <div class="pregunta-item">
        <div class="pregunta-header">
            <span class="pregunta-texto">${depto === 'Otro' ? '¿Aplica para <strong>Otro</strong> puesto?' : `¿Aplica para <strong>${depto}</strong>?`}</span>
            <div class="radio-group">
                <label class="radio-label">
                    <input type="radio" name="${prefijo}_${index}" value="no" checked onchange="toggleExplicacion('caja_${prefijo}_${index}', false)"> No
                </label>
                <label class="radio-label">
                    <input type="radio" name="${prefijo}_${index}" value="si" onchange="toggleExplicacion('caja_${prefijo}_${index}', true)"> Sí
                </label>
            </div>
        </div>
        <div id="caja_${prefijo}_${index}" class="explicacion-caja hidden">
            ${inputOtroHTML}
            <label class="explicacion-label">${labelExplicacion} ${depto !== 'Otro' ? depto : 'este puesto'}:</label>
            <textarea class="explicacion-texto" rows="2" placeholder="Describe la información o servicio..."></textarea>
        </div>
    </div>`;
}

// Mostrar u ocultar la caja de texto dependiendo de si toca "Sí" o "No"
function toggleExplicacion(cajaId, mostrar) {
    const caja = document.getElementById(cajaId);
    const textarea = caja.querySelector('.explicacion-texto');
    const inputOtro = caja.querySelector('.otro-nombre-input');

    if (mostrar) {
        caja.classList.remove('hidden');
        textarea.required = true;
        if (inputOtro) inputOtro.required = true;
    } else {
        caja.classList.add('hidden');
        textarea.required = false;
        textarea.value = '';
        if (inputOtro) {
            inputOtro.required = false;
            inputOtro.value = '';
        }
    }
}

// Leer todas las respuestas que dijeron "Sí" y juntarlas en un texto
function recopilarRespuestas(prefijo, listaDeptos) {
    let resultados = [];
    
    listaDeptos.forEach((depto, index) => {
        const radioSi = document.querySelector(`input[name="${prefijo}_${index}"][value="si"]`);
        if (radioSi && radioSi.checked) {
            const caja = document.getElementById(`caja_${prefijo}_${index}`);
            const textarea = caja.querySelector('.explicacion-texto');
            const texto = textarea.value.trim();

            if (depto === "Otro") {
                const inputOtro = caja.querySelector('.otro-nombre-input');
                resultados.push(`• ${inputOtro.value.trim()} (Otro): ${texto}`);
            } else {
                resultados.push(`• ${depto}: ${texto}`);
            }
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

    const proporcionaTxt = recopilarRespuestas('prop', departamentos);
    const recibeTxt = recopilarRespuestas('rec', departamentos);

    // Validar que al menos haya un "Sí"
    if (proporcionaTxt === "") {
        alert("Por favor, selecciona 'Sí' en al menos un área a la que PROPORCIONA información.");
        return;
    }
    if (recibeTxt === "") {
        alert("Por favor, selecciona 'Sí' en al menos un área de la que RECIBE información.");
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
        proporcionaInfo: proporcionaTxt,
        recibeInfo: recibeTxt,
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
            
            // Ocultar todas las cajas al resetear el formulario y volver los radios a "No"
            document.querySelectorAll('.explicacion-caja').forEach(caja => {
                caja.classList.add('hidden');
                const ta = caja.querySelector('textarea');
                if (ta) ta.required = false;
                const inp = caja.querySelector('input[type="text"]');
                if (inp) inp.required = false;
            });

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
