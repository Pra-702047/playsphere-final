# Installation Guide (For Users)

PlaySphere offers a seamless installation process utilizing a custom, persistent UI prompt.

## Installation Flow
1. **Detection:** When a user visits PlaySphere on a supported browser, the browser fires the `beforeinstallprompt` event.
2. **Capture:** The `PWARegister` component intercepts this event, preventing the default browser behavior.
3. **Prompt:** A custom "Install PlaySphere" popup slides into view at the bottom left of the screen.
4. **Action:** The user clicks "Install".
5. **Completion:** The OS prompts for confirmation, and PlaySphere is added to the home screen/app drawer as a standalone application.