// Toast Notification
function showToast(message, type = 'info', duration = 4000) {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerText = message;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => container.removeChild(toast), 500);
    }, duration);
}
// Painel Do Py Dev - Frontend JavaScript (Versão Robusta)

// Efeito de Typing para o nome do site
const typingText = "Painel do Py Dev";
let index = 0;
let isDeleting = false;
const speed = 100;
const delayBeforeDeleting = 3000;
const delayBeforeTypingAgain = 500;

function typeText() {
  const typingTextElement = document.getElementById("typing-text");
  if (!typingTextElement) return;

  if (isDeleting) {
    typingTextElement.innerHTML = typingText.substring(0, index);
    index--;
    if (index < 0) {
      isDeleting = false;
      setTimeout(typeText, delayBeforeTypingAgain);
    } else {
      setTimeout(typeText, speed / 2);
    }
  } else {
    typingTextElement.innerHTML = typingText.substring(0, index);
    index++;
    if (index > typingText.length) {
      isDeleting = true;
      setTimeout(typeText, delayBeforeDeleting);
    } else {
      setTimeout(typeText, speed);
    }
  }
}

// Inicializar tema ao carregar
document.addEventListener('DOMContentLoaded', function() {
    // Iniciar typing animation
    setTimeout(typeText, delayBeforeTypingAgain);
    
    // Verificar preferência de tema salva
    const savedTheme = localStorage.getItem('theme') || 'light';
    const checkbox = document.getElementById('checkbox');
    
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        if (checkbox) checkbox.checked = true;
    }
    
    // Adicionar listener para o switch
    if (checkbox) {
        checkbox.addEventListener('change', function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
    }
});

// Função para mudar abas com segurança
function changeTab(tabName) {
    // Remover active de todos os botões e conteúdos
    const allBtns = document.querySelectorAll('.tab-btn');
    const allContents = document.querySelectorAll('.tab-content');
    
    allBtns.forEach(btn => btn.classList.remove('active'));
    allContents.forEach(content => content.classList.remove('active'));
    
    // Adicionar active ao tab selecionado
    const activeBtn = document.querySelector(`[data-tab="${tabName}"]`);
    const activeContent = document.getElementById(tabName);
    
    if (activeBtn) activeBtn.classList.add('active');
    if (activeContent) activeContent.classList.add('active');
    
    // Carregar dados se necessário
    if (tabName === 'dashboard') {
        loadStats();
    } else if (tabName === 'gerenciar') {
        loadKeys();
    }
}

// Carregar estatísticas
async function loadStats() {
    try {
        const response = await fetch('/stats');
        const stats = await response.json();

        const els = {
            'total-keys': stats.total,
            'active-keys': stats.ativas,
            'expired-keys': stats.expiradas,
            'disabled-keys': stats.desativadas,
            'bronze-count': stats.porPlano.bronze,
            'prata-count': stats.porPlano.prata,
            'ouro-count': stats.porPlano.ouro
        };

        Object.keys(els).forEach(id => {
            const el = document.getElementById(id);
            if (el) el.textContent = els[id];
        });

    } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
    }
}

// Carregar lista de keys
async function loadKeys() {
    try {
        const keysList = document.getElementById('keys-list');
        if (!keysList) return;
        
        keysList.innerHTML = '<div style="text-align: center; padding: 40px; color: #999;"><i class="fas fa-spinner fa-spin"></i> Carregando...</div>';

        const response = await fetch('/keys');
        const keys = await response.json();

        if (keys.length === 0) {
            keysList.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 40px;">Nenhuma key cadastrada ainda.</p>';
            return;
        }

        keysList.innerHTML = keys.map(key => createKeyItem(key)).join('');

    } catch (error) {
        console.error('Erro ao carregar keys:', error);
        const keysList = document.getElementById('keys-list');
        if (keysList) {
            keysList.innerHTML = '<p style="text-align: center; color: #ef4444; padding: 40px;">Erro ao carregar keys.</p>';
        }
    }
}

