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
function createTask(stage, taskNameInput, numberOfTasks, HEADERS) {
    const jsonData = {
        "name": taskNameInput.value,
        "position": numberOfTasks,
        "stage_id": parseInt(stage.id.slice(6))
    }
    const url = apiURL + "task"
    if (jsonData.name != '') {
        apiRequest(url, "POST", HEADERS, (data) => {
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
        }, jsonData)
    }
}
function updateTask(task, HEADERS, jsonData) {
    let url = apiURL + "task/" + task.id
    apiRequest(url, "PUT", HEADERS, (data) => console.log("Response from server:", data), jsonData)
    
}
function displayNewTask(stage, taskNameInput, numberOfTasks) {
    const dropTarget = stage.querySelector('.drop-target')
    dropTarget.innerHTML += insertTaskElement(numberOfTasks, taskNameInput.value, 'Click here to add a description...')
    if (dropTarget.lastElementChild.clientHeight > 45) {
        dropTarget.lastElementChild.style.paddingBottom = "10px"
    }
}
function insertTaskElement(position, taskName, description, taskId = '', descriptionIndicator = '') {
    return `
    <div class='task task-hover' id=${taskId} position=${position} draggable='true' ondragstart='drag(event)'>
        <div class='task-text'>${taskName}</div>
        <div class='hidden indicators'>
            ${descriptionIndicator}
        </div>
        <div class='hidden task-expanded-container'>
            <div class='expanded-task-text'>
                <div class='task-name'>${taskName}</div>
                <textarea class='hidden rename-task'></textarea>
            </div>
                <div class='description-title'>Description:</div>
            <div class='task-description' maxlength="255">${description}</div>
            <form class='hidden task-description-form'>
                <textarea class='task-description-input' type='text'  placeholder='Add a description...'></textarea>
                <button class='task-description-submit'>Add description</button>
                <button class='close-description-input'><i class="fa-solid fa-xmark"></i></button>
            </form> 
            <div class='task-description-spacer'></div>
            <div class='colour-container'>
                <div class="colour-title">Colour: </div>
                <div class='task-colour-container'>
                    <div class='task-colour'>No colour selected</div>
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
            <div class='delete-task-container'>
                <div class='delete-task'><i class="trash-svg-2 fa-solid fa-trash"></i></div>
            </div>
        </div>
    </div>`
}

// updating stages
function updateStage(stage, HEADERS, jsonData) {
    const stageId = parseInt(stage.id.slice(6))
    const url = apiURL + "stage/" + stageId
    apiRequest(url, "PUT", HEADERS, (data) => console.log("Response from server:", data), jsonData)
}
function deleteStage(stage, HEADERS) {
    const stageId = parseInt(stage.id.slice(6))
    const url = apiURL + "stage/" + stageId
    stage.remove()
    apiRequest(url, "DELETE", HEADERS, (data) => console.log("Response from server:", data))
}
function addUpdateStageNameEL(stage, HEADERS) {
    stage.addEventListener('submit', (event) => {
        event.preventDefault()
        const renameStage = stage.querySelector('.rename-stage')
        const stageTitle = renameStage.previousElementSibling
        const data = {
            "name": renameStage.value
        }
        updateStage(stage, HEADERS, data)
        renameStage.classList.add('hidden')
        stageTitle.classList.remove('hidden')
        stageTitle.textContent = renameStage.value
    })
}

//edit title
function changeTitleRequest(taskboardId, HEADERS, jsonData) {
    let url = apiURL + "taskboard/" + taskboardId
    apiRequest(url, "PUT", HEADERS, (data) => console.log("Response from server:", data), jsonData)
}

//loading spinner
document.querySelector('body').innerHTML += spinner()

// initial states
let draggedTask = null
let draggedTaskHeight = null
let draggedTaskDimensions = null
let taskBelow = null
let originalStageId = null
let isDragging = false
let allowA = false
let allowB = false
let title = null
let titleBox = null
let initialTitleValue = null

//get url id
const urlParams = new URLSearchParams(window.location.search)
const taskboardId = urlParams.get('id')

