document.addEventListener('DOMContentLoaded', function() {
    let materiasData = []; // Almacenará todas las materias
    
    // Cargar datos del JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            // Extraer todas las materias de todos los semestres
            data.semestres.forEach(semestre => {
                semestre.materias.forEach(materia => {
                    materiasData.push(materia);
                });
            });
            
            renderMalla(data);
            setupEventListeners();
        })
        .catch(error => console.error('Error al cargar los datos:', error));

    // Función para renderizar la malla
    function renderMalla(data) {
        const mallaContainer = document.getElementById('malla-container');
        mallaContainer.innerHTML = ''; // Limpiar contenedor
        
        data.semestres.forEach(semestre => {
            const semestreDiv = document.createElement('div');
            semestreDiv.className = 'semestre';
            
            const semestreTitle = document.createElement('h2');
            semestreTitle.textContent = `Semestre ${semestre.numero}`;
            semestreDiv.appendChild(semestreTitle);
            
            const materiasContainer = document.createElement('div');
            materiasContainer.className = 'materias-container';
            
            semestre.materias.forEach(materia => {
                const materiaDiv = document.createElement('div');
                materiaDiv.className = `materia ${materia.institucion.toLowerCase()}`;
                materiaDiv.dataset.id = materia.id;
                materiaDiv.dataset.codigo = materia.codigo;
                materiaDiv.dataset.prerrequisitos = materia.prerrequisitos.join(',');
                
                // Mostrar ID
                const materiaId = document.createElement('span');
                materiaId.className = 'materia-id';
                materiaId.textContent = `#${materia.id}`;
                materiaDiv.appendChild(materiaId);
                
                const materiaNombre = document.createElement('h3');
                materiaNombre.textContent = materia.nombre;
                materiaDiv.appendChild(materiaNombre);
                
                const materiaCodigo = document.createElement('p');
                materiaCodigo.textContent = `Código: ${materia.codigo}`;
                materiaDiv.appendChild(materiaCodigo);
                
                const materiaCreditos = document.createElement('p');
                materiaCreditos.textContent = `Créditos: ${materia.creditos}`;
                materiaDiv.appendChild(materiaCreditos);
                
                // Mostrar icono de candado si tiene prerrequisitos
                if (materia.prerrequisitos.length > 0) {
                    materiaDiv.classList.add('locked');
                    const lockIcon = document.createElement('span');
                    lockIcon.className = 'lock-icon';
                    lockIcon.innerHTML = '🔒';
                    materiaDiv.appendChild(lockIcon);
                }
                
                materiasContainer.appendChild(materiaDiv);
            });
            
            semestreDiv.appendChild(materiasContainer);
            mallaContainer.appendChild(semestreDiv);
        });
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Mostrar información de la materia al hacer clic
        document.querySelectorAll('.materia').forEach(materia => {
            materia.addEventListener('click', function() {
                if (this.classList.contains('locked')) {
                    return; // No hacer nada si está bloqueada
                }
                
                const id = this.dataset.id;
                showMateriaInfo(id);
                highlightNextCourses(id);
            });
        });
        
        // Cerrar el panel de información
        document.getElementById('cerrar-info').addEventListener('click', () => {
            document.getElementById('materia-info').classList.add('hidden');
            clearHighlights();
        });
    }

    // Mostrar información de una materia específica
    function showMateriaInfo(id) {
        const materia = materiasData.find(m => m.id == id);
        if (!materia) return;
        
        document.getElementById('materia-nombre').textContent = materia.nombre;
        document.getElementById('materia-id').textContent = materia.id;
        document.getElementById('materia-codigo').textContent = materia.codigo;
        document.getElementById('materia-creditos').textContent = materia.creditos;
        document.getElementById('materia-institucion').textContent = materia.institucion;
        
        const prerrequisitosList = document.getElementById('prerrequisitos-list');
        prerrequisitosList.innerHTML = '';
        
        if (materia.prerrequisitos.length === 0) {
            const li = document.createElement('li');
            li.textContent = 'No tiene prerrequisitos';
            prerrequisitosList.appendChild(li);
        } else {
            materia.prerrequisitos.forEach(prerreqId => {
                const li = document.createElement('li');
                const prerreq = materiasData.find(m => m.id == prerreqId);
                li.textContent = `#${prerreqId} - ${prerreq?.codigo || '???'}: ${prerreq?.nombre || 'Desconocido'}`;
                prerrequisitosList.appendChild(li);
            });
        }
        
        document.getElementById('materia-info').classList.remove('hidden');
    }

    // Resaltar las materias que tienen esta como prerrequisito
    function highlightNextCourses(id) {
        clearHighlights();
        
        document.querySelectorAll('.materia').forEach(materiaDiv => {
            const prerrequisitos = materiaDiv.dataset.prerrequisitos.split(',');
            if (prerrequisitos.includes(id.toString())) {
                materiaDiv.classList.add('highlighted');
                
                // Verificar si todos los prerrequisitos están cumplidos
                const allPrerreqs = materiaDiv.dataset.prerrequisitos.split(',');
                const allPrerreqsUnlocked = allPrerreqs.every(prerreqId => {
                    const prerreqDiv = document.querySelector(`.materia[data-id="${prerreqId}"]`);
                    return prerreqDiv && !prerreqDiv.classList.contains('locked');
                });
                
                if (allPrerreqsUnlocked && materiaDiv.classList.contains('locked')) {
                    // Desbloquear la materia
                    materiaDiv.classList.remove('locked');
                    materiaDiv.querySelector('.lock-icon')?.remove();
                    materiaDiv.classList.add('unlocked');
                    
                    // Efecto de desbloqueo
                    const unlockEffect = document.createElement('div');
                    unlockEffect.className = 'unlock-effect';
                    materiaDiv.appendChild(unlockEffect);
                    
                    setTimeout(() => {
                        unlockEffect.remove();
                    }, 1000);
                }
            }
        });
    }

    // Limpiar todos los resaltados
    function clearHighlights() {
        document.querySelectorAll('.materia').forEach(materia => {
            materia.classList.remove('highlighted');
        });
    }
});
