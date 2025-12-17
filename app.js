const API_BASE = window.location.hostname.includes('localhost') 
  ? 'http://localhost:8000' 
  : 'https://api-supabase-back.onrender.com'; // SEU BACKEND NO RENDER

console.log('API Base URL:', API_BASE);
console.log('Frontend URL:', window.location.origin);

const content = document.getElementById("content");
let currentServices = [];
let currentUsers = [];
let currentCities = [];
let currentCategories = [];

/* ------------------ Utils ------------------ */
async function getJson(url, params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const fullUrl = queryString ? `${API_BASE}${url}?${queryString}` : `${API_BASE}${url}`;
  const res = await fetch(fullUrl);
  if (!res.ok) throw new Error("Erro na API");
  return res.json();
}

async function postJson(url, data) {
  const res = await fetch(API_BASE + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
}

async function putJson(url, data) {
  const res = await fetch(API_BASE + url, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
}

async function deleteJson(url) {
  const res = await fetch(API_BASE + url, {
    method: "DELETE"
  });
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
}

async function uploadFile(url, file, fileType = 'logo') {
  const formData = new FormData();
  formData.append('file', file);
  
  const res = await fetch(API_BASE + url, {
    method: 'POST',
    body: formData
  });
  
  if (!res.ok) {
    const error = await res.text();
    throw new Error(error);
  }
  return res.json();
}

/* ------------------ Navegação ------------------ */
document.querySelectorAll(".nav-item").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".nav-item").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    renderTab(btn.dataset.tab);
  });
});

/* ------------------ Renderização ------------------ */
function renderTab(tab) {
  content.innerHTML = "";
  
  if (tab === "cities") renderCities();
  if (tab === "categories") renderCategories();
  if (tab === "services") renderServices();
  if (tab === "users") renderUsers();
}

