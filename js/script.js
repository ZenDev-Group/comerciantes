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
