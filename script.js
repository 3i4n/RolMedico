(() => {
    // --- DATOS Y ESTADO ---
    let casos = {};
    let prioridadSeleccionada = '^6';

    // --- ELEMENTOS DEL DOM ---
    const getEl = (id) => document.getElementById(id);
    const seleccionHospital = getEl('seleccionHospital');
    const nombrePacienteInput = getEl('nombrePaciente');
    const seleccionCaso = getEl('seleccionCaso');
    const comandosList = getEl('comandosList');
    const agregarComandoBtn = getEl('agregarComandoBtn');
    const guardarComandosBtn = getEl('guardarComandosBtn');
    const selectorEmoji = getEl('selectorEmoji');
    const generarBtn = getEl('generarBtn');
    const informeTexto = getEl('informe');
    const copiarInformeBtn = getEl('copiarInformeBtn');
    const guardarInformeEditadoBtn = getEl('guardarInformeEditadoBtn');
    const btnAgregarCaso = getEl('btnAgregarCaso');
    const btnEliminarCaso = getEl('btnEliminarCaso');
    const verInformesBtn = getEl('verInformesBtn');
    const vistaPrincipal = getEl('vistaPrincipal');
    const vistaInformes = getEl('vistaInformes');
    const buscadorInformes = getEl('buscadorInformes');
    const listaInformes = getEl('listaInformes');
    const volverBtn = getEl('volverBtn');
    const detalleInforme = getEl('detalleInforme');
    const detallePaciente = getEl('detallePaciente');
    const detalleContenido = getEl('detalleContenido');

    // --- FUNCIONES DE DATOS ---
    const cargarCasosLocal = () => {
        const data = localStorage.getItem('casosMedicos');
        const defaultData = {
            'Hematomas': [{ tipo: '/me', texto: 'Aplica compresas frías en la zona...' }, { tipo: '/do', texto: 'La inflamación comenzaría a reducirse.' }],
            'Inanición': [{ tipo: '/me', texto: 'Inicia hidratación intravenosa...' }, { tipo: '/do', texto: 'Los signos vitales se mantendrían estables.' }],
        };
        casos = data ? JSON.parse(data) : defaultData;
    };
    const guardarCasosLocal = () => localStorage.setItem('casosMedicos', JSON.stringify(casos));

    // --- FUNCIONES DE RENDERIZADO ---
    const renderCasos = () => {
        seleccionCaso.innerHTML = '';
        for (const caso in casos) {
            const opt = document.createElement('option');
            opt.value = caso;
            opt.textContent = caso;
            seleccionCaso.appendChild(opt);
        }
        if (seleccionCaso.options.length > 0) seleccionCaso.selectedIndex = 0;
    };

    const renderComandos = () => {
        comandosList.innerHTML = '';
        const caso = seleccionCaso.value;
        if (!caso || !casos[caso]) return;
        casos[caso].forEach(({ tipo, texto }, i) => {
            const div = document.createElement('div');
            div.className = 'comando-row';
            
            const tipoInput = document.createElement('select');
            ['/me', '/do'].forEach(val => {
                const opt = document.createElement('option');
                opt.value = val; opt.textContent = val;
                tipoInput.appendChild(opt);
            });
            tipoInput.value = tipo;
            tipoInput.onchange = () => { casos[caso][i].tipo = tipoInput.value; };

            const input = document.createElement('input');
            input.value = texto;
            input.oninput = () => { casos[caso][i].texto = input.value; };

            const copiar = document.createElement('button');
            copiar.textContent = 'Copiar';
            copiar.className = 'btn-small';
            copiar.onclick = () => {
                navigator.clipboard.writeText(`${tipoInput.value} ${prioridadSeleccionada} ${input.value}`);
                alert('Comando copiado al portapapeles');
            };

            const eliminar = document.createElement('button');
            eliminar.textContent = 'Eliminar';
            eliminar.className = 'btn-small';
            eliminar.onclick = () => {
                casos[caso].splice(i, 1);
                guardarCasosLocal();
                renderComandos();
            };

            div.append(tipoInput, input, copiar, eliminar);
            comandosList.appendChild(div);
        });
    };

    const mostrarListaInformes = (informes) => {
        listaInformes.innerHTML = '';
        if (informes.length === 0) {
            listaInformes.textContent = 'No hay informes guardados.';
            detalleInforme.classList.add('hidden');
            return;
        }
        informes.forEach((inf, idx) => {
            const div = document.createElement('div');
            div.className = 'informe-item';
            div.innerHTML = `<span>${inf.fechaStr} ${inf.horaStr} - ${inf.paciente} - Caso: ${inf.caso}</span>
                             <button style="float:right;background:#e07ea7;">🗑️</button>`;
            
            div.querySelector('span').onclick = () => {
                detallePaciente.textContent = inf.paciente;
                detalleContenido.textContent = inf.informe;
                detalleInforme.classList.remove('hidden');
            };

            div.querySelector('button').onclick = e => {
                e.stopPropagation();
                if (confirm(`¿Eliminar el informe de ${inf.paciente} - ${inf.caso}?`)) {
                    let informesActuales = JSON.parse(localStorage.getItem('informesMedicos') || '[]');
                    informesActuales.splice(idx, 1);
                    localStorage.setItem('informesMedicos', JSON.stringify(informesActuales));
                    cargarInformes();
                }
            };
            listaInformes.appendChild(div);
        });
    };

    const cargarInformes = () => {
        let informes = JSON.parse(localStorage.getItem('informesMedicos') || '[]');
        informes.sort((a, b) => b.fecha - a.fecha);
        mostrarListaInformes(informes);
    };

    // --- EVENT LISTENERS ---
    seleccionCaso.addEventListener('change', renderComandos);
    btnAgregarCaso.onclick = () => {
        let nuevo = prompt('Nombre del nuevo tipo de caso:');
        if (!nuevo || casos[nuevo]) return alert('Nombre inválido o ya existente.');
        casos[nuevo] = [];
        guardarCasosLocal();
        renderCasos();
        seleccionCaso.value = nuevo;
        renderComandos();
    };
    btnEliminarCaso.onclick = () => {
        const caso = seleccionCaso.value;
        if (!caso || !confirm(`¿Eliminar el caso "${caso}" y sus comandos?`)) return;
        delete casos[caso];
        guardarCasosLocal();
        renderCasos();
        renderComandos();
    };
    agregarComandoBtn.onclick = () => {
        const caso = seleccionCaso.value;
        if (!caso) return;
        casos[caso].push({ tipo: '/me', texto: '' });
        renderComandos();
    };
    guardarComandosBtn.onclick = () => {
        guardarCasosLocal();
        alert('Comandos guardados.');
    };
    selectorEmoji.onclick = e => {
        if (e.target.tagName === 'BUTTON') {
            prioridadSeleccionada = e.target.dataset.value;
            [...selectorEmoji.children].forEach(b => b.classList.toggle('selected', b.dataset.value === prioridadSeleccionada));
        }
    };
    generarBtn.onclick = () => {
        const paciente = nombrePacienteInput.value.trim();
        const hospital = seleccionHospital.value;
        const caso = seleccionCaso.value;
        if (!paciente || !caso || !casos[caso]?.length) return alert('Completa nombre y caso con comandos válidos.');
        
        const fecha = new Date();
        const fechaStr = fecha.toLocaleDateString('es-AR');
        const horaStr = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        const encabezado = {
            pillbox: `Llega al Hospital de Pillbox Hill 🏥 el día ${fechaStr} a las ${horaStr}hs 🕘.`,
            grand: `Llega al Hospital de Grand Senora 🏥 el día ${fechaStr} a las ${horaStr}hs 🕘.`,
            paleto: `Llega al Hospital de Paleto 🏥 el día ${fechaStr} a las ${horaStr}hs 🕘.`,
            aviso: `Llega un aviso 📢 el día ${fechaStr} a las ${horaStr}hs 🕘.`
        }[hospital];
        
        const textoComandos = casos[caso].map(c => c.texto).join('\n');
        informeTexto.value = `${encabezado}\n\n${textoComandos}`;
    };
    copiarInformeBtn.onclick = () => {
        if (!informeTexto.value.trim()) return alert('No hay informe para copiar.');
        navigator.clipboard.writeText(informeTexto.value);
        alert('Informe copiado.');
    };
    guardarInformeEditadoBtn.onclick = () => {
        const paciente = nombrePacienteInput.value.trim();
        const caso = seleccionCaso.value;
        if (!paciente || !caso) return alert('Faltan datos.');
        const informe = informeTexto.value.trim();
        if (!informe) return alert('Informe vacío.');

        let informes = JSON.parse(localStorage.getItem('informesMedicos') || '[]');
        const fecha = new Date();
        const fechaStr = fecha.toLocaleDateString('es-AR');
        const horaStr = fecha.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
        const index = informes.findIndex(i => i.paciente.toLowerCase() === paciente.toLowerCase() && i.caso === caso);
        const nuevo = { paciente, caso, informe, fecha: Date.now(), fechaStr, horaStr };
        
        if (index >= 0) informes[index] = nuevo;
        else informes.push(nuevo);
        localStorage.setItem('informesMedicos', JSON.stringify(informes));
        alert('Informe guardado.');
    };
    verInformesBtn.onclick = () => {
        vistaPrincipal.classList.add('hidden');
        vistaInformes.classList.remove('hidden');
        cargarInformes();
    };
    volverBtn.onclick = () => {
        vistaInformes.classList.add('hidden');
        vistaPrincipal.classList.remove('hidden');
        detalleInforme.classList.add('hidden');
        buscadorInformes.value = '';
    };
    buscadorInformes.oninput = () => {
        const val = buscadorInformes.value.trim().toLowerCase();
        let informes = JSON.parse(localStorage.getItem('informesMedicos') || '[]');
        const filtrados = informes.filter(inf => inf.paciente.toLowerCase().includes(val));
        filtrados.sort((a, b) => b.fecha - a.fecha);
        mostrarListaInformes(filtrados);
        detalleInforme.classList.add('hidden');
    };

    // --- INICIALIZACIÓN ---
    cargarCasosLocal();
    renderCasos();
    renderComandos();
})();