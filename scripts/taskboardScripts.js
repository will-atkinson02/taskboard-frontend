function isBefore(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
}

function isAfter(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING;
}

function createDropPlaceholder() {
    const placeholder = document.createElement("div")
    placeholder.classList.add('drop-placeholder-task')
    return placeholder
}

function insertDropPlaceholder(target, position = 'before') {
    const placeholder = createDropPlaceholder()
    if (position === 'after') {
        target.insertAdjacentElement('beforebegin', placeholder)
    } else {
        target.insertAdjacentElement('afterend', placeholder)
    }
}

function removeTaskDropArea() {
    document.querySelector('.drop-placeholder-task').remove()
}

function allowDrop(event) {
    event.preventDefault()
}

function drag(event) {
    isDragging = true
    event.dataTransfer.setData("text", event.target.id)
}

function dropPutRequest(draggedTask, position) {
    let data = {
        "position": position,
        "stage_id": parseInt(draggedTask.closest('.stage').id.slice(6))
    }

    let url = "http://127.0.0.1:8000/api/task/" + draggedTask.id

    fetch(url, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Response from server:", data)
        })
        .catch(error => console.error("Error:", error))
}

function taskDraggingEventListener(task) {
    task.addEventListener('dragstart', (event) => {
        elementId = event.target.id
        draggedTask = document.getElementById(elementId)
        isDragging = true
        console.log('drag started')
    })

    task.addEventListener('drag', (event) => {
        if (draggedTask) {
            if (event.target.id === elementId) {
                insertDropPlaceholder(draggedTask)
                draggedTask.remove()
            }
        }
    })

    task.addEventListener('dragenter', (event) => {
        if (event.target.id !== elementId && event.target.closest('.task').id !== elementId) {
            let taskBelow = event.target
            let draggedTask = document.getElementById(elementId)

            if (event.target.classList.contains('task-text')) {
                taskBelow = event.target.closest('.task')
            }

            if (!document.querySelector('.drop-placeholder-task')) {
                if (!draggedTask.closest('.stage').contains(taskBelow)) {
                    insertDropPlaceholder(taskBelow)
                } else {
                    if (isBefore(draggedTask, taskBelow)) {
                        if (draggedTask.nextSibling === taskBelow) {
                            taskBelow.closest('.drop-target').insertBefore(taskBelow, draggedTask)
                            insertDropPlaceholder(draggedTask)
                            draggedTask.remove()
                        } else {
                            insertDropPlaceholder(taskBelow, 'after')
                            draggedTask.remove()
                        }
                    } else if (isAfter(draggedTask, taskBelow)) {
                        if (draggedTask.previousSibling === taskBelow) {
                            insertDropPlaceholder(taskBelow)
                            draggedTask.remove()
                        } else {
                            insertDropPlaceholder(taskBelow)
                            draggedTask.remove()
                        }
                    }
                }
            } else {
                let placeholderTask = document.querySelector('.drop-placeholder-task')
                if (isBefore(placeholderTask, taskBelow)) {
                    if (placeholderTask.nextSibling === taskBelow) {
                        taskBelow.closest('.drop-target').insertBefore(taskBelow, placeholderTask)
                    } else {
                        taskBelow.closest('.drop-target').insertBefore(taskBelow, placeholderTask)
                    }
                } else if (isAfter(placeholderTask, taskBelow)) {
                    if (placeholderTask.previousSibling === taskBelow) {
                        placeholderTask.insertAdjacentElement('afterend', taskBelow)
                    } else {
                        placeholderTask.insertAdjacentElement('afterend', taskBelow)
                    }
                }
            }
        }
    })
}

function onStageEnter(stage) {
    stage.addEventListener('dragenter', (event) => {
        if (!event.target.classList.contains('task')
            && !event.target.classList.contains('task-text')
            && !event.target.classList.contains('drop-placeholder-task')
            && !event.target.classList.contains('drop-target')) {
            if (!stage.querySelector('.drop-placeholder-task')) {
                if (document.querySelector('.drop-placeholder-task')) {
                    document.querySelector('.drop-placeholder-task').remove()
                }

                if (document.getElementById(elementId)) {
                    document.getElementById(elementId).remove()
                }

                const placeholder = createDropPlaceholder()
                const dropTarget = stage.querySelector('.drop-target')
                dropTarget.appendChild(placeholder)
            }
        }
    })
}

