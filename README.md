# React Native Australian Pilot Quiz

A React-Native Android/web app that is a quiz aimed at RPL/PPL/CPL pilots.

## Adding a new level/area

Manually in JSON

## Adding a new question

Run `npm run add-question` and follow the prompts.

## Development

    npm i
    npm start -> open http://localhost:8081

### Android

    npm run build
    npm run build:android

### Web

    npm run build:web

Upload `dist`

(From Windows PowerShell) Use ADB to deploy:

    adb install \\wsl.localhost\Ubuntu\home\$USER\react-native-aus-pilot-quiz\android\app\build\outputs\apk\debug\app-debug.apk
