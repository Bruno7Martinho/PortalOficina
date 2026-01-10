// Módulo de gerenciamento de veículos

function loadVeiculosModule() {
    const user = auth.currentUser;
    if (!user) return;
    
    dashboardContent.innerHTML = `
        <div class="dashboard-section">
            <div class="section-header">
                <h2>Gerenciamento de Veículos</h2>
                <button id="btn-novo-veiculo" class="btn btn-success">+ Novo Veículo</button>
            </div>
            
            <div class="table-container">
                <div class="table-responsive">
                    <table class="data-table" id="veiculos-table">
                        <thead>
                            <tr>
                                <th>Placa</th>
                                <th>Marca/Modelo</th>
                                <th>Ano</th>
                                <th>Cor</th>
                                <th>Cliente</th>
                                <th>Status</th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody id="veiculos-body">
                            <!-- Dados serão carregados aqui -->
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="loader" id="veiculos-loader"></div>
        </div>
    `;
    
    // Carregar veículos
    loadVeiculos();
    
    // Adicionar evento ao botão de novo veículo
    document.getElementById('btn-novo-veiculo').addEventListener('click', showNovoVeiculoForm);
}

// Carregar lista de veículos
function loadVeiculos() {
    const loader = document.getElementById('veiculos-loader');
    const veiculosBody = document.getElementById('veiculos-body');
    
    loader.style.display = 'block';
    veiculosBody.innerHTML = '';
    
    db.collection('veiculos').orderBy('placa').get()
        .then((snapshot) => {
            loader.style.display = 'none';
            
            if (snapshot.empty) {
                veiculosBody.innerHTML = `
                    <tr>
                        <td colspan="7" class="text-center">Nenhum veículo cadastrado.</td>
                    </tr>
                `;
                return;
            }
            
            // Carregar clientes para associação
            const clientesPromise = db.collection('clientes').get();
            
            Promise.all([snapshot, clientesPromise]).then(([veiculosSnapshot, clientesSnapshot]) => {
                const clientesMap = {};
                clientesSnapshot.forEach(doc => {
                    clientesMap[doc.id] = doc.data().nome;
                });
                
                veiculosSnapshot.forEach((doc) => {
                    const veiculo = doc.data();
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${veiculo.placa || ''}</td>
                        <td>${veiculo.marca || ''} ${veiculo.modelo || ''}</td>
                        <td>${veiculo.ano || ''}</td>
                        <td>${veiculo.cor || ''}</td>
                        <td>${clientesMap[veiculo.clienteId] || 'Não informado'}</td>
                        <td><span class="status-badge status-${veiculo.status || 'pendente'}">${getStatusText(veiculo.status)}</span></td>
                        <td class="actions">
                            <button class="btn btn-sm btn-primary" onclick="editarVeiculo('${doc.id}')">Editar</button>
                            <button class="btn btn-sm btn-danger" onclick="excluirVeiculo('${doc.id}')">Excluir</button>
                        </td>
                    `;
                    veiculosBody.appendChild(row);
                });
            });
        })
        .catch((error) => {
            console.error('Erro ao carregar veículos:', error);
            loader.style.display = 'none';
            veiculosBody.innerHTML = `
                <tr>
                    <td colspan="7" class="text-center">Erro ao carregar veículos.</td>
                </tr>
            `;
        });
}

// Obter texto do status
function getStatusText(status) {
    const statusMap = {
        'pendente': 'Pendente',
        'andamento': 'Em Andamento',
        'concluido': 'Concluído',
        'entregue': 'Entregue'
    };
    return statusMap[status] || 'Pendente';
}

// Mostrar formulário de novo veículo
function showNovoVeiculoForm() {
    // Carregar clientes para select
    db.collection('clientes').orderBy('nome').get()
        .then((clientesSnapshot) => {
            let clientesOptions = '<option value="">Selecione um cliente</option>';
            clientesSnapshot.forEach((doc) => {
                const cliente = doc.data();
                clientesOptions += `<option value="${doc.id}">${cliente.nome}</option>`;
            });
            
            const modal = criarModal();
            modal.innerHTML = `
                <div class="modal-content">
                    <button class="modal-close">&times;</button>
                    <h2 class="modal-title">Novo Veículo</h2>
                    
                    <form id="form-veiculo">
                        <div class="form-group">
                            <label for="veiculo-placa">Placa *</label>
                            <input type="text" id="veiculo-placa" required placeholder="ABC-1234">
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-marca">Marca *</label>
                            <input type="text" id="veiculo-marca" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-modelo">Modelo *</label>
                            <input type="text" id="veiculo-modelo" required>
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-ano">Ano</label>
                            <input type="number" id="veiculo-ano" min="1900" max="2024">
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-cor">Cor</label>
                            <input type="text" id="veiculo-cor">
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-cliente">Cliente *</label>
                            <select id="veiculo-cliente" required>
                                ${clientesOptions}
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-status">Status</label>
                            <select id="veiculo-status">
                                <option value="pendente">Pendente</option>
                                <option value="andamento">Em Andamento</option>
                                <option value="concluido">Concluído</option>
                                <option value="entregue">Entregue</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-problema">Problema/Descrição</label>
                            <textarea id="veiculo-problema" rows="4"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="veiculo-observacoes">Observações</label>
                            <textarea id="veiculo-observacoes" rows="3"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="submit" class="btn btn-primary">Salvar Veículo</button>
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
            const form = document.getElementById('form-veiculo');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                salvarVeiculo();
            });
        })
        .catch((error) => {
            console.error('Erro ao carregar clientes:', error);
            alert('Erro ao carregar lista de clientes.');
        });
}

// Salvar veículo
function salvarVeiculo() {
    const veiculoData = {
        placa: document.getElementById('veiculo-placa').value.toUpperCase(),
        marca: document.getElementById('veiculo-marca').value,
        modelo: document.getElementById('veiculo-modelo').value,
        ano: document.getElementById('veiculo-ano').value,
        cor: document.getElementById('veiculo-cor').value,
        clienteId: document.getElementById('veiculo-cliente').value,
        status: document.getElementById('veiculo-status').value,
        problema: document.getElementById('veiculo-problema').value,
        observacoes: document.getElementById('veiculo-observacoes').value,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('veiculos').add(veiculoData)
        .then(() => {
            alert('Veículo salvo com sucesso!');
            document.querySelector('.modal').remove();
            loadVeiculos();
        })
        .catch((error) => {
            console.error('Erro ao salvar veículo:', error);
            alert('Erro ao salvar veículo. Tente novamente.');
        });
}

// Editar veículo
function editarVeiculo(veiculoId) {
    Promise.all([
        db.collection('veiculos').doc(veiculoId).get(),
        db.collection('clientes').orderBy('nome').get()
    ])
    .then(([veiculoDoc, clientesSnapshot]) => {
        if (!veiculoDoc.exists) {
            alert('Veículo não encontrado.');
            return;
        }
        
        const veiculo = veiculoDoc.data();
        let clientesOptions = '<option value="">Selecione um cliente</option>';
        clientesSnapshot.forEach((doc) => {
            const cliente = doc.data();
            const selected = doc.id === veiculo.clienteId ? 'selected' : '';
            clientesOptions += `<option value="${doc.id}" ${selected}>${cliente.nome}</option>`;
        });
        
        const modal = criarModal();
        modal.innerHTML = `
            <div class="modal-content">
                <button class="modal-close">&times;</button>
                <h2 class="modal-title">Editar Veículo</h2>
                
                <form id="form-veiculo">
                    <div class="form-group">
                        <label for="veiculo-placa">Placa *</label>
                        <input type="text" id="veiculo-placa" value="${veiculo.placa || ''}" required placeholder="ABC-1234">
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-marca">Marca *</label>
                        <input type="text" id="veiculo-marca" value="${veiculo.marca || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-modelo">Modelo *</label>
                        <input type="text" id="veiculo-modelo" value="${veiculo.modelo || ''}" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-ano">Ano</label>
                        <input type="number" id="veiculo-ano" value="${veiculo.ano || ''}" min="1900" max="2024">
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-cor">Cor</label>
                        <input type="text" id="veiculo-cor" value="${veiculo.cor || ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-cliente">Cliente *</label>
                        <select id="veiculo-cliente" required>
                            ${clientesOptions}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-status">Status</label>
                        <select id="veiculo-status">
                            <option value="pendente" ${veiculo.status === 'pendente' ? 'selected' : ''}>Pendente</option>
                            <option value="andamento" ${veiculo.status === 'andamento' ? 'selected' : ''}>Em Andamento</option>
                            <option value="concluido" ${veiculo.status === 'concluido' ? 'selected' : ''}>Concluído</option>
                            <option value="entregue" ${veiculo.status === 'entregue' ? 'selected' : ''}>Entregue</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-problema">Problema/Descrição</label>
                        <textarea id="veiculo-problema" rows="4">${veiculo.problema || ''}</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="veiculo-observacoes">Observações</label>
                        <textarea id="veiculo-observacoes" rows="3">${veiculo.observacoes || ''}</textarea>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Atualizar Veículo</button>
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
        const form = document.getElementById('form-veiculo');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            atualizarVeiculo(veiculoId);
        });
    })
    .catch((error) => {
        console.error('Erro ao carregar dados:', error);
        alert('Erro ao carregar dados do veículo.');
    });
}

// Atualizar veículo
function atualizarVeiculo(veiculoId) {
    const veiculoData = {
        placa: document.getElementById('veiculo-placa').value.toUpperCase(),
        marca: document.getElementById('veiculo-marca').value,
        modelo: document.getElementById('veiculo-modelo').value,
        ano: document.getElementById('veiculo-ano').value,
        cor: document.getElementById('veiculo-cor').value,
        clienteId: document.getElementById('veiculo-cliente').value,
        status: document.getElementById('veiculo-status').value,
        problema: document.getElementById('veiculo-problema').value,
        observacoes: document.getElementById('veiculo-observacoes').value,
        updatedAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    
    db.collection('veiculos').doc(veiculoId).update(veiculoData)
        .then(() => {
            alert('Veículo atualizado com sucesso!');
            document.querySelector('.modal').remove();
            loadVeiculos();
        })
        .catch((error) => {
            console.error('Erro ao atualizar veículo:', error);
            alert('Erro ao atualizar veículo. Tente novamente.');
        });
}

// Excluir veículo
function excluirVeiculo(veiculoId) {
    if (confirm('Tem certeza que deseja excluir este veículo?')) {
        db.collection('veiculos').doc(veiculoId).delete()
            .then(() => {
                alert('Veículo excluído com sucesso!');
                loadVeiculos();
            })
            .catch((error) => {
                console.error('Erro ao excluir veículo:', error);
                alert('Erro ao excluir veículo. Tente novamente.');
            });
    }
}