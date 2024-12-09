// Load questions from file or localStorage
async function loadQuestions() {
    try {
        const response = await fetch('questions.json');
        if (response.ok) {
            questions = await response.json();
        } else {
            questions = JSON.parse(localStorage.getItem('questions')) || [];
        }
    } catch (error) {
        questions = JSON.parse(localStorage.getItem('questions')) || [];
    }
    displayQuestions();
}

// Function to display questions
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((question, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-12';
        
        let optionsHtml = '';
        if (question.type === 'truefalse') {
            optionsHtml = `
                <div class="form-check">
                    <input type="radio" name="q${index}" class="form-check-input" value="true">
                    <label class="form-check-label">True</label>
                </div>
                <div class="form-check">
                    <input type="radio" name="q${index}" class="form-check-input" value="false">
                    <label class="form-check-label">False</label>
                </div>
            `;
        } else if (question.type === 'multichoice' || question.type === 'definition') {
            optionsHtml = question.options.map((option, i) => `
                <div class="form-check">
                    <input type="radio" name="q${index}" class="form-check-input" value="${i}">
                    <label class="form-check-label">${option}</label>
                </div>
            `).join('');
        } else if (question.type === 'matching') {
            const shuffledMatches = [...question.pairs].map(p => p.match).sort(() => Math.random() - 0.5);
            optionsHtml = `
                <div class="matching-container">
                    <div class="matching-items">
                        ${question.pairs.map((pair, i) => `
                            <div class="matching-item" data-item="${i}">${pair.item}</div>
                        `).join('')}
                    </div>
                    <div class="matching-matches">
                        ${shuffledMatches.map((match, i) => `
                            <div class="matching-item" data-match="${i}">${match}</div>
                        `).join('')}
                    </div>
                </div>
                <input type="hidden" name="q${index}" value="">
            `;
        }

        col.innerHTML = `
            <div class="card question-card">
                <div class="card-body">
                    <div class="question-number">Question ${index + 1}</div>
                    <span class="badge bg-primary question-type-badge">${question.type}</span>
                    <h5 class="card-title mb-4">${question.text}</h5>
                    <form class="question-form" data-index="${index}" data-attempts="0" data-max-attempts="${question.maxAttempts || 3}">
                        ${optionsHtml}
                        <button type="submit" class="btn btn-primary mt-3">Submit Answer</button>
                        <div class="attempts-left">Attempts left: ${question.maxAttempts || 3}</div>
                    </form>
                </div>
            </div>
        `;

        questionsList.appendChild(col);

        // Add matching functionality if needed
        if (question.type === 'matching') {
            const form = col.querySelector('.question-form');
            const items = form.querySelectorAll('.matching-items .matching-item');
            const matches = form.querySelectorAll('.matching-matches .matching-item');
            let selectedItem = null;

            items.forEach(item => {
                item.addEventListener('click', () => {
                    if (selectedItem) selectedItem.classList.remove('selected');
                    item.classList.add('selected');
                    selectedItem = item;
                });
            });

            matches.forEach(match => {
                match.addEventListener('click', () => {
                    if (selectedItem) {
                        const itemIndex = selectedItem.dataset.item;
                        const matchIndex = match.dataset.match;
                        selectedItem.classList.remove('selected');
                        selectedItem.dataset.matched = matchIndex;
                        selectedItem = null;
                        
                        // Check if all items are matched
                        const allMatched = Array.from(items).every(item => item.dataset.matched !== undefined);
                        if (allMatched) {
                            const answers = Array.from(items).map(item => item.dataset.matched);
                            form.querySelector('input[type="hidden"]').value = answers.join(',');
                        }
                    }
                });
            });
        }
    });

    // Add event listeners to forms
    document.querySelectorAll('.question-form').forEach(form => {
        form.addEventListener('submit', handleAnswerSubmission);
    });
}

// Handle answer submission
function handleAnswerSubmission(e) {
    e.preventDefault();
    const form = e.target;
    const index = form.dataset.index;
    const question = questions[index];
    const attempts = parseInt(form.dataset.attempts);
    const maxAttempts = parseInt(form.dataset.maxAttempts);
    
    if (attempts >= maxAttempts) {
        return;
    }

    let userAnswer;
    let isCorrect = false;

    if (question.type === 'matching') {
        const answers = form.querySelector('input[type="hidden"]').value.split(',');
        isCorrect = answers.every((answer, i) => {
            return question.pairs[i].match === question.pairs[answer].match;
        });
        userAnswer = answers;
    } else {
        const selectedOption = form.querySelector('input[type="radio"]:checked');
        if (!selectedOption) {
            alert('Please select an answer!');
            return;
        }
        userAnswer = selectedOption.value;
        isCorrect = userAnswer === question.correct;
    }

    form.dataset.attempts = attempts + 1;
    const attemptsLeft = maxAttempts - (attempts + 1);
    form.querySelector('.attempts-left').textContent = `Attempts left: ${attemptsLeft}`;

    const feedbackDiv = form.querySelector('.feedback') || document.createElement('div');
    feedbackDiv.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'} mt-3 feedback`;
    
    if (isCorrect) {
        feedbackDiv.innerHTML = `✅ Correct!`;
        form.querySelectorAll('input').forEach(input => input.disabled = true);
        form.querySelector('button').disabled = true;
    } else {
        if (attemptsLeft > 0) {
            feedbackDiv.innerHTML = `❌ Incorrect! Try again. You have ${attemptsLeft} attempts left.`;
        } else {
            feedbackDiv.innerHTML = `❌ Incorrect! No more attempts left.<br>
                <strong>The correct answer is:</strong> ${
                    question.type === 'matching' 
                        ? question.pairs.map(p => `${p.item} → ${p.match}`).join(', ')
                        : question.type === 'multichoice' || question.type === 'definition'
                            ? question.options[question.correct]
                            : question.correct
                }`;
            form.querySelectorAll('input').forEach(input => input.disabled = true);
            form.querySelector('button').disabled = true;
        }
    }

    if (!form.querySelector('.feedback')) {
        form.appendChild(feedbackDiv);
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    let questions = [];
    loadQuestions();
});
