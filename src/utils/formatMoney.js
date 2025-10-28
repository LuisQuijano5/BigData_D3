function formatCustomMoney(num) {
    const value = Number(num);

    if (value >= 1_000_000_000) {
        const formatted = (value / 1_000_000_000).toFixed(1);
        return formatted.replace(/\.0$/, '') + 'mm'; 
    }

    if (value >= 1_000_000) {
        const formatted = (value / 1_000_000).toFixed(1);
        return formatted.replace(/\.0$/, '') + 'M';
    }

    if (value >= 1_000) {
        const formatted = (value / 1_000).toFixed(1);
        return formatted.replace(/\.0$/, '') + 'K';
    }

    return value.toString();
}