/* ------------------ Cidades ------------------ */
async function renderCities() {
  content.innerHTML = `
    <div class="card">
      <h3>Criar Nova Cidade</h3>
      <div class="form-group">
        <label for="city-name">Nome:</label>
        <input id="city-name" placeholder="Nome da Cidade" />
      </div>
      <div class="form-group">
        <label for="city-state">Estado:</label>
        <input id="city-state" placeholder="Estado (ex: SP)" />
      </div>
      <button id="create-city" class="btn-primary">Criar Cidade</button>
    </div>
    <div class="card">
      <h3>Lista de Cidades</h3>
      <div style="margin-bottom: 20px;">
        <input type="text" id="city-search" placeholder="Buscar cidade..." style="width: 300px; padding: 8px;" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Estado</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="city-table-body">
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("create-city").onclick = async () => {
    const name = document.getElementById("city-name").value;
    const state = document.getElementById("city-state").value;
    
    if (!name || !state) {
      alert("Preencha todos os campos!");
      return;
    }
    
    try {
      await postJson("/cities", { name, state });
      alert("Cidade criada com sucesso!");
      document.getElementById("city-name").value = "";
      document.getElementById("city-state").value = "";
      renderCities();
    } catch (error) {
      alert("Erro ao criar cidade: " + error.message);
    }
  };

  // Search functionality
  const searchInput = document.getElementById("city-search");
  searchInput.addEventListener("input", renderCityTable);
  
  await renderCityTable();
}

async function renderCityTable() {
  try {
    const cities = await getJson("/cities");
    currentCities = cities;
    const searchTerm = document.getElementById("city-search")?.value.toLowerCase() || "";
    
    const filteredCities = cities.filter(city => 
      city.name.toLowerCase().includes(searchTerm) || 
      city.state.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById("city-table-body");
    tableBody.innerHTML = "";
    
    filteredCities.forEach(city => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${city.id}</td>
        <td>${city.name}</td>
        <td>${city.state}</td>
        <td class="actions">
          <button onclick="editCity(${city.id})" class="btn-secondary">Editar</button>
          <button onclick="deleteCity(${city.id})" class="btn-danger">Excluir</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    alert("Erro ao carregar cidades: " + error.message);
  }
}

async function editCity(id) {
  const city = currentCities.find(c => c.id === id);
  if (!city) return;
  
  const newName = prompt("Novo nome da cidade:", city.name);
  if (newName === null) return;
  
  const newState = prompt("Novo estado:", city.state);
  if (newState === null) return;
  
  try {
    await putJson(`/cities/${id}`, { 
      name: newName || city.name, 
      state: newState || city.state 
    });
    alert("Cidade atualizada com sucesso!");
    renderCities();
  } catch (error) {
    alert("Erro ao atualizar cidade: " + error.message);
  }
}

async function deleteCity(id) {
  if (!confirm("Tem certeza que deseja excluir esta cidade?")) return;
  
  try {
    await deleteJson(`/cities/${id}`);
    alert("Cidade excluída com sucesso!");
    renderCities();
  } catch (error) {
    alert("Erro ao excluir cidade: " + error.message);
  }
}

/* ------------------ Categorias ------------------ */
async function renderCategories() {
  content.innerHTML = `
    <div class="card">
      <h3>Criar Nova Categoria</h3>
      <div class="form-group">
        <label for="cat-name">Nome:</label>
        <input id="cat-name" placeholder="Nome da Categoria" />
      </div>
      <button id="create-cat" class="btn-primary">Criar Categoria</button>
    </div>
    <div class="card">
      <h3>Lista de Categorias</h3>
      <div style="margin-bottom: 20px;">
        <input type="text" id="cat-search" placeholder="Buscar categoria..." style="width: 300px; padding: 8px;" />
      </div>
      <table class="data-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Nome</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="cat-table-body">
        </tbody>
      </table>
    </div>
  `;

  document.getElementById("create-cat").onclick = async () => {
    const name = document.getElementById("cat-name").value;
    
    if (!name) {
      alert("Preencha o nome da categoria!");
      return;
    }
    
    try {
      await postJson("/categories", { name });
      alert("Categoria criada com sucesso!");
      document.getElementById("cat-name").value = "";
      renderCategories();
    } catch (error) {
      alert("Erro ao criar categoria: " + error.message);
    }
  };

  const searchInput = document.getElementById("cat-search");
  searchInput.addEventListener("input", renderCategoryTable);
  
  await renderCategoryTable();
}

async function renderCategoryTable() {
  try {
    const categories = await getJson("/categories");
    currentCategories = categories;
    const searchTerm = document.getElementById("cat-search")?.value.toLowerCase() || "";
    
    const filteredCategories = categories.filter(cat => 
      cat.name.toLowerCase().includes(searchTerm)
    );
    
    const tableBody = document.getElementById("cat-table-body");
    tableBody.innerHTML = "";
    
    filteredCategories.forEach(cat => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${cat.id}</td>
        <td>${cat.name}</td>
        <td class="actions">
          <button onclick="editCategory(${cat.id})" class="btn-secondary">Editar</button>
          <button onclick="deleteCategory(${cat.id})" class="btn-danger">Excluir</button>
        </td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    alert("Erro ao carregar categorias: " + error.message);
  }
}

async function editCategory(id) {
  const category = currentCategories.find(c => c.id === id);
  if (!category) return;
  
  const newName = prompt("Novo nome da categoria:", category.name);
  if (newName === null) return;
  
  try {
    await putJson(`/categories/${id}`, { name: newName || category.name });
    alert("Categoria atualizada com sucesso!");
    renderCategories();
  } catch (error) {
    alert("Erro ao atualizar categoria: " + error.message);
  }
}

async function deleteCategory(id) {
  if (!confirm("Tem certeza que deseja excluir esta categoria?")) return;
  
  try {
    await deleteJson(`/categories/${id}`);
    alert("Categoria excluída com sucesso!");
    renderCategories();
  } catch (error) {
    alert("Erro ao excluir categoria: " + error.message);
  }
}

/* ------------------ Serviços ------------------ */
async function renderServices() {
  try {
    const [cities, categories, services] = await Promise.all([
      getJson("/cities"),
      getJson("/categories"),
      getJson("/services")
    ]);
    
    currentServices = services;
    currentCities = cities;
    currentCategories = categories;

    content.innerHTML = `
      <div class="card">
        <h3>Criar Serviço</h3>
        <div class="form-group">
          <label for="srv-name">Nome:</label>
          <input id="srv-name" placeholder="Nome do serviço" />
        </div>
        <div class="form-group">
          <label for="srv-desc">Descrição:</label>
          <textarea id="srv-desc" placeholder="Descrição do serviço"></textarea>
        </div>
        <div class="form-group">
          <label for="srv-cat">Categoria:</label>
          <select id="srv-cat">
            <option value="">Selecionar Categoria</option>
            ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label for="srv-city">Cidade:</label>
          <select id="srv-city">
            <option value="">Selecionar Cidade</option>
            ${cities.map(c => `<option value="${c.id}">${c.name} - ${c.state}</option>`).join('')}
          </select>
        </div>
        <button id="create-srv" class="btn-primary">Criar Serviço</button>
      </div>
      <div class="card">
        <h3>Upload de Logo</h3>
        <div class="form-group">
          <label for="srv-logo-id">Serviço ID:</label>
          <input id="srv-logo-id" type="text" placeholder="ID do serviço" />
        </div>
        <div class="form-group">
          <label for="srv-logo">Selecionar Arquivo:</label>
          <input id="srv-logo" type="file" class="logo" accept="image/*" />
        </div>
        <button id="upload-logo" class="btn-primary">Fazer Upload</button>
      </div>
      <div class="card">
        <h3>Filtrar Serviços</h3>
        <div class="filter-controls">
          <div class="form-group">
            <label for="srv-filter-cat">Categoria:</label>
            <select id="srv-filter-cat">
              <option value="">Todas</option>
              ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label for="srv-filter-city">Cidade:</label>
            <select id="srv-filter-city">
              <option value="">Todas</option>
              ${cities.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
            </select>
          </div>
          <div>
            <button id="filter-srv" class="btn-secondary">Filtrar</button>
            <button id="clear-filter" class="btn-secondary">Limpar</button>
          </div>
        </div>
      </div>
      <div class="card">
        <h3>Lista de Serviços</h3>
        <div style="margin-bottom: 20px;">
          <input type="text" id="service-search" placeholder="Buscar serviço..." style="width: 300px; padding: 8px;" />
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Categoria</th>
              <th>Cidade</th>
              <th>Logo</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="srv-table-body">
          </tbody>
        </table>
      </div>
    `;

    document.getElementById("create-srv").onclick = async () => {
      const name = document.getElementById("srv-name").value;
      const description = document.getElementById("srv-desc").value;
      const category_id = document.getElementById("srv-cat").value;
      const city_id = document.getElementById("srv-city").value;
      
      if (!name || !category_id || !city_id) {
        alert("Preencha todos os campos obrigatórios!");
        return;
      }
      
      try {
        await postJson("/services", { 
          name, 
          description, 
          category_id: parseInt(category_id), 
          city_id: parseInt(city_id) 
        });
        alert("Serviço criado com sucesso!");
        document.getElementById("srv-name").value = "";
        document.getElementById("srv-desc").value = "";
        document.getElementById("srv-cat").value = "";
        document.getElementById("srv-city").value = "";
        renderServices();
      } catch (error) {
        alert("Erro ao criar serviço: " + error.message);
      }
    };

    document.getElementById("upload-logo").onclick = async () => {
      const serviceId = document.getElementById("srv-logo-id").value;
      const fileInput = document.getElementById("srv-logo");
      
      if (!serviceId || !fileInput.files[0]) {
        alert("Preencha o ID do serviço e selecione um arquivo!");
        return;
      }
      
      try {
        await uploadFile(`/services/${serviceId}/logo`, fileInput.files[0]);
        alert("Logo enviado com sucesso!");
        document.getElementById("srv-logo-id").value = "";
        fileInput.value = "";
        renderServices();
      } catch (error) {
        alert("Erro ao enviar logo: " + error.message);
      }
    };

    document.getElementById("filter-srv").onclick = async () => {
      const categoryId = document.getElementById("srv-filter-cat").value;
      const cityId = document.getElementById("srv-filter-city").value;
      
      const params = {};
      if (categoryId) params.category_id = categoryId;
      if (cityId) params.city_id = cityId;
      
      try {
        currentServices = await getJson("/services", params);
        renderServiceTable();
      } catch (error) {
        alert("Erro ao filtrar serviços: " + error.message);
      }
    };

    document.getElementById("clear-filter").onclick = async () => {
      document.getElementById("srv-filter-cat").value = "";
      document.getElementById("srv-filter-city").value = "";
      currentServices = await getJson("/services");
      renderServiceTable();
    };

    const searchInput = document.getElementById("service-search");
    searchInput.addEventListener("input", renderServiceTable);
    
    renderServiceTable();
  } catch (error) {
    alert("Erro ao carregar serviços: " + error.message);
  }
}

function renderServiceTable() {
  const searchTerm = document.getElementById("service-search")?.value.toLowerCase() || "";
  
  const filteredServices = currentServices.filter(service => 
    service.name.toLowerCase().includes(searchTerm) ||
    (service.description && service.description.toLowerCase().includes(searchTerm))
  );
  
  const tableBody = document.getElementById("srv-table-body");
  tableBody.innerHTML = "";
  
  filteredServices.forEach(service => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${service.id}</td>
      <td>${service.name}</td>
      <td>${service.description || 'N/A'}</td>
      <td>${service.categories?.name || 'N/A'}</td>
      <td>${service.cities ? `${service.cities.name} - ${service.cities.state}` : 'N/A'}</td>
      <td>${service.logo_url ? 
        `<a href="${service.logo_url}" target="_blank">Ver Logo</a>` : 
        'Sem logo'}</td>
      <td class="actions">
        <button onclick="editService(${service.id})" class="btn-secondary">Editar</button>
        <button onclick="uploadLogoModal(${service.id})" class="btn-secondary">Logo</button>
        <button onclick="deleteServiceLogo(${service.id})" class="btn-danger">Remover Logo</button>
        <button onclick="deleteService(${service.id})" class="btn-danger">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function editService(id) {
  const service = currentServices.find(s => s.id === id);
  if (!service) return;
  
  const newName = prompt("Novo nome do serviço:", service.name);
  if (newName === null) return;
  
  const newDesc = prompt("Nova descrição:", service.description || "");
  
  try {
    await putJson(`/services/${id}`, { 
      name: newName || service.name, 
      description: newDesc 
    });
    alert("Serviço atualizado com sucesso!");
    renderServices();
  } catch (error) {
    alert("Erro ao atualizar serviço: " + error.message);
  }
}

async function deleteServiceLogo(id) {
  if (!confirm("Tem certeza que deseja remover o logo deste serviço?")) return;
  
  try {
    await deleteJson(`/services/${id}/logo`);
    alert("Logo removido com sucesso!");
    renderServices();
  } catch (error) {
    alert("Erro ao remover logo: " + error.message);
  }
}

async function deleteService(id) {
  if (!confirm("Tem certeza que deseja excluir este serviço?")) return;
  
  try {
    await deleteJson(`/services/${id}`);
    alert("Serviço excluído com sucesso!");
    renderServices();
  } catch (error) {
    alert("Erro ao excluir serviço: " + error.message);
  }
}

function uploadLogoModal(serviceId) {
  document.getElementById("srv-logo-id").value = serviceId;
  document.getElementById("srv-logo").focus();
}

/* ------------------ Usuários ------------------ */
async function renderUsers() {
  try {
    const users = await getJson("/users");
    currentUsers = users;

    content.innerHTML = `
      <div class="card">
        <h3>Criar Novo Usuário</h3>
        <div class="form-group">
          <label for="user-name">Nome:</label>
          <input id="user-name" type="text" placeholder="Nome completo" />
        </div>
        <div class="form-group">
          <label for="user-email">Email:</label>
          <input id="user-email" type="email" placeholder="email@exemplo.com" />
        </div>
        <button id="create-user" class="btn-primary">Criar Usuário</button>
      </div>
      <div class="card">
        <h3>Upload de Avatar</h3>
        <div class="form-group">
          <label for="user-avatar-id">Usuário ID:</label>
          <input id="user-avatar-id" type="text" placeholder="ID do usuário" />
        </div>
        <div class="form-group">
          <label for="user-avatar">Selecionar Arquivo:</label>
          <input id="user-avatar" type="file" accept="image/*" />
        </div>
        <button id="upload-avatar" class="btn-primary">Fazer Upload</button>
      </div>
      <div class="card">
        <h3>Lista de Usuários</h3>
        <div style="margin-bottom: 20px;">
          <input type="text" id="user-search" placeholder="Buscar usuário..." style="width: 300px; padding: 8px;" />
        </div>
        <table class="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nome</th>
              <th>Email</th>
              <th>Avatar</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody id="user-table-body">
          </tbody>
        </table>
      </div>
    `;

    document.getElementById("create-user").onclick = async () => {
      const name = document.getElementById("user-name").value;
      const email = document.getElementById("user-email").value;
      
      if (!name || !email) {
        alert("Preencha todos os campos!");
        return;
      }
      
      if (!email.includes('@')) {
        alert("Email inválido!");
        return;
      }
      
      try {
        await postJson("/users", { name, email });
        alert("Usuário criado com sucesso!");
        document.getElementById("user-name").value = "";
        document.getElementById("user-email").value = "";
        renderUsers();
      } catch (error) {
        alert("Erro ao criar usuário: " + error.message);
      }
    };

    document.getElementById("upload-avatar").onclick = async () => {
      const userId = document.getElementById("user-avatar-id").value;
      const fileInput = document.getElementById("user-avatar");
      
      if (!userId || !fileInput.files[0]) {
        alert("Preencha o ID do usuário e selecione um arquivo!");
        return;
      }
      
      try {
        await uploadFile(`/users/${userId}/avatar`, fileInput.files[0], 'avatar');
        alert("Avatar enviado com sucesso!");
        document.getElementById("user-avatar-id").value = "";
        fileInput.value = "";
        renderUsers();
      } catch (error) {
        alert("Erro ao enviar avatar: " + error.message);
      }
    };

    const searchInput = document.getElementById("user-search");
    searchInput.addEventListener("input", renderUserTable);
    
    renderUserTable();
  } catch (error) {
    alert("Erro ao carregar usuários: " + error.message);
  }
}

function renderUserTable() {
  const searchTerm = document.getElementById("user-search")?.value.toLowerCase() || "";
  
  const filteredUsers = currentUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm) ||
    user.email.toLowerCase().includes(searchTerm)
  );
  
  const tableBody = document.getElementById("user-table-body");
  tableBody.innerHTML = "";
  
  filteredUsers.forEach(user => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${user.id}</td>
      <td>${user.name}</td>
      <td>${user.email}</td>
      <td>${user.avatar_url ? 
        `<a href="${user.avatar_url}" target="_blank">Ver Avatar</a>` : 
        'Sem avatar'}</td>
      <td class="actions">
        <button onclick="editUser(${user.id})" class="btn-secondary">Editar</button>
        <button onclick="uploadAvatarModal(${user.id})" class="btn-secondary">Avatar</button>
        <button onclick="deleteUserAvatar(${user.id})" class="btn-danger">Remover Avatar</button>
        <button onclick="deleteUser(${user.id})" class="btn-danger">Excluir</button>
      </td>
    `;
    tableBody.appendChild(row);
  });
}

