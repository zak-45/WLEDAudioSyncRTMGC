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
![image](https://github.com/zak-45/WLEDAudioSyncRTMGC/assets/121941293/44a77b46-2882-45e6-8bc6-4cc054bc6876)


Node.js version used : 18.6. Dev made with vue.js & vite.js. Using osc.js (2.4.4) for OSC communication.

## Easy start :
https://github.com/zak-45/WLEDAudioSyncRTMGC/releases
```
Take your binary from release file depend of your OS, run it ! 
This is a portable nodejs version with all included (made with pkg). 
```
Once running, open your browser and go to https://localhost:8000/WLEDAudioSyncRTMGC/
```
You need to accept the self-signed certificate. 
If you want to customize it, you need to download the source, generate a certificate 
and copy the .key and .cert file under security folder.
```
## To start project locally (Dev version):
- download all to your nodejs work folder

- `cd server`
- `npm install` for the first time
- `npm run dev`
--------------------------------
- `cd views`
- `npm install` for the first time
- `npm run dev`

## To build for deployment:
- `cd views`
- `npm run build`

## Nota:
```
Default server port : 8000
Default OSC ip address : 127.0.0.1
Default OSC port : 12000

Can be changed via Env variables.
Good to set ENV_NODE=Production for better, increased performance before run the app.
```
