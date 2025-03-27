// Elementos do DOM
const elements = {
    fromAmount: document.querySelector('#fromAmount'),
    toAmount: document.querySelector('#toAmount'),
    fromCurrencySelect: document.querySelector('#fromCurrencySelect'),
    toCurrencySelect: document.querySelector('#toCurrencySelect'),
    fromFlag: document.querySelector('#fromFlag'),
    toFlag: document.querySelector('#toFlag'),
    fromCurrencyCode: document.querySelector('#fromCurrencySelect .currency-code'),
    toCurrencyCode: document.querySelector('#toCurrencySelect .currency-code'),
    swapButton: document.querySelector('#swapButton'),
    rateInfo: document.querySelector('#rateInfo'),
    rateValue: document.querySelector('#rateValue'),
    rateTime: document.querySelector('#rateTime'),
    modal: document.querySelector('#currencyModal'),
    closeModal: document.querySelector('.close-modal'),
    searchInput: document.querySelector('#searchCurrency'),
    currencyList: document.querySelector('.currency-list')
};

// Estado da aplicação
const state = {
    fromCurrency: 'BRL',
    toCurrency: 'USD',
    amount: 0,
    rate: 0,
    lastUpdate: null,
    loading: false,
    currentSelectTarget: null
};

// Mapeamento de moedas para seus nomes completos
const CURRENCY_NAMES = {
    'BRL': 'Real Brasileiro',
    'USD': 'Dólar Americano',
    'EUR': 'Euro',
    'GBP': 'Libra Esterlina',
    'JPY': 'Iene Japonês',
    'CNY': 'Yuan Chinês',
    'AUD': 'Dólar Australiano',
    'CAD': 'Dólar Canadense',
    'CHF': 'Franco Suíço',
    'NZD': 'Dólar Neozelandês',
    'ARS': 'Peso Argentino',
    'CLP': 'Peso Chileno',
    'COP': 'Peso Colombiano',
    'MXN': 'Peso Mexicano',
    'PEN': 'Sol Peruano',
    'UYU': 'Peso Uruguaio',
    'VES': 'Bolívar Venezuelano'
};

// Mapeamento de moedas para bandeiras
const FLAGS = {
    'BRL': 'https://flagcdn.com/w80/br.png',
    'USD': 'https://flagcdn.com/w80/us.png',
    'EUR': 'https://flagcdn.com/w80/eu.png',
    'GBP': 'https://flagcdn.com/w80/gb.png',
    'JPY': 'https://flagcdn.com/w80/jp.png',
    'CNY': 'https://flagcdn.com/w80/cn.png',
    'AUD': 'https://flagcdn.com/w80/au.png',
    'CAD': 'https://flagcdn.com/w80/ca.png',
    'CHF': 'https://flagcdn.com/w80/ch.png',
    'NZD': 'https://flagcdn.com/w80/nz.png',
    'ARS': 'https://flagcdn.com/w80/ar.png',
    'CLP': 'https://flagcdn.com/w80/cl.png',
    'COP': 'https://flagcdn.com/w80/co.png',
    'MXN': 'https://flagcdn.com/w80/mx.png',
    'PEN': 'https://flagcdn.com/w80/pe.png',
    'UYU': 'https://flagcdn.com/w80/uy.png',
    'VES': 'https://flagcdn.com/w80/ve.png'
};

