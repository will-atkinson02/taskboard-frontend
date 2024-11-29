

// Login 
const loginForm = document.querySelector('.login-form')

loginForm.addEventListener('submit', (event) => {
    event.preventDefault()

    let form = event.target
    let formData = new FormData(form)
    let jsonData = Object.fromEntries(formData.entries())

    console.log(jsonData)

    fetch("127.0.0.1:8000/api/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json)
    .then(data => {
        console.log("Response from server:", data)

        sessionStorage.setItem('auth_token', data.token)

        console.log(localStorage.getItem('auth_token'))
        
    })
    .catch(error => console.error("Error:", error))
})