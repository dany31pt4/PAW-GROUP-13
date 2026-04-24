const geocodeAddress = async (address) => {
    try {
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`;
        const res = await fetch(url, {
            headers: { 'User-Agent': 'MarketplacePAW/1.0 (paw13marketplace@gmail.com)' }
        });
        const data = await res.json();
        if (!data || data.length === 0) return null;
        return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
    } catch (err) {
        console.error('Erro na geocodificação:', err.message);
        return null;
    }
};

module.exports = { geocodeAddress };
