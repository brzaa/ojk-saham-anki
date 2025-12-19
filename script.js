document.addEventListener('DOMContentLoaded', () => {
    fetch('anki_import.csv')
        .then(response => response.text())
        .then(text => {
            const data = parseCSV(text);
            renderCards(data);
        })
        .catch(err => console.error('Error loading CSV:', err));
});

function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];
    const headers = lines[0].split(',');

    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;
        
        // Simple CSV parser - splits by comma but handles simple quotes if needed
        // For this simple dataset, a basic regex verify is safer for quoted fields
        const row = lines[i].match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g);
        
        // Fallback or simple split if regex fails or for unquoted
        // Actually, let's just use a simple split for now assuming no internal commas in Q/A without quotes
        // Or better, a robust regex for CSV parsing
        const matches = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
        
        if (matches && matches.length >= 2) {
            // Clean up quotes
            const question = matches[0].replace(/^"|"$/g, '').replace(/""/g, '"');
            const answer = matches[1].replace(/^"|"$/g, '').replace(/""/g, '"');
            
            result.push({ question, answer });
        }
    }
    return result;
}

function renderCards(cards) {
    const container = document.getElementById('card-container');
    container.innerHTML = '';
    
    // Show max 9 cards for preview
    const limit = Math.min(cards.length, 9);
    
    for (let i = 0; i < limit; i++) {
        const card = document.createElement('div');
        card.className = 'flashcard';
        
        // Convert markdown bold ** to HTML <strong>
        const qHtml = cards[i].question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        const aHtml = cards[i].answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

        card.innerHTML = `
            <h3>${qHtml}</h3>
            <p>${aHtml}</p>
        `;
        container.appendChild(card);
    }
    
    if (cards.length > 9) {
        const more = document.createElement('div');
        more.style.gridColumn = "1 / -1";
        more.style.textAlign = "center";
        more.style.padding = "20px";
        more.innerHTML = `<p>...dan ${cards.length - 9} lagi. Download untuk melihat semua.</p>`;
        container.appendChild(more);
    }
}
