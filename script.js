let numbers = [];
let leftSwiped = [];
let currentIndex = 0;
let startX = 0;
let currentX = 0;
const card = document.getElementById('card');

// 配列をシャッフルする関数
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// ゲーム開始
function startGame() {
    const min = parseInt(document.getElementById('min-val').value);
    const max = parseInt(document.getElementById('max-val').value);

    if (isNaN(min) || isNaN(max)) { alert("数字を入力してください"); return; }
    if (min >= max) { alert("最小値は最大値より小さくしてください"); return; }

    numbers = [];
    for (let i = min; i <= max; i++) numbers.push(i);
    numbers = shuffle(numbers); // ここでランダムにする

    currentIndex = 0;
    leftSwiped = [];

    // 画面切り替え
    document.getElementById('setup-screen').classList.remove('active');
    document.getElementById('result-screen').classList.remove('active');
    document.getElementById('game-screen').classList.add('active');
    
    updateCard();
}

// カード表示の更新
function updateCard() {
    if (currentIndex >= numbers.length) {
        showResults();
        return;
    }
    card.innerText = numbers[currentIndex];
    // 位置をリセット
    card.style.transition = 'none';
    card.style.transform = `translate(0px, 0px) rotate(0deg)`;
    
    document.getElementById('progress').innerText = `残り: ${numbers.length - currentIndex}枚`;
}

// --- タッチ操作イベント ---

card.addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
    card.style.transition = 'none'; // 操作中はアニメーションを切る
});

card.addEventListener('touchmove', (e) => {
    currentX = e.touches[0].clientX;
    const diffX = currentX - startX;
    const deg = diffX / 15; // 移動量に応じて少し回転させる
    card.style.transform = `translate(${diffX}px, 0px) rotate(${deg}deg)`;
});

card.addEventListener('touchend', () => {
    const diffX = currentX - startX;
    card.style.transition = 'transform 0.3s ease-out'; // 指を離したらアニメーションON

    if (diffX > 100) { 
        // 右スワイプ成功
        card.style.transform = `translate(100vw, 0px) rotate(45deg)`; // 画面外へ
        setTimeout(() => { nextNum(false); }, 300);
    } else if (diffX < -100) { 
        // 左スワイプ成功
        card.style.transform = `translate(-100vw, 0px) rotate(-45deg)`; // 画面外へ
        setTimeout(() => { nextNum(true); }, 300);
    } else { 
        // 元に戻る
        card.style.transform = `translate(0px, 0px) rotate(0deg)`;
    }
    // 誤作動防止のため座標リセット
    startX = 0;
    currentX = 0;
});

// 次の数字へ
function nextNum(isLeft) {
    if (isLeft) {
        leftSwiped.push(numbers[currentIndex]);
    }
    currentIndex++;
    updateCard();
}

// 結果表示
function showResults() {
    document.getElementById('game-screen').classList.remove('active');
    document.getElementById('result-screen').classList.add('active');

    const total = numbers.length;
    const leftCount = leftSwiped.length;
    const percent = total === 0 ? 0 : Math.round((leftCount / total) * 100);

    document.getElementById('result-fraction').innerText = `${leftCount} / ${total}`;
    document.getElementById('result-percent').innerText = `${percent}%`;
    document.getElementById('left-list').innerText = leftSwiped.length > 0 ? leftSwiped.join(', ') : "なし";
}
