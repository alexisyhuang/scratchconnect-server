import express from 'express';

// If you need your server to use https -- though you will need certificates for this.
// We can talk about it if it comes to that.
// import https from 'https';
// import http from 'http';

// If you need to handle CORS issues
import cors from 'cors'

// import OpenAI from "openai";
// const openai = new OpenAI();

import axios from 'axios';


const server = express();

// OLD RESTIFY CODE
// const server = restify.createServer();
// server.use(restify.plugins.queryParser());



// If you need to handle CORS issues
server.use(cors());
// If you need to handle larger payloads
// (you probably won't need this, I needed it because I was sending/receiving large images) 
server.use(express.json({limit: '1gb'}));

// OLD RESTIFY CODE
// server.use(
//   function crossOrigin(req, res, next) {
//     res.header("Access-Control-Allow-Origin", "*");
//     res.header("Access-Control-Allow-Headers", "X-Requested-With");
//     return next();
//   }
// );

server.get('/', (req, res, next) => {
  if (!req.query.m) {
    res.end();
    return next(false);
  }
  (async () => {
    try {
      const message = req.query.m;
      const username = message;
      console.log(username)
      const projectresponse = await axios.get(`https://api.scratch.mit.edu/users/${username}/projects/`);
      const profileresponse = await axios.get(`https://api.scratch.mit.edu/users/${username}/`);
      const responseData = {
        projects: projectresponse.data,
        bio: profileresponse.data.profile.bio,
        workingon: profileresponse.data.profile.status,
      };
      console.log("project response: ", projectresponse);
      console.log("profile response: ", profileresponse);
      res.json(responseData);
      return next();
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
      return next();
    }
    /*
    try {
      // if (!req.query.m) return;
      // const message = JSON.parse(req.query.m);

      // const response = await openai.chat.completions.create({
      //   messages: message,
      //   model: 'gpt-4-turbo-preview',
      // });

      // const resp = response.choices[0];
      // const text = resp.message.content;

      // console.log(text);
      // res.send(text);
      // next();
      const message = req.query.m;
      const username = message;
      console.log(username)
      const followingResponse = await axios.get(`https://api.scratch.mit.edu/users/${username}/following/`);
      const usernames = followingResponse.data.map(user => user.username);
      console.log(usernames)
      const favoritesPromises = usernames.map(user =>
        axios.get(`https://api.scratch.mit.edu/users/${user}/favorites/`)
      );
      const results = await Promise.all(favoritesPromises);
      const aggregatedFavorites = results.map(result => result.data).flat();
      // console.log(aggregatedFavorites);
      res.json(aggregatedFavorites);
    } catch (error) {
      // console.log(error);
      // res.send('');
      // next(false);
      console.error(error);
      res.status(500).json({ error: 'An error occurred' });
    }
    */
  })();
});

server.get('/search', async (req, res, next) => {
  try {
    const keyword = req.query.keyword;
    if (!keyword) {
      return res.status(400).json({ error: 'Keyword not provided' });
    }

    const response = await axios.get(`https://api.scratch.mit.edu/search/projects?q=${keyword}`);
    res.json(response.data);
    return next();
  } catch (error) {
    console.error('Error fetching projects for keyword:', error);
    res.status(500).json({ error: 'An error occurred' });
    return next();
  }
});

var port = process.env.PORT || 8081;

// OLD RESTIFY CODE
// server.listen(port, function() {
//   console.log('Server listening on port ' + port);
// });

server.listen(port, function () {
  console.log('Server listening on port ' + port);
});