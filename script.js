/**
 * Google Rewards - Script Unificado (Quiz + VSL)
 * 
 * Este script gerencia a interatividade da aplicação de pesquisas remuneradas,
 * incluindo navegação entre páginas, sistema de perguntas, animações de saldo,
 * popups de recompensa, efeito de confete e transição para VSL.
 */

// ==================== CONFIGURAÇÃO INICIAL ====================

const surveyData = {
    initialBalance: 17,
    currentBalance: 17,
    currentQuestionIndex: 0,
    questions: [
        {
            text: "What is your preferred search engine?",
            options: [
                { text: "Google", emoji: "🔍" },
                { text: "Bing", emoji: "🔎" },
                { text: "DuckDuckGo", emoji: "🦆" }
            ],
            reward: 25
        },
        {
            text: "How do you feel about personalized online advertising?",
            options: [
                { text: "Useful and relevant", emoji: "💡" },
                { text: "Intrusive", emoji: "😤" },
                { text: "Indifferent", emoji: "🤷" }
            ],
            reward: 37
        },
        {
            text: "Which Google service do you use most frequently?",
            options: [
                { text: "Gmail", emoji: "📧" },
                { text: "YouTube", emoji: "📺" },
                { text: "Google Maps", emoji: "🗺️" }
            ],
            reward: 33
        },
        {
            text: "Do you usually click on ads when browsing the internet?",
            options: [
                { text: "Frequently", emoji: "🖱️" },
                { text: "Rarely", emoji: "🚫" },
                { text: "Never", emoji: "❌" }
            ],
            reward: 48
        },
        {
            text: "What is your main concern about online privacy?",
            options: [
                { text: "Personal data collection", emoji: "🔐" },
                { text: "Activity tracking", emoji: "👁️" },
                { text: "Payment security", emoji: "💳" }
            ],
            reward: 53
        }
    ]
};

// ==================== SELETORES DOM ====================

const quizSection = document.getElementById('quizSection');
const vslSection = document.getElementById('vslSection');

const welcomePage = document.getElementById('welcomePage');
const surveyPage = document.getElementById('surveyPage');
const completionPage = document.getElementById('completionPage');

const balanceElement = document.getElementById('balance');
const balanceIndicator = document.getElementById('balanceIndicator');
const progressBar = document.getElementById('progressBar');
const progressText = document.getElementById('progressText');
const questionValue = document.getElementById('questionValue');
const finalBalance = document.getElementById('finalBalance');

const questionText = document.getElementById('questionText');
const optionsContainer = document.getElementById('optionsContainer');

const rewardPopup = document.getElementById('rewardPopup');
const rewardAmount = document.getElementById('rewardAmount');
const overlay = document.getElementById('overlay');

const startButton = document.getElementById('startButton');
const withdrawButton = document.getElementById('withdrawButton');

const withdrawalFormPage = document.getElementById('withdrawalFormPage');
const withdrawalPage = document.getElementById('withdrawalPage');
const withdrawalForm = document.getElementById('withdrawalForm');
const withdrawalFormBalance = document.getElementById('withdrawalFormBalance');
const withdrawalProgressBar = document.getElementById('withdrawalProgressBar');
const withdrawalProgressText = document.getElementById('withdrawalProgressText');
const withdrawalPending = document.getElementById('withdrawalPending');
const formError = document.getElementById('formError');

const currentYearElement = document.getElementById('currentYear');

let withdrawalData = { name: '', phone: '', bank: '', account: '' };

// ==================== INICIALIZAÇÃO ====================

document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    currentYearElement.textContent = new Date().getFullYear();
    startButton.addEventListener('click', startSurvey);
    withdrawButton.addEventListener('click', showWithdrawalForm);

    withdrawalForm.addEventListener('submit', handleWithdrawalSubmit);

    // Only allow numbers in account fields
    ['wdAccount', 'wdAccountConfirm'].forEach(id => {
        document.getElementById(id).addEventListener('input', function () {
            this.value = this.value.replace(/\D/g, '');
        });
    });
});

// ==================== SIMULAÇÃO DE SAQUE ====================

