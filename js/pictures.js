'use strict';

var Photo = require('photo');
var Gallery = require('gallery');
var Video = require('video');

(function() {
  /** @type {Array.<Object>} - массив JSON-данных, получаемых по AJAX */
  var pictures = [];

  /** @type {Array.<Photo|Video>} - массив обработанных медиа-объектов */
  var renderedPhotos = [];

  /** @type {integer} текущая страница - сдвиг для slice по массиву pictures */
  var currentPage = 0;

  /** @type {integer} используется для реализации throttling */
  var scrollTimeout;

  /** @type {boolean} есть ли в сырых json-данных pictures необработанные объекты? */
  var continueRender = false;

  /** @constant кол-во отрисовываемых обхектов за раз, при заполнении странице
  * @type {integer}
  */
  var PAGE_SIZE = 12;

  /** @constant высота картинки в галерее
  * @type {integer}
  */
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

    xhr.open('GET', 'http://o0.github.io/assets/json/pictures.json');
    xhr.timeout = 10000;
    xhr.onload = function(evt) {
      pictures = JSON.parse(evt.target.response);
      continueRender = prepareObjects(0);
      // размазываем по ширине экрана, если необходимо
      populatePicsOnScreen();
      var filterName = localStorage.getItem('currentFilter') || 'popular';
      setActiveFilter(filterName);
      document.getElementById('filter-' + filterName).checked = true;
      toggleGallery();
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
        location.hash = 'photo/' + photoElement.getSrc();
        //gallery.show();
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
  * @param {HTMLElement|string} filter - нажатая кнопка фильтра, либо строка
  *                                      с именем фильтра
  */

  function setActiveFilter(filter) {
    var filterName = typeof filter === 'object' ? filter.value : filter;
    switch (filterName) {
      case 'discussed': renderedPhotos.sort(function(a, b) {
        return b.getComments() - a.getComments();
      });
        break;
      case 'new': renderedPhotos.sort(function(a, b) {
        return b.getDate() - a.getDate();
      });
        break;
      case 'popular': renderedPhotos.sort(function(a, b) {
        return b.getLikes() - a.getLikes();
      });
        break;
    }
    localStorage.setItem('currentFilter', filterName);
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

  /**
  * @function toggleGallery ищет совпадение с regExp в строке браузера,
  *                         если находит - открывает галерею.
  */

  function toggleGallery() {
    var regExp = /#photo\/(\S+)/;
    var src = location.hash.match(regExp);
    if (src && src[1]) {
      gallery.setCurrentPicture(src[1]);
      gallery.show();
    }
  }

  /** проставляем onclick события для фильтров методом делегирования */
  filtersForm.addEventListener('click', function(evt) {
    var clickedEl = evt.target;
    setActiveFilter(clickedEl);
  });

  /**
  * Throttling для скролла по странице и заполнение фотографиями порциями по PAGE_SIZE
  */
  window.addEventListener('scroll', function() {
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(populatePicsOnScreen, 100);
  });

  /**
  * Открываем галерею при изменнии hash в строке браузера
  */
  window.addEventListener('hashchange', toggleGallery);

})();
