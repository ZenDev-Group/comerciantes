// Conecta la guía a los datos reales de Web-MVP: categorías, listados y ficha de
// comercio. Reemplaza el contenido de mockup (fotos de Unsplash, negocios inventados)
// por comercios reales, y reutiliza el modal "universal" ya existente en el HTML
// para mostrar la ficha completa en vez del placeholder inerte.

document.addEventListener('DOMContentLoaded', () => {
  const ICONO_CATEGORIA = {
    gastronomia: 'utensils',
    comerciantes: 'store',
    artesanias: 'palette',
    servicios: 'wrench',
    indumentaria: 'shirt',
    agro: 'tractor',
    otros: 'package',
  };

  const refrescarIconos = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
  };

  // ------------------------------------------------------------------
  // Plantillas de tarjeta (misma clase/markup que ya usa el diseño premium,
  // solo que ahora con datos reales en vez de hardcodeados).
  // ------------------------------------------------------------------

  function tarjetaPremium(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    const whatsapp = c.whatsapp
      ? `<a href="https://wa.me/${c.whatsapp.replace(/\D/g, '')}" class="btn-wsp-p" target="_blank" rel="noopener">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" /><path d="M8 12h.01" /><path d="M12 12h.01" /><path d="M16 12h.01" />
          </svg>
        </a>`
      : '';
    return `
      <div class="business-card-premium" data-comercio-id="${c.id}" role="button" tabindex="0">
        <span class="category-badge-p">${c.categoria_nombre || 'Comercio'}</span>
        ${destacado ? '<span class="cinta-destacado">Destacado</span>' : ''}
        ${c.foto_portada
          ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
          : `<div class="foto-vacia-p"><i data-lucide="store"></i></div>`}
        <div class="card-content-p">
          <h3>${c.nombre_negocio}</h3>
          <p>${c.descripcion || ''}</p>
          <div class="card-actions">
            <span class="btn-ver-p">Ver comercio</span>
            ${whatsapp}
          </div>
        </div>
      </div>`;
  }

  function tarjetaGastro(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <article class="g-item ${destacado ? 'gold' : ''}" data-comercio-id="${c.id}" role="button" tabindex="0">
        <div class="g-image">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : `<div class="foto-vacia-p"><i data-lucide="utensils"></i></div>`}
          ${destacado ? '<span class="g-tag">Destacado</span>' : ''}
        </div>
        <div class="g-meta">
          <span class="g-type">${c.categoria_nombre || 'Gastronomía'}</span>
          <h3>${c.nombre_negocio}</h3>
          <div class="g-footer">
            <span class="g-loc">${c.localidad_nombre || c.direccion || 'Colón'}</span>
            <span class="g-btn-wsp">Ver más</span>
          </div>
        </div>
      </article>`;
  }

  function tarjetaArrival(c, etiqueta) {
    return `
      <div class="arrival-card" data-comercio-id="${c.id}" role="button" tabindex="0">
        <div class="arrival-img">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : `<div class="foto-vacia-p"><i data-lucide="store"></i></div>`}
          ${etiqueta ? `<span class="new-badge">${etiqueta}</span>` : ''}
        </div>
        <div class="arrival-info">
          <span class="arrival-cat">${c.categoria_nombre || 'Comercio'}</span>
          <h3>${c.nombre_negocio}</h3>
          <p>${c.descripcion || ''}</p>
          <div class="arrival-footer">
            <span class="arrival-date"><i data-lucide="map-pin"></i> ${c.localidad_nombre || 'Colón'}</span>
            <span class="btn-link"><i data-lucide="chevron-right"></i></span>
          </div>
        </div>
      </div>`;
  }

  function tarjetaEssential(c, indiceColor) {
    return `
      <div class="essential-card color-${indiceColor}" data-comercio-id="${c.id}" role="button" tabindex="0">
        <div class="essential-text">
          <span class="ess-tag">${c.categoria_nombre || 'Servicio'}</span>
          <h3>${c.nombre_negocio}</h3>
          <p>${c.descripcion || ''}</p>
          <span class="ess-btn">Contactar</span>
        </div>
        <div class="essential-img">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : ''}
        </div>
      </div>`;
  }

  function tarjetaResultado(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <div class="resultado-card" data-comercio-id="${c.id}" role="button" tabindex="0">
        <div class="resultado-foto">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : `<div class="foto-vacia-p"><i data-lucide="store"></i></div>`}
          ${destacado ? '<span class="cinta-destacado">Destacado</span>' : ''}
        </div>
        <div class="resultado-info">
          <span class="resultado-categoria">${c.categoria_nombre || 'Comercio'}</span>
          <h3>${c.nombre_negocio}</h3>
          ${c.descripcion ? `<p>${c.descripcion}</p>` : ''}
          ${c.localidad_nombre
            ? `<span class="resultado-loc"><i data-lucide="map-pin"></i> ${c.localidad_nombre}</span>`
            : ''}
        </div>
      </div>`;
  }

  // ------------------------------------------------------------------
  // Carga de secciones reales (reemplazan el contenido hardcodeado)
  // ------------------------------------------------------------------

  async function cargarDestacados() {
    const cont = document.getElementById('businessSlider');
    if (!cont) return;
    try {
      const todos = await fetchComercios();
      const destacados = todos
        .filter((c) => c.plan && c.plan !== 'gratuito')
        .sort((a, b) => (b.id || 0) - (a.id || 0))
        .slice(0, 12);
      const lista = destacados.length ? destacados : todos.slice(0, 8);
      cont.innerHTML = lista.map(tarjetaPremium).join('') || '<p class="sin-resultados">Todavía no hay comercios cargados.</p>';
      refrescarIconos();
    } catch (e) {
      cont.innerHTML = '<p class="sin-resultados">No pudimos cargar los comercios destacados.</p>';
    }
  }

  async function cargarGastronomia() {
    const cont = document.getElementById('gastroSlider');
    if (!cont) return;
    try {
      const comercios = await fetchComercios({ categoria: 'gastronomia' });
      cont.innerHTML = comercios.map(tarjetaGastro).join('') || '<p class="sin-resultados">Todavía no hay comercios gastronómicos cargados.</p>';
      refrescarIconos();
    } catch (e) {
      cont.innerHTML = '<p class="sin-resultados">No pudimos cargar la sección de gastronomía.</p>';
    }
  }

  async function cargarRecientes() {
    const cont = document.getElementById('arrivalsGridRecientes');
    if (!cont) return;
    try {
      const todos = await fetchComercios();
      const recientes = [...todos].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 8);
      cont.innerHTML = recientes.map((c) => tarjetaArrival(c, '¡NUEVO EN LA GUÍA!')).join('') || '<p class="sin-resultados">Todavía no hay comercios cargados.</p>';
      refrescarIconos();
    } catch (e) {
      cont.innerHTML = '<p class="sin-resultados">No pudimos cargar los últimos comercios sumados.</p>';
    }
  }

  async function cargarModa() {
    const cont = document.getElementById('arrivalsGridModa');
    if (!cont) return;
    try {
      const comercios = await fetchComercios({ categoria: 'indumentaria' });
      cont.innerHTML = comercios.map((c) => tarjetaArrival(c)).join('') || '<p class="sin-resultados">Todavía no hay comercios de indumentaria cargados.</p>';
      refrescarIconos();
    } catch (e) {
      cont.innerHTML = '<p class="sin-resultados">No pudimos cargar la sección de indumentaria.</p>';
    }
  }

  async function cargarServicios() {
    const cont = document.getElementById('essentials-wrapper');
    if (!cont) return;
    try {
      const comercios = await fetchComercios({ categoria: 'servicios' });
      cont.innerHTML = comercios.map((c, i) => tarjetaEssential(c, (i % 6) + 1)).join('') || '<p class="sin-resultados">Todavía no hay servicios cargados.</p>';
      refrescarIconos();
    } catch (e) {
      cont.innerHTML = '<p class="sin-resultados">No pudimos cargar la sección de servicios.</p>';
    }
  }

  // ------------------------------------------------------------------
  // Categorías reales - reemplazan las 7 categorías inventadas, tanto en
  // el rail de íconos de escritorio como en el sidebar móvil.
  // ------------------------------------------------------------------

  async function cargarCategorias() {
    const cont = document.querySelector('#categorias .categories-container');
    const listaMobile = document.getElementById('mobile-cats-list');
    if (!cont) return;
    try {
      const categorias = await fetchCategorias();
      cont.innerHTML = categorias
        .map(
          (cat) => `
        <a href="#" class="category-item" data-categoria="${cat.slug}">
          <div class="category-icon"><i data-lucide="${ICONO_CATEGORIA[cat.slug] || 'tag'}"></i></div>
          <span>${cat.nombre}</span>
        </a>`
        )
        .join('');

      if (listaMobile) {
        listaMobile.innerHTML = categorias
          .map(
            (cat) => `
          <li>
            <a href="#" data-categoria="${cat.slug}">
              <i data-lucide="${ICONO_CATEGORIA[cat.slug] || 'tag'}"></i>
              <span>${cat.nombre}</span>
            </a>
          </li>`
          )
          .join('');

        listaMobile.querySelectorAll('a[data-categoria]').forEach((a) => {
          a.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('cats-close')?.click();
            mostrarResultados(a.dataset.categoria, a.querySelector('span').textContent);
          });
        });
      }

      cont.querySelectorAll('.category-item').forEach((item) => {
        item.addEventListener('click', (e) => {
          e.preventDefault();
          mostrarResultados(item.dataset.categoria, item.querySelector('span').textContent);
        });
      });

      refrescarIconos();
    } catch (e) {
      // Si falla, se quedan las 7 categorías de mockup como respaldo visual.
    }
  }

  // ------------------------------------------------------------------
  // Sección de resultados (búsqueda y filtro por categoría) - estilo grilla,
  // igual que el buscador de MercadoLibre/Airbnb: un listado plano de
  // resultados reales en vez de navegar a otra página.
  // ------------------------------------------------------------------

  const resultadosSection = document.getElementById('resultados-busqueda');
  const resultadosGrid = document.getElementById('resultados-grid');
  const resultadosTitulo = document.getElementById('resultados-titulo');
  const resultadosCerrar = document.getElementById('resultados-cerrar');

  async function mostrarResultados(categoria, tituloCategoria, q) {
    if (!resultadosSection || !resultadosGrid) return;
    resultadosSection.style.display = 'block';
    resultadosTitulo.textContent = q
      ? `Resultados para "${q}"`
      : tituloCategoria
      ? tituloCategoria
      : 'Todos los comercios';
    resultadosGrid.innerHTML = '<p class="sin-resultados">Buscando...</p>';
    resultadosSection.scrollIntoView({ behavior: 'smooth', block: 'start' });

    try {
      const comercios = await fetchComercios({ categoria: categoria || undefined, q: q || undefined });
      resultadosGrid.innerHTML = comercios.length
        ? comercios.map(tarjetaResultado).join('')
        : '<p class="sin-resultados">No encontramos comercios que coincidan con tu búsqueda.</p>';
      refrescarIconos();
    } catch (e) {
      resultadosGrid.innerHTML = '<p class="sin-resultados">No pudimos cargar los resultados. Revisá tu conexión.</p>';
    }
  }
  window.mostrarResultados = mostrarResultados;

  if (resultadosCerrar) {
    resultadosCerrar.addEventListener('click', () => {
      resultadosSection.style.display = 'none';
      document.getElementById('categorias')?.scrollIntoView({ behavior: 'smooth' });
    });
  }

  // ------------------------------------------------------------------
  // Buscador real (hero + header flotante) - con debounce, como
  // el buscador principal de MercadoLibre.
  // ------------------------------------------------------------------

  function conectarBuscador(input) {
    if (!input) return;
    let temporizador = null;
    input.addEventListener('input', () => {
      const valor = input.value.trim();
      if (temporizador) clearTimeout(temporizador);
      if (!valor) {
        if (resultadosSection) resultadosSection.style.display = 'none';
        return;
      }
      temporizador = setTimeout(() => mostrarResultados(null, null, valor), 400);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (input.value.trim()) mostrarResultados(null, null, input.value.trim());
      }
    });
  }

  document.querySelectorAll('.search-wrapper input').forEach(conectarBuscador);

  // ------------------------------------------------------------------
  // Ficha real del comercio (reemplaza el modal placeholder inerte)
  // ------------------------------------------------------------------

  const universalModal = document.getElementById('universal-modal');
  const modalBackdrop = document.getElementById('modal-backdrop');
  const modalSheet = document.getElementById('modal-sheet');
  const modalContent = document.getElementById('modal-content');
  const modalCloseBtn = document.getElementById('modal-close');

  function abrirModal() {
    if (!universalModal || !modalSheet || !modalBackdrop) return;
    universalModal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    if (typeof gsap !== 'undefined') {
      gsap.set(modalBackdrop, { opacity: 0 });
      gsap.set(modalSheet, { y: '100%' });
      gsap.to(modalBackdrop, { opacity: 1, duration: 0.3, ease: 'power2.out' });
      gsap.to(modalSheet, { y: '0%', duration: 0.5, ease: 'power3.out' });
    }
  }

  function cerrarModal() {
    if (!universalModal) return;
    const finalizar = () => {
      universalModal.style.display = 'none';
      document.body.style.overflow = '';
    };
    if (typeof gsap !== 'undefined') {
      gsap.to(modalSheet, { y: '100%', duration: 0.4, ease: 'power2.in' });
      gsap.to(modalBackdrop, { opacity: 0, duration: 0.3, onComplete: finalizar });
    } else {
      finalizar();
    }
  }

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', cerrarModal);
  if (modalBackdrop) modalBackdrop.addEventListener('click', cerrarModal);
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && universalModal && universalModal.style.display === 'block') cerrarModal();
  });

  function renderRedes(c) {
    const redes = [];
    if (c.instagram) {
      redes.push(
        `<a href="https://instagram.com/${c.instagram.replace('@', '')}" target="_blank" rel="noopener" class="ficha-red">Instagram</a>`
      );
    }
    if (c.facebook) redes.push(`<a href="${c.facebook}" target="_blank" rel="noopener" class="ficha-red">Facebook</a>`);
    if (c.sitio_web) redes.push(`<a href="${c.sitio_web}" target="_blank" rel="noopener" class="ficha-red">Sitio web</a>`);
    return redes.length ? `<div class="ficha-redes">${redes.join('')}</div>` : '';
  }

  function renderFicha(c) {
    const esPago = !!c.plan_info && c.plan_info.plan_slug !== 'gratuito';
    const fotos = c.fotos && c.fotos.length ? c.fotos.map((f) => f.url) : c.foto_portada ? [c.foto_portada] : [];
    const numeroWhatsapp = c.whatsapp ? c.whatsapp.replace(/\D/g, '') : null;
    const mapaUrl =
      c.latitud && c.longitud
        ? `https://www.google.com/maps/search/?api=1&query=${c.latitud},${c.longitud}`
        : null;

    return `
      <div class="ficha-comercio ${esPago ? 'ficha-con-cta' : ''}">
        ${
          fotos.length
            ? `<div class="ficha-galeria">${fotos.map((url) => `<img src="${url}" alt="${c.nombre_negocio}" loading="lazy">`).join('')}</div>`
            : `<div class="ficha-galeria-vacia"><i data-lucide="store"></i></div>`
        }

        <div class="ficha-fila-categoria">
          <span class="ficha-categoria">${c.categoria_nombre || 'Comercio'}</span>
          ${esPago ? '<span class="ficha-badge-destacado"><i data-lucide="star"></i> Destacado</span>' : ''}
        </div>
        <h2 class="ficha-nombre">${c.nombre_negocio}</h2>
        ${c.localidad_nombre ? `<p class="ficha-localidad"><i data-lucide="map-pin"></i> ${c.localidad_nombre}</p>` : ''}
        ${c.descripcion ? `<p class="ficha-descripcion">${c.descripcion}</p>` : ''}

        ${c.horarios ? `<div class="ficha-bloque"><h4>Horarios</h4><p>${c.horarios}</p></div>` : ''}
        <div class="ficha-bloque"><h4>Ubicación</h4><p>${c.direccion || 'Colón, Buenos Aires'}</p></div>

        ${renderRedes(c)}

        ${
          !esPago
            ? '<p class="ficha-aviso-freemium">Este comercio todavía no tiene contacto directo habilitado.</p>'
            : `<div class="ficha-cta-bar">
                <a href="tel:${c.telefono}" class="ficha-cta-btn"><i data-lucide="phone"></i> Llamar</a>
                ${numeroWhatsapp ? `<a href="https://wa.me/${numeroWhatsapp}" target="_blank" rel="noopener" class="ficha-cta-btn ficha-cta-whatsapp"><i data-lucide="message-circle"></i> WhatsApp</a>` : ''}
                ${mapaUrl ? `<a href="${mapaUrl}" target="_blank" rel="noopener" class="ficha-cta-btn"><i data-lucide="navigation"></i> Cómo llegar</a>` : ''}
              </div>`
        }
      </div>`;
  }

  async function abrirFicha(id) {
    abrirModal();
    modalContent.innerHTML = `
      <div class="ficha-cargando">
        <div class="ficha-galeria-vacia"></div>
      </div>`;
    try {
      const comercio = await fetchComercio(id);
      modalContent.innerHTML = renderFicha(comercio);
      refrescarIconos();
    } catch (e) {
      modalContent.innerHTML = '<p class="sin-resultados">No pudimos cargar este comercio. Probá de nuevo en un momento.</p>';
    }
  }

  // Delegación de eventos: cualquier tarjeta renderizada con datos reales
  // (ahora o en el futuro) abre la ficha real, sin importar en qué sección esté.
  document.body.addEventListener('click', (e) => {
    const tarjeta = e.target.closest('[data-comercio-id]');
    if (!tarjeta) return;
    e.preventDefault();
    e.stopPropagation();
    abrirFicha(tarjeta.dataset.comercioId);
  });
  document.body.addEventListener('keydown', (e) => {
    if (e.key !== 'Enter') return;
    const tarjeta = e.target.closest('[data-comercio-id]');
    if (!tarjeta) return;
    abrirFicha(tarjeta.dataset.comercioId);
  });

  // Enlace "+ Sumar mi Comercio" -> alta real en Web-MVP.
  document.querySelectorAll('.btn-add-biz').forEach((a) => {
    a.setAttribute('href', 'https://comerciantes-web-mvp.vercel.app/suscripciones.html');
    a.removeAttribute('target');
  });

  // ------------------------------------------------------------------
  cargarCategorias();
  cargarDestacados();
  cargarGastronomia();
  cargarRecientes();
  cargarModa();
  cargarServicios();
});
