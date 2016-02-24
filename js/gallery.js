'use strict';
(function() {
  /**
  * @param {Object} photo - фотография по которой прошёл клик
  * @constructor
  */
  function Gallery() {
    this.element = document.querySelector('.gallery-overlay');
    this._closeBtn = this.element.querySelector('.gallery-overlay-close');
  }

  Gallery.prototype = {
    show: function() {
      this.element.classList.remove('invisible');

      var openedImage = this.element.querySelector('img');
      openedImage.src = this.data.url;

      // is this way of bind ok?
      this._closeBtn.addEventListener( 'click', this._onCloseClick.bind(this) );
      this.element.addEventListener('click', this._onPhotoClick);
      window.addEventListener( 'keydown', this._onDocumentKeyDown.bind(this) );
    },

    hide: function() {
      this.element.classList.add('invisible');

      this.element.removeEventListener('click', this._onPhotoClick);
      this._closeBtn.removeEventListener('click', this._onCloseClick);
      window.removeEventListener('keydown', this._onDocumentKeyDown);
    },

    /**
    * Именованые функции для обработчиков событий. Нужны для возможности удаления
    * этих самых обработчиков при закрытии галереи.
    */
    _onPhotoClick: function(evt) {
      if (evt.target.classList.contains('gallery-overlay-image')) {
        console.log('_onPhotoClick fired on <img> click!');
      }
    },

    _onCloseClick: function() {
      this.hide();
    },

    _onDocumentKeyDown: function(evt) {
      if (evt.keyCode === 27) {
        this.hide();
      }
    }
  };

  window.Gallery = Gallery;
})();
