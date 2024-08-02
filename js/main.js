let gameState = {
    level: 1,
    cards: [],
    flippedCards: [],
    matchedPairs: 0,
    totalPairs: 0,
    timerInterval: null,
    startTime: null,
    isGameStarted: false,
    currentUser: null
};

const emojis = ['🐵', '🐒', '🦍', '🐶', '🐕', '🐩', '🐺', '🦊', '🦝', '🐱', '🐈', '🦁', '🐯', '🐅', '🐆', '🐴', '🐎', '🦄', '🦓', '🦌', '🐮', '🐂', '🐃', '🐄', '🐷', '🐖', '🐗', '🐏', '🐐', '🐪', '🦙', '🦒', '🐘', '🦏', '🦛', '🐭', '🐁', '🐹', '🐰', '🦔', '🦇', '🐻', '🐨', '🐼', '🦘', '🦡', '🦃', '🐓', '🐤', '🐦', '🐧', '🦅', '🦆', '🦉', '🦚', '🦜', '🐸', '🐊', '🐢', '🦎', '🐍', '🦖', '🐋', '🐬', '🐙', '🐌', '🦋', '🐞', '🦗', '🦂', '🦟', '🦠'];

const LEVEL_CONFIG = {
    1: { totalCards: 16, maxWidth: '400px' },
    2: { totalCards: 24, maxWidth: '600px' },
    3: { totalCards: 30, maxWidth: '600px' },
    4: { totalCards: 42, maxWidth: '700px' },
    5: { totalCards: 48, maxWidth: '800px' },
    6: { totalCards: 56, maxWidth: '800px' },
};

document.addEventListener("DOMContentLoaded", function () {
    const radioButtons = document.querySelectorAll('input[type="radio"]');

    radioButtons.forEach(radioButton => {
        radioButton.addEventListener('change', () => {
            radioButtons.forEach(button => {
                const icon = button.nextElementSibling;
                if (button.checked) {
                    icon.classList.add('fa-solid');
                } else {
                    icon.classList.remove('fa-solid');
                }
            });
        });
    });
    const userContainer = document.getElementById('user-container');
    const checkboxes = userContainer.getElementsByTagName('input');
    if (checkboxes.length > 0) {
        checkboxes[0].checked = true;
        const icon = checkboxes[0].nextElementSibling;
        icon.classList.add('fa-solid');
    }
    startGame(1);
});

document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', () => {
        // Remove 'active' class from all buttons
        document.querySelectorAll('.btn').forEach(btn => btn.classList.remove('active'));
        // Add 'active' class to the clicked button
        button.classList.add('active');

        getCurrentUser();

        // Remove 'pulse' class from the timer
        document.getElementById('timer').classList.remove('pulse');
        document.getElementById('timer').style.color = '#FFFFFF';
    });
});


/**
 * Selects the checked input element inside 'user-container' and retrieves its value.
 */
function getCurrentUser() {
    const inputs = document.getElementById('user-container').querySelectorAll('input[name="user"]');

    const checkedInput = Array.from(inputs).find(input => input.checked);

    if (checkedInput) {
        console.log(checkedInput.value);
        return checkedInput.value;
    } else {
        return null; // Handle case where no input is checked (if needed)
    }

}

/**
 * Shuffles the elements of an array in place.
 */
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

/**
 * Generates a set of cards based on the given level.
 */
