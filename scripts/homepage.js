// TODO: create a file for shared functions
// -> global variables file?
// -> work through taskboardScripts


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

function createDropDownNodes() {
    const dropDownNodes = []

    // dropdown text
    const text = document.createElement('div')
    text.appendChild(document.createTextNode("Sort by: "))

    dropDownNodes.push(text)

    // dropdown element
    const dropDown = document.createElement('select')

    const alphabetical = document.createElement('option')
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

    switch (sortBy) {
        case 'Most recent':
            taskboardElements.sort((a, b) => {
                const dateA = new Date(getDateValue(a))
                const dateB = new Date(getDateValue(b))
                return dateB - dateA
            })
            break
        case 'Least recent':
            taskboardElements.sort((a, b) => {
                const dateA = new Date(getDateValue(a))
                const dateB = new Date(getDateValue(b))
                return dateA - dateB
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
    return taskboardElement.querySelector('.taskboard-updated').children[1].textContent + ' ' + taskboardElement.querySelector('.taskboard-updated').children[2].textContent
}

function addNewTaskboardHTML(taskboardsContainer) {
    taskboardsContainer.innerHTML += `
    <div id="new-taskboard" class="taskboard-link" href="taskboard.html">
        <div class="taskboard-txt-container">
            <div class="taskboard-txt">New Taskboard</div>    
        </div>    
        <i class="big-plus fa-solid fa-plus"></i>
    </div>`
}

function addSelectionEL(taskboardsContainer) {
    document.querySelector('select').addEventListener('change', (event) => {
        const sortTaskboardsArray = sortTaskboards(taskboardsContainer, event.target.value)
        taskboardsContainer.innerHTML = ''
        addNewTaskboardHTML(taskboardsContainer)
        sortTaskboardsArray.forEach(taskboard => taskboardsContainer.appendChild(taskboard))
    })
}

function disableButtons() {
    document.querySelectorAll('.basic-button').forEach(button => {
        button.style.backgroundColour = '#A3A3F0'
        button.style.cursor = 'wait'
    })
}

function enableButtons() {
    document.querySelectorAll('.basic-button').forEach(button => {
        button.removeAttribute('style')
    })
}

function handleFormResponse(jsonData, data) {
    if (data.success === true) {
        sessionStorage.setItem('username', jsonData.username)
        sessionStorage.setItem('auth_token', data.token)
        document.querySelector('.login-form-container').remove()
        window.location.reload()
    } else {
        console.log('error!')
        enableButtons()
    }
}   

function handleFormSubmit(formType) {
    const form = document.querySelector('.' + formType + '-form')
    form.addEventListener('submit', (event) => {
        event.preventDefault()
        disableButtons()
        const url = apiURL + formType
        apiRequest(url, "POST", HEADERS, handleFormResponse, getFormData(event)) 
    })
}


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

    //handle login and register forms
    handleFormSubmit("login")
    handleFormSubmit("register")

    //generate fake details
    document.querySelector('.fake-details').addEventListener('click', () => {
        const userData = generateRandomUserData()

        document.getElementById('register-username').value = userData[0]
        document.getElementById('register-email').value = userData[1]
        document.getElementById('register-password').value = userData[2]
    })
} else if (token) {
    const userName = sessionStorage.getItem('username')
    let taskboardId = null
    let newTaskboardClicked = false

    document.querySelector('header').innerHTML += `
    <button class='header-link'>
        <div class='logout-text'>Logout</div>
        <i class='padding-lol fa-solid fa-right-from-bracket'></i>
    </button>
    <span></span>`

    document.querySelector('body').innerHTML += `
    <div class="h1-container">
        <h1>Welcome ${userName} to your home page!<h1>
    </div>
    <div class="spinner-container">
        <div class="spinner"></div>
    </div>
    <div class="sort-container"></div>
    <div class="taskboards-container"></div>`

    const url = apiURL + "user/" + userName
    apiRequest(url, "GET", HEADERS, (data) => {
        document.querySelector('.spinner-container').remove()
            const taskboardsContainer = document.querySelector('.taskboards-container')

            addNewTaskboardHTML(taskboardsContainer)

            data.data.taskboards.forEach(taskboard => {
                taskboardsContainer.innerHTML += `
                    <div class="taskboard" id="${taskboard.id}">
                        <a class="taskboard-link" href="${taskboardPageURL}?id=${taskboard.id}">
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

            createDropDownNodes().forEach(element => {
                document.querySelector('.sort-container').appendChild(element)
            })

            addSelectionEL(taskboardsContainer)
    })

    window.addEventListener('click', (event) => {
        // Logout button functionality
        if (event.target === document.querySelector('.header-link') ||
            event.target === document.querySelector('i') ||
            event.target === document.querySelector('.logout-text')) {
            
            const url = apiURL + "logout"
            apiRequest(url, "POST", HEADERS, () => {
                sessionStorage.clear()
                window.location.reload()
            }, userJson)
            
        }

        // New Taskboard button functionality
        if (event.target.closest('#new-taskboard') && newTaskboardClicked === false) {
            newTaskboardClicked = true
            const elements = document.querySelectorAll('*')
            elements.forEach(element => {
                element.style.cursor = 'wait'
            })
            createNewTaskboardRequest(token, userJson)
        }

        // delete taskboard first button
        if (event.target.closest('.delete-taskboard')) {
            event.preventDefault()

            taskboardId = event.target.closest('.taskboard').id
            const taskboardName = document.getElementById(taskboardId).querySelector('.taskboard-txt').textContent
            const body = document.querySelector('body')
            const popupHeight = body.clientHeight
            body.innerHTML += `
                <div class='delete-taskboard-popup' style="height:${popupHeight}px">
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

        // delete taskboard second button
        const taskboardsContainer = document.querySelector('.taskboards-container')
        if (event.target.classList.contains('delete')) {
            const url = apiURL + "taskboard/" + taskboardId
            apiRequest(url, "DELETE", HEADERS, (data) => console.log(data))

            document.querySelector('.delete-taskboard-popup').remove()
            document.getElementById(taskboardId).remove()
            taskboardId = null
            addSelectionEL(taskboardsContainer)
        } else if (event.target.closest('.back') || event.target.classList.contains('delete-taskboard-popup')) {
            document.querySelector('.delete-taskboard-popup').remove()
            taskboardId = null
            addSelectionEL(taskboardsContainer)
        }
    })
}