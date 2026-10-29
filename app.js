// app.js - Lógica de carregamento, filtros em cascata e renderização

let estabelecimentos = [];

// Carrega os dados do arquivo 'dados.json'
async function carregarDados() {
  try {
    const response = await fetch('dados.json');
    if (!response.ok) throw new Error('Não foi possível carregar o arquivo dados.json');
    estabelecimentos = await response.json();
  } catch (error) {
    console.error('Erro ao ler dados.json:', error);
    estabelecimentos = [];
  }
  popularEstados();
  popularCategorias();
  aplicarFiltros();
}

// Popula o seletor de Estados (UF)
function popularEstados() {
  const ufFilter = document.getElementById('ufFilter');
  if (!ufFilter) return;

  const ufs = [...new Set(estabelecimentos.map(item => item.estado).filter(Boolean))].sort();
  ufFilter.innerHTML = '<option value="">Todos os Estados</option>';
  ufs.forEach(uf => {
    const opt = document.createElement('option');
    opt.value = uf;
    opt.textContent = uf;
    ufFilter.appendChild(opt);
  });

  atualizarCidades();
}

// Atualiza Cidades conforme o Estado selecionado
function atualizarCidades() {
  const uf = document.getElementById('ufFilter').value;
  const cityFilter = document.getElementById('cityFilter');
  if (!cityFilter) return;

  const cidadesFiltradas = estabelecimentos
    .filter(item => !uf || item.estado === uf)
    .map(item => item.cidade)
    .filter(Boolean);

  const cidades = [...new Set(cidadesFiltradas)].sort();
  cityFilter.innerHTML = '<option value="">Todas as Cidades</option>';
  cidades.forEach(cid => {
    const opt = document.createElement('option');
    opt.value = cid;
    opt.textContent = cid;
    cityFilter.appendChild(opt);
  });

  atualizarBairros();
}

// Atualiza Bairros conforme Estado e Cidade selecionados
function atualizarBairros() {
  const uf = document.getElementById('ufFilter').value;
  const cidade = document.getElementById('cityFilter').value;
  const bairroFilter = document.getElementById('bairroFilter');
  if (!bairroFilter) return;

  const bairrosFiltrados = estabelecimentos
    .filter(item => (!uf || item.estado === uf) && (!cidade || item.cidade === cidade))
    .map(item => item.bairro)
    .filter(Boolean);

  const bairros = [...new Set(bairrosFiltrados)].sort();
  bairroFilter.innerHTML = '<option value="">Todos os Bairros</option>';
  bairros.forEach(b => {
    const opt = document.createElement('option');
    opt.value = b;
    opt.textContent = b;
    bairroFilter.appendChild(opt);
  });

  aplicarFiltros();
}

// Popula as Categorias
function popularCategorias() {
  const categoryFilter = document.getElementById('categoryFilter');
  if (!categoryFilter) return;

  const categorias = [...new Set(estabelecimentos.map(item => item.categoria).filter(Boolean))].sort();
  categoryFilter.innerHTML = '<option value="">Todas as Categorias</option>';
  categorias.forEach(cat => {
    const opt = document.createElement('option');
    opt.value = cat;
    opt.textContent = cat;
    categoryFilter.appendChild(opt);
  });
}

