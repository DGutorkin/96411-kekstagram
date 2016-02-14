/* global loadedData */
'use strict';
(function() {
  // В задании: "Прячет блок с фильтрами .filters, добавляя ему класс hidden"
  // Но в коде он уже hidden
  var container = document.querySelector('.pictures');
  loadedData.forEach(function(picture) {
    var element = getElementFromTemplate(picture);
    container.appendChild(element);
  });
  var formFilters = document.querySelector('.filters');
  formFilters.classList.remove('hidden');

  function getElementFromTemplate(data) {
    var template = document.getElementById('picture-template');
    var element = template.content.children[0].cloneNode(true);
    element.querySelector('.picture-comments').textContent = data.comments;
    element.querySelector('.picture-likes').textContent = data.likes;

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
    picImage.src = data.url;
    return element;
  }

})();
