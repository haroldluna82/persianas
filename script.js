// Variables globales
let uploadedImages = [];
let savedImages = JSON.parse(localStorage.getItem('persianaImages') || '[]');
let selectedImages = [];
let currentImageId = null;
let isLoggedIn = false;
let logoImage = localStorage.getItem('siteLogo') || 'logo.png';
const validUsers = [
    { username: 'admin', password: 'admin123' },
    { username: 'usuario', password: '12345' }
];

// Elementos DOM
document.addEventListener('DOMContentLoaded', function() {
    // Navegación
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('main > section');
    const loginNavItem = document.querySelector('.login-nav');
    const userNavItems = document.querySelectorAll('.user-nav');
    const loginLink = document.getElementById('login-link');
    const logoutLink = document.getElementById('logout-link');
    const usernameDisplay = document.getElementById('username-display');
    const userOnlyElements = document.querySelectorAll('.user-only');
    const goToLoginBtn = document.getElementById('go-to-login-btn');
    const loginPrompt = document.getElementById('login-prompt');
    
    // Logo
    const siteLogo = document.getElementById('site-logo');
    
    // Login
    const loginForm = document.getElementById('login-form');
    
    // Subida de logo
    const logoDropArea = document.getElementById('logo-drop-area');
    const logoFileInput = document.getElementById('logo-file-input');
    const selectLogoBtn = document.getElementById('select-logo-btn');
    const logoPreviewContainer = document.getElementById('logo-preview-container');
    const saveLogoBtn = document.getElementById('save-logo-btn');
    let uploadedLogo = null;
    
    // Pantalla de subida
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('file-input');
    const selectFilesBtn = document.getElementById('select-files-btn');
    const previewContainer = document.getElementById('preview-container');
    const saveImagesBtn = document.getElementById('save-images-btn');
    const clearImagesBtn = document.getElementById('clear-images-btn');
    
    // Pantalla de galería
    const galleryContainer = document.getElementById('gallery-container');
    const selectAllBtn = document.getElementById('select-all-btn');
    const deleteSelectedBtn = document.getElementById('delete-selected-btn');
    
    // Pantalla de detalles
    const detailImg = document.getElementById('detail-img');
    const detailTitle = document.getElementById('detail-title');
    const detailDate = document.getElementById('detail-date');
    const detailCategory = document.getElementById('detail-category');
    const backToGalleryBtn = document.getElementById('back-to-gallery');
    const deleteImageBtn = document.getElementById('delete-image-btn');
    
    // Para debug, mostrar todas las categorías de imágenes guardadas
    console.log("Categorías existentes al iniciar:", 
                [...new Set(savedImages.map(img => img.category || 'no_category'))]);
    
    // Inicializar aplicación
    initNavigation();
    initAuth();
    initFileUpload();
    initLogoUpload();
    initGallery();
    initDetails();
    initCategoryLinks();
    initUrlHandling();
    
    // Cargar logo guardado
    loadSavedLogo();
    
    // Verificar si hay una sesión guardada
    checkSavedSession();
    
    // Inicializar la aplicación en la pantalla de inicio
    navigateTo('home');
    
    // Cargar imágenes en las categorías
    updateCategoryImages();

    // Funciones de navegación
    function initNavigation() {
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                link.classList.add('active');
                const pageId = link.getAttribute('data-page');
                navigateTo(pageId);
            });
        });

        // Activar el enlace de inicio por defecto
        document.querySelector('.nav-link[data-page="home"]').classList.add('active');
        
        // Botón para ir a login desde el prompt
        if (goToLoginBtn) {
            goToLoginBtn.addEventListener('click', () => {
                navigateTo('login');
                navLinks.forEach(l => l.classList.remove('active'));
                loginLink.classList.add('active');
            });
        }
        
        // Logo enlace a inicio
        const logoLink = document.querySelector('.logo-link');
        if (logoLink) {
            logoLink.addEventListener('click', (e) => {
                e.preventDefault();
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('.nav-link[data-page="home"]').classList.add('active');
                navigateTo('home');
            });
        }
        
        // Botón para ir a la galería desde admin
        const goToGalleryBtn = document.getElementById('go-to-gallery-btn');
        if (goToGalleryBtn) {
            goToGalleryBtn.addEventListener('click', () => {
                navigateTo('gallery');
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('.nav-link[data-page="gallery"]').classList.add('active');
            });
        }
    }
    
    // Inicializar manejo de URLs
    function initUrlHandling() {
        // Detectar cambios en la URL y navegar a la página correspondiente
        window.addEventListener('popstate', (e) => {
            const path = window.location.pathname;
            handleUrlPath(path);
        });
        
        // Manejar la URL inicial
        const path = window.location.pathname;
        handleUrlPath(path);
    }
    
    function handleUrlPath(path) {
        if (path === '/' || path === '/index.html') {
            navigateTo('home');
        } else if (path === '/galeria') {
            navigateTo('gallery');
        } else if (path === '/admin') {
            navigateTo('admin');
        } else if (path === '/login') {
            navigateTo('login');
        }
    }
    
    // Actualizar la URL en la barra de direcciones
    function updateUrl(pageId) {
        let url = '/';
        switch(pageId) {
            case 'gallery':
                url = '/galeria';
                break;
            case 'admin':
                url = '/admin';
                break;
            case 'login':
                url = '/login';
                break;
            default:
                url = '/';
        }
        
        // Cambiar la URL sin recargar la página
        window.history.pushState({page: pageId}, '', url);
    }
    
    // Inicializar enlaces de categoría
    function initCategoryLinks() {
        const categoryLinks = document.querySelectorAll('[data-category]');
        categoryLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const category = link.getAttribute('data-category');
                console.log("Clic en categoría:", category);
                
                // Navegar a la galería con el filtro seleccionado
                navigateTo('gallery');
                
                // Actualizar el selector de filtro
                const galleryFilter = document.getElementById('gallery-filter');
                if (galleryFilter) {
                    galleryFilter.value = category;
                    console.log("Filtro establecido a:", category);
                    
                    // Disparar evento de cambio para aplicar el filtro
                    const event = new Event('change');
                    galleryFilter.dispatchEvent(event);
                }
                
                // Actualizar navegación activa
                navLinks.forEach(l => l.classList.remove('active'));
                document.querySelector('.nav-link[data-page="gallery"]').classList.add('active');
            });
        });
    }

    function navigateTo(pageId) {
        // Si el usuario intenta ir a una página protegida y no está logueado
        if ((pageId === 'admin') && !isLoggedIn) {
            showNotification('Necesitas iniciar sesión para acceder a esta sección', 'error');
            navigateTo('login');
            return;
        }
        
        pages.forEach(page => {
            page.classList.add('hidden');
        });
        document.getElementById(pageId).classList.remove('hidden');

        // Actualizar la galería si navegamos a ella
        if (pageId === 'gallery') {
            updateGallery();
        }
        
        // Actualizar la visualización de inicio si navegamos a ella
        if (pageId === 'home') {
            updateHomeDisplay();
        }
        
        // Actualizar la URL
        updateUrl(pageId);
    }
    
    // Mostrar imágenes aleatorias en las categorías
    function updateCategoryImages() {
        const categoryCards = document.querySelectorAll('.category-card');
        
        categoryCards.forEach(card => {
            const categoryLink = card.querySelector('.btn');
            if (!categoryLink) return;
            
            const category = categoryLink.getAttribute('data-category');
            console.log("Buscando imágenes para categoría:", category);
            
            const categoryImages = savedImages.filter(img => img.category === category);
            console.log(`Encontradas ${categoryImages.length} imágenes para categoría ${category}`);
            
            // Si hay imágenes en esta categoría, mostrar una aleatoria
            if (categoryImages.length > 0) {
                const randomIndex = Math.floor(Math.random() * categoryImages.length);
                const randomImage = categoryImages[randomIndex];
                const imgElement = card.querySelector('img');
                
                if (imgElement && randomImage) {
                    imgElement.src = randomImage.src;
                    console.log(`Imagen actualizada para categoría ${category}`);
                }
            }
        });
    }
    
    // Sistema de autenticación
    function initAuth() {
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;
                
                // Autenticar usuario
                if (authenticateUser(username, password)) {
                    login(username);
                    navigateTo('admin');
                    showNotification(`Bienvenido/a, ${username}!`, 'success');
                } else {
                    showNotification('Usuario o contraseña incorrectos', 'error');
                }
            });
        }
        
        // Cerrar sesión
        if (logoutLink) {
            logoutLink.addEventListener('click', (e) => {
                e.preventDefault();
                logout();
                navigateTo('home');
                showNotification('Has cerrado sesión correctamente', 'info');
            });
        }
    }
    
    function authenticateUser(username, password) {
        return validUsers.some(user => 
            user.username === username && user.password === password
        );
    }
    
    function login(username) {
        isLoggedIn = true;
        
        // Actualizar UI
        if (loginNavItem) loginNavItem.classList.add('hidden');
        userNavItems.forEach(item => item.classList.remove('hidden'));
        userOnlyElements.forEach(el => el.classList.remove('hidden'));
        
        if (loginPrompt) {
            loginPrompt.classList.add('hidden');
        }
        
        // Mostrar nombre de usuario
        if (usernameDisplay) {
            usernameDisplay.textContent = username;
        }
        
        // Guardar sesión
        localStorage.setItem('persianasSession', JSON.stringify({
            username: username,
            loggedIn: true
        }));
    }
    
    function logout() {
        isLoggedIn = false;
        
        // Actualizar UI
        if (loginNavItem) loginNavItem.classList.remove('hidden');
        userNavItems.forEach(item => item.classList.add('hidden'));
        userOnlyElements.forEach(el => el.classList.add('hidden'));
        
        if (loginPrompt) {
            loginPrompt.classList.remove('hidden');
        }
        
        // Limpiar sesión
        localStorage.removeItem('persianasSession');
    }
    
    function checkSavedSession() {
        const savedSession = JSON.parse(localStorage.getItem('persianasSession') || 'null');
        
        if (savedSession && savedSession.loggedIn) {
            login(savedSession.username);
        }
    }
    
    // Gestión de logo
    function initLogoUpload() {
        if (logoFileInput && selectLogoBtn) {
            selectLogoBtn.addEventListener('click', () => {
                logoFileInput.click();
            });
            
            logoFileInput.addEventListener('change', () => {
                const file = logoFileInput.files[0];
                if (file && file.type.match('image.*')) {
                    previewLogo(file);
                }
            });
        }
        
        if (logoDropArea) {
            setupDragAndDrop(logoDropArea, logoFileInput, null, previewLogo);
        }
        
        if (saveLogoBtn) {
            saveLogoBtn.addEventListener('click', () => {
                if (uploadedLogo) {
                    saveLogo(uploadedLogo);
                    showNotification('Logo guardado correctamente', 'success');
                } else {
                    showNotification('Por favor, selecciona una imagen para el logo', 'error');
                }
            });
        }
    }
    
    function previewLogo(file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            uploadedLogo = e.target.result;
            
            // Mostrar vista previa
            logoPreviewContainer.innerHTML = `
                <img src="${uploadedLogo}" alt="Vista previa del logo" class="logo-preview">
            `;
        };
        reader.readAsDataURL(file);
    }
    
    function saveLogo(logoSrc) {
        // Guardar en localStorage
        localStorage.setItem('siteLogo', logoSrc);
        
        // Actualizar logo en la página
        if (siteLogo) {
            siteLogo.src = logoSrc;
        }
        
        // Actualizar también en el footer si existe
        const footerLogo = document.querySelector('.footer-logo-img');
        if (footerLogo) {
            footerLogo.src = logoSrc;
        }
    }
    
    function loadSavedLogo() {
        // Cargar logo guardado si existe
        const savedLogo = localStorage.getItem('siteLogo');
        if (savedLogo && siteLogo) {
            siteLogo.src = savedLogo;
            
            // Actualizar también en el footer si existe
            const footerLogo = document.querySelector('.footer-logo-img');
            if (footerLogo) {
                footerLogo.src = savedLogo;
            }
        }
    }
    
    // Actualizar la visualización de imágenes en el inicio
    function updateHomeDisplay() {
        // Si hay imágenes guardadas, mostrar algunas en el inicio como muestra
        if (savedImages.length > 0) {
            // Mostrar la sección de "tus últimas imágenes" solo si hay imágenes
            let featuredContainer = document.getElementById('featured-images');
            if (!featuredContainer) {
                featuredContainer = document.createElement('div');
                featuredContainer.id = 'featured-images';
                featuredContainer.className = 'featured-images';
                featuredContainer.innerHTML = '<h3>Últimas imágenes añadidas</h3>';
                
                const imagesGrid = document.createElement('div');
                imagesGrid.className = 'featured-grid';
                featuredContainer.appendChild(imagesGrid);
                
                // Insertar antes del login-prompt o section final
                const insertPoint = document.querySelector('.login-prompt');
                if (insertPoint && insertPoint.parentNode) {
                    insertPoint.parentNode.insertBefore(featuredContainer, insertPoint);
                }
            }
            
            // Obtener el contenedor de la cuadrícula
            const imagesGrid = featuredContainer.querySelector('.featured-grid');
            if (imagesGrid) {
                imagesGrid.innerHTML = '';
                
                // Mostrar las últimas 4 imágenes
                const recentImages = [...savedImages].reverse().slice(0, 4);
                recentImages.forEach(img => {
                    const imgElement = document.createElement('div');
                    imgElement.className = 'featured-item';
                    imgElement.innerHTML = `
                        <img src="${img.src}" alt="${img.name}" class="featured-img">
                    `;
                    imgElement.addEventListener('click', () => {
                        showDetails(img);
                    });
                    imagesGrid.appendChild(imgElement);
                });
                
                // Botón para ver toda la galería
                const viewAllBtn = document.createElement('button');
                viewAllBtn.className = 'btn view-all-btn';
                viewAllBtn.innerHTML = '<i class="fas fa-th"></i> Ver toda la galería';
                viewAllBtn.addEventListener('click', () => {
                    navigateTo('gallery');
                    navLinks.forEach(l => l.classList.remove('active'));
                    document.querySelector('.nav-link[data-page="gallery"]').classList.add('active');
                });
                
                if (!featuredContainer.querySelector('.view-all-btn')) {
                    featuredContainer.appendChild(viewAllBtn);
                }
            }
        }
    }

    // Funcionalidad de subida de archivos
    function initFileUpload() {
        // Configurar eventos de arrastrar y soltar
        setupDragAndDrop(dropArea, fileInput, previewContainer, handleFiles);
        
        if (selectFilesBtn) {
            selectFilesBtn.addEventListener('click', () => {
                fileInput.click();
            });
        }

        if (fileInput) {
            fileInput.addEventListener('change', () => {
                handleFiles(fileInput.files, previewContainer);
            });
        }

        if (saveImagesBtn) {
            saveImagesBtn.addEventListener('click', () => {
                if (uploadedImages.length === 0) {
                    showNotification('Por favor, sube al menos una imagen.', 'error');
                    return;
                }

                saveImagesToStorage();
                previewContainer.innerHTML = '';
                showNotification('Imágenes guardadas correctamente', 'success');
                updateCategoryImages(); // Actualizar imágenes de categorías
                navigateTo('gallery');
            });
        }
        
        if (clearImagesBtn) {
            clearImagesBtn.addEventListener('click', () => {
                uploadedImages = [];
                previewContainer.innerHTML = '';
                showNotification('Selección limpiada', 'info');
            });
        }
    }

    // Configurar eventos de arrastrar y soltar
    function setupDragAndDrop(dropArea, fileInput, previewContainer, callbackFn) {
        if (!dropArea) return;
        
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, preventDefaults, false);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.add('active');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dropArea.addEventListener(eventName, () => {
                dropArea.classList.remove('active');
            }, false);
        });

        dropArea.addEventListener('drop', (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            
            if (files.length === 1 && callbackFn === previewLogo) {
                // Si es un solo archivo y estamos en el área del logo
                const file = files[0];
                if (file.type.match('image.*')) {
                    callbackFn(file);
                }
            } else if (previewContainer) {
                // Si estamos en el área de subida de imágenes
                handleFiles(files, previewContainer);
            }
        }, false);
    }

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    function handleFiles(files, previewContainer) {
        if (!files || files.length === 0 || !previewContainer) return;
        
        files = [...files];
        
        // Validar archivos (solo imágenes)
        const validFiles = files.filter(file => file.type.match('image.*'));
        
        if (validFiles.length === 0) {
            showNotification('Por favor, selecciona archivos de imagen válidos.', 'error');
            return;
        }
        
        validFiles.forEach(file => previewFile(file, previewContainer));
    }

    function previewFile(file, previewContainer) {
        const reader = new FileReader();
        reader.onload = function(e) {
            // CORRECCIÓN IMPORTANTE: Obtener correctamente la categoría seleccionada
            // Asegúrate de que este selector apunta al elemento correcto
            const categorySelect = document.getElementById('upload-category');
            let category = 'general'; // Valor por defecto
            
            if (categorySelect) {
                category = categorySelect.value;
                console.log("Subiendo imagen con categoría:", category);
            } else {
                console.warn("No se encontró el selector de categoría!");
            }
            
            const imgData = {
                id: Date.now() + Math.random().toString(36).substr(2, 9),
                name: file.name,
                date: new Date().toLocaleDateString(),
                category: category, // Asignamos la categoría correcta
                src: e.target.result
            };
            uploadedImages.push(imgData);

            const previewItem = document.createElement('div');
            previewItem.className = 'preview-item';
            previewItem.innerHTML = `
                <img src="${imgData.src}" class="preview-img" alt="${imgData.name}">
                <button class="remove-btn" data-id="${imgData.id}">
                    <i class="fas fa-times"></i>
                </button>
            `;
            previewContainer.appendChild(previewItem);

            // Agregar evento para eliminar imagen
            previewItem.querySelector('.remove-btn').addEventListener('click', function() {
                const id = this.getAttribute('data-id');
                uploadedImages = uploadedImages.filter(img => img.id !== id);
                previewItem.remove();
            });
        };
        reader.readAsDataURL(file);
    }

    function saveImagesToStorage() {
        // Añadir registro de categorías para depuración
        console.log("Imágenes a guardar:", uploadedImages.map(img => 
            `${img.name} (categoría: ${img.category})`).join(', '));
        
        savedImages = [...savedImages, ...uploadedImages];
        localStorage.setItem('persianaImages', JSON.stringify(savedImages));
        uploadedImages = [];
        
        // Verificar que se guardaron correctamente
        const savedImagesCheck = JSON.parse(localStorage.getItem('persianaImages') || '[]');
        console.log("Imágenes guardadas:", savedImagesCheck.length);
        console.log("Categorías guardadas:", [...new Set(savedImagesCheck.map(img => img.category || 'no_category'))]);
    }

    // Funcionalidad de galería
    function initGallery() {
        if (selectAllBtn) {
            selectAllBtn.addEventListener('click', toggleSelectAll);
        }
        
        if (deleteSelectedBtn) {
            deleteSelectedBtn.addEventListener('click', deleteSelectedImages);
        }
        
        // CORRECCIÓN IMPORTANTE: Agregar evento para el filtro de galería
        const galleryFilter = document.getElementById('gallery-filter');
        if (galleryFilter) {
            // Asegurarse de que se dispare el evento al cambiar
            galleryFilter.addEventListener('change', function() {
                console.log("Cambiado filtro a:", this.value);
                updateGallery();
            });
        }
    }
    
    function toggleSelectAll() {
        const allItems = document.querySelectorAll('.gallery-item');
        const allSelected = selectedImages.length === savedImages.length && savedImages.length > 0;
        
        if (allSelected) {
            // Deseleccionar todo
            selectedImages = [];
            allItems.forEach(item => {
                item.classList.remove('selected');
                const checkbox = item.querySelector('.gallery-checkbox');
                if (checkbox) checkbox.checked = false;
            });
            selectAllBtn.innerHTML = '<i class="fas fa-check-square"></i> Seleccionar todo';
        } else {
            // Seleccionar todo
            selectedImages = [...savedImages];
            allItems.forEach(item => {
                item.classList.add('selected');
                const checkbox = item.querySelector('.gallery-checkbox');
                if (checkbox) checkbox.checked = true;
            });
            selectAllBtn.innerHTML = '<i class="fas fa-square"></i> Deseleccionar todo';
        }
        
        updateDeleteButtonState();
    }
    
    function updateDeleteButtonState() {
        if (!deleteSelectedBtn) return;
        
        if (selectedImages.length > 0) {
            deleteSelectedBtn.removeAttribute('disabled');
            deleteSelectedBtn.innerHTML = `<i class="fas fa-trash-alt"></i> Eliminar (${selectedImages.length})`;
        } else {
            deleteSelectedBtn.setAttribute('disabled', 'disabled');
            deleteSelectedBtn.innerHTML = '<i class="fas fa-trash-alt"></i> Eliminar seleccionados';
        }
    }
    
    function deleteSelectedImages() {
        if (selectedImages.length === 0) return;
        
        if (confirm(`¿Estás seguro de que deseas eliminar ${selectedImages.length} imágenes?`)) {
            // Filtrar las imágenes seleccionadas
            const selectedIds = selectedImages.map(img => img.id);
            savedImages = savedImages.filter(img => !selectedIds.includes(img.id));
            
            // Guardar en localStorage
            localStorage.setItem('persianaImages', JSON.stringify(savedImages));
            
            // Resetear selección
            selectedImages = [];
            
            // Actualizar interfaz
            updateGallery();
            updateCategoryImages(); // Actualizar imágenes de categorías
            showNotification('Imágenes eliminadas correctamente', 'success');
        }
    }

    function updateGallery() {
        if (!galleryContainer) return;
        
        galleryContainer.innerHTML = '';
        selectedImages = []; // Resetear selección al actualizar
        
        // CORRECCIÓN IMPORTANTE: Obtener correctamente el filtro actual
        const galleryFilter = document.getElementById('gallery-filter');
        const currentFilter = galleryFilter ? galleryFilter.value : 'all';
        
        // Logs para depuración
        console.log("Filtro actual:", currentFilter);
        console.log("Imágenes totales:", savedImages.length);
        console.log("Categorías disponibles:", [...new Set(savedImages.map(img => img.category || 'no_category'))]);
        
        // CORRECCIÓN IMPORTANTE: Filtrar imágenes según la categoría seleccionada
        let filteredImages = savedImages;
        if (currentFilter !== 'all') {
            filteredImages = savedImages.filter(img => {
                console.log(`Comparando imagen categoría [${img.category}] con filtro [${currentFilter}]`);
                return img.category === currentFilter;
            });
        }
        
        console.log("Imágenes filtradas:", filteredImages.length);
        
        if (filteredImages.length === 0) {
            galleryContainer.innerHTML = `
                <div class="empty-gallery">
                    <i class="fas fa-images fa-4x"></i>
                    <h3>No hay imágenes${currentFilter !== 'all' ? ' en esta categoría' : ' en la galería'}</h3>
                    <p>${currentFilter !== 'all' ? 'Intenta con otra categoría o' : ''} sube algunas imágenes${isLoggedIn ? ' desde el panel de administración' : ''}</p>
                    ${isLoggedIn ? `<button class="btn" id="empty-go-upload">
                        <i class="fas fa-cloud-upload-alt"></i> Ir a subir imágenes
                    </button>` : ''}
                </div>
            `;
            
            // Agregar evento para el botón de ir a subir
            const emptyGoUploadBtn = document.getElementById('empty-go-upload');
            if (emptyGoUploadBtn) {
                emptyGoUploadBtn.addEventListener('click', () => {
                    navigateTo('admin');
                    navLinks.forEach(l => l.classList.remove('active'));
                    document.querySelector('.nav-link[data-page="admin"]').classList.add('active');
                });
            }
            
            return;
        }

        filteredImages.forEach((img, index) => {
            const galleryItem = document.createElement('div');
            galleryItem.className = 'gallery-item';
            galleryItem.setAttribute('data-id', img.id);
            galleryItem.setAttribute('data-category', img.category || 'general');
            
            // El HTML depende de si el usuario está logueado o no
            if (isLoggedIn) {
                galleryItem.innerHTML = `
                    <div class="gallery-item-content">
                        <img src="${img.src}" class="gallery-img" alt="${img.name}">
                        <div class="gallery-info">
                            <div class="gallery-info-text">
                                <p>${img.name}</p>
                                <small>${img.date}</small>
                            </div>
                            <div class="gallery-controls">
                                <button class="gallery-btn view-btn" title="Ver detalles">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="gallery-btn select-btn" title="Seleccionar">
                                    <i class="far fa-square"></i>
                                </button>
                                <button class="gallery-btn delete-btn" title="Eliminar">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <input type="checkbox" class="gallery-checkbox" style="display:none">
                `;
            } else {
                galleryItem.innerHTML = `
                    <div class="gallery-item-content">
                        <img src="${img.src}" class="gallery-img" alt="${img.name}">
                        <div class="gallery-info">
                            <div class="gallery-info-text">
                                <p>${img.name}</p>
                                <small>${img.date}</small>
                            </div>
                            <div class="gallery-controls">
                                <button class="gallery-btn view-btn" title="Ver detalles">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `;
            }
            
            galleryContainer.appendChild(galleryItem);
            
            // Agregar eventos
            const viewBtn = galleryItem.querySelector('.view-btn');
            
            // Ver detalles
            viewBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                showDetails(img);
            });
            
            // También permitir hacer clic en la imagen para ver detalles
            galleryItem.querySelector('.gallery-img').addEventListener('click', () => {
                showDetails(img);
            });
            
            // Eventos solo para usuarios logueados
            if (isLoggedIn) {
                const selectBtn = galleryItem.querySelector('.select-btn');
                const deleteBtn = galleryItem.querySelector('.delete-btn');
                const checkbox = galleryItem.querySelector('.gallery-checkbox');
                
                // Seleccionar imagen
                selectBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    toggleImageSelection(img, galleryItem, checkbox, selectBtn);
                });
                
                // Eliminar imagen
                deleteBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    deleteImage(img.id);
                });
            }
        });
        
        if (isLoggedIn) {
            updateDeleteButtonState();
        }
    }
    
    function toggleImageSelection(img, galleryItem, checkbox, selectBtn) {
        const isSelected = selectedImages.some(selected => selected.id === img.id);
        
        if (isSelected) {
            // Deseleccionar
            selectedImages = selectedImages.filter(selected => selected.id !== img.id);
            galleryItem.classList.remove('selected');
            checkbox.checked = false;
            selectBtn.innerHTML = '<i class="far fa-square"></i>';
        } else {
            // Seleccionar
            selectedImages.push(img);
            galleryItem.classList.add('selected');
            checkbox.checked = true;
            selectBtn.innerHTML = '<i class="fas fa-check-square"></i>';
        }
        
        updateDeleteButtonState();
    }
    
    function deleteImage(imageId) {
        const imageToDelete = savedImages.find(img => img.id === imageId);
        
        if (!imageToDelete) return;
        
        if (confirm(`¿Estás seguro de que deseas eliminar la imagen "${imageToDelete.name}"?`)) {
            // Eliminar la imagen
            savedImages = savedImages.filter(img => img.id !== imageId);
            
            // Eliminar de seleccionados si está seleccionada
            selectedImages = selectedImages.filter(img => img.id !== imageId);
            
            // Guardar en localStorage
            localStorage.setItem('persianaImages', JSON.stringify(savedImages));
            
            // Actualizar interfaz
            updateGallery();
            updateCategoryImages(); // Actualizar imágenes aleatorias en categorías
            showNotification('Imagen eliminada correctamente', 'success');
        }
    }

    // Funcionalidad de detalles
    function initDetails() {
        if (backToGalleryBtn) {
            backToGalleryBtn.addEventListener('click', () => {
                navigateTo('gallery');
            });
        }
        
        if (deleteImageBtn) {
            deleteImageBtn.addEventListener('click', () => {
                if (currentImageId) {
                    deleteImage(currentImageId);
                    navigateTo('gallery');
                }
            });
        }
    }
    
    function showDetails(img) {
        currentImageId = img.id;
        detailImg.src = img.src;
        detailTitle.textContent = img.name;
        detailDate.textContent = img.date;
        
        // Mostrar la categoría si existe
        if (detailCategory && img.category) {
            // Convertir el valor de la categoría a un formato más legible
            let categoryName = "General";
            switch(img.category) {
                case 'blackout':
                    categoryName = "BlackOut";
                    break;
                case 'panel-japones':
                    categoryName = "Panel Japonés";
                    break;
                case 'sheer-elegance':
                    categoryName = "Sheer Elegance";
                    break;
                case 'vertical':
                    categoryName = "Vertical";
                    break;
            }
            detailCategory.textContent = categoryName;
        }
        
        navigateTo('details');
    }
    
    // Utilidad para mostrar notificaciones
    function showNotification(message, type = 'info') {
        // Verificar si ya existe una notificación
        let notification = document.querySelector('.notification');
        
        if (notification) {
            // Si ya existe, eliminarla primero
            notification.remove();
        }
        
        // Crear nueva notificación
        notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <div class="notification-content">
                <span>${message}</span>
                <button class="notification-close">×</button>
            </div>
        `;
        
        document.body.appendChild(notification);
        
        // Mostrar con animación
        setTimeout(() => {
            notification.classList.add('show');
        }, 10);
        
        // Agregar evento para cerrar
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.classList.remove('show');
            setTimeout(() => {
                notification.remove();
            }, 300);
        });
        
        // Auto cerrar después de 3 segundos
        setTimeout(() => {
            if (document.body.contains(notification)) {
                notification.classList.remove('show');
                setTimeout(() => {
                    if (document.body.contains(notification)) {
                        notification.remove();
                    }
                }, 300);
            }
        }, 3000);
    }
    
    // Inicializar la aplicación
    updateHomeDisplay();
});
