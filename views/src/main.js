import { createApp } from 'vue'
import App from './App.vue';
import initAudio from './audio/manager.js';


// test if unique id exist
let WLEDuniqueId = localStorage.getItem('WLEDuniqueId');

// if not, generate and stock
if (!WLEDuniqueId) {
  // generate from actual date and random number
  WLEDuniqueId = Date.now().toString(36) + Math.random().toString(36).substr(2, 5);

  // stock it using API Web Storage
  localStorage.setItem('WLEDuniqueId', WLEDuniqueId);
}

initAudio();
createApp(App).mount('#app');
