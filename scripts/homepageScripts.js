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
            <input class="basic-button" type="submit" value="Register" />
        </form>
    </div>`

    const loginForm = document.querySelector('.login-form')
    loginForm.addEventListener('submit', (event) => {
        event.preventDefault()

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
            sessionStorage.setItem('username', jsonData.username)
            sessionStorage.setItem('auth_token', data.token)
            document.querySelector('.login-form-container').remove()
            window.location.reload()
        })
        .catch(error => console.error("Error:", error))
    })

    const registerForm = document.querySelector('.register-form')
    registerForm.addEventListener('submit', (event) => {
        event.preventDefault()

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
            sessionStorage.setItem('username', jsonData.username)
            sessionStorage.setItem('auth_token', data.token)
            document.querySelector('.login-form-container').remove()
            window.location.reload()
        })
        .catch(error => console.error("Error:", error))
    })
} else if (token) {
    document.querySelector('header').innerHTML += `
    <button class='header-link'>
        <div class='logout-text'>Logout</div>
        <i class='padding-lol fa-solid fa-right-from-bracket'></i>
    </button>
    <span></span>`

    
    let userJson = {username: sessionStorage.getItem('username')}

    const logoutElements = [document.querySelector('.header-link'), 
                            document.querySelector('i'),
                            document.querySelector('.logout-text')]

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
                <i class="big-plus fa-solid fa-plus"></i>
                <div class="taskboard-txt">New <br /> Taskboard</div>
            </div>`

        data.data.taskboards.forEach(taskboard => {
            document.querySelector('.taskboards-container').innerHTML += `
            <div class="taskboard">
                <a class="taskboard-link" href="http://127.0.0.1:5500/taskboard.html?id=${taskboard.id}">
                    <canvas class="taskboard-img"></canvas>
                    <div id="canvas" class="taskboard-txt-container">
                        <div class="taskboard-txt">${taskboard.name}</div>
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