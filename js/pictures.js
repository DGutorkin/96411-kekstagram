/* global Photo: true, Gallery: true, Video: true */
'use strict';
(function() {
  var pictures = [];
  var renderedPhotos = [];
  var currentPage = 0;
  var scrollTimeout;
  var continueRender = false;
  var PAGE_SIZE = 12;
  var PICTURE_HEIGHT = 182;
  var container = document.querySelector('.pictures');
  var filtersForm = document.querySelector('.filters');
  var gallery = new Gallery();

  getData();
  filtersForm.classList.remove('hidden');

  function getData() {
    //ставим заглушку-загрузчик
    container.classList.add('pictures-loading');

    var xhr = new XMLHttpRequest();

    //xhr.open('GET', 'http://127.0.0.1:3000/pictures.json');
    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = 10000;
    xhr.onload = function(evt) {
      pictures = JSON.parse(evt.target.response);
      continueRender = prepareObjects(0);
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
  * Отображение картинок на странице из массива renderedPhotos
   * @param {boolean=} replace - флаг, заставляющий чистить контейнер перед
   *        добавлением новых картинок
   */
  function renderPictures(replace) {
    if (replace) {
      [].forEach.call(renderedPhotos, function(photoObj) {
        container.removeChild(photoObj.element);
      });
    }
    var fragment = document.createDocumentFragment();
    renderedPhotos.forEach(function(photoObj) {
      fragment.appendChild( photoObj.element );
    });
    container.appendChild(fragment);
  }

  /**
  * Обрабатывает массив JSON-данных, превращая его элементы в объекты Photo.
  * @param {integer} pageNumber - номер страницы, для последовательной обработки.
  * @returns {boolean} continueRender - возвращает истину, если массив сырых
  * данных имеет столько же элементов, сколько массив объектов
  * => больше нечего "инстанциировать"
  */

  function prepareObjects(pageNumber) {
    var from = pageNumber * PAGE_SIZE;
    var to = from + PAGE_SIZE;
    var pagePictures = pictures.slice(from, to);

    pagePictures.forEach(function(data) {
      var photoElement = data.url.search(/mp4/) < 0 ? new Photo() : new Video();
      photoElement.setData(data);
      photoElement.render();
      photoElement.element.onClick = function() {
        gallery.setCurrentPicture( renderedPhotos.indexOf(photoElement) );
        gallery.show();
      };
      renderedPhotos.push(photoElement);
    });
    gallery.setPictures(renderedPhotos);
    renderPictures();

    return pictures.length !== renderedPhotos.length;
  }

  /**
  * Сортирует массив с уже обработанными фотографиями в зависимости от
  * выбранного фильтра. В конце работы вызывает renderPictures, обновляя
  * тем самым контейнер и отрисовывает заново отсортированные фотографии
  * @param {HTMLElement} btn - нажатая кнопка фильтра.
  */

  function setActiveFilter(btn) {
    var filterName = btn.value;
    switch (filterName) {
      case 'discussed': renderedPhotos.sort(function(a, b) {
        return b.getComments() - a.getComments();
      });
        break;
      case 'new': renderedPhotos.sort(function(a, b) {
        return b.getDate() - a.getDate();
      });
        break;
      default: renderedPhotos.sort(function(a, b) {
        return b.getLikes() - a.getLikes();
      });
        break;
    }
    renderPictures(true);
  }

  /**
  * Функция заполнения экрана картинками по PAGE_SIZE раз за итерацию.
  * Т.к. футера относительно которого было бы удобно спозиционировать нет, то
  * рендерим след.порцию по достижению нижней границы контейнера - высота картинки /2
  * и только в том случае, если ещё есть что рендерить (continueRender = true)
  */
  function populatePicsOnScreen() {
    var containerBottomY = container.getBoundingClientRect().bottom;
    while (continueRender && containerBottomY - PICTURE_HEIGHT / 2 <= window.innerHeight ) {
      // обновляем контейнер фотками и пересчитываем его координаты
      continueRender = prepareObjects(++currentPage);
      containerBottomY = container.getBoundingClientRect().bottom;
    }
  }

  // проставляем onclick события для фильтров методом делегирования
  filtersForm.addEventListener('click', function(evt) {
    var clickedEl = evt.target;
    setActiveFilter(clickedEl);
  });

  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(populatePicsOnScreen, 100);
  });

  window.rP = renderedPhotos;

})();