if (token) {
    
    const taskboardURL = apiURL + 'taskboard/' + taskboardId.toString()

    apiRequest(taskboardURL, "GET", HEADERS, (data) => {
        document.querySelector('.spinner-container').remove()

        title = document.querySelector('.title')
        title.appendChild(document.createTextNode(data.data.name))
        titleBox = document.querySelector('.change-title')
        titleBox.value = data.data.name
        initialTitleValue = title.textContent

        // Render all stages
        data.data.stages.sort((a, b) => a.position - b.position).forEach(stage => {
            document.querySelector('.container-container').innerHTML += `
            <div class='stage' id="Stage ${stage.id}" position="${stage.position}">
                <form class='name-and-delete'>
                    <div class='stage-name'>${stage.name}</div>
                    <input class='hidden rename-stage' type='text' value='${stage.name}'>
                    <i class="more-options fa-solid fa-ellipsis-vertical">
                        <div class='move-left hidden' type='submit'><i class="fa-solid fa-arrow-left"></i></div>
                        <div class='move-right hidden' type='submit'><i class="fa-solid fa-arrow-right"></i></div>
                        <div class='delete-stage hidden' type='submit'><i class="trash-svg-1 fa-solid fa-trash"></i></div>
                    </i>
                </form>
                <div class='drop-target'></div>
                <div class='add-task-container'><i class="plus-task fa-solid fa-plus"></i> Add task</div>
                <div class='add-task-expanded-container hidden'>
                    <textarea class='task-name-input' type='text' name='name' placeholder='Enter task name...'></textarea>
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
                let descriptionIndicator = "<i class='description-indicator fa-solid fa-bars'></i>"
                let description = task.description
                if (task.description === null) {
                    description = 'Click here to add a description...'
                    descriptionIndicator = ''
                }
                stageElement.querySelector('.drop-target').innerHTML += insertTaskElement(task.position, task.name, description, task.id, descriptionIndicator)

                const taskSelector = document.getElementById(task.id)
                if (task.colour) {
                    taskSelector.querySelector('.' + task.colour).innerHTML += `<i class="check fa-solid fa-check"></i>`
                    taskSelector.querySelector('.' + task.colour).classList.add('darken')
                    taskSelector.querySelector('.task-colour').classList.add(task.colour)
                    taskSelector.querySelector('.indicators').classList.add(task.colour)
                    if (descriptionIndicator != '') {
                        taskSelector.querySelector('.description-indicator').style.color = 'white'
                    }
                    taskSelector.querySelector('.task-colour').textContent = ''
                    taskSelector.querySelector('.indicators').classList.remove('hidden')
                }
                if (descriptionIndicator != '') {
                    taskSelector.querySelector('.indicators').classList.remove('hidden')
                }

                if (taskSelector.clientHeight > 45  && !task.colour && !task.description) {
                    taskSelector.style.paddingBottom = "10px"
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
                    let charLength = (titleBox.getBoundingClientRect().width - 40) / titleBox.value.length
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
                changeTitleRequest(taskboardId, HEADERS, getFormData(event))
            }
        })

        // Add new stage
        document.querySelector('.new-stage-expanded-container').addEventListener('submit', (event) => {
            event.preventDefault()
            
            let jsonData = getFormData(event)
            jsonData.position = document.querySelector('.container-container').childElementCount - 2
            jsonData.taskboard_id = taskboardId
            if (jsonData.name) {
                const url = apiURL + "stage"
                apiRequest(url, "POST", HEADERS, (data) => {
                    const stageContainer = document.querySelector('.container-container')
                    const allStages = stageContainer.children
                    const newStage = allStages[allStages.length - 3]
                    newStage.setAttribute('id', 'Stage ' + data.stageId)
                    document.querySelector('.stage-name-input').value = ''
                    onEnterStage(newStage)
                    addUpdateStageNameEL(newStage, HEADERS)
                }, jsonData)
            }

            const inputValue = document.querySelector('.stage-name-input').value
            if (inputValue) {
                const newStage = document.querySelector('.new-stage-container')
                const newStageHtml = `
                    <div class='stage' id="" position='${jsonData.position}'>
                        <form class='name-and-delete'>
                            <div class='stage-name'>${inputValue}</div>
                            <input class='hidden rename-stage' type='text' value='${inputValue}'>
                            <i class="more-options fa-solid fa-ellipsis-vertical">
                                <div class='move-left hidden' type='submit'><i class="fa-solid fa-arrow-left"></i></div>
                                <div class='move-right hidden' type='submit'><i class="fa-solid fa-arrow-right"></i></div>
                                <div class='delete-stage hidden' type='submit'><i class="trash-svg-1 fa-solid fa-trash"></i></div>
                            </i>
                        </form>
                        <div class='drop-target'></div>
                        <div class='add-task-container'><i class="plus-task fa-duotone fa-solid fa-plus"></i> Add task</div>
                        <form class='add-task-expanded-container hidden'>
                            <textarea class='task-name-input' type='text' name='name' placeholder='Enter task name...'></textarea>
                            <div class="submit-close-container">
                                <button class='task-name-submit'>Add task</button>
                                <button class='close-task-input'><i class="fa-solid fa-xmark"></i></button>
                            </div>
                        </form>
                    </div>`

                newStage.insertAdjacentHTML('beforebegin', newStageHtml)
                document.querySelector('.new-stage-container').classList.remove('hidden')
                document.querySelector('.new-stage-expanded-container').classList.add('hidden')
                document.querySelector('.stage-name-input').value = ""
            }
        })

        // Add stage event listeners
        document.querySelectorAll('.stage').forEach(stage => {
            onEnterStage(stage)
            addUpdateStageNameEL(stage)
        })

        // prevent long stagenames
        document.querySelectorAll('.rename-stage').forEach(renameStage => {
            renameStage.addEventListener("input", () => {
                while (renameStage.scrollWidth > renameStage.clientWidth) {
                    renameStage.value = renameStage.value.slice(0, -1)
                }
            })
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
                    displayNewTask(stage, taskNameInput, numberOfTasks)
                    createTask(stage, taskNameInput, numberOfTasks, HEADERS)
                    stage.querySelector('.add-task-container').classList.remove('hidden')
                    stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                }
            })
        })

        // prevent long task renames
        let taskLineHeight = 26
        document.querySelectorAll('.rename-task').forEach(renameTask => {
            renameTask.addEventListener("input", () => {
                const taskName = renameTask.previousElementSibling
                while (renameTask.scrollHeight > renameTask.clientHeight) {
                    if (taskLineHeight < 52) {
                        taskLineHeight += 26
                        renameTask.style.height = `${taskLineHeight}px`
                        taskName.style.height = `${taskLineHeight}px`
                    } else {
                        renameTask.value = renameTask.value.slice(0, -1)
                    }
                }
                renameTask.style.height = '26px'
                taskName.style.height = '26px'
                if (renameTask.scrollHeight > renameTask.clientHeight) {
                    renameTask.style.height = '52px'
                    taskName.style.height = '52px'
                    taskLineHeight = 52
                } else {
                    taskLineHeight = 26
                }
            })
        })

        // prevent long task names
        document.querySelectorAll('.task-name-input').forEach(nameInput => {
            nameInput.addEventListener("input", () => {
                while (nameInput.scrollWidth > nameInput.clientWidth) {
                    nameInput.value = nameInput.value.slice(0, -1)
                }
            })
        })

        // task description input
        document.querySelectorAll('.task-description-input').forEach(descInput => {
            const descriptionElement = descInput.closest('.task-description-form').previousElementSibling
            const taskExpandedContainer = descriptionElement.closest('.task-expanded-container')
            if (descInput.value.trim() != '') {
                descriptionElement.textContent = descInput.value
                taskExpandedContainer.classList.remove('hidden')
                descInput.style.height = `${descriptionElement.clientHeight}px`
                taskExpandedContainer.classList.add('hidden')
            }
            descInput.addEventListener("keyup", (event) => {
                if (event.key.length < 2 || event.key === 'Backspace' || event.key === 'Delete') {
                    descriptionElement.textContent = descInput.value
                }
                descriptionElement.classList.remove('hidden')
                while (descriptionElement.clientHeight >= 273) {
                    descInput.value = descInput.value.slice(0, -1)
                    descriptionElement.textContent = descInput.value
                }
                descInput.style.height = `${descriptionElement.clientHeight}px`
                descriptionElement.classList.add('hidden')
            })
        })
    })
}