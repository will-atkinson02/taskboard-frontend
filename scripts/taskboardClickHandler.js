let task = null
let taskTitle = null
let taskExpanded = null
let taskDesc = null
let taskDescForm = null
let taskColourList = null
let optionsPressed = null
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
            let jsonData = { "name": newTitle }
            changeTitleRequest(taskboardId, HEADERS, jsonData)
        }

        title.classList.remove('hidden')
        titleBox.classList.add('hidden')
    }

    // new taskboard
    if (event.target.closest('.new-taskboard')) {
        createNewTaskboardRequest(HEADERS, taskboardPageURL, userJson)
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
                const data = {
                    "name": stageTargeted.querySelector('.rename-stage').value
                }
                updateStage(stageTargeted, HEADERS, data)
                stageTargeted.querySelector('.stage-name').textContent = stageTargeted.querySelector('.rename-stage').value
            }
            stageTargeted.querySelector('.stage-name').classList.remove('hidden')
            stageTargeted.querySelector('.rename-stage').classList.add('hidden')
            stageTargeted = null
        }
    }

    // more options on stage
    if (event.target.classList.contains('more-options')) {
        if (optionsPressed) {
            optionsPressed.querySelector('.delete-stage').classList.add('hidden')
            optionsPressed.querySelector('.move-right').classList.add('hidden')
            optionsPressed.querySelector('.move-left').classList.add('hidden')
            optionsPressed = null
        }
        optionsPressed = event.target.closest('.stage')
        optionsPressed.querySelector('.delete-stage').classList.remove('hidden')
        optionsPressed.querySelector('.move-right').classList.remove('hidden')
        optionsPressed.querySelector('.move-left').classList.remove('hidden')
    } else if (optionsPressed && (!event.target.classList.contains('delete-stage') ||
        !event.target.classList.contains('move-right') ||
        !event.target.classList.contains('move-left'))) {
        optionsPressed.querySelector('.delete-stage').classList.add('hidden')
        optionsPressed.querySelector('.move-right').classList.add('hidden')
        optionsPressed.querySelector('.move-left').classList.add('hidden')
        optionsPressed = null
    }

    // move stage right
    if (event.target.closest('.move-right')) {
        const container = document.querySelector('.container-container')
        const stage = event.target.closest('.stage')
        const stagePosition = parseInt(stage.getAttribute("position"))
        if (stagePosition < container.childElementCount - 2) {
            const nextStage = stage.nextElementSibling
            const nextStagePosition = parseInt(nextStage.getAttribute("position"))

            container.insertBefore(nextStage, stage)
            stage.setAttribute("position", stagePosition + 1)
            nextStage.setAttribute("position", nextStagePosition - 1)

            const dataA = {
                "position": stagePosition + 1
            }
            const dataB = {
                "position": nextStagePosition - 1
            }

            updateStage(stage, HEADERS, dataA)
            updateStage(nextStage, HEADERS, dataB)
        }
    }
    if (event.target.closest('.move-left')) {
        const container = document.querySelector('.container-container')
        const stage = event.target.closest('.stage')
        const stagePosition = parseInt(stage.getAttribute("position"))
        if (stagePosition > 0) {
            const previousStage = stage.previousElementSibling
            const previousStagePosition = parseInt(previousStage.getAttribute("position"))

            container.insertBefore(stage, previousStage)
            stage.setAttribute("position", stagePosition - 1)
            previousStage.setAttribute("position", previousStagePosition + 1)

            const dataA = {
                "position": stagePosition - 1
            }
            const dataB = {
                "position": previousStagePosition + 1
            }
            updateStage(stage, HEADERS, dataA)
            updateStage(previousStage, HEADERS, dataB)
        }
    }

    // delete stage
    if (event.target.classList.contains('delete-stage') || event.target.classList.contains('trash-svg-1')) {
        deleteStage(event.target.closest('.stage'), HEADERS)
        const stagesArray = Array.prototype.slice.call(document.querySelector('.container-container').children).slice(0, -2)
        stagesArray.forEach(stage => {
            stage.setAttribute("position", stagesArray.indexOf(stage))
        })
    }

    // expand/contract new stage
    const newStage = document.querySelector('.new-stage-container')
    const newStageExpanded = document.querySelector('.new-stage-expanded-container')
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
        displayNewTask(stage, taskNameInput, numberOfTasks)
        createTask(stage, taskNameInput, numberOfTasks, HEADERS)
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
            updateTask(task, HEADERS, data)
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
                    const indicators = descriptionElement.closest('.task').querySelector('.indicators')
                    indicators.classList.remove('hidden')
                    indicators.innerHTML += `<i class="description-indicator fa-solid fa-bars"></i>`
                    if (indicators.getAttribute("class").length > 10) {
                        indicators.style.color = 'white'
                    }
                }
            } else {
                descriptionElement.textContent = 'Click here to add a description...'
                if (descriptionIndicator) {
                    if (task.querySelector('.indicators').getAttribute("class").length === 10) {
                        task.querySelector('.indicators').classList.add('hidden')
                        task.querySelector('.description-indicator').remove()
                    }
                }
            }
            updateTask(event.target.closest('.task'), HEADERS, data)
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
                task.querySelector('.indicators').classList.remove(originalColour)
            } else {
                task.querySelector('.indicators').classList.remove('hidden')
            }

            if (task.querySelector('.description-indicator')) {
                task.querySelector('.indicators').style.color = "white"
            } else {
                task.querySelector('.indicators').style.color = "black"
            }

            taskColourElement.textContent = ''

            taskColourList.querySelector('.' + newColour).classList.add('darken')
            taskColourList.querySelector('.' + newColour).innerHTML += `<i class="check fa-solid fa-check"></i>`
            taskColourElement.className = taskColourElement.className.slice(0, 11) + ' ' + newColour

            task.querySelector('.indicators').classList.add(newColour)

            const data = {
                "colour": newColour,
            }
            updateTask(task, HEADERS, data)

        }
        taskColourList.classList.add('hidden')
        taskColourList = null
    }

    // delete task
    if (event.target.closest('.delete-task')) {
        const task = event.target.closest('.task')
        const url = apiURL + "task/" + task.id.toString()
        task.remove()
        apiRequest(url, "DELETE", HEADERS, (data) => console.log("Response from server:", data))
        
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