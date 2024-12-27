//check element positions
function isBefore(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
}
function isAfter(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING;
}

//handle placeholder
function createDropPlaceholder(draggedTaskHeight) {
    const placeholder = document.createElement("div")
    placeholder.classList.add('drop-placeholder-task')
    placeholder.style.height = `${draggedTaskHeight}px`
    return placeholder
}
function insertDropPlaceholder(target, draggedTaskHeight, position = 'before') {
    const placeholder = createDropPlaceholder(draggedTaskHeight)
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
function addtaskDraggingEL(task) {
    task.addEventListener('dragstart', (event) => {
        originalStageId = event.target.closest('.stage').id
        elementId = event.target.id
        draggedTask = event.target
        draggedTaskHeight = draggedTask.clientHeight
        isDragging = true
    })

    task.addEventListener('drag', (event) => {
        if (draggedTask) {
            if (event.target.id === elementId) {
                insertDropPlaceholder(draggedTask, draggedTaskHeight)
                draggedTask.remove()
            }
        }
    })

    task.addEventListener('dragenter', (event) => {
        if (event.target.id !== elementId && event.target.closest('.task').id !== elementId) {
            taskBelow = event.target.closest('.task')
        }
    })

    task.addEventListener('dragover', (event) => {
        if (taskBelow) {
            const taskDimensions = task.getBoundingClientRect()
            const placeholderTask = document.querySelector('.drop-placeholder-task')
            const heightDifference = taskBelow.clientHeight - draggedTaskHeight - 5
            if (draggedTaskHeight < taskBelow.clientHeight) {
                if (isBefore(placeholderTask, taskBelow)) {
                    if (event.clientY > taskDimensions.top + heightDifference && event.clientY < taskDimensions.bottom) {
                        taskBelow.closest('.drop-target').insertBefore(taskBelow, placeholderTask)
                    }
                } else if (isAfter(placeholderTask, taskBelow)) {
                    if (event.clientY < taskDimensions.bottom - heightDifference && event.clientY > taskDimensions.top) {
                        placeholderTask.insertAdjacentElement('afterend', taskBelow)
                    }
                }
            } else {
                if (isBefore(placeholderTask, taskBelow)) {
                    taskBelow.closest('.drop-target').insertBefore(taskBelow, placeholderTask)
                } else if (isAfter(placeholderTask, taskBelow)) {
                    placeholderTask.insertAdjacentElement('afterend', taskBelow)
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
                const placeholder = createDropPlaceholder(draggedTaskHeight)
                const dropTarget = stage.querySelector('.drop-target')
                dropTarget.appendChild(placeholder)
            }
        }
    })
}

//adding and changing tasks
function updateTask(task, data) {
    let url = "http://127.0.0.1:8000/api/task/" + task.id
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
function sendTaskDataRequest(stage, taskNameInput, numberOfTasks) {
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
                        addtaskDraggingEL(task)
                    })
                }
            })
        })
        .catch(error => console.error("Error:", error))
    }
}
function displayNewTaskTemp(stage, taskNameInput, numberOfTasks) {
    stage.querySelector('.drop-target').innerHTML += `
        <div class='task task-hover' id='' position='${numberOfTasks}' draggable='true' ondragstart='drag(event)'>
            <div class='task-text'>${taskNameInput.value}</div>
            <div class='hidden task-expanded-container'>
            <div class='expanded-task-text'>
                <div class='task-name'>${taskNameInput.value}</div>
                <textarea class='hidden rename-task'></textarea>
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
}

// updating stages
function updateStage(stage, updatedName) {
    const stageId = parseInt(stage.id.slice(6))
    const data = {
        "name": updatedName
    }
    const url = "http://127.0.0.1:8000/api/stage/" + stageId
    fetch(url, {
        method: "PUT",
        headers: HEADERS,
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => console.log("Response from server:", data))
    .catch(error => console.error("Error:", error))
}
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
function addUpdateStageNameEL(stage) {
    stage.addEventListener('submit', (event) => {
        event.preventDefault()
        const renameStage = stage.querySelector('.rename-stage')
        const stageTitle = renameStage.previousElementSibling
        updateStage(stage, renameStage.value)
        renameStage.classList.add('hidden')
        stageTitle.classList.remove('hidden')
        stageTitle.textContent = renameStage.value
    })
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
let draggedTaskHeight = null
let draggedTaskDimensions = null
let taskBelow = null
let originalStageId = null
let isDragging = false
let allowA = false
let allowB = false


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
                <div class='stage' id="Stage ${stage.id}">
                    <form class='name-and-delete'>
                        <div class='stage-name'>${stage.name}</div>
                        <input class='hidden rename-stage' type='text' value='${stage.name}'>
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
                            <div class='indicators'>
                                ${descriptionIndicator}
                            </div>
                            <div class='hidden task-expanded-container'>
                                <div class='expanded-task-text'>
                                    <div class='task-name'>${task.name}</div>
                                    <textarea class='hidden rename-task'></textarea>
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
                                    <div class='task-colour-container'>
                                        <div class='task-colour'></div>
                                        <div class='hidden task-colour-list'>
                                            <div class='task-colour-select red'></div>
                                            <div class='task-colour-select orange'></div>
                                            <div class='task-colour-select yellow'></div>
                                            <div class='task-colour-select green'></div>
                                            <div class='task-colour-select blue'></div>
                                            <div class='task-colour-select purple'></div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>`

                    const taskSelector = document.getElementById(task.id)
                    if (task.colour) {
                        taskSelector.querySelector('.' + task.colour).innerHTML += `<i class="check fa-solid fa-check"></i>`
                        taskSelector.querySelector('.' + task.colour).classList.add('darken')
                        taskSelector.querySelector('.task-colour').classList.add(task.colour)
                        taskSelector.querySelector('.indicators').innerHTML += `<div class='colour-indicator ${task.colour}'></div>`
                    } else {
                        taskSelector.querySelector('.task-colour').textContent = 'No colour selected'
                    }
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
                    <button class='close-stage-input' type="button"><i class="fa-solid fa-xmark"></i></button>
                </div>
            </form>
            `

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
                        addUpdateStageNameEL(newStage)
                    })
                    .catch(error => console.error("Error:", error))
                }

                const inputValue = document.querySelector('.stage-name-input').value
                if (inputValue) {
                    const newStage = document.querySelector('.new-stage-container')
                    const newStageHtml = `
                        <div class='stage' id="">
                            <form class='name-and-delete'>
                                <div class='stage-name'>${inputValue}</div>
                                <input class='hidden rename-stage' type='text' value='${inputValue}'>
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
                        </div>`

                    newStage.insertAdjacentHTML('beforebegin', newStageHtml)
                    document.querySelector('.new-stage-container').classList.remove('hidden')
                    document.querySelector('.new-stage-expanded-container').classList.add('hidden')
                }
            })

            // Add stage event listeners
            document.querySelectorAll('.stage').forEach(stage => {
                onEnterStage(stage)
                addUpdateStageNameEL(stage)
            })

            // Add task dragging event listener to all tasks
            document.querySelectorAll('.task').forEach(task => {
                addtaskDraggingEL(task)
            })

            // Handle task drop and position in database
            document.addEventListener('drop', (event) => {
                event.preventDefault()
                const placeholder = document.querySelector('.drop-placeholder-task')
                const stage = placeholder.closest('.stage')
                placeholder.insertAdjacentElement('afterend', draggedTask)
                placeholder.remove()
                isDragging = false
                draggedTaskHeight = null
                if (event.target.closest('.stage') || placeholder) {
                    const dropTarget = stage.querySelector('.drop-target')
                    const dropTargetArray = Array.from(dropTarget.children)

                    for (let i = 0; i < dropTargetArray.length; i++) {
                        if (dropTargetArray[i].getAttribute('position') != i || stage.id != originalStageId) {
                            let data = {
                                "position": i,
                                "stage_id": parseInt(stage.id.slice(6))
                            }  
                            updateTask(dropTargetArray[i], data)
                        }
                    }
                }
            })

            // handle task input submits
            document.querySelectorAll('.task-name-input').forEach(taskNameInput => {
                taskNameInput.addEventListener('keydown', (event) => {
                    const stage = taskNameInput.closest('.stage')
                    const numberOfTasks = stage.querySelector('.drop-target').childElementCount
                    if (event.key === 'Enter') {
                        displayNewTaskTemp(stage, taskNameInput, numberOfTasks)
                        sendTaskDataRequest(stage, taskNameInput, numberOfTasks)
                        stage.querySelector('.add-task-container').classList.remove('hidden')
                        stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                    }
                })
            })

            // prevent long tasknames
            let taskLineHeight = 17
            document.querySelectorAll('.rename-task').forEach(renameTask => {
                renameTask.addEventListener("input", () => {
                    while (renameTask.scrollHeight > renameTask.clientHeight) {
                        if (taskLineHeight < 34) {
                            taskLineHeight += 17
                            renameTask.style.height = `${taskLineHeight}px`
                        } else {
                            renameTask.value = renameTask.value.slice(0, -1)
                        }
                    }
                    console.log(renameTask.style.height)
                    renameTask.style.height = '17px'
                    if (renameTask.scrollHeight > renameTask.clientHeight) {
                        renameTask.style.height = '34px'
                        taskLineHeight = 34
                    } else {
                        taskLineHeight = 17
                    }
                })
            })

            // task description input
            let descLineHeight = 42
            document.querySelectorAll('.task-description-input').forEach(descInput => {
                descInput.addEventListener("keydown", (event) => {
                    while (descInput.scrollHeight > descInput.clientHeight) {
                        if (descLineHeight < 182) {
                            descLineHeight += 14
                            descInput.style.height = `${descLineHeight}px`
                            console.log(descInput.clientHeight, descLineHeight)
                        } else {
                            descInput.value = descInput.value.slice(0, -1)
                            descLineHeight -= 14
                        }
                    }
                    descInput.style.height = `${parseInt(descInput.style.height.slice(0, -2)) - 14}px`
                    if (descInput.scrollHeight > descInput.clientHeight) {
                        descInput.style.height = `${parseInt(descInput.style.height.slice(0, -2)) + 14}px`
                    } else {
                        descLineHeight -= 14
                    }
                })
            })

            // stage consts
            const newStage = document.querySelector('.new-stage-container')
            const newStageExpanded = document.querySelector('.new-stage-expanded-container')
            // Handle all clicks
            let task = null
            let taskTitle = null
            let taskExpanded = null
            let taskDesc = null
            let taskDescForm = null
            let taskColourList = null
            let stageTargeted = null
            let stageName = null
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

                // change stage name
                if (event.target.classList.contains('stage-name')) {
                    if (stageTargeted) {
                        stageTargeted.querySelector('.stage-name').classList.remove('hidden')
                        stageTargeted.querySelector('.rename-stage').classList.add('hidden')
                        stageTargeted = null
                    }
                    stageTargeted = event.target.closest('.stage')
                    stageName = stageTargeted.querySelector('.rename-stage').value
                    event.target.classList.add('hidden')
                    event.target.nextElementSibling.classList.remove('hidden')
                } else if (stageTargeted && event.target != stageTargeted.querySelector('.rename-stage')) {
                    if (stageTargeted.querySelector('.rename-stage').value.trim() != '') {
                        if (stageName != stageTargeted.querySelector('.rename-stage').value) {
                            updateStage(stageTargeted, stageTargeted.querySelector('.rename-stage').value)
                            stageTargeted.querySelector('.stage-name').textContent = stageTargeted.querySelector('.rename-stage').value
                        }
                        stageTargeted.querySelector('.stage-name').classList.remove('hidden')
                        stageTargeted.querySelector('.rename-stage').classList.add('hidden')
                        stageTargeted = null
                    }
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
                } else if (!event.target.classList.contains('stage-name-input') && event.target != newStageExpanded) {
                    if (event.target.closest('.close-stage-input')) {
                        newStageExpanded.querySelector('.stage-name-input').value = ''
                    }
                    newStage.classList.remove('hidden')
                    newStageExpanded.classList.add('hidden')
                }

                // add task 
                if (event.target.classList.contains('task-name-submit')) {
                    event.preventDefault()
                    const stage = event.target.closest('.stage')
                    const taskNameInput = stage.querySelector('.task-name-input')
                    const dropTarget = stage.querySelector('.drop-target')
                    const numberOfTasks = dropTarget.childElementCount
                    displayNewTaskTemp(stage, taskNameInput, numberOfTasks)
                    sendTaskDataRequest(stage, taskNameInput, numberOfTasks)
                    stage.querySelector('.add-task-container').classList.remove('hidden')
                    stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                } else if (event.target.closest('.close-task-input')) {
                    const stage = event.target.closest('.stage')
                    stage.querySelector('.task-name-input').value = ''
                    stage.querySelector('.add-task-container').classList.remove('hidden')
                    stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                }

                // task expand/contract
                if (event.target.classList.contains('task') || event.target.classList.contains('task-text') || event.target.closest('.indicators')) {
                    if (task) {
                        taskExpanded.classList.add('hidden')
                        task.classList.add('task-hover')
                    }
                    task = event.target.closest('.task')
                    task.setAttribute('draggable', false)
                    task.classList.remove('task-hover')
                    //child nodes
                    taskExpanded = task.querySelector('.task-expanded-container')
                    taskExpanded.classList.remove('hidden')
                } else if (!event.target.closest('.task-expanded-container') && !taskColourList && !taskDesc && !taskTitle) {
                    if (task) {
                        task.querySelector('.task-expanded-container').classList.add('hidden')
                        task.setAttribute('draggable', true)
                        task.classList.add('task-hover')
                    }
                } 

                // rename task
                if (event.target.classList.contains('task-name')) {
                    if (taskTitle) {
                        taskTitle.classList.remove('hidden')
                        taskTitle.nextElementSibling.classList.add('hidden')
                        taskTitle = null
                    }
                    taskTitle = event.target
                    const renameTask = taskTitle.nextElementSibling
                    renameTask.style.height = `${taskTitle.clientHeight}px`
                    renameTask.value = taskTitle.textContent
                    taskTitle.classList.add('hidden')
                    renameTask.classList.remove('hidden')
                    renameTask.focus()
                } else if (!event.target.classList.contains('rename-task')) {
                    if (taskTitle) {
                        const renameTask = taskTitle.nextElementSibling
                        const task = taskTitle.closest('.task')
                        data = {
                            "name": renameTask.value
                        }
                        updateTask(task, data)
                        taskTitle.textContent = renameTask.value 
                        task.querySelector('.task-text').textContent = renameTask.value 
                        taskTitle.classList.remove('hidden')
                        renameTask.classList.add('hidden')
                        taskTitle = null
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
                    if (!(descriptionElement.textContent === 'Click here to add a description...' && descriptionInput === '') && !isDragging) {
                        if (descriptionInput != '') {
                            descriptionElement.textContent = descriptionInput
                            if (!descriptionIndicator) {
                                descriptionElement.closest('.task').querySelector('.indicators').innerHTML += `<i class="description-indicator fa-solid fa-bars"></i>`
                            }
                        } else {
                            descriptionElement.textContent = 'Click here to add a description...'
                            if (descriptionIndicator) {
                                task.querySelector('.description-indicator').remove() 
                            }
                        }
                        updateTask(event.target.closest('.task'), data)
                    } 
                }

                // task colour
                if (event.target.classList.contains('task-colour-container') || event.target.classList.contains('task-colour')) {
                    // colour list show
                    taskColourList = event.target.closest('.task-colour-container').querySelector('.task-colour-list')
                    taskColourList.classList.remove('hidden')
                } else if (taskColourList && !event.target.classList.contains('task-colour-list') && !event.target.closest('.darken')) {
                    // hide colour list
                    if (event.target.classList.contains('task-colour-select')) {
                        const task = event.target.closest('.task')
                        const taskColourElement = event.target.closest('.task-colour-container').querySelector('.task-colour')
                        const originalColour = taskColourElement.className.slice(12)
                        const newColour = event.target.className.slice(19)
                        
                        if (originalColour.trim() != '') {
                            taskColourList.querySelector('.' + originalColour).classList.remove('darken')
                            taskColourList.querySelector('.check').remove()
                        }

                        taskColourElement.textContent = ''

                        taskColourList.querySelector('.' + newColour).classList.add('darken')
                        taskColourList.querySelector('.' + newColour).innerHTML += `<i class="check fa-solid fa-check"></i>`
                        taskColourElement.className = taskColourElement.className.slice(0, 11) + ' ' + newColour
                        
                        if (!task.querySelector('.colour-indicator')) {
                            task.querySelector('.indicators').innerHTML += `<div class='colour-indicator'></div>`
                        } else {
                            task.querySelector('.colour-indicator').classList.remove(originalColour)
                        }
                        task.querySelector('.colour-indicator').classList.add(newColour)

                        const data = {
                            "colour": newColour,
                        }  
                        updateTask(task, data)
                        
                    }
                    taskColourList.classList.add('hidden')
                    taskColourList = null
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
            })
        }).catch(error => console.error('Error:', error))
}