// Função para formatar números com 2 casas decimais
function formatNumber(number) {
    return new Intl.NumberFormat('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(number);
}

// Função para formatar a data atual
function formatDateTime() {
    return new Intl.DateTimeFormat('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date());
}

// Função de debounce para evitar chamadas excessivas à API
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Handler para mudança no valor
const handleAmountChange = debounce((event) => {
    const value = event.target.value.replace(/[^0-9.,]/g, '').replace(',', '.');
    state.amount = parseFloat(value) || 0;
    
    if (state.amount > 0) {
        elements.toAmount.classList.add('loading');
        elements.toAmount.value = 'Calculando...';
        updateExchangeRate().finally(() => {
            elements.toAmount.classList.remove('loading');
        });
    } else {
        elements.toAmount.value = '';
        elements.rateInfo.style.display = 'none';
    }
}, 1000);

// Função para atualizar a taxa de câmbio
async function updateExchangeRate() {
    if (state.loading || state.amount <= 0) return;
    
    try {
        state.loading = true;
        elements.toAmount.classList.add('loading');
        elements.toAmount.value = 'Calculando...';
        
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${state.fromCurrency}`);
        const data = await response.json();
        
        state.rate = data.rates[state.toCurrency];
        state.lastUpdate = new Date();
        
        // Atualiza a interface
        updateUI();
    } catch (error) {
        console.error('Erro ao buscar taxa de câmbio:', error);
        elements.toAmount.value = 'Erro ao converter';
    } finally {
        state.loading = false;
        elements.toAmount.classList.remove('loading');
    }
}

// Função para atualizar a interface
function updateUI() {
    // Atualiza o valor convertido
    if (state.amount && state.rate) {
        const convertedAmount = state.amount * state.rate;
        elements.toAmount.value = formatNumber(convertedAmount);
    }
    
    // Atualiza a informação da taxa
    if (state.rate) {
        elements.rateValue.textContent = `1 ${state.fromCurrency} = ${formatNumber(state.rate)} ${state.toCurrency}`;
        elements.rateTime.textContent = `Atualizado em ${formatDateTime()}`;
        elements.rateInfo.style.display = 'flex';
    }
}

// Função para trocar as moedas
function swapCurrencies() {
    [state.fromCurrency, state.toCurrency] = [state.toCurrency, state.fromCurrency];
    
    // Atualiza os elementos visuais
    elements.fromFlag.src = FLAGS[state.fromCurrency];
    elements.fromFlag.alt = state.fromCurrency;
    elements.fromCurrencyCode.textContent = state.fromCurrency;
    
    elements.toFlag.src = FLAGS[state.toCurrency];
    elements.toFlag.alt = state.toCurrency;
    elements.toCurrencyCode.textContent = state.toCurrency;
    
    // Limpa os valores
    state.amount = 0;
    elements.fromAmount.value = '';
    elements.toAmount.value = '';
    elements.rateInfo.style.display = 'none';
}

// Função para abrir o modal
function openModal(selectTarget) {
    state.currentSelectTarget = selectTarget;
    elements.modal.classList.add('show');
    elements.searchInput.value = '';
    renderCurrencyList();
    elements.searchInput.focus();
}

// Função para fechar o modal
function closeModal() {
    elements.modal.classList.remove('show');
    state.currentSelectTarget = null;
}

// Função para renderizar a lista de moedas
function renderCurrencyList(searchTerm = '') {
    const currencies = Object.entries(CURRENCY_NAMES)
        .filter(([code, name]) => {
            const search = searchTerm.toLowerCase();
            return code.toLowerCase().includes(search) || 
                   name.toLowerCase().includes(search);
        })
        .sort((a, b) => {
            // Prioriza BRL, USD, EUR, GBP
            const priority = ['BRL', 'USD', 'EUR', 'GBP'];
            const indexA = priority.indexOf(a[0]);
            const indexB = priority.indexOf(b[0]);
            
            if (indexA !== -1 && indexB !== -1) return indexA - indexB;
            if (indexA !== -1) return -1;
            if (indexB !== -1) return 1;
            
            return a[1].localeCompare(b[1]);
        });

    elements.currencyList.innerHTML = currencies.map(([code, name]) => `
        <div class="currency-item ${code === (state.currentSelectTarget === 'from' ? state.fromCurrency : state.toCurrency) ? 'selected' : ''}" data-code="${code}">
            <img src="${FLAGS[code]}" alt="${code}">
            <div class="currency-item-info">
                <span class="currency-item-code">${code}</span>
                <span class="currency-item-name">${name}</span>
            </div>
        </div>
    `).join('');
}

// Função para atualizar a moeda selecionada
function updateCurrency(code) {
    if (state.currentSelectTarget === 'from') {
        state.fromCurrency = code;
        elements.fromFlag.src = FLAGS[code];
        elements.fromFlag.alt = code;
        elements.fromCurrencyCode.textContent = code;
    } else {
        state.toCurrency = code;
        elements.toFlag.src = FLAGS[code];
        elements.toFlag.alt = code;
        elements.toCurrencyCode.textContent = code;
    }

    if (state.amount > 0) {
        elements.toAmount.classList.add('loading');
        elements.toAmount.value = 'Calculando...';
        updateExchangeRate().finally(() => {
            elements.toAmount.classList.remove('loading');
        });
    }

    closeModal();
}

// Inicialização e Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    // Event Listeners para o input de valor
    elements.fromAmount.addEventListener('input', handleAmountChange);
    
    // Event Listeners para os seletores de moeda
    elements.fromCurrencySelect.addEventListener('click', () => openModal('from'));
    elements.toCurrencySelect.addEventListener('click', () => openModal('to'));
    
    // Event Listeners para o botão de troca
    elements.swapButton.addEventListener('click', swapCurrencies);
    
    // Event Listeners para o modal
    elements.closeModal.addEventListener('click', closeModal);
    elements.modal.addEventListener('click', (e) => {
        if (e.target === elements.modal) closeModal();
    });
    
    // Event Listeners para busca de moedas
    elements.searchInput.addEventListener('input', (e) => {
        renderCurrencyList(e.target.value);
    });
    
    // Event Listeners para seleção de moeda
    elements.currencyList.addEventListener('click', (e) => {
        const currencyItem = e.target.closest('.currency-item');
        if (!currencyItem) return;
        
        const code = currencyItem.dataset.code;
        updateCurrency(code);
    });
}); 
