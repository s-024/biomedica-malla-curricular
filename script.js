document.addEventListener('DOMContentLoaded', function() {
    // Cargar datos del JSON
    fetch('data.json')
        .then(response => response.json())
        .then(data => {
            renderMalla(data);
            setupEventListeners();
        })
        .catch(error => console.error('Error al cargar los datos:', error));

    // Función para renderizar la malla
    function renderMalla(data) {
        const mallaContainer = document.getElementById('malla-container');
        
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
                materiaDiv.dataset.codigo = materia.codigo;
                
                const materiaNombre = document.createElement('h3');
                materiaNombre.textContent = materia.nombre;
                materiaDiv.appendChild(materiaNombre);
                
                const materiaCodigo = document.createElement('p');
                materiaCodigo.textContent = `Código: ${materia.codigo}`;
                materiaDiv.appendChild(materiaCodigo);
                
                const materiaCreditos = document.createElement('p');
                materiaCreditos.textContent = `Créditos: ${materia.creditos}`;
                materiaDiv.appendChild(materiaCreditos);
                
                materiasContainer.appendChild(materiaDiv);
            });
            
            semestreDiv.appendChild(materiasContainer);
            mallaContainer.appendChild(semestreDiv);
        });
    }

    // Configurar event listeners
    function setupEventListeners() {
        // Mostrar/ocultar prerrequisitos
        document.getElementById('toggle-prerrequisitos').addEventListener('click', togglePrerrequisitos);
        
        // Mostrar información de la materia al hacer clic
        document.querySelectorAll('.materia').forEach(materia => {
            materia.addEventListener('click', showMateriaInfo);
        });
        
        // Cerrar el panel de información
        document.getElementById('cerrar-info').addEventListener('click', () => {
            document.getElementById('materia-info').classList.add('hidden');
        });
    }

    function togglePrerrequisitos() {
        // Implementar lógica para mostrar/ocultar líneas de prerrequisitos
        console.log('Mostrar/ocultar prerrequisitos');
    }

    function showMateriaInfo(event) {
        const materiaDiv = event.currentTarget;
        const codigo = materiaDiv.dataset.codigo;
        
        // En una implementación real, buscaríamos los datos de esta materia
        // Por ahora usamos datos simulados
        document.getElementById('materia-nombre').textContent = materiaDiv.querySelector('h3').textContent;
        document.getElementById('materia-codigo').textContent = codigo;
        document.getElementById('materia-creditos').textContent = materiaDiv.querySelector('p:nth-of-type(2)').textContent.replace('Créditos: ', '');
        document.getElementById('materia-institucion').textContent = materiaDiv.classList.contains('escuela') ? 'Escuela' : 'UR';
        
        // Limpiar lista de prerrequisitos
        const prerrequisitosList = document.getElementById('prerrequisitos-list');
        prerrequisitosList.innerHTML = '';
        
        // Aquí deberías agregar los prerrequisitos reales de la materia
        // Ejemplo:
        const li = document.createElement('li');
        li.textContent = 'No hay prerrequisitos';
        prerrequisitosList.appendChild(li);
        
        // Mostrar el panel de información
        document.getElementById('materia-info').classList.remove('hidden');
    }
});