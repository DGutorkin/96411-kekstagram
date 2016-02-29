'use strict';

var inherit = require('inherit');
var PhotoBase = require('photo-base');

/** Класс, представляющий фотографию на странице.
* @module Photo
* @constructor
* @extends {PhotoBase}
*/
function Photo() {
  this.mediatype = 'img';
}
inherit(Photo, PhotoBase);

/**
* Подгрузка изображения и создание картинки из шаблона
*/
Photo.prototype.render = function() {
  var template = document.getElementById('picture-template');
  this.element = template.content.children[0].cloneNode(true);
  this.element.querySelector('.picture-comments').textContent = this.getComments();
  this.element.querySelector('.picture-likes').textContent = this.getLikes();

  var picImage = new Image();
  picImage.onload = function() {
    var templateChild = this.element.firstElementChild;
    picImage.width = 182;
    picImage.height = 182;
    this.element.replaceChild(picImage, templateChild);
  }.bind(this);
  picImage.onerror = function() {
    this.element.classList.add('picture-load-failure');
  }.bind(this);
  picImage.src = this.getSrc();

  this.element.addEventListener('click', this._onClick);
  return this.element;
};

/** @function updateLikes - обновление кол-ва лайков в галерее */
Photo.prototype.updateLikes = function() {
  this.element.querySelector('.picture-likes').textContent = this.getLikes();
};

Photo.prototype.onClick = null;

Photo.prototype._onClick = function(evt) {
  evt.preventDefault();
  if ( !this.classList.contains('picture-load-failure') ) {
    if (typeof this.onClick === 'function') {
      this.onClick();
    }
  }
};

module.exports = Photo;
