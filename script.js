document.addEventListener('DOMContentLoaded', () => {
    // App state
    const state = {
        currentWeekStart: getStartOfWeek(new Date()),
        selectedDay: null,
        data: loadData(),
        timePicker: {
            isOpen: false,
            selectedHour: null,
            selectedMinute: null
        }
    };

    // DOM Elements
    const topicModal = document.getElementById('topic-modal');
    const linkModal = document.getElementById('link-modal');
    const topicForm = document.getElementById('topic-form');
    const linkForm = document.getElementById('link-form');
    const addTopicBtn = document.getElementById('add-topic-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const prevWeekBtn = document.getElementById('previous-week');
    const nextWeekBtn = document.getElementById('next-week');
    const topicsContainer = document.getElementById('topics-container');
    
    // Time picker elements
    const timeInput = document.getElementById('time-input');
    const timeDisplay = document.getElementById('time-display');
    const timePickerDropdown = document.getElementById('time-picker-dropdown');
    const hoursScroll = document.getElementById('hours-scroll');
    const minutesScroll = document.getElementById('minutes-scroll');
    
    // Debug check to ensure the button exists
    console.log('Add Topic button found:', addTopicBtn !== null);
    console.log('Time picker elements:', {
        timeInput: timeInput !== null,
        timeDisplay: timeDisplay !== null,
        timePickerDropdown: timePickerDropdown !== null,
        hoursScroll: hoursScroll !== null,
        minutesScroll: minutesScroll !== null
    });
    
    // Initialize the app
    init();

    // Event Listeners
    addTopicBtn.addEventListener('click', (e) => {
        console.log('Add Topic button clicked');
        openTopicModal();
    });
    topicForm.addEventListener('submit', handleTopicSubmit);
    linkForm.addEventListener('submit', handleLinkSubmit);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeAllModals));
    prevWeekBtn.addEventListener('click', () => changeWeek(-1));
    nextWeekBtn.addEventListener('click', () => changeWeek(1));
    
    // Only set up time picker if elements exist
    if (timeInput && timePickerDropdown && hoursScroll && minutesScroll) {
        const applyTimeBtn = timePickerDropdown.querySelector('.apply');
        const cancelTimeBtn = timePickerDropdown.querySelector('.cancel-time');
        
        // Time picker event listeners
        timeInput.addEventListener('click', toggleTimePicker);
        if (applyTimeBtn) applyTimeBtn.addEventListener('click', applyTimeSelection);
        if (cancelTimeBtn) cancelTimeBtn.addEventListener('click', closeTimePicker);
        
        // Close time picker when clicking outside
        document.addEventListener('click', (e) => {
            if (state.timePicker.isOpen && 
                !timeInput.contains(e.target) && 
                !timePickerDropdown.contains(e.target)) {
                closeTimePicker();
            }
        });
        
        // Initialize time picker
        initializeTimePicker();
    } else {
        console.error('Time picker elements not found');
    }

    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === topicModal) closeAllModals();
        if (e.target === linkModal) closeAllModals();
    });

    // Initialize the app
    function init() {
        renderCurrentWeek();
        renderWeekDisplay();
    }
    
    // Initialize the time picker with hours and minutes
    function initializeTimePicker() {
        // Populate hours (0-12)
        hoursScroll.innerHTML = '';
        for (let i = 0; i <= 12; i++) {
            const hourItem = document.createElement('div');
            hourItem.className = 'time-item';
            hourItem.textContent = i;
            hourItem.dataset.value = i;
            hourItem.addEventListener('click', () => selectHour(i));
            hoursScroll.appendChild(hourItem);
        }
        
        // Populate minutes (00-55 in increments of 5)
        minutesScroll.innerHTML = '';
        for (let i = 0; i < 60; i += 5) {
            const minuteItem = document.createElement('div');
            minuteItem.className = 'time-item';
            minuteItem.textContent = i.toString().padStart(2, '0');
            minuteItem.dataset.value = i;
            minuteItem.addEventListener('click', () => selectMinute(i));
            minutesScroll.appendChild(minuteItem);
        }
    }
    
    // Toggle the time picker dropdown
    function toggleTimePicker(e) {
        e.stopPropagation();
        if (state.timePicker.isOpen) {
            closeTimePicker();
        } else {
            openTimePicker();
        }
    }
    
    // Open the time picker dropdown
    function openTimePicker() {
        timePickerDropdown.classList.add('active');
        state.timePicker.isOpen = true;
        
        // If there's already a value, scroll to it
        const timeValue = document.getElementById('link-time').value;
        if (timeValue) {
            // Check for only minutes pattern (e.g., "30 mins")
            const minOnlyMatch = timeValue.match(/^(\d+)\s*(?:minutes?|mins?)$/i);
            if (minOnlyMatch) {
                const minutes = parseInt(minOnlyMatch[1], 10);
                
                selectHour(0);
                selectMinute(Math.floor(minutes / 5) * 5); // Round to nearest 5
                
                // Scroll to the selected values
                scrollToSelected(hoursScroll, 0);
                scrollToSelected(minutesScroll, Math.floor(minutes / 5) * 5);
                return;
            }
            
            // Regular pattern with hours (and optional minutes)
            const match = timeValue.match(/(\d+)\s*(?:hours?|hrs?)?(?:\s+(\d+)\s*(?:minutes?|mins?)?)?/i);
            if (match) {
                const hours = parseInt(match[1], 10);
                const minutes = match[2] ? parseInt(match[2], 10) : 0;
                
                selectHour(hours);
                selectMinute(Math.floor(minutes / 5) * 5); // Round to nearest 5
                
                // Scroll to the selected values
                scrollToSelected(hoursScroll, hours);
                scrollToSelected(minutesScroll, Math.floor(minutes / 5) * 5);
            }
        }
    }
    
    // Close the time picker dropdown
    function closeTimePicker() {
        timePickerDropdown.classList.remove('active');
        state.timePicker.isOpen = false;
    }
    
    // Select an hour
    function selectHour(hour) {
        state.timePicker.selectedHour = hour;
        
        // Update visual selection
        const hourItems = hoursScroll.querySelectorAll('.time-item');
        hourItems.forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.value) === hour);
        });
        
        updateTimeDisplay();
    }
    
    // Select a minute
    function selectMinute(minute) {
        state.timePicker.selectedMinute = minute;
        
        // Update visual selection
        const minuteItems = minutesScroll.querySelectorAll('.time-item');
        minuteItems.forEach(item => {
            item.classList.toggle('selected', parseInt(item.dataset.value) === minute);
        });
        
        updateTimeDisplay();
    }
    
    // Scroll to the selected time value
    function scrollToSelected(container, value) {
        const selectedItem = container.querySelector(`.time-item[data-value="${value}"]`);
        if (selectedItem) {
            const containerHeight = container.clientHeight;
            const itemHeight = selectedItem.clientHeight;
            const scrollTop = selectedItem.offsetTop - (containerHeight / 2) + (itemHeight / 2);
            container.scrollTop = scrollTop;
        }
    }
    
    // Update the time display
    function updateTimeDisplay() {
        if (state.timePicker.selectedHour !== null) {
            let displayText = '';
            
            // Handle the case of 0 hours
            if (state.timePicker.selectedHour === 0) {
                if (state.timePicker.selectedMinute !== null && state.timePicker.selectedMinute > 0) {
                    displayText = `${state.timePicker.selectedMinute} min`;
                    if (state.timePicker.selectedMinute !== 1) displayText += 's';
                } else {
                    displayText = '0 mins';
                }
            } else {
                displayText = `${state.timePicker.selectedHour} hour`;
                if (state.timePicker.selectedHour !== 1) displayText += 's';
                
                if (state.timePicker.selectedMinute !== null && state.timePicker.selectedMinute > 0) {
                    displayText += ` ${state.timePicker.selectedMinute} min`;
                    if (state.timePicker.selectedMinute !== 1) displayText += 's';
                }
            }
            
            timeDisplay.textContent = displayText;
            document.getElementById('link-time').value = displayText;
        }
    }
    
    // Apply the selected time
    function applyTimeSelection() {
        if (state.timePicker.selectedHour !== null) {
            let timeValue = '';
            
            // Handle the case of 0 hours
            if (state.timePicker.selectedHour === 0) {
                if (state.timePicker.selectedMinute !== null && state.timePicker.selectedMinute > 0) {
                    timeValue = `${state.timePicker.selectedMinute} min`;
                    if (state.timePicker.selectedMinute !== 1) timeValue += 's';
                } else {
                    timeValue = '0 mins';
                }
            } else {
                timeValue = `${state.timePicker.selectedHour} hour`;
                if (state.timePicker.selectedHour !== 1) timeValue += 's';
                
                if (state.timePicker.selectedMinute !== null && state.timePicker.selectedMinute > 0) {
                    timeValue += ` ${state.timePicker.selectedMinute} min`;
                    if (state.timePicker.selectedMinute !== 1) timeValue += 's';
                }
            }
            
            document.getElementById('link-time').value = timeValue;
            timeDisplay.textContent = timeValue;
            closeTimePicker();
        }
    }

    // Get the start of the week (Sunday) for a given date
    function getStartOfWeek(date) {
        const newDate = new Date(date);
        const day = newDate.getDay(); // 0 for Sunday, 1 for Monday, etc.
        const diff = newDate.getDate() - day;
        return new Date(newDate.setDate(diff));
    }

    // Format date as YYYY-MM-DD
    function formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    // Format date for display
    function formatDisplayDate(date) {
        return date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric'
        });
    }

    // Load data from localStorage
    function loadData() {
        const savedData = localStorage.getItem('learningTracker');
        return savedData ? JSON.parse(savedData) : {};
    }

    // Save data to localStorage
    function saveData() {
        localStorage.setItem('learningTracker', JSON.stringify(state.data));
    }

    // Render the current week display
    function renderWeekDisplay() {
        const currentWeekElement = document.getElementById('current-week-date');
        const endOfWeek = new Date(state.currentWeekStart);
        endOfWeek.setDate(endOfWeek.getDate() + 6);
        
        currentWeekElement.textContent = `${formatDisplayDate(state.currentWeekStart)} - ${formatDisplayDate(endOfWeek)}`;
    }

    // Render the days of the current week
    function renderCurrentWeek() {
        const daysContainer = document.querySelector('.days-container');
        daysContainer.innerHTML = '';
        
        const dayNames = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        
        for (let i = 0; i < 7; i++) {
            const currentDay = new Date(state.currentWeekStart);
            currentDay.setDate(currentDay.getDate() + i);
            const dateString = formatDate(currentDay);
            
            // Get topic count
            const dayData = state.data[dateString] || {};
            const topicCount = Object.keys(dayData).length;
            
            const dayCard = document.createElement('div');
            dayCard.className = 'day-card';
            dayCard.dataset.date = dateString;
            if (state.selectedDay === dateString) {
                dayCard.classList.add('active');
            }
            
            // Check if today
            const isToday = isSameDay(currentDay, new Date());
            const todayClass = isToday ? 'today' : '';
            
            dayCard.innerHTML = `
                <div class="day-name ${todayClass}">${dayNames[i]}</div>
                <div class="day-date">${currentDay.getDate()}</div>
                ${topicCount > 0 ? `<div class="topic-count">${topicCount}</div>` : ''}
                ${isToday ? '<div class="today-marker"><i class="fas fa-circle"></i></div>' : ''}
            `;
            
            dayCard.addEventListener('click', () => selectDay(dateString));
            daysContainer.appendChild(dayCard);
        }
    }
    
    // Check if two dates are the same day
    function isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }

    // Select a day and show its topics
    function selectDay(date) {
        state.selectedDay = date;
        
        // Update active class on day cards
        document.querySelectorAll('.day-card').forEach(card => {
            card.classList.toggle('active', card.dataset.date === date);
        });
        
        // Update selected day display
        const selectedDayElement = document.getElementById('selected-day');
        const dayDate = new Date(date);
        const formattedDate = dayDate.toLocaleDateString('en-US', { 
            weekday: 'short', 
            month: 'short', 
            day: 'numeric'
        });
        selectedDayElement.textContent = formattedDate;
        
        // Enable the add topic button
        addTopicBtn.disabled = false;
        
        renderTopics();
    }

    // Render topics for the selected day
    function renderTopics() {
        topicsContainer.innerHTML = '';
        
        if (!state.selectedDay) {
            topicsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-book"></i>
                    <p>Select a day to begin recording your learnings</p>
                </div>
            `;
            return;
        }
        
        const dayData = state.data[state.selectedDay] || {};
        const topics = Object.keys(dayData);
        
        if (topics.length === 0) {
            topicsContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-pencil-alt"></i>
                    <p>No entries yet. Click "Add Topic" to get started</p>
                </div>
            `;
            return;
        }
        
        topics.forEach((topicId, index) => {
            const topic = dayData[topicId];
            const topicCard = document.createElement('div');
            topicCard.className = 'topic-card';
            topicCard.dataset.id = topicId;
            
            const topicHeader = document.createElement('div');
            topicHeader.className = 'topic-header';
            
            const topicTitle = document.createElement('h3');
            topicTitle.className = 'topic-title';
            topicTitle.textContent = topic.title;
            
            const topicActions = document.createElement('div');
            topicActions.className = 'topic-actions';
            
            const addLinkBtn = document.createElement('button');
            addLinkBtn.className = 'action-btn';
            addLinkBtn.innerHTML = '<i class="fas fa-plus"></i>';
            addLinkBtn.title = "Add Resource";
            addLinkBtn.addEventListener('click', () => openLinkModal(topicId));
            
            const deleteTopicBtn = document.createElement('button');
            deleteTopicBtn.className = 'action-btn';
            deleteTopicBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteTopicBtn.title = "Delete Topic";
            deleteTopicBtn.addEventListener('click', () => deleteTopic(topicId));
            
            topicActions.appendChild(addLinkBtn);
            topicActions.appendChild(deleteTopicBtn);
            
            topicHeader.appendChild(topicTitle);
            topicHeader.appendChild(topicActions);
            
            const resourceList = document.createElement('div');
            resourceList.className = 'resource-list';
            
            const resources = topic.resources || [];
            if (resources.length > 0) {
                resources.forEach((resource, resourceIndex) => {
                    const resourceItem = document.createElement('div');
                    resourceItem.className = 'resource-item';
                    resourceItem.dataset.index = resourceIndex;
                    resourceItem.dataset.topic = topicId;
                    
                    let resourceContent = `
                        <div class="resource-content">
                            <div class="resource-header">
                                <h4>${resource.title}</h4>
                                <div class="resource-actions">
                                    ${resource.url ? `
                                        <a href="${resource.url}" class="resource-link-btn" target="_blank">
                                            <i class="fas fa-external-link-alt"></i> ${resource.buttonText || 'Link'}
                                        </a>
                                    ` : ''}
                                </div>
                            </div>
                    `;
                    
                    if (resource.description) {
                        resourceContent += `
                            <div class="resource-description">${resource.description}</div>
                        `;
                    }
                    
                    resourceContent += '<div class="resource-meta">';
                    resourceContent += '<span class="resource-delete"><i class="fas fa-times"></i> Delete</span>';
                    resourceContent += '<button class="edit-resource-btn" title="Edit Resource"><i class="fas fa-pencil-alt"></i></button>';
                    
                    if (resource.time) {
                        resourceContent += `
                            <span class="resource-time">${resource.time}</span>
                        `;
                    }
                    
                    resourceContent += `</div></div>`;
                    
                    if (resource.screenshot) {
                        resourceContent += `
                            <img src="${resource.screenshot}" alt="Screenshot" class="resource-screenshot">
                        `;
                    }
                    
                    resourceItem.innerHTML = resourceContent;
                    resourceList.appendChild(resourceItem);
                    
                    // Add event listeners
                    const deleteBtn = resourceItem.querySelector('.resource-delete');
                    deleteBtn.addEventListener('click', () => deleteResource(topicId, resourceIndex));
                    
                    const editBtn = resourceItem.querySelector('.edit-resource-btn');
                    editBtn.addEventListener('click', () => openEditResourceModal(topicId, resourceIndex));
                });
            } else {
                resourceList.innerHTML = `
                    <div class="empty-state" style="padding: 1rem; text-align: center;">
                        <p>No entries yet</p>
                    </div>
                `;
            }
            
            topicCard.appendChild(topicHeader);
            topicCard.appendChild(resourceList);
            topicsContainer.appendChild(topicCard);
        });
    }

    // Open the topic modal
    function openTopicModal() {
        topicForm.reset();
        topicModal.style.display = 'flex';
        
        // Debug to verify the modal is shown
        console.log('Topic modal opened, display style:', topicModal.style.display);
        
        // Focus on the input field after a short delay
        setTimeout(() => {
            document.getElementById('topic-title').focus();
        }, 100);
    }

    // Open the edit resource modal
    function openEditResourceModal(topicId, resourceIndex) {
        const resource = state.data[state.selectedDay][topicId].resources[resourceIndex];
        
        // Set the form to edit mode
        linkForm.dataset.mode = 'edit';
        linkForm.dataset.topicId = topicId;
        linkForm.dataset.resourceIndex = resourceIndex;
        
        // Pre-fill the form with existing data
        document.getElementById('link-topic-id').value = topicId;
        document.getElementById('link-title').value = resource.title || '';
        document.getElementById('link-url').value = resource.url || '';
        document.getElementById('link-button-text').value = resource.buttonText || '';
        document.getElementById('link-description').value = resource.description || '';
        document.getElementById('link-time').value = resource.time || '';
        document.getElementById('link-screenshot').value = resource.screenshot || '';
        
        // Update time picker display if there's a time value
        if (resource.time) {
            timeDisplay.textContent = resource.time;
        } else {
            timeDisplay.textContent = 'Select time';
        }
        
        // Change modal title and button text
        document.querySelector('#link-modal h3').textContent = 'Edit Resource';
        document.querySelector('#link-modal .submit-btn').textContent = 'Save Changes';
        
        // Open the modal
        linkModal.style.display = 'flex';
        
        // Focus on the title input
        setTimeout(() => {
            document.getElementById('link-title').focus();
        }, 100);
    }

    // Handle link form submission (both for adding and editing)
    function handleLinkSubmit(e) {
        e.preventDefault();
        
        const topicId = document.getElementById('link-topic-id').value;
        const linkTitle = document.getElementById('link-title').value.trim();
        const linkUrl = document.getElementById('link-url').value.trim();
        const linkButtonText = document.getElementById('link-button-text').value.trim() || 'Link';
        const linkDescription = document.getElementById('link-description').value.trim();
        const linkTime = document.getElementById('link-time').value.trim();
        const linkScreenshot = document.getElementById('link-screenshot').value.trim();
        
        if (!linkTitle) return;
        
        // Create resource object
        const resourceData = {
            title: linkTitle,
            url: linkUrl,
            buttonText: linkButtonText,
            description: linkDescription,
            time: linkTime,
            screenshot: linkScreenshot,
            addedAt: new Date().toISOString()
        };
        
        // Check if editing or adding
        if (linkForm.dataset.mode === 'edit') {
            const resourceIndex = parseInt(linkForm.dataset.resourceIndex, 10);
            
            // Preserve the original creation date
            const original = state.data[state.selectedDay][topicId].resources[resourceIndex];
            if (original && original.addedAt) {
                resourceData.addedAt = original.addedAt;
            }
            
            // Add edit timestamp
            resourceData.editedAt = new Date().toISOString();
            
            // Update the resource
            state.data[state.selectedDay][topicId].resources[resourceIndex] = resourceData;
        } else {
            // Add new resource
            state.data[state.selectedDay][topicId].resources.push(resourceData);
        }
        
        // Save and update UI
        saveData();
        renderTopics();
        closeAllModals();
        
        // Reset form mode
        linkForm.dataset.mode = 'add';
        delete linkForm.dataset.resourceIndex;
    }

    // Open the link modal for adding a new resource
    function openLinkModal(topicId) {
        linkForm.reset();
        linkForm.dataset.mode = 'add';
        document.getElementById('link-topic-id').value = topicId;
        
        // Reset time picker display
        timeDisplay.textContent = 'Select time';
        state.timePicker.selectedHour = null;
        state.timePicker.selectedMinute = null;
        
        // Set modal back to add mode
        document.querySelector('#link-modal h3').textContent = 'New Resource';
        document.querySelector('#link-modal .submit-btn').textContent = 'Add';
        
        linkModal.style.display = 'flex';
        
        // Focus on the input field after a short delay
        setTimeout(() => {
            document.getElementById('link-title').focus();
        }, 100);
    }

    // Close all modals
    function closeAllModals() {
        topicModal.style.display = 'none';
        linkModal.style.display = 'none';
        closeTimePicker();
    }

    // Handle topic form submission
    function handleTopicSubmit(e) {
        e.preventDefault();
        
        const topicTitle = document.getElementById('topic-title').value.trim();
        
        if (!topicTitle) return;
        
        // Create new topic
        const topicId = Date.now().toString();
        
        // Initialize day data if not exists
        if (!state.data[state.selectedDay]) {
            state.data[state.selectedDay] = {};
        }
        
        // Add new topic
        state.data[state.selectedDay][topicId] = {
            title: topicTitle,
            resources: [],
            createdAt: new Date().toISOString()
        };
        
        // Save and update UI
        saveData();
        renderCurrentWeek();
        renderTopics();
        closeAllModals();
    }

    // Delete a topic
    function deleteTopic(topicId) {
        if (confirm('Delete this topic and all its resources?')) {
            delete state.data[state.selectedDay][topicId];
            
            // Clean up empty days
            if (Object.keys(state.data[state.selectedDay]).length === 0) {
                delete state.data[state.selectedDay];
            }
            
            // Save and update UI
            saveData();
            renderCurrentWeek();
            renderTopics();
        }
    }

    // Delete a resource
    function deleteResource(topicId, index) {
        if (confirm('Delete this resource?')) {
            state.data[state.selectedDay][topicId].resources.splice(index, 1);
            
            // Save and update UI
            saveData();
            renderTopics();
        }
    }

    // Change week (prev/next)
    function changeWeek(direction) {
        const newWeekStart = new Date(state.currentWeekStart);
        newWeekStart.setDate(newWeekStart.getDate() + (direction * 7));
        
        state.currentWeekStart = newWeekStart;
        renderCurrentWeek();
        renderWeekDisplay();
    }
}); 