// Renderização dos cards no grid
function renderizar(lista) {
  const grid = document.getElementById('cardsGrid');
  const emptyState = document.getElementById('emptyState');
  const resultsCount = document.getElementById('resultsCount');
  const resetBtn = document.getElementById('resetFilters');

  if (!grid) return;
  grid.innerHTML = '';
  resultsCount.textContent = `Mostrando ${lista.length} de ${estabelecimentos.length} estabelecimento(s)`;

  const hasActiveFilter = 
    document.getElementById('searchInput').value !== '' ||
    document.getElementById('ufFilter').value !== '' ||
    document.getElementById('cityFilter').value !== '' ||
    document.getElementById('bairroFilter').value !== '' ||
    document.getElementById('categoryFilter').value !== '' ||
    document.getElementById('deliveryFilter').checked;

  resetBtn.classList.toggle('hidden', !hasActiveFilter);

  if (lista.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  emptyState.classList.add('hidden');

  lista.forEach(item => {
    const card = document.createElement('div');
    card.className = "card-item bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between";
    
    const cleanPhone = (item.whatsapp || '').replace(/\D/g, '');
    const cleanInsta = (item.instagram || '').replace('@', '').trim();
    const temEntrega = item.temEntrega ?? item.precisaEntrega ?? false;

    card.innerHTML = `
      <div>
        <div class="flex items-center justify-between gap-2 mb-2.5">
          <span class="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200/50">
            ${item.categoria || 'Geral'}
          </span>
          <span class="text-xs text-slate-500 font-medium flex items-center gap-1">
            <i class="fa-solid fa-location-dot text-rose-500"></i>
            ${item.bairro ? item.bairro + ' &bull; ' : ''}${item.cidade || ''}/${item.estado || ''}
          </span>
        </div>
        
        <h2 class="text-lg font-bold text-slate-800 mb-1 leading-snug">${item.nome}</h2>
        <p class="text-xs text-slate-600 mb-4 line-clamp-3 leading-relaxed">${item.descricao || 'Atendimento comercial ativo via canais digitais e entregas parceiras.'}</p>
      </div>

      <div>
        <div class="mb-3 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
          ${temEntrega 
            ? '<span class="inline-flex items-center gap-1 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200 text-[11px]"><i class="fa-solid fa-motorcycle"></i> Faz Delivery / Entregas</span>'
            : '<span class="inline-flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md text-[11px]"><i class="fa-solid fa-handshake"></i> Atendimento Digital / Direto</span>'
          }
        </div>

        <div class="pt-2 flex flex-wrap items-center gap-2">
          ${cleanPhone ? `
            <a href="https://wa.me/55${cleanPhone}?text=Ol%C3%A1!%20Encontrei%20voc%C3%AAs%20na%20Rede%20de%20Apoio%20ao%20Com%C3%A9rcio%20Seguro." target="_blank" 
               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 text-xs font-semibold rounded-lg transition-colors">
              <i class="fa-brands fa-whatsapp text-sm"></i> WhatsApp
            </a>` : ''}

          ${cleanInsta ? `
            <a href="https://instagram.com/${cleanInsta}" target="_blank" 
               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-pink-50 text-pink-700 hover:bg-pink-100 border border-pink-200 text-xs font-semibold rounded-lg transition-colors">
              <i class="fa-brands fa-instagram text-sm"></i> @${cleanInsta}
            </a>` : ''}

          ${item.catalogo ? `
            <a href="${item.catalogo}" target="_blank" 
               class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 text-xs font-semibold rounded-lg transition-colors">
              <i class="fa-solid fa-link text-sm"></i> Catálogo
            </a>` : ''}
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Aplicação de filtros combinados
function aplicarFiltros() {
  const termo = document.getElementById('searchInput').value.toLowerCase().trim();
  const uf = document.getElementById('ufFilter').value;
  const cidade = document.getElementById('cityFilter').value;
  const bairro = document.getElementById('bairroFilter').value;
  const categoria = document.getElementById('categoryFilter').value;
  const apenasDelivery = document.getElementById('deliveryFilter').checked;

  const filtrados = estabelecimentos.filter(item => {
    const matchesTermo = !termo ||
                         (item.nome || '').toLowerCase().includes(termo) ||
                         (item.descricao || '').toLowerCase().includes(termo) ||
                         (item.categoria || '').toLowerCase().includes(termo);
    const matchesUf = !uf || item.estado === uf;
    const matchesCidade = !cidade || item.cidade === cidade;
    const matchesBairro = !bairro || item.bairro === bairro;
    const matchesCat = !categoria || item.categoria === categoria;
    
    const itemDelivery = item.temEntrega ?? item.precisaEntrega ?? false;
    const matchesDelivery = !apenasDelivery || itemDelivery === true;

    return matchesTermo && matchesUf && matchesCidade && matchesBairro && matchesCat && matchesDelivery;
  });

  renderizar(filtrados);
}

// Reset de todos os filtros
function resetarTodosFiltros() {
  document.getElementById('searchInput').value = '';
  document.getElementById('ufFilter').value = '';
  document.getElementById('categoryFilter').value = '';
  document.getElementById('deliveryFilter').checked = false;
  popularEstados();
  popularCategorias();
  aplicarFiltros();
}

// Modal de Gerenciamento de Dados (JSON)
function toggleModalData() {
  const modal = document.getElementById('dataModal');
  modal.classList.toggle('hidden');
  if (!modal.classList.contains('hidden')) {
    document.getElementById('jsonEditor').value = JSON.stringify(estabelecimentos, null, 2);
  }
}

async function restaurarDadosOriginais() {
  try {
    const response = await fetch('dados.json');
    const data = await response.json();
    document.getElementById('jsonEditor').value = JSON.stringify(data, null, 2);
  } catch (e) {
    alert('Erro ao carregar dados.json');
  }
}

function salvarDadosModal() {
  try {
    const parsed = JSON.parse(document.getElementById('jsonEditor').value);
    if (!Array.isArray(parsed)) throw new Error("O formato deve ser uma lista []");
    estabelecimentos = parsed;
    popularEstados();
    popularCategorias();
    aplicarFiltros();
    toggleModalData();
  } catch (e) {
    alert("Erro no JSON: " + e.message);
  }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('searchInput').addEventListener('input', aplicarFiltros);
  document.getElementById('ufFilter').addEventListener('change', atualizarCidades);
  document.getElementById('cityFilter').addEventListener('change', atualizarBairros);
  document.getElementById('bairroFilter').addEventListener('change', aplicarFiltros);
  document.getElementById('categoryFilter').addEventListener('change', aplicarFiltros);
  document.getElementById('deliveryFilter').addEventListener('change', aplicarFiltros);
  document.getElementById('resetFilters').addEventListener('click', resetarTodosFiltros);

  carregarDados();
});
