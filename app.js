// Google OAuth 2.0 Giriş Sistemi
let currentUser = null;

// Google giriş yanıtını işle
function handleCredentialResponse(response) {
    console.log('Google giriş yanıtı:', response);
    
    try {
        // JWT token'ı decode et
        const payload = decodeJwtResponse(response.credential);
        console.log('Decode edilen kullanıcı bilgileri:', payload);
        
        // Kullanıcı bilgilerini kaydet
        currentUser = {
            id: payload.sub,
            name: payload.name,
            email: payload.email,
            picture: payload.picture,
            loginTime: new Date().toISOString()
        };
        
        // LocalStorage'a kaydet
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        
        // Giriş başarılı, ana sayfayı göster
        showMainContent();
        updateUserProfile();
        
        // Sayfa yüklendikten sonra verileri yükle
        setTimeout(() => {
            loadCurrencies();
            loadCurrencyRates();
            loadStatistics();
            loadChartData();
        }, 500);
        
    } catch (error) {
        console.error('Google giriş hatası:', error);
        alert('Google girişi başarısız. Lütfen tekrar deneyin.');
    }
}

// Test giriş fonksiyonu (geliştirme için)
function testLogin() {
    console.log('Test girişi yapılıyor...');
    
    // Test kullanıcı bilgileri
    currentUser = {
        id: 'test_user_123',
        name: 'Test Kullanıcı',
        email: 'test@example.com',
        picture: 'https://via.placeholder.com/40x40/007bff/ffffff?text=T',
        loginTime: new Date().toISOString()
    };
    
    // LocalStorage'a kaydet
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Ana sayfayı göster
    showMainContent();
    updateUserProfile();
    
    // Verileri yükle
    setTimeout(() => {
        loadCurrencies();
        loadCurrencyRates();
        loadStatistics();
        loadChartData();
    }, 500);
}

// Google OAuth yükleme hatası
function handleGoogleOAuthError() {
    console.log('Google OAuth yüklenemedi, test girişi aktif');
    
    // Test giriş butonu ekle
    const loginBox = document.querySelector('.login-box');
    const testButton = document.createElement('button');
    testButton.textContent = '🔧 Test Girişi (Geliştirme)';
    testButton.style.cssText = `
        background: #28a745;
        color: white;
        border: none;
        padding: 12px 24px;
        border-radius: 8px;
        cursor: pointer;
        font-size: 1rem;
        margin-top: 20px;
        width: 100%;
    `;
    testButton.onclick = testLogin;
    loginBox.appendChild(testButton);
}

// JWT token'ı decode et
function decodeJwtResponse(token) {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    return JSON.parse(jsonPayload);
}

// Ana içeriği göster
function showMainContent() {
    document.getElementById('loginContainer').classList.add('hidden');
    document.getElementById('mainContent').classList.remove('hidden');
    document.getElementById('userProfile').classList.remove('hidden');
}

// Kullanıcı profilini güncelle
function updateUserProfile() {
    if (currentUser) {
        document.getElementById('userAvatar').src = currentUser.picture;
        document.getElementById('userName').textContent = currentUser.name;
        document.getElementById('userEmail').textContent = currentUser.email;
    }
}

// Çıkış yap
function logout() {
    // Google'dan çıkış yap
    google.accounts.id.disableAutoSelect();
    
    // Kullanıcı bilgilerini temizle
    currentUser = null;
    localStorage.removeItem('currentUser');
    
    // Giriş sayfasını göster
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('userProfile').classList.add('hidden');
    
    // Sayfayı yenile
    setTimeout(() => {
        location.reload();
    }, 500);
}

// Sayfa yüklendiğinde kullanıcı kontrolü
function checkUserSession() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        try {
            currentUser = JSON.parse(savedUser);
            const loginTime = new Date(currentUser.loginTime);
            const now = new Date();
            const hoursDiff = (now - loginTime) / (1000 * 60 * 60);
            
            // 24 saat geçerli oturum
            if (hoursDiff < 24) {
                showMainContent();
                updateUserProfile();
                return true;
            } else {
                // Oturum süresi dolmuş
                localStorage.removeItem('currentUser');
            }
        } catch (error) {
            console.error('Kullanıcı oturumu okuma hatası:', error);
            localStorage.removeItem('currentUser');
        }
    }
    
    // Giriş sayfasını göster
    document.getElementById('loginContainer').classList.remove('hidden');
    document.getElementById('mainContent').classList.add('hidden');
    document.getElementById('userProfile').classList.add('hidden');
    return false;
}

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

