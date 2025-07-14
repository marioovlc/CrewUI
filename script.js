// ===== SISTEMA DE CARRERAS GTA RP - JAVASCRIPT AVANZADO =====
// Autor: marioovlc
// Fecha: 2025-07-14
// Versión: 3.0 Pro

class RaceManagerPro {
    constructor() {
        this.pilotos = JSON.parse(localStorage.getItem('pilotos')) || [];
        this.historial = JSON.parse(localStorage.getItem('historial')) || [];
        this.currentSection = 'dashboard';
        this.isLoading = true;
        this.charts = {};
        this.filters = {
            search: '',
            category: 'all',
            status: 'all'
        };
        
        this.init();
    }

    async init() {
        // Simular carga inicial
        await this.loadSystem();
        
        // Configurar eventos
        this.setupEventListeners();
        
        // Inicializar componentes
        this.initializeComponents();
        
        // Actualizar interfaz
        this.updateInterface();
        
        // Ocultar loading screen
        this.hideLoadingScreen();
        
        // Inicializar tiempo en vivo
        this.startLiveTime();
        
        console.log('🏁 RaceManager Pro inicializado correctamente');
    }

    async loadSystem() {
        return new Promise(resolve => {
            let progress = 0;
            const progressBar = document.querySelector('.loading-progress');
            
            const interval = setInterval(() => {
                progress += Math.random() * 15;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    resolve();
                }
                
                if (progressBar) {
                    progressBar.style.width = `${progress}%`;
                }
            }, 200);
        });
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loadingScreen');
        if (loadingScreen) {
            loadingScreen.classList.add('hidden');
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }
    }

    setupEventListeners() {
        // Formulario de registro
        const registroForm = document.getElementById('registroForm');
        if (registroForm) {
            registroForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.registrarPiloto();
            });
        }

        // Búsqueda
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.filters.search = e.target.value;
                this.updatePilotosTable();
            });
        }

        // Filtros
        const filterTabs = document.querySelectorAll('.filter-tab');
        filterTabs.forEach(tab => {
            tab.addEventListener('click', (e) => {
                const filter = e.target.dataset.filter;
                this.setActiveFilter(tab, filter);
            });
        });

        // Cerrar modal con Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cerrarModal();
            }
        });

        // Cerrar modal clickeando fuera
        const modalOverlay = document.getElementById('registroModal');
        if (modalOverlay) {
            modalOverlay.addEventListener('click', (e) => {
                if (e.target === modalOverlay) {
                    this.cerrarModal();
                }
            });
        }
    }

    initializeComponents() {
        // Inicializar gráficos si Chart.js está disponible
        if (typeof Chart !== 'undefined') {
            this.initializeCharts();
        }
        
        // Configurar tooltips
        this.initializeTooltips();
        
        // Configurar shortcuts de teclado
        this.setupKeyboardShortcuts();
    }

    initializeCharts() {
        // Configuración base para gráficos
        const chartConfig = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    display: false,
                    beginAtZero: true
                },
                x: {
                    display: false
                }
            }
        };

        // Crear gráficos mini para las stats cards
        this.createMiniChart('pilotosChart', chartConfig);
        this.createMiniChart('recaudadoChart', chartConfig);
        this.createMiniChart('completadasChart', chartConfig);
        this.createMiniChart('primerosChart', chartConfig);
    }

    createMiniChart(canvasId, config) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const data = this.generateMockData(7);

        this.charts[canvasId] = new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['', '', '', '', '', '', ''],
                datasets: [{
                    data: data,
                    borderColor: '#6366f1',
                    backgroundColor: 'rgba(99, 102, 241, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 0,
                    pointHoverRadius: 4
                }]
            },
            options: config
        });
    }

    generateMockData(points) {
        const data = [];
        for (let i = 0; i < points; i++) {
            data.push(Math.floor(Math.random() * 100) + 20);
        }
        return data;
    }

    initializeTooltips() {
        // Implementar tooltips personalizados si es necesario
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl/Cmd + N = Nuevo piloto
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.abrirModal();
            }
            
            // Ctrl/Cmd + E = Exportar
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                this.exportarDatos();
            }
            
            // Ctrl/Cmd + 1-5 = Cambiar sección
            if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
                e.preventDefault();
                const sections = ['dashboard', 'pilotos', 'estadisticas', 'historial', 'configuracion'];
                const index = parseInt(e.key) - 1;
                if (sections[index]) {
                    this.showSection(sections[index]);
                }
            }
        });
    }

    startLiveTime() {
        const updateTime = () => {
            const now = new Date();
            const timeString = now.toLocaleString('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit'
            });
            
            const liveTimeElement = document.getElementById('liveTime');
            if (liveTimeElement) {
                liveTimeElement.textContent = timeString;
            }
        };

        updateTime();
        setInterval(updateTime, 1000);
    }

    registrarPiloto() {
        const formData = this.getFormData();
        
        if (!this.validateFormData(formData)) {
            return;
        }

        const piloto = {
            id: Date.now(),
            numero: this.pilotos.length + 1,
            ...formData,
            registro: new Date().toISOString(),
            estado: formData.posicion ? 'completado' : 'pendiente'
        };

        this.pilotos.push(piloto);
        this.guardarDatos();
        this.updateInterface();
        this.cerrarModal();
        this.resetForm();
        
        this.showNotification({
            type: 'success',
            title: 'Piloto Registrado',
            message: `${formData.nombre} ha sido registrado exitosamente`
        });

        // Animación de la nueva fila
        setTimeout(() => {
            this.animateNewRow();
        }, 100);
    }

    getFormData() {
        return {
            nombre: document.getElementById('pilotoNombre').value.trim(),
            categoria: document.getElementById('pilotoCategoria').value,
            entrada: parseFloat(document.getElementById('pilotoEntrada').value) || 0,
            tiempo: document.getElementById('pilotoTiempo').value.trim(),
            posicion: document.getElementById('pilotoPosicion').value,
            vehiculo: document.getElementById('pilotoVehiculo')?.value.trim() || '',
            notas: document.getElementById('pilotoNotas').value.trim()
        };
    }

    validateFormData(data) {
        const errors = [];

        if (!data.nombre) errors.push('El nombre es requerido');
        if (!data.categoria) errors.push('La categoría es requerida');
        if (!data.entrada || data.entrada <= 0) errors.push('La entrada debe ser mayor a 0');

        if (errors.length > 0) {
            this.showNotification({
                type: 'error',
                title: 'Error de Validación',
                message: errors.join('. ')
            });
            return false;
        }

        return true;
    }

    updateInterface() {
        this.updateDashboardStats();
        this.updatePilotosTable();
        this.updateHistorial();
        this.updateRecentActivity();
        this.updateCounters();
    }

    updateDashboardStats() {
        const stats = this.calculateStats();
        
        // Actualizar números principales
        this.updateElement('dashTotalPilotos', stats.totalPilotos);
        this.updateElement('dashTotalRecaudado', `$${stats.totalRecaudado.toLocaleString()}`);
        this.updateElement('dashCompletadas', stats.completadas);
        this.updateElement('dashPrimeros', stats.primeros);

        // Actualizar cambios (simulado)
        this.updateElement('pilotosChange', `+${Math.floor(Math.random() * 5)} hoy`);
        this.updateElement('recaudadoChange', `+$${Math.floor(Math.random() * 1000)} hoy`);
        this.updateElement('completadasChange', `+${Math.floor(Math.random() * 3)} hoy`);
        this.updateElement('primerosChange', `+${Math.floor(Math.random() * 2)} hoy`);
    }

    updatePilotosTable() {
        const tbody = document.getElementById('pilotosTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        
        let filteredPilotos = this.applyFilters(this.pilotos);
        
        if (filteredPilotos.length === 0) {
            tbody.innerHTML = this.getEmptyTableMessage();
            return;
        }

        filteredPilotos.forEach(piloto => {
            const row = this.createPilotoRow(piloto);
            tbody.appendChild(row);
        });

        // Actualizar contador
        this.updateElement('pilotosCount', filteredPilotos.length);
    }

    applyFilters(pilotos) {
        return pilotos.filter(piloto => {
            // Filtro de búsqueda
            if (this.filters.search) {
                const searchTerm = this.filters.search.toLowerCase();
                if (!piloto.nombre.toLowerCase().includes(searchTerm) &&
                    !piloto.categoria.toLowerCase().includes(searchTerm)) {
                    return false;
                }
            }

            // Filtro de estado
            if (this.filters.status !== 'all') {
                if (this.filters.status === 'completed' && !piloto.posicion) return false;
                if (this.filters.status === 'pending' && piloto.posicion) return false;
            }

            // Filtro de categoría
            if (this.filters.category !== 'all') {
                if (piloto.categoria !== this.filters.category) return false;
            }

            return true;
        });
    }

    createPilotoRow(piloto) {
        const row = document.createElement('tr');
        row.className = 'animate__animated animate__fadeIn';
        
        // Aplicar clase de estado
        if (piloto.posicion) {
            if (piloto.posicion === '1°') row.classList.add('position-1');
            else if (piloto.posicion === '2°') row.classList.add('position-2');
            else if (piloto.posicion === '3°') row.classList.add('position-3');
            else if (piloto.posicion === 'DNF' || piloto.posicion === 'DQ') {
                row.classList.add('position-dnf');
            }
        }

        row.innerHTML = `
            <td><input type="checkbox" class="pilot-checkbox" data-id="${piloto.id}"></td>
            <td><span class="pilot-number">${piloto.numero}</span></td>
            <td>
                <div class="pilot-info">
                    <div class="pilot-name">${piloto.nombre}</div>
                    ${piloto.vehiculo ? `<div class="pilot-vehicle">${piloto.vehiculo}</div>` : ''}
                </div>
            </td>
            <td>
                <span class="category-badge ${piloto.categoria.toLowerCase()}">
                    ${this.getCategoriaIcon(piloto.categoria)} ${piloto.categoria}
                </span>
            </td>
            <td><span class="money">$${piloto.entrada.toLocaleString()}</span></td>
            <td><span class="time">${piloto.tiempo || '-'}</span></td>
            <td>
                ${piloto.posicion ? `<span class="position-badge ${piloto.posicion.toLowerCase()}">${piloto.posicion}</span>` : '<span class="status-pending">Pendiente</span>'}
            </td>
            <td>
                <span class="status-badge ${piloto.estado}">
                    ${piloto.estado === 'completado' ? 'Completado' : 'En curso'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action edit" onclick="racing.editarPiloto(${piloto.id})" title="Editar">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action delete" onclick="racing.eliminarPiloto(${piloto.id})" title="Eliminar">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        `;

        return row;
    }

    getEmptyTableMessage() {
        return `
            <tr>
                <td colspan="9" class="empty-state">
                    <div class="empty-content">
                        <i class="fas fa-users fa-3x"></i>
                        <h3>No hay pilotos registrados</h3>
                        <p>Registra tu primer piloto para comenzar</p>
                        <button class="btn btn-primary" onclick="racing.abrirModal()">
                            <i class="fas fa-plus"></i>
                            Registrar Piloto
                        </button>
                    </div>
                </td>
            </tr>
        `;
    }

    updateHistorial() {
        const tbody = document.getElementById('historyTableBody');
        if (!tbody) return;

        tbody.innerHTML = '';

        if (this.historial.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="5" class="empty-state">
                        <p>No hay historial de carreras</p>
                    </td>
                </tr>
            `;
            return;
        }

        this.historial.slice(-10).reverse().forEach(piloto => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${new Date(piloto.registro).toLocaleDateString('es-ES')}</td>
                <td>${piloto.nombre}</td>
                <td>${this.getCategoriaIcon(piloto.categoria)} ${piloto.categoria}</td>
                <td>
                    ${piloto.posicion ? `<span class="position-badge ${piloto.posicion.toLowerCase()}">${piloto.posicion}</span>` : '-'}
                </td>
                <td>$${piloto.entrada.toLocaleString()}</td>
            `;
            tbody.appendChild(row);
        });
    }

    updateRecentActivity() {
        const container = document.getElementById('recentActivity');
        if (!container) return;

        container.innerHTML = '';

        if (this.pilotos.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>No hay actividad reciente</p>
                </div>
            `;
            return;
        }

        const recentPilotos = this.pilotos.slice(-5).reverse();
        
        recentPilotos.forEach(piloto => {
            const item = document.createElement('div');
            item.className = 'activity-item';
            
            const timeAgo = this.getTimeAgo(new Date(piloto.registro));
            
            item.innerHTML = `
                <div class="activity-icon ${piloto.estado}">
                    <i class="fas ${piloto.posicion ? 'fa-flag-checkered' : 'fa-user-plus'}"></i>
                </div>
                <div class="activity-content">
                    <div class="activity-title">
                        ${piloto.posicion ? `${piloto.nombre} terminó en ${piloto.posicion}` : `${piloto.nombre} se registró`}
                    </div>
                    <div class="activity-time">${timeAgo}</div>
                </div>
            `;
            
            container.appendChild(item);
        });
    }

    updateCounters() {
        const pilotosCounter = document.getElementById('pilotosCounter');
        if (pilotosCounter) {
            pilotosCounter.textContent = this.pilotos.length;
        }
    }

    calculateStats() {
        const totalPilotos = this.pilotos.length;
        const totalRecaudado = this.pilotos.reduce((sum, p) => sum + p.entrada, 0);
        const completadas = this.pilotos.filter(p => p.posicion).length;
        const primeros = this.pilotos.filter(p => p.posicion === '1°').length;
        const segundos = this.pilotos.filter(p => p.posicion === '2°').length;
        const terceros = this.pilotos.filter(p => p.posicion === '3°').length;
        const dnf = this.pilotos.filter(p => p.posicion === 'DNF' || p.posicion === 'DQ').length;
        const promedio = totalPilotos > 0 ? totalRecaudado / totalPilotos : 0;

        return {
            totalPilotos,
            totalRecaudado,
            completadas,
            primeros,
            segundos,
            terceros,
            dnf,
            promedio
        };
    }

    getCategoriaIcon(categoria) {
        const icons = {
            'Supercar': '🏎️',
            'Deportivo': '🚗',
            'Muscle': '💪',
            'Tuner': '🏁',
            'Off-Road': '🚙',
            'Moto': '🏍️'
        };
        return icons[categoria] || '🚗';
    }

    getTimeAgo(date) {
        const now = new Date();
        const diffInMinutes = Math.floor((now - date) / (1000 * 60));
        
        if (diffInMinutes < 1) return 'Ahora mismo';
        if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
        
        const diffInDays = Math.floor(diffInHours / 24);
        return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
    }

    // Métodos de interfaz
    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }
        
        // Actualizar navegación
        document.querySelectorAll('.menu-item').forEach(item => {
            item.classList.remove('active');
        });
        
        const activeMenuItem = document.querySelector(`[data-section="${sectionId}"]`);
        if (activeMenuItem) {
            activeMenuItem.classList.add('active');
        }
        
        // Actualizar título y breadcrumb
        this.updatePageTitle(sectionId);
        this.currentSection = sectionId;
    }

    updatePageTitle(sectionId) {
        const titles = {
            dashboard: 'Dashboard',
            pilotos: 'Gestión de Pilotos',
            carreras: 'Carreras',
            estadisticas: 'Estadísticas',
            historial: 'Historial',
            reportes: 'Reportes',
            configuracion: 'Configuración'
        };
        
        const pageTitle = document.getElementById('pageTitle');
        const currentSection = document.getElementById('currentSection');
        
        if (pageTitle) pageTitle.textContent = titles[sectionId] || 'Dashboard';
        if (currentSection) currentSection.textContent = titles[sectionId] || 'Dashboard';
    }

    setActiveFilter(tabElement, filter) {
        // Actualizar tabs
        document.querySelectorAll('.filter-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        tabElement.classList.add('active');
        
        // Actualizar filtro
        this.filters.status = filter;
        this.updatePilotosTable();
    }

    abrirModal() {
        const modal = document.getElementById('registroModal');
        if (modal) {
            modal.classList.add('active');
            // Focus en primer input
            setTimeout(() => {
                const firstInput = modal.querySelector('input');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    cerrarModal() {
        const modal = document.getElementById('registroModal');
        if (modal) {
            modal.classList.remove('active');
        }
        this.resetForm();
    }

    resetForm() {
        const form = document.getElementById('registroForm');
        if (form) {
            form.reset();
        }
    }

    editarPiloto(id) {
        const piloto = this.pilotos.find(p => p.id === id);
        if (!piloto) return;

        // Llenar formulario con datos existentes
        document.getElementById('pilotoNombre').value = piloto.nombre;
        document.getElementById('pilotoCategoria').value = piloto.categoria;
        document.getElementById('pilotoEntrada').value = piloto.entrada;
        document.getElementById('pilotoTiempo').value = piloto.tiempo;
        document.getElementById('pilotoPosicion').value = piloto.posicion;
        document.getElementById('pilotoNotas').value = piloto.notas;
        
        if (document.getElementById('pilotoVehiculo')) {
            document.getElementById('pilotoVehiculo').value = piloto.vehiculo || '';
        }

        // Eliminar piloto actual
        this.eliminarPiloto(id, false);

        // Abrir modal
        this.abrirModal();
    }

    eliminarPiloto(id, showConfirm = true) {
        if (showConfirm) {
            if (!confirm('¿Estás seguro de que quieres eliminar este piloto?')) {
                return;
            }
        }

        this.pilotos = this.pilotos.filter(p => p.id !== id);
        
        // Renumerar pilotos
        this.pilotos.forEach((piloto, index) => {
            piloto.numero = index + 1;
        });

        this.guardarDatos();
        this.updateInterface();
        
        if (showConfirm) {
            this.showNotification({
                type: 'success',
                title: 'Piloto Eliminado',
                message: 'El piloto ha sido eliminado correctamente'
            });
        }
    }

    limpiarCarrera() {
        if (this.pilotos.length === 0) {
            this.showNotification({
                type: 'warning',
                title: 'Sin Pilotos',
                message: 'No hay pilotos para archivar'
            });
            return;
        }

        if (!confirm('¿Estás seguro de que quieres archivar la carrera actual?')) {
            return;
        }

        // Mover pilotos al historial
        this.historial = [...this.historial, ...this.pilotos];
        this.pilotos = [];
        
        this.guardarDatos();
        this.updateInterface();
        
        this.showNotification({
            type: 'success',
            title: 'Carrera Archivada',
            message: 'La carrera ha sido archivada correctamente'
        });
    }

    resetearSistema() {
        if (!confirm('¿Estás seguro de que quieres resetear todo el sistema? Esta acción no se puede deshacer.')) {
            return;
        }

        this.pilotos = [];
        this.historial = [];
        localStorage.removeItem('pilotos');
        localStorage.removeItem('historial');
        
        this.updateInterface();
        
        this.showNotification({
            type: 'success',
            title: 'Sistema Reseteado',
            message: 'El sistema ha sido reseteado correctamente'
        });
    }

    exportarDatos() {
        const data = {
            pilotos: this.pilotos,
            historial: this.historial,
            stats: this.calculateStats(),
            exportado: new Date().toISOString(),
            usuario: 'marioovlc'
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `racemanager-pro-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        this.showNotification({
            type: 'success',
            title: 'Datos Exportados',
            message: 'Los datos han sido exportados correctamente'
        });
    }

    showNotification({ type = 'info', title, message }) {
        const container = document.getElementById('notificationsContainer');
        if (!container) return;

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        
        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            warning: 'fa-exclamation-triangle',
            info: 'fa-info-circle'
        };

        notification.innerHTML = `
            <div class="notification-icon">
                <i class="fas ${icons[type]}"></i>
            </div>
            <div class="notification-content">
                <div class="notification-title">${title}</div>
                <div class="notification-message">${message}</div>
            </div>
        `;

        container.appendChild(notification);

        // Auto-remove después de 4 segundos
        setTimeout(() => {
            notification.remove();
        }, 4000);
    }

    animateNewRow() {
        const lastRow = document.querySelector('#pilotosTableBody tr:last-child');
        if (lastRow) {
            lastRow.classList.add('animate__animated', 'animate__pulse');
        }
    }

    updateElement(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    guardarDatos() {
        localStorage.setItem('pilotos', JSON.stringify(this.pilotos));
        localStorage.setItem('historial', JSON.stringify(this.historial));
    }

    // ===== GESTIÓN DE DATOS =====
    
    crearCarrera() {
        // Resetear configuración
        this.resetearConfiguracion();
        
        const raceStatus = document.getElementById('raceStatus');
        const raceStatusText = document.getElementById('raceStatusText');
        
        if (raceStatus && raceStatusText) {
            raceStatus.className = 'status-indicator';
            raceStatusText.textContent = 'Esperando pilotos';
        }
        
        this.updateRaceStats();
        this.showNotification('Nueva carrera creada', 'success');
        console.log('🏁 Nueva carrera creada');
    }
    
    updateRaceConfig() {
        this.updateRaceStats();
    }
    
    updateRaceStats() {
        const racePilotos = document.getElementById('racePilotos');
        const racePremio = document.getElementById('racePremio');
        const raceCircuito = document.getElementById('raceCircuito');
        const raceTiempo = document.getElementById('raceTiempo');
        
        if (racePilotos) {
            racePilotos.textContent = this.pilotos.length;
        }
        
        if (racePremio) {
            racePremio.textContent = `$${this.calcularPremioTotal().toLocaleString()}`;
        }
        
        if (raceCircuito) {
            const categoria = document.getElementById('raceCategory')?.value || 'mixta';
            raceCircuito.textContent = this.getCircuitoName(categoria);
        }
        
        if (raceTiempo) {
            raceTiempo.textContent = this.getRaceTime();
        }
    }
    
    calcularPremioTotal() {
        const entryFee = parseInt(document.getElementById('entryFee')?.value || '500');
        return this.pilotos.reduce((total, piloto) => total + (piloto.entrada || entryFee), 0);
    }
    
    getCircuitoName(categoria) {
        const circuitos = {
            'mixta': 'Los Santos Circuit',
            'supercar': 'Vinewood Speedway',
            'deportivo': 'Del Perro Pier',
            'muscle': 'Sandy Shores',
            'tuner': 'La Mesa',
            'offroad': 'Mount Chiliad',
            'moto': 'Paleto Bay'
        };
        return circuitos[categoria] || 'Circuito Personalizado';
    }
    
    getRaceTime() {
        // Simular tiempo de carrera
        const now = new Date();
        const minutes = now.getMinutes().toString().padStart(2, '0');
        const seconds = now.getSeconds().toString().padStart(2, '0');
        return `${minutes}:${seconds}`;
    }
    
    resetearConfiguracion() {
        const raceType = document.getElementById('raceType');
        const raceCategory = document.getElementById('raceCategory');
        const entryFee = document.getElementById('entryFee');
        const maxPilotos = document.getElementById('maxPilotos');
        
        if (raceType) raceType.value = 'standard';
        if (raceCategory) raceCategory.value = 'mixta';
        if (entryFee) entryFee.value = '500';
        if (maxPilotos) maxPilotos.value = '20';
    }
    
    updateRecentRaces() {
        const recentRaces = document.getElementById('recentRaces');
        if (!recentRaces) return;
        
        if (this.historial.length === 0) {
            recentRaces.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-racing-flag"></i>
                    <h3>No hay carreras recientes</h3>
                    <p>Las carreras completadas aparecerán aquí</p>
                </div>
            `;
            return;
        }
        
        const recentItems = this.historial.slice(-5).reverse();
        recentRaces.innerHTML = recentItems.map(carrera => {
            const fecha = new Date(carrera.fecha).toLocaleDateString();
            const pilotos = carrera.pilotos.length;
            const premio = carrera.premioTotal.toLocaleString();
            
            return `
                <div class="race-item">
                    <div class="race-item-info">
                        <div class="race-item-name">Carrera ${carrera.tipo}</div>
                        <div class="race-item-details">
                            <span>${fecha}</span>
                            <span>${carrera.categoria}</span>
                        </div>
                    </div>
                    <div class="race-item-stats">
                        <span>${pilotos} pilotos</span>
                        <span>$${premio}</span>
                        <div class="race-item-badge completada">Completada</div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

// ===== FUNCIONES GLOBALES =====
function showSection(sectionId) {
    racing.showSection(sectionId);
}

function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
        sidebar.classList.toggle('active');
    }
}

function toggleUserMenu() {
    // Implementar menú de usuario
    console.log('Toggle user menu');
}

function abrirModalRegistro() {
    racing.abrirModal();
}

function cerrarModal() {
    racing.cerrarModal();
}

function limpiarCarrera() {
    racing.limpiarCarrera();
}

function resetearSistema() {
    racing.resetearSistema();
}

function exportarDatos() {
    racing.exportarDatos();
}

function refreshTable() {
    racing.updateInterface();
    racing.showNotification({
        type: 'info',
        title: 'Actualizado',
        message: 'Los datos han sido actualizados'
    });
}

function toggleSelectAll() {
    const selectAllCheckbox = document.querySelector('.select-all');
    const pilotCheckboxes = document.querySelectorAll('.pilot-checkbox');
    
    if (selectAllCheckbox && pilotCheckboxes) {
        pilotCheckboxes.forEach(checkbox => {
            checkbox.checked = selectAllCheckbox.checked;
        });
    }
}

function selectAllPilotos() {
    const pilotCheckboxes = document.querySelectorAll('.pilot-checkbox');
    const selectAllCheckbox = document.querySelector('.select-all');
    
    if (pilotCheckboxes) {
        pilotCheckboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        if (selectAllCheckbox) {
            selectAllCheckbox.checked = true;
        }
    }
}

function toggleView() {
    // Implementar cambio de vista tabla/grid
    console.log('Toggle view');
}


// ===== INICIALIZACIÓN =====
let racing;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    racing = new RaceManagerPro();
});

// Cerrar modal al hacer clic fuera
window.onclick = function(event) {
    const modal = document.getElementById('registroModal');
    if (event.target === modal) {
        racing.cerrarModal();
    }
}

// Prevenir cierre accidental
window.addEventListener('beforeunload', function(e) {
    if (racing && racing.pilotos.length > 0) {
        e.preventDefault();
        e.returnValue = '';
    }
});