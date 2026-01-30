export function formatDate(dateString) {
    if (!dateString) return '';

    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);

    if (diffInSeconds < 60) {
        return 'Şimdi';
    } else if (diffInSeconds < 3600) {
        return `${Math.floor(diffInSeconds / 60)}d`;
    } else if (diffInSeconds < 86400) {
        return `${Math.floor(diffInSeconds / 3600)}s`;
    } else {
        // Show date like "20 Oca"
        return date.toLocaleDateString('tr-TR', {
            day: 'numeric',
            month: 'short'
        });
    }
}