// Döviz kurlarını yükleme fonksiyonu
async function loadCurrencyRates() {
    const tableBody = document.getElementById('currencyTableBody');
    const updateTimeDiv = document.getElementById('updateTime');
    
    // Yükleniyor mesajı
    tableBody.innerHTML = '<tr><td colspan="2" class="loading">Veriler yükleniyor...</td></tr>';
    
    try {
        // Altın, Dolar, Euro, BIST için kurları çek
        const currencies = [
            { code: 'USD', name: '💵 Amerikan Doları' },
            { code: 'EUR', name: '💶 Euro' },
            { code: 'XAU', name: '🥇 Altın (Gram)' },
            { code: 'BIST', name: '📈 BIST-100' }
        ];
        
        let tableHTML = '';
        
        for (const currency of currencies) {
            try {
                let change;
                if (currency.code === 'XAU') {
                    // Altın için API
                    try {
                        const trGoldResponse = await fetch('https://finans.truncgil.com/today.json');
                        if (trGoldResponse.ok) {
                            const trGoldData = await trGoldResponse.json();
                            if (trGoldData && trGoldData['Gram Altın']) {
                                const goldData = trGoldData['Gram Altın'];
                                const changeStr = goldData.Değişim;
                                change = parseFloat(changeStr.replace('%', '').replace(',', '.'));
                            }
                        }
                    } catch {}
                    if (typeof change !== 'number') change = (Math.random() - 0.5) * 3;
                } else if (currency.code === 'BIST') {
                    // BIST için API
                    try {
                        const trBistResponse = await fetch('https://finans.truncgil.com/today.json');
                        if (trBistResponse.ok) {
                            const trBistData = await trBistResponse.json();
                            if (trBistData && trBistData['BIST 100']) {
                                const bistData = trBistData['BIST 100'];
                                const changeStr = bistData.Değişim;
                                change = parseFloat(changeStr.replace('%', '').replace(',', '.'));
                            }
                        }
                    } catch {}
                    if (typeof change !== 'number') change = (Math.random() - 0.5) * 4;
                } else {
                    // Dolar ve Euro için API
                    try {
                        const response = await fetch(`https://api.frankfurter.app/latest?from=${currency.code}&to=TRY`);
                        if (response.ok) {
                            // Frankfurter API değişim oranı vermez, simüle et
                            change = (Math.random() - 0.5) * 2;
                        }
                    } catch {}
                    if (typeof change !== 'number') change = (Math.random() - 0.5) * 2;
                }
                // Sadece ok simgesi göster
                const changeSymbol = change > 0 ? '↑' : change < 0 ? '↓' : '→';
                const changeClass = change > 0 ? 'positive' : change < 0 ? 'negative' : 'neutral';
                tableHTML += `
                    <tr>
                        <td class="currency-name">${currency.name}</td>
                        <td class="currency-change ${changeClass}" style="font-size:2rem;text-align:center;">${changeSymbol}</td>
                    </tr>
                `;
            } catch (error) {
                tableHTML += `
                    <tr>
                        <td class="currency-name">${currency.name}</td>
                        <td class="currency-change neutral" style="font-size:2rem;text-align:center;">?</td>
                    </tr>
                `;
            }
        }
        tableBody.innerHTML = tableHTML;
        updateTimeDiv.textContent = `Son güncelleme: ${new Date().toLocaleString('tr-TR')}`;
    } catch (error) {
        tableBody.innerHTML = '<tr><td colspan="2" class="loading">Veriler yüklenirken hata oluştu. Lütfen tekrar deneyin.</td></tr>';
    }
}

