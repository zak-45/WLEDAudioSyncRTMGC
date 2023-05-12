<template>
    <header id="header-wrapper" class="d-flex justify-content-around text-muted font-weight-light container-fluid">

	    <div id="essentia-models" class="d-flex flex-column justify-content-center align-items-center header-block" 
            @mouseover="essentiaModelsHovered = true" @mouseleave="essentiaModelsHovered = false">
            <p :style="essentiaModelsHovered ? {fontWeight: 'bold', color: '#afafaf'} : {}">WLEDAudioSync</p>
        </div>
	    <div id="essentia-models" class="d-flex flex-column justify-content-center align-items-center header-block" 
            @mouseover="essentiaModelsHovered = true" @mouseleave="essentiaModelsHovered = false">
				<p id="my-id" :style="essentiaModelsHovered ? {fontWeight: 'bold', color: '#afafaf'} : {}">id: </p>				
				<button id="bg-color" @click="changeColor()" >Color</button>
		</div>		
        <div id="essentia-models" class="d-flex flex-column justify-content-center align-items-center header-block" 
            @mouseover="essentiaModelsHovered = true" @mouseleave="essentiaModelsHovered = false">
            <p>Made with</p> 
            <a href="https://essentia.upf.edu/models.html" target="_blank">
                <essentia-logo :isHovered="essentiaModelsHovered"></essentia-logo>
            </a>
            <p :style="essentiaModelsHovered ? {fontWeight: 'bold', color: '#afafaf'} : {}">Models</p>
        </div>
    </header>
</template>

<script>
import EssentiaLogo from './EssentiaLogo.vue';

export default {
    components: { EssentiaLogo },
    data () {
        return {
            essentiaModelsHovered: false,
			bgColor : true
        }
    },
    methods: {
		changeColor () {		
			if (this.bgColor) {
				document.querySelector('body').style.backgroundColor = "whitesmoke";
				document.querySelector('#header-wrapper').style = "background-color:white";	
				this.bgColor = false;
			} else { 
				document.querySelector('body').style.backgroundColor = "black";
				document.querySelector('#header-wrapper').style = "background-color:black";
				this.bgColor = true;
			}
		}
	}
}
</script>

<style lang="scss" scoped>
    @import '../assets/styles/globals.scss';

    #header-wrapper {
        position: absolute;
        top: 0vh;
		width: 35%;
        background-color: $dark;
        z-index: 10;
    }

    .header-block {
        margin-bottom: 0.5rem;
    }

    .header-block p {
        margin: auto!important;
    }

    .header-block a {
        margin: auto 0;
    }

    .header-block img {
        margin-left: 2rem;
        border-radius: 5px;
    }

    #essentiajs-link {
        height: 2.5rem;
    }

    #mtg-link {
        height: 3.5rem;
    }

    #essentia-models {
        margin-top: .5rem;
        &:hover {
            cursor: pointer;
        }
    }
</style>