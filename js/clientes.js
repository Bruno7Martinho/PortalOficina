// Módulo de gerenciamento de clientes

function loadClientesModule() {
    const user = auth.currentUser;
    if (!user) return;
    
    dashboardContent.innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h2>Gerenciamento de Clientes</h2>
                <button id="btn-novo-cliente" class="btn btn-success">+ Novo Cliente</button>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
                    <table class="data-table" id="clientes-table">
                        <thead>
                            <tr>
                                <th>Nome</th>
                                <th>Telefone</th>
                                <th>E-mail</th>
                                <th>CPF</th>
                                <th>Endereço</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="clientes-body">
                            <!-- Dados serão carregados aqui -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="loader" id="clientes-loader"></div>
        </div>
    `;
    
    // Carregar clientes
    loadClientes();
    
    // Adicionar evento ao botão de novo cliente
    document.getElementById('btn-novo-cliente').addEventListener('click', showNovoClienteForm);
}

// Carregar lista de clientes
function loadClientes() {
    const loader = document.getElementById('clientes-loader');
    const clientesBody = document.getElementById('clientes-body');
    
    loader.style.display = 'block';
    clientesBody.innerHTML = '';
    
    db.collection('clientes').orderBy('nome').get()
        .then((snapshot) => {
            loader.style.display = 'none';
            
            if (snapshot.empty) {
                clientesBody.innerHTML = `
                    <tr>
                        <td colspan="6" class="text-center">Nenhum cliente cadastrado.</td>
                    </tr>
                `;
                return;
            }
            
            snapshot.forEach((doc) => {
                const cliente = doc.data();
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${cliente.nome || ''}</td>
                    <td>${cliente.telefone || ''}</td>
                    <td>${cliente.email || ''}</td>
                    <td>${cliente.cpf || ''}</td>
                    <td>${cliente.endereco || ''}</td>
                    <td class="actions">
                        <button class="btn btn-sm btn-primary" onclick="editarCliente('${doc.id}')">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="excluirCliente('${doc.id}')">Excluir</button>
                    </td>
                `;
                clientesBody.appendChild(row);
            });
        })
        .catch((error) => {
            console.error('Erro ao carregar clientes:', error);
            loader.style.display = 'none';
            clientesBody.innerHTML = `
                <tr>
                    <td colspan="6" class="text-center">Erro ao carregar clientes.</td>
                </tr>
            `;
        });
}

// Mostrar formulário de novo cliente
function showNovoClienteForm() {
    const modal = criarModal();
    modal.innerHTML = `
        <div class="modal-content">
            <button class="modal-close">&times;</button>
            <h2 class="modal-title">Novo Cliente</h2>
            
            <form id="form-cliente">
                <div class="form-group">
                    <label for="cliente-nome">Nome Completo *</label>
                    <input type="text" id="cliente-nome" required>
                </div>
                
                <div class="form-group">
                    <label for="cliente-cpf">CPF</label>
                    <input type="text" id="cliente-cpf" placeholder="000.000.000-00">
                </div>
                
                <div class="form-group">
                    <label for="cliente-telefone">Telefone *</label>
                    <input type="tel" id="cliente-telefone" required placeholder="(11) 99999-9999">
                </div>
                
                <div class="form-group">
                    <label for="cliente-email">E-mail</label>
                    <input type="email" id="cliente-email">
                </div>
                
                <div class="form-group">
                    <label for="cliente-endereco">Endereço</label>
                    <textarea id="cliente-endereco" rows="3"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="cliente-observacoes">Observações</label>
                    <textarea id="cliente-observacoes" rows="3"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="submit" class="btn btn-primary">Salvar Cliente</button>
                    <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
                </div>
            </form>
        </div>
    `;
    
    // Configurar evento de fechamento
    modal.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => modal.remove());
    });
    
    // Configurar envio do formulário
    const form = document.getElementById('form-cliente');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        salvarCliente();
    });
}

