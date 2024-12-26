const spinButton = document.getElementById('spin-button');
const resultDiv = document.getElementById('result');
const reels = document.querySelectorAll('.reel');

const symbols = [
  '🍒', '🍋', '🍊', '🍓', '🍇', '💎'
];

spinButton.addEventListener('click', spinReels);

function spinReels() {
  resultDiv.textContent = 'Result: Spinning...';
  
  // Start the spinning animation
  reels.forEach((reel) => {
    reel.style.animation = 'spin-reel 2s ease-in-out infinite';
  });

  // After 2 seconds, stop the reels and display the result
  setTimeout(() => {
    reels.forEach((reel, index) => {
      reel.style.animation = 'none';
      const selectedSymbols = generateRandomSymbols();
      updateReel(reel, selectedSymbols);
    });

    // Check results
    const resultSymbols = Array.from(reels).map(reel => reel.querySelector('.symbol').textContent);
    checkResult(resultSymbols);
  }, 2000); // Duration of spin
}

function generateRandomSymbols() {
  return Array.from({ length: 5 }, () => symbols[Math.floor(Math.random() * symbols.length)]);
}

function updateReel(reel, selectedSymbols) {
  const currentSymbols = reel.querySelectorAll('.symbol');
  
  // Clear existing symbols
  currentSymbols.forEach(symbol => symbol.remove());
  
  // Add new random symbols
  selectedSymbols.forEach(symbol => {
    const newSymbol = document.createElement('img');
    newSymbol.classList.add('symbol');
    newSymbol.src = `https://via.placeholder.com/150?text=${symbol}`; // For placeholder images
    reel.appendChild(newSymbol);
  });
}

function checkResult(resultSymbols) {
  if (resultSymbols.every(symbol => symbol === resultSymbols[0])) {
    resultDiv.textContent = 'Result: Jackpot!';
  } else {
    resultDiv.textContent = 'Result: Try Again!';
  }
}