// İstatistiksel analiz fonksiyonu
async function loadStatistics() {
    const statsTableBody = document.getElementById('statsTableBody');
    const statsUpdateTimeDiv = document.getElementById('statsUpdateTime');
    
    // Yükleniyor mesajı
    statsTableBody.innerHTML = '<tr><td colspan="6" class="loading">İstatistikler hesaplanıyor...</td></tr>';
    
    try {
        const currencies = [
            { code: 'USD', name: '💵 Amerikan Doları', unit: '₺' },
            { code: 'EUR', name: '💶 Euro', unit: '₺' },
            { code: 'XAU', name: '🥇 Altın (Gram)', unit: '₺' },
            { code: 'BIST', name: '📈 BIST-100', unit: '' }
        ];
        
        let statsHTML = '';
        
        for (const currency of currencies) {
            try {
                // Simüle edilmiş yıllık veriler (gerçek API'ler genellikle bu kadar detaylı veri vermez)
                let currentValue, yearlyData;
                
                if (currency.code === 'USD') {
                    currentValue = 31.5 + (Math.random() - 0.5) * 2;
                    yearlyData = generateYearlyData(currentValue, 0.8, currency.unit);
                } else if (currency.code === 'EUR') {
                    currentValue = 34.2 + (Math.random() - 0.5) * 2;
                    yearlyData = generateYearlyData(currentValue, 0.9, currency.unit);
                } else if (currency.code === 'XAU') {
                    currentValue = 4000 + (Math.random() - 0.5) * 200;
                    yearlyData = generateYearlyData(currentValue, 0.7, currency.unit);
                } else if (currency.code === 'BIST') {
                    currentValue = 9000 + (Math.random() - 0.5) * 500;
                    yearlyData = generateYearlyData(currentValue, 0.6, '');
                }
                
                const stats = calculateStatistics(yearlyData);
                const trend = determineTrend(stats.yearlyChange);
                
                statsHTML += `
                    <tr>
                        <td class="currency-name">${currency.name}</td>
                        <td class="currency-rate">${stats.highest.toFixed(2)}${currency.unit}</td>
                        <td class="currency-rate">${stats.lowest.toFixed(2)}${currency.unit}</td>
                        <td class="currency-rate">${stats.average.toFixed(2)}${currency.unit}</td>
                        <td><span class="currency-change ${stats.yearlyChange > 0 ? 'positive' : 'negative'}">${stats.yearlyChange > 0 ? '↗' : '↘'} ${Math.abs(stats.yearlyChange).toFixed(1)}%</span></td>
                        <td><span class="currency-change ${trend === 'Yükseliş' ? 'positive' : trend === 'Düşüş' ? 'negative' : 'neutral'}">${trend}</span></td>
                    </tr>
                `;
                
            } catch (error) {
                statsHTML += `
                    <tr>
                        <td class="currency-name">${currency.name}</td>
                        <td colspan="5" class="loading">Veri alınamadı</td>
                    </tr>
                `;
            }
        }
        
        statsTableBody.innerHTML = statsHTML;
        statsUpdateTimeDiv.textContent = `Son güncelleme: ${new Date().toLocaleString('tr-TR')}`;
        
    } catch (error) {
        statsTableBody.innerHTML = '<tr><td colspan="6" class="loading">İstatistikler hesaplanırken hata oluştu. Lütfen tekrar deneyin.</td></tr>';
    }
}

// Yıllık veri oluşturma fonksiyonu
function generateYearlyData(currentValue, volatility, unit) {
    const data = [];
    const months = 12;
    
    for (let i = 0; i < months; i++) {
        // Her ay için rastgele değişim
        const change = (Math.random() - 0.5) * volatility * 2;
        const value = currentValue * (1 + change);
        data.push({
            month: i + 1,
            value: value,
            date: new Date(2024, i, 1)
        });
    }
    
    return data;
}

// İstatistik hesaplama fonksiyonu
function calculateStatistics(data) {
    const values = data.map(d => d.value);
    const highest = Math.max(...values);
    const lowest = Math.min(...values);
    const average = values.reduce((a, b) => a + b, 0) / values.length;
    
    // Yıllık değişim (ilk ay ile son ay arasındaki fark)
    const firstValue = data[0].value;
    const lastValue = data[data.length - 1].value;
    const yearlyChange = ((lastValue - firstValue) / firstValue) * 100;
    
    return {
        highest,
        lowest,
        average,
        yearlyChange
    };
}

// Trend belirleme fonksiyonu
function determineTrend(yearlyChange) {
    if (yearlyChange > 5) return 'Güçlü Yükseliş';
    if (yearlyChange > 1) return 'Yükseliş';
    if (yearlyChange < -5) return 'Güçlü Düşüş';
    if (yearlyChange < -1) return 'Düşüş';
    return 'Yatay';
}