// Salvar cliente
function salvarCliente() {
    const clienteData = {
        nome: document.getElementById('cliente-nome').value,
        cpf: document.getElementById('cliente-cpf').value,
        telefone: document.getElementById('cliente-telefone').value,
        email: document.getElementById('cliente-email').value,
        endereco: document.getElementById('cliente-endereco').value,
        observacoes: document.getElementById('cliente-observacoes').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('clientes').add(clienteData)
        .then(() => {
            alert('Cliente salvo com sucesso!');
            document.querySelector('.modal').remove();
            loadClientes();
        })
        .catch((error) => {
            console.error('Erro ao salvar cliente:', error);
            alert('Erro ao salvar cliente. Tente novamente.');
        });
}

// Editar cliente
function editarCliente(clienteId) {
    db.collection('clientes').doc(clienteId).get()
        .then((doc) => {
            if (!doc.exists) {
                alert('Cliente não encontrado.');
                return;
            }
            
            const cliente = doc.data();
            const modal = criarModal();
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <h2 class="modal-title">Editar Cliente</h2>
                    
                    <form id="form-cliente">
                        <div class="form-group">
                            <label for="cliente-nome">Nome Completo *</label>
                            <input type="text" id="cliente-nome" value="${cliente.nome || ''}" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="cliente-cpf">CPF</label>
                            <input type="text" id="cliente-cpf" value="${cliente.cpf || ''}" placeholder="000.000.000-00">
                        </div>
                        
                        <div class="form-group">
                            <label for="cliente-telefone">Telefone *</label>
                            <input type="tel" id="cliente-telefone" value="${cliente.telefone || ''}" required placeholder="(11) 99999-9999">
                        </div>
                        
                        <div class="form-group">
                            <label for="cliente-email">E-mail</label>
                            <input type="email" id="cliente-email" value="${cliente.email || ''}">
                        </div>
                        
                        <div class="form-group">
                            <label for="cliente-endereco">Endereço</label>
                            <textarea id="cliente-endereco" rows="3">${cliente.endereco || ''}</textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="cliente-observacoes">Observações</label>
                            <textarea id="cliente-observacoes" rows="3">${cliente.observacoes || ''}</textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Atualizar Cliente</button>
                            <button type="button" class="btn btn-secondary modal-close">Cancelar</button>
                        </div>
                    </form>
                </div>
            `;
            
            // Configurar evento de fechamento
            modal.querySelectorAll('.modal-close').forEach(btn => {
                btn.addEventListener('click', () => modal.remove());
            });
            
            // Configurar envio do formulário
            const form = document.getElementById('form-cliente');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                atualizarCliente(clienteId);
            });
        })
        .catch((error) => {
            console.error('Erro ao carregar cliente:', error);
            alert('Erro ao carregar dados do cliente.');
        });
}

// Atualizar cliente
function atualizarCliente(clienteId) {
    const clienteData = {
        nome: document.getElementById('cliente-nome').value,
        cpf: document.getElementById('cliente-cpf').value,
        telefone: document.getElementById('cliente-telefone').value,
        email: document.getElementById('cliente-email').value,
        endereco: document.getElementById('cliente-endereco').value,
        observacoes: document.getElementById('cliente-observacoes').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('clientes').doc(clienteId).update(clienteData)
        .then(() => {
            alert('Cliente atualizado com sucesso!');
            document.querySelector('.modal').remove();
            loadClientes();
        })
        .catch((error) => {
            console.error('Erro ao atualizar cliente:', error);
            alert('Erro ao atualizar cliente. Tente novamente.');
        });
}

// Excluir cliente
function excluirCliente(clienteId) {
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
        db.collection('clientes').doc(clienteId).delete()
            .then(() => {
                alert('Cliente excluído com sucesso!');
                loadClientes();
            })
            .catch((error) => {
                console.error('Erro ao excluir cliente:', error);
                alert('Erro ao excluir cliente. Tente novamente.');
            });
    }
}

// Criar modal
function criarModal() {
    const modal = document.createElement('div');
    modal.className = 'modal active';
    document.body.appendChild(modal);
    return modal;
}