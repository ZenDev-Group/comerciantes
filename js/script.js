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

        // Añadido para mejor sincronización
        gsap.ticker.add((time) => {
            lenis.raf(time * 1000);
        });
        gsap.ticker.lagSmoothing(0);
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
    /* HEADER DINÁMICO (STICKY) CON LENIS                     */
    /* ****************************************************** */
    const header = document.getElementById('dynamic-header');

    if (header) {
        // Usamos el evento scroll de Lenis para mayor precisión
        lenis.on('scroll', ({ scroll }) => {
            // Umbral de activación (Ajustado ligeramente para que el efecto sea más natural)
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
