<template>
    <section id="side-column">
        <header class="side-column-item">
			<h1>Music Genre Autotagging</h1>
            <h3>with <a id="discogsresnet" href="https://essentia.upf.edu/models.html#discogs-effnet" target="_blank">DiscogsResNet</a></h3>
        </header>
        <div class="side-column-item">
            <p>
			Use Live Audio for Mic or Computer audio or upload your own file to get real-time music genre predictions.
            </p>
            <p class="note" style="text-align:center;">Note: Works only in Chromium-based browsers</p>
			<p>
			<span class="hover">
				<label for="ip-address">OSC IP Address :</label>
				<input type="text" id="osc-ipaddress" name="ip-address" value="localhost" size="16" style="border: 2px solid green; border-radius: 4px;" readonly>
				<a class="tooltip">IP address of the OSC Server </a>
			</span>
			<span class="hover">
				<label for="port">Port :</label>
				<input type="number" id="osc-port" name="port" value="8080" min="1" max="65535" size="6" style="border: 2px solid green; border-radius: 4px;" readonly>
				<a class="tooltip"> Port number of the OSC Server </a>
			</span>
			<a class="hover note">
				<input type="checkbox" id="osc-check" name="osc-check" @change="checkOSC()" >
				<label for="osc-check"> Send</label>
				<a class="tooltip" size="40">Check to send data to OSC via UDP </a>
			</a>
			</p>
        </div>		
		<div class="side-column-item hover">
			<button id="live-button" class="btn-blinker" style="cursor: progress">Idle</button>
			<a>■</a>
			<button id="show-pred" style="cursor: pointer" @click="viewPredictions()">Toogle View</button>
			<br><br><br>
		</div>
        <div class="control side-column-item">
            <custom-toggle @change="(method) => selectedMethod = method"></custom-toggle>
            <input 
                type="button" 
                id="lv-url-box" 
                class="search-control my-auto"
                placeholder="Live Audio"
                v-show="selectedMethod == 'live'"
				@click="startCapture"
				value="Start/Stop Capture"
				style="cursor: pointer"
            >
            <input 
                type="file" 
                v-show="selectedMethod == 'file'"
                id="audio-file-upload"
                @change="handleUpload"
            >
            <label 
                for="audio-file-upload"
                class="search-control my-auto"
                v-show="selectedMethod == 'file'"
            >Choose an audio file from your computer</label>
            <button 
                @click="handleButton" 
                :disabled="streamButtonDisabled"
                class="search-control"
                :class="{'control-is-active': !streamButtonDisabled, 'btn-blinker': btnShouldBlink }"
                id="start-streaming-btn"
            >{{ buttonPrompt }} streaming</button>
        </div>
        <div class="control side-column-item">
            <audio id="user-media" :src="streamingURL" controls ref="audioElem" crossorigin="anonymous"
            @ended="handleStreamEnded" @pause="handlePause" @play="handlePlay" 
            @loadeddata="handleLoadedData"></audio>
        </div>
    </section>
</template>

<script>
import EventBus from '../event-bus.js';
import CustomToggle from './CustomToggle.vue';

console.log(import.meta.env.BASE_URL);

async function OSCInfo () {

	if (import.meta.env.DEV) {
	   var geturl = "https://localhost:8000/osc/info/";
	}
	if (import.meta.env.PROD) {
		var geturl = "/osc/info/";
	}
	const response =  await fetch(`${geturl}`);
	const OSCData =  await response.text();
	let oscInfo = OSCData.split('-');
	document.getElementById("osc-ipaddress").value = oscInfo[0];
	document.getElementById("osc-port").value = oscInfo[1];
}

async function SRVInfo () {

	if (import.meta.env.DEV) {
	   var geturl = "https://localhost:8000/info/";
	}
	if (import.meta.env.PROD) {
		var geturl = "/info/";
	}
	const response =  await fetch(`${geturl}`);
	const SRVData =  await response.text();
	document.getElementById("info-message").innerHTML = SRVData;
}


