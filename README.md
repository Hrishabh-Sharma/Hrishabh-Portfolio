# Hrishabh Portfolio

A lightweight, dependency-free personal portfolio. It uses plain HTML, CSS and JavaScript so `index.html` can be opened directly in a browser or hosted on GitHub Pages.

## Run locally

### Easiest
Double-click `index.html`.

### Optional VS Code workflow
Use any static-server extension if you prefer live reload.

## Edit your details

Edit only:

`src/data/profile.js`

That file controls the name, intro, education, skills, projects, experience, resume path, contact information and social links.

## Replace the resume

Replace:

`public/assets/resume.pdf`

with your new PDF using the same filename.

## Add a profile image

Put an image in `public/assets/`, then add its relative path to `profile.js` and wire it into the hero if desired.

## Deploy to GitHub Pages

Upload the whole project to a GitHub repository. Because this is a static site with relative asset paths, GitHub Pages can serve it without a build step.
