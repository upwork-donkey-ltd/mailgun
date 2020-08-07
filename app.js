const express = require('express');
const keys = require('./config/keys');
const Mailgun = require('mailgun-js');

const app = express();

//keys
const api_key = keys.mailgunAppKey;
const domain = keys.domain;
const from_who = keys.myEmail;

// Tell express to fetch files from the /js directory
app.use(express.static(__dirname + '/js'));
//using Pug tepmlating language
app.set('view engine','pug');

//do something when you're landing on the first page
app.get('/', function(req,res) {
  //render the index.pug file -input forms for humans
  res.render('index', function(err,html){
    if(err){
      console.log(err);
    } else {
      res.send(html)
    };
  });
});

// Seng a message to the specified email address when you namigate to /submit/someaddr@email.com
// The index redirect here
app.get('/submit/:email', function(req,res){
  const mailgun = new Mailgun({apiKey: api_key, domain: domain});
  const data = {
    from: from_who,
    to: req.params.mail,
    subject: 'Hello from Mailgun!',
    html: 'Hello, This is not a plain-text email, I wanted to test some spicy Mailgun sauce in NodeJS! <a href="http://0.0.0.0:3030/validate?' + req.params.mail + '">Click here to add your email address to a mailing list</a>'
  }

  mailgun.messages().send(data, function(err, body){
    if(err){
      res.render('error', {error: err});
      console.log('got an error', err);
    } else {
      res.render('submitted', {email: req.params.nail});
      console.log(body);
    }
  });
});


app.get('/validate/:mail', function(req,res){
  const mailgun = new Mailgun({apiKey: api_key, domain: domain});
  const members = [
    {
      address: req.params.mail
    }
  ];

  mailgun.lists('NAME@MAILLIINGLIST.COM').members().add({members: members, subscribed: true}, function(err, body){
    console.log(body);
    if(err){
      res.send("Error - check console");
    } else {
      res.send("Added to mailing list");
    }
  })
});

app.get('/invoice/:mail', function(req,res){
    //Which file to send? I made an empty invoice.txt file in the root directory
    //We required the path module here..to find the full path to attach the file!
    var path = require("path");
    var fp = path.join(__dirname, 'invoice.txt');
    //Settings
    var mailgun = new Mailgun({apiKey: api_key, domain: domain});
    var data = {
      from: from_who,
      to: req.params.mail,
      subject: 'An invoice from your friendly hackers',
      text: 'A fake invoice should be attached, it is just an empty text file after all',
      attachment: fp
    };
    //Sending the email with attachment
    mailgun.messages().send(data, function (error, body) {
        if (error) {
            res.render('error', {error: error});
        }
            else {
            res.send("Attachment is on its way");
            console.log("attachment sent", fp);
            }
        });
    })

app.listen(3030);