// Criar item da lista de keys
function createKeyItem(key) {
    const status = getKeyStatus(key);
    const statusClass = status.toLowerCase().replace(' ', '-');
    const planoEmoji = getPlanoEmoji(key.plano);

    return `
        <div class="key-item">
            <div class="key-info-main">
                <div class="key-code">${key.key}</div>
                <div class="key-details">
                    <div class="key-detail">
                        <i class="fas fa-crown"></i>
                        ${planoEmoji} ${key.plano.charAt(0).toUpperCase() + key.plano.slice(1)}
                    </div>
                    <div class="key-detail">
                        <i class="fas fa-calendar"></i>
                        ${new Date(key.expira).toLocaleDateString('pt-BR')}
                    </div>
                    <div class="key-detail">
                        <span class="key-status ${statusClass}">${status}</span>
                    </div>
                </div>
            </div>
            <div class="key-actions">
                <button class="btn-action btn-renew styled__button" onclick="openRenewModal('${key.key}')">
                    <i class="fas fa-clock"></i> Renovar
                </button>
                <button class="btn-action btn-disable styled__button" onclick="openDisableModal('${key.key}')">
                    <i class="fas fa-ban"></i> Desativar
                </button>
                <button class="btn-action btn-delete styled__button" onclick="openDeleteModal('${key.key}')">
                    <i class="fas fa-trash"></i> Deletar
                </button>
            </div>
        </div>
    `;
}

// Obter status da key
function getKeyStatus(key) {
    if (!key.ativa) return 'Desativada';
    if (Date.now() > key.expira) return 'Expirada';
    return 'Ativa';
}

// Obter emoji do plano
function getPlanoEmoji(plano) {
    switch (plano) {
        case 'bronze': return '🥉';
        case 'prata': return '🥈';
        case 'ouro': return '🥇';
        default: return '🔑';
    }
}

// Gerar nova key
async function handleGenerateKey(e) {
    e.preventDefault();

    const adminKeyEl = document.getElementById('admin-key');
    const planSelectEl = document.getElementById('plan-select');
    
    if (!adminKeyEl || !planSelectEl) return;

    const adminKey = adminKeyEl.value;
    const plano = planSelectEl.value;

    if (!adminKey || !plano) {
        showNotification('Preencha todos os campos', 'error');
        return;
    }

    const daysInputEl = document.getElementById('days-input');
    const dias = daysInputEl ? parseInt(daysInputEl.value) : undefined;

    try {
        const response = await fetch('/gerar', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ plano, adminKey, dias }),
        });

        const result = await response.json();

        if (result.status) {
            document.getElementById('generated-key').textContent = result.key;
            document.getElementById('generated-plan').textContent = result.plano.charAt(0).toUpperCase() + result.plano.slice(1);
            document.getElementById('generated-expiry').textContent = result.expira;

            const resultDiv = document.getElementById('generate-result');
            if (resultDiv) resultDiv.style.display = 'block';
            
            adminKeyEl.value = '';
            planSelectEl.value = '';

            showNotification('Key gerada com sucesso!', 'success');
            loadStats();
            loadKeys();

            const resultDiv2 = document.getElementById('generate-result');
            if (resultDiv2) {
                resultDiv2.scrollIntoView({ behavior: 'smooth' });
            }
        } else {
            showNotification(result.msg, 'error');
        }

    } catch (error) {
        console.error('Erro ao gerar key:', error);
        showNotification('Erro ao gerar key', 'error');
    }
}

// Abrir modal para renovar
function openRenewModal(key) {
    const actionKeyEl = document.getElementById('action-key');
    const renewalDaysEl = document.getElementById('renewal-days');
    const modalTitleEl = document.getElementById('modal-title');
    const modal = document.getElementById('action-modal');
    
    if (actionKeyEl) actionKeyEl.value = key;
    if (renewalDaysEl) renewalDaysEl.style.display = 'block';
    if (modalTitleEl) modalTitleEl.textContent = 'Renovar Key';
    if (modal) modal.classList.add('show');
    
    window.currentAction = 'renew';
}

// Abrir modal para desativar
function openDisableModal(key) {
    const actionKeyEl = document.getElementById('action-key');
    const renewalDaysEl = document.getElementById('renewal-days');
    const modalTitleEl = document.getElementById('modal-title');
    const modal = document.getElementById('action-modal');
    
    if (actionKeyEl) actionKeyEl.value = key;
    if (renewalDaysEl) renewalDaysEl.style.display = 'none';
    if (modalTitleEl) modalTitleEl.textContent = 'Desativar Key';
    if (modal) modal.classList.add('show');
    
    window.currentAction = 'disable';
}

