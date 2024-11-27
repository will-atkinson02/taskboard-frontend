function isBefore(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_FOLLOWING;
}

function isAfter(element1, element2) {
    return element1.compareDocumentPosition(element2) & Node.DOCUMENT_POSITION_PRECEDING;
}

function addTaskDropArea(id) {
    if (isDragging) {
        const dropzoneDiv = document.createElement("div")

        dropzoneDiv.classList.add('drop-placeholder-task')

        const dropTarget = document.getElementById(id).closest(".drop-target")

        dropTarget.insertBefore(dropzoneDiv, document.getElementById(id))
    }
}

function addTaskDropAreaAfter(id) {
    if (isDragging) {
        const dropzoneDiv = document.createElement("div")

        dropzoneDiv.classList.add('drop-placeholder-task')

        const taskTarget = document.getElementById(id)

        taskTarget.insertAdjacentElement('afterend', dropzoneDiv)
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
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
        .then(response => response.json())
        .then(data => {
            console.log("Response from server:", data)
        })
        .catch(error => console.error("Error:", error))
}

function drop(event) {
    event.preventDefault()

    const placeholder = document.querySelector('.drop-placeholder-task')
    const stage = placeholder.closest('.stage')

    placeholder.insertAdjacentElement('afterend', draggedTask)
    placeholder.remove()

    isDragging = false

    const dropTarget = stage.querySelector('.drop-target')
    const dropTargetArray = Array.from(dropTarget.children)
    
    for (let i = dropTargetArray.indexOf(draggedTask) - 1; i <= dropTargetArray.length; i++) {
        dropPutRequest(dropTargetArray[i], i)
    }
}

function taskDraggingEventListener(task) {
    task.addEventListener('dragstart', (event) => {
        elementId = event.target.id
        draggedTask = document.getElementById(elementId)
        isDragging = true
    })

    task.addEventListener('drag', (event) => {
        if (event.target.id === elementId) {
            addTaskDropArea(elementId)
            draggedTask.remove()
        }
    })

    task.addEventListener('dragenter', (event) => {
        if (event.target.id !== elementId && event.target.closest('.task').id !== elementId) {
            let taskBelow = event.target

            if (event.target.classList.contains('task-text')) {
                taskBelow = event.target.closest('.task')
            }

            if (!document.querySelector('.drop-placeholder-task')) {
                if (!document.getElementById(elementId).closest('.stage').contains(taskBelow)) {
                    addTaskDropArea(taskBelow.id)
                } else {
                    if (isBefore(document.getElementById(elementId), taskBelow)) {
                        if (document.getElementById(elementId).nextSibling === taskBelow) {
                            taskBelow.closest('.drop-target').insertBefore(taskBelow, document.getElementById(elementId))
                            addTaskDropArea(elementId)
                            draggedTask.remove()
                        } else {
                            addTaskDropAreaAfter(taskBelow.id)
                            draggedTask.remove()
                        }
                    } else if (isAfter(document.getElementById(elementId), taskBelow)) {
                        if (document.getElementById(elementId).previousSibling === taskBelow) {
                            addTaskDropArea(taskBelow.id)
                            draggedTask.remove()
                        } else {
                            addTaskDropArea(taskBelow.id)
                            draggedTask.remove()
                        }
                    }
                }
            } else {
                if (isBefore(document.querySelector('.drop-placeholder-task'), taskBelow)) {
                    if (document.querySelector('.drop-placeholder-task').nextSibling === taskBelow) {
                        taskBelow.closest('.drop-target').insertBefore(taskBelow, document.querySelector('.drop-placeholder-task'))
                    } else {
                        taskBelow.closest('.drop-target').insertBefore(taskBelow, document.querySelector('.drop-placeholder-task'))
                    }
                } else if (isAfter(document.querySelector('.drop-placeholder-task'), taskBelow)) {
                    if (document.querySelector('.drop-placeholder-task').previousSibling === taskBelow) {
                        document.querySelector('.drop-placeholder-task').insertAdjacentElement('afterend', taskBelow)
                    } else {
                        document.querySelector('.drop-placeholder-task').insertAdjacentElement('afterend', taskBelow)
                    }
                }
            }
        }
    })
}

function submitStage(stage) {
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

                const dropzoneDiv = document.createElement("div")

                dropzoneDiv.classList.add('drop-placeholder-task')

                const dropTarget = stage.querySelector('.drop-target')

                dropTarget.appendChild(dropzoneDiv)
            }
        }
    })
}

