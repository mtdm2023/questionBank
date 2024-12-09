// Store admin credentials in localStorage (in a real app, this would be handled by a backend)
const admins = JSON.parse(localStorage.getItem('admins')) || [];

// Handle login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        const admin = admins.find(a => a.email === email && a.password === password);
        if (admin) {
            localStorage.setItem('currentAdmin', JSON.stringify(admin));
            window.location.href = 'dashboard.html';
        } else {
            alert('Invalid credentials!');
        }
    });
}

// Handle registration
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }

        if (admins.some(admin => admin.email === email)) {
            alert('Email already registered!');
            return;
        }

        admins.push({ name, email, password });
        localStorage.setItem('admins', JSON.stringify(admins));
        alert('Registration successful! Please login.');
        window.location.href = 'login.html';
    });
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

// Handle question form submission
if (document.getElementById('questionForm')) {
    document.getElementById('questionForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const type = document.getElementById('questionType').value;
        const text = document.getElementById('questionText').value;
        let correct, options;

        if (type === 'truefalse') {
            correct = document.getElementById('correctAnswer').value;
        } else if (type === 'multichoice' || type === 'definition') {
            options = Array.from(document.querySelectorAll('#optionsList input[type="text"]'))
                .map(input => input.value);
            correct = document.querySelector('input[name="correct"]:checked').value;
        }

        const question = {
            type,
            text,
            correct,
            options
        };

        // Save question to localStorage
        const questions = JSON.parse(localStorage.getItem('questions')) || [];
        questions.push(question);
        localStorage.setItem('questions', JSON.stringify(questions));

        // Reset form and show success message
        e.target.reset();
        document.getElementById('optionsContainer').innerHTML = '';
        alert('Question added successfully!');
        
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
        localStorage.removeItem('currentAdmin');
        window.location.href = 'login.html';
    });
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    // Check if user is logged in on protected pages
    if (window.location.pathname.includes('dashboard.html')) {
        const currentAdmin = localStorage.getItem('currentAdmin');
        if (!currentAdmin) {
            window.location.href = 'login.html';
            return;
        }
    }

    // Display questions if on dashboard
    displayQuestions();
});
