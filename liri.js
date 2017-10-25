 //IFFE
(function () {
  /*
  ---Import libraries---
  */
  require('dotenv').config();

  const fs = require("fs");
  const twitter = require("twitter");
  const request = require("request");
  const SpotifyWebApi = require('spotify-web-api-node');
  const keys = require("./keys.js")
  /*
  ---Initialize global variables---
  */
  var command;
  var param;
  var fileName = 'log.txt';
  //Initialize twitter
  var client = new twitter({
    consumer_key: keys.twitterKeys.consumerKey,
    consumer_secret: keys.twitterKeys.consumerSecret,
    access_token_key: keys.twitterKeys.accessTokenKey,
    access_token_secret: keys.twitterKeys.accessTokenSecret
  });
  // Initialize SpotifyWebApi
  var spotifyApi = new SpotifyWebApi({
    clientId : keys.spotifyKeys.clientID,
    clientSecret : keys.spotifyKeys.clientSecret
  });
  /*
  ---Global functions---
  */
  //Fetch the tweets
  const fetchTweets = () =>{
    client.get('statuses/user_timeline', { screen_name: 'hcandelaria66_7', count: 20 },
                function(error, tweet, response) {
      if(error) throw error;
      var textOutput = "";

      for(var i = 0; i< tweet.length; i++){
        //console.log(tweet);
        var date = splitAt(10)(tweet[i].created_at);
        var year = splitAt(25)(tweet[i].created_at)
        date = date[0] + year[1];
        textOutput += tweet[i].text + " On: " + date + '\n';
      }
      //Output to terminal/bash
      console.log(textOutput);
      //Output to log.text
      logData(textOutput);
    });
    //Output to log.text command and param
    logData();
  }
  //Split string at index
  const splitAt = index => x => [x.slice(0, index), x.slice(index)]
  //Fecth the spotifyApi token
  const spotifyToken = () =>{
    // Get an access token and 'save' it using a setter
    spotifyApi.clientCredentialsGrant()
      .then(function(data) {
        //Set spotify access token
        spotifyApi.setAccessToken(data.body['access_token']);
        searchTracks();
      }, function(err) {
        console.log('Something went wrong!', err);
      });
  }
  //Fetch tracks info
  const searchTracks = () =>{
    spotifyApi.searchTracks(param)
      .then(function(data) {
        //First track from the array
        var track = data.body.tracks.items[0];
        //var to out
        var textOutput = 'Search by: ' + param + '\n';
        textOutput +=    'Artist(s): ' + '\n';
        for (var name in track.artists){
           textOutput += ("          " + track.artists[name].name + '\n' );
         }
        textOutput += 'Track: ' + track.name + '\n';
        textOutput += 'Album: ' + track.album.name + '\n';
        if(track.preview_url === null)
          textOutput += 'Preview: N/A'+ '\n' ;
        else {
          textOutput += track.preview_url + '\n';
        }
        //Output to terminal/bash
        console.log(textOutput);
        //Output to log.text
        logData(textOutput);
      }, function(err) {
        console.error(err);
      });
      //Output to log.text command and param
      logData();
  }
  //Store all the values after the command
  const getArgv = () =>{
    var argv = "";
    for (var i = 3; i < process.argv.length;i++){
      if(i > 3) argv += " ";
      argv += process.argv[i];
    }
    return argv;
  }
  //Request a date from omdbapi
  const fetchMovie = () =>{

    var link = 'http://www.omdbapi.com/?t=' + param + '&y=&plot=short&apikey=40e9cece';

    // Then run a request to the OMDB API with the movie specified
    request(link, function(error, response, body) {
      // If the request is successful (i.e. if the response status code is 200)
      if (!error && response.statusCode === 200) {
        //Convert body to JSON
        body = JSON.parse(body);
        //Var
        var ratingIMD = 'Internet Movie Database';
        var ratingRT = 'Rotten Tomatoes'
        var textOutput = ""
        //Output to terminal/bash
        textOutput += 'Title: ' + body.Title + '\n';
        textOutput += 'Release year:' + body.Year + '\n';

        for(var Source in body.Ratings){
          if(body.Ratings[Source].Source === ratingIMD){
            textOutput += ratingIMD + ' rating: ' + body.Ratings[Source].Value + '\n';
          }else if(body.Ratings[Source].Source === ratingRT){
            textOutput += ratingRT + ' rating: ' + body.Ratings[Source].Value + '\n';
          }
        }
        textOutput += 'Produced in: ' + body.Country + '\n';
        textOutput += 'Language: ' + body.Language + '\n';
        textOutput += 'Plot: ' + body.Plot + '\n';
        textOutput += 'Actors: ' + body.Actors + '\n';


        //Output to terminal/bash
        console.log(textOutput);
        //Output to log.text
        logData(textOutput);
      }
    });
    //Output to log.text command and param
    logData();
  }
  //Randome command from random.txt
  const randomCommand = () =>{
    fs.readFile("random.txt", "utf8", function(err, data) {
      if (err) throw err;

      // Break the data inside
      data = data.split(',')
      //Change the value of param and command
      param = data[1].split('"');
      param = param[1];
      command = data[0];
      runCommand();
    });
    logData();
  }
  //Save the command
  const logData = (data) =>{
    if(!data){
      fs.appendFile(fileName, command + '-"' + param + '"\n', function(err) {
        if (err) throw err;
      });
    }else{
      fs.appendFile(fileName, data + '\n', function(err) {
        if (err) throw err;
      });
    }
  }
  //Check what command the user wants to run
  const runCommand = () =>{
    switch (command) {
      //Show your last 20 tweets
      case 'my-tweets':
        console.log('Getting tweets!');
        fetchTweets();
        break;
      //Show information about the song
      case 'spotify-this-song':
        console.log('Getting spotify info!');
        spotifyToken();
        break;
      //Show information about the movie
      case 'movie-this':
        console.log('Getting movie info!');
        fetchMovie();
        break;
      //Calls the command inside the random.txt file
      case 'do-what-it-says':
        console.log('Getting command inside random.txt!');
        randomCommand();
        break;
      default:
        console.log('Liri Does NOT recognize that command!');
    }
  }
  //Declare var
  param = getArgv();
  command = process.argv[2];
  //run Program
  runCommand();
}());
