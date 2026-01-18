# Nenvitian Level Editor
A simple grid manipulation program based in electron.
## Features
- Tile randomizer.
- Auto-tile system.
- JSON import and export.
- Checkpointing.
## Controls
- *Movement:* Arrow keys, Page Up (Number Pad 9), and Page Down (Numberpad 3)
  - *In "Editor Mode":*
    - W, A, S, and D will move **exactly one chunk**.
    - Home (Numberpad 7) will engage the tile randomizer.
    - End (Numberpad 1) will engage "smart tiles".
    - Insert (Numberpad 0) will disengage both "smart tiles" and "noisy tiles" (the tile randomizer)
    - The plus symbol on the number pad will add a layer if the maximum number of layers has not been exceeded.
    - The subtract symbol on the number pad will remove the current layer unless it is the only layer.
  - *Out of "Editor Mode":*
    - Home will set a high camera glide.
    - End will set a low camera glide
    - Insert insert will practically remove camera glide.
  - *In Both:*
    - Numberpad keys 2, 4, 8, 6 and their corresponding arrow keys will provide basic direction.
    - Numberpad keys 9 and 3 (PgUp and PgDn) will be zoom control.
    - Numberpad key 5 will always return the user to origin.
    - *Assuming no issues have occured when loading* The regular number row keys (1 through 0) can act as checkpoints. (see Checkpoints)
- *Editing:*
  1. Select a tile by clicking on its image when "Editor Mode" is engaged.
  2. Place the tile by clicking in the chunk that the camera is in. Engage the grid to avoid trouble identifying the boundaries.
  3. To delete a tile, select the tile '0' (it will be a completely white tilespace), and then begin to click on the spaces on which you would like to remove.
### Checkpointing
In order to save a checkpoint (which will save location and zoom), hold any of the number keys for 3+ seconds and then release.
In order to return to a checkpoint, press that number key once.
**Numberpad 5 is a constant and will can not be changed or reset.**
## Important Notes
1. This is not the final version of this application, so it will feel off and be difficult to manage at times.
2. Some functionalities *may look present* but are not yet implemented. One such example would be the *Palette* button.
3. Any user without a numberpad on their keyboard will be advised not to use this program, as some of the controls are numberpad-specific. The program is still accessible to them, but full functionality is not gauranteed.
## Used Libraries
1. p5Js
2. Electron
3. miscellaneous (*There may be other libraries present, but the main ones were p5.js and Electron*)
## Running the Level Editor
There are three available packages: `*.nutpkg`, `*.exe`, and `*win32-x64.zip`. All three of them can be found in the `/out` folder.
This repo will have the latest versions of these packages, it is recommended to use them instead of cloning this repo.
If one does wish to clone the repo, follow the commands:
```bash
npm install
npm run start
```
# Feedback or Suggestions
If one is willing to provide feedback or suggest a new implementation, please email me at nenvitcodes@outlook.com.
You may refer to me as "Nenvit", "NenvitCodes", or "M.D.".
