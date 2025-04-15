# Weekly Learning Tracker

A minimalistic web application to track what you learn each day of the week. This tool helps you organize your learning resources by topics and days, making it easy to present your progress during weekly meetings with your teacher.

## Features

- **Weekly View**: Navigate between weeks to see your learning progress over time
- **Topic Management**: Create, view, and delete learning topics for each day
- **Resource Tracking**: Add resources with links, descriptions, time commitments, and screenshots
- **Responsive Design**: Works on desktop and mobile devices
- **Local Storage**: All data is stored locally in your browser

## How to Use

### Getting Started

1. Open `index.html` in a web browser
2. Navigate to the current week or use the arrow buttons to move between weeks
3. Click on a day to view or add topics

### Adding a Topic

1. Select a day
2. Click the "Add Topic" button
3. Enter a title for your topic (e.g., "JavaScript Fundamentals")
4. Click "Add Topic"

### Adding Resources to a Topic

1. Within a topic card, click "Add Resource"
2. Fill in the following information:
   - URL (optional): Link to the resource
   - Title: Name of the resource
   - Description (optional): What you learned from this resource
   - Time Commitment (optional): How much time you spent
   - Screenshot URL (optional): A visual representation of what you learned
3. Click "Add Resource"

### Deleting Items

- To delete a topic, click the trash icon on the topic card
- To delete a resource, click the "Delete" button next to the resource

## Installation

This is a client-side application with no backend dependencies. To run it:

1. Download or clone the repository
2. Open `index.html` in any modern web browser

You can also host it on any static web hosting service like GitHub Pages, Netlify, or Vercel.

## Technologies Used

- HTML5
- CSS3
- JavaScript (ES6+)
- Font Awesome for icons
- LocalStorage API for data persistence

## Customization

You can easily customize the application by:

- Modifying `styles.css` to change colors, fonts, or layout
- Extending `script.js` to add more features or change behavior
- Editing `index.html` to add more elements or change the structure 