function sendTaskDataRequest(event, newTaskForm) {
    event.preventDefault()

    console.log('aa')

    let stage = newTaskForm.closest('.stage')
    let dropTarget = stage.querySelector('.drop-target')
    let numberOfTasks = dropTarget.childElementCount

    let form = document.querySelector('.add-task-expanded-container')
    let formData = new FormData(form)
    let jsonData = Object.fromEntries(formData.entries())
    jsonData.position = numberOfTasks
    jsonData.stage_id = parseInt(stage.id.slice(6))

    if (jsonData.name) {
        fetch("http://127.0.0.1:8000/api/task", {
            method: "POST",
            headers: HEADERS,
            body: JSON.stringify(jsonData)
        })
        .then(response => response.json())
        .then(data => {
            console.log("Response from server:", data)

            document.querySelectorAll('.task-text').forEach(taskText => {
                if (taskText.textContent === jsonData.name) {
                    taskText.closest('.stage').querySelector('.task-name-input').value = ''
                    taskText.closest('.task').setAttribute('id', data.taskId)
                    taskText.closest('.task').setAttribute('draggable', 'true')
                    document.querySelectorAll('.task').forEach(task => {
                        taskDraggingEventListener(task)
                    })
                }
            })
            
            document.querySelectorAll('.task-name-submit').forEach(taskSubmitButton => {
                taskSubmitButton.removeAttribute('task-added')
            })
            //displayNewTaskTemp()
        })
        .catch(error => console.error("Error:", error))
    }
}

function applySendTaskDataEV() {
    document.querySelectorAll('.task-name-submit').forEach(newTaskForm => {
        if (!newTaskForm.hasAttribute('listener-added')) {
            newTaskForm.addEventListener('click', (event) => sendTaskDataRequest(event, newTaskForm))
            newTaskForm.setAttribute('listener-added', 'true')
        } 
    })  
}

function deleteStage() {
    document.querySelectorAll('.deleteStage').forEach(stageDeleteForm => {
        stageDeleteForm.addEventListener('click', (event) => {
            event.preventDefault()
            const stage = stageDeleteForm.closest('.stage')

            const stageId = parseInt(stage.id.slice(6))

            stage.remove()

            const url = "http://127.0.0.1:8000/api/stage/" + stageId

            fetch(url, {
                method: "DELETE",
                headers: HEADERS
            })
                .then(response => response.json())
                .then(data => console.log("Response from server:", data))
                .catch(error => console.error("Error:", error))
        })
    })
}

function displayNewTaskTemp() {
    document.querySelectorAll('.task-name-submit').forEach(taskSubmitButton => {
        if (!taskSubmitButton.hasAttribute('temp-listener-added')) {
            taskSubmitButton.addEventListener('click', () => {
                const currentStage = taskSubmitButton.closest('.stage')
                const inputValue = currentStage.querySelector('.task-name-input').value
                const dropTarget = currentStage.querySelector('.drop-target')
                const numberOfTasks = dropTarget.childElementCount
                if (inputValue) {
                    currentStage.querySelector('.drop-target').innerHTML += `
                    <div class="task-container">
                        <div class='task' id='' position='${numberOfTasks + 1}' draggable='true' ondragstart='drag(event)'>
                            <div class='task-text'>${inputValue}</div>
                        </div>
                        <div class='hidden task-expanded-container'>
                            <div class='expanded-task-text'>
                                <div class='task-name'>${inputValue}</div>
                                <input class='hidden task-name-input' type='text' value=''>
                            </div>
                            
                            <div class='description-title'>Description:</div>
                            <div class='task-description' maxlength="255">Click here to add a description...</div>
                            <form class='hidden task-description-form'>
                                <textarea class='task-description-input' type='text'  placeholder='Add a description...'></textarea>
                                <button class='task-description-submit'>Add task</button>
                                <button class='close-description-input'><i class="fa-solid fa-xmark"></i></button>
                            </form> 
                            <div class='task-description-spacer'></div>
                            <div class='colour-container'>
                                <div class="colour-title">Colour: </div>
                                <div class='task-colour'></div>
                            </div>
                        </div>
                    </div>`

                    currentStage.querySelector('.add-task-container').classList.remove('hidden')
                    currentStage.querySelector('.add-task-expanded-container').classList.add('hidden')
                }
            })
            taskSubmitButton.setAttribute('temp-listener-added', 'true')
        }
        
    })
}

function changeTitleRequest(taskboardId, token, jsonData) {
    let url = "http://127.0.0.1:8000/api/taskboard/" + taskboardId

    fetch(url, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(jsonData)
    })
    .then(response => response.json())
    .then(data => {
        console.log("Response from server:", data)
    })
    .catch(error => console.error("Error:", error))
}

document.querySelector('body').innerHTML += `
    <div class="spinner-container">
        <div class="spinner"></div>
        </div>
    <div class="container-container"></div>`

