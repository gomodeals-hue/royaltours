/**
 * Destination Data for Royal Tours Packages
 * Hybrid: Static info + real-time weather (Open-Meteo) + exchange rates (exchangerate-api)
 * All 9 destinations with GPS coordinates for live weather
 */

const DESTINATION_DATA = {
    bali: {
        name: "Bali",
        country: "Indonesia",
        flag: "🇮🇩",
        timezone: "UTC+08:00",
        lat: -8.3405,
        lon: 115.0920,
        currency: {
            name: "Indonesian Rupiah",
            code: "IDR",
            symbol: "Rp"
        },
        climate: {
            temp_min: "24°C",
            temp_max: "31°C",
            description: "Tropical & Humid"
        },
        best_season: "April – October",
        best_months: ["Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct"],
        visitors_annually: "4.2 Million",
        visitor_demographics: {
            top_countries: ["🇮🇳 India", "🇦🇺 Australia", "🇨🇳 China", "🇲🇾 Malaysia", "🇸🇬 Singapore"],
            avg_stay: "7–10 days",
            peak_age: "25–45 years"
        },
        languages: "Indonesian, Balinese, English",
        driving_side: "Left",
        calling_code: "+62",
        visa_on_arrival: true,
        visa_note: "Visa on Arrival available for Indians ($35 USD)"
    },
    coorg: {
        name: "Coorg",
        country: "India",
        flag: "🇮🇳",
        timezone: "UTC+05:30",
        lat: 12.3375,
        lon: 75.8069,
        currency: {
            name: "Indian Rupee",
            code: "INR",
            symbol: "₹"
        },
        climate: {
            temp_min: "15°C",
            temp_max: "28°C",
            description: "Pleasant & Misty"
        },
        best_season: "September – May",
        best_months: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
        visitors_annually: "800,000+",
        visitor_demographics: {
            top_countries: ["Domestic", "🇬🇧 UK", "🇺🇸 USA", "🇦🇺 Australia", "🇨🇦 Canada"],
            avg_stay: "2–4 days",
            peak_age: "25–55 years"
        },
        languages: "Kannada, Kodava, English",
        driving_side: "Left",
        calling_code: "+91",
        visa_on_arrival: false,
        visa_note: "No visa required for Indian nationals"
    },
    dubai: {
        name: "Dubai",
        country: "UAE",
        flag: "🇦🇪",
        timezone: "UTC+04:00",
        lat: 25.2048,
        lon: 55.2708,
        currency: {
            name: "UAE Dirham",
            code: "AED",
            symbol: "د.إ"
        },
        climate: {
            temp_min: "20°C",
            temp_max: "42°C",
            description: "Desert – Hot & Sunny"
        },
        best_season: "October – April",
        best_months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        visitors_annually: "17 Million",
        visitor_demographics: {
            top_countries: ["🇮🇳 India", "🇬🇧 UK", "🇨🇳 China", "🇸🇦 Saudi Arabia", "🇺🇸 USA"],
            avg_stay: "4–7 days",
            peak_age: "28–50 years"
        },
        languages: "Arabic, English, Hindi",
        driving_side: "Right",
        calling_code: "+971",
        visa_on_arrival: false,
        visa_note: "UAE Tourist Visa required – we assist with the process"
    },
    kodaikanal: {
        name: "Kodaikanal",
        country: "India",
        flag: "🇮🇳",
        timezone: "UTC+05:30",
        lat: 10.2381,
        lon: 77.4892,
        currency: {
            name: "Indian Rupee",
            code: "INR",
            symbol: "₹"
        },
        climate: {
            temp_min: "8°C",
            temp_max: "20°C",
            description: "Cool & Refreshing"
        },
        best_season: "May – June, Sep – Oct",
        best_months: ["May", "Jun", "Sep", "Oct"],
        visitors_annually: "1.2 Million",
        visitor_demographics: {
            top_countries: ["Domestic", "🇺🇸 USA", "🇬🇧 UK", "🇩🇪 Germany", "🇫🇷 France"],
            avg_stay: "2–3 days",
            peak_age: "20–45 years"
        },
        languages: "Tamil, English",
        driving_side: "Left",
        calling_code: "+91",
        visa_on_arrival: false,
        visa_note: "No visa required for Indian nationals"
    },
    ooty: {
        name: "Ooty",
        country: "India",
        flag: "🇮🇳",
        timezone: "UTC+05:30",
        lat: 11.4102,
        lon: 76.6950,
        currency: {
            name: "Indian Rupee",
            code: "INR",
            symbol: "₹"
        },
        climate: {
            temp_min: "10°C",
            temp_max: "22°C",
            description: "Cool Hill Station"
        },
        best_season: "April – June, Sep – Nov",
        best_months: ["Apr", "May", "Jun", "Sep", "Oct", "Nov"],
        visitors_annually: "1.5 Million",
        visitor_demographics: {
            top_countries: ["Domestic", "🇺🇸 USA", "🇬🇧 UK", "🇩🇪 Germany", "🇸🇬 Singapore"],
            avg_stay: "2–3 days",
            peak_age: "22–50 years"
        },
        languages: "Tamil, Kannada, English",
        driving_side: "Left",
        calling_code: "+91",
        visa_on_arrival: false,
        visa_note: "No visa required for Indian nationals"
    },
    "paris-london": {
        name: "Paris & London",
        country: "France & UK",
        flag: "🇫🇷🇬🇧",
        timezone: "UTC+01:00 / UTC+00:00",
        lat: 48.8566,
        lon: 2.3522,
        currency: {
            name: "Euro / British Pound",
            code: "EUR",
            symbol: "€ / £"
        },
        climate: {
            temp_min: "3°C",
            temp_max: "22°C",
            description: "Temperate – Variable"
        },
        best_season: "April – June, Sep – Oct",
        best_months: ["Apr", "May", "Jun", "Sep", "Oct"],
        visitors_annually: "45 Million (combined)",
        visitor_demographics: {
            top_countries: ["🇺🇸 USA", "🇨🇳 China", "🇮🇳 India", "🇩🇪 Germany", "🇯🇵 Japan"],
            avg_stay: "5–9 days",
            peak_age: "25–55 years"
        },
        languages: "French, English",
        driving_side: "Right / Left",
        calling_code: "+33 / +44",
        visa_on_arrival: false,
        visa_note: "Schengen + UK Visitor Visa required – we assist with applications"
    },
    rameshwaram: {
        name: "Rameshwaram",
        country: "India",
        flag: "🇮🇳",
        timezone: "UTC+05:30",
        lat: 9.2876,
        lon: 79.3129,
        currency: {
            name: "Indian Rupee",
            code: "INR",
            symbol: "₹"
        },
        climate: {
            temp_min: "22°C",
            temp_max: "35°C",
            description: "Warm & Coastal"
        },
        best_season: "October – May",
        best_months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr", "May"],
        visitors_annually: "2 Million+",
        visitor_demographics: {
            top_countries: ["Domestic", "🇲🇾 Malaysia", "🇸🇬 Singapore", "🇱🇰 Sri Lanka", "🇺🇸 USA"],
            avg_stay: "1–3 days",
            peak_age: "All ages – pilgrimage"
        },
        languages: "Tamil, English",
        driving_side: "Left",
        calling_code: "+91",
        visa_on_arrival: false,
        visa_note: "No visa required for Indian nationals"
    },
    trivandrum: {
        name: "Trivandrum & Kanyakumari",
        country: "India",
        flag: "🇮🇳",
        timezone: "UTC+05:30",
        lat: 8.5241,
        lon: 76.9366,
        currency: {
            name: "Indian Rupee",
            code: "INR",
            symbol: "₹"
        },
        climate: {
            temp_min: "24°C",
            temp_max: "32°C",
            description: "Tropical & Coastal"
        },
        best_season: "October – March",
        best_months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar"],
        visitors_annually: "2.5 Million",
        visitor_demographics: {
            top_countries: ["Domestic", "🇬🇧 UK", "🇺🇸 USA", "🇩🇪 Germany", "🇫🇷 France"],
            avg_stay: "3–5 days",
            peak_age: "25–60 years"
        },
        languages: "Malayalam, English",
        driving_side: "Left",
        calling_code: "+91",
        visa_on_arrival: false,
        visa_note: "No visa required for Indian nationals"
    },
    "vietnam-cambodia": {
        name: "Vietnam & Cambodia",
        country: "Vietnam & Cambodia",
        flag: "🇻🇳🇰🇭",
        timezone: "UTC+07:00",
        lat: 21.0278,
        lon: 105.8342,
        currency: {
            name: "Vietnamese Đồng / Cambodian Riel",
            code: "VND",
            symbol: "₫ / ៛"
        },
        climate: {
            temp_min: "22°C",
            temp_max: "33°C",
            description: "Tropical – Seasonal"
        },
        best_season: "October – April",
        best_months: ["Oct", "Nov", "Dec", "Jan", "Feb", "Mar", "Apr"],
        visitors_annually: "8 Million+ (combined)",
        visitor_demographics: {
            top_countries: ["🇨🇳 China", "🇺🇸 USA", "🇯🇵 Japan", "🇮🇳 India", "🇰🇷 South Korea"],
            avg_stay: "7–12 days",
            peak_age: "22–50 years"
        },
        languages: "Vietnamese, Khmer, English",
        driving_side: "Right",
        calling_code: "+84 / +855",
        visa_on_arrival: false,
        visa_note: "Vietnam e-Visa + Cambodia e-Visa required – we assist"
    }
};