export default {
    components: {CustomToggle},
    data () {
        return {
            buttonPrompt: 'Start',
            fileURL: '',
            streamingURL: '',
            audioElem: null,
            selectedMethod: 'live',
			isRecording: false
        }
    },
	mounted:function(){
        OSCInfo () //method1 will execute at pageload
	},
    methods: {	
		viewPredictions () {
			EventBus.$emit('show-predictions');
		},
		checkOSC () {
			let isChecked = document.getElementById("osc-check").checked;
			if (isChecked) {	
				EventBus.$emit('post-predictions', true);
				document.getElementById("my-id").innerHTML = 'id: ' + localStorage.getItem('WLEDuniqueId');
				OSCInfo();
			} else {
				EventBus.$emit('post-predictions', false);
			}			
		},		
		changeColor (bgColor) {		
			if (this.bgColor) {
				document.querySelector('body').style.backgroundColor = "white";
				document.querySelector('#footer-wrapper').style = "background-color:white";	
				this.bgColor = false;
			} else { 
				document.querySelector('body').style.backgroundColor = "black";
				document.querySelector('#footer-wrapper').style = "background-color:black";
				this.bgColor = true;
			}
		},		
		startCapture () {
		
			if (this.isRecording === true){this.stopCapture(); return};
			
			document.getElementById("live-button").innerHTML = 'Capturing...';
			document.getElementById("live-button").style.borderWidth="thick";
			document.getElementById("live-button").style.borderColor="red";			
			var liveaudio = document.querySelector('#user-media');
			
			if (navigator.mediaDevices.getUserMedia) {
			  console.log('getUserMedia supported.');
			  const constraints = { audio: true };
			  
			  let onSuccess = function(stream) {
				console.log('We define live audio Stream');
				liveaudio.srcObject = stream;
				liveaudio.volume = 0;
			  }
			  
			  let onError = function(err) {
				console.log('The following error occured: ' + err);
				document.getElementById("error-message").innerHTML = 'ERROR: on live stream !' + err;
			  }
			  
			  navigator.mediaDevices.getUserMedia(constraints).then(onSuccess, onError);
			  this.isRecording = true;
			  sessionStorage.setItem('isLive', true);
			  
			} else {			
			
				console.log('getUserMedia not supported on your browser!');
				document.getElementById("error-message").innerHTML = 'ERROR: getUserMedia not supported on your browser!';
			}
			
			console.log('End startCapture');           
		},
		stopCapture () {
			console.log('stop capture');
			this.handleStreamEnded();
			this.isRecording = false;
			sessionStorage.removeItem('isLive');			
			document.getElementById("live-button").style.borderWidth="thin";
			document.getElementById("live-button").style.borderColor="blue";
			setTimeout(window.location.reload(), 1000);
		},
        handleButton () {
            switch (this.buttonPrompt) {
                case 'Start':
                    this.startStream();
                    this.buttonPrompt = 'Stop';
                    console.log('button: Start streaming');
                    break;
                case 'Resume':
                    this.$refs.audioElem.play();
                    this.buttonPrompt = 'Stop';
                    break;
                case 'Stop':
                    this.streamingURL = '';
                    console.log('button: Stop streaming');
                    break;
            }
        },
        startStream () {
            this.$refs.audioElem.play();
            let stream = this.$refs.audioElem.captureStream();
			console.log(stream);
            EventBus.$emit('received-stream', stream);
        },
        handleStreamEnded () {
            console.log('<audio> stream ended');
            this.buttonPrompt = 'Start';
            EventBus.$emit('stop-audio');
        },
        handlePause () {
            console.log('<audio> pause');
            this.buttonPrompt = 'Resume';
            EventBus.$emit('pause');
        },
        handlePlay () {
            if (this.buttonPrompt !== 'Stop') {
                // if not already streaming, trigger it
                this.startStream();
				console.log('if not already streaming, trigger it')
            }
            console.log('<audio> play')
            this.buttonPrompt = 'Stop';
			
			EventBus.$emit('play');
            
        },
        handleLoadedData () {
            console.log('<audio> loaded data');
            EventBus.$emit('loaded-data');
        },
        handleUpload (ev) {
            let selFiles = ev.target.files;
            if (selFiles.length == 0) return;
            if (selFiles.length < 1) {
                // display "only single file allowed" message
                console.error('Multiple file upload not allowed!');
                return;
            }

            this.fileURL = URL.createObjectURL(selFiles[0]);
        }
    },
    computed: {
        streamButtonDisabled () {
			if (this.isRecording === true) return false;
            if (this.streamingURL === '') return true;

            return false;
        },
        btnShouldBlink () {
            return !this.streamButtonDisabled && (this.buttonPrompt === 'Start' || this.buttonPrompt === 'Resume');
        }
    },
	
    watch: {
        fileURL (val, _) {
            this.streamingURL = val;
        },
        streamingURL (val, oldVal) {
            if (oldVal === '') return;
            EventBus.$emit('stop-audio');
            this.buttonPrompt = 'Start';
        }
    }
}
</script>

