// Single admin credentials
const ADMIN_USERNAME = 'malak';
const ADMIN_PASSWORD = '123';

// Save questions to localStorage and generate downloadable file
function saveQuestionsToFile(questions) {
    // Save to localStorage
    localStorage.setItem('questions', JSON.stringify(questions));
    
    // Create and download JSON file
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    // Update the questions.json file link
    const downloadLink = document.getElementById('downloadQuestionsLink');
    if (downloadLink) {
        downloadLink.href = url;
        downloadLink.download = 'questions.json';
        downloadLink.style.display = 'inline-block';
    }
}

// Delete all questions
function deleteAllQuestions() {
    if (confirm('Are you sure you want to delete all questions? This cannot be undone.')) {
        localStorage.setItem('questions', '[]');
        displayQuestions();
        
        // Update download link
        const downloadLink = document.getElementById('downloadQuestionsLink');
        if (downloadLink) {
            downloadLink.style.display = 'none';
        }
        
        alert('All questions have been deleted.');
    }
}

// Import questions from file
function importQuestions(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const questions = JSON.parse(e.target.result);
                localStorage.setItem('questions', JSON.stringify(questions));
                saveQuestionsToFile(questions);
                displayQuestions();
                alert('Questions imported successfully!');
            } catch (error) {
                alert('Error importing questions. Please check the file format.');
            }
        };
        reader.readAsText(file);
    }
}

// Handle login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            localStorage.setItem('adminLoggedIn', 'true');
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials!');
        }
    });
}

// Check admin authentication
function checkAdminAuth() {
    if (!localStorage.getItem('adminLoggedIn')) {
        window.location.href = 'login.html';
    }
}

// Handle question type selection
if (document.getElementById('questionType')) {
    document.getElementById('questionType').addEventListener('change', (e) => {
        const type = e.target.value;
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        if (type === 'matching') {
            container.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Matching Pairs</label>
                    <div id="matchingPairs">
                        <div class="row mb-2">
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Item 1" required>
                            </div>
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Match 1" required>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addMatchingPair()">Add Pair</button>
                </div>
            `;
        } else if (type === 'truefalse') {
            container.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Correct Answer</label>
                    <select class="form-select" id="correctAnswer" required>
                        <option value="true">True</option>
                        <option value="false">False</option>
                    </select>
                </div>
            `;
        } else if (type === 'multichoice' || type === 'definition') {
            container.innerHTML = `
                <div class="mb-3">
                    <label class="form-label">Options</label>
                    <div id="optionsList">
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" placeholder="Option 1" required>
                            <div class="input-group-text">
                                <input type="radio" name="correct" value="0" required>
                            </div>
                        </div>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" placeholder="Option 2" required>
                            <div class="input-group-text">
                                <input type="radio" name="correct" value="1" required>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addOption()">Add Option</button>
                </div>
            `;
        }
    });
}

// Function to add matching pair
function addMatchingPair() {
    const matchingPairs = document.getElementById('matchingPairs');
    const pairCount = matchingPairs.children.length + 1;
    
    const pairDiv = document.createElement('div');
    pairDiv.className = 'row mb-2';
    pairDiv.innerHTML = `
        <div class="col">
            <input type="text" class="form-control" placeholder="Item ${pairCount}" required>
        </div>
        <div class="col">
            <input type="text" class="form-control" placeholder="Match ${pairCount}" required>
        </div>
    `;
    
    matchingPairs.appendChild(pairDiv);
}

// Handle question form submission
if (document.getElementById('questionForm')) {
    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('questionType').value;
        const text = document.getElementById('questionText').value;
        let question;

        if (type === 'matching') {
            const pairs = [];
            const rows = document.querySelectorAll('#matchingPairs .row');
            
            rows.forEach(row => {
                const item = row.querySelector('.col:first-child input').value;
                const match = row.querySelector('.col:last-child input').value;
                pairs.push({ item, match });
            });

            question = {
                type,
                text,
                pairs,
                maxAttempts: 3
            };
        } else {
            let correct, options;
            if (type === 'truefalse') {
                correct = document.getElementById('correctAnswer').value;
            } else {
                options = Array.from(document.querySelectorAll('#optionsList input[type="text"]'))
                    .map(input => input.value);
                correct = document.querySelector('input[name="correct"]:checked').value;
            }

            question = {
                type,
                text,
                correct,
                options,
                maxAttempts: 3
            };
        }

        // Save question to localStorage and update file
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.push(question);
        saveQuestionsToFile(questions);
        
        // Reset form and refresh display
        e.target.reset();
        document.getElementById('optionsContainer').innerHTML = '';
        displayQuestions();
        alert('Question added successfully!');
    });
}

// Display questions in admin dashboard
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;

    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    
    const html = questions.map((q, i) => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-1">${q.text}</h6>
                <span class="badge bg-primary">${q.type}</span>
            </div>
            <p class="mb-1">
                ${q.type === 'matching' ? 
                    q.pairs.map(p => `${p.item} → ${p.match}`).join('<br>') :
                    q.type === 'multichoice' || q.type === 'definition' ?
                        `Options: ${q.options.join(', ')}` :
                        `Answer: ${q.correct}`
                }
            </p>
            <button class="btn btn-danger btn-sm" onclick="deleteQuestion(${i})">Delete</button>
        </div>
    `).join('');

    questionsList.innerHTML = html;
}

// Delete individual question
function deleteQuestion(index) {
    if (confirm('Are you sure you want to delete this question?')) {
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        saveQuestionsToFile(questions);
        displayQuestions();
        alert('Question deleted!');
    }
}

// Handle logout
if (document.getElementById('logoutBtn')) {
    document.getElementById('logoutBtn').addEventListener('click', (e) => {
        e.preventDefault();
        localStorage.removeItem('adminLoggedIn');
        window.location.href = 'login.html';
    });
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('dashboard.html')) {
        checkAdminAuth();
    }
    displayQuestions();
});

// Function to add more options for multiple choice questions
function addOption() {
    const optionsList = document.getElementById('optionsList');
    const optionsCount = optionsList.children.length;
    
    const optionDiv = document.createElement('div');
    optionDiv.className = 'input-group mb-2';
    optionDiv.innerHTML = `
        <input type="text" class="form-control" placeholder="Option ${optionsCount + 1}" required>
        <div class="input-group-text">
            <input type="radio" name="correct" value="${optionsCount}" required>
        </div>
    `;
    
    optionsList.appendChild(optionDiv);
}
