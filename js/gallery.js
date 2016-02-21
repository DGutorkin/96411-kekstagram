'use strict';
(function() {
  /**
  /* @param {Object} photo - фотография по которой прошёл клик
  * @constructor
  */
  function Gallery(photo) {
    this._photo = photo;
  }

  Gallery.prototype = {
    galleryEl: document.querySelector('.gallery-overlay'),
    preview: document.querySelector('.gallery-overlay-preview'),
    /**
    * Показ галереи
    */
    show: function() {
      this.galleryEl.classList.remove('invisible');
      var openedImage = this.preview.children[0];
      openedImage.src = this._photo.children[0].src;

      this.preview.addEventListener('click', this._onPhotoClick);
      window.addEventListener('keydown', this._onDocumentKeyDown);
    },

    /**
    * Прячем галерею
    */
    hide: function() {
      this.galleryEl.classList.add('invisible');

      this.preview.removeEventListener('click', this._onPhotoClick);
      window.removeEventListener('keydown', this._onDocumentKeyDown);
    },

    /**
    * Методы-обработчики событий
    */
    _onPhotoClick: function(evt) {
      if (evt.target.classList.contains('gallery-overlay-image')) {
        console.log('_onPhotoClick fired on <img> click!');
      }
    },
    _onDocumentKeyDown: function(evt) {
      console.log(evt);
      if (evt.keyCode === 27) {
        console.log('_onDocumentKeyDown fired!');
        Gallery.prototype.hide();
      }
    }
  };

  window.Gallery = Gallery;
})();
