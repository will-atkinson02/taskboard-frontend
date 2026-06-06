const apiURL = "https://taskboardsapi.onrender.com/api/"
const taskboardPageURL = "https://will-atkinson02.github.io/taskboard-frontend/taskboard.html"

const token = sessionStorage.getItem('auth_token')
let userJson = null

let HEADERS = {"Content-Type": "application/json"}
if (token) {
    HEADERS["Authorization"] = `Bearer ${token}`
    userJson = { username: sessionStorage.getItem('username') }
}

function apiRequest(url, METHOD, HEADERS, handleResponse, BODY = null, handleError = null) {
    let options = {
        method: METHOD,
        headers: HEADERS,
    }

    if (BODY) {
        options.body = JSON.stringify(BODY)
    }

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if (!BODY) {
                handleResponse(data)
            } else {
                if (BODY.username) {
                    handleResponse(BODY, data)
                }
                handleResponse(data)
            }
        }) 
        .catch(error => {
            console.error("Error:", error)
            if (handleError) {
                handleError()
            }
        })
}

// taskboards
function createNewTaskboardRequest(HEADERS, taskboardPageURL, userJson) {
    apiRequest(apiURL + "taskboard", "POST", HEADERS, (data) => {
        window.location.href = taskboardPageURL + `?id=${data.taskboard_id}`
    }, userJson)
}

//spinner 
function spinner() {
    return `<div class="spinner-container">
                <div class="spinner"></div>
                </div>
            <div class="container-container"></div>`
}

function getFormData(event) {
    const form = event.target
    const formData = new FormData(form)
    const jsonData = Object.fromEntries(formData.entries())
    return jsonData
}