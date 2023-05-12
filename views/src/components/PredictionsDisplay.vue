<template>
    <div id="container">	
        <div id="info-message" style="color: red;">
        </div>    
        <div id="waiting-message" v-show="showWaitingMessage">
            <p>
                Waiting for stream to become active... It will start shortly.
            </p>
        </div>
        <div v-show="receivedPredictions" id="tags-container">
            <transition-group name="slide-fade">
                <div v-for="set in predictions" :key="set.id" :id="set.id">
                    <prediction-set :tags="set.tags" v-show="set.tags"></prediction-set>
                </div>
            </transition-group>
        </div>
    </div>
</template>

<script>
import eventBus from "../event-bus";
import { EffnetDiscogsLabels } from "../audio/labels";
import { v4 as uuidv4 } from 'uuid';
import PredictionSet from './PredictionSet.vue';

async function postJSON(data) {
	
	if (import.meta.env.DEV) {
	   var posturl = "https://localhost:8000/osc/msg";
	}
	if (import.meta.env.PROD) {
		var posturl = "/osc/msg";
	}
	
	let myid = localStorage.getItem('WLEDuniqueId');
	let mydata = JSON.stringify(data);
	 
	data = '{"WLEDAudioSync":{"id":"'+myid+'","RTMGCDiscogs":{ "TimeStamp":"'+	
			Math.floor(Date.now() / 1000) + '","Predictions":' + mydata + '}}}';
	
	data = JSON.parse(data);

	try {		
			const response = await fetch(`${posturl}`, {
			  method: "POST",
			  headers: {
				"Content-Type": "application/json"
			  },
			  body: JSON.stringify(data),
			});
		
		} catch (error) {
		
			// TypeError: Failed to fetch
			console.log('There was an error', error);	
			document.getElementById("info-message").innerHTML = 'ERROR: Not able to POST data to Server: ' + error;
	}
}

function normalizeActivations (activationsMap) {
    // normalize activation values
    const activationsArray = activationsMap.map( t => t.score );
    const activationMax = activationsArray.reduce( (a, b) => {
        return Math.max(a, b);
    }, 0);
    const activationMin = activationsArray.reduce( (a, b) => {
        return Math.min(a, b);
    }, 1);

    const activationsRange = activationMax - activationMin;

    return activationsMap.map( tag => {
        const normActivation = (tag.score - activationMin) / activationsRange;
        return {
            parentGenre: tag.parentGenre,
            name: tag.name,
            score: normActivation
        };
    });
}

export default {
    components: {PredictionSet},
    data () {
        return {
            predictions: Array(10).fill(null),
            receivedPredictions: false,
            showWaitingMessage: false,
			viewPred: false,
			postPred: false 
        }
    },
    created () {
        this.predictions = this.predictions.map( _ => { return {id: uuidv4(), val: null} });

        eventBus.$on('model-predictions', (predictions) => {
            if (!this.receivedPredictions) this.receivedPredictions = true;
            

            // activations array --> map to corresponding tags
            let scoreTagMap = predictions.map( (score, index) => {
                const [genre, subgenre] = EffnetDiscogsLabels[index].split('---');
                return {
                    parentGenre: genre,
                    name: subgenre,
                    score: score 
                } 
            });

            scoreTagMap.sort( (a, b) => b.score - a.score); // descending sort

            // grab top 5
            let topTags = scoreTagMap.slice(0, 5);
            // normalize top 5
            topTags = normalizeActivations(topTags);
			
			// send to OSC if client request
			if (this.postPred) {postJSON(topTags);}			
			// view or not Predictions
			if (this.viewPred){
				this.predictions.pop();
				this.predictions.unshift({
					tags: topTags,
					id: uuidv4()
				});
			};
        });

        let timeoutRef;
        eventBus.$on('received-stream', () => {
            // show wait message if stream hasn't become active after 1sec
			if (!sessionStorage.getItem('isLive')){
				timeoutRef = setTimeout(() => this.showWaitingMessage = true, 1000);
			}            
        });
        eventBus.$on('stream-active', () => {
            clearTimeout(timeoutRef);
            this.showWaitingMessage = false;
        });
		eventBus.$on('show-predictions' , () => {
			if (this.viewPred === true){
				this.viewPred = false;
				//this.predictions=Array(10).fill(0);
				} else {
				this.viewPred = true;
			};
		});
		eventBus.$on('post-predictions' , (tosend) => {
			if (tosend){
				this.postPred = true;
				} else {
				this.postPred = false;
			};
		});
    }
}
</script>

<style>
#container {
    flex: 25%;
}


#waiting-message {
    display: flex;
    flex-direction: column;
    justify-content: start;
    height: 10%;
}

#tags-container {
    /* display: flex;
    flex-direction: column;
    justify-content: space-evenly; */

    height: 80%;
    margin: none;
    position: relative;
    overflow: hidden;
}

#tags-container::after {
    background-image: linear-gradient(180deg, transparent, rgba(var(--color-bg),0.8) 90%);
    z-index: 1;
    height: 100vh;
    content: " ";
    width: 100vw;
    position: absolute;
    top: 0px;
    left: 0px;
}

.slide-fade-enter-active {
  transition: all .5s ease-in-out;
}

.slide-fade-enter-from {
  transform: translateY(-100px);
  opacity: 0;
}

.slide-fade-move {
  transition: transform .5s ease-in-out;
}
</style>