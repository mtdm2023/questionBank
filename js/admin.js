// Single admin credentials
const ADMIN_USERNAME = 'malak';
const ADMIN_PASSWORD = '123';

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

// Export questions to file
function exportQuestions() {
    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    const dataStr = JSON.stringify(questions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'questions.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Import questions from file
function importQuestions() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = (event) => {
            try {
                const questions = JSON.parse(event.target.result);
                localStorage.setItem('questions', JSON.stringify(questions));
                alert('Questions imported successfully!');
                displayQuestions();
            } catch (error) {
                alert('Error importing questions. Please check the file format.');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Handle question type selection
if (document.getElementById('questionType')) {
    document.getElementById('questionType').addEventListener('change', (e) => {
        const type = e.target.value;
        const container = document.getElementById('optionsContainer');
        container.innerHTML = '';

        if (type === 'truefalse') {
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
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" placeholder="Option 3" required>
                            <div class="input-group-text">
                                <input type="radio" name="correct" value="2" required>
                            </div>
                        </div>
                        <div class="input-group mb-2">
                            <input type="text" class="form-control" placeholder="Option 4" required>
                            <div class="input-group-text">
                                <input type="radio" name="correct" value="3" required>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addOption()">Add Option</button>
                </div>
            `;
        } else if (type === 'matching') {
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
                        <div class="row mb-2">
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Item 2" required>
                            </div>
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Match 2" required>
                            </div>
                        </div>
                        <div class="row mb-2">
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Item 3" required>
                            </div>
                            <div class="col">
                                <input type="text" class="form-control" placeholder="Match 3" required>
                            </div>
                        </div>
                    </div>
                    <button type="button" class="btn btn-secondary btn-sm" onclick="addMatchingPair()">Add Pair</button>
                </div>
            `;
        }
    });
}

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
        let correct, options, pairs;

        if (type === 'truefalse') {
            correct = document.getElementById('correctAnswer').value;
        } else if (type === 'multichoice' || type === 'definition') {
            options = Array.from(document.querySelectorAll('#optionsList input[type="text"]'))
                .map(input => input.value);
            correct = document.querySelector('input[name="correct"]:checked').value;
        } else if (type === 'matching') {
            const matchingPairs = document.getElementById('matchingPairs');
            const pairs = [];
            const rows = matchingPairs.querySelectorAll('.row');
            
            rows.forEach(row => {
                const item = row.querySelector('.col:first-child input').value;
                const match = row.querySelector('.col:last-child input').value;
                pairs.push({ item, match });
            });

            const question = {
                type,
                text,
                pairs,
                maxAttempts: 3
            };

            // Save question to localStorage
            const questions = JSON.parse(localStorage.getItem('questions')) || [];
            questions.push(question);
            localStorage.setItem('questions', JSON.stringify(questions));

            // Save to local file
            const dataStr = JSON.stringify(questions, null, 2);
            const dataBlob = new Blob([dataStr], { type: 'application/json' });
            const url = URL.createObjectURL(dataBlob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = 'questions.json';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            // Reset form and show success message
            e.target.reset();
            document.getElementById('optionsContainer').innerHTML = '';
            alert('Question added successfully and saved to file!');
            
            // Refresh questions list
            displayQuestions();
            return;
        }

        const question = {
            type,
            text,
            correct,
            options,
            maxAttempts: 3
        };

        // Save question to localStorage
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.push(question);
        localStorage.setItem('questions', JSON.stringify(questions));

        // Save to local file
        const dataStr = JSON.stringify(questions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = 'questions.json';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        // Reset form and show success message
        e.target.reset();
        document.getElementById('optionsContainer').innerHTML = '';
        alert('Question added successfully and saved to file!');
        
        // Refresh questions list
        displayQuestions();
    });
}

// Display existing questions in admin dashboard
function displayQuestions() {
    const questionsList = document.getElementById('questionsList');
    if (!questionsList) return;

    const questions = JSON.parse(localStorage.getItem('questions')) || [];
    questionsList.innerHTML = questions.map((q, i) => `
        <div class="list-group-item">
            <div class="d-flex justify-content-between align-items-center">
                <h6 class="mb-1">${q.text}</h6>
                <span class="badge bg-primary">${q.type}</span>
            </div>
            <button class="btn btn-danger btn-sm mt-2" onclick="deleteQuestion(${i})">Delete</button>
        </div>
    `).join('');
}

// Delete question
function deleteQuestion(index) {
    if (confirm('Are you sure you want to delete this question?')) {
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.splice(index, 1);
        localStorage.setItem('questions', JSON.stringify(questions));
        displayQuestions();
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
    // Check admin authentication on protected pages
    if (window.location.pathname.includes('dashboard.html')) {
        checkAdminAuth();
    }

    // Display questions if on dashboard
    displayQuestions();
});