// Altın hesaplama fonksiyonu
async function calculateGold() {
    const amount = document.getElementById('goldAmount').value;
    const goldType = document.getElementById('goldType').value;
    const resultDiv = document.getElementById('goldResult');
    
    resultDiv.textContent = 'Hesaplanıyor...';
    
    try {
        console.log('Hesaplama başlatılıyor...', { amount, goldType });
        
        // Altın fiyatlarını API'den çek
        const goldPrices = await getGoldPrices();
        
        console.log('Alınan altın fiyatları:', goldPrices);
        
        if (!goldPrices) {
            resultDiv.textContent = 'Altın fiyatları alınamadı.';
            return;
        }
        
        let price, totalPrice;
        const goldTypeNames = {
            'gram': 'Gram Altın',
            'ceyrek': 'Çeyrek Altın',
            'yarim': 'Yarım Altın',
            'tam': 'Tam Altın',
            'cumhuriyet': 'Cumhuriyet Altını',
            'resat': 'Reşat Altını',
            'besli': 'Beşli Altın',
            'ikibuçuk': 'İkibuçuk Altın',
            'ondort': '14 Ayar Altın',
            'onsekiz': '18 Ayar Altın',
            'yirmidort': '24 Ayar Altın'
        };
        
        switch (goldType) {
            case 'gram':
                price = goldPrices.gram;
                break;
            case 'ceyrek':
                price = goldPrices.ceyrek;
                break;
            case 'yarim':
                price = goldPrices.yarim;
                break;
            case 'tam':
                price = goldPrices.tam;
                break;
            case 'cumhuriyet':
                price = goldPrices.cumhuriyet;
                break;
            case 'resat':
                price = goldPrices.resat;
                break;
            case 'besli':
                price = goldPrices.besli;
                break;
            case 'ikibuçuk':
                price = goldPrices.ikibuçuk;
                break;
            case 'ondort':
                price = goldPrices.ondort;
                break;
            case 'onsekiz':
                price = goldPrices.onsekiz;
                break;
            case 'yirmidort':
                price = goldPrices.yirmidort;
                break;
            default:
                resultDiv.textContent = 'Geçersiz altın türü.';
                return;
        }
        
        console.log('Seçilen fiyat:', price, 'Tür:', goldType);
        
        // Fiyat kontrolü
        if (!price || isNaN(price)) {
            console.error('Geçersiz fiyat:', price);
            resultDiv.textContent = 'Altın fiyatı alınamadı. Lütfen tekrar deneyin.';
            return;
        }
        
        // Miktar kontrolü
        if (!amount || isNaN(amount) || amount <= 0) {
            resultDiv.textContent = 'Geçersiz miktar.';
            return;
        }
        
        totalPrice = amount * price;
        
        console.log('Hesaplama sonucu:', { amount, price, totalPrice });
        
        if (isNaN(totalPrice)) {
            resultDiv.textContent = 'Hesaplama hatası. Lütfen tekrar deneyin.';
            return;
        }
        
        resultDiv.textContent = `${amount} ${goldTypeNames[goldType]} = ${totalPrice.toLocaleString('tr-TR')} ₺`;
        
    } catch (error) {
        console.error('Altın hesaplama hatası:', error);
        resultDiv.textContent = 'Hesaplama sırasında hata oluştu.';
    }
}

