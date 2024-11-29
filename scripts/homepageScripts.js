

// Login 
const loginForm = document.querySelector('.login-form')

loginForm.addEventListener('submit', (event) => {
    fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json)
    .then(data => {
        console.log("Response from server:", data)
    })
    .catch(error => console.error("Error:", error))
})