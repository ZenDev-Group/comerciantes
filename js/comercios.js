// Conecta la guía a los datos reales de Web-MVP: categorías, listados y búsqueda.
// Reemplaza el contenido de mockup (fotos de Unsplash, negocios inventados) por
// comercios reales. Cada tarjeta es un link real a su ficha en single-comercio
// (URL propia por comercio, indexable y compartible) en vez de abrir un modal.

const URL_BASE_FICHA = 'https://single-comercio.vercel.app/comercio/';

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
  // ahora como links reales <a> a la ficha del comercio en single-comercio).
  // ------------------------------------------------------------------

  function tarjetaPremium(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <a class="business-card-premium" href="${URL_BASE_FICHA}${c.id}">
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
          </div>
        </div>
      </a>`;
  }

  function tarjetaGastro(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <a class="g-item ${destacado ? 'gold' : ''}" href="${URL_BASE_FICHA}${c.id}">
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
      </a>`;
  }

  function tarjetaArrival(c, etiqueta) {
    return `
      <a class="arrival-card" href="${URL_BASE_FICHA}${c.id}">
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
      </a>`;
  }

  function tarjetaEssential(c, indiceColor) {
    return `
      <a class="essential-card color-${indiceColor}" href="${URL_BASE_FICHA}${c.id}">
        <div class="essential-text">
          <span class="ess-tag">${c.categoria_nombre || 'Servicio'}</span>
          <h3>${c.nombre_negocio}</h3>
          <p>${c.descripcion || ''}</p>
          <span class="ess-btn">Ver más</span>
        </div>
        <div class="essential-img">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : ''}
        </div>
      </a>`;
  }

  function tarjetaResultado(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <a class="resultado-card" href="${URL_BASE_FICHA}${c.id}">
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
      </a>`;
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
