// Conecta la guía a los datos reales de Web-MVP: categorías, listados y búsqueda.
// Reemplaza el contenido de mockup (fotos de Unsplash, negocios inventados) por
// comercios reales. Un comercio PREMIUM es un link real a su ficha completa en
// single-comercio (URL propia, indexable y compartible); un comercio sin ficha
// completa abre acá mismo el modal de "ficha gratis" (ver conectarInteraccionTarjetas).

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

  // Un comercio SIN plan premium no tiene ficha completa en single-comercio (server-side
  // gate) - su tarjeta ya no navega ahí, abre el modal de ficha gratis en esta misma página
  // (sección 2 del plan de tarjetas/landing). El href real solo se arma para comercios
  // premium; el resto queda con "#" como no-op de respaldo si el JS tardara en engancharse.
  function esPremiumReal(c) {
    return typeof c.plan === 'string' && c.plan.startsWith('premium');
  }

  function hrefTarjeta(c) {
    return esPremiumReal(c) ? `${URL_BASE_FICHA}${c.id}` : '#';
  }

  function tarjetaPremium(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <a class="business-card-premium tarjeta-comercio" href="${hrefTarjeta(c)}">
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
      <a class="g-item tarjeta-comercio ${destacado ? 'gold' : ''}" href="${hrefTarjeta(c)}">
        <div class="g-image">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : `<div class="foto-vacia-p"><i data-lucide="utensils"></i></div>`}
          ${destacado ? '<span class="g-tag">Destacado</span>' : ''}
        </div>
        <div class="g-meta">
          <span class="g-type">${c.categoria_nombre || 'Gastronomía'}</span>
          <h3>${c.nombre_negocio}</h3>
          <p>${c.descripcion || ''}</p>
          <div class="g-footer">
            <span class="g-loc">${c.localidad_nombre || c.direccion || 'Colón'}</span>
            <span class="g-btn-wsp">Ver más</span>
          </div>
        </div>
      </a>`;
  }

  function tarjetaArrival(c, etiqueta) {
    return `
      <a class="arrival-card tarjeta-comercio" href="${hrefTarjeta(c)}">
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
      <a class="essential-card tarjeta-comercio color-${indiceColor}" href="${hrefTarjeta(c)}">
        <div class="essential-text">
          <span class="ess-tag">${c.categoria_nombre || 'Servicio'}</span>
          <h3>${c.nombre_negocio}</h3>
          <p>${c.descripcion || ''}</p>
          <span class="ess-btn">Ver más</span>
        </div>
        <div class="essential-img">
          ${c.foto_portada
            ? `<img src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
            : `<div class="foto-vacia-p"><i data-lucide="wrench"></i></div>`}
        </div>
      </a>`;
  }

  function tarjetaResultado(c) {
    const destacado = c.plan && c.plan !== 'gratuito';
    return `
      <a class="resultado-card tarjeta-comercio" href="${hrefTarjeta(c)}">
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
  // Interacción de las tarjetas: un comercio PREMIUM navega de verdad a su
  // ficha completa en single-comercio (URL propia, indexable, compartible).
  // Un comercio SIN ficha completa (gratuito/destacado) abre en su lugar el
  // modal de "ficha gratis" acá mismo, con solo la info que permite ese plan
  // (sección 2 del plan de tarjetas/landing) - evita mandarlo a una pantalla
  // de upsell en otro dominio por un clic que no lo esperaba.
  // Cada clic sobre una tarjeta no-premium también cuenta como "clic perdido"
  // (sección 5.2) para el reporte del admin.
  // ------------------------------------------------------------------

  function conectarInteraccionTarjetas(cont, lista) {
    if (!cont || !Array.isArray(lista)) return;
    const links = cont.querySelectorAll('a.tarjeta-comercio');
    links.forEach((link, i) => {
      const c = lista[i];
      if (!c || esPremiumReal(c)) return; // navegación real a la ficha, sin modal
      link.addEventListener('click', (e) => {
        e.preventDefault();
        registrarEvento('click_ver_mas', { comercio_id: c.id, origen: 'comerciantes' });
        abrirModalFichaGratis(c);
      });
    });
  }

  // ------------------------------------------------------------------
  // Modal de "ficha gratis" (bottom sheet ya existente en el HTML/CSS,
  // antes sin usar) - solo la info que la matriz del plan permite en el
  // plan gratuito: foto/logo, categoría, nombre, dirección y descripción.
  // Sin WhatsApp/llamar/mapa/galería - eso es exclusivo de la ficha completa.
  // ------------------------------------------------------------------

  let comercioModalActual = null;

  function abrirModalFichaGratis(c) {
    comercioModalActual = c;

    // Portada de doble capa: fondo desenfocado (cubre todo el ancho sin importar la
    // proporción de la foto real) + la misma imagen nítida flotando encima, en vez de
    // recortarla a la fuerza con object-fit:cover (que rompía logos verticales/cuadrados).
    const fotoCont = document.getElementById('modal-ficha-foto');
    fotoCont.innerHTML = c.foto_portada
      ? `<div class="ficha-portada-bg" style="background-image: url('${c.foto_portada}')"></div>
         <img class="ficha-portada-logo" src="${c.foto_portada}" alt="${c.nombre_negocio}" loading="lazy">`
      : `<div class="foto-vacia-p"><i data-lucide="store"></i></div>`;

    document.getElementById('modal-ficha-categoria').textContent = c.categoria_nombre || 'Comercio';

    const destacado = c.plan && c.plan !== 'gratuito';
    document.getElementById('modal-ficha-badge').style.display = destacado ? 'inline-flex' : 'none';

    document.getElementById('modal-ficha-nombre').textContent = c.nombre_negocio;

    const localidadTexto = c.localidad_nombre || c.direccion;
    const localidadCont = document.getElementById('modal-ficha-localidad');
    if (localidadTexto) {
      document.getElementById('modal-ficha-localidad-texto').textContent = localidadTexto;
      localidadCont.style.display = 'flex';
    } else {
      localidadCont.style.display = 'none';
    }

    document.getElementById('modal-ficha-descripcion').textContent =
      c.descripcion || 'Todavía no cargó una descripción en la guía.';

    // Reset del bloque de reclamo cada vez que se abre para un comercio distinto.
    document.getElementById('modal-btn-reclamar').style.display = 'flex'; // .reclamar-perfil-btn es flex (icono + texto)
    const form = document.getElementById('modal-form-reclamar');
    form.reset();
    form.style.display = 'none';
    document.getElementById('modal-reclamar-error').style.display = 'none';
    document.getElementById('modal-reclamar-exito').style.display = 'none';

    refrescarIconos();
    if (typeof window.abrirFichaGratisModal === 'function') window.abrirFichaGratisModal();
  }

  function conectarModalReclamo() {
    const btnAbrir = document.getElementById('modal-btn-reclamar');
    const form = document.getElementById('modal-form-reclamar');
    const errorEl = document.getElementById('modal-reclamar-error');
    const exitoEl = document.getElementById('modal-reclamar-exito');
    if (!btnAbrir || !form) return;

    btnAbrir.addEventListener('click', () => {
      btnAbrir.style.display = 'none';
      form.style.display = 'flex';
      if (comercioModalActual) {
        registrarEvento('click_reclamar_perfil', { comercio_id: comercioModalActual.id, origen: 'comerciantes' });
      }
    });

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      errorEl.style.display = 'none';
      if (!comercioModalActual) return;

      const nombre = document.getElementById('modal-reclamar-nombre').value.trim();
      const telefono = document.getElementById('modal-reclamar-telefono').value.trim();
      const email = document.getElementById('modal-reclamar-email').value.trim();
      const mensaje = document.getElementById('modal-reclamar-mensaje').value.trim();

      if (!nombre || (!telefono && !email)) {
        errorEl.textContent = 'Ingresá tu nombre y al menos un teléfono o email de contacto.';
        errorEl.style.display = 'block';
        return;
      }

      try {
        await reclamarPerfil(comercioModalActual.id, { nombre, telefono, email, mensaje });
        form.style.display = 'none';
        exitoEl.style.display = 'flex'; // .reclamar-exito es flex-column, no block
      } catch (err) {
        errorEl.textContent = err.message || 'No pudimos enviar el reclamo, probá de nuevo.';
        errorEl.style.display = 'block';
      }
    });
  }
  conectarModalReclamo();

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
      conectarInteraccionTarjetas(cont, lista);
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
      conectarInteraccionTarjetas(cont, comercios);
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
      conectarInteraccionTarjetas(cont, recientes);
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
      conectarInteraccionTarjetas(cont, comercios);
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
      conectarInteraccionTarjetas(cont, comercios);
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
      conectarInteraccionTarjetas(resultadosGrid, comercios);
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
      temporizador = setTimeout(() => {
        registrarEvento('busqueda', { termino_busqueda: valor, origen: 'comerciantes' });
        mostrarResultados(null, null, valor);
      }, 400);
    });
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const valor = input.value.trim();
        if (valor) {
          if (temporizador) clearTimeout(temporizador);
          registrarEvento('busqueda', { termino_busqueda: valor, origen: 'comerciantes' });
          mostrarResultados(null, null, valor);
        }
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
