'use strict';
(function() {
  /**
  * @param {Object} data
  * @constructor
  */
  function Photo(data) {
    this._data = data;
  }

  /**
  * Подгрузка изображения и создание картинки из шаблона
  */
  Photo.prototype.render = function() {
    var template = document.getElementById('picture-template');
    this.element = template.content.children[0].cloneNode(true);
    this.element.querySelector('.picture-comments').textContent = this._data.comments;
    this.element.querySelector('.picture-likes').textContent = this._data.likes;

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
    picImage.src = this._data.url;
    return this.element;
  };

  window.Photo = Photo;
})();