// Abrir modal para deletar
function openDeleteModal(key) {
    if (!confirm('⚠️ ATENÇÃO: Esta ação é irreversível!\n\nTem certeza que deseja deletar permanentemente esta key?')) {
        return;
    }

    const actionKeyEl = document.getElementById('action-key');
    const renewalDaysEl = document.getElementById('renewal-days');
    const modalTitleEl = document.getElementById('modal-title');
    const modal = document.getElementById('action-modal');
    
    if (actionKeyEl) actionKeyEl.value = key;
    if (renewalDaysEl) renewalDaysEl.style.display = 'none';
    if (modalTitleEl) modalTitleEl.textContent = 'Deletar Key';
    if (modal) modal.classList.add('show');
    
    window.currentAction = 'delete';
}

// Fechar modal
function closeModal() {
    const modal = document.getElementById('action-modal');
    const form = document.getElementById('action-form');
    
    if (modal) modal.classList.remove('show');
    if (form) form.reset();
    
    window.currentAction = null;
}

// Executar ação (renovar/desativar)
async function handleAction(e) {
    e.preventDefault();

    const modalAdminKeyEl = document.getElementById('modal-admin-key');
    const daysInputEl = document.getElementById('days-input');
    const actionKeyEl = document.getElementById('action-key');
    
    if (!modalAdminKeyEl || !actionKeyEl) return;

    const adminKey = modalAdminKeyEl.value;
    const days = daysInputEl ? daysInputEl.value : null;
    const key = actionKeyEl.value;

    if (!adminKey) {
        showNotification('Digite a chave de administrador', 'error');
        return;
    }

    if (window.currentAction === 'renew' && (!days || days < 1)) {
        showNotification('Digite um número válido de dias', 'error');
        return;
    }

    try {
        let endpoint, body;

        if (window.currentAction === 'renew') {
            endpoint = '/renovar';
            body = { key, adminKey, dias: parseInt(days) };
        } else if (window.currentAction === 'disable') {
            endpoint = '/desativar';
            body = { key, adminKey };
        } else if (window.currentAction === 'delete') {
            endpoint = '/deletar';
            body = { key, adminKey };
        }

        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });

        const result = await response.json();

        if (result.status) {
            showNotification(result.msg, 'success');
            closeModal();
            loadStats();
            loadKeys();
        } else {
            showNotification(result.msg, 'error');
        }

    } catch (error) {
        console.error('Erro na ação:', error);
        showNotification('Erro ao executar ação', 'error');
    }
}

// Copiar key para clipboard
function copyToClipboard() {
    const keyEl = document.getElementById('generated-key');
    if (!keyEl) return;
    
    const keyText = keyEl.textContent;
    navigator.clipboard.writeText(keyText).then(() => {
        showNotification('Key copiada para a área de transferência!', 'success');
    }).catch(() => {
        // Fallback
        const textArea = document.createElement('textarea');
        textArea.value = keyText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showNotification('Key copiada!', 'success');
    });
}

// Mostrar notificações
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <i class="fas ${getNotificationIcon(type)}"></i>
        ${message}
    `;

    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        background: getNotificationColor(type),
        color: 'white',
        padding: '15px 20px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
        zIndex: '10000',
        fontWeight: '600',
        fontSize: '0.95rem',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        animation: 'slideInRight 0.3s ease-out'
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 5000);
}

// Ícone da notificação
function getNotificationIcon(type) {
    switch (type) {
        case 'success': return 'fa-check-circle';
        case 'error': return 'fa-exclamation-circle';
        case 'warning': return 'fa-exclamation-triangle';
        default: return 'fa-info-circle';
    }
}

// Cor da notificação
function getNotificationColor(type) {
    switch (type) {
        case 'success': return '#10b981';
        case 'error': return '#ef4444';
        case 'warning': return '#f59e0b';
        default: return '#6366f1';
    }
}

// Inicialização quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    try {
        // Carregar dados iniciais
        loadStats();
        
        // Adicionar event listeners aos formulários
        const generateForm = document.getElementById('generate-form');
        if (generateForm) {
            generateForm.addEventListener('submit', handleGenerateKey);
        }

        const actionForm = document.getElementById('action-form');
        if (actionForm) {
            actionForm.addEventListener('submit', handleAction);
        }

        // Modal close button
        const modalClose = document.querySelector('.modal-close');
        if (modalClose) {
            modalClose.addEventListener('click', closeModal);
        }

        // Modal background click
        const modal = document.getElementById('action-modal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal();
            });
        }

        // Animate styles
        const style = document.createElement('style');
        style.textContent = `
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }

            @keyframes slideOutRight {
                from {
                    transform: translateX(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);

    } catch (error) {
        console.error('Erro na inicialização:', error);
    }
});