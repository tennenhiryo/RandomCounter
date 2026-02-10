// ==========================================
//  【ここにGoogle Keepのテキストを貼り付けてください】
//  ※ バッククォート(`)で囲んでください
// ==========================================
const rawData = `
001 Let’s try anyway.
002 Following the speech, we had dinner.
003 Please refer to the map.
004 Tickets are available online.
005 the sales department
006 a large conference room
007 according to the e-mail
008 Who most likely is the woman?
009 What does the man offer to do?
`;
// ==========================================

// テキストデータを分解して辞書形式に変換
const sentenceList = {};

rawData.trim().split('\n').forEach(line => {
    // 空行はスキップ
    if (!line.trim()) return;

    // 半角スペースで分割
    // "001 Let’s try anyway." -> ["001", "Let’s", "try", "anyway."]
    const parts = line.trim().split(' ');
    
    // 最初の要素（番号）を取得し、数値に変換（例: "001" -> 1）
    const num = parseInt(parts[0], 10);

    // 残りの要素を結合して英文に戻す
    // slice(1)で2番目以降の要素を取得し、join(' ')でスペース区切りで結合
    const text = parts.slice(1).join(' ');

    if (!isNaN(num) && text) {
        sentenceList[num] = text;
    }
});


let numbers = [];
let leftSwiped = [];
let currentIndex = 0;
let startX = 0;
let currentX = 0;
let isDragging = false;
let isFlipped = false;

const cardWrapper = document.getElementById('card'); // 動くやつ
const cardInner = document.getElementById('card-inner'); // 回るやつ
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

    if (isNaN(min) || isNaN(max)) { alert("数字を入力してください"); return; }
    if (min > max) { alert("最小値は最大値以下にしてください"); return; }

    numbers = [];
    for (let i = min; i <= max; i++) numbers.push(i);
    
    if (numbers.length === 0) { alert("指定範囲の数字が見つかりません"); return; }

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
    
    // 表面：数字を表示
    frontFace.innerText = currentNum;
    
    // 裏面：リストにあれば表示、なければ空文字
    backFace.innerText = sentenceList[currentNum] ? sentenceList[currentNum] : "";

    // カードの状態リセット
    cardWrapper.style.transition = 'none';
    cardWrapper.style.transform = `translate(0px, 0px) rotate(0deg)`;
    
    // 裏返っている場合は表に戻す
    cardInner.classList.remove('is-flipped');
    isFlipped = false;

    document.getElementById('progress').innerText = `残り: ${numbers.length - currentIndex}枚`;
}

// --- タッチ操作イベント ---

cardWrapper.addEventListener('touchstart', (e) => {
    if(document.getElementById('pause-modal').classList.contains('active')) return;
    startX = e.touches[0].clientX;
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
    
    // タップ判定 (移動量が小さい場合)
    if (Math.abs(diffX) < 10) {
        // 位置を元に戻す
        cardWrapper.style.transform = `translate(0px, 0px) rotate(0deg)`;
        
        // 裏面テキストがある場合のみめくる
        const currentNum = numbers[currentIndex];
        if (sentenceList[currentNum]) {
            cardInner.classList.toggle('is-flipped');
            isFlipped = !isFlipped;
        }
        return;
    }

    // スワイプ判定
    cardWrapper.style.transition = 'transform 0.3s ease-out';
    if (diffX > 100) { 
        // 右へ (Next)
        cardWrapper.style.transform = `translate(100vw, 0px) rotate(45deg)`;
        setTimeout(() => { nextNum(false); }, 300);
    } else if (diffX < -100) { 
        // 左へ (Check)
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
    
    // 結果リストの表示
    const listContainer = document.getElementById('left-list');
    listContainer.innerHTML = ""; // クリア

    if (leftSwiped.length === 0) {
        listContainer.innerText = "なし";
    } else {
        // リスト形式で表示（番号: 英文）
        leftSwiped.forEach(num => {
            const div = document.createElement('div');
            div.style.borderBottom = "1px solid #eee";
            div.style.padding = "5px 0";
            
            // 英文がある場合は表示、なければ番号のみ
            const text = sentenceList[num] ? ` : ${sentenceList[num]}` : "";
            div.innerText = `${num}${text}`;
            
            listContainer.appendChild(div);
        });
    }
}
