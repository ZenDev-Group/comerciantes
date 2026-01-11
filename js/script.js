document.addEventListener('DOMContentLoaded', () => {

    /* ****************************************************** */
    /* INICIALIZACIÓN DE LENIS (SCROLL SUAVE)                 */
    /* ****************************************************** */

    // 1. Inicializar Lenis para TODOS los dispositivos (sin media query restrictiva)
    const lenis = new Lenis({
        lerp: 0.08,             // Suavizado un poco más natural
        wheelMultiplier: 1,     // Velocidad de scroll normal
        smoothWheel: true,
        // Eliminamos la mediaQuery para que funcione en mobile también si se desea,
        // o puedes descomentarla si SOLO lo quieres en desktop.
        // mediaQuery: "(min-width: 768px)", 
    });

    // 2. Loop de animación (RAF)
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);


    // 3. Conectar Lenis con GSAP ScrollTrigger
    if (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined') {
        gsap.registerPlugin(ScrollTrigger);
        lenis.on('scroll', ScrollTrigger.update);

        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);

        // NUEVA LOGICA HEADER STICKY (Slide Down)
        // Mostrar la barra .sticky-header-bar cuando el scroll pasa 150px
        ScrollTrigger.create({
            trigger: "body",
            start: "top -350px", // Al bajar 150px
            onUpdate: (self) => {
                const stickyBar = document.querySelector('.sticky-header-bar');
                if (stickyBar) {
                    if (self.direction === 1 && self.scroll() > 350) {
                        // Scrolling Down & Pasado 150px
                        stickyBar.classList.add('visible');
                    } else if (self.scroll() < 350) {
                        // Arriba del todo
                        stickyBar.classList.remove('visible');
                    }
                    // Opcional: Ocultar al subir (self.direction === -1) si se quiere efecto "Smart Hide"
                }
            }
        });
    }


    /* ****************************************************** */
    /* ICONOS LUCIDE                                          */
    /* ****************************************************** */
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }


    /* ****************************************************** */
    /* MENU HAMBURGUESA                                       */
    /* ****************************************************** */
    const menuOpen = document.getElementById('menu-open');
    const menuClose = document.getElementById('menu-close');
    const navMenu = document.getElementById('nav-menu');
    const overlay = document.getElementById('overlay');

    function toggleMenu() {
        if (!navMenu) return; // Seguridad

        const isActive = navMenu.classList.contains('show');

        if (isActive) {
            // CERRAR
            navMenu.classList.remove('show');
            if (overlay) overlay.classList.remove('active');

            // Reanudar Scroll
            document.body.style.overflow = '';
            lenis.start();
        } else {
            // ABRIR
            navMenu.classList.add('show');
            if (overlay) overlay.classList.add('active');

            // Bloquear Scroll
            document.body.style.overflow = 'hidden';
            lenis.stop();
        }
    }

    if (menuOpen) menuOpen.addEventListener('click', toggleMenu);
    if (menuClose) menuClose.addEventListener('click', toggleMenu);
    if (overlay) overlay.addEventListener('click', toggleMenu);

    // Cerrar menú al hacer click en un enlace del menú
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('show')) {
                toggleMenu();
            }
        });
    });


    /* ****************************************************** */
    /* HEADER DINÁMICO (FIXED + SPACER)                       */
    /* ****************************************************** */
    const header = document.getElementById('dynamic-header');
    const headerSpacer = document.getElementById('header-spacer');

    // Función para ajustar el spacer al tamaño real del header inicial
    const adjustSpacer = () => {
        if (header && headerSpacer) {
            // Desactivar transición momentáneamente para medir tamaño full
            header.style.transition = 'none';
            header.classList.remove('sticky-active');

            // Forzar reflow/medición
            const height = header.offsetHeight;
            headerSpacer.style.height = `${height}px`;

            // Restaurar transición
            header.style.transition = '';

            // Re-chequear estado sticky actual
            if (lenis && lenis.scroll > 50) header.classList.add('sticky-active');
        }
    };

    // Ejecutar al inicio y al redimensionar
    if (header && headerSpacer) {
        adjustSpacer();
        window.addEventListener('resize', adjustSpacer);

        // Timeout de seguridad por si cargan fuentes/img
        setTimeout(adjustSpacer, 500);
        setTimeout(adjustSpacer, 2000);

        // Lógica de Scroll con Lenis
        if (lenis) {
            lenis.on('scroll', ({ scroll }) => {
                if (scroll > 50) {
                    if (!header.classList.contains('sticky-active')) {
                        header.classList.add('sticky-active');
                    }
                } else {
                    if (header.classList.contains('sticky-active')) {
                        header.classList.remove('sticky-active');
                    }
                }
            });
        }
    }


    /* ****************************************************** */
    /* CARRUSEL DE ARRASTRE (DRAGGABLE)                       */
    /* ****************************************************** */
    const sliders = document.querySelectorAll('.slider-wrapper, .gastro-slider, .categories-container');

    sliders.forEach(slider => {
        let isDown = false;
        let startX;
        let scrollLeft;

        slider.addEventListener('mousedown', (e) => {
            isDown = true;

            // Deshabilitar snap mientras se arrastra para fluidez
            slider.style.scrollSnapType = 'none';
            startX = e.pageX - slider.offsetLeft;
            scrollLeft = slider.scrollLeft;
        });

        slider.addEventListener('mouseleave', () => {
            isDown = false;

            slider.style.scrollSnapType = 'x mandatory'; // Restaurar snap
        });

        slider.addEventListener('mouseup', () => {
            isDown = false;

            slider.style.scrollSnapType = 'x mandatory'; // Restaurar snap
        });

        slider.addEventListener('mousemove', (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = e.pageX - slider.offsetLeft;
            const walk = (x - startX) * 2; // Velocidad de arrastre
            slider.scrollLeft = scrollLeft - walk;
        });
    });


    /* ****************************************************** */
    /* FILTROS DE GASTRONOMIA                                  */
    /* ****************************************************** */
    const filterBtns = document.querySelectorAll('.f-link');
    const gastroItems = document.querySelectorAll('.g-item');
    const gastroSlider = document.getElementById('gastroSlider');

    if (filterBtns.length > 0 && gastroItems.length > 0) {
        filterBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // 1. Clases activas
                filterBtns.forEach(f => f.classList.remove('active'));
                btn.classList.add('active');

                // 2. Obtener categoría
                const category = btn.getAttribute('data-filter');

                // 3. Reset scroll del slider
                if (gastroSlider) {
                    gastroSlider.scrollTo({ left: 0, behavior: 'smooth' });
                }

                // 4. Filtrar items con animación
                gastroItems.forEach(item => {
                    // Estado inicial de transición
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.9)';

                    setTimeout(() => {
                        const itemCat = item.getAttribute('data-category');

                        if (category === 'all' || itemCat === category) {
                            item.style.display = 'block';
                            // Pequeño delay para permitir que el display block renderice antes de la opacidad
                            requestAnimationFrame(() => {
                                item.style.opacity = '1';
                                item.style.transform = 'scale(1)';
                            });
                        } else {
                            item.style.display = 'none';
                        }
                    }, 300); // Esperar a que termine la transición de salida
                });
            });
        });
    }

    /* ****************************************************** */
    /* GSAP ANIMATIONS (PREMIUM SCROLL REVEALS)               */
    /* ****************************************************** */

    // Función centralizada para animaciones para mantener el código limpio
    // Función centralizada para animaciones (Clean Slate / Safe Mode)
    const runGSAPAnimations = () => {
        if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;

        gsap.registerPlugin(ScrollTrigger);

        // Helper para animaciones estándar "Fade Up"
        // 1. Ocultamos INMEDIATAMENTE los elementos para evitar el "FOUC" (Flash of Unstyled Content)
        // 2. Animamos hacia la visibilidad (gsap.to) cuando entran en el viewport
        const animateBatch = (selector, startTrigger = "top 125%") => {
            const elements = document.querySelectorAll(selector);
            if (elements.length === 0) return;

            // Ocultar inmediatamente
            gsap.set(elements, { opacity: 0, y: 20 });

            // Crear el trigger para revelarlos
            ScrollTrigger.batch(selector, {
                start: startTrigger,
                once: true,
                onEnter: batch => {
                    gsap.to(batch, {
                        opacity: 1,
                        y: 0,
                        stagger: 0.05,
                        duration: 0.4,
                        ease: "power3.out",
                        overwrite: true,
                        onComplete: () => {
                            gsap.set(batch, { clearProps: "all" });
                        }
                    });
                }
            });
        };

        // Helper para Headers
        const animateHeader = (selector, startTrigger = "top 125%") => {
            const el = document.querySelector(selector);
            if (!el) return;

            gsap.set(el, { opacity: 0, y: 10 });

            gsap.to(el, {
                opacity: 1,
                y: 0,
                duration: 0.6,
                ease: "power3.out",
                scrollTrigger: {
                    trigger: el,
                    start: startTrigger,
                    once: true,
                    onComplete: () => gsap.set(el, { clearProps: "all" })
                }
            });
        };

        // 1. APLICACION POR SECCIONES

        // EFECTO CINEMATOGRÁFICO HEADER (Zoom Out + Focus In)
        const headerBg = document.querySelector(".main-header");
        if (headerBg) {
            gsap.fromTo(headerBg,
                {
                    "--header-bg-scale": 1.15,
                    "--header-bg-blur": "10px"
                },
                {
                    "--header-bg-scale": 1,
                    "--header-bg-blur": "0px",
                    duration: 1.8,
                    ease: "power2.out"
                }
            );
        }

        // INDICADOR DE SCROLL MOVIL (MARQUEE INFINITO)
        // Solo si es móvil (< 768px)
        if (window.innerWidth < 768) {
            const catContainer = document.querySelector(".categories-container");
            if (catContainer) {
                // 0. DESHABILITAR SCROLL SNAP (Conflictos con GSAP)
                catContainer.style.scrollSnapType = 'none';

                // 1. Clonar contenido para efecto infinito
                // Clonamos 3 sets adicionales (x4 total) para asegurar "buffer" sobrado
                const items = Array.from(catContainer.children);
                for (let i = 0; i < 3; i++) {
                    items.forEach(item => catContainer.appendChild(item.cloneNode(true)));
                }

                // 2. Calcular loop preciso
                requestAnimationFrame(() => {
                    // La distancia del loop es la diferencia exacta entre el primer elemento y su primer clon.
                    // Esto incluye márgenes, paddings y gaps de forma nativa.
                    // El primer clon del Set 1 está en el índice items.length
                    if (!items.length) return;

                    const firstItem = items[0];
                    const firstClone = catContainer.children[items.length];

                    if (!firstClone) return; // Seguridad

                    const loopDistance = firstClone.offsetLeft - firstItem.offsetLeft;

                    // 3. Animar Scroll
                    const scrollTween = gsap.to(catContainer, {
                        scrollLeft: loopDistance,
                        duration: 45, // Ajustado para mantener velocidad constante con más items
                        ease: "none",
                        repeat: -1,
                        modifiers: {
                            scrollLeft: gsap.utils.unitize(x => parseFloat(x) % loopDistance)
                        }
                    });

                    // 4. Detener al interactuar (Touch/Click)
                    const killAnimation = () => {
                        scrollTween.kill();
                        // REACTIVAR SCROLL SNAP para UX nativa al deslizar manualmente
                        catContainer.style.scrollSnapType = 'x mandatory';

                        catContainer.removeEventListener("touchstart", killAnimation);
                        catContainer.removeEventListener("pointerdown", killAnimation);
                    };

                    catContainer.addEventListener("touchstart", killAnimation, { passive: true });
                    catContainer.addEventListener("pointerdown", killAnimation);
                });
            }
        }

        // MOBILE NAV LOGIC
        const mobileSearchBtn = document.getElementById('mobile-search-trigger');
        const mainHeader = document.querySelector('.main-header');

        if (mobileSearchBtn && mainHeader) {
            mobileSearchBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Evitar cierre inmediato
                mainHeader.classList.toggle('header-search-active');

                // Auto focus si se abre
                if (mainHeader.classList.contains('header-search-active')) {
                    const input = mainHeader.querySelector('input');
                    if (input) setTimeout(() => input.focus(), 100);

                    // Highlight botón
                    mobileSearchBtn.classList.add('active');
                } else {
                    mobileSearchBtn.classList.remove('active');
                }
            });

            // Cerrar al clickear afuera
            document.addEventListener('click', (e) => {
                if (mainHeader.classList.contains('header-search-active') &&
                    !mainHeader.contains(e.target) &&
                    !mobileSearchBtn.contains(e.target)) {
                    mainHeader.classList.remove('header-search-active');
                    mobileSearchBtn.classList.remove('active');
                }
            });
        }

        // Mobile Bottom Menu Trigger
        const mobileMenuBtn = document.getElementById('mobile-menu-trigger'); // Back to ID trigger
        if (mobileMenuBtn) {
            mobileMenuBtn.addEventListener('click', (e) => {
                e.preventDefault();
                // Call the function directly since we are in the same scope
                if (typeof toggleMenu === 'function') {
                    toggleMenu();
                } else {
                    // Fallback just in case
                    const menuOpenBtn = document.getElementById('menu-open');
                    if (menuOpenBtn) menuOpenBtn.click();
                }
            });
        }

        // --- MOBILE CATEGORIES MENU LOGIC ---
        const catsMenu = document.getElementById('categories-menu');
        const catsTrigger = document.getElementById('mobile-cat-trigger');
        const catsClose = document.getElementById('cats-close');
        const catsList = document.getElementById('mobile-cats-list');

        // Populate Function
        const populateMobileCats = () => {
            if (!catsList) return;
            // Clear first
            catsList.innerHTML = '';

            // Source items
            const sourceItems = document.querySelectorAll('.categories-container .category-item');
            const seenCategories = new Set(); // Track unique names

            sourceItems.forEach(item => {
                // Extract data
                const text = item.querySelector('span')?.innerText;
                const iconHTML = item.querySelector('.category-icon i, .category-icon svg')?.outerHTML; // Try both i and svg
                const href = item.getAttribute('href') || '#';

                // Only add if we haven't seen this category text before
                if (text && !seenCategories.has(text)) {
                    seenCategories.add(text);

                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = href;

                    // Create Icon
                    if (iconHTML) {
                        const iconContainer = document.createElement('div');
                        iconContainer.innerHTML = iconHTML;
                        // Move children to anchor
                        while (iconContainer.firstChild) {
                            a.appendChild(iconContainer.firstChild);
                        }
                    } else if (typeof lucide !== 'undefined') {
                        // Fallback icon if extraction fails
                        const i = document.createElement('i');
                        i.setAttribute('data-lucide', 'circle');
                        a.appendChild(i);
                    }

                    // Create Text
                    const span = document.createElement('span');
                    span.innerText = text;
                    a.appendChild(span);

                    li.appendChild(a);
                    catsList.appendChild(li);

                    // Close menu on click
                    a.addEventListener('click', () => toggleCatsMenu());
                }
            });

            // Re-run lucide if needed
            if (typeof lucide !== 'undefined') lucide.createIcons();
        };

        // Toggle Function
        function toggleCatsMenu() {
            if (!catsMenu) return;
            const isActive = catsMenu.classList.contains('show');

            if (isActive) {
                catsMenu.classList.remove('show');
                if (overlay) overlay.classList.remove('active');
                document.body.style.overflow = '';
                lenis.start();
            } else {
                // Update content dynamically just in case
                // populateMobileCats(); // Can call once on load, but calling here ensures it's fresh? calling once is better.

                catsMenu.classList.add('show');
                if (overlay) overlay.classList.add('active');
                document.body.style.overflow = 'hidden';
                lenis.stop();

                // Ensure main menu is closed if open
                if (navMenu && navMenu.classList.contains('show')) navMenu.classList.remove('show');
            }
        }

        // Init
        if (catsTrigger) {
            populateMobileCats(); // Run on load
            catsTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                toggleCatsMenu();
            });
        }

        if (catsClose) catsClose.addEventListener('click', toggleCatsMenu);
        // Overlay logic needs to handle both menus
        if (overlay) {
            // Remove old listener to avoid double toggle
            overlay.removeEventListener('click', toggleMenu);

            // New Generic Listener
            overlay.addEventListener('click', () => {
                if (navMenu && navMenu.classList.contains('show')) toggleMenu();
                if (catsMenu && catsMenu.classList.contains('show')) toggleCatsMenu();
            });
        }

        // Categorías
        animateBatch(".category-item");

        // Business Slider & Cards
        animateHeader(".business-slider-section .slider-header");
        animateBatch(".business-card-premium");

        // Farmacias
        animateHeader(".farmacias-section h2");
        animateBatch(".farmacia-card-today");
        animateBatch(".turno-row");

        // Gastronomía
        animateHeader(".gastro-title");
        animateBatch(".f-link");
        animateBatch(".g-item");

        // Arrivals (Nuevos)
        animateHeader(".new-arrivals-section .slider-header");
        animateBatch(".arrival-card");

        // Eventos
        animateHeader(".events-section h2");
        animateBatch(".event-card");

        // Essentials (Resolvé tu día)
        animateBatch(".essential-card");

        // Cine
        animateHeader(".cinema-header");
        animateBatch(".movie-card");

        // Business CTA (Texto e imagen por separado)
        animateHeader(".business-text");
        animateHeader(".business-image");
        animateBatch(".stat-card");

        // Survival Kit
        animateBatch(".kit-card-dark");

        // Empleos
        animateBatch(".job-card");


    };

    // Ejecutar animaciones asegurando que el layout esté listo
    // Usamos una bandera para evitar doble inicialización
    let animationsInitialized = false;

    const initAnimations = () => {
        if (animationsInitialized) return;
        animationsInitialized = true;

        runGSAPAnimations();

        // Forzar recálculo de ScrollTrigger una vez que todo está listo
        if (typeof ScrollTrigger !== 'undefined') {
            ScrollTrigger.refresh();
        }
    };

    if (document.readyState === 'complete') {
        initAnimations();
    } else {
        window.addEventListener('load', initAnimations);
    }

}); // Fin DOMContentLoaded


/* ****************************************************** */
/* FUNCIONES GLOBALES (EXPORTS PARA HTML ONCLICK)         */
/* ****************************************************** */

// Función para mover sliders con los botones laterales
window.scrollSlider = function (containerId, amount) {
    // Si el primer parámetro es un número, asumimos que es para el slider principal (businessSlider)
    // Esto es para mantener la compatibilidad con el código anterior: onclick="scrollSlider(-1)"
    if (typeof containerId === 'number') {
        const wrapper = document.getElementById('businessSlider');
        if (wrapper) {
            // El 'amount' es el id (ahora amount multiplier)
            const scrollAmount = wrapper.clientWidth * 0.8;
            wrapper.scrollBy({ left: containerId * scrollAmount, behavior: 'smooth' });
        }
    } else {
        // Uso normal: scrollSlider('id', 400)
        const slider = document.getElementById(containerId);
        if (slider) {
            slider.scrollBy({ left: amount, behavior: 'smooth' });
        }
    }
};
