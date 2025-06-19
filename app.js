// Başlıca para birimleri ve açıklamaları
const mainCurrencies = [
    { code: 'USD', desc: 'Amerikan Doları' },
    { code: 'EUR', desc: 'Euro' },
    { code: 'GBP', desc: 'İngiliz Sterlini' },
    { code: 'TRY', desc: 'Türk Lirası' },
    { code: 'JPY', desc: 'Japon Yeni' },
    { code: 'CHF', desc: 'İsviçre Frangı' },
    { code: 'CAD', desc: 'Kanada Doları' },
    { code: 'AUD', desc: 'Avustralya Doları' },
    { code: 'RUB', desc: 'Rus Rublesi' },
    { code: 'CNY', desc: 'Çin Yuanı' }
];

// Para birimi listesini doldur (sabit)
function loadCurrencies() {
    const fromSelect = document.getElementById('from');
    const toSelect = document.getElementById('to');
    fromSelect.innerHTML = '';
    toSelect.innerHTML = '';
    for (const currency of mainCurrencies) {
        const option1 = document.createElement('option');
        option1.value = currency.code;
        option1.textContent = `${currency.code} - ${currency.desc}`;
        fromSelect.appendChild(option1);
        const option2 = document.createElement('option');
        option2.value = currency.code;
        option2.textContent = `${currency.code} - ${currency.desc}`;
        toSelect.appendChild(option2);
    }
    fromSelect.value = 'USD';
    toSelect.value = 'TRY';
}

// Hesaplama fonksiyonu (Frankfurter API)
async function convertCurrency() {
    const amount = document.getElementById('amount').value;
    const from = document.getElementById('from').value;
    const to = document.getElementById('to').value;
    const resultDiv = document.getElementById('result');
    resultDiv.textContent = 'Hesaplanıyor...';
    try {
        // Frankfurter API: https://www.frankfurter.app/docs/
        // Örnek: https://api.frankfurter.app/latest?amount=1&from=USD&to=TRY
        const res = await fetch(`https://api.frankfurter.app/latest?amount=${amount}&from=${from}&to=${to}`);
        const data = await res.json();
        if (data.rates && data.rates[to] !== undefined) {
            resultDiv.textContent = `${amount} ${from} = ${data.rates[to].toFixed(2)} ${to}`;
        } else {
            resultDiv.textContent = 'Hesaplama başarısız.';
        }
    } catch (e) {
        resultDiv.textContent = 'API hatası.';
    }
}

// Sayfa yüklenince para birimlerini getir
window.onload = loadCurrencies; 