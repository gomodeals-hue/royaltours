/**
 * Destination Info Cards Renderer (Premium Design)
 * Displays Climate, Best Season, Currency (with live rates), Annual Visitors
 * + Real-time weather from Open-Meteo API for all 9 Royal Tours packages
 */

class DestinationInfoCards {
    constructor(containerSelector, packageKey) {
        this.container = typeof containerSelector === 'string'
            ? document.querySelector(containerSelector)
            : containerSelector;
        this.packageKey = packageKey;
        this.data = getDestinationData(packageKey);

        if (!this.data) {
            console.error(`No destination data found for package: ${packageKey}`);
        }
    }

    /**
     * Render full info cards section
     */
    async render() {
        if (!this.container || !this.data) return;

        const d = this.data;
        const currentMonth = new Date().toLocaleString('en-US', { month: 'short' });
        const isInSeason = d.best_months && d.best_months.includes(currentMonth);
        const seasonBadge = isInSeason
            ? `<span class="inline-flex items-center space-x-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 border border-emerald-200 px-2.5 py-1 rounded-full">
                 <span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse inline-block"></span>
                 <span>IN SEASON NOW</span>
               </span>`
            : `<span class="inline-flex items-center space-x-1 text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                 <span>PLAN AHEAD</span>
               </span>`;

        const html = `
        <section class="my-10" id="dest-info-section-${this.packageKey}">
            <!-- Section Header -->
            <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
                <div>
                    <h3 class="text-xl font-bold text-neutral-900 font-editorial">
                        ${d.flag} Know Before You Go — ${d.name}
                    </h3>
                    <p class="text-xs text-neutral-500 mt-1">Live data updated in real-time for your trip planning</p>
                </div>
                ${seasonBadge}
            </div>

            <!-- Primary 4-Card Grid -->
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">

                <!-- 1. Climate Card -->
                <div class="group relative bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 rounded-2xl p-5 border border-amber-200/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-9 h-9 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center text-lg">🌡️</div>
                        <span class="text-[9px] font-bold uppercase tracking-widest text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">Climate</span>
                    </div>
                    <p class="text-lg font-bold text-neutral-900">${d.climate.temp_min} – ${d.climate.temp_max}</p>
                    <p class="text-xs text-neutral-600 font-medium mt-0.5">${d.climate.description}</p>
                    <p class="text-[10px] text-neutral-400 mt-2">Avg temperature range</p>
                    <!-- Live weather injected here -->
                    <div id="live-weather-${this.packageKey}" class="mt-3 pt-3 border-t border-amber-200/60">
                        <div class="flex items-center space-x-1 text-amber-500">
                            <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                            </svg>
                            <span class="text-[10px] text-neutral-400">Loading live weather…</span>
                        </div>
                    </div>
                </div>

                <!-- 2. Best Season Card -->
                <div class="group relative bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 rounded-2xl p-5 border border-emerald-200/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-lg">📅</div>
                        <span class="text-[9px] font-bold uppercase tracking-widest text-emerald-600 bg-emerald-100 px-2 py-0.5 rounded-full">Best Season</span>
                    </div>
                    <p class="text-base font-bold text-neutral-900 leading-tight">${d.best_season}</p>
                    <p class="text-[10px] text-neutral-400 mt-1">Ideal months to visit</p>
                    <!-- Month pills -->
                    <div class="flex flex-wrap gap-1 mt-3 pt-3 border-t border-emerald-200/60">
                        ${(d.best_months || []).map(m => {
                            const isNow = m === currentMonth;
                            return `<span class="text-[9px] font-bold px-1.5 py-0.5 rounded-md ${isNow ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-700'}">${m}</span>`;
                        }).join('')}
                    </div>
                </div>

                <!-- 3. Currency Card -->
                <div class="group relative bg-gradient-to-br from-blue-50 via-sky-50 to-indigo-50 rounded-2xl p-5 border border-blue-200/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-9 h-9 rounded-xl bg-blue-100 border border-blue-200 flex items-center justify-center text-lg">💱</div>
                        <span class="text-[9px] font-bold uppercase tracking-widest text-blue-600 bg-blue-100 px-2 py-0.5 rounded-full">Currency</span>
                    </div>
                    <p class="text-base font-bold text-neutral-900">${d.currency.name}</p>
                    <p class="text-xs text-neutral-500 font-mono">${d.currency.symbol} ${d.currency.code}</p>
                    <!-- Live exchange rate -->
                    <div id="exchange-rate-${this.packageKey}" class="mt-3 pt-3 border-t border-blue-200/60">
                        ${d.country === 'India'
                            ? `<p class="text-[11px] font-bold text-blue-700">🇮🇳 Indian Rupees accepted</p>`
                            : `<div class="flex items-center space-x-1 text-blue-400">
                                <svg class="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
                                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                                </svg>
                                <span class="text-[10px] text-neutral-400">Fetching live rate…</span>
                               </div>`
                        }
                    </div>
                </div>

                <!-- 4. Visitors Card -->
                <div class="group relative bg-gradient-to-br from-purple-50 via-violet-50 to-pink-50 rounded-2xl p-5 border border-purple-200/80 hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
                    <div class="flex items-center justify-between mb-3">
                        <div class="w-9 h-9 rounded-xl bg-purple-100 border border-purple-200 flex items-center justify-center text-lg">👥</div>
                        <span class="text-[9px] font-bold uppercase tracking-widest text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">Visitors</span>
                    </div>
                    <p class="text-lg font-bold text-neutral-900">${d.visitors_annually}</p>
                    <p class="text-[10px] text-neutral-400 mt-0.5">Annual tourist arrivals</p>
                    <div class="mt-3 pt-3 border-t border-purple-200/60 space-y-1">
                        ${(d.visitor_demographics?.top_countries || []).slice(0, 3).map(c =>
                            `<p class="text-[10px] text-neutral-600 font-medium">${c}</p>`
                        ).join('')}
                    </div>
                </div>

            </div>

            <!-- Secondary Details Row -->
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-gradient-to-r from-neutral-50 to-slate-50 rounded-2xl p-4 border border-neutral-200/80">
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-base">🗣️</div>
                    <div>
                        <p class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Languages</p>
                        <p class="text-xs text-neutral-700 font-semibold">${d.languages}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-base">📞</div>
                    <div>
                        <p class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Calling Code</p>
                        <p class="text-xs text-neutral-700 font-semibold">${d.calling_code}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-base">⏱️</div>
                    <div>
                        <p class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Avg Trip Duration</p>
                        <p class="text-xs text-neutral-700 font-semibold">${d.visitor_demographics?.avg_stay || 'Varies'}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-3">
                    <div class="w-8 h-8 rounded-lg bg-white border border-neutral-200 shadow-sm flex items-center justify-center text-base">🛂</div>
                    <div>
                        <p class="text-[9px] font-bold uppercase tracking-wider text-neutral-400">Visa</p>
                        <p class="text-xs text-neutral-700 font-semibold">${d.visa_note || 'Check requirements'}</p>
                    </div>
                </div>
            </div>
            
            <!-- Avg Stay + Peak Age badges -->
            <div class="flex flex-wrap gap-2 mt-3">
                ${d.visitor_demographics?.avg_stay ? `<span class="text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-full">⏱️ Avg Stay: ${d.visitor_demographics.avg_stay}</span>` : ''}
                ${d.visitor_demographics?.peak_age ? `<span class="text-[10px] font-semibold text-neutral-600 bg-neutral-100 border border-neutral-200 px-3 py-1.5 rounded-full">👤 Peak Traveler Age: ${d.visitor_demographics.peak_age}</span>` : ''}
                <span class="text-[10px] font-semibold text-neutral-500 bg-neutral-50 border border-neutral-200 px-3 py-1.5 rounded-full">⏰ Time Zone: ${d.timezone}</span>
            </div>
        </section>
        `;

        this.container.insertAdjacentHTML('beforeend', html);

        // Load live data after render
        await Promise.all([
            this.loadLiveWeather(),
            this.loadExchangeRate()
        ]);
    }