/**
 * Get destination data by package key
 */
function getDestinationData(packageKey) {
    return DESTINATION_DATA[packageKey] || null;
}

/**
 * Fetch real-time weather from Open-Meteo API (free, no API key needed)
 */
async function fetchWeatherData(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m&timezone=auto`;
        const res = await fetch(url);
        const data = await res.json();
        if (data.current) {
            return {
                temperature: Math.round(data.current.temperature_2m),
                weather_code: data.current.weather_code,
                wind_speed: Math.round(data.current.wind_speed_10m),
                humidity: data.current.relative_humidity_2m
            };
        }
    } catch (e) {
        console.warn("Open-Meteo weather fetch failed:", e);
    }
    return null;
}

/**
 * Get weather emoji from WMO weather code
 */
function getWeatherEmoji(code) {
    if (code === 0) return "☀️";
    if (code <= 2) return "🌤️";
    if (code <= 3) return "☁️";
    if (code <= 49) return "🌫️";
    if (code <= 59) return "🌦️";
    if (code <= 69) return "🌧️";
    if (code <= 79) return "🌨️";
    if (code <= 82) return "🌧️";
    if (code <= 99) return "⛈️";
    return "🌡️";
}

/**
 * Get weather description from WMO weather code
 */
function getWeatherDesc(code) {
    if (code === 0) return "Clear Sky";
    if (code <= 2) return "Partly Cloudy";
    if (code <= 3) return "Overcast";
    if (code <= 49) return "Foggy / Misty";
    if (code <= 59) return "Drizzle";
    if (code <= 69) return "Rainy";
    if (code <= 79) return "Snowy";
    if (code <= 82) return "Rain Showers";
    if (code <= 99) return "Thunderstorm";
    return "Variable";
}

/**
 * Fetch real-time exchange rate from INR
 */
async function fetchExchangeRates(targetCurrency) {
    try {
        const res = await fetch(`https://api.exchangerate-api.com/v4/latest/INR`);
        const data = await res.json();
        if (data.rates && data.rates[targetCurrency]) {
            return data.rates[targetCurrency];
        }
    } catch (e) {
        console.warn("Exchange rate fetch failed:", e);
    }
    // Fallback rates
    const FALLBACK = {
        'IDR': 0.0063, 'AED': 0.044, 'EUR': 0.011,
        'GBP': 0.0095, 'VND': 0.26, 'KHR': 0.05
    };
    return FALLBACK[targetCurrency] || null;
}

/**
 * Get formatted exchange rate string
 */
async function getFormattedExchangeRate(destData) {
    if (destData.country === "India") return null;
    const currencyCode = destData.currency.code.split('/')[0].trim();
    const rate = await fetchExchangeRates(currencyCode);
    if (rate) {
        const rupeeValue = (1 / rate).toFixed(2);
        return `₹${rupeeValue} = 1 ${currencyCode}`;
    }
    return null;
}