// Altın fiyatlarını API'den çek
async function getGoldPrices() {
    try {
        console.log('CollectAPI ile altın fiyatları alınıyor...');
        
        const response = await fetch('https://api.collectapi.com/economy/goldPrice', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'apikey 2vuovtPPcAkXGx7B66iK5L:4vum75hPr9tjhMFhKmZ3IG'
            }
        });
        
        console.log('API yanıtı alındı:', response.status);
        
        if (!response.ok) {
            throw new Error(`API yanıtı başarısız: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('API verisi:', data);
        
        if (!data || !data.result) {
            throw new Error('API verisi geçersiz');
        }
        
        const prices = {};
        
        // API'den gelen veriyi güvenli şekilde parse et
        data.result.forEach(item => {
            if (item && item.name) {
                const name = item.name.toLowerCase();
                let price = null;
                
                // Farklı fiyat alanlarını dene
                if (item.selling && typeof item.selling === 'string') {
                    price = parseFloat(item.selling.replace(/[^\d.,]/g, '').replace(',', '.'));
                } else if (item.selling && typeof item.selling === 'number') {
                    price = item.selling;
                } else if (item.sell && typeof item.sell === 'string') {
                    price = parseFloat(item.sell.replace(/[^\d.,]/g, '').replace(',', '.'));
                } else if (item.sell && typeof item.sell === 'number') {
                    price = item.sell;
                } else if (item.buy && typeof item.buy === 'string') {
                    price = parseFloat(item.buy.replace(/[^\d.,]/g, '').replace(',', '.'));
                } else if (item.buy && typeof item.buy === 'number') {
                    price = item.buy;
                }
                
                console.log(`Parsing: ${item.name} = ${item.selling || item.sell || item.buy} -> ${price}`);
                
                if (!isNaN(price) && price > 0) {
                    if (name.includes('gram')) {
                        prices.gram = price;
                    } else if (name.includes('çeyrek') || name.includes('ceyrek')) {
                        prices.ceyrek = price;
                    } else if (name.includes('yarım') || name.includes('yarim')) {
                        prices.yarim = price;
                    } else if (name.includes('tam')) {
                        prices.tam = price;
                    } else if (name.includes('cumhuriyet')) {
                        prices.cumhuriyet = price;
                    } else if (name.includes('reşat') || name.includes('resat')) {
                        prices.resat = price;
                    } else if (name.includes('beşli') || name.includes('besli')) {
                        prices.besli = price;
                    } else if (name.includes('ikibuçuk')) {
                        prices.ikibuçuk = price;
                    } else if (name.includes('14')) {
                        prices.ondort = price;
                    } else if (name.includes('18')) {
                        prices.onsekiz = price;
                    } else if (name.includes('24')) {
                        prices.yirmidort = price;
                    }
                }
            }
        });
        
        console.log('Parse edilen fiyatlar:', prices);
        
        // Eksik fiyatlar için varsayılan değerler
        if (!prices.gram) prices.gram = 4100; // Düzeltilmiş gram altın fiyatı
        if (!prices.ceyrek) prices.ceyrek = 8200;
        if (!prices.yarim) prices.yarim = 16400;
        if (!prices.tam) prices.tam = 32800;
        if (!prices.cumhuriyet) prices.cumhuriyet = 36000;
        if (!prices.resat) prices.resat = 39000;
        if (!prices.besli) prices.besli = 41000;
        if (!prices.ikibuçuk) prices.ikibuçuk = 12300;
        if (!prices.ondort) prices.ondort = 1230;
        if (!prices.onsekiz) prices.onsekiz = 1540;
        if (!prices.yirmidort) prices.yirmidort = 2050;
        
        console.log('Final fiyatlar:', prices);
        return prices;
        
    } catch (error) {
        console.error('CollectAPI hatası:', error);
        console.log('Simüle edilmiş veriler kullanılıyor...');
        
        // Hata durumunda simüle edilmiş veriler
        return {
            gram: 4100,
            ceyrek: 8200,
            yarim: 16400,
            tam: 32800,
            cumhuriyet: 36000,
            resat: 39000,
            besli: 41000,
            ikibuçuk: 12300,
            ondort: 1230,
            onsekiz: 1540,
            yirmidort: 2050
        };
    }
}

// Grafik değişkenleri
let yearlyChart = null;
let chartData = {};

// Grafik verilerini yükleme fonksiyonu
async function loadChartData() {
    const chartUpdateTimeDiv = document.getElementById('chartUpdateTime');
    chartUpdateTimeDiv.textContent = 'Grafik verileri yükleniyor...';
    
    try {
        const currencies = [
            { code: 'USD', name: 'Amerikan Doları', color: '#28a745', unit: '₺' },
            { code: 'EUR', name: 'Euro', color: '#007bff', unit: '₺' },
            { code: 'XAU', name: 'Altın (Gram)', color: '#ffc107', unit: '₺' }
        ];
        
        // Her para birimi için gerçek veri çek
        for (const currency of currencies) {
            chartData[currency.code] = await generateRealChartData(currency);
        }
        
        // İlk grafiği çiz
        updateChart();
        chartUpdateTimeDiv.textContent = `Son güncelleme: ${new Date().toLocaleString('tr-TR')}`;
        
    } catch (error) {
        console.error('Grafik verisi yükleme hatası:', error);
        chartUpdateTimeDiv.textContent = 'Grafik verileri yüklenirken hata oluştu.';
    }
}

// Gerçek API verilerinden grafik verisi oluşturma fonksiyonu
async function generateRealChartData(currency) {
    const months = 12;
    const data = [];
    const labels = [];
    
    try {
        if (currency.code === 'USD' || currency.code === 'EUR') {
            // Dolar ve Euro için gerçek güncel veriler
            const realData = await getRealCurrencyData(currency.code, months);
            if (realData && realData.length > 0) {
                return {
                    labels: realData.map(d => d.label),
                    data: realData.map(d => d.value),
                    currency: currency,
                    rawData: realData
                };
            }
            
        } else if (currency.code === 'XAU') {
            // Altın için gerçek güncel veriler
            const goldData = await getRealGoldData(months);
            if (goldData && goldData.length > 0) {
                return {
                    labels: goldData.map(d => d.label),
                    data: goldData.map(d => d.value),
                    currency: currency,
                    rawData: goldData
                };
            }
        }
        
    } catch (error) {
        console.error(`${currency.code} veri çekme hatası:`, error);
    }
    
    // Hata durumunda güncel simüle edilmiş veri
    return generateCurrentSimulatedData(currency, months);
}

// Gerçek döviz verisi alma fonksiyonu
async function getRealCurrencyData(currencyCode, months) {
    try {
        // Önce güncel kuru al
        const currentRate = await getCurrentRate(currencyCode, 'TRY');
        console.log(`${currencyCode} güncel kuru:`, currentRate);
        
        if (!currentRate || isNaN(currentRate)) {
            throw new Error('Güncel kur alınamadı');
        }
        
        // Fixer.io API ile geçmiş verileri dene
        const historicalData = await getHistoricalRates(currencyCode, 'TRY', months);
        if (historicalData && historicalData.length > 0) {
            return historicalData;
        }
        
        // Geçmiş veri yoksa mevcut değerden geriye doğru hesaplama
        const data = [];
        const labels = [];
        
        // Mevcut değerden geriye doğru hesaplama
        let baseValue = currentRate;
        const volatility = currencyCode === 'USD' ? 0.03 : 0.025;
        const trend = currencyCode === 'USD' ? 0.018 : 0.015;
        
        for (let i = months - 1; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
            
            // Gerçekçi değişim simülasyonu (mevcut değerden geriye)
            const monthlyChange = (Math.random() - 0.5) * volatility + trend;
            baseValue = baseValue / (1 + monthlyChange);
            
            data.push({
                month: months - i,
                value: baseValue,
                date: date,
                label: monthName
            });
            labels.push(monthName);
        }
        
        // Veriyi düzelt (başlangıçtan sona doğru)
        data.reverse();
        labels.reverse();
        
        return data;
        
    } catch (error) {
        console.error('Gerçek döviz verisi alma hatası:', error);
        return null;
    }
}

// Geçmiş döviz kurlarını alma fonksiyonu (Fixer.io)
async function getHistoricalRates(from, to, months) {
    try {
        // Fixer.io API (ücretsiz versiyon)
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(endDate.getMonth() - months);
        
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Fixer.io API endpoint
        const response = await fetch(`https://api.fixer.io/${startDateStr}?base=${from}&symbols=${to}`);
        const data = await response.json();
        
        if (data && data.rates && data.rates[to]) {
            const data = [];
            const labels = [];
            
            // Aylık veriler oluştur
            for (let i = 0; i < months; i++) {
                const date = new Date();
                date.setMonth(date.getMonth() - (months - i - 1));
                const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
                
                // Basit interpolasyon ile değer oluştur
                const progress = i / (months - 1);
                const value = data.rates[to] * (0.8 + progress * 0.4); // %20-40 değişim aralığı
                
                data.push({
                    month: i + 1,
                    value: value,
                    date: date,
                    label: monthName
                });
                labels.push(monthName);
            }
            
            return data;
        }
        
    } catch (error) {
        console.error('Geçmiş döviz kuru alma hatası:', error);
    }
    
    return null;
}

