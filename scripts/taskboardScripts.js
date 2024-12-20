//check element positions
function isBefore(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
}

function isAfter(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING;
}

//handle placeholder
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

//dragging events
function allowDrop(event) {
    event.preventDefault()
}
function drag(event) {
    isDragging = true
    event.dataTransfer.setData("text", event.target.id)
}
function taskDraggingEventListener(task) {
    task.addEventListener('dragstart', (event) => {
        originalStageId = event.target.closest('.stage').id
        elementId = event.target.id
        draggedTask = document.getElementById(elementId)
        isDragging = true
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
function onEnterStage(stage) {
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

//adding and changing tasks
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
function sendTaskDataRequest(event, stage, taskNameInput, numberOfTasks) {
    const jsonData = {
        "name": taskNameInput.value,
        "position": numberOfTasks,
        "stage_id": parseInt(stage.id.slice(6))
    }

    if (jsonData.name != '') {
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
            // document.querySelectorAll('.task-name-submit').forEach(taskSubmitButton => {
            //     taskSubmitButton.removeAttribute('temp-listener-added')
            // })
        })
        .catch(error => console.error("Error:", error))
    }
}
function displayNewTaskTemp(event, stage, taskNameInput, numberOfTasks) {
    stage.querySelector('.drop-target').innerHTML += `
        <div class='task task-hover' id='' position='${numberOfTasks}' draggable='true' ondragstart='drag(event)'>
            <div class='task-text'>${taskNameInput.value}</div>

            <div class='hidden task-expanded-container'>
            <div class='expanded-task-text'>
                <div class='task-name'>${taskNameInput.value}</div>
                <input class='hidden task-name-reinput' type='text'>
            </div>
            <div class='description-title'>Description:</div>
            <div class='task-description' maxlength="255">Click here to add a description...</div>
            <form class='hidden task-description-form'>
                <textarea class='task-description-input' type='text'  placeholder='Add a description...'></textarea>
                <button class='task-description-submit'>Submit</button>
                <button class='close-description-input'><i class="fa-solid fa-xmark"></i></button>
            </form> 
            <div class='task-description-spacer'></div>
            <div class='colour-container'>
                <div class="colour-title">Colour: </div>
                <div class='task-colour'></div>
            </div>
        </div>`
    stage.querySelector('.add-task-container').classList.remove('hidden')
    stage.querySelector('.add-task-expanded-container').classList.add('hidden')
    // taskNameInput.value = ''
    // taskSubmitButton.setAttribute('temp-listener-added', 'true')
}
// function changeInputValue(value):
//     inputElement.value = 

//delete stage
function deleteStage(stage) {
    const stageId = parseInt(stage.id.slice(6))
    const url = "http://127.0.0.1:8000/api/stage/" + stageId
    stage.remove()
    fetch(url, {
        method: "DELETE",
        headers: HEADERS
    })
    .then(response => response.json())
    .then(data => console.log("Response from server:", data))
    .catch(error => console.error("Error:", error))
}

//edit title
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

//loading spinner
document.querySelector('body').innerHTML += `
    <div class="spinner-container">
        <div class="spinner"></div>
        </div>
    <div class="container-container"></div>`

//token
const token = sessionStorage.getItem('auth_token')
//get url for uri
const urlParams = new URLSearchParams(window.location.search)
const taskboardId = urlParams.get('id')
const taskboardUrl = 'http://127.0.0.1:8000/api/taskboard/' + taskboardId.toString()
const HEADERS = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`
}
// initial states
let draggedTask = null
let originalStageId = null
let isDragging = false

if (token) {
    //fetch saved taskboard
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
                    <div class='add-task-container'><i class="plus-task fa-solid fa-plus"></i> Add task</div>
                    <div class='add-task-expanded-container hidden'>
                        <input class='task-name-input' type='text' placeholder='Enter task name...'>
                        <div class="submit-close-container">
                            <button class='task-name-submit'>Add task</button>
                            <button class='close-task-input'><i class="fa-solid fa-xmark"></i></button>
                        </div>
                    </div>
                </div>`
                const stageElement = document.getElementById("Stage " + stage.id)
                onEnterStage(document.getElementById("Stage " + stage.id))
                
                // Render all tasks in order
                stage.tasks.sort((a, b) => a.position - b.position).forEach(task => {
                    let description = task.description
                    let textareaDescription = description
                    let descriptionIndicator = "<i class='description-indicator fa-solid fa-bars'></i>"
                    if (!description) {
                        description = 'Click here to add a description...'
                        textareaDescription = ''
                        descriptionIndicator = ''
                    }

                    stageElement.querySelector('.drop-target').innerHTML += `
                        <div class='task task-hover' id=${task.id} position=${task.position} draggable='true' ondragstart='drag(event)'>
                            <div class='task-text'>${task.name}</div>
                            ${descriptionIndicator}
                            <div class='hidden task-expanded-container'>
                                <div class='expanded-task-text'>
                                    <div class='task-name'>${task.name}</div>
                                    <input class='hidden task-name-reinput' type='text'>
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
                        </div>`

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
                        const stageContainer = document.querySelector('.container-container')
                        const allStages = stageContainer.children
                        const newStage = allStages[allStages.length - 3]
                        newStage.setAttribute('id', 'Stage ' + data.stageId)
                        document.querySelector('.stage-name-input').value = ''
                        onEnterStage(newStage)
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
                            <div class='add-task-container'><i class="plus-task fa-duotone fa-solid fa-plus"></i> Add task</div>
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

            // Add task dragging event listener to all tasks
            document.querySelectorAll('.task').forEach(task => {
                taskDraggingEventListener(task)
            })

            // Handle task placeholder transfer between stage
            document.querySelectorAll('.stage').forEach(stage => {
                onEnterStage(stage)
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
                        if (dropTargetArray[i].getAttribute('position') != i || stage.id != originalStageId) {
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

            // stage consts
            const newStage = document.querySelector('.new-stage-container')
            const newStageExpanded = document.querySelector('.new-stage-expanded-container')
            // Handle all clicks
            let task = null
            let taskText = null
            let taskExpanded = null
            let taskDesc = null
            let taskDescForm = null
            window.addEventListener("click", (event) => {
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

                // add task 
                if (event.target.classList.contains('task-name-submit')) {
                    event.preventDefault()
                    const stage = event.target.closest('.stage')
                    const taskNameInput = stage.querySelector('.task-name-input')
                    const dropTarget = stage.querySelector('.drop-target')
                    const numberOfTasks = dropTarget.childElementCount
                    displayNewTaskTemp(event, stage, taskNameInput, numberOfTasks)
                    sendTaskDataRequest(event, stage, taskNameInput, numberOfTasks)
                }

                // task expand
                if (event.target.classList.contains('task') || event.target.classList.contains('task-text')) {
                    if (task) {
                        taskText.classList.remove('hidden')
                        taskExpanded.classList.add('hidden')
                        task.classList.add('task-hover')
                    }
                    task = event.target.closest('.task')
                    task.setAttribute('draggable', false)
                    task.classList.remove('task-hover')
                    //child nodes
                    taskText = task.querySelector('.task-text')
                    taskExpanded = task.querySelector('.task-expanded-container')
                    taskText.classList.add('hidden')
                    taskExpanded.classList.remove('hidden')
                } else if (!event.target.closest('.task-expanded-container')) {
                    if (task) {
                        task.querySelector('.task-expanded-container').classList.add('hidden')
                        task.querySelector('.task-text').classList.remove('hidden')
                        task.setAttribute('draggable', true)
                        task.classList.add('task-hover')
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
                } else if (!event.target.classList.contains('task-description-input')) {
                    if (taskDesc) {
                        taskDesc.classList.remove('hidden')
                        taskDescForm.classList.add('hidden')
                        taskDesc = null
                        taskDescForm = null
                    }
                }

                //submit description and update task ui
                if (event.target.classList.contains('task-description-submit')) {
                    event.preventDefault()

                    const descriptionInput = event.target.previousSibling.previousSibling.value.trim()
                    const descriptionElement = task.querySelector('.task-description')
                    const descriptionIndicator = task.querySelector('.description-indicator')
                    const data = {
                        "description": descriptionInput
                    }

                    if (descriptionInput != '') {
                        descriptionElement.textContent = descriptionInput
                        if (!descriptionIndicator) {
                            task.innerHTML += `<i class="description-indicator fa-solid fa-bars"></i>`
                        }
                    } else {
                        descriptionElement.textContent = 'Click here to add a description...'
                        if (descriptionIndicator) {
                            task.querySelector('.description-indicator').remove() 
                        }
                    }

                    const url = "http://127.0.0.1:8000/api/task/" + task.id
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

                // expand/contract add tasks
                const inAddTaskExpanded = event.target.closest('.add-task-expanded-container')
                if (event.target.classList.contains('add-task-container') || event.target.classList.contains('plus-task')) {
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

                // more options on stage
                if (event.target.classList.contains('more-options')) {
                    event.target.closest('.stage').querySelector('.deleteStage').classList.remove('hidden')
                } else if (!event.target.classList.contains('deleteStage') && document.querySelectorAll('.deleteStage:not(.hidden)')[0]) {
                    document.querySelectorAll('.deleteStage:not(.hidden)')[0].classList.add('hidden')
                }

                // delete stage
                if (event.target.classList.contains('deleteStage') || event.target.classList.contains('fa-trash')) {
                    deleteStage(event.target.closest('.stage'))
                }

                // expand/contract new stage
                if (event.target === newStage || newStage.contains(event.target)) {
                    newStage.classList.add('hidden')
                    newStageExpanded.classList.remove('hidden')
                } else if (!event.target.classList.contains('stage-name-input') && (event.target != newStageExpanded || event.target === document.querySelector('.close-stage-input'))) {
                    newStage.classList.remove('hidden')
                    newStageExpanded.classList.add('hidden')
                }

                if (event.target.classList.contains('.close-stage-input')) {
                    console.log('a')
                }
            })
        }).catch(error => console.error('Error:', error))
}