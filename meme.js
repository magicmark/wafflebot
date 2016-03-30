"use strict";

const request = require('request');

class MemeMaker {

  /**
   * Constructs a MemeMaker object
   *
   * @param  {Object} auth The username/password object for imgflip
   */
  constructor (auth) {
    this.auth = auth;
  }

  /**
   * Creates a meme
   *
   * @param  {String} text String to create meme from
   *
   * @return {Promise} Promise containing the result of the meme
   */
  create (text) {

    return new Promise((resolve, reject) => {

      let lines = text.match(/"(.*?)"/g).map((line_match) => {
        return line_match.substr(1, line_match.length-2);
      }).filter((line_match) => {
        return !!line_match;
      });

      console.log(lines.length);

      if ((lines.length !== 1) && (lines.length !== 2)) {
        reject('invalid meme lines')
        return ;
      }

      console.log(lines);


      let params = {
        'template_id': '63278523',
        'username': this.auth.username,
        'password': this.auth.password,
        'text0': lines[0]
      };

      if (lines[1]) {
        params['text1'] = lines[1];
      }

      console.log('making', params);
      request.post('https://api.imgflip.com/caption_image', {
        form: params
      }, function (error, response, body) {
        let jsonBody = JSON.parse(body);
        if (jsonBody.success && jsonBody.data && jsonBody.data.url) {
          resolve(jsonBody.data.url);
        } else {
          reject('meme making error');
        }
      });

    });
  
  }

}

module.exports = MemeMaker;