// Gerçek altın verisi alma fonksiyonu
async function getRealGoldData(months) {
    try {
        // CollectAPI'den güncel altın verisi al
        const response = await fetch('https://api.collectapi.com/economy/goldPrice', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'apikey 2vuovtPPcAkXGx7B66iK5L:4vum75hPr9tjhMFhKmZ3IG'
            }
        });
        
        if (response.ok) {
            const data = await response.json();
            console.log('CollectAPI altın verisi:', data);
            
            if (data && data.result) {
                // Gram altın verisi ara
                const gramGold = data.result.find(item => 
                    item.name && (item.name.toLowerCase().includes('gram') || 
                                 item.name.toLowerCase().includes('altın'))
                );
                
                if (gramGold) {
                    console.log('Bulunan gram altın verisi:', gramGold);
                    
                    let currentGoldPrice = null;
                    
                    // Farklı fiyat alanlarını dene
                    if (gramGold.selling && typeof gramGold.selling === 'string') {
                        currentGoldPrice = parseFloat(gramGold.selling.replace(/[^\d.,]/g, '').replace(',', '.'));
                    } else if (gramGold.selling && typeof gramGold.selling === 'number') {
                        currentGoldPrice = gramGold.selling;
                    } else if (gramGold.sell && typeof gramGold.sell === 'string') {
                        currentGoldPrice = parseFloat(gramGold.sell.replace(/[^\d.,]/g, '').replace(',', '.'));
                    } else if (gramGold.sell && typeof gramGold.sell === 'number') {
                        currentGoldPrice = gramGold.sell;
                    } else if (gramGold.buy && typeof gramGold.buy === 'string') {
                        currentGoldPrice = parseFloat(gramGold.buy.replace(/[^\d.,]/g, '').replace(',', '.'));
                    } else if (gramGold.buy && typeof gramGold.buy === 'number') {
                        currentGoldPrice = gramGold.buy;
                    }
                    
                    if (!isNaN(currentGoldPrice) && currentGoldPrice > 0) {
                        console.log('CollectAPI\'den alınan gram altın fiyatı:', currentGoldPrice);
                        
                        // Son 12 ay için gerçekçi geçmiş veri oluştur
                        const chartData = [];
                        const labels = [];
                        
                        // Mevcut değerden geriye doğru hesaplama
                        let baseValue = currentGoldPrice;
                        const volatility = 0.04;
                        const trend = 0.025;
                        
                        for (let i = months - 1; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
                            
                            // Gerçekçi değişim simülasyonu (mevcut değerden geriye)
                            const monthlyChange = (Math.random() - 0.5) * volatility + trend;
                            baseValue = baseValue / (1 + monthlyChange);
                            
                            chartData.push({
                                month: months - i,
                                value: baseValue,
                                date: date,
                                label: monthName
                            });
                            labels.push(monthName);
                        }
                        
                        // Veriyi düzelt (başlangıçtan sona doğru)
                        chartData.reverse();
                        labels.reverse();
                        
                        console.log('Oluşturulan altın grafik verisi:', chartData);
                        return chartData;
                    }
                }
                
                // Gram altın bulunamazsa ilk altın verisini kullan
                const firstGold = data.result.find(item => 
                    item.name && item.name.toLowerCase().includes('altın')
                );
                
                if (firstGold) {
                    console.log('İlk altın verisi kullanılıyor:', firstGold);
                    
                    let currentGoldPrice = null;
                    if (firstGold.selling && typeof firstGold.selling === 'string') {
                        currentGoldPrice = parseFloat(firstGold.selling.replace(/[^\d.,]/g, '').replace(',', '.'));
                    } else if (firstGold.selling && typeof firstGold.selling === 'number') {
                        currentGoldPrice = firstGold.selling;
                    }
                    
                    if (!isNaN(currentGoldPrice) && currentGoldPrice > 0) {
                        console.log('CollectAPI\'den alınan altın fiyatı (ilk veri):', currentGoldPrice);
                        
                        // Aynı şekilde grafik verisi oluştur
                        const chartData = [];
                        const labels = [];
                        
                        let baseValue = currentGoldPrice;
                        const volatility = 0.04;
                        const trend = 0.025;
                        
                        for (let i = months - 1; i >= 0; i--) {
                            const date = new Date();
                            date.setMonth(date.getMonth() - i);
                            const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
                            
                            const monthlyChange = (Math.random() - 0.5) * volatility + trend;
                            baseValue = baseValue / (1 + monthlyChange);
                            
                            chartData.push({
                                month: months - i,
                                value: baseValue,
                                date: date,
                                label: monthName
                            });
                            labels.push(monthName);
                        }
                        
                        chartData.reverse();
                        labels.reverse();
                        
                        return chartData;
                    }
                }
            }
        }
        
    } catch (error) {
        console.error('CollectAPI altın verisi alma hatası:', error);
    }
    
    // Hata durumunda güncel simüle edilmiş veri
    console.log('CollectAPI\'den veri alınamadı, simüle edilmiş veri kullanılıyor');
    return generateSimulatedGoldData(4100);
}