const token = sessionStorage.getItem('auth_token')
const urlParams = new URLSearchParams(window.location.search)
const taskboardId = urlParams.get('id')
const taskboardUrl = 'http://127.0.0.1:8000/api/taskboard/' + taskboardId.toString()
const HEADERS = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
}

// initial states
let draggedTask = null
let isDragging = false

if (token) {
    fetch(taskboardUrl, {
        method: "GET",
        headers: HEADERS
        })
        .then(response => response.json())
        .then(data => {
            document.querySelector('.spinner-container').remove()

            const title = document.querySelector('.title')
            const titleBox = document.querySelector('.change-title')

            let titleContent = document.createTextNode(data.data.name)
            title.appendChild(titleContent)
            titleBox.value = data.data.name
            const initialTitleValue = title.textContent

            // Render all stages
            data.data.stages.forEach(stage => {
                document.querySelector('.container-container').innerHTML += `
                <div class='stage' id="Stage ${stage.id}" ondragover='allowDrop(event)'>
                    <form class='name-and-delete'>
                        <div class='stage-name'>${stage.name}</div>
                        <i class="more-options fa-solid fa-ellipsis-vertical">
                            <div class='deleteStage hidden' type='submit'>Delete stage <i class="fa-solid fa-trash"></i></div>
                        </i>
                    </form>
                    <div class='drop-target'></div>
                    <div class='add-task-container'><i class="fa-solid fa-plus"></i> Add task</div>
                    <form class='add-task-expanded-container hidden'>
                        <input class='task-name-input' type='text' name='name' placeholder='Enter task name...'>
                        <div class="submit-close-container">
                            <button class='task-name-submit'>Add task</button>
                            <button class='close-task-input'><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </form>
                </div>
                `
                
                // Render all tasks in order
                stage.tasks.sort((a, b) => a.position - b.position).forEach(task => {
                    let description = task.description
                    let textareaDescription = description
                    if (!description) {
                        description = 'Click here to add a description...'
                        textareaDescription = ''
                    }

                    document.getElementById("Stage " + stage.id).querySelector('.drop-target').innerHTML += `
                    <div class="task-container">
                        <div class='task' id=${task.id} position=${task.position} draggable='true' ondragstart='drag(event)'>
                            <div class='task-text'>${task.name}</div>
                        </div>
                        <div class='hidden task-expanded-container'>
                            <div class='expanded-task-text'>
                                <div class='task-name'>${task.name}</div>
                                <input class='hidden task-name-input' type='text' value=''>
                            </div>
                            
                            <div class='description-title'>Description:</div>
                            <div class='task-description' maxlength="255">${description}</div>
                            <form class='hidden task-description-form'>
                                <textarea class='task-description-input' type='text'  placeholder='Add a description...'>${textareaDescription}</textarea>
                                <button class='task-description-submit'>Add task</button>
                                <button class='close-description-input'><i class="fa-solid fa-xmark"></i></button>
                            </form> 
                            <div class='task-description-spacer'></div>
                            <div class='colour-container'>
                                <div class="colour-title">Colour: </div>
                                <div class='task-colour'></div>
                            </div>
                        </div>
                    </div>
                    `

                    // if task has description or colour
                    // add icon plus colour
                })
            })

            // Add remaining html
            document.querySelector('.container-container').innerHTML += `
            <div class="new-stage-container">
                <i class="fa-duotone fa-solid fa-plus"></i>
                <div class='new-stage-text'>New stage</div>
            </div>
            
            <form class="new-stage-expanded-container hidden">
                <input class="stage-name-input" type="text" name="name" placeholder="Enter stage name...">
                <div>
                    <input class="stage-name-submit" value="Add stage" type="submit">
                    <button class='close-stage-input'><i class="fa-solid fa-xmark"></i></button>
                </div>
            </form>
            `

            // Submit change title request
            document.querySelector('.title-form').addEventListener('submit', (event) => {
                title.classList.remove('hidden')
                titleBox.classList.add('hidden')

                event.preventDefault()
                if (initialTitleValue != titleBox.value) {
                    let form = event.target
                    let formData = new FormData(form)
                    let jsonData = Object.fromEntries(formData.entries())
                    changeTitleRequest(taskboardId, token, jsonData)
                }
            })

            

            // Tasks
            applySendTaskDataEV()

            // Display independent server-side task
            displayNewTaskTemp()

            // Add new stage
            document.querySelector('.new-stage-expanded-container').addEventListener('submit', (event) => {
                event.preventDefault()

                let form = event.target
                let formData = new FormData(form)
                let jsonData = Object.fromEntries(formData.entries())
                jsonData.taskboard_id = taskboardId

                if (jsonData.name) {
                    fetch("http://127.0.0.1:8000/api/stage", {
                        method: "POST",
                        headers: HEADERS,
                        body: JSON.stringify(jsonData)
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Response from server:", data)
        
                            document.querySelectorAll('.stage-name').forEach(stageName => {
                                if (stageName.textContent === jsonData.name) {
                                    stageName.closest('.stage').setAttribute('id', 'Stage ' + data.stageId)
                                    document.querySelector('.stage-name-input').value = ''
                                    document.querySelectorAll('.stage').forEach(stage => {
                                        onStageEnter(stage)
                                        deleteStage()
                                    })
                                }
                            })
                            applySendTaskDataEV()
                            displayNewTaskTemp()
                            
                        })
                        .catch(error => console.error("Error:", error))
                }

                const inputValue = document.querySelector('.stage-name-input').value

                if (inputValue) {
                    const newStage = document.querySelector('.new-stage-container')
                    const newStageHtml = `
                        <div class='stage' id="" ondragover='allowDrop(event)'>
                            <form class='name-and-delete'>
                                <div class='stage-name'>${inputValue}</div>
                                <i class="more-options fa-solid fa-ellipsis-vertical">
                                    <div class='deleteStage hidden' type='submit'>Delete stage</div>
                                </i>
                            </form>
                            <div class='drop-target'></div>
                            <div class='add-task-container'><i class="fa-duotone fa-solid fa-plus"></i> Add task</div>
                            <form class='add-task-expanded-container hidden'>
                                <input class='task-name-input' type='text' name='name' placeholder='Enter task name...'>
                                <div>
                                    <button class='task-name-submit'>Add task</button>
                                    <button class='close-task-input'><i class="fa-solid fa-xmark"></i></button>
                                </div>
                            </form>
                        </div>
                        `

                    newStage.insertAdjacentHTML('beforebegin', newStageHtml)

                    document.querySelector('.new-stage-container').classList.remove('hidden')
                    document.querySelector('.new-stage-expanded-container').classList.add('hidden')
                }
            })

            // Handle delete stage request
            deleteStage()

            let isDragging = false

            // Add task dragging event listener to all tasks
            document.querySelectorAll('.task').forEach(task => {
                taskDraggingEventListener(task)
            })

            // Handle task placeholder transfer between stage
            document.querySelectorAll('.stage').forEach(stage => {
                onStageEnter(stage)
            })

            const newStage = document.querySelector('.new-stage-container')
            const newStageExpanded = document.querySelector('.new-stage-expanded-container')

            document.addEventListener("dragover", (event) => {
                event.preventDefault()
            })

            // Handle task drop and position in database
            document.addEventListener("drop", (event) => {
                event.preventDefault()

                const placeholder = document.querySelector('.drop-placeholder-task')
                const stage = placeholder.closest('.stage')

                placeholder.insertAdjacentElement('afterend', draggedTask)
                placeholder.remove()

                isDragging = false

                if (event.target.closest('.stage') || placeholder) {
                    const dropTarget = stage.querySelector('.drop-target')
                    const dropTargetArray = Array.from(dropTarget.children)
                    
                    for (let i = 0; i < dropTargetArray.length; i++) {
                        if (dropTargetArray[i].getAttribute('position') != i) {
                            dropPutRequest(dropTargetArray[i], i)
                        }
                    }
                }
            })

            // Dynamic title input code
            let titleWidth = title.getBoundingClientRect().width
            titleBox.style.width = `${titleWidth}px`
            
            titleBox.addEventListener('input', (event) => {
                if (titleBox.value.length > 20) {
                    titleBox.value = titleBox.value.slice(0, 20)
                    title.textContent = titleBox.value
                } else {
                    title.textContent = titleBox.value
                    if (event.data === null) {
                        let charLength = (titleBox.getBoundingClientRect().width - 40)/titleBox.value.length
                        title.style.width = `${titleWidth - charLength}px`
                        title.classList.remove('hidden')
                        titleWidth = title.getBoundingClientRect().width
                        title.classList.add('hidden')
                        titleBox.style.width = `${titleWidth}px`
                    } else {
                        title.style.width = null
                        title.classList.remove('hidden')
                        titleWidth = title.getBoundingClientRect().width
                        title.classList.add('hidden')
                        titleBox.style.width = `${titleWidth}px`
                    }
                }
            })

            document.querySelectorAll('.task-description-form').forEach(form => {
                form.addEventListener('submit', (event) => {
                    event.preventDefault()
                    const description = form.closest('.task-expanded-container').querySelector('.task-description')
                    description.textContent = form.querySelector('.task-description-input').value

                    if (form.querySelector('.task-description-input').value === '') {
                        description.textContent = 'Click here to add a description...'
                    }
                })
            })


            // Handle all clicks
            let task = null
            let taskExpanded = null
            let taskDesc = null
            let taskDescForm = null
            window.addEventListener("click", (event) => {
                // task expand
                if (event.target.classList.contains('task') || event.target.classList.contains('task-text')) {
                    if (task) {
                        task.classList.remove('hidden')
                        taskExpanded.classList.add('hidden')
                    }
                    task = event.target.closest('.task')
                    taskExpanded = task.nextElementSibling
                    taskExpanded.classList.remove('hidden')
                } else if (taskExpanded && !taskDesc) {
                    if (!event.target.closest('.task-expanded-container')) {
                        taskExpanded.classList.add('hidden')
                    }
                } 

                // task description
                if (event.target.classList.contains('task-description')) {
                    taskDesc = event.target
                    taskDescForm = event.target.closest('.task-expanded-container').querySelector('.task-description-form')
                    if (taskDesc.textContent != 'Click here to add a description...') {
                        taskDescForm.querySelector('.task-description-input').textContent = taskDesc.textContent
                    }
                    taskDesc.classList.add('hidden')
                    taskDescForm.classList.remove('hidden')
                } else if (taskDesc) {
                    if (!event.target.classList.contains('task-description-input')) {
                        taskDesc.classList.remove('hidden')
                        taskDescForm.classList.add('hidden')
                        taskDesc = null
                    }
                }

                if (event.target.classList.contains('task-description-submit')) {
                    const data = {
                        "description": event.target.previousSibling.previousSibling.value,
                    }
                    
                    const taskId = event.target.closest('.task-container').querySelector('.task').id
                    const url = "http://127.0.0.1:8000/api/task/" + taskId
                
                    fetch(url, {
                        method: "PUT",
                        headers: HEADERS,
                        body: JSON.stringify(data)
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Response from server:", data)
                        })
                        .catch(error => console.error("Error:", error))
                    
                }

                // more options
                if (event.target.classList.contains('more-options')) {
                    event.target.closest('.stage').querySelector('.deleteStage').classList.remove('hidden')
                } else if (!event.target.classList.contains('deleteStage') && document.querySelectorAll('.deleteStage:not(.hidden)')[0]) {
                    document.querySelectorAll('.deleteStage:not(.hidden)')[0].classList.add('hidden')
                }
                
                // title functionality
                if (event.target.classList.contains('title')) {
                    title.classList.add('hidden')
                    titleBox.classList.remove('hidden')
                    titleBox.focus()
                    
                } else if (event.target != title && event.target != titleBox) {
                    if (initialTitleValue != titleBox.value) {
                        let newTitle = titleBox.value
                        title.textContent = newTitle
                        let jsonData = {"name": newTitle}
                        changeTitleRequest(taskboardId, token, jsonData)
                    }

                    title.classList.remove('hidden')
                    titleBox.classList.add('hidden')
                }

                // new stage
                const newStageClicked = event.target.closest('.new-stage-container')
                const newStageExpandedClicked = event.target.closest('.new-stage-expanded-container')
                if (newStageClicked) {
                    newStage.classList.add('hidden')
                    newStageExpanded.classList.remove('hidden')
                } else if (!newStageExpandedClicked || event.target === document.querySelector('.close-stage-input')) {
                    newStage.classList.remove('hidden')
                    newStageExpanded.classList.add('hidden')
                }

                // add tasks
                const inAddTaskExpanded = event.target.closest('.add-task-expanded-container')
                if (event.target.classList.contains('add-task-container')) {
                    const stageClosest = event.target.closest('.stage')

                    const newTask = stageClosest.querySelector('.add-task-container')
                    const newTaskExpanded = stageClosest.querySelector('.add-task-expanded-container')

                    document.querySelectorAll('.stage').forEach(stage => {
                        if (stage.querySelector('.add-task-container') != newTask) {
                            stage.querySelector('.add-task-container').classList.remove('hidden')
                            stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                        } else {
                            newTask.classList.add('hidden')
                            newTaskExpanded.classList.remove('hidden')
                        }
                    })

                } else if (!inAddTaskExpanded || event.target === document.querySelector('.close-task-input')) {
                    document.querySelectorAll('.stage').forEach(stage => {
                        stage.querySelector('.add-task-container').classList.remove('hidden')
                        stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                    })
                }
            })
        }).catch(error => console.error('Error:', error))
}