function showWithdrawalForm() {
    fadeOut(completionPage, () => {
        withdrawalFormBalance.textContent = surveyData.currentBalance;
        fadeIn(withdrawalFormPage);
    });
}

function handleWithdrawalSubmit(e) {
    e.preventDefault();

    const name = document.getElementById('wdFullName').value.trim();
    const phone = document.getElementById('wdPhone').value.trim();
    const bank = document.getElementById('wdBank').value;
    const account = document.getElementById('wdAccount').value.trim();
    const accountConfirm = document.getElementById('wdAccountConfirm').value.trim();

    // Reset error states
    formError.classList.add('hidden');
    document.getElementById('wdAccount').classList.remove('input-error');
    document.getElementById('wdAccountConfirm').classList.remove('input-error');

    // Validate account match
    if (account !== accountConfirm) {
        formError.textContent = 'Account numbers do not match. Please try again.';
        formError.classList.remove('hidden');
        document.getElementById('wdAccount').classList.add('input-error');
        document.getElementById('wdAccountConfirm').classList.add('input-error');
        return;
    }

    // Validate account length
    if (account.length < 10) {
        formError.textContent = 'Account number must be 10 digits.';
        formError.classList.remove('hidden');
        document.getElementById('wdAccount').classList.add('input-error');
        return;
    }

    withdrawalData = { name, phone, bank, account };
    showWithdrawalProcessing();
}

function showWithdrawalProcessing() {
    const maskedAccount = '******' + withdrawalData.account.slice(-4);
    const firstName = withdrawalData.name.split(' ')[0];

    // Fill receipt
    document.getElementById('receiptName').textContent = withdrawalData.name;
    document.getElementById('receiptBank').textContent = withdrawalData.bank;
    document.getElementById('receiptAccount').textContent = maskedAccount;
    document.getElementById('receiptAmount').textContent = surveyData.currentBalance + ' USD';

    // Personalize steps
    document.getElementById('wStep1Name').textContent = 'Verifying ' + firstName + "'s account";
    document.getElementById('wStep2Name').textContent = 'Validating account ' + maskedAccount;
    document.getElementById('wStep3Name').textContent = 'Converting ' + surveyData.currentBalance + ' USD to NGN';
    document.getElementById('wStep4Name').textContent = 'Requesting withdrawal';

    fadeOut(withdrawalFormPage, () => {
        fadeIn(withdrawalPage);
        runWithdrawalSimulation();
    });
}

function runWithdrawalSimulation() {
    const steps = [
        { id: 'wStep1', duration: 2200, statusActive: 'Verifying...', statusDone: 'Account verified' },
        { id: 'wStep2', duration: 1800, statusActive: 'Validating...', statusDone: 'Account valid' },
        { id: 'wStep3', duration: 2800, statusActive: 'Converting...', statusDone: 'Converted to NGN' },
        { id: 'wStep4', duration: 2500, statusActive: 'Requesting...', statusDone: 'Withdrawal pending' }
    ];

    const totalDuration = steps.reduce((sum, s) => sum + s.duration, 0);
    let elapsed = 0;

    function processStep(index) {
        if (index >= steps.length) {
            withdrawalProgressBar.style.width = '100%';
            withdrawalProgressText.textContent = '100%';

            // Show pending message with button
            setTimeout(() => {
                withdrawalPending.classList.remove('hidden');
                document.getElementById('watchVideoBtn').addEventListener('click', showVSL);
            }, 400);
            return;
        }

        const step = steps[index];
        const stepEl = document.getElementById(step.id);
        const statusEl = stepEl.querySelector('.withdrawal-step-status');

        stepEl.classList.add('active');
        statusEl.textContent = step.statusActive;

        const startElapsed = elapsed;
        const stepStart = Date.now();
        const progressInterval = setInterval(() => {
            const stepElapsed = Date.now() - stepStart;
            const currentTotal = startElapsed + Math.min(stepElapsed, step.duration);
            const pct = Math.round((currentTotal / totalDuration) * 100);
            withdrawalProgressBar.style.width = pct + '%';
            withdrawalProgressText.textContent = pct + '%';

            if (stepElapsed >= step.duration) {
                clearInterval(progressInterval);
            }
        }, 50);

        setTimeout(() => {
            elapsed += step.duration;
            stepEl.classList.remove('active');
            stepEl.classList.add('completed');
            statusEl.textContent = step.statusDone;
            processStep(index + 1);
        }, step.duration);
    }

    processStep(0);
}

