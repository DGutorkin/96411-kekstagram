'use strict';

var PhotoPreview = require('photo-preview');
var preview = new PhotoPreview();
var KEYCODE = {
  'ESC': 27,
  'LEFT': 37,
  'RIGHT': 39
};
/** Класс, представляющий галерею.
* @param {Object} photo - фотография по которой прошёл клик
* @constructor
*/
function Gallery() {
  this.element = document.querySelector('.gallery-overlay');
  this._closeBtn = this.element.querySelector('.gallery-overlay-close');
  this._likeBtn = this.element.querySelector('.likes-count');
  this._photo = this.element.querySelector('.gallery-overlay-image');
  this._video = this.element.querySelector('.gallery-overlay-video');

  this._onPhotoClick = this._onPhotoClick.bind(this);
  this._onDocumentKeyDown = this._onDocumentKeyDown.bind(this);
  this._onLikeClick = this._onLikeClick.bind(this);
  this._onCloseClick = this._onCloseClick.bind(this);
}

Gallery.prototype = {
  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
  currentIndex: null,

  /**
  * Показывает галерею и проставляет eventListeners
  */
  show: function() {
    this.element.classList.remove('invisible');

    this._closeBtn.addEventListener('click', this._onCloseClick);
    this._likeBtn.addEventListener('click', this._onLikeClick);
    this._photo.addEventListener('click', this._onPhotoClick);
    this._video.addEventListener('click', this._onVideoClick);
    window.addEventListener('keydown', this._onDocumentKeyDown);
  },

  /**
  * Прячет галерею и удаляет eventListeners, сбрасывает location.hash
  */
  hide: function() {
    this.element.classList.add('invisible');
    this._photo.removeEventListener('click', this._onPhotoClick);
    this._video.removeEventListener('click', this._onVideoClick);
    this._closeBtn.removeEventListener('click', this._onCloseClick);
    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
    window.removeEventListener('keydown', this._onDocumentKeyDown);
    location.hash = '';
  },

  /**
  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
  * @param {Array.<Photo>} photos
  */
  setPictures: function(photos) {
    this.data = photos;
  },

  /**
  * @param {integer|string} ind - индекс элемента Photo в this.data или
  * getSrc() этого элемента.
  */
  setCurrentPicture: function(ind) {
    if (typeof ind === 'number') {
      preview.setData(this.data[ind].getData());
      this.currentIndex = ind;
    } else if (typeof ind === 'string') {
      var item = this.data.filter(function( obj ) {
        return obj.getSrc() === ind;
      })[0];
      this.currentIndex = this.data.indexOf(item);
      preview.setData(item.getData());
    }
    if (!preview) {
      return false;
    }
    preview.render(this.element);
  },

  /**
  * Устанавливает hash в строке браузера в соответствии с getSrc()
  * элемента, индекс которого передан
  * @param {integer} ind
  */
  updateHash: function(ind) {
    location.hash = location.hash = 'photo/' + this.data[ind].getSrc();
  },

  /**
  * Именованые функции для обработчиков событий. Нужны для возможности удаления
  * этих самых обработчиков при закрытии галереи.
  */
  _onPhotoClick: function() {
    if (this.currentIndex < this.data.length - 1) {
      this.updateHash(++this.currentIndex);
    }
  },

  _onCloseClick: function() {
    this.hide();
  },

  /**
  * Обработчик кликов лайка в галерее
  */
  _onLikeClick: function(evt) {
    var btn = evt.target;
    if (btn.classList.contains('likes-count-liked')) {
      btn.classList.remove('likes-count-liked');
      preview.dislike();
      preview.render(this.element, true);
    } else {
      btn.classList.add('likes-count-liked');
      preview.like();
      preview.render(this.element, true);
    }
    this.data[this.currentIndex].updateLikes();
  },

  /**
  * Управление проигрыванием видео.
  */
  _onVideoClick: function(evt) {
    if (evt.target.tagName === 'VIDEO') {
      if (this.paused) {
        this.play();
      } else {
        this.pause();
      }
    }
  },

  /**
  * Клавиатурные события: переключение объектов галереи, выход из галереи
  */
  _onDocumentKeyDown: function(evt) {
    this._video.pause();
    switch (evt.keyCode) {
      case KEYCODE.ESC: this.hide();
        break;
      case KEYCODE.LEFT: if (this.currentIndex > 0) {
        this.updateHash(--this.currentIndex);
      }
        break;
      case KEYCODE.RIGHT: if (this.currentIndex < this.data.length - 1) {
        this.updateHash(++this.currentIndex);
      }
        break;
    }
  }
};

module.exports = Gallery;
