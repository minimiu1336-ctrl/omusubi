// === 変数の定義 ===
const GAME_DURATION = 10; // ゲームの制限時間（秒）
const SCORE_PER_HIT = 1; // 1クリックあたりの点数
const TARGET_LIFETIME = 1000; // ターゲットが出現してから自動的に消えるまでの時間（ミリ秒）

let score = 0;
let timeLeft = GAME_DURATION;
let gameInterval; 
let targetAppearTimer; 
let currentTarget = null; 
let isGameRunning = false;
let playerName = "名無し"; // ニックネームを保存する変数
let countdownInterval; // 新しいカウントダウンタイマー

// === DOM要素の取得 ===
const timerDisplay = document.getElementById('timer');
const scoreDisplay = document.getElementById('score');
const startButton = document.getElementById('startButton');
const gameArea = document.getElementById('gameArea');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScoreDisplay = document.getElementById('finalScore');

// 新しく追加した要素の取得
const nicknameInput = document.getElementById('nickname');
const nicknameInputArea = document.getElementById('nicknameInputArea');
const playerNicknameDisplay = document.getElementById('playerNickname');
const rulesAndPrizeArea = document.getElementById('rulesAndPrize');
const countdownDisplay = document.getElementById('countdown');


// === 関数：ゲーム開始 ===
window.startGame = function() {
    if (isGameRunning) return;

    // --- ニックネームの取得とチェック ---
    const inputName = nicknameInput.value.trim();
    if (inputName === "") {
        alert("ニックネームを入力してください！");
        return; // ニックネームがなければゲームを開始しない
    }

    startCountdown();
}


// === 関数：カウントダウンを開始 ===
function startCountdown() {
    let count = 3;
    countdownDisplay.textContent = count;
    
    // UIをカウントダウンモードに設定
    startButton.classList.add('hidden');
    nicknameInputArea.classList.add('hidden');
    rulesAndPrizeArea.classList.add('hidden');
    countdownDisplay.classList.remove('hidden');
    gameArea.style.display = 'block'; // ゲームエリアの枠を表示 (中身はまだ空)
    
    // 1秒ごとにカウントダウン
    countdownInterval = setInterval(() => {
        count--;
        if (count > 0) {
            countdownDisplay.textContent = count;
        } else if (count === 0) {
            countdownDisplay.textContent = "スタート！";
        } else {
            // カウントが終了したら
            clearInterval(countdownInterval);
            countdownDisplay.classList.add('hidden'); // カウントダウン表示を隠す
            
            // 実際のゲーム開始処理を呼び出す
            initializeGame();
        }
    }, 1000);
}


// === 関数：ゲームの初期化（以前のstartGameの中身を移動） ===
function initializeGame() {
    // 状態をリセット
    playerName = nicknameInput.value.trim();
    playerNicknameDisplay.textContent = playerName; 
    score = 0;
    timeLeft = GAME_DURATION;
    isGameRunning = true;
    
    // 全てのタイマーをクリア (念のため)
    clearAllTimers();

    // UIの表示を更新
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;
    gameArea.innerHTML = ''; // エリアをクリア

    // メインのタイマーを開始 (1秒ごとに実行)
    gameInterval = setInterval(updateGame, 1000); 

    // 最初のターゲットを作成
    createTarget();
}


// === 関数：ゲームの進行 (1秒ごとに実行) ===
function updateGame() {
    timeLeft--;
    timerDisplay.textContent = timeLeft;

    if (timeLeft <= 0) {
        endGame();
    }
}

// === 関数：ターゲットの作成と表示 ===
function createTarget() {
    if (currentTarget) {
        currentTarget.remove();
        currentTarget = null;
    }
    
    const target = document.createElement('div');
    target.classList.add('target');
    target.style.display = 'block'; 

    const targetSize = 80; 
    const areaWidth = gameArea.clientWidth - targetSize;
    const areaHeight = gameArea.clientHeight - targetSize;
    
    const randomX = Math.floor(Math.random() * areaWidth);
    const randomY = Math.floor(Math.random() * areaHeight);

    target.style.left = randomX + 'px';
    target.style.top = randomY + 'px';

    target.onclick = hitTarget;

    gameArea.appendChild(target);
    currentTarget = target; 

    targetAppearTimer = setTimeout(() => {
        if (isGameRunning) {
            missTarget(); 
        }
    }, TARGET_LIFETIME);
}

// === 関数：ターゲットをクリックした時 ===
function hitTarget(event) {
    if (!isGameRunning) return;

    score += SCORE_PER_HIT;
    scoreDisplay.textContent = score;

    event.target.remove();
    currentTarget = null; 
    
    clearTimeout(targetAppearTimer); 
    createTarget(); 
}