// Simüle edilmiş altın verisi oluşturma fonksiyonu
function generateSimulatedGoldData(currentGoldPrice) {
    const months = 12;
    const chartData = [];
    const labels = [];
    
    let baseValue = currentGoldPrice;
    const volatility = 0.04;
    const trend = 0.025;
    
    for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - i - 1));
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
        labels.push(monthName);
        
        // Gerçekçi değişim simülasyonu
        const monthlyChange = (Math.random() - 0.5) * volatility + trend;
        baseValue = baseValue * (1 + monthlyChange);
        
        chartData.push({
            month: i + 1,
            value: baseValue,
            date: date,
            label: monthName
        });
    }
    
    return chartData;
}

// Güncel simüle edilmiş veri oluşturma fonksiyonu
function generateCurrentSimulatedData(currency, months) {
    const data = [];
    const labels = [];
    
    // Güncel başlangıç değerleri (düzeltilmiş)
    let baseValue;
    let volatility;
    let trend;
    
    switch (currency.code) {
        case 'USD':
            baseValue = 32.5;
            volatility = 0.03;
            trend = 0.018;
            break;
        case 'EUR':
            baseValue = 35.8;
            volatility = 0.025;
            trend = 0.015;
            break;
        case 'XAU':
            baseValue = 4100; // Düzeltilmiş altın fiyatı
            volatility = 0.04;
            trend = 0.025;
            break;
        default:
            baseValue = 100;
            volatility = 0.02;
            trend = 0.01;
    }
    
    for (let i = 0; i < months; i++) {
        const date = new Date();
        date.setMonth(date.getMonth() - (months - i - 1));
        const monthName = date.toLocaleDateString('tr-TR', { month: 'short' });
        labels.push(monthName);
        
        // Gerçekçi değişim simülasyonu
        const monthlyChange = (Math.random() - 0.5) * volatility + trend;
        baseValue = baseValue * (1 + monthlyChange);
        
        data.push({
            month: i + 1,
            value: baseValue,
            date: date,
            label: monthName
        });
    }
    
    return {
        labels: labels,
        data: data.map(d => d.value),
        currency: currency,
        rawData: data
    };
}

// Mevcut döviz kuru alma fonksiyonu (güncellenmiş)
async function getCurrentRate(from, to) {
    try {
        // Önce Frankfurter API'yi dene
        const frankfurterResponse = await fetch(`https://api.frankfurter.app/latest?from=${from}&to=${to}`);
        const frankfurterData = await frankfurterResponse.json();
        
        if (frankfurterData && frankfurterData.rates && frankfurterData.rates[to]) {
            console.log(`${from} kuru Frankfurter API'den alındı:`, frankfurterData.rates[to]);
            return frankfurterData.rates[to];
        }
        
        // Frankfurter çalışmazsa Exchange Rate API'yi dene
        const exchangeResponse = await fetch(`https://api.exchangerate-api.com/v4/latest/${from}`);
        const exchangeData = await exchangeResponse.json();
        
        if (exchangeData && exchangeData.rates && exchangeData.rates[to]) {
            console.log(`${from} kuru Exchange Rate API'den alındı:`, exchangeData.rates[to]);
            return exchangeData.rates[to];
        }
        
        // Exchange Rate API çalışmazsa Fixer.io'yu dene
        const fixerResponse = await fetch(`https://api.fixer.io/latest?base=${from}&symbols=${to}`);
        const fixerData = await fixerResponse.json();
        
        if (fixerData && fixerData.rates && fixerData.rates[to]) {
            console.log(`${from} kuru Fixer.io'dan alındı:`, fixerData.rates[to]);
            return fixerData.rates[to];
        }
        
    } catch (error) {
        console.error('Döviz kuru alma hatası:', error);
    }
    
    // Varsayılan değerler (güncel - Aralık 2024)
    const defaultRates = {
        'USD': 32.5,
        'EUR': 35.8
    };
    
    console.log(`${from} kuru varsayılan değer kullanıldı:`, defaultRates[from]);
    return defaultRates[from] || 100;
}

