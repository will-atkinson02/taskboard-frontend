const apiURL = "http://127.0.0.1:8000/api/"
const taskboardPageURL = "http://127.0.0.1:5500/taskboard.html"

const token = sessionStorage.getItem('auth_token')

let HEADERS = {"Content-Type": "application/json"}
if (token) {
    HEADERS["Authorization"] = `Bearer ${token}`
    const userJson = { username: sessionStorage.getItem('username') }
}
console.log(HEADERS)

function apiRequest(url, METHOD, HEADERS, handleResponse, BODY = null) {
    let options = {
        method: METHOD,
        headers: HEADERS,
    }

    if (BODY) {
        options.body = JSON.stringify(BODY)
    }

    console.log(options)

    fetch(url, options)
        .then(response => response.json())
        .then(data => {
            if (BODY) {
                handleResponse(BODY, data)
            } else {
                handleResponse(data)
            }
        }) 
        .then(error => (error) ? console.error("Error:", error) : null)
}

// taskboards
function createNewTaskboardRequest(HEADERS, taskboardPageURL, userJson) {
    apiRequest("http://127.0.0.1:8000/api/taskboard", "POST", HEADERS, (data) => {
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