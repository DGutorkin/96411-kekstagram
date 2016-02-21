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
    var element = template.content.children[0].cloneNode(true);
    element.querySelector('.picture-comments').textContent = this._data.comments;
    element.querySelector('.picture-likes').textContent = this._data.likes;

    var picImage = new Image();
    picImage.onload = function() {
      var templateChild = element.firstElementChild;
      picImage.width = 182;
      picImage.height = 182;
      element.replaceChild(picImage, templateChild);
    };
    picImage.onerror = function() {
      element.classList.add('picture-load-failure');
    };
    picImage.src = this._data.url;
    return element;
  };

  window.Photo = Photo;
})();
