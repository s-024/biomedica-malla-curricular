document.addEventListener('DOMContentLoaded', function() {
    let materiasData = [];
    
    // Cargar datos del JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) {
                throw new Error('Error al cargar data.json');
            }
            return response.json();
        })
        .then(data => {
            // Extraer todas las materias
            data.semestres.forEach(semestre => {
                semestre.materias.forEach(materia => {
                    // Asegurar que los prerrequisitos sean números
                    materia.prerrequisitos = materia.prerrequisitos.map(Number);
                    materiasData.push(materia);
                });
            });
            
            renderMalla(data);
            setupEventListeners();
            unlockInitialCourses();
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Error al cargar los datos. Verifica la consola para más detalles.');
        });

    // Función para renderizar la malla
    function renderMalla(data) {
        const mallaContainer = document.getElementById('malla-container');
        mallaContainer.innerHTML = '';
        
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
                
                // Clase CSS basada en la institución (tomando solo la primera parte si es Escuela/UR)
                const institucionClass = materia.institucion.toLowerCase().split('/')[0];
                materiaDiv.className = `materia ${institucionClass}`;
                
                // Atributos de datos
                materiaDiv.dataset.id = materia.id;
                materiaDiv.dataset.codigo = materia.codigo;
                materiaDiv.dataset.prerrequisitos = materia.prerrequisitos.join(',');
                
                // ID visible
                const materiaId = document.createElement('span');
                materiaId.className = 'materia-id';
                materiaId.textContent = `#${materia.id}`;
                materiaDiv.appendChild(materiaId);
                
                // Nombre
                const materiaNombre = document.createElement('h3');
                materiaNombre.textContent = materia.nombre;
                materiaDiv.appendChild(materiaNombre);
                
                // Código
                const materiaCodigo = document.createElement('p');
                materiaCodigo.textContent = `Código: ${materia.codigo}`;
                materiaDiv.appendChild(materiaCodigo);
                
                // Créditos
                const materiaCreditos = document.createElement('p');
                materiaCreditos.textContent = `Créditos: ${materia.creditos}`;
                materiaDiv.appendChild(materiaCreditos);
                
                // Icono de candado si tiene prerrequisitos
                if (materia.prerrequisitos.length > 0) {
                    const lockIcon = document.createElement('span');
                    lockIcon.className = 'lock-icon';
                    lockIcon.innerHTML = '🔒';
                    materiaDiv.appendChild(lockIcon);
                    materiaDiv.classList.add('locked');
                }
                
                materiasContainer.appendChild(materiaDiv);
            });
            
            semestreDiv.appendChild(materiasContainer);
            mallaContainer.appendChild(semestreDiv);
        });
    }

    // Desbloquear materias sin prerrequisitos inicialmente
    function unlockInitialCourses() {
        document.querySelectorAll('.materia').forEach(materiaDiv => {
            const prerrequisitos = materiaDiv.dataset.prerrequisitos;
            if (!prerrequisitos || prerrequisitos === '') {
                materiaDiv.classList.remove('locked');
                materiaDiv.querySelector('.lock-icon')?.remove();
            }
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
                
                // Añadir clase si el prerrequisito está bloqueado
                const prerreqDiv = document.querySelector(`.materia[data-id="${prerreqId}"]`);
                if (prerreqDiv && prerreqDiv.classList.contains('locked')) {
                    li.classList.add('prerrequisito-bloqueado');
                }
                
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