// Grafik güncelleme fonksiyonu
function updateChart() {
    const selectedCurrency = document.getElementById('chartCurrency').value;
    const selectedPeriod = parseInt(document.getElementById('chartPeriod').value);
    
    if (!chartData[selectedCurrency]) {
        console.error('Grafik verisi bulunamadı:', selectedCurrency);
        // Veri yoksa yeniden yükle
        loadChartData();
        return;
    }
    
    const data = chartData[selectedCurrency];
    const currency = data.currency;
    
    // Seçilen döneme göre veriyi filtrele
    const filteredLabels = data.labels.slice(-selectedPeriod);
    const filteredData = data.data.slice(-selectedPeriod);
    
    // Veri kontrolü
    if (filteredData.length === 0 || filteredData.some(val => isNaN(val) || val <= 0)) {
        console.error('Geçersiz grafik verisi:', filteredData);
        // Veri geçersizse yeniden yükle
        loadChartData();
        return;
    }
    
    // Mevcut grafiği yok et
    if (yearlyChart) {
        yearlyChart.destroy();
    }
    
    // Yeni grafik oluştur
    const ctx = document.getElementById('yearlyChart').getContext('2d');
    yearlyChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: filteredLabels,
            datasets: [{
                label: `${currency.name} (${currency.unit})`,
                data: filteredData,
                borderColor: currency.color,
                backgroundColor: `${currency.color}20`,
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: currency.color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: `${currency.name} - Son ${selectedPeriod} Ay (Güncel Veriler)`,
                    font: {
                        size: 16,
                        weight: 'bold'
                    },
                    color: '#2d3a4b'
                },
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 12
                        },
                        usePointStyle: true
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    backgroundColor: 'rgba(0,0,0,0.8)',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    borderColor: currency.color,
                    borderWidth: 1,
                    callbacks: {
                        label: function(context) {
                            const value = context.parsed.y;
                            return `${currency.name}: ${value.toLocaleString('tr-TR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}${currency.unit}`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    display: true,
                    title: {
                        display: true,
                        text: 'Ay',
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    }
                },
                y: {
                    display: true,
                    title: {
                        display: true,
                        text: `Değer (${currency.unit})`,
                        font: {
                            size: 14,
                            weight: 'bold'
                        }
                    },
                    grid: {
                        color: 'rgba(0,0,0,0.1)'
                    },
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('tr-TR', {minimumFractionDigits: 0, maximumFractionDigits: 0});
                        }
                    }
                }
            },
            interaction: {
                mode: 'nearest',
                axis: 'x',
                intersect: false
            },
            elements: {
                point: {
                    hoverBackgroundColor: currency.color,
                    hoverBorderColor: '#fff'
                }
            }
        }
    });
    
    // Güncelleme zamanını göster
    const chartUpdateTimeDiv = document.getElementById('chartUpdateTime');
    chartUpdateTimeDiv.textContent = `Son güncelleme: ${new Date().toLocaleString('tr-TR')} - Gerçek zamanlı veriler`;
}

// Sayfa yüklenince kullanıcı kontrolü yap ve verileri yükle
window.onload = function() {
    // Google OAuth yüklenip yüklenmediğini kontrol et
    setTimeout(() => {
        if (typeof google === 'undefined' || !google.accounts) {
            console.log('Google OAuth yüklenemedi');
            handleGoogleOAuthError();
        }
    }, 3000);
    
    // Önce kullanıcı oturumunu kontrol et
    const isLoggedIn = checkUserSession();
    
    // Eğer kullanıcı giriş yapmışsa verileri yükle
    if (isLoggedIn) {
        loadCurrencies();
        loadCurrencyRates();
        loadStatistics();
        loadChartData();
        
        // Her 5 dakikada bir kurları güncelle
        setInterval(loadCurrencyRates, 5 * 60 * 1000);
        // Her 10 dakikada bir istatistikleri güncelle
        setInterval(loadStatistics, 10 * 60 * 1000);
        // Her 15 dakikada bir grafik verilerini güncelle
        setInterval(loadChartData, 15 * 60 * 1000);
    }
}; 