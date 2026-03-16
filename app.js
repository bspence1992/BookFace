document.addEventListener('DOMContentLoaded', () => {

console.log("app.js loaded");

// Get all the elements we need
const homeScreen = document.getElementById('homeScreen');
const charsScreen = document.getElementById('charsScreen');
const bookInput = document.getElementById('bookInput');
const generateBtn = document.getElementById('generateBtn');
const backBtn = document.getElementById('backBtn');
const bookTitleDisplay = document.getElementById('bookTitleDisplay');
const cardGrid = document.getElementById('cardGrid');

// Switch between screens
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

// Build a character card
function createCard(character) {
    const card = document.createElement('div');
    card.className = 'char-card';
    card.innerHTML = `
        <h3>${character.name}</h3>
        <div class="title">${character.title}</div>
        <div class="desc">${character.description}</div>
    `;
    return card;
}

// Handle generate button click
generateBtn.addEventListener('click', () => {
    const bookTitle = bookInput.value.trim();
    if (!bookTitle) return;

    bookTitleDisplay.textContent = bookTitle;
    showScreen('charsScreen');

    const characters = [
        { name: "Harry Potter", title: "The Boy Who Lived", description: "Brave and loyal with a lightning bolt scar on his forehead." },
        { name: "Hermione Granger", title: "The Brightest Witch", description: "Brilliant and principled with bushy brown hair." },
        { name: "Ron Weasley", title: "The Loyal Friend", description: "Funny and warm hearted with ginger hair and freckles." },
        { name: "Dumbledore", title: "Headmaster", description: "Wise and mysterious with a long silver beard." }
    ];

    cardGrid.innerHTML = '';
    characters.forEach(c => {
        cardGrid.appendChild(createCard(c));
    });
});

// Handle back button
backBtn.addEventListener('click', () => {
    showScreen('homeScreen');
});

}); // end DOMContentLoaded