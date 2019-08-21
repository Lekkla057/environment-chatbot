const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const app = express();

app.set('port', (process.env.PORT || 8000));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

// Home
app.get('/', function (req, res) {
	res.send('Hello world!');
});


app.get('/webhook', function (req, res) {
	if (req.query['hub.verify_token'] === process.env.VERIFICATION_TOKEN) { //<< แก้ตรงนี้ให้เป็นของเรา
		res.send(req.query['hub.challenge']);
	}
	res.send('Wrong token!');
});

const token = process.env.PAGE_ACCESS_TOKEN; /// << ใส่ token ตรงนี้
app.post('/webhook/', function(req, res) {
    var messaging_events = req.body.entry[0].messaging;
    for (var i = 0; i < messaging_events.length; i++) {
        var event = req.body.entry[0].messaging[i];
        var sender = event.sender.id;
        if (event.message && event.message.text) {
            var text = event.message.text;
            sendTextMessage(sender, text + "!");
        }
    }
    res.sendStatus(200);
});
function sendTextMessage(sender, text) {
    var messageData = {
        text: text
    };
    request({
        url: 'https://graph.facebook.com/v2.6/me/messages',
        qs: {
            access_token: token
        },
        method: 'POST',
        json: {
          recipient:{
            id:sender
          },
          message:{
            attachment:{
              type:"template",
              payload:{
                template_type:"generic",
                elements:[
                   {
                    title:"Welcome!",
                    image_url:"https://petersfancybrownhats.com/company_image.png",
                    subtitle:"We have the right hat for everyone.",
                    default_action: {
                      type: "web_url",
                      url: "https://petersfancybrownhats.com/view?item=103",
                      messenger_extensions: false,
                      webview_height_ratio: "tall",
                      fallback_url: "https://petersfancybrownhats.com/"
                    },
                    buttons:[
                      {
                        type:"web_url",
                        url:"https://petersfancybrownhats.com",
                        title:"View Website"
                      },{
                        type:"postback",
                        title:"Start Chatting",
                        payload:"DEVELOPER_DEFINED_PAYLOAD"
                      }              
                    ]      
                  }
                ]
              }
            }
          }}
    }, function(error, response, body) {
        if (error) {
            console.log('Error:', error);
        } else if (response.body.error) {
            console.log('Error: ', response.body.error);
        }
    });
}


// Start the server
app.listen(app.get('port'), function() {
	console.log('running on port', app.get('port'));
});