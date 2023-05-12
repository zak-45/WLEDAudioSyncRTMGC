# Music autotagging with Discogs Effnet
Realtime music autotagging based on the Discogs taxonomy (400 subgenre tags). 
Sending topTags via OSC.

This is a 'hack' of the actual Essentia.js demo :


https://github.com/MTG/essentia.js/tree/819c00e8f034dc709e3d330ed8ac9ed37dfdb767/examples/demos/discogs-autotagging

```

- Replaced YT by device audio capture.
- Should work on SmartPhone, Tablet,  PC computer ... every modern device with Chromium Based Browser.
- Send top 5 predictions to OSC server via UDP. 
- Designed for easy integration to WLEDAudioSync Chataigne Module but should work with any OSC server.

```

Node.js version used : 18.6. Dev made with vue.js & vite.js. Using osc.js (2.4.4) for OSC communication.

## To start project locally (Dev version):
- download all to your nodejs work folder
- `cd server`
- `npm install` for the first time
- `npm run dev`
- `cd ../views`
- `npm install` for the first time
- `npm run dev`

## To build for deployment:
- `cd ../views`
- `npm run build`

