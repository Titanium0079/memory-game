const selectors = {
  boardContainer: document.querySelector('.board-container'),
  board: document.querySelector('.board'),
  moves: document.querySelector('.moves'),
  timer: document.querySelector('.timer'),
  start: document.querySelector('#start-btn'),
  reset: document.querySelector('#reset-btn'),
  win: document.querySelector('.win'),
};

const state = {
  gameStarted: false,
  flippedCard: 0,
  totalFlips: 0,
  totalTime: 0,
  loop: null,
};

const images = [
  'img/athrun.jpg', 'img/camille.jpg','img/lalah.jpg', 
  'img/orga.jpeg', 'img/sciricco.jpeg',
  'img/sigma_char.jpg', 'img/you.jpeg', 'img/zeong.jpeg'
];

const shuffle = array => {
  const cloned = [...array];
  for (let i = cloned.length - 1; i > 0; i--) {
    const rand = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[rand]] = [cloned[rand], cloned[i]];
  }
  return cloned;
};

const pickRandom = (array, count) => {
  const cloned = [...array];
  const result = [];
  for (let i = 0; i < count; i++) {
    const rand = Math.floor(Math.random() * cloned.length);
    result.push(cloned[rand]);
    cloned.splice(rand, 1);
  }
  return result;
};

const generateGame = () => {
  const dimension = parseInt(selectors.board.getAttribute('data-dimension'));

  if (dimension % 2 !== 0) throw new Error('Dimensi board harus genap!');

  const picks = pickRandom(images, (dimension * dimension) / 2);
  const cards = shuffle([...picks, ...picks]);

  const boardHTML = `
    <div class="board" data-dimension="${dimension}" style="grid-template-columns: repeat(${dimension}, auto)">
      ${cards.map(src => `
        <div class="card">
          <div class="card-front"></div>
          <div class="card-back"><img src="${src}" /></div>
        </div>
      `).join('')}
    </div>
  `;

  const newBoard = new DOMParser().parseFromString(boardHTML, 'text/html').querySelector('.board');
  selectors.board.replaceWith(newBoard);
  selectors.board = newBoard;
  attachCardEvents(); 
};

const startGame = () => {
  state.gameStarted = true;
  selectors.start.classList.add('disabled');
  selectors.win.hidden = true;
  state.totalFlips = 0;
  state.totalTime = 0;
  state.flippedCard = 0;

  clearInterval(state.loop);
  state.loop = setInterval(() => {
    state.totalTime++;
    selectors.moves.innerText = `${state.totalFlips} moves`;
    selectors.timer.innerText = `Time: ${state.totalTime} sec`;
  }, 1000);
};

const flipBackCards = () => {
  document.querySelectorAll('.card:not(.matched)').forEach(card => {
    card.classList.remove('flipped');
  });
  state.flippedCard = 0;
};

const flipCard = card => {
  if (
    state.flippedCard >= 2 ||
    card.classList.contains('flipped') ||
    card.classList.contains('matched')
  ) return;

  card.classList.add('flipped');
  state.flippedCard++;
  state.totalFlips++;

  if (!state.gameStarted) startGame();

  if (state.flippedCard === 2) {
    const flipped = document.querySelectorAll('.flipped:not(.matched)');
    const img1 = flipped[0].querySelector('img').src;
    const img2 = flipped[1].querySelector('img').src;

    if (img1 === img2) {
      flipped[0].classList.add('matched');
      flipped[1].classList.add('matched');
      state.flippedCard = 0;
    } else {
      setTimeout(flipBackCards, 1000);
    }
  }

  const matched = document.querySelectorAll('.card.matched').length;
  const total = document.querySelectorAll('.card').length;

  if (matched === total) {
    setTimeout(() => {
      selectors.boardContainer.classList.add('flipped');
      selectors.win.hidden = false;
      selectors.win.innerHTML = `
        <span class="win-text">
          You won!<br>
          with <span class="highlight">${state.totalFlips}</span> moves<br>
          in <span class="highlight">${state.totalTime}</span> seconds
        </span>
      `;
      clearInterval(state.loop);
    }, 1000);
  }
};

const resetGame = () => {
    clearInterval(state.loop);

    state.gameStarted = false;
    state.flippedCard = 0;
    state.totalFlips = 0;
    state.totalTime = 0;

    selectors.moves.innerText = `0 moves`;
    selectors.timer.innerText = `Time : 0 sec`;

    selectors.start.classList.remove('disabled');
    selectors.boardContainer.classList.remove('flipped');
    selectors.win.hiiden = true;

    generateGame();
};

const attachCardEvents = () => {
  selectors.board.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => flipCard(card));
  });
};

selectors.start.addEventListener('click', () => {
  if (!selectors.start.classList.contains('disabled')) {
    generateGame();
    startGame();
  }
});

// Init awal
generateGame();
attachCardEvents();
selectors.reset.addEventListener('click', resetGame);
