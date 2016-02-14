'use strict';
(function() {
  // В задании: "Прячет блок с фильтрами .filters, добавляя ему класс hidden"
  // Но в коде он уже hidden
  var pictures = null;
  var container = document.querySelector('.pictures');

  getData();

  function getData() {
    //ставим заглушку-загрузчик
    container.classList.add('pictures-loading');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = 10000;
    xhr.onload = function(evt) {
      pictures = JSON.parse(evt.target.response);
      renderPictures(pictures);
    };
    xhr.onerror = function() {
      container.classList.add('pictures-failure');
    };
    xhr.send();

    container.classList.remove('pictures-loading');
  }

  function renderPictures(picturesToRender) {
    container.innerHTML = '';
    var fragment = document.createDocumentFragment();

    picturesToRender.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    container.appendChild(fragment);
  }
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

  function setActiveFilter(btn) {
    var filterName = btn.value;
    var filteredPictures = pictures.slice(0);
    switch (filterName) {
      case 'discussed': filteredPictures.sort(function(a, b) {
        return parseInt(b.comments, 10) - parseInt(a.comments, 10);
      });
        break;
      case 'new': filteredPictures.sort(function(a, b) {
        return new Date(b.date) - new Date(a.date);
      });
        break;
      default: filteredPictures = pictures.slice(0);
        break;
    }
    renderPictures(filteredPictures);
  }

  // проставляем onclick события для фильтров
  var filters = document.querySelectorAll('.filters-radio');
  for (var i = 0; i < filters.length; i++) {
    var filterBtn = document.getElementById( filters[i].id );
    filterBtn.addEventListener('click', function() {
      setActiveFilter(this);
    });
  }

})();
