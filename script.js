// Define deck of cards
const suits = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
const values = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

let deck = [];
let playerHand = [];
let dealerHand = [];

let gameEnded = false;
let debounce = false;
let betDebounce = false;
let toggled = false;

// Player's chips
let playerChips = 10000;
let betAmount = 0;

// DOM elements
const playerChipsDisplay = document.getElementById('player-chips');
const playerHandDiv = document.getElementById('player-hand');
const dealerHandDiv = document.getElementById('dealer-hand');
const messageModal = document.getElementById('result-modal');
const modalMessage = document.getElementById('result-message');
const rulesContainer = document.getElementById('rules');
const rulesToggleBtn = document.getElementById('rules-toggle-btn');

// Buttons
const dealBtn = document.getElementById('deal-btn');
const hitBtn = document.getElementById('hit-btn');
const standBtn = document.getElementById('stand-btn');
const betBtns = document.querySelectorAll('.bet-btn');

// Event listeners
rulesToggleBtn.addEventListener('click', toggleRules);
dealBtn.addEventListener('click', deal);
hitBtn.addEventListener('click', hit);
standBtn.addEventListener('click', stand);
betBtns.forEach(btn => btn.addEventListener('click', () => placeBet(btn.dataset.value)));
document.getElementById('deal-btn').addEventListener('click', deal);
document.getElementById('hit-btn').addEventListener('click', hit);
document.getElementById('stand-btn').addEventListener('click', stand);

// Functions
function createDeck() {
    deck = [];
    for (let suit of suits) {
        for (let value of values) {
            deck.push({ suit, value });
        }
    }
    console.log(deck)
    return deck;
}

function shuffleDeck() {
    deck.sort(() => Math.random() - 0.5);
}

function deal() {
    if (playerChips <= 0) {
        resetGame();
        return;
    }

    createDeck();
    shuffleDeck();
    playerHand = [drawCard(), drawCard()];
    dealerHand = [drawCard(), drawCard()];
    gameEnded = false; // Reset the gameEnded flag

    // Reset bet amount for each round
    betAmount = 5;
    playerChips -= 5;

    setBet(betAmount);
    displayHands();
    toggleButtons(true);
    saveGameState();
    updateChipsDisplay();
}

function hit() {
    playerHand.push(drawCard());
    toggleButtons(false, true);

    if (calculateHandValue(playerHand) > 21 && !gameEnded) {
        gameEnded = true;
        displayHands();

        setTimeout(() => {
            endGame("You bust! Dealer wins.", false);
        }, 1000);
    } else {
        displayHands();
    }
}

function stand() {
    if (!gameEnded) { // Check if the game has already ended
        toggleButtons(false);

        while (calculateHandValue(dealerHand) < 17) {
            dealerHand.push(drawCard());
        }

        displayHands();

        setTimeout(() => {
            const playerValue = calculateHandValue(playerHand);
            const dealerValue = calculateHandValue(dealerHand);

            if (dealerValue > 21 || (playerValue > dealerValue && playerValue <= 21)) {
                endGame("You win!", true);
            } else if (playerValue < dealerValue && dealerValue <= 21) {
                endGame("Dealer wins!", false);
            } else {
                endGame("It's a tie!", false);
            }
        }, 1000);

        gameEnded = true; // Set the gameEnded flag to true
    }
}

function drawCard() {
    return deck.pop();
}

function displayHands() {
    playerHandDiv.innerHTML = "";
    dealerHandDiv.innerHTML = "";

    // Display player's hand cards
    for (let card of playerHand) {
        displayCard(card, playerHandDiv);
    }

    // Display dealer's hand cards
    for (let card of dealerHand) {
        displayCard(card, dealerHandDiv);
    }

    // Update the player's hand value
    document.getElementById('player-hand-value').textContent = `Hand Value: ${calculateHandValue(playerHand)}`;

    // Update the dealer's hand value
    document.getElementById('dealer-hand-value').textContent = `Hand Value: ${calculateHandValue(dealerHand)}`;
}


function displayCard(card, handDiv) {
    const cardDiv = document.createElement('span');
    cardDiv.classList.add('card');
    cardDiv.innerHTML = getCardSymbol(card);
    handDiv.appendChild(cardDiv);
}

function calculateHandValue(hand) {
    let total = 0;
    let aces = 0;

    // Loop through each card in the hand
    hand.forEach(card => {
        console.log(card)
        if (card.value === 'A') {
            aces++;
            total += 11;  // Count Ace as 11 initially
        } else if (['J', 'Q', 'K'].includes(card.value)) {
            total += 10;  // Face cards count as 10
        } else {
            console.log(card)
            total += parseInt(card.value);  // Number cards add their value
        }
    });

    // Adjust for Aces if total goes over 21
    if (total > 21 && aces > 0) {
        total -= 10;  // Convert one Ace from 11 to 1
        aces--;
    }

    return total;
}


function getValue(cardValue) {
    return isNaN(cardValue) ? 10 : parseInt(cardValue);
}

function endGame(message, win) {
    toggleButtons(true);
    saveGameState();
    updateChipsDisplay();

    // Update chips based on the result
    if (win) {
        playerChips += betAmount * 2.5; // Win double the bet amount
        removeModalButtons()
        showModal(`You won ${betAmount * 2.5} chips!`, "Play Again", () => {
            resetGame();
        }, "Leave", () => {
            closeModal();
            open(location, '_self').close();
        });
    } else {
        removeModalButtons()
        showModal(`You lost ${betAmount} chips.`, "Play Again", () => {
            resetGame();
        }, "Leave", () => {
            closeModal();
            open(location, '_self').close();
        });
    }
}

