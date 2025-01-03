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

function createDropDownNodes() {
    const dropDownNodes = []

    // dropdown text
    const text = document.createElement('div')
    text.appendChild(document.createTextNode("Sort by: "))
    
    dropDownNodes.push(text)

    // dropdown element
    const dropDown = document.createElement('select')

    const alphabetical  = document.createElement('option')
    const reverseAlphabetical = document.createElement('option')
    const newest = document.createElement('option')
    const oldest = document.createElement('option')

    alphabetical.appendChild(document.createTextNode("A to Z"))
    reverseAlphabetical.appendChild(document.createTextNode("Z to A"))
    newest.appendChild(document.createTextNode("Most recent"))
    oldest.appendChild(document.createTextNode("Least recent"))

    dropDown.appendChild(newest)
    dropDown.appendChild(oldest)
    dropDown.appendChild(alphabetical)
    dropDown.appendChild(reverseAlphabetical)

    dropDownNodes.push(dropDown)

    return dropDownNodes
}
function sortTaskboards(parent, sortBy) {
    let taskboardElements = Array.from(parent.children)
    taskboardElements.shift()

    switch(sortBy) {
        case 'Most recent':
            taskboardElements.sort((a, b) => {
                const dateA = new Date(getDateValue(a))
                const dateB = new Date(getDateValue(b))
                return dateA - dateB
            })
            break
        case 'Least recent':
            taskboardElements.sort((a, b) => {
                const dateA = new Date(getDateValue(a))
                const dateB = new Date(getDateValue(b))
                return dateB - dateA
            });
            break
        case 'A to Z':
            taskboardElements.sort((a, b) => {
                return a.textContent.localeCompare(b.textContent);
            });
            break
        case 'Z to A':
            taskboardElements.sort((a, b) => {
                return b.textContent.localeCompare(a.textContent);
            });
    }
    return taskboardElements
}
function getDateValue(taskboardElement) {
    return taskboardElement.querySelector('.taskboard-updated')[1].textContent + ' ' + taskboardElement.querySelector('.taskboard-updated')[2].textContent
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
    const userJson = {username: sessionStorage.getItem('username')}
    let taskboardId = null

    document.querySelector('header').innerHTML += `
    <button class='header-link'>
        <div class='logout-text'>Logout</div>
        <i class='padding-lol fa-solid fa-right-from-bracket'></i>
    </button>
    <span></span>`
    

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
        if (event.target.closest('#new-taskboard')) {
            createNewTaskboardRequest(token, userJson)
        }

        if (event.target.closest('.delete-taskboard')) {
            event.preventDefault()
            
            taskboardId = event.target.closest('.taskboard').id
            const taskboardName = document.getElementById(taskboardId).querySelector('.taskboard-txt').textContent

            document.querySelector('body').innerHTML += `
                <div class='delete-taskboard-popup'>
                    <div class='delete-taskboard-modal'>
                        <div class='modal-text'>Delete Taskboard <br>${taskboardName}?</div>
                        <div class='modal-buttons'>
                            <div class='delete'>Delete</div>
                            <div class='back'>
                                <i class="fa-solid fa-xmark"></i>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>`
        }

        if (event.target.classList.contains('delete')) {
            const url = "http://127.0.0.1:8000/api/taskboard/" + taskboardId
            fetch(url, {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                }
            })
            .then(response => response.json())
            .then(data => {
                console.log(data)
            })
            .catch(error => console.error("Error:", error))

            document.querySelector('.delete-taskboard-popup').remove()
            document.getElementById(taskboardId).remove()
            taskboardId = null
        } else if (event.target.closest('.back') || event.target.classList.contains('delete-taskboard-popup')) {
            document.querySelector('.delete-taskboard-popup').remove()
            taskboardId = null
        }
    })

    document.querySelector('body').innerHTML += `
    <div class="h1-container">
        <h1>Welcome ${sessionStorage.getItem('username')} to your home page!<h1>
    </div>
    <div class="spinner-container">
        <div class="spinner"></div>
    </div>
    <div class="sort-container"></div>
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
        const taskboardsContainer = document.querySelector('.taskboards-container')

        createDropDownNodes().forEach(element => {
            document.querySelector('.sort-container').appendChild(element)
        })

        taskboardsContainer.innerHTML += `
            <div id="new-taskboard" class="taskboard-link" href="taskboard.html">
                <div class="taskboard-txt-container">
                    <div class="taskboard-txt">New Taskboard</div>    
                </div>    
                <i class="big-plus fa-solid fa-plus"></i>
            </div>`

        data.data.taskboards.forEach(taskboard => {
            document.querySelector('.taskboards-container').innerHTML += `
            <div class="taskboard" id="${taskboard.id}">
                <a class="taskboard-link" href="http://127.0.0.1:5500/taskboard.html?id=${taskboard.id}">
                    <div class="taskboard-txt-container">
                        <div class="taskboard-txt">${taskboard.name}</div>
                    </div>
                    <div class="taskboard-updated">
                        <div class='last-updated'><i>Last updated:</i></div>
                        <div>${taskboard.updated_at.slice(0, 10)}</div>
                        <div>${taskboard.updated_at.slice(11, 19)}</div>
                    </div>
                    <div class='delete-taskboard-container'>
                        <div class='delete-taskboard'>
                            <i class="trash-svg-2 fa-solid fa-trash"></i>
                        </div>
                    </div>
                </a>
            </div>`

            
        })

        document.querySelector('select').addEventListener('change', (event) => {
            const sortTaskboards = sortTaskboards(taskboardsContainer, event.target.value)
            console.log(sortTaskboards)
            taskboardsContainer.innerHTML = ''
            sortTaskboards.forEach(taskboard => taskboardsContainer.appendChild(taskboard))
        })

        // New Taskboard button functionality re-added
        document.getElementById('new-taskboard').addEventListener('click', () => {
            createNewTaskboardRequest(token, userJson)
        })
    })
    .catch(error => console.error("Error:", error))
}