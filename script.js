document.addEventListener('DOMContentLoaded', function() {
    let materiasData = [];
    let completedCourses = new Set();
    
    // Cargar datos del JSON
    fetch('data.json')
        .then(response => {
            if (!response.ok) throw new Error('Error al cargar data.json');
            return response.json();
        })
        .then(data => {
            // Procesar datos
            data.semestres.forEach(semestre => {
                semestre.materias.forEach(materia => {
                    // Convertir prerrequisitos a números
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

    // Renderizar la malla
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
                materiaDiv.className = 'materia';
                materiaDiv.dataset.id = materia.id;
                materiaDiv.dataset.codigo = materia.codigo;
                materiaDiv.dataset.prerrequisitos = materia.prerrequisitos.join(',');
                
                // ID de materia
                const materiaId = document.createElement('span');
                materiaId.className = 'materia-id';
                materiaId.textContent = `#${materia.id}`;
                materiaDiv.appendChild(materiaId);
                
                // Nombre
                const materiaNombre = document.createElement('h3');
                materiaNombre.textContent = materia.nombre;
                materiaDiv.appendChild(materiaNombre);
                
                // Código y créditos
                const materiaCodigo = document.createElement('p');
                materiaCodigo.textContent = `Código: ${materia.codigo}`;
                materiaDiv.appendChild(materiaCodigo);
                
                const materiaCreditos = document.createElement('p');
                materiaCreditos.textContent = `Créditos: ${materia.creditos}`;
                materiaDiv.appendChild(materiaCreditos);
                
                // Icono de candado si tiene prerrequisitos
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
        // Click en materia
        document.querySelectorAll('.materia').forEach(materia => {
            materia.addEventListener('click', function() {
                const materiaId = parseInt(this.dataset.id);
                const isCompleted = completedCourses.has(materiaId);
                
                // Toggle estado de completado
                if (isCompleted) {
                    completedCourses.delete(materiaId);
                    this.classList.remove('completed');
                } else {
                    completedCourses.add(materiaId);
                    this.classList.add('completed');
                }
                
                // Actualizar estado de desbloqueo de todas las materias
                updateAllCoursesLockStatus();
            });
        });
        
        // Botón de reinicio
        document.getElementById('reset-button')?.addEventListener('click', () => {
            completedCourses.clear();
            document.querySelectorAll('.materia').forEach(materia => {
                materia.classList.remove('completed');
                const hasPrerequisites = materia.dataset.prerrequisitos && materia.dataset.prerrequisitos !== '';
                if (hasPrerequisites) {
                    materia.classList.add('locked');
                    if (!materia.querySelector('.lock-icon')) {
                        const lockIcon = document.createElement('span');
                        lockIcon.className = 'lock-icon';
                        lockIcon.innerHTML = '🔒';
                        materia.appendChild(lockIcon);
                    }
                }
            });
            unlockInitialCourses();
        });
    }

    // Actualizar estado de bloqueo de todas las materias
    function updateAllCoursesLockStatus() {
        document.querySelectorAll('.materia').forEach(materiaDiv => {
            const prereqIds = materiaDiv.dataset.prerrequisitos.split(',').filter(id => id !== '');
            
            // Si no tiene prerrequisitos, no hacer nada
            if (prereqIds.length === 0) return;
            
            // Verificar si todos los prerrequisitos están completados
            const allPrereqsCompleted = prereqIds.every(prereqId => {
                return completedCourses.has(parseInt(prereqId));
            });
            
            // Actualizar estado de bloqueo
            if (allPrereqsCompleted) {
                unlockMateria(materiaDiv);
            } else {
                lockMateria(materiaDiv);
            }
        });
    }

    // Desbloquear una materia específica
    function unlockMateria(materiaDiv) {
        materiaDiv.classList.remove('locked');
        const lockIcon = materiaDiv.querySelector('.lock-icon');
        if (lockIcon) {
            lockIcon.remove();
            
            // Efecto de desbloqueo
            const unlockEffect = document.createElement('div');
            unlockEffect.className = 'unlock-effect';
            materiaDiv.appendChild(unlockEffect);
            
            setTimeout(() => {
                unlockEffect.remove();
            }, 800);
        }
    }

    // Bloquear una materia específica
    function lockMateria(materiaDiv) {
        materiaDiv.classList.add('locked');
        if (!materiaDiv.querySelector('.lock-icon')) {
            const lockIcon = document.createElement('span');
            lockIcon.className = 'lock-icon';
            lockIcon.innerHTML = '🔒';
            materiaDiv.appendChild(lockIcon);
        }
    }
});
