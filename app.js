const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const Nexmo = require('nexmo');
const socketio = require('socket.io');

const nexmo = new Nexmo({
    apiKey:'32f3aa2a',
    apiSecret: 'xhxvUHgEsL4fUNhN'
}, {debug : true })

const app = express();

app.set('view engine', 'html');
app.engine('html', ejs.renderFile);

app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.render('index');
})

//catch from submit 
app.post('/', (req, res) => {
    //res.send(req.body);
    //console.log(req.body);
    const number = req.body.number;
    const text = req.body.text;

    nexmo.message.sendSms(
        'NEXMO', number, text, {type: 'unicode'},
        (err, responseData) => {
            if(err){
                console.log(err);
            }
            else {
                const { messages } = responseData;
                const { ['message-id']: id, ['to']: number, ['error-text']: error  } = messages[0];
                console.dir(responseData);
                // Get data from response
                const data = {
                id: responseData.messages[0]['message-id'],
                number: responseData.messages[0]['to'],
                error
                };

                // Emit to the client
                io.emit('smsStatus', data);
            }
        }
    )

})

const port = 3000;

const server = app.listen(port, () => console.log(`Server started on port ${port}`));

// Connect to socket.io
const io = socketio(server);
io.on('connection', (socket) => {
  console.log('Connected');
  io.on('disconnect', () => {
    console.log('Disconnected');
  })
});