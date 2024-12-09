// Store questions in localStorage if no backend is available
let questions = JSON.parse(localStorage.getItem('questions')) || [];

// Function to display questions
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    questionsList.innerHTML = '';

    questions.forEach((question, index) => {
        const col = document.createElement('div');
        col.className = 'col-md-12 ';
        
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
        } else if (question.type === 'multichoice') {
            optionsHtml = question.options.map((option, i) => `
                <div class="form-check">
                    <input type="radio" name="q${index}" class="form-check-input" value="${i}">
                    <label class="form-check-label">${option}</label>
                </div>
            `).join('');
        } else if (question.type === 'definition') {
            optionsHtml = `
                <div class="form-group">
                    <textarea class="form-control" rows="3" placeholder="Enter your answer"></textarea>
                </div>
            `;
        }

        col.innerHTML = `
            <div class="card question-card mb-4 shadow-sm">
                <div class="card-body">
                    <span class="badge bg-primary question-type-badge">${question.type}</span>
                    <h5 class="card-title">${question.text}</h5>
                    <form class="mt-3 question-form" data-index="${index}">
                        ${optionsHtml}
                        <button type="submit" class="btn btn-primary mt-3">Submit Answer</button>
                    </form>
                </div>
            </div>
        `;

        questionsList.appendChild(col);
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
    let userAnswer;

    if (question.type === 'multichoice' || question.type === 'truefalse' || question.type === 'definition') {
        const selectedOption = form.querySelector('input[type="radio"]:checked');
        if (!selectedOption) {
            alert('Please select an answer!');
            return;
        }
        userAnswer = selectedOption.value;
        
        // Check answer and show feedback
        const isCorrect = userAnswer === question.correct;
        const feedbackDiv = form.querySelector('.feedback') || document.createElement('div');
        feedbackDiv.className = `alert ${isCorrect ? 'alert-success' : 'alert-danger'} mt-3 feedback`;
        feedbackDiv.innerHTML = `
            ${isCorrect ? '✅ Correct!' : '❌ Incorrect!'}<br>
            <strong>The correct answer is:</strong> ${question.type === 'multichoice' || question.type === 'definition' ? 
                question.options[question.correct] : 
                question.correct}
        `;
        
        if (!form.querySelector('.feedback')) {
            form.appendChild(feedbackDiv);
        }
        
        // Disable form after submission
        form.querySelectorAll('input').forEach(input => input.disabled = true);
        form.querySelector('button').disabled = true;
    }
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    displayQuestions();
});
