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

function drop(event) {
    event.preventDefault()

    const placeholder = document.querySelector('.drop-placeholder-task')
    placeholder.insertAdjacentElement('afterend', draggedTask)
    placeholder.remove()

    isDragging = false

    // fetch("taskAPI.php", {
    //     method: "PUT",
    //     headers: {
    //         "Content-Type": "application/json" // Set content type to JSON
    //     },
    //     body: JSON.stringify(data)
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log("Response from server:", data);
    //     // Show success message or handle errors here
    // })
    // .catch(error => console.error("Error:", error));
}

fetch('http://127.0.0.1:8000/api/taskboard/1')
    .then(response => response.json())
    .then(data => {
        let title = document.querySelector('.title')
        let titleContent = document.createTextNode(data.data.name)
        title.appendChild(titleContent)
        document.querySelector('.change-title').value = data.data.name

        data.data.stages.forEach(stage => {
            document.querySelector('.container-container').innerHTML += `
            <div class='stage' id="Stage ${stage.id}" ondrop='drop(event)' ondragover='allowDrop(event)'><form method='POST' class='name-and-delete'><div>${stage.name}</div><input class='deleteStage' name='$name' type='submit' value='deleteStage'></form>
                <div class='drop-target'></div>
                <div class='add-task-container'>+ Add Card</div>
                <form class='add-task-expanded-container hidden' method='POST'>
                    <input class='task-name-input' type='text' name='taskName' placeholder='Enter task name...'>
                    <div>
                        <input class='task-name-submit' name='$stageId' value='Add task' type='submit'>
                        <button>x</button>
                    </div>
                </form>
            </div>
            `

            stage.tasks.forEach(task => {
                document.getElementById("Stage " + stage.id).querySelector('.drop-target').innerHTML += `
                <div class='task' id=${task.id} draggable='true' ondragstart='drag(event)'>
                    <div class='task-text'>${task.name}</div>
                </div>
                `
            })
        })

        document.querySelector('.container-container').innerHTML += `
        <div class="new-stage-container">
            <i>+</i> New stage
        </div>
        
        <form class="new-stage-expanded-container hidden" method="POST">
            <input class="stage-name-input" type="text" name="stageName" placeholder="Enter stage name...">
            <div>
                <input class="stage-name-submit" value="Add stage" type="submit">
                <button>x</button>
            </div>
        </form>
        `

        let isDragging = false

        document.querySelectorAll('.task').forEach(task => {
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
        })

        document.querySelectorAll('.stage').forEach(stage => {
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
        })

        const newStage = document.querySelector('.new-stage-container')
        const newStageExpanded = document.querySelector('.new-stage-expanded-container')

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
        }

        const newStageClicked = event.target.closest('.new-stage-container')
        const newStageExpandedClicked = event.target.closest('.new-stage-expanded-container')

        if (newStageClicked) {
            newStage.classList.add('hidden')
            newStageExpanded.classList.remove('hidden')
        } else if (!newStageExpandedClicked) {
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

            } else if (!inAddTaskExpanded) {
                document.querySelectorAll('.stage').forEach(stage => {
                    stage.querySelector('.add-task-container').classList.remove('hidden')
                    stage.querySelector('.add-task-expanded-container').classList.add('hidden')
                })
            }

            if (event.target.classList.contains('deleteStage')) {
                const stageClosest = event.target.closest('.stage')
                const nameContainerClosest = event.target.closest('name-and-delete')
                const nameClosest = nameContainerClosest.querySelector('div').textContent
            }
        })
    }).catch(error => console.error('Error:', error))