function sendTaskData() {
    document.querySelectorAll('.add-task-expanded-container').forEach(newTaskForm => {
        newTaskForm.addEventListener('submit', (event) => {
            event.preventDefault()

            let stage = newTaskForm.closest('.stage')
            let dropTarget = stage.querySelector('.drop-target')
            let numberOfTasks = dropTarget.childElementCount

            let form = event.target
            let formData = new FormData(form)
            let jsonData = Object.fromEntries(formData.entries())
            jsonData.position = numberOfTasks
            jsonData.stage_id = parseInt(stage.id.slice(6))

            if (jsonData.name) {
                fetch("http://127.0.0.1:8000/api/task", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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
                    })
                    .catch(error => console.error("Error:", error))
            }
        })
    })
}

function deleteStage() {
    document.querySelectorAll('.name-and-delete').forEach(stageDeleteForm => {
        stageDeleteForm.addEventListener('submit', (event) => {
            event.preventDefault()
            const stage = stageDeleteForm.closest('.stage')

            const stageId = parseInt(stage.id.slice(6))

            stage.remove()

            const url = "http://127.0.0.1:8000/api/stage/" + stageId

            fetch(url, {
                method: "DELETE"
            })
                .then(response => response.json())
                .then(data => console.log("Response from server:", data))
                .catch(error => console.error("Error:", error))
        })
    })
}

function displayNewTaskTemp() {
    document.querySelectorAll('.task-name-submit').forEach(taskSubmitButton => {
        taskSubmitButton.addEventListener('click', () => {
            const currentStage = taskSubmitButton.closest('.stage')
            const inputValue = currentStage.querySelector('.task-name-input').value

            if (inputValue) {
                currentStage.querySelector('.drop-target').innerHTML += `
                <div class='task' id="" draggable='false' ondragstart='drag(event)'>
                    <div class='task-text'>${inputValue}</div>
                </div>`

                currentStage.querySelector('.add-task-container').classList.remove('hidden')
                currentStage.querySelector('.add-task-expanded-container').classList.add('hidden')
            }
        })
    })
}

const taskboardId = 2
const taskboardUrl = 'http://127.0.0.1:8000/api/taskboard/' + taskboardId.toString()

