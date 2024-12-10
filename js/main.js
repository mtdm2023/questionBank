// Load questions from localStorage
let questions = [];

// Clear user progress
function clearProgress() {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('question_')) {
            localStorage.removeItem(key);
        }
    });
    loadQuestions();
}

// Load questions from localStorage
function loadQuestions() {
    questions = JSON.parse(localStorage.getItem('questions')) || [];
    displayQuestions();
}

// Get correct answer text based on question type
function getCorrectAnswerText(question) {
    switch(question.type) {
        case 'matching':
            return question.pairs.map(pair => `${pair.item} → ${pair.match}`).join('<br>');
        case 'multichoice':
        case 'definition':
            return question.options[parseInt(question.correct)];
        case 'truefalse':
            return question.correct === 'true' ? 'True' : 'False';
        default:
            return '';
    }
}

// Function to display questions
function displayQuestions() {
    const container = document.getElementById('questions-container');
    if (!container) return;

    let html = `
        <div class="text-center mb-4">
            <button class="btn btn-secondary" onclick="clearProgress()">
                <i class="fas fa-redo"></i> Reset All Progress
            </button>
        </div>
    `;

    html += questions.map((q, index) => {
        let content = '';
        const attempts = parseInt(localStorage.getItem(`question_${index}_attempts`) || '0');
        const isAnswered = localStorage.getItem(`question_${index}_answered`) === 'true';
        const isDisabled = attempts >= q.maxAttempts || isAnswered;

        if (q.type === 'matching') {
            const shuffledMatches = [...q.pairs].map(p => p.match).sort(() => Math.random() - 0.5);
            content = `
                <div class="matching-question mb-3" data-index="${index}">
                    <p class="mb-2">${q.text}</p>
                    <div class="row">
                        <div class="col-md-6">
                            ${q.pairs.map((pair, i) => `
                                <div class="matching-item mb-2">
                                    <span class="item-text">${pair.item}</span>
                                    <select class="form-select match-select" ${isDisabled ? 'disabled' : ''}>
                                        <option value="">Select a match</option>
                                        ${shuffledMatches.map((match, j) => `
                                            <option value="${match}">${match}</option>
                                        `).join('')}
                                    </select>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    ${!isDisabled ? `
                        <button class="btn btn-primary check-matching" onclick="checkMatchingAnswer(${index})">
                            Check Answer
                        </button>
                    ` : ''}
                    <div id="feedback-${index}" class="feedback mt-2"></div>
                </div>
            `;
        } else if (q.type === 'truefalse') {
            content = `
                <div class="true-false-question mb-3" id="question-${index}">
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="q${index}" value="true" ${isDisabled ? 'disabled' : ''}>
                        <label class="form-check-label">True</label>
                    </div>
                    <div class="form-check">
                        <input class="form-check-input" type="radio" name="q${index}" value="false" ${isDisabled ? 'disabled' : ''}>
                        <label class="form-check-label">False</label>
                    </div>
                    ${!isDisabled ? `
                        <button class="btn btn-primary check-answer" onclick="checkAnswer(${index})">Submit</button>
                    ` : ''}
                    <div id="feedback-${index}" class="feedback mt-2"></div>
                </div>
            `;
        } else {
            content = `
                <div class="multiple-choice-question mb-3" id="question-${index}">
                    ${q.options.map((option, i) => `
                        <div class="form-check">
                            <input class="form-check-input" type="radio" name="q${index}" value="${i}" ${isDisabled ? 'disabled' : ''}>
                            <label class="form-check-label">${option}</label>
                        </div>
                    `).join('')}
                    ${!isDisabled ? `
                        <button class="btn btn-primary check-answer" onclick="checkAnswer(${index})">Submit</button>
                    ` : ''}
                    <div id="feedback-${index}" class="feedback mt-2"></div>
                </div>
            `;
        }

        return `
            <div class="card mb-3 question-card">
                <div class="card-body">
                    <h5 class="card-title">Question ${index + 1}</h5>
                    <p class="card-text">${q.text}</p>
                    ${content}
                    ${isAnswered ? `
                        <div class="alert alert-info mt-2">
                            <strong>Correct answer:</strong> ${getCorrectAnswerText(q)}
                        </div>
                    ` : ''}
                    ${attempts < q.maxAttempts && !isAnswered ? `
                        <small class="text-muted">Attempts left: ${q.maxAttempts - attempts}</small>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');

    container.innerHTML = html;

    // Restore feedback messages
    questions.forEach((_, index) => {
        const feedback = localStorage.getItem(`question_${index}_feedback`);
        if (feedback) {
            const feedbackElement = document.getElementById(`feedback-${index}`);
            if (feedbackElement) {
                feedbackElement.innerHTML = feedback;
            }
        }
    });
}

// Check matching answer
function checkMatchingAnswer(index) {
    const question = questions[index];
    const questionDiv = document.querySelector(`[data-index="${index}"]`);
    const selects = questionDiv.querySelectorAll('.match-select');
    const feedbackElement = document.getElementById(`feedback-${index}`);
    
    let attempts = parseInt(localStorage.getItem(`question_${index}_attempts`) || '0');
    attempts++;
    localStorage.setItem(`question_${index}_attempts`, attempts);

    const userAnswers = Array.from(selects).map(select => select.value);
    const correctAnswers = question.pairs.map(pair => pair.match);
    
    const isCorrect = userAnswers.every((answer, i) => answer === correctAnswers[i]);
    
    const feedbackHtml = isCorrect ? 
        '<div class="alert alert-success">Correct! Well done!</div>' : 
        '<div class="alert alert-danger">Incorrect. Try again!</div>';
    
    feedbackElement.innerHTML = feedbackHtml;
    localStorage.setItem(`question_${index}_feedback`, feedbackHtml);
    
    if (isCorrect || attempts >= question.maxAttempts) {
        localStorage.setItem(`question_${index}_answered`, 'true');
    }
    
    displayQuestions();
}

// Check other question types
function checkAnswer(index) {
    const question = questions[index];
    const questionDiv = document.getElementById(`question-${index}`);
    const selected = document.querySelector(`input[name="q${index}"]:checked`);
    const feedbackElement = document.getElementById(`feedback-${index}`);
    
    if (!selected) {
        alert('Please select an answer');
        return;
    }

    let attempts = parseInt(localStorage.getItem(`question_${index}_attempts`) || '0');
    attempts++;
    localStorage.setItem(`question_${index}_attempts`, attempts);

    const userAnswer = selected.value;
    const isCorrect = userAnswer === question.correct;
    
    const feedbackHtml = isCorrect ? 
        '<div class="alert alert-success">Correct! Well done!</div>' : 
        '<div class="alert alert-danger">Incorrect. Try again!</div>';
    
    feedbackElement.innerHTML = feedbackHtml;
    localStorage.setItem(`question_${index}_feedback`, feedbackHtml);
    
    if (isCorrect || attempts >= question.maxAttempts) {
        localStorage.setItem(`question_${index}_answered`, 'true');
    }
    
    displayQuestions();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    loadQuestions();
});
