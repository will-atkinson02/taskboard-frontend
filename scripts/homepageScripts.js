// Generate random username
function generateRandomUsername(characters) {
    let username = '';
    for (let i = 0; i < 8; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        username += characters[randomIndex];
    }
    return username;
}

// Generate random password
function generateRandomPassword(characters) {
    let password = '';
    const passwordCharacters = characters + '!@#$%^&*()_+';
    for (let i = 0; i < 12; i++) {
        const randomIndex = Math.floor(Math.random() * passwordCharacters.length);
        password += passwordCharacters[randomIndex];
    }
    return password;
}

// Generate random email
function generateRandomEmail(username) {
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com'];
    const randomDomain = domains[Math.floor(Math.random() * domains.length)];
    return `${username}@${randomDomain}`;
}

function generateRandomUserData() {
    const characters = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // Generate username, email, and password
    const username = generateRandomUsername(characters);
    const email = generateRandomEmail(username);
    const password = generateRandomPassword(characters);
    
    // Return them in an array
    return [username, email, password];
}

function createNewTaskboardRequest(token, userJson) {
    fetch("http://127.0.0.1:8000/api/taskboard", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(userJson)
    })
    .then(response => response.json())
    .then(data => {
            window.location.href = `http://127.0.0.1:5500/taskboard.html?id=${data.taskboard_id}`;
    })
    .catch(error => console.error("Error:", error))
}

const token = sessionStorage.getItem('auth_token')

if (!token) {
    document.querySelector('body').innerHTML += `
    <div class="login-form-container">
        <form class="login-form">
            <h2>Login</h2>
            <label for="login-username" >Username:</label>
            <input class="basic-input" id="login-username" type="text" name="username" />
            <label for="login-password" >Password:</label>
            <input class="basic-input" id="login-password" type="password" name="password" />
            <input class="basic-button" type="submit" value="Login" />
        </form>
        <form class="register-form">
            <h2>Register</h2>
            <label for="register-username" >Username:</label>
            <input class="basic-input" id="register-username" type="text" name="username" />
            <label for="register-email" >Email:</label>
            <input class="basic-input" id="register-email" type="Email" name="email" />
            <label for="register-password" >Password:</label>
            <input class="basic-input" id="register-password" type="password" name="password" />
            <div class="button-container">
                <input class="basic-button" type="submit" value="Register" />
                <div class="fake-details">Generate fake details</div>
            </div>
        </form>
    </div>`

    const loginForm = document.querySelector('.login-form')
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault()

        document.querySelectorAll('.basic-button').forEach(button => {
            button.style.background = '#A3A3F0'
            button.style.cursor = 'wait'
        })

        let form = event.target
        let formData = new FormData(form)
        let jsonData = Object.fromEntries(formData.entries())   

        fetch("http://127.0.0.1:8000/api/login", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success === true ) {
                sessionStorage.setItem('username', jsonData.username)
                sessionStorage.setItem('auth_token', data.token)
                document.querySelector('.login-form-container').remove()
                window.location.reload()
            } else {
                console.log('error!')

                document.querySelectorAll('.basic-button').forEach(button => {
                    button.removeAttribute('style')
                })
            }
        })
        .catch(error => console.error("Error:", error))
    })

    const registerForm = document.querySelector('.register-form')
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault()

        document.querySelectorAll('.basic-button').forEach(button => {
            button.style.backgroundColour = '#A3A3F0'
            button.style.cursor = 'wait'
        })

        let form = event.target
        let formData = new FormData(form)
        let jsonData = Object.fromEntries(formData.entries())  
        
        fetch("http://127.0.0.1:8000/api/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success === true ) {
                sessionStorage.setItem('username', jsonData.username)
                sessionStorage.setItem('auth_token', data.token)
                document.querySelector('.login-form-container').remove()
                window.location.reload()
            } else {
                console.log('error!')

                document.querySelectorAll('.basic-button').forEach(button => {
                    button.removeAttribute('style')
                })
            }
        })
        .catch(error => console.error("Error:", error))
    })

    document.querySelector('.fake-details').addEventListener('click', () => {
        const userData = generateRandomUserData()

        document.getElementById('register-username').value = userData[0]
        document.getElementById('register-email').value = userData[1]
        document.getElementById('register-password').value = userData[2]
    })
} else if (token) {
    document.querySelector('header').innerHTML += `
    <button class='header-link'>
        <div class='logout-text'>Logout</div>
        <i class='padding-lol fa-solid fa-right-from-bracket'></i>
    </button>
    <span></span>`

    
    const userJson = {username: sessionStorage.getItem('username')}

    window.addEventListener('click', (event) => {  
        // Logout button functionality
        if (event.target === document.querySelector('.header-link') ||
            event.target === document.querySelector('i') ||
            event.target === document.querySelector('.logout-text')) {
            
            fetch("http://127.0.0.1:8000/api/logout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(userJson)
            })
            .then(response => response.json())
            .then(data => {
                sessionStorage.clear()
                window.location.reload()
            })
            .catch(error => console.error("Error:", error))
        }

        // New Taskboard button functionality
        if (event.target === document.getElementById('new-taskboard')) {
            createNewTaskboardRequest(token, userJson)
        }
    })

    document.querySelector('body').innerHTML += `
    <div class="h1-container">
        <h1>Welcome ${sessionStorage.getItem('username')} to your home page!<h1>
    </div>
    <div class="spinner-container">
        <div class="spinner"></div>
        </div>
    <div class="taskboards-container"></div>`

    const getUserEndpoint = "http://127.0.0.1:8000/api/user/" + sessionStorage.getItem('username')
    fetch(getUserEndpoint, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        }
    })
    .then(response => response.json())
    .then(data => {
        document.querySelector('.spinner-container').remove()

        document.querySelector('.taskboards-container').innerHTML += `
            <div id="new-taskboard" class="taskboard-link" href="taskboard.html">
                <div class="taskboard-txt">New <br /> Taskboard</div>    
                <i class="big-plus fa-solid fa-plus"></i>
            </div>`

        data.data.taskboards.forEach(taskboard => {
            document.querySelector('.taskboards-container').innerHTML += `
            <div class="taskboard">
                <a class="taskboard-link" href="http://127.0.0.1:5500/taskboard.html?id=${taskboard.id}">
                    <div class="taskboard-txt-container">
                        <div class="taskboard-txt">${taskboard.name}</div>
                    </div>
                    <div class="taskboard-updated">
                        <div><i>Last updated:</i></div>
                        <div>${taskboard.updated_at.slice(0, 10)}</div>
                        <div>${taskboard.updated_at.slice(11, 19)}</div>
                    </div>
                </a>
            </div>`
        })

        // New Taskboard button functionality re-added
        document.getElementById('new-taskboard').addEventListener('click', () => {
            createNewTaskboardRequest(token, userJson)
        })  
    })
    .catch(error => console.error("Error:", error))
}