async function editUser(id) {
  const user = currentUsers.find(u => u.id === id);
  if (!user) return;
  
  const newName = prompt("Novo nome do usuário:", user.name);
  if (newName === null) return;
  
  const newEmail = prompt("Novo email:", user.email);
  if (newEmail === null) return;
  
  if (newEmail && !newEmail.includes('@')) {
    alert("Email inválido!");
    return;
  }
  
  try {
    await putJson(`/users/${id}`, { 
      name: newName || user.name, 
      email: newEmail || user.email 
    });
    alert("Usuário atualizado com sucesso!");
    renderUsers();
  } catch (error) {
    alert("Erro ao atualizar usuário: " + error.message);
  }
}

async function deleteUserAvatar(id) {
  if (!confirm("Tem certeza que deseja remover o avatar deste usuário?")) return;
  
  try {
    await deleteJson(`/users/${id}/avatar`);
    alert("Avatar removido com sucesso!");
    renderUsers();
  } catch (error) {
    alert("Erro ao remover avatar: " + error.message);
  }
}

async function deleteUser(id) {
  if (!confirm("Tem certeza que deseja excluir este usuário?")) return;
  
  try {
    await deleteJson(`/users/${id}`);
    alert("Usuário excluído com sucesso!");
    renderUsers();
  } catch (error) {
    alert("Erro ao excluir usuário: " + error.message);
  }
}

function uploadAvatarModal(userId) {
  document.getElementById("user-avatar-id").value = userId;
  document.getElementById("user-avatar").focus();
}

// inicial

renderTab("services");

