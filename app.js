// URL de tu Worker de Cloudflare
const WORKER_URL = "https://org-juventud-puestos-api.adrian-camelot32.workers.dev/api/registros"; 
    
let baseDeDatos = [];

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

// Cerrar sesión
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

// Enviar datos al Worker (POST)
async function enviarDatos(e) {
    e.preventDefault();
    
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
        proporcionaInfo: document.getElementById('proporcionaInfo').value,
        recibeInfo: document.getElementById('recibeInfo').value,
        tareasNoPropias: document.getElementById('tareasNoPropias').value
    };

    try {
        const response = await fetch(WORKER_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        const otro = confirm("Ficha guardada exitosamente en la base de datos.\n\n¿Hay otro puesto que debes reportar?");
        if (otro) {
            const empleadoActual = document.getElementById('nombreUsuario').value;
            document.getElementById('fichaForm').reset();
            document.getElementById('nombreUsuario').value = empleadoActual;
            window.scrollTo(0, 0);
        } else {
            alert("Gracias por completar tus registros.");
            logout();
        }
    } catch (error) {
        alert("Hubo un error al guardar los datos. Error: " + error.message);
        console.error("Error completo:", error);
    } finally {
        botonGuardar.disabled = false;
        botonGuardar.textContent = "Guardar Ficha";
    }
}

// Leer datos del Worker (GET)
async function cargarDatosAdmin() {
    const tbody = document.getElementById('tableBody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;">Cargando datos...</td></tr>';
    
    try {
        const response = await fetch(WORKER_URL);
        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);
        
        baseDeDatos = await response.json();
        filtrarTabla();
    } catch (error) {
        tbody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:red;">Error al cargar los datos: ${error.message}</td></tr>`;
        console.error("Error completo:", error);
    }
}

// Borrar registro (DELETE)
async function borrarRegistro(id) {
    const confirmacion = confirm("¿Estás seguro de que deseas eliminar este registro permanentemente?");
    if (!confirmacion) return;

    try {
        const response = await fetch(WORKER_URL, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: id })
        });

        if (!response.ok) throw new Error(`Error HTTP: ${response.status}`);

        baseDeDatos = baseDeDatos.filter(item => item.id !== id);
        filtrarTabla();
        alert("Registro eliminado correctamente.");
        cerrarModal();
    } catch (error) {
        alert("Error al intentar borrar el registro: " + error.message);
        console.error("Error completo:", error);
    }
}

// Filtrar la tabla
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

// Mostrar modal con detalles
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
        <div class="detail-item"><strong>Objetivo:</strong> ${registro.objetivo}</div>
        <div class="detail-item"><strong>Resultados:</strong> ${registro.resultados}</div>
        <div class="detail-item"><strong>Funciones:</strong> ${registro.funciones}</div>
        <hr>
        <div class="detail-item"><strong>Proporciona Info a:</strong> ${registro.proporcionaInfo}</div>
        <div class="detail-item"><strong>Recibe Info de:</strong> ${registro.recibeInfo}</div>
        <div class="detail-item"><strong>Tareas NO propias:</strong> ${registro.tareasNoPropias}</div>
        <div class="detail-item" style="font-size: 0.8em; color: gray; margin-top: 15px;">
            <strong>Fecha Registro:</strong> ${new Date(registro.fechaRegistro).toLocaleString()}
        </div>
    `;
    document.getElementById('detailModal').classList.remove('hidden');
}

// Cerrar Modal
function cerrarModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// Exportar a Excel (SheetJS)
function descargarExcel() {
    if(baseDeDatos.length === 0) {
        alert("No hay datos para exportar.");
        return;
    }
    
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
