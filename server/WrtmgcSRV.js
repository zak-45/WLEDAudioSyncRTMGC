const express = require('express');
const path = require('path');
const bodyParser = require('body-parser')
const process = require('process');
const app = express();
const https = require('https');
const fs = require('fs');
const osc = require("osc");

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
  req.headers['Content-Type'] = 'application/json';
  next();
});

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/', express.static('public'));

// provide SRV informations
app.get('/info/',  async function (req, res) {
    try {

		let srvConfig = JSON.stringify(process.config);
		let srvEnv = JSON.stringify(process.env);
		let srvMem = JSON.stringify(process.memoryUsage());
		let srvRessource = JSON.stringify(process.resourceUsage());		
		let srvData = "["+ srvRessource +"," + srvMem + "," +srvConfig + ","+ srvEnv + "]";
		
		res.send(JSON.parse(srvData));
		
    } catch (exception) {
        res.status(500).send(exception)
    }
});

// Get OSC parameters
app.get('/osc/params/',  async function (req, res) {
    try {
		if (req.query.ip != undefined && req.query.port != undefined){
			udpPort.options.remoteAddress = req.query.ip;
			udpPort.options.remotePort = req.query.port;
			res.send(udpPort.options.remoteAddress + "-" + udpPort.options.remotePort);
		} else {
			console.log('Bad or missing OSC params, two required');
			res.send('Bad or missing OSC params, two required');
		}		
    } catch (exception) {
        res.status(500).send(exception)
    }
});

// provide OSC informations
app.get('/osc/info/',  async function (req, res) {
    try {
		// response to GET
		res.send(udpPort.options.remoteAddress + "-" + udpPort.options.remotePort);
    } catch (exception) {
        res.status(500).send(exception)
    }
});

// Send message to OSC
app.post('/osc/msg/',  async function (req, res) {
	try {
		res.send();
		sendOSC(JSON.stringify(req.body));
    } catch (exception) {
        res.status(500).send(exception)
    }		
})

// create server
https.createServer({
  key: fs.readFileSync('security/server.key'),
  cert: fs.readFileSync('security/server.cert')
}, app).listen(process.env.SRVPORT || 8000, '0.0.0.0', () => {
	console.log('    SRVPORT e.g. 8080 for server PORT    ');
	console.log('-----------------------------------------');
    console.log(`server is running on port ${process.env.SRVPORT || 8000}`);
})

/****************
 * OSC Over UDP *
 ****************/

let udpPort = new osc.UDPPort({
    // In osc.js localAddress need to be set even for send only.
	localAddress: "0.0.0.0",
    remoteAddress: process.env.OSCADDR || "127.0.0.1",
    remotePort: process.env.OSCPORT || 12000,
    metadata: true
});

udpPort.on("ready", function () {
    console.log("OSC ready to send");
    console.log(" Host:", udpPort.options.remoteAddress + ", Port:", udpPort.options.remotePort);
	console.log(' You can customize using /osc/params url   : ');
	console.log('    e.g /osc/params/?ip=127.0.0.1&port=1234  ');
	console.log('                OR                           ');
	console.log('---------------------------------------------');	
	console.log(' You can customize using env variables :     ');
	console.log('    OSCADDR e.g. 192.168.1.123 for OSC server');
	console.log('    OSCPORT e.g. 1234          for OSC PORT  ');
	console.log('---------------------------------------------');
});

udpPort.on("message", function (oscMessage) {
    console.log(oscMessage);
});

udpPort.on("error", function (err) {
    console.log(err);
});

udpPort.open();

// Send message To OSC
async function sendOSC (oscmsg) {
    let msg = {
        address: "/WLEDAudioSync/RTMGC",
        args: [
            {
                type: "s",
                value: oscmsg
            }
        ]
    };

    // console.log("Sending message", msg.address, msg.args, "to", udpPort.options.remoteAddress + ":" + udpPort.options.remotePort);
    udpPort.send(msg);
};