// === 関数：ターゲットを逃した場合（クリックしなかった場合） ===
function missTarget() {
    if (!isGameRunning) return;

    if (currentTarget) {
        currentTarget.remove();
        currentTarget = null;
    }
    
    createTarget();
}


// === 関数：ゲーム終了 ===
function endGame() {
    isGameRunning = false;
    
    clearAllTimers();
    gameArea.innerHTML = ''; 
    gameArea.style.display = 'none';

    // --- ゲームオーバーメッセージにニックネームを追加 ---
    finalScoreDisplay.innerHTML = `**${playerName}** さんの最終スコアは **${score}** 点でした！`;
    gameOverMessage.classList.remove('hidden');
    startButton.classList.remove('hidden'); 
    startButton.textContent = 'もう一度プレイ';
}

// === 関数：ゲームのリセット ===
window.resetGame = function() {
    clearAllTimers();
    clearInterval(countdownInterval);
    
    score = 0;
    timeLeft = GAME_DURATION;
    scoreDisplay.textContent = score;
    timerDisplay.textContent = timeLeft;

    // --- ニックネーム入力エリアを再表示 ---
    gameOverMessage.classList.add('hidden');
    nicknameInputArea.classList.remove('hidden'); 
    rulesAndPrizeArea.classList.remove('hidden'); // ルールエリアを再表示
    startButton.textContent = 'ゲームスタート';
    startButton.classList.remove('hidden');

    // ゲームエリアを非表示のままにする (空白を消す)
    gameArea.style.display = 'none';
    
    // カウントダウン表示を確実に隠す
    countdownDisplay.classList.add('hidden');
    // ニックネーム表示も初期状態に戻す
    playerNicknameDisplay.textContent = '---';
}

// === ヘルパー関数：全てのタイマーをクリア ===
function clearAllTimers() {
    clearInterval(gameInterval);
    clearTimeout(targetAppearTimer);
    gameInterval = null;
    targetAppearTimer = null;
}
// ... (既存の変数の定義とDOM要素の取得はそのまま) ...

// 新しく追加した要素の取得

const endTimeDisplay = document.getElementById('endTime'); // 終了日時表示エリア
const prizeMessageArea = document.getElementById('prizeMessage'); // 特典メッセージエリア

// ... (startGame, updateGame, createTarget, hitTarget, missTarget 関数はそのまま) ...

// === 関数：ゲーム終了 ===
function endGame() {
    isGameRunning = false;
    
    clearAllTimers();
    gameArea.innerHTML = ''; 

    // 1. ゲームオーバーメッセージにニックネームを追加
    finalScoreDisplay.innerHTML = `**${playerName}** さんの最終スコアは **${score}** 点でした！`;

    // 2. 終了日時を設定
    const now = new Date();
    // 日付と時刻を整形 (例: 2025年9月26日 15:50:00)
    const formattedDate = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    endTimeDisplay.textContent = formattedDate;

    // 3. 特典メッセージをスコアに応じて設定
    let messageHTML = '';
    const PRIZE_THRESHOLD = 30; // クーポン獲得に必要な点数

    if (score >= PRIZE_THRESHOLD) {
        // 30点以上の場合のメッセージ（クーポン獲得！）
        messageHTML = `
            <p>🎉おめでとうございます！🎉</p>
            <p><span class="prize-highlight">３０点以上</span>を達成しました！</p>
            <p>この画面をスタッフにご提示で、<span class="prize-highlight">１００円クーポン</span>を差し上げます！</p>
        `;
    } else {
        // 30点未満の場合のメッセージ（もう少し）
        messageHTML = `<p>残念！クーポン獲得には、あと **${PRIZE_THRESHOLD - score}点** 必要です！</p><p>もう一度チャレンジ！</p>`;
    }
    
    // 共通の注意書きを追加
    messageHTML += `
        <span class="prize-note">
            ⚠️ ご注意：対象は来店中のプレイのみ、景品交換もその場のみとなります。<br>
            ⚠️ １日１回限定です。画面が閉じても良いように**スクショ**を撮っておいてね！
        </span>
    `;

    prizeMessageArea.innerHTML = messageHTML;

    // 4. ゲームオーバーメッセージを表示
    gameOverMessage.classList.remove('hidden');
    startButton.classList.remove('hidden'); 
    startButton.textContent = 'もう一度プレイ';
}

// ... (resetGame と clearAllTimers 関数はそのまま) ...