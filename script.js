document.addEventListener('DOMContentLoaded', () => {
    const amountInput = document.getElementById('amount');
    const fromCurrency = document.getElementById('fromCurrency');
    const toCurrency = document.getElementById('toCurrency');
    const swapButton = document.getElementById('swapButton');
    const convertButton = document.getElementById('convertButton');
    const resultCard = document.getElementById('resultCard');
    const resultAmount = document.getElementById('resultAmount');
    const resultCurrency = document.getElementById('resultCurrency');
    const exchangeRate = document.getElementById('exchangeRate');
    const serviceFee = document.getElementById('serviceFee');
    const iofFee = document.getElementById('iofFee');
    const totalFee = document.getElementById('totalFee');

    // Configuração comum para o Select2
    const select2Config = {
        width: '100%',
        minimumResultsForSearch: 8,
        templateResult: formatCurrencyOption,
        templateSelection: formatCurrencyOption,
        escapeMarkup: markup => markup
    };

    // Função para formatar as opções do select
    function formatCurrencyOption(currency) {
        if (!currency.id) return currency.text;
        const code = currency.id;
        const name = currency.text.split(' - ')[1];
        return `<div class="currency-option">
                    <strong>${code}</strong>
                    <span class="currency-name">${name}</span>
                </div>`;
    }

    // Inicializa o Select2
    $(fromCurrency).select2(select2Config);
    $(toCurrency).select2(select2Config);

    // Função para formatar valores monetários
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };

    // Função para fazer a requisição à API
    const fetchQuote = async (sourceCurrency, targetCurrency, amount) => {
        try {
            const response = await fetch(`https://api.exchangerate-api.com/v4/latest/${sourceCurrency}`);
            
            if (!response.ok) {
                throw new Error('Erro ao obter cotação');
            }

            const data = await response.json();
            const rate = data.rates[targetCurrency];
            const convertedAmount = amount * rate;

            // Simulando taxas para demonstração
            const serviceFeeAmount = amount * 0.01; // 1% de taxa de serviço
            const iofAmount = amount * 0.0038; // 0.38% de IOF
            const totalFeeAmount = serviceFeeAmount + iofAmount;

            return {
                sourceCurrency,
                targetCurrency,
                rate,
                sourceAmount: amount,
                targetAmount: convertedAmount,
                serviceFeeAmount,
                iofAmount,
                totalFeeAmount
            };
        } catch (error) {
            console.error('Erro:', error);
            throw error;
        }
    };

    // Função para atualizar o resultado
    const updateResult = (data) => {
        resultAmount.textContent = formatCurrency(data.targetAmount, data.targetCurrency);
        resultCurrency.textContent = data.targetCurrency;
        exchangeRate.textContent = `1 ${data.sourceCurrency} = ${data.rate.toFixed(4)} ${data.targetCurrency}`;
        serviceFee.textContent = formatCurrency(data.serviceFeeAmount, data.sourceCurrency);
        iofFee.textContent = formatCurrency(data.iofAmount, data.sourceCurrency);
        totalFee.textContent = formatCurrency(data.totalFeeAmount, data.sourceCurrency);

        resultCard.classList.add('visible');
    };

    // Event listener para o botão de troca
    swapButton.addEventListener('click', () => {
        const fromValue = $(fromCurrency).val();
        const toValue = $(toCurrency).val();
        
        $(fromCurrency).val(toValue).trigger('change');
        $(toCurrency).val(fromValue).trigger('change');
    });

    // Event listener para o botão de conversão
    convertButton.addEventListener('click', async () => {
        const amount = parseFloat(amountInput.value);
        if (!amount || amount <= 0) {
            alert('Por favor, insira um valor válido');
            return;
        }

        try {
            convertButton.disabled = true;
            convertButton.textContent = 'Convertendo...';

            const data = await fetchQuote(
                $(fromCurrency).val(),
                $(toCurrency).val(),
                amount
            );

            updateResult(data);
        } catch (error) {
            alert('Erro ao obter cotação. Por favor, tente novamente.');
        } finally {
            convertButton.disabled = false;
            convertButton.textContent = 'Converter';
        }
    });

    // Event listener para tecla Enter no input de valor
    amountInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            convertButton.click();
        }
    });
}); 