    /**
     * Load and display real-time weather from Open-Meteo
     */
    async loadLiveWeather() {
        const el = document.getElementById(`live-weather-${this.packageKey}`);
        if (!el || !this.data.lat) return;

        try {
            const weather = await fetchWeatherData(this.data.lat, this.data.lon);
            if (weather) {
                const emoji = getWeatherEmoji(weather.weather_code);
                const desc = getWeatherDesc(weather.weather_code);
                el.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div class="flex items-center space-x-1.5">
                            <span class="text-xl">${emoji}</span>
                            <div>
                                <p class="text-sm font-bold text-neutral-800">${weather.temperature}°C <span class="text-[10px] font-normal text-neutral-500">feels like now</span></p>
                                <p class="text-[10px] text-neutral-500">${desc} · 💧 ${weather.humidity}%</p>
                            </div>
                        </div>
                        <span class="text-[9px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">LIVE</span>
                    </div>
                `;
            } else {
                el.innerHTML = `<p class="text-[10px] text-neutral-400">Weather data unavailable</p>`;
            }
        } catch (e) {
            el.innerHTML = `<p class="text-[10px] text-neutral-400">Weather data unavailable</p>`;
        }
    }

    /**
     * Load and display real-time exchange rate
     */
    async loadExchangeRate() {
        const el = document.getElementById(`exchange-rate-${this.packageKey}`);
        if (!el || this.data.country === 'India') return;

        try {
            const rate = await getFormattedExchangeRate(this.data);
            if (rate) {
                el.innerHTML = `
                    <div class="flex items-center justify-between">
                        <div>
                            <p class="text-xs font-bold text-blue-800">${rate}</p>
                            <p class="text-[9px] text-neutral-400 mt-0.5">Live exchange rate</p>
                        </div>
                        <span class="text-[9px] text-blue-600 font-bold bg-blue-50 px-1.5 py-0.5 rounded-full border border-blue-200">LIVE</span>
                    </div>
                `;
            } else {
                el.innerHTML = `<p class="text-[10px] text-neutral-400">Exchange rate unavailable</p>`;
            }
        } catch (e) {
            el.innerHTML = `<p class="text-[10px] text-neutral-400">Exchange rate unavailable</p>`;
        }
    }
}

/**
 * Initialize destination info cards for a package page
 * Usage: initDestinationInfo("bali", "#destination-info-container");
 */
async function initDestinationInfo(packageKey, containerSelector) {
    const cards = new DestinationInfoCards(containerSelector, packageKey);
    await cards.render();
}
