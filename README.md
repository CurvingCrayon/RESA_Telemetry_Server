# RESA Telemetry Server

## Installation
Download NodeJS version 12.14.1 from https://nodejs.org/download/release/v12.14.1/
Run powershell in this repo's root folder
```
npm install
```

## Development
Run the following in different power shell windows
```
npm start
npm run dev
```
When the last command is run a browser window will open which directs to localhost:3000.
Any changes made to the front end will automatically be changed in the browser window that's opened.
Changes made to the back end will require manual restart using the first command.

## Build
After any changes are made to the front end, a build must be performed prior to launching the server
```
npm run build
```

## Launch
```
npm start
```
Navigate to localhost in your browser