fetch(taskboardUrl)
    .then(response => response.json())
    .then(data => {
        const title = document.querySelector('.title')
        const titleBox = document.querySelector('.change-title')

        let titleContent = document.createTextNode(data.data.name)
        title.appendChild(titleContent)
        document.querySelector('.change-title').value = data.data.name

        data.data.stages.forEach(stage => {
            document.querySelector('.container-container').innerHTML += `
            <div class='stage' id="Stage ${stage.id}" ondrop='drop(event)' ondragover='allowDrop(event)'>
                <form class='name-and-delete'>
                    <div class='stage-name'>${stage.name}</div>
                    <input class='deleteStage' name='$name' type='submit' value='deleteStage'>
                </form>
                <div class='drop-target'></div>
                <div class='add-task-container'><i class="fa-solid fa-plus"></i> Add task</div>
                <form class='add-task-expanded-container hidden'>
                    <input class='task-name-input' type='text' name='name' placeholder='Enter task name...'>
                    <div>
                        <input class='task-name-submit' value='Add task' type='submit'>
                        <button class='close-task-input'>x</button>
                    </div>
                </form>
            </div>
            `

            stage.tasks.sort((a, b) => a.position - b.position).forEach(task => {
                document.getElementById("Stage " + stage.id).querySelector('.drop-target').innerHTML += `
                <div class='task' id=${task.id} draggable='true' ondragstart='drag(event)'>
                    <div class='task-text'>${task.name}</div>
                </div>
                `
            })
        })

        document.querySelector('.container-container').innerHTML += `
        <div class="new-stage-container">
            <i class="fa-duotone fa-solid fa-plus"></i>
            <div class='new-stage-text'>New stage</div>
        </div>
        
        <form class="new-stage-expanded-container hidden">
            <input class="stage-name-input" type="text" name="name" placeholder="Enter stage name...">
            <div>
                <input class="stage-name-submit" value="Add stage" type="submit">
                <button class='close-stage-input'>x</button>
            </div>
        </form>
        `

        document.querySelector('.title-form').addEventListener('submit', (event) => {
            title.classList.remove('hidden')
            titleBox.classList.add('hidden')

            event.preventDefault()
            let form = event.target
            let formData = new FormData(form)
            let jsonData = Object.fromEntries(formData.entries())

            let url = "http://127.0.0.1:8000/api/taskboard/" + taskboardId

            fetch(url, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(jsonData)
            })
                .then(response => response.json())
                .then(data => {
                    console.log("Response from server:", data)
                })
                .catch(error => console.error("Error:", error))
        })

        // Dynamic title input code
        let titleWidth = title.getBoundingClientRect().width
        titleBox.style.width = `${titleWidth}px`
        
        titleBox.addEventListener('input', (event) => {
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
        })

        // Tasks
        sendTaskData()
        displayNewTaskTemp()

        document.querySelector('.new-stage-expanded-container').addEventListener('submit', (event) => {
            event.preventDefault()

            let form = event.target
            let formData = new FormData(form)
            let jsonData = Object.fromEntries(formData.entries())
            jsonData.taskboard_id = taskboardId

            if (jsonData.name) {
                fetch("http://127.0.0.1:8000/api/stage", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
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
                                    submitStage(stage)
                                    deleteStage()
                                })
                            }
                        })
    
                        sendTaskData()
                        displayNewTaskTemp()
                    })
                    .catch(error => console.error("Error:", error))
            }

            const inputValue = document.querySelector('.stage-name-input').value

            if (inputValue) {
                const newStage = document.querySelector('.new-stage-container')
                const newStageHtml = `
                    <div class='stage' id="" ondrop='drop(event)' ondragover='allowDrop(event)'>
                        <form class='name-and-delete'>
                            <div class='stage-name'>${inputValue}</div>
                            <input class='deleteStage' name='$name' type='submit' value='deleteStage'>
                        </form>
                        <div class='drop-target'></div>
                        <div class='add-task-container'>+ Add Card</div>
                        <form class='add-task-expanded-container hidden'>
                            <input class='task-name-input' type='text' name='name' placeholder='Enter task name...'>
                            <div>
                                <input class='task-name-submit' name='$stageId' value='Add task' type='submit'>
                                <button class='close-task-input'>x</button>
                            </div>
                        </form>
                    </div>
                    `

                newStage.insertAdjacentHTML('beforebegin', newStageHtml)

                document.querySelector('.new-stage-container').classList.remove('hidden')
                document.querySelector('.new-stage-expanded-container').classList.add('hidden')
            }
        })

        deleteStage()

        let isDragging = false

        document.querySelectorAll('.task').forEach(task => {
            taskDraggingEventListener(task)
        })

        document.querySelectorAll('.stage').forEach(stage => {
            submitStage(stage)
        })

        const newStage = document.querySelector('.new-stage-container')
        const newStageExpanded = document.querySelector('.new-stage-expanded-container')

        document.addEventListener("dragover", (event) => {
            event.preventDefault()
        })

        document.addEventListener("drop", (event) => {
            event.preventDefault()

            drop(event)
        })

        window.addEventListener("click", (event) => {
            const title = document.querySelector('.title')
            const titleBox = document.querySelector('.change-title')
            if (event.target.classList.contains('title')) {
                title.classList.add('hidden')
                titleBox.classList.remove('hidden')
                titleBox.focus()
            } else if (!event.target.classList.contains('change-title')) {
                title.classList.remove('hidden')
                titleBox.classList.add('hidden')
                       
                if (document.querySelector('.change-title').value != document.querySelector('.title').textContent) {
                    let newTitle = document.querySelector('.change-title').value
                    
                    document.querySelector('.title').textContent = newTitle
                    
                    let jsonData = {"name": newTitle}

                    let url = "http://127.0.0.1:8000/api/taskboard/" + taskboardId

                    fetch(url, {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body: JSON.stringify(jsonData)
                    })
                        .then(response => response.json())
                        .then(data => {
                            console.log("Response from server:", data)
                        })
                        .catch(error => console.error("Error:", error))
                }
            }

            const newStageClicked = event.target.closest('.new-stage-container')
            const newStageExpandedClicked = event.target.closest('.new-stage-expanded-container')

            if (newStageClicked) {
                newStage.classList.add('hidden')
                newStageExpanded.classList.remove('hidden')
            } else if (!newStageExpandedClicked || event.target === document.querySelector('.close-stage-input')) {
                newStage.classList.remove('hidden')
                newStageExpanded.classList.add('hidden')
            }

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