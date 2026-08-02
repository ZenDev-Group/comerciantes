// Cliente de la API pública de Web-MVP (comerciantes.com.ar).
// Mismo backend y mismo contrato que ya consume la app móvil (comerciantes-app).
const API_BASE_URL = 'https://backend-production-196c.up.railway.app';

async function apiGet(path) {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    throw new Error(`Error ${response.status} al llamar ${path}`);
  }
  return response.json();
}

function fetchComercios(filtros = {}) {
  const params = new URLSearchParams();
  if (filtros.categoria) params.set('categoria', filtros.categoria);
  if (filtros.localidad) params.set('localidad', String(filtros.localidad));
  if (filtros.agro !== undefined) params.set('agro', filtros.agro ? '1' : '0');
  if (filtros.q) params.set('q', filtros.q);

  const query = params.toString();
  return apiGet(`/api/comercios${query ? `?${query}` : ''}`);
}

function fetchComercio(id) {
  return apiGet(`/api/comercios/${id}`);
}

function fetchCategorias() {
  return apiGet('/api/categorias');
}
