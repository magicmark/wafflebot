 "use strict";
var waffle = require('./waffle.js');

var response = function (message, room_guard) {
  return {
    message: message,
    room_guard: room_guard,
  }
};

module.exports = {
  'i would like a waffle': response('{from} would rather like a waffle.', true),
  'waffle me':             response(waffle, false),
  'cheese toastie me':     response('Yummy! Here you go! https://upload.wikimedia.org/wikipedia/commons/6/6d/Toastie-cut-and-seal.jpg', false),
  'chip butty me':         response('Yummy! Here you go! http://www.fnstatic.co.uk/images/content/slide/an-ode-to-the-chip-butty_1.jpg', false),
  'fairy cake me':         response('Yummy! Here you go! http://static.guim.co.uk/sys-images/Guardian/Pix/pictures/2010/7/7/1278515929248/Fairy-cakes-006.jpg', false),
  'jam roly poly me':      response('Yummy! Here you go! http://goodtoknow.media.ipcdigital.co.uk/111/00000811c/e5bb/jam-roly-poly.jpg', false),
  'bangers and mash me':   response('Yummy! Here you go! http://www.roadtripsrus.com/wp-content/uploads/2013/11/Bangers-and-mash.jpg', false),
};
