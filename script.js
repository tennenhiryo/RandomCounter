// テキストデータを分解して辞書形式に変換
const sentenceList = {};

// data.js で定義された rawData を使用
if (typeof rawData !== 'undefined') {
    rawData.trim().split('\n').forEach(line => {
        if (!line.trim()) return;
        const parts = line.trim().split(' ');
        const num = parseInt(parts[0], 10);
        const text = parts.slice(1).join(' ');
        if (!isNaN(num) && text) {
            sentenceList[num] = text;
        }
    });
} else {
    console.error("data.js not found");
}

let numbers = [];
let leftSwiped = [];
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;
let isFlipped = false;

const cardWrapper = document.getElementById('card'); 
const cardInner = document.getElementById('card-inner'); 
const frontFace = document.getElementById('card-front');
const backFace = document.getElementById('card-back');

function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function startGame() {
    const min = parseInt(document.getElementById('min-val').value);
    const max = parseInt(document.getElementById('max-val').value);

    if (isNaN(min) || isNaN(max)) { alert("Enter Numbers"); return; }
    if (min > max) { alert("Min > Max Error"); return; }

    numbers = [];
    for (let i = min; i <= max; i++) numbers.push(i);
    if (numbers.length === 0) { alert("No Numbers Found"); return; }

    numbers = shuffle(numbers);
    currentIndex = 0;
    leftSwiped = [];

    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    updateCard();
}

function togglePause() {
    document.getElementById('pause-modal').classList.toggle('active');
}

function finishGame() {
    document.getElementById('pause-modal').classList.remove('active');
    showResults();
}

function updateCard() {
    if (currentIndex >= numbers.length) {
        showResults();
        return;
    }
    
    const currentNum = numbers[currentIndex];
    
    // アニメーション一時停止（裏返り防止）
    cardInner.style.transition = 'none';
    cardWrapper.style.transition = 'none';

    // 状態リセット
    cardInner.classList.remove('is-flipped');
    cardWrapper.style.transform = `translate(0px, 0px) rotate(0deg)`;
    isFlipped = false;

    // 内容更新
    frontFace.innerText = currentNum;
    backFace.innerText = sentenceList[currentNum] ? sentenceList[currentNum] : "";

    // 強制再描画
    void cardInner.offsetWidth; 

    // アニメーション復帰
    cardInner.style.transition = 'transform 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275)';

    document.getElementById('progress').innerText = `Left: ${numbers.length - currentIndex}`;
}

// --- タッチ操作イベント ---
cardWrapper.addEventListener('touchstart', (e) => {
    if(document.getElementById('pause-modal').classList.contains('active')) return;
    startX = e.touches[0].clientX;
    currentX = startX;
    isDragging = true;
    cardWrapper.style.transition = 'none';
});

cardWrapper.addEventListener('touchmove', (e) => {
    if(!isDragging || document.getElementById('pause-modal').classList.contains('active')) return;
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    const deg = diffX / 15;
    cardWrapper.style.transform = `translate(${diffX}px, 0px) rotate(${deg}deg)`;
});

cardWrapper.addEventListener('touchend', () => {
    if(!isDragging) return;
    isDragging = false;
    
    if(document.getElementById('pause-modal').classList.contains('active')) return;

    const diffX = currentX - startX;
    
    // タップ判定
    if (Math.abs(diffX) < 10) {
        cardWrapper.style.transform = `translate(0px, 0px) rotate(0deg)`;
        const currentNum = numbers[currentIndex];
        // 英文がある場合のみ裏返す
        if (sentenceList[currentNum]) {
            cardInner.classList.toggle('is-flipped');
            isFlipped = !isFlipped;
        }
        return;
    }

    // スワイプ判定
    cardWrapper.style.transition = 'transform 0.3s ease-out';
    if (diffX > 100) { 
        // 右へ
        cardWrapper.style.transform = `translate(100vw, 0px) rotate(45deg)`;
        setTimeout(() => { nextNum(false); }, 300);
    } else if (diffX < -100) { 
        // 左へ
        cardWrapper.style.transform = `translate(-100vw, 0px) rotate(-45deg)`;
        setTimeout(() => { nextNum(true); }, 300);
    } else { 
        // 元に戻る
        cardWrapper.style.transform = `translate(0px, 0px) rotate(0deg)`;
    }
    startX = 0;
    currentX = 0;
});

function nextNum(isLeft) {
    if (isLeft) leftSwiped.push(numbers[currentIndex]);
    currentIndex++;
    updateCard();
}

function showResults() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');

    const totalDone = currentIndex; 
    const leftCount = leftSwiped.length;
    const percent = totalDone === 0 ? 0 : Math.round((leftCount / totalDone) * 100);

    document.getElementById('result-fraction').innerText = `${leftCount} / ${totalDone}`;
    document.getElementById('result-percent').innerText = `${percent}%`;
    
    const listContainer = document.getElementById('left-list');
    listContainer.innerHTML = "";

    if (leftSwiped.length === 0) {
        listContainer.innerText = "None";
    } else {
        leftSwiped.forEach(num => {
            const div = document.createElement('div');
            div.className = "list-item";
            const text = sentenceList[num] ? ` : ${sentenceList[num]}` : "";
            div.innerText = `${num}${text}`;
            listContainer.appendChild(div);
        });
    }
}
