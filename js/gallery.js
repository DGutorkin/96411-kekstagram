/* global PhotoPreview: true */
'use strict';
(function() {
  var preview = new PhotoPreview();
  var KEYCODE = {
    'ESC': 27,
    'LEFT': 37,
    'RIGHT': 39
  };
  /**
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
    currentIndex: null,
    show: function() {
      this.element.classList.remove('invisible');

      // is this way of bind ok?
      this._closeBtn.addEventListener('click', this._onCloseClick);
      this._likeBtn.addEventListener('click', this._onLikeClick);
      this._photo.addEventListener('click', this._onPhotoClick);
      this._video.addEventListener('click', this._onVideoClick);
      window.addEventListener('keydown', this._onDocumentKeyDown);
    },

    hide: function() {
      this.element.classList.add('invisible');
      this._photo.removeEventListener('click', this._onPhotoClick);
      this._video.removeEventListener('click', this._onVideoClick);
      this._closeBtn.removeEventListener('click', this._onCloseClick);
      this._likeBtn.removeEventListener( 'click', this._onLikeClick );
      window.removeEventListener('keydown', this._onDocumentKeyDown);
      //preview.remove();
    },

    /**
    * Сохраняет массив с отрендеренными фотографиями в объекте
    * @param {Array.<Photo>} photos
    */
    setPictures: function(photos) {
      this.data = photos;
    },

    /**
    * Подменяет src, кол-во лайков и комментов у отображаемой фотографии.
    * @param {integer} ind - индекс элемента Photo в this.data
    */
    setCurrentPicture: function(ind) {
      preview.setData(this.data[ind].getData());
      if (!preview) {
        return false;
      }
      this.currentIndex = ind;
      preview.render(this.element);
    },
    /**
    * Именованые функции для обработчиков событий. Нужны для возможности удаления
    * этих самых обработчиков при закрытии галереи.
    */
    _onPhotoClick: function() {
      this.setCurrentPicture(++this.currentIndex);
    },

    _onCloseClick: function() {
      this.hide();
    },
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
    _onVideoClick: function(evt) {
      if (evt.target.tagName === 'VIDEO') {
        if (this.paused) {
          this.play();
        } else {
          this.pause();
        }
      }
    },

    _onDocumentKeyDown: function(evt) {
      this._video.pause();
      switch (evt.keyCode) {
        case KEYCODE.ESC: this.hide();
          break;
        case KEYCODE.LEFT: this.setCurrentPicture(--this.currentIndex);
          break;
        case KEYCODE.RIGHT: if (this.currentIndex < this.data.length - 1) {
          this.setCurrentPicture(++this.currentIndex);
        }
          break;
      }
    }
  };

  window.Gallery = Gallery;
})();