function toggleButtons(enable, justBetButtons) {
    if (justBetButtons) {
        betBtns.forEach(btn => btn.disabled = !enable);
        return;
    }

    dealBtn.disabled = !enable;
    hitBtn.disabled = !enable;
    standBtn.disabled = !enable;
    betBtns.forEach(btn => btn.disabled = !enable);
}

function closeModal() {
    const resultModal = document.getElementById('result-modal');
    resultModal.style.display = 'none';
}

function resetGame() {
    updateChipsDisplay();
    playerHand = [];
    dealerHand = [];
    deal();
}

// Additional JavaScript code for card representation
function getCardSymbol(card) {
    const suitsSymbols = {
        'Hearts': '♥️',
        'Diamonds': '♦️',
        'Clubs': '♣️',
        'Spades': '♠️'
    };

    return `
        <div class="card-inner">
            <h2 class="card-number top-left">${card.value}</h2>
            <h1 class="card-symbol center">${suitsSymbols[card.suit]}</h1>
            <h2 class="card-number bottom-right">${card.value}</h2>
        </div>`;
}

function toggleRules() {
    if (debounce) return;
    debounce = true;

    if (toggled) {
        rulesContainer.style.display = "block";
        toggled = false;
        setTimeout(() => {
            debounce = false;
        }, 1000)
    } else {
        rulesContainer.style.display = "none";
        toggled = true;
        setTimeout(() => {
            debounce = false;
        }, 1000)
    }
}

let currentBet = 0;

function updateBetAmount(newBet) {
    currentBet = newBet;
    document.getElementById('betAmountLabel').innerText = `Bet Amount: $${currentBet}`;
}

function increaseBet(amount) {
    currentBet += amount;
    updateBetAmount(currentBet);
}

function setBet(amount) {
    currentBet = amount;
    updateBetAmount(currentBet);
}

function decreaseBet(amount) {
    if (currentBet - amount >= 0) {
        currentBet -= amount;
        updateBetAmount(currentBet);
    }
}

function placeBet(amount) {
    if (betDebounce) return;
    betDebounce = true;
    if (!gameEnded && playerChips >= amount) {
        betAmount += (parseInt(amount));
        playerChips -= (parseInt(amount));
        increaseBet((parseInt(amount)))
        saveGameState();
        updateChipsDisplay();
    }

    setTimeout(() => {
        betDebounce = false;
    }, 1000)
}

function updateChipsDisplay() {
    playerChipsDisplay.textContent = `Chips: ${getGameState('playerChips')}`;
}

function saveGameState() {
    localStorage.setItem('playerChips', playerChips);
    localStorage.setItem('betAmount', betAmount);
    localStorage.setItem('deck', JSON.stringify(deck));
    localStorage.setItem('playerHand', JSON.stringify(playerHand));
    localStorage.setItem('dealerHand', JSON.stringify(dealerHand));
}

function getGameState(state) {
    return localStorage.getItem(state)
}

function loadGameState() {
    playerChips = parseInt(localStorage.getItem('playerChips')) || 10000;
    betAmount = parseInt(localStorage.getItem('betAmount')) || 0;
    deck = JSON.parse(localStorage.getItem('deck')) || [];
    playerHand = JSON.parse(localStorage.getItem('playerHand')) || [];
    dealerHand = JSON.parse(localStorage.getItem('dealerHand')) || [];
    setBet(betAmount);
    updateChipsDisplay();
    displayHands();

    let previousRound = JSON.parse(localStorage.getItem('playerHand')) || false;

    if (playerChips <= 0) {
        // Player lost all chips, start a new round
        resetGame();
    } else {
        // Player still has chips, ask if they want to continue the previous round
        if (previousRound !== false) {
            showModal("Do you want to continue the previous round?", "Continue", () => {
                closeModal();
            }, "New Round", () => {
                resetGame();
            });
        } else {
            resetGame();
        }
    }
}

function showModal(message, btn1Text, btn1Callback, btn2Text, btn2Callback) {
    const resultModal = document.getElementById('result-modal');
    const modalMessage = document.getElementById('result-message');
    const modalBtnContainer = document.getElementById('modal-content');

    modalMessage.textContent = message;

    const modalBtn1 = createModalButton(btn1Text, () => {
        if (btn1Callback) btn1Callback();
        closeModal();
    });

    const modalBtn2 = createModalButton(btn2Text, () => {
        if (btn2Callback) btn2Callback();
        closeModal();
    });

    modalBtnContainer.appendChild(modalBtn1);
    modalBtnContainer.appendChild(modalBtn2);

    resultModal.style.display = 'flex';
}

function createModalButton(text, callback) {
    const modalBtn = document.createElement('button');
    modalBtn.textContent = text;
    modalBtn.classList.add('modal-btn');
    modalBtn.onclick = callback;
    return modalBtn;
}

function removeModalButtons() {
    const modalBtnContainer = document.getElementById('modal-content');
    const existingButtons = modalBtnContainer.querySelectorAll('.modal-btn');

    existingButtons.forEach(button => {
        button.remove();
    });
}

window.addEventListener("onunload", () => {
    saveGameState();
});

// Load saved game state on page load
loadGameState();