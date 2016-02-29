'use strict';

var inherit = require('inherit');
var Photo = require('photo');

/**
* @param {Object} data
* @constructor
* @extends {Photo}
*/
function Video() {
  this.mediatype = 'video';
}
inherit(Video, Photo);

/**
* Подгрузка изображения и создание картинки из шаблона
*/
Video.prototype.render = function() {
  var template = document.getElementById('picture-template');
  this.element = template.content.children[0].cloneNode(true);
  this.element.querySelector('.picture-comments').textContent = this.getComments();
  this.element.querySelector('.picture-likes').textContent = this.getLikes();

  var videoElement = document.createElement('video');
  videoElement.width = 182;
  videoElement.height = 182;
  videoElement.src = this.getSrc();
  this.element.replaceChild(videoElement, this.element.firstElementChild);

  this.element.addEventListener('click', this._onClick);
  return this.element;
};


Video.prototype.onClick = null;

Video.prototype._onClick = function(evt) {
  evt.preventDefault();
  if (typeof this.onClick === 'function') {
    this.onClick();
  }
};

module.exports = Video;