function showVSL() {
    fadeOut(quizSection, () => {
        fadeIn(vslSection);
        updateBalanceDisplay(surveyData.currentBalance, false);
        loadVSLPlayer();
        loadFakeComments();
    });
}

// ==================== FACEBOOK COMMENTS SIMULATION ====================

const LIKE_SVG = '<svg width="12" height="12" viewBox="0 0 24 24" fill="#1877F2"><path d="M2 21h2V9H2v12zm20-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L13.17 1 7.59 6.59C7.22 6.95 7 7.45 7 8v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-2z"/></svg>';

const initialComments = [
    { name: 'Chioma Okafor', text: 'I just received my payment today!! Thank you so much, this is real 🙏', time: '2 min ago', likes: 24, img: 'https://media.licdn.com/dms/image/v2/D4D22AQFc3wq3NaKTiw/feedshare-shrink_800/B4DZ0hoPxIGsAc-/0/1774385691970?e=2147483647&v=beta&t=qZ-i8weDLmYqLcphzRK66ZVn0pMD6W-jLKfXiUwrpUw' },
    { name: 'Emeka Nwosu', text: 'I was skeptical at first but after watching the video I got my money within 24 hours. God is good!', time: '5 min ago', likes: 18, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTbFc3muo0BofZY54oYmgouVKd2JM-3nU3K4fN9Vx8gjHt6GoAGzGpa7hs&s=10' },
    { name: 'Aisha Bello', text: 'My sister told me about this and I didn\'t believe her. Now I\'m telling everyone too 😂💰', time: '8 min ago', likes: 31, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRE9_u4LQpnSlhozHayi7xkPAKOn2xSbUN_QU3aIuOQwpkBSM1r_Qhkbw4&s=10' },
    { name: 'Tunde Adeyemi', text: 'Alert just entered!! 🔔🔔 This is legit, make sure you watch the full video', time: '12 min ago', likes: 42, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRyWZY9omqwt9zuv3VrF_dRR3LVKvOGZJVx_YPgmzqUqHNf7lfi_PvjgkqO&s=10' },
    { name: 'Blessing Eze', text: 'I received mine through GTBank. Watch the video carefully they explain everything', time: '15 min ago', likes: 15, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRBeTpIb_PWovK648A4F9Ngq4B9CMeRVoLoeXY7FXueR4q8juWqiqzrCrM&s=10' },
    { name: 'Oluwaseun Bakare', text: 'Second time doing this survey and second time receiving payment. No scam at all ✅', time: '18 min ago', likes: 27, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRJUh3-7thnjCNd9NT4_o0W4H9Q0DLWOKfJuXjduNoIYXpKkD7FWpf464A&s=10' },
    { name: 'Fatima Abdullahi', text: 'My husband didn\'t believe me until he saw the alert on my phone 😂', time: '22 min ago', likes: 36, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSRlFtARqH07o4k8gc3nr8_iwH7l-M23rlym-MnlJ-L6Xkxotlnju5phHE&s=10' },
    { name: 'Chinedu Obi', text: 'The video is very important, don\'t skip it if you want to receive your money fast', time: '25 min ago', likes: 19, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTv4JGINO4ry62Vax2JB_grBq0IPP5eKn4S-B3MI81IDpihMnoGYSOoUOy6&s=10' },
    { name: 'Ngozi Amadi', text: 'Just got credited through my OPay! This is amazing 🎉', time: '30 min ago', likes: 22, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSV-Fe1smJZkhA0hBVgZPENIZFSLlfq9yh9C75TwaxOhg&s=10' },
    { name: 'Ibrahim Musa', text: 'I have shared this to all my WhatsApp groups. Everyone deserves to know about this!', time: '35 min ago', likes: 14, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQRuCEOAErL5RXJYPrFGbfxCoqb9ctl06Uj7dpVmMcZECkUCOLEfL_K4Eu&s=10' },
    { name: 'Adaeze Nnamdi', text: 'Received through Access Bank. Thank you Google 🙌', time: '40 min ago', likes: 33, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSzhXfOH1ulelqt-1sdjYWxyWhd8Dgutc_UeLS26TqPM6vlHkASFSkRCws&s=10' },
    { name: 'Yusuf Garba', text: 'I was afraid it was 419 but my friend showed me his own alert. Now I don believe am 😅', time: '45 min ago', likes: 28, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSrcWiVfoHodltvY3XVmaqsTDbWCFwNA2qTy21bFvT1bz_ULlvB_ciDy78&s=10' },
    { name: 'Funke Adeola', text: 'Watched the video and followed the steps. Money came the next day!', time: '50 min ago', likes: 16, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxFxwlQt0sbiMHPNPc4pxVRK4SbYd5N9n7uqqi93_jyICBNIzcVwIOVIo&s=10' },
    { name: 'Obinna Eze', text: 'Zenith Bank credited within hours. Make sure to watch everything', time: '1 hr ago', likes: 20, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLH6bKXy_cRNCSHJslTUxUAEYJ9iljJwXc06XxW0bz280zLWuKJBA7Le8&s=10' },
    { name: 'Halima Suleiman', text: 'This is the best thing I found online this year 🥳', time: '1 hr ago', likes: 39, img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu9QT4gSYzVMtF6rKK9F8fS6Da08gkFStYTiCVLpWRNR757lNs8HZH158&s=10' },
];

const autoComments = [
    { name: 'Kemi Ogundimu', text: 'Just watched the video now and followed the steps. Waiting for my alert 🤞', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIVL6ePjbDSF_fHOSkta5O_clTDYvca0-QZphoZNYzi4y9aacBm3C5GZM&s=10' },
    { name: 'Uche Okwu', text: 'Can confirm this is real! My Kuda account just got credited 💚', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQu9QT4gSYzVMtF6rKK9F8fS6Da08gkFStYTiCVLpWRNR757lNs8HZH158&s=10' },
    { name: 'Amina Yakubu', text: 'Who else is watching this video right now? 😂 Let\'s go!!', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRaZiuIXGP3TPLk29kSeMufFfElpkT8JsQ9maT7WmpYchMEk2QhuQZLPxI&s=10' },
    { name: 'Damilola Osei', text: 'My third time doing this. Always pays! 🔥', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQLH6bKXy_cRNCSHJslTUxUAEYJ9iljJwXc06XxW0bz280zLWuKJBA7Le8&s=10' },
    { name: 'Ifeanyi Chukwuma', text: 'UBA alert just dropped! God bless Google 🙏🙏', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxFxwlQt0sbiMHPNPc4pxVRK4SbYd5N9n7uqqi93_jyICBNIzcVwIOVIo&s=10' },
    { name: 'Zainab Mohammed', text: 'I told my colleagues at work and they all registered too 😄', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRxuh3SkW1AG-uC9cZrPXGykMKFaSZ8SF9aTkZSnxYShwLK3YNJgO8JJ9YC&s=10' },
    { name: 'Segun Afolabi', text: 'Moniepoint credited me in less than 2 hours after watching the video!', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQvrAcU7auSP8926fM-8r_fYFc3ijZScN9A2pyFYI9L0C40b0h6BAwBKhM&s=10' },
    { name: 'Grace Onyeka', text: 'This is wonderful!! Sharing with my church group right now 🙌', img: 'https://cdn.punchng.com/wp-content/uploads/2023/06/19142820/WhatsApp-Image-2023-06-19-at-6.09.13-AM-e1687181300566.jpeg' },
    { name: 'Musa Adamu', text: 'PalmPay alert just came in. No stories, this one is genuine ✅', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuEIpKxBzDiTIiSggT7-1qM0KSIY4aRlv0F1N_nbkF4C9G0EZBpj4yUrA&s=10' },
    { name: 'Temitope Balogun', text: 'I was doubting o, but see money for my account now 😂💰', img: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQBtbrhDVMLyANH0o-JoWX4-tLkRjkQPgD2Oh_56AYlPMEnEihjjWBQMx4q&s=10' },
];

let fbCommentCount = 0;
let autoCommentIndex = 0;
let autoCommentInterval = null;

function getInitials(name) {
    return name.split(' ').map(n => n[0]).join('');
}

function createCommentElement(comment, isNew) {
    const el = document.createElement('div');
    el.className = 'fb-comment' + (isNew ? ' fb-comment-new' : '');

    const likesCount = comment.likes || 0;
    const avatarContent = comment.img
        ? `<img src="${comment.img}" alt="${comment.name}">`
        : getInitials(comment.name);
    const avatarStyle = comment.img ? '' : 'style="background:#9CA3AF"';

    el.innerHTML = `
        <div class="fb-comment-avatar" ${avatarStyle}>${avatarContent}</div>
        <div class="fb-comment-body">
            <div class="fb-comment-bubble">
                <div class="fb-comment-name">${comment.name}</div>
                <div class="fb-comment-text">${comment.text}</div>
            </div>
            <div class="fb-comment-actions">
                <span class="fb-comment-action fb-action-like" data-liked="false" data-likes="${likesCount}">Like</span>
                <span class="fb-comment-action fb-action-reply">Reply</span>
                <span class="fb-comment-time">${comment.time || 'Just now'}</span>
                <span class="fb-comment-likes">${likesCount > 0 ? LIKE_SVG + ' ' + likesCount : ''}</span>
            </div>
            <div class="fb-comment-replies"></div>
        </div>
    `;

    // Like toggle
    const likeBtn = el.querySelector('.fb-action-like');
    const likesSpan = el.querySelector('.fb-comment-likes');
    likeBtn.addEventListener('click', function () {
        const isLiked = this.getAttribute('data-liked') === 'true';
        let count = parseInt(this.getAttribute('data-likes'));
        if (isLiked) {
            count--;
            this.setAttribute('data-liked', 'false');
            this.classList.remove('liked');
        } else {
            count++;
            this.setAttribute('data-liked', 'true');
            this.classList.add('liked');
        }
        this.setAttribute('data-likes', count);
        likesSpan.innerHTML = count > 0 ? LIKE_SVG + ' ' + count : '';
    });

    // Reply toggle
    const replyBtn = el.querySelector('.fb-action-reply');
    const repliesContainer = el.querySelector('.fb-comment-replies');
    replyBtn.addEventListener('click', function () {
        if (repliesContainer.querySelector('.fb-reply-input-area')) return;
        const replyArea = document.createElement('div');
        replyArea.className = 'fb-reply-input-area';
        replyArea.innerHTML = `
            <input type="text" class="fb-reply-input" placeholder="Write a reply...">
            <button class="fb-reply-send" type="button">Send</button>
        `;
        repliesContainer.appendChild(replyArea);
        const input = replyArea.querySelector('.fb-reply-input');
        input.focus();

        function submitReply() {
            const text = input.value.trim();
            if (!text) return;
            replyArea.remove();
            const replyEl = document.createElement('div');
            replyEl.className = 'fb-comment fb-comment-new';
            replyEl.innerHTML = `
                <div class="fb-comment-avatar" style="background:#9CA3AF">You</div>
                <div class="fb-comment-body">
                    <div class="fb-comment-bubble">
                        <div class="fb-comment-name">You</div>
                        <div class="fb-comment-text">${text}</div>
                    </div>
                    <div class="fb-comment-actions">
                        <span class="fb-comment-action">Like</span>
                        <span class="fb-comment-time">Just now</span>
                    </div>
                </div>
            `;
            repliesContainer.appendChild(replyEl);
        }

        replyArea.querySelector('.fb-reply-send').addEventListener('click', submitReply);
        input.addEventListener('keydown', function (e) {
            if (e.key === 'Enter') submitReply();
        });
    });

    return el;
}

function updateCommentCounter() {
    document.getElementById('fbCommentsCount').textContent = fbCommentCount + ' comments';
}

function addAutoComment() {
    if (autoCommentIndex >= autoComments.length) autoCommentIndex = 0;
    const comment = autoComments[autoCommentIndex];
    autoCommentIndex++;

    const list = document.getElementById('fbCommentsList');
    const el = createCommentElement({ ...comment, time: 'Just now', likes: Math.floor(Math.random() * 5) }, true);
    list.insertBefore(el, list.firstChild);
    fbCommentCount++;
    updateCommentCounter();

    list.scrollTop = 0;
}

function loadFakeComments() {
    const list = document.getElementById('fbCommentsList');
    list.innerHTML = '';
    fbCommentCount = 0;

    initialComments.forEach((comment, index) => {
        setTimeout(() => {
            const el = createCommentElement(comment, false);
            list.appendChild(el);
            fbCommentCount++;
            updateCommentCounter();
        }, index * 800);
    });

    // User comment input
    const input = document.getElementById('fbCommentInput');
    const sendBtn = document.getElementById('fbCommentSend');

    function postUserComment() {
        const text = input.value.trim();
        if (!text) return;
        const el = createCommentElement({ name: 'You', text: text, time: 'Just now', likes: 0, color: '#9CA3AF' }, true);
        list.insertBefore(el, list.firstChild);
        fbCommentCount++;
        updateCommentCounter();
        input.value = '';
        list.scrollTop = 0;
    }

    sendBtn.addEventListener('click', postUserComment);
    input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') postUserComment();
    });

    // Auto-comment every 2 minutes
    if (autoCommentInterval) clearInterval(autoCommentInterval);
    autoCommentInterval = setInterval(addAutoComment, 120000);
}

function initializeData() {
    surveyData.currentBalance = surveyData.initialBalance;
    updateBalanceDisplay(surveyData.currentBalance, false);
}

// ==================== NAVEGAÇÃO ENTRE PÁGINAS ====================

function startSurvey() {
    surveyData.currentQuestionIndex = 0;
    fadeOut(welcomePage, () => {
        fadeIn(surveyPage);
        showCurrentQuestion();
    });
}

function showCompletionPage() {
    fadeOut(surveyPage, () => {
        finalBalance.textContent = surveyData.currentBalance;
        fadeIn(completionPage);
    });
}

/**
 * Carrega o player VSL apenas quando necessário
 */
function loadVSLPlayer() {
    if (window.vslPlayerLoaded) {
        console.log('Player VSL já foi carregado anteriormente');
        return;
    }
    const playerContainer = document.getElementById('vslPlayerContainer');
    if (!playerContainer) {
        console.error('Container do player não encontrado!');
        return;
    }
    playerContainer.innerHTML = '';

    // ── PLAYER ATUALIZADO ──
    playerContainer.innerHTML = '<vturb-smartplayer id="vid-69d3483cd02c3c8fc0d3d170" style="display: block; margin: 0 auto; width: 100%;"></vturb-smartplayer>';

    var s = document.createElement("script");
    s.type = "text/javascript";
    s.src = "https://scripts.converteai.net/221c9f43-b961-4a72-a699-97ce3551a9df/players/69d3483cd02c3c8fc0d3d170/v4/player.js";
    s.async = true;
    s.onload = function () {
        window.vslPlayerLoaded = true;
        console.log('Script do player VSL carregado com sucesso');
    };
    s.onerror = function () {
        console.error('Erro ao carregar o script do player VSL');
    };
    document.head.appendChild(s);
}

const allPages = [
    document.getElementById('welcomePage'),
    document.getElementById('surveyPage'),
    document.getElementById('completionPage'),
    document.getElementById('withdrawalFormPage'),
    document.getElementById('withdrawalPage')
];

function hideAllPages() {
    allPages.forEach(page => {
        if (page) page.classList.add('hidden');
    });
}

function fadeOut(element, callback) {
    element.classList.add('hidden');
    if (callback) callback();
}

function fadeIn(element) {
    hideAllPages();
    element.classList.remove('hidden');
    element.classList.add('fade-in');
    setTimeout(() => {
        element.classList.remove('fade-in');
    }, 500);
}

// ==================== SISTEMA DE PERGUNTAS ====================

function showCurrentQuestion() {
    const currentQuestion = surveyData.questions[surveyData.currentQuestionIndex];

    questionText.textContent = currentQuestion.text;
    questionValue.textContent = `Vale: ${currentQuestion.reward} USD`;

    const progress = ((surveyData.currentQuestionIndex + 1) / surveyData.questions.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressText.textContent = `Question ${surveyData.currentQuestionIndex + 1} of ${surveyData.questions.length}`;

    optionsContainer.innerHTML = '';

    currentQuestion.options.forEach((option, index) => {
        const optionElement = document.createElement('div');
        optionElement.className = 'survey-option';
        optionElement.innerHTML = `
            <span class="survey-option-emoji">${option.emoji}</span>
            <span class="survey-option-text">${option.text}</span>
        `;
        optionElement.addEventListener('click', () => selectOption(index));
        optionsContainer.appendChild(optionElement);
    });
}

function selectOption(optionIndex) {
    const currentQuestion = surveyData.questions[surveyData.currentQuestionIndex];
    const reward = currentQuestion.reward;

    addToBalance(reward);
    showRewardPopup(reward);

    setTimeout(() => {
        hideRewardPopup();
        surveyData.currentQuestionIndex++;

        if (surveyData.currentQuestionIndex < surveyData.questions.length) {
            showCurrentQuestion();
        } else {
            showCompletionPage();
        }
    }, 2000);
}

// ==================== GERENCIAMENTO DE SALDO ====================

function addToBalance(amount) {
    surveyData.currentBalance += amount;
    updateBalanceDisplay(surveyData.currentBalance, true);
}

function updateBalanceDisplay(newAmount, animate = false) {
    if (animate) {
        const startValue = parseInt(balanceElement.textContent);
        const endValue = newAmount;
        const duration = 1000;
        const frameRate = 30;
        const increment = Math.ceil((endValue - startValue) / (duration / (1000 / frameRate)));

        let currentValue = startValue;
        const counter = setInterval(() => {
            currentValue += increment;
            if ((increment > 0 && currentValue >= endValue) ||
                (increment < 0 && currentValue <= endValue)) {
                clearInterval(counter);
                currentValue = endValue;
            }
            balanceElement.textContent = currentValue;
        }, 1000 / frameRate);

        balanceIndicator.classList.add('active');
        setTimeout(() => {
            balanceIndicator.classList.remove('active');
        }, 2000);
    } else {
        balanceElement.textContent = newAmount;
    }
}

// ==================== POPUP DE RECOMPENSA ====================

function showRewardPopup(amount) {
    rewardAmount.textContent = `+${amount} USD`;
    overlay.classList.add('active');
    rewardPopup.classList.add('active');
    createConfetti();
    playCashRegisterSound();
}

function hideRewardPopup() {
    overlay.classList.remove('active');
    rewardPopup.classList.remove('active');
}

// ==================== SOM DE CAIXA REGISTRADORA ====================

const cashRegisterSound = new Audio('30.mp3');

function playCashRegisterSound() {
    try {
        cashRegisterSound.currentTime = 0;
        cashRegisterSound.play();
    } catch (e) {
        // Silently fail if audio not supported
    }
}

// ==================== EFEITO DE CONFETE ====================

function createConfetti() {
    const confettiContainer = document.getElementById('confettiCanvas');
    confettiContainer.innerHTML = '';

    const colors = ['#38B764', '#4BDE7C', '#4D7CFE', '#6D93FF', '#FBBC04'];

    for (let i = 0; i < 50; i++) {
        const confetti = document.createElement('div');
        confetti.style.position = 'absolute';
        confetti.style.width = `${Math.random() * 10 + 5}px`;
        confetti.style.height = `${Math.random() * 4 + 2}px`;
        confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.left = `${Math.random() * 100}%`;
        confetti.style.top = `-10px`;
        confetti.style.transform = `rotate(${Math.random() * 360}deg)`;
        confetti.style.opacity = Math.random() + 0.5;
        confetti.style.borderRadius = '2px';

        confettiContainer.appendChild(confetti);

        const duration = Math.random() * 2000 + 1000;
        const delay = Math.random() * 500;

        confetti.animate([
            { transform: `translate(0, 0) rotate(${Math.random() * 360}deg)`, opacity: 1 },
            { transform: `translate(${Math.random() * 100 - 50}px, ${Math.random() * 200 + 200}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
        ], {
            duration: duration,
            delay: delay,
            fill: 'forwards',
            easing: 'cubic-bezier(0.21, 0.98, 0.6, 0.99)'
        });
    }
}
