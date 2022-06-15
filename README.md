# Issue Tracker


## Overview

_A backend for an issue tracker app._

<br />

## Links

<p>
<a href="https://github.com/AngeliqueDF/issue-tracker">GitHub repo</a>
</p>

<br />

## How to run the project

To run the project locally:

1. `git clone https://github.com/AngeliqueDF/issue-tracker-challenge.git MY-FOLDER-NAME`
2. `cd MY-FOLDER-NAME`
3. `npm install`
4. `npm start`
5. `echo "PORT=\nMONGODB_URI=\n" > .env`
6. Enter each value for the `PORT` and `MONGODB_URI` (a MongoDB database).
7. visit `http://localhost:{PORT}`

<br />

## Features

- Processes requests to manage issues (view, create, edit, delete).

## Technologies

- Node
- `express`
- `mongoose`
- `chai`
- `mocha`

<br />

## Description

This app lets users focus on their product's issues. It's my version of the Issue Tracker quality assurance challenge on freeCodeCamp.

### How I built this project

The backend is an `express` server, built with TDD, tested with `mocha` and `chai`. It's structured on the challenge's boilerplate which taught me a different way to write an Express app.

I added minimal security measures with `helmet`, `mongoose` validation, and a sanitizer.

## Status

**The code meets the challenge requirements but needs security improvements**. I also plan on adding a frontend with routing.

### Planned changes

- [ ] Add a frontend.
- [ ] Improve security.

## Sources

- [Issue Tracker quality assurange challenge by freeCodeCamp.](https://www.freecodecamp.org/learn/quality-assurance/quality-assurance-projects/issue-tracker)

## Author

- [@AngeliqueDF on GitHub.](https://github.com/AngeliqueDF)
- [Visit my website.](https://adf.dev)
- [View my Frontend Mentor profile.](https://www.frontendmentor.io/profile/AngeliqueDF)