function createCards(level) {
    const config = LEVEL_CONFIG[level] || LEVEL_CONFIG[1]; // Default to level 1 if level not found
    const { totalCards, maxWidth } = config;

    shuffleArray(emojis);
    gameState.totalPairs = totalCards / 2;
    const selectedEmojis = emojis.slice(0, totalCards / 2);
    const cardValues = [...selectedEmojis, ...selectedEmojis];
    shuffleArray(cardValues);

    const gameContainer = document.getElementById('game-container');
    gameContainer.innerHTML = '';
    gameContainer.style.maxWidth = maxWidth;

    for (let i = 0; i < totalCards; i++) {
        const card = document.createElement('div');
        card.classList.add('card');
        card.dataset.value = cardValues[i];
        card.addEventListener('click', () => flipCard(card));
        gameContainer.appendChild(card);
    }
    const cards = document.querySelectorAll('.card');

    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.03}s`; // Adjust delay as needed
    });
}

/**
 * Starts the game based on the given level. Initializes game state, creates cards, and resets the timer.
 */
function startGame(level) {
    const userContainer = document.getElementById('user-container');
    const checkboxes = userContainer.getElementsByTagName('input');
    gameState = {
        ...gameState,
        level,
        cards: [],
        flippedCards: [],
        matchedPairs: 0,
        isGameStarted: false,
        currentUser: checkboxes[0].value
    };
    createCards(level);
    resetTimer();
}

/**
 * Flips a card and checks for a match.
 */
function flipCard(card) {
    if (!gameState.isGameStarted) {
        gameState.isGameStarted = true;
        startTimer();
    }

    if (gameState.flippedCards.length < 2 && !card.classList.contains('flipped')) {
        card.classList.add('flipped');
        card.textContent = card.dataset.value;
        gameState.flippedCards.push(card);

        if (gameState.flippedCards.length === 2) {
            setTimeout(checkMatch, 500);
        }
    }
}

/**
 * Check if the flipped cards match and update the game state accordingly.
 */
function checkMatch() {
    const [card1, card2] = gameState.flippedCards;
    if (card1.dataset.value === card2.dataset.value) {
        card1.classList.add('matched');
        card2.classList.add('matched');
        gameState.matchedPairs++;
        if (gameState.matchedPairs === gameState.totalPairs) {
            endGame();
        }
    } else {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        card1.textContent = '';
        card2.textContent = '';
    }
    gameState.flippedCards = [];
}

/**
 * Starts a timer for the game.
 */
function startTimer(level) {
    gameState.startTime = new Date().getTime();
    gameState.timerInterval = setInterval(updateTimer, 10);
}

/**
 * Updates the timer on the page and checks if the timer is approaching the lowest score.
 */
function updateTimer() {
    const currentTime = new Date().getTime();
    const elapsedTime = currentTime - gameState.startTime;
    const minutes = Math.floor(elapsedTime / 60000);
    const seconds = Math.floor((elapsedTime % 60000) / 1000);
    const milliseconds = elapsedTime % 1000;
    document.getElementById('timer').textContent =
        `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}:${milliseconds.toString().padStart(3, '0')}`;

    const scores = JSON.parse(localStorage.getItem('memoryMasterScores')) || {};

    // Function to convert time string to milliseconds
    function timeStringToMilliseconds(time) {
        const [min, sec, ms] = time.split(':').map(Number);
        return (min * 60000) + (sec * 1000) + ms;
    }

    const currentLevel = gameState.level;
    let lowestScore = Infinity;

    if (scores[currentLevel] && scores[currentLevel].length > 0) {
        lowestScore = timeStringToMilliseconds(scores[currentLevel][0].time);
    }

    // Check if the timer is approaching the lowest score
    const timeLeft = lowestScore - elapsedTime;
    const timeAbove = elapsedTime - lowestScore;
    const timer = document.getElementById('timer');
    if (timeLeft >= 0 && timeLeft <= 10000) {
        timer.style.color = 'lightgreen';
        timer.classList.add('pulse');
    } else if (timeAbove > 5000) {
        timer.style.color = '#FFFFFF';
    } else if (lowestScore < elapsedTime) {
        timer.style.color = '#87cefa';
        timer.classList.remove('pulse');
    } else {
        timer.style.color = '#FFFFFF';
        timer.classList.remove('pulse');
    }
}


/**
 * Resets the timer by clearing the interval and setting the timer display to '00:00:000'.
 */
function resetTimer() {
    clearInterval(gameState.timerInterval);
    document.getElementById('timer').textContent = '00:00:000';
}

/**
 * Ends the game by clearing the timer interval, displaying a notification with the final time and level,
 * disabling the buttons, and allowing the player to try again. Saves the score and updates the results.
 */
function endGame() {
    const currentUser = getCurrentUser();
    clearInterval(gameState.timerInterval);
    const finalTime = document.getElementById('timer').textContent;
    document.getElementById('timer').innerHTML = `<div class="completed">Completed!</div>`;
    const notificationDiv = document.createElement("div");
    notificationDiv.classList.add("notification"); // Add custom class
    notificationDiv.innerHTML = `<div class="congrats">Congratulations!</div><b>You (${currentUser}) completed</b><div class="time">Level ${gameState.level} in ${finalTime}</div><div class="try_again">Try again?</div>`;

    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(button => button.disabled = true);
    document.body.appendChild(notificationDiv);
    setTimeout(function () {
        notificationDiv.style.opacity = 1;
    }, 10);

    const tryAgainButton = notificationDiv.querySelector('.try_again');
    tryAgainButton.addEventListener('click', function handleClick() {
        const timer = document.getElementById('timer');
        timer.style.color = '#FFFFFF';
        timer.style.opacity = 1;
        timer.classList.remove('pulse');
        notificationDiv.style.opacity = 0;
        setTimeout(function () {
            document.body.removeChild(notificationDiv);
        }, 500);
        buttons.forEach(button => button.disabled = false);
        startGame(gameState.level);
    });
    saveScore(gameState.level, finalTime, currentUser);
    updateResults();
}

/**
 * Saves the score for a specific level with the user's time and name.
 */
function saveScore(level, time, user) {
    let scores = JSON.parse(localStorage.getItem('memoryMasterScores')) || {};
    if (!scores[level]) scores[level] = [];
    scores[level].push({ user, time });
    scores[level].sort((a, b) => parseTime(a.time) - parseTime(b.time));
    scores[level] = scores[level].slice(0, 5); // Keep only top 5 scores
    localStorage.setItem('memoryMasterScores', JSON.stringify(scores));
}

/**
 * Parses a time string in the format "mm:ss.ms" and returns the equivalent milliseconds.
 */
function parseTime(time) {
    if (!time) return 0;
    const [minutes, seconds, milliseconds] = time.split(/[:.]/).map(Number);
    return minutes * 60000 + seconds * 1000 + milliseconds;
}

/**
 * Updates the results list based on the scores stored in localStorage.
 */
function updateResults() {
    const resultsList = document.getElementById('results-list');
    resultsList.innerHTML = '';
    const scores = JSON.parse(localStorage.getItem('memoryMasterScores')) || {};
    if (Object.keys(scores).length === 0) {
        console.log('scores is empty');
    }
    for (let level = 1; level <= 6; level++) {
        const levelScores = scores[level] || [];
        if (levelScores.length > 0) {
            const li = document.createElement('li');
            li.innerHTML = `<b>Level ${level} </b><br>`;
            levelScores.forEach(score => {
                li.innerHTML += `<span class="score-name">${score.user}</span> <span class="score-time">${score.time}</span>`;
            });
            resultsList.appendChild(li);
        }
    }
    document.getElementById('timer').classList.remove('pulse');
}

/**
 * Initializes the user management functionality.
 */
function initUserManagement() {
    const userContainer = document.getElementById('user-container');
    const users = JSON.parse(localStorage.getItem('memoryMasterUsers')) || [];

    // Create user selection list
    const userList = document.createElement('div');
    users.forEach(user => {
        const userLabel = document.createElement('label');
        const userCheckbox = document.createElement('input');
        const spanCheckbox = document.createElement('i');
        userLabel.classList.add('radio-label');
        userCheckbox.type = 'radio';
        userCheckbox.name = 'user';
        userCheckbox.value = user;
        spanCheckbox.classList.add('fa-regular');
        spanCheckbox.classList.add('fa-circle-user');
        userCheckbox.addEventListener('change', () => {
            const allCheckboxesUnchecked = Array.from(document.querySelectorAll('input[name="user"]')).every(cb => !cb.checked);
            buttons.forEach(button => button.disabled = allCheckboxesUnchecked);
            gameState.currentUser = user;

            // Add or remove fa-solid class based on checkbox state
            const checkboxes = document.querySelectorAll('input[name="user"]');
            checkboxes.forEach(checkbox => {
                const icon = checkbox.nextElementSibling;
                if (checkbox.checked) {
                    icon.classList.add('fa-solid');
                } else {
                    icon.classList.remove('fa-solid');
                }
            });
        });

        userLabel.appendChild(userCheckbox);
        userLabel.appendChild(spanCheckbox);
        userLabel.appendChild(document.createTextNode(user));
        userList.appendChild(userLabel);

        const hiddenElements = document.querySelectorAll('.hidden');

        hiddenElements.forEach(element => {
            element.classList.remove('hidden');
        });
    });

    // Create new user input
    const newUserLabel = document.createElement('label');
    const newUserInput = document.createElement('input');
    newUserLabel.classList.add('add');
    newUserInput.type = 'text';
    newUserInput.autocomplete = 'off'; // Disable autocomplete
    newUserInput.placeholder = 'Enter new user name';

    newUserInput.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') {
            const newUser = newUserInput.value.trim();
            if (newUser && !users.includes(newUser)) {
                users.push(newUser);
                localStorage.setItem('memoryMasterUsers', JSON.stringify(users));

                newUserInput.value = '';
                initUserManagement();
                const radioButtons = document.querySelectorAll('input[name="user"]');
                const lastRadioButton = radioButtons[radioButtons.length - 1];
                lastRadioButton.checked = true;
                const levelButtons = document.querySelectorAll('.btn');
                levelButtons.forEach(button => button.classList.remove('active'));
                levelButtons[0].classList.add('active');
                gameState.currentUser = newUser;
                const icon = lastRadioButton.nextElementSibling;
                icon.classList.add('fa-solid');
                
            }
        }
    });
    newUserLabel.appendChild(newUserInput);
    userContainer.innerHTML = '';
    userContainer.appendChild(userList);
    userContainer.appendChild(newUserLabel);
    startGame(1);
}

const buttons = document.querySelectorAll('.btn');
buttons.forEach(button => button.disabled = false);


/**
 * Initialize the game with level 1 and user management
 */
initUserManagement();
updateResults();
