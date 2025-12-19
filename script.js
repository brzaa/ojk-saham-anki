let deck = [];
let currentIndex = 0;
let isFlipped = false;

document.addEventListener('DOMContentLoaded', () => {
    fetch('anki_import.csv')
        .then(response => response.text())
        .then(text => {
            deck = parseCSV(text);
            deck = shuffle(deck); // Randomize by default
            initStudySession();
        })
        .catch(err => {
            console.error('Error loading CSV:', err);
            document.getElementById('card-front-text').innerText = "Error loading deck. Please try refreshing.";
        });

    // Event Listeners
    document.getElementById('flashcard').addEventListener('click', flipCard);
    document.getElementById('btn-flip').addEventListener('click', flipCard);
    document.getElementById('btn-next').addEventListener('click', nextCard);
    document.getElementById('btn-prev').addEventListener('click', prevCard);
    document.getElementById('btn-shuffle').addEventListener('click', () => {
        deck = shuffle(deck);
        currentIndex = 0;
        isFlipped = false;
        renderCard();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.code === 'Space') {
            e.preventDefault(); // Prevent scroll
            flipCard();
        } else if (e.code === 'ArrowRight') {
            nextCard();
        } else if (e.code === 'ArrowLeft') {
            prevCard();
        }
    });
});

function parseCSV(text) {
    const lines = text.split('\n');
    const result = [];

    // Skip header and empty lines
    for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) continue;

        // Simple regex to parse CSV with potential quotes
        const matches = lines[i].match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);

        if (matches && matches.length >= 2) {
            const question = matches[0].replace(/^"|"$/g, '').replace(/""/g, '"');
            const answer = matches[1].replace(/^"|"$/g, '').replace(/""/g, '"');
            result.push({ question, answer });
        }
    }
    return result;
}

function initStudySession() {
    if (deck.length > 0) {
        currentIndex = 0;
        renderCard();
    } else {
        document.getElementById('card-front-text').innerText = "No cards found.";
    }
}

function renderCard() {
    if (deck.length === 0) return;

    const card = deck[currentIndex];
    const cardElement = document.getElementById('flashcard');
    const frontText = document.getElementById('card-front-text');
    const backText = document.getElementById('card-back-text');

    // Reset flip state visually first without animation if moving to new card
    // But if we just flip class, it animates.
    // To reset instantly for next card:
    cardElement.classList.remove('is-flipped');
    isFlipped = false;

    // Use timeout to allow flip back animation to finish if we were flipped? 
    // Or just set text immediately. 
    // Standard UX: If I click next, I want to see new Front.

    // Format text (Basic markdown bold support)
    frontText.innerHTML = card.question.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    backText.innerHTML = card.answer.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

    updateProgress();
    updateButtons();
}

function flipCard() {
    const cardElement = document.getElementById('flashcard');
    cardElement.classList.toggle('is-flipped');
    isFlipped = !isFlipped;
}

function nextCard() {
    if (currentIndex < deck.length - 1) {
        currentIndex++;
        renderCard();
    } else {
        alert("Selamat! Anda telah menyelesaikan semua kartu.");
        currentIndex = 0; // Loop back
        renderCard();
    }
}

function prevCard() {
    if (currentIndex > 0) {
        currentIndex--;
        renderCard();
    }
}

function updateProgress() {
    const text = document.getElementById('progress-text');
    const fill = document.getElementById('progress-fill');

    const current = currentIndex + 1;
    const total = deck.length;

    text.innerText = `Kartu ${current} / ${total}`;
    const percent = (current / total) * 100;
    fill.style.width = `${percent}%`;
}

function updateButtons() {
    document.getElementById('btn-prev').disabled = currentIndex === 0;
}

function shuffle(array) {
    let currentIndex = array.length, randomIndex;
    while (currentIndex != 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
}
