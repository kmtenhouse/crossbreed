const express = require('express');
const router = express.Router();
const request = require('request');
const API_KEY = process.env.API_KEY;

router.get("/:difficulty", function(req, res){
    const difficulty = req.params.difficulty;
    let wordLength = "";
    switch(difficulty){
        case "easy":
            wordLength = "????????"
            break;
        case "normal":
            wordLength = "??????"
            break;
        case "hard":
            wordLength = "????"
            break;
    }
    const queryURL = ` https://api.datamuse.com/words?sp=${wordLength}&ml=animals&v=enwiki&max=100`;
    const options = {
        method: "GET",
        url: queryURL,
    }
    request(options, function(error, response, body){
        if(error) {
            console.log(error);
        }
        else if(!error && response.statusCode === 200){
            body = JSON.parse(body)
            res.json(body);
        }
    })
});

router.get("/details/:word", function(req, res){
    const word = req.params.word;
    const queryURL = `https://wordsapiv1.p.rapidapi.com/words/${word}`;
    const options = {
        method: "GET",
        url: queryURL,
        headers: {
            "X-RapidAPI-Key": API_KEY,
            "Accept": "application/json"
        }
    }
    request(options, function(error,response, body){
        if(error){
            console.log(error);
        }
        else if(!error && response.statusCode === 200){
            body = JSON.parse(body);
            res.json(body);
        }
    })
})

module.exports = router;