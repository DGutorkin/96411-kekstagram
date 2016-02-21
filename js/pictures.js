'use strict';
(function() {
  // В задании: "Прячет блок с фильтрами .filters, добавляя ему класс hidden"
  // Но в коде он уже hidden
  var pictures = [];
  var filteredPictures = [];
  var currentPage = 0;
  var PAGE_SIZE = 12;
  var PICTURE_HEIGHT = 128;
  var container = document.querySelector('.pictures');

  var scrollTimeout;
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(populatePicsOnScreen, 100);
  });

  getData();

  function getData() {
    //ставим заглушку-загрузчик
    container.classList.add('pictures-loading');

    var xhr = new XMLHttpRequest();
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = 10000;
    xhr.onload = function(evt) {
      pictures = JSON.parse(evt.target.response);
      filteredPictures = pictures.slice(0);
      renderPictures(pictures, 0, true);
      // размазываем по ширине экрана, если необходимо
      populatePicsOnScreen();
    };
    xhr.onerror = function() {
      container.classList.add('pictures-failure');
    };
    xhr.send();
    container.classList.remove('pictures-loading');
  }

  /**
  /* Отрисовка картинок
   * @param {Array.<Object>} picturesToRender
   * @param {int} pageNumber
   * @param {boolean=} replace - флаг, заставляющий чистить контейнер перед
   *        добавлением новых картинок
   * @returns {boolean} continueRender - возвращает истину, если есть массив
   * pagePictures не пустой, т.е. есть ещё что порендерить :)
   */
  function renderPictures(picturesToRender, pageNumber, replace) {
    if (replace) {
      container.innerHTML = '';
    }
    var fragment = document.createDocumentFragment();

    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = picturesToRender.slice(from, to);

    pagePictures.forEach(function(picture) {
      var element = getElementFromTemplate(picture);
      fragment.appendChild(element);
    });
    container.appendChild(fragment);

    if (pagePictures.length > 0) {
      return true;
    } else {
      return false;
    }
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
      picImage.height = PICTURE_HEIGHT;
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
    filteredPictures = pictures.slice(0);
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
    currentPage = 0;
    renderPictures(filteredPictures, currentPage, true);
    populatePicsOnScreen();
  }

  // проставляем onclick события для фильтров методом делегирования
  var filtersForm = document.querySelector('.filters');
  filtersForm.addEventListener('click', function(evt) {
    var clickedEl = evt.target;
    setActiveFilter(clickedEl);
  });

  function populatePicsOnScreen() {
    var containerBottomY = container.getBoundingClientRect().bottom;
    var continueRender = true;
    // Т.к. футера относительно которого было бы удобно спозиционировать нет, то
    // рендерим след.порцию по достижению нижней границы контейнера + высота картинки /2
    // и только в том случае, если ещё есть что рендерить (continueRender = true)
    while (continueRender && containerBottomY - PICTURE_HEIGHT / 2 <= window.innerHeight) {
      continueRender = renderPictures(filteredPictures, ++currentPage);
      // пересчитываем координаты контейнера
      containerBottomY = container.getBoundingClientRect().bottom;
    }
  }

})();