<style lang="scss">


	.hover {
	  position: relative;
	  top: 50px;
	  left: 50px;
	}

	.tooltip {
	  /* hide and position tooltip */
	  top: -100px;
	  background-color: black;
	  color: white;
	  border-radius: 5px;
	  opacity: 0;
	  position: absolute;
	  -webkit-transition: opacity 0.5s;
	  -moz-transition: opacity 0.5s;
	  -ms-transition: opacity 0.5s;
	  -o-transition: opacity 0.5s;
	  transition: opacity 0.5s;
	}

	.hover:hover .tooltip {
	  /* display tooltip on hover */
	  opacity: 1;
	}

    div.control {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: start;
        font-size: 0.9rem;
    }

    #side-column {
        /* display: flex;
        flex-direction: column;
        justify-content: start; */
        flex: 1;
        margin: 3em 0;
    }

    #discogsresnet {
        text-decoration: none;
        color: inherit;
        &:hover {
            color: var(--action-color);
        }
    }

    .search-control {
        border-radius: var(--border-radius);
        width: 100%;
        padding: .5em;
    }

    .side-column-item {
        width: 100%;
        padding: 0 1em;
        margin: 3em 0;
    }

    audio {
        width: 100%;
    }

    .control > * {
        flex-grow: 0;
    }

    button, label[for="audio-file-upload"] {
        background-color: rgb(var(--color-primary));
        border-width: 0px;
        border-color: rgba(var(--color-primary), 0.5);
        border-bottom-width: .25rem;
        color: rgb(var(--color-bg));
        box-shadow: var(--btn-shadow);
        font-size: inherit;
        transition: border-bottom .3s ease-in-out;
    }

    button:hover, label[for="audio-file-upload"]:hover {
        background-color: rgba(var(--color-primary), 0.75);
        cursor: pointer;
        color: black;
    }

    button:disabled {
        cursor: default;
        color: rgb(var(--color-grey));
        background-color: rgb(var(--color-primary));
    }

    button:active, label[for="audio-file-upload"]:active {
        color: var(--color-primary);
        background-color: rgba(var(--color-primary), 0.5);
        box-shadow: none;
    }

    .control-is-active {
        border-bottom-color: var(--action-color);
        border-bottom-style: solid;
    }

    #lv-url-box {
        border-width: 0px;
        font-size: inherit;
        font-weight: 300;
        font-style: italic;
    }

    #audio-file-upload {
        height: 0;
        padding: 0;
        opacity: 0;
    }

    label[for="audio-file-upload"] {
        text-align: left;
        color: rgb(var(--color-grey));
    }

    #start-streaming-btn {
        font-weight: bold;
    }

    .my-auto {
        margin-top: 0.5rem;
        margin-bottom: 0.5rem;
    }

    .btn-blinker {
        animation: blinking 750ms ease infinite alternate
    }

    p {
        text-align: left;
        &.note {
            color: rgb(var(--color-grey));
        }
    }

    @keyframes blinking {
        from{
            background-color: rgb(var(--color-primary));
            color: rgb(var(--color-bg));
            box-shadow: var(--btn-shadow);
        }
        to{
            background-color: rgba(var(--color-primary), 0.8);
            color: black;
            box-shadow: none;
        }
    }
</style>