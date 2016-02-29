/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	__webpack_require__(1);
	__webpack_require__(1);
	module.exports = __webpack_require__(11);


/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(2);
	__webpack_require__(4);


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

	/* global docCookies */
	'use strict';

	var Resizer = __webpack_require__(3);

	/**
	 * @fileoverview
	 * @author Igor Alexeenko (o0)
	 */

	(function() {
	  /** @enum {string} */
	  var FileType = {
	    'GIF': '',
	    'JPEG': '',
	    'PNG': '',
	    'SVG+XML': ''
	  };

	  /** @enum {number} */
	  var Action = {
	    ERROR: 0,
	    UPLOADING: 1,
	    CUSTOM: 2
	  };


	  /**
	   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
	   * из ключей FileType.
	   * @type {RegExp}
	   */
	  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

	  /**
	   * @type {Object.<string, string>}
	   */
	  var filterMap;

	  /**
	   * Объект, который занимается кадрированием изображения.
	   * @type {Resizer}
	   */
	  var currentResizer;

	  /**
	   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
	   * изображением.
	   */
	  function cleanupResizer() {
	    if (currentResizer) {
	      currentResizer.remove();
	      currentResizer = null;
	    }
	  }

	  /**
	   * Ставит одну из трех случайных картинок на фон формы загрузки.
	   */
	  function updateBackground() {
	    var images = [
	      'img/logo-background-1.jpg',
	      'img/logo-background-2.jpg',
	      'img/logo-background-3.jpg'
	    ];

	    var backgroundElement = document.querySelector('.upload');
	    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
	    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
	  }

	  /**
	   * Проверяет, валидны ли данные, в форме кадрирования.
	   * @return {boolean}
	   */
	  function resizeFormIsValid() {
	    var resizeXField = +document.getElementById('resize-x').value;
	    var resizeYField = +document.getElementById('resize-y').value;
	    var resizeSizeField = +document.getElementById('resize-size').value;
	    var resizeBtn = document.getElementById('resize-fwd');

	    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
	        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
	      resizeBtn.disabled = true;
	    } else {
	      resizeBtn.disabled = false;
	    }

	    return resizeXField < 0 || resizeYField < 0 ? false : true;
	  }

	  /**
	   * Форма загрузки изображения.
	   * @type {HTMLFormElement}
	   */
	  var uploadForm = document.forms['upload-select-image'];

	  /**
	   * Форма кадрирования изображения.
	   * @type {HTMLFormElement}
	   */
	  var resizeForm = document.forms['upload-resize'];

	  /**
	   * Форма добавления фильтра.
	   * @type {HTMLFormElement}
	   */
	  var filterForm = document.forms['upload-filter'];

	  /**
	   * @type {HTMLImageElement}
	   */
	  var filterImage = filterForm.querySelector('.filter-image-preview');

	  /**
	   * @type {HTMLElement}
	   */
	  var uploadMessage = document.querySelector('.upload-message');

	  /**
	   * @param {Action} action
	   * @param {string=} message
	   * @return {Element}
	   */
	  function showMessage(action, message) {
	    var isError = false;

	    switch (action) {
	      case Action.UPLOADING:
	        message = message || 'Кексограмим&hellip;';
	        break;

	      case Action.ERROR:
	        isError = true;
	        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
	        break;
	    }

	    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
	    uploadMessage.classList.remove('invisible');
	    uploadMessage.classList.toggle('upload-message-error', isError);
	    return uploadMessage;
	  }

	  function hideMessage() {
	    uploadMessage.classList.add('invisible');
	  }

	  function setFilter(filterName) {
	    if (!filterMap) {
	      // Ленивая инициализация. Объект не создается до тех пор, пока
	      // не понадобится прочитать его в первый раз, а после этого запоминается
	      // навсегда.
	      filterMap = {
	        'none': 'filter-none',
	        'chrome': 'filter-chrome',
	        'sepia': 'filter-sepia'
	      };
	    }

	    // подсвечиваем выбранный фильтр
	    document.getElementById('upload-filter-' + filterName).checked = true;

	    // Класс перезаписывается, а не обновляется через classList потому что нужно
	    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
	    // состояние или просто перезаписывать.
	    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

	    // сохраняем в кукис
	    var closestDoB = new Date('2015-07-12');
	    var dateToExpire = new Date(
	      Date.now() + (Date.now() - closestDoB)
	    ).toUTCString();

	    docCookies.setItem('filter', filterName, dateToExpire);
	  }

	  /**
	   * Функция синхронизации ресайзера и формы
	   */
	  function syncResizer() {
	    if (currentResizer) {
	      var constraints = currentResizer.getConstraint();
	      document.getElementById('resize-x').value = constraints.x;
	      document.getElementById('resize-y').value = constraints.y;
	      document.getElementById('resize-size').value = constraints.side;
	    }
	  }

	  /**
	   * Обработчик изменения изображения в форме загрузки. Если загруженный
	   * файл является изображением, считывается исходник картинки, создается
	   * Resizer с загруженной картинкой, добавляется в форму кадрирования
	   * и показывается форма кадрирования.
	   * @param {Event} evt
	   */
	  uploadForm.addEventListener('change', function(evt) {
	    var element = evt.target;
	    if (element.id === 'upload-file') {
	      // Проверка типа загружаемого файла, тип должен быть изображением
	      // одного из форматов: JPEG, PNG, GIF или SVG.
	      if (fileRegExp.test(element.files[0].type)) {
	        var fileReader = new FileReader();

	        showMessage(Action.UPLOADING);

	        fileReader.onload = function() {
	          cleanupResizer();

	          currentResizer = new Resizer(fileReader.result);
	          currentResizer.setElement(resizeForm);
	          uploadMessage.classList.add('invisible');

	          uploadForm.classList.add('invisible');
	          resizeForm.classList.remove('invisible');

	          hideMessage();
	          setTimeout(syncResizer, 10);
	        };

	        fileReader.readAsDataURL(element.files[0]);
	      } else {
	        // Показ сообщения об ошибке, если загружаемый файл, не является
	        // поддерживаемым изображением.
	        showMessage(Action.ERROR);
	      }
	    }
	  });

	  /**
	   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('change', function(evt) {
	    // вынес в отдельные переменные для лучшей читаемости
	    resizeFormIsValid();
	    // получаем текущие координаты ресайзера
	    var constraints = currentResizer.getConstraint();

	    var changedElement = evt.target;
	    var newVal = +changedElement.value;

	    // двигаем ресайзер в зависимости от того, какое поле поменялось
	    switch (changedElement.name) {
	      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
	        break;
	      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
	        break;
	      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
	        break;
	    }
	  });

	  /**
	   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
	   * и обновляет фон.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('reset', function(evt) {
	    evt.preventDefault();

	    cleanupResizer();
	    updateBackground();

	    resizeForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  });

	  /**
	   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
	   * кропнутое изображение в форму добавления фильтра и показывает ее.
	   * @param {Event} evt
	   */
	  resizeForm.addEventListener('submit', function(evt) {
	    evt.preventDefault();

	    if (resizeFormIsValid()) {
	      filterImage.src = currentResizer.exportImage().src;

	      resizeForm.classList.add('invisible');
	      filterForm.classList.remove('invisible');
	    }
	  });

	  /**
	   * Сброс формы фильтра. Показывает форму кадрирования.
	   * @param {Event} evt
	   */
	  filterForm.addEventListener('reset', function(evt) {
	    evt.preventDefault();

	    filterForm.classList.add('invisible');
	    resizeForm.classList.remove('invisible');
	  });

	  /**
	   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
	   * записав сохраненный фильтр в cookie.
	   * @param {Event} evt
	   */
	  filterForm.addEventListener('submit', function(evt) {
	    evt.preventDefault();

	    cleanupResizer();
	    updateBackground();

	    filterForm.classList.add('invisible');
	    uploadForm.classList.remove('invisible');
	  });

	  /**
	   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
	   * выбранному значению в форме.
	   */
	  filterForm.addEventListener('change', function() {
	    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
	      return item.checked;
	    })[0].value;
	    setFilter(selectedFilter);
	  });

	  cleanupResizer();
	  updateBackground();
	  // выставляем фильтр, если находим его в кукисах
	  if (docCookies.getItem('filter') === null) {
	    setFilter('none');
	  } else {
	    setFilter( docCookies.getItem('filter') );
	  }

	  window.addEventListener('resizerchange', syncResizer);


	})();


/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * @constructor
	 * @param {string} image
	 */
	var Resizer = function(image) {
	  // Изображение, с которым будет вестись работа.
	  this._image = new Image();
	  this._image.src = image;

	  // Холст.
	  this._container = document.createElement('canvas');
	  this._ctx = this._container.getContext('2d');

	  // Создаем холст только после загрузки изображения.
	  this._image.onload = function() {
	    // Размер холста равен размеру загруженного изображения. Это нужно
	    // для удобства работы с координатами.
	    this._container.width = this._image.naturalWidth;
	    this._container.height = this._image.naturalHeight;

	    /**
	     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
	     * стороны изображения.
	     * @const
	     * @type {number}
	     */
	    var INITIAL_SIDE_RATIO = 0.75;
	    // Размер меньшей стороны изображения.
	    var side = Math.min(
	        this._container.width * INITIAL_SIDE_RATIO,
	        this._container.height * INITIAL_SIDE_RATIO);

	    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
	    // от размера меньшей стороны.
	    this._resizeConstraint = new Square(
	        this._container.width / 2 - side / 2,
	        this._container.height / 2 - side / 2,
	        side);

	    // Отрисовка изначального состояния канваса.
	    this.redraw();
	  }.bind(this);

	  // Фиксирование контекста обработчиков.
	  this._onDragStart = this._onDragStart.bind(this);
	  this._onDragEnd = this._onDragEnd.bind(this);
	  this._onDrag = this._onDrag.bind(this);
	};

	Resizer.prototype = {
	  /**
	   * Родительский элемент канваса.
	   * @type {Element}
	   * @private
	   */
	  _element: null,

	  /**
	   * Положение курсора в момент перетаскивания. От положения курсора
	   * рассчитывается смещение на которое нужно переместить изображение
	   * за каждую итерацию перетаскивания.
	   * @type {Coordinate}
	   * @private
	   */
	  _cursorPosition: null,

	  /**
	   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
	   * от верхнего левого угла исходного изображения.
	   * @type {Square}
	   * @private
	   */
	  _resizeConstraint: null,

	  /**
	   * Отрисовка канваса.
	   */
	  redraw: function() {
	    // Очистка изображения.
	    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

	    // Параметры линии.
	    // NB! Такие параметры сохраняются на время всего процесса отрисовки
	    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
	    // чего-либо с другой обводкой.

	    // Толщина линии.
	    this._ctx.lineWidth = 6;
	    // Цвет обводки.
	    this._ctx.strokeStyle = '#ffe753';

	    // Сохранение состояния канваса.
	    // Подробней см. строку 132.
	    this._ctx.save();

	    // Установка начальной точки системы координат в центр холста.
	    this._ctx.translate(this._container.width / 2, this._container.height / 2);

	    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
	    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
	    // Отрисовка изображения на холсте. Параметры задают изображение, которое
	    // нужно отрисовать и координаты его верхнего левого угла.
	    // Координаты задаются от центра холста.

	    this._ctx.drawImage(this._image, displX, displY);

	    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
	    // взяты из начального кода отрисовки рамки
	    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
	    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
	    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
	    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

	    // ставим прозрачность 0.8
	    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
	    this._ctx.beginPath();

	    // рисуем зиг-заг прямоугольник
	    zigzagRect(this._ctx, x0, y0, x1, y1);

	    // после этого обводим рамку по внешнему периметру
	    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
	    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
	    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
	    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
	    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
	    // заливаем получившуюся фигуру
	    this._ctx.fill();

	    // рисуем центрированный текст
	    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
	    this._ctx.fillStyle = '#FFF';
	    this._ctx.textAlign = 'center';
	    this._ctx.textBaseline = 'bottom';
	    this._ctx.font = 'normal 30px Arial';
	    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

	    // Восстановление состояния канваса, которое было до вызова ctx.save
	    // и последующего изменения системы координат. Нужно для того, чтобы
	    // следующий кадр рисовался с привычной системой координат, где точка
	    // 0 0 находится в левом верхнем углу холста, в противном случае
	    // некорректно сработает даже очистка холста или нужно будет использовать
	    // сложные рассчеты для координат прямоугольника, который нужно очистить.
	    this._ctx.restore();
	  },

	  /**
	   * Включение режима перемещения. Запоминается текущее положение курсора,
	   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
	   * позволяющие перерисовывать изображение по мере перетаскивания.
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  _enterDragMode: function(x, y) {
	    this._cursorPosition = new Coordinate(x, y);
	    document.body.addEventListener('mousemove', this._onDrag);
	    document.body.addEventListener('mouseup', this._onDragEnd);
	  },

	  /**
	   * Выключение режима перемещения.
	   * @private
	   */
	  _exitDragMode: function() {
	    this._cursorPosition = null;
	    document.body.removeEventListener('mousemove', this._onDrag);
	    document.body.removeEventListener('mouseup', this._onDragEnd);
	  },

	  /**
	   * Перемещение изображения относительно кадра.
	   * @param {number} x
	   * @param {number} y
	   * @private
	   */
	  updatePosition: function(x, y) {
	    this.moveConstraint(
	        this._cursorPosition.x - x,
	        this._cursorPosition.y - y);
	    this._cursorPosition = new Coordinate(x, y);
	  },

	  /**
	   * @param {MouseEvent} evt
	   * @private
	   */
	  _onDragStart: function(evt) {
	    this._enterDragMode(evt.clientX, evt.clientY);
	  },

	  /**
	   * Обработчик окончания перетаскивания.
	   * @private
	   */
	  _onDragEnd: function() {
	    this._exitDragMode();
	  },

	  /**
	   * Обработчик события перетаскивания.
	   * @param {MouseEvent} evt
	   * @private
	   */
	  _onDrag: function(evt) {
	    this.updatePosition(evt.clientX, evt.clientY);
	  },

	  /**
	   * Добавление элемента в DOM.
	   * @param {Element} element
	   */
	  setElement: function(element) {
	    if (this._element === element) {
	      return;
	    }

	    this._element = element;
	    this._element.insertBefore(this._container, this._element.firstChild);
	    // Обработчики начала и конца перетаскивания.
	    this._container.addEventListener('mousedown', this._onDragStart);
	  },

	  /**
	   * Возвращает кадрирование элемента.
	   * @return {Square}
	   */
	  getConstraint: function() {
	    return this._resizeConstraint;
	  },

	  /**
	   * Смещает кадрирование на значение указанное в параметрах.
	   * @param {number} deltaX
	   * @param {number} deltaY
	   * @param {number} deltaSide
	   */
	  moveConstraint: function(deltaX, deltaY, deltaSide) {
	    this.setConstraint(
	        this._resizeConstraint.x + (deltaX || 0),
	        this._resizeConstraint.y + (deltaY || 0),
	        this._resizeConstraint.side + (deltaSide || 0));
	  },

	  /**
	   * @param {number} x
	   * @param {number} y
	   * @param {number} side
	   */
	  setConstraint: function(x, y, side) {
	    if (typeof x !== 'undefined') {
	      this._resizeConstraint.x = x;
	    }

	    if (typeof y !== 'undefined') {
	      this._resizeConstraint.y = y;
	    }

	    if (typeof side !== 'undefined') {
	      this._resizeConstraint.side = side;
	    }

	    requestAnimationFrame(function() {
	      this.redraw();
	      window.dispatchEvent(new CustomEvent('resizerchange'));
	    }.bind(this));
	  },

	  /**
	   * Удаление. Убирает контейнер из родительского элемента, убирает
	   * все обработчики событий и убирает ссылки.
	   */
	  remove: function() {
	    this._element.removeChild(this._container);

	    this._container.removeEventListener('mousedown', this._onDragStart);
	    this._container = null;
	  },

	  /**
	   * Экспорт обрезанного изображения как HTMLImageElement и исходником
	   * картинки в src в формате dataURL.
	   * @return {Image}
	   */
	  exportImage: function() {
	    // Создаем Image, с размерами, указанными при кадрировании.
	    var imageToExport = new Image();

	    // Создается новый canvas, по размерам совпадающий с кадрированным
	    // изображением, в него добавляется изображение взятое из канваса
	    // с измененными координатами и сохраняется в dataURL, с помощью метода
	    // toDataURL. Полученный исходный код, записывается в src у ранее
	    // созданного изображения.
	    var temporaryCanvas = document.createElement('canvas');
	    var temporaryCtx = temporaryCanvas.getContext('2d');
	    temporaryCanvas.width = this._resizeConstraint.side;
	    temporaryCanvas.height = this._resizeConstraint.side;
	    temporaryCtx.drawImage(this._image,
	        -this._resizeConstraint.x,
	        -this._resizeConstraint.y);
	    imageToExport.src = temporaryCanvas.toDataURL('image/png');

	    return imageToExport;
	  }
	};

	/**
	 * Вспомогательный тип, описывающий квадрат.
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @param {number} side
	 * @private
	 */
	var Square = function(x, y, side) {
	  this.x = x;
	  this.y = y;
	  this.side = side;
	};

	/**
	 * Вспомогательный тип, описывающий координату.
	 * @constructor
	 * @param {number} x
	 * @param {number} y
	 * @private
	 */
	var Coordinate = function(x, y) {
	  this.x = x;
	  this.y = y;
	};

	var zigzagRect = function(ctx, x0, y0, x1, y1) {
	  var xStart = x0;
	  var yStart = y0;

	  ctx.fillColor = 'black';
	  ctx.moveTo(x0, y0);
	  ctx.beginPath();
	  // длина зиг-заг линии
	  var line = 5;

	  var step = 0;

	  // слева направо - двигаемся по ox
	  while (x0 < x1) {
	    if (step % 2 === 0) {
	      x0 = x0 + line;
	      y0 = y0 + Math.abs(line);
	      ctx.lineTo(x0, y0);
	    } else {
	      x0 = x0 + line;
	      y0 = y0 - Math.abs(line);
	      ctx.lineTo(x0, y0);
	    }
	    step++;
	  }

	  // потом вниз  - двигаемся по oy
	  while (y0 < y1) {
	    if (step % 2 === 0) {
	      x0 = x0 + Math.abs(line);
	      y0 = y0 + line;
	      ctx.lineTo(x0, y0);
	    } else {
	      x0 = x0 - Math.abs(line);
	      y0 = y0 + line;
	      ctx.lineTo(x0, y0);
	    }
	    step++;
	  }

	  line = line * -1;
	  // налево
	  while (x0 > xStart) {
	    if (step % 2 === 0) {
	      x0 = x0 + line;
	      y0 = y0 + Math.abs(line);
	      ctx.lineTo(x0, y0);
	    } else {
	      x0 = x0 + line;
	      y0 = y0 - Math.abs(line);
	      ctx.lineTo(x0, y0);
	    }
	    step++;
	  }

	  // замыкаем вверх
	  while (y0 + line > yStart ) {
	    if (step % 2 === 0) {
	      x0 = x0 + Math.abs(line);
	      y0 = y0 + line;
	      ctx.lineTo(x0, y0);
	    } else {
	      x0 = x0 - Math.abs(line);
	      y0 = y0 + line;
	      ctx.lineTo(x0, y0);
	    }
	    step++;
	  }
	  ctx.stroke();
	};

	module.exports = Resizer;


/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var Photo = __webpack_require__(5);
	var Gallery = __webpack_require__(8);
	var Video = __webpack_require__(10);

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
	      setActiveFilter( localStorage.getItem('currentFilter') || 'popular' );
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
	    document.getElementById('filter-' + filterName).checked = true;
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


/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherit = __webpack_require__(6);
	var PhotoBase = __webpack_require__(7);

	/** Класс, представляющий фотографию на странице.
	* @module Photo
	* @constructor
	* @extends {PhotoBase}
	*/
	function Photo() {
	  this.mediatype = 'img';
	}
	inherit(Photo, PhotoBase);

	/**
	* Подгрузка изображения и создание картинки из шаблона
	*/
	Photo.prototype.render = function() {
	  var template = document.getElementById('picture-template');
	  this.element = template.content.children[0].cloneNode(true);
	  this.element.querySelector('.picture-comments').textContent = this.getComments();
	  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
	  picImage.src = this.getSrc();

	  this.element.addEventListener('click', this._onClick);
	  return this.element;
	};

	/** @function updateLikes - обновление кол-ва лайков в галерее */
	Photo.prototype.updateLikes = function() {
	  this.element.querySelector('.picture-likes').textContent = this.getLikes();
	};

	Photo.prototype.onClick = null;

	Photo.prototype._onClick = function(evt) {
	  evt.preventDefault();
	  if ( !this.classList.contains('picture-load-failure') ) {
	    if (typeof this.onClick === 'function') {
	      this.onClick();
	    }
	  }
	};

	module.exports = Photo;


/***/ },
/* 6 */
/***/ function(module, exports) {

	'use strict';
	/**
	* @module inherit - реализует наследование классов, копированием прототипа
	*                   через временный класс
	* @param {Object} потомок
	* @param {Object} родитель
	*/
	function inherit(Child, Parent) {
	  var TempConstructor = function() {};
	  TempConstructor.prototype = Parent.prototype;
	  Child.prototype = new TempConstructor();
	  Child.prototype.constructor = Child;
	}
	module.exports = inherit;


/***/ },
/* 7 */
/***/ function(module, exports) {

	'use strict';

	/** Базовый класс для медиа-элементов
	* @module PhotoBase
	* @constructor
	*/
	function PhotoBase() {
	}

	/** @type {Object} данные получаемые по AJAX*/
	PhotoBase.prototype._data = null;

	/**
	* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
	* переключении - определяет играть ли видео или нет.
	*/
	PhotoBase.prototype.mediatype = null;

	/**
	* Сохраняет медиа-данные в объекте и прописывает медиатип
	*/
	PhotoBase.prototype.setData = function(data) {
	  this._data = data;
	  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
	    this.mediatype = 'img';
	  } else {
	    this.mediatype = 'video';
	  }
	  this._data.liked = data.liked ? true : false;
	};

	/** @return {Object} - геттер данных объекта */

	PhotoBase.prototype.getData = function() {
	  return this._data;
	};

	/**
	* Функции-геттеры, используемые в сортировках/фильтрации
	*/
	PhotoBase.prototype.getLikes = function() {
	  return parseInt(this.getData().likes, 10);
	};

	PhotoBase.prototype.getComments = function() {
	  return parseInt(this.getData().comments, 10);
	};

	PhotoBase.prototype.getDate = function() {
	  return new Date(this.getData().date);
	};

	PhotoBase.prototype.getSrc = function() {
	  return this.getData().url;
	};



	/** Like dispatcher :) */
	PhotoBase.prototype.setLikes = function(likes) {
	  this._data.likes = likes;
	};

	PhotoBase.prototype.like = function() {
	  this.setLikes( this.getLikes() + 1 );
	  this._data.liked = true;
	};

	PhotoBase.prototype.dislike = function() {
	  this.setLikes( this.getLikes() - 1 );
	  this._data.liked = false;
	};

	PhotoBase.prototype.liked = function() {
	  return this._data.liked;
	};

	module.exports = PhotoBase;


/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var PhotoPreview = __webpack_require__(9);
	var preview = new PhotoPreview();
	var KEYCODE = {
	  'ESC': 27,
	  'LEFT': 37,
	  'RIGHT': 39
	};
	/** Класс, представляющий галерею.
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
	  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
	  currentIndex: null,

	  /**
	  * Показывает галерею и проставляет eventListeners
	  */
	  show: function() {
	    this.element.classList.remove('invisible');

	    this._closeBtn.addEventListener('click', this._onCloseClick);
	    this._likeBtn.addEventListener('click', this._onLikeClick);
	    this._photo.addEventListener('click', this._onPhotoClick);
	    this._video.addEventListener('click', this._onVideoClick);
	    window.addEventListener('keydown', this._onDocumentKeyDown);
	  },

	  /**
	  * Прячет галерею и удаляет eventListeners, сбрасывает location.hash
	  */
	  hide: function() {
	    this.element.classList.add('invisible');
	    this._photo.removeEventListener('click', this._onPhotoClick);
	    this._video.removeEventListener('click', this._onVideoClick);
	    this._closeBtn.removeEventListener('click', this._onCloseClick);
	    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
	    window.removeEventListener('keydown', this._onDocumentKeyDown);
	    location.hash = '';
	  },

	  /**
	  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
	  * @param {Array.<Photo>} photos
	  */
	  setPictures: function(photos) {
	    this.data = photos;
	  },

	  /**
	  * @param {integer|string} ind - индекс элемента Photo в this.data или
	  * getSrc() этого элемента.
	  */
	  setCurrentPicture: function(ind) {
	    if (typeof ind === 'number') {
	      preview.setData(this.data[ind].getData());
	      this.currentIndex = ind;
	    } else if (typeof ind === 'string') {
	      var item = this.data.filter(function( obj ) {
	        return obj.getSrc() === ind;
	      })[0];
	      this.currentIndex = this.data.indexOf(item);
	      preview.setData(item.getData());
	    }
	    if (!preview) {
	      return false;
	    }
	    preview.render(this.element);
	  },

	  /**
	  * Устанавливает hash в строке браузера в соответствии с getSrc()
	  * элемента, индекс которого передан
	  * @param {integer} ind
	  */
	  updateHash: function(ind) {
	    location.hash = location.hash = 'photo/' + this.data[ind].getSrc();
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

	  /**
	  * Обработчик кликов лайка в галерее
	  */
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

	  /**
	  * Управление проигрыванием видео.
	  */
	  _onVideoClick: function(evt) {
	    if (evt.target.tagName === 'VIDEO') {
	      if (this.paused) {
	        this.play();
	      } else {
	        this.pause();
	      }
	    }
	  },

	  /**
	  * Клавиатурные события: переключение объектов галереи, выход из галереи
	  */
	  _onDocumentKeyDown: function(evt) {
	    this._video.pause();
	    switch (evt.keyCode) {
	      case KEYCODE.ESC: this.hide();
	        break;
	      case KEYCODE.LEFT: this.updateHash(--this.currentIndex);
	        break;
	      case KEYCODE.RIGHT: if (this.currentIndex < this.data.length - 1) {
	        this.updateHash(++this.currentIndex);
	      }
	        break;
	    }
	  }
	};

	module.exports = Gallery;


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherit = __webpack_require__(6);
	var PhotoBase = __webpack_require__(7);

	/** Объект, используемый для показа фото/видео в галерее
	* @module PhotoPreview
	* @constructor
	* @extends {PhotoBase}
	*/
	function PhotoPreview() {
	}

	inherit(PhotoPreview, PhotoBase);

	/**
	* Отрисовывает лайк, в зависимости от данных в объкете
	* и показывает/прячет видео-блок, проверяя mediatype
	*/

	PhotoPreview.prototype.render = function(el, noauto) {
	  el.querySelector('.likes-count').textContent = this.getLikes();
	  el.querySelector('.comments-count').textContent = this.getComments();
	  if ( this.liked() ) {
	    el.querySelector('.likes-count').classList.add('likes-count-liked');
	  } else {
	    el.querySelector('.likes-count').classList.remove('likes-count-liked');
	  }
	  if (this.mediatype === 'img') {
	    el.querySelector('.gallery-overlay-video').style.display = 'none';
	    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
	    el.querySelector('.gallery-overlay-image').src = this.getSrc();
	  } else if (this.mediatype === 'video') {
	    el.querySelector('.gallery-overlay-image').style.display = 'none';
	    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
	    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
	    el.querySelector('.gallery-overlay-video').src = this.getSrc();
	  }
	};

	module.exports = PhotoPreview;


/***/ },
/* 10 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var inherit = __webpack_require__(6);
	var Photo = __webpack_require__(5);

	/** Объект, представляющий видео-элемент в галерее
	* @constructor
	* @extends {Photo}
	*/
	function Video() {
	  this.mediatype = 'video';
	}
	inherit(Video, Photo);

	/**
	* Подгрузка данных и создание видео-элемента
	*/
	Video.prototype.render = function() {
	  var template = document.getElementById('picture-template');
	  this.element = template.content.children[0].cloneNode(true);
	  this.element.querySelector('.picture-comments').textContent = this.getComments();
	  this.element.querySelector('.picture-likes').textContent = this.getLikes();

	  var videoElement = document.createElement('video');
	  videoElement.width = 182;
	  videoElement.height = 182;
	  videoElement.src = this.getSrc();
	  this.element.replaceChild(videoElement, this.element.firstElementChild);

	  this.element.addEventListener('click', this._onClick);
	  return this.element;
	};


	Video.prototype.onClick = null;

	Video.prototype._onClick = function(evt) {
	  evt.preventDefault();
	  if (typeof this.onClick === 'function') {
	    this.onClick();
	  }
	};

	module.exports = Video;


/***/ },
/* 11 */
/***/ function(module, exports) {

	/******/ (function(modules) { // webpackBootstrap
	/******/ 	// The module cache
	/******/ 	var installedModules = {};

	/******/ 	// The require function
	/******/ 	function __webpack_require__(moduleId) {

	/******/ 		// Check if module is in cache
	/******/ 		if(installedModules[moduleId])
	/******/ 			return installedModules[moduleId].exports;

	/******/ 		// Create a new module (and put it into the cache)
	/******/ 		var module = installedModules[moduleId] = {
	/******/ 			exports: {},
	/******/ 			id: moduleId,
	/******/ 			loaded: false
	/******/ 		};

	/******/ 		// Execute the module function
	/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

	/******/ 		// Flag the module as loaded
	/******/ 		module.loaded = true;

	/******/ 		// Return the exports of the module
	/******/ 		return module.exports;
	/******/ 	}


	/******/ 	// expose the modules object (__webpack_modules__)
	/******/ 	__webpack_require__.m = modules;

	/******/ 	// expose the module cache
	/******/ 	__webpack_require__.c = installedModules;

	/******/ 	// __webpack_public_path__
	/******/ 	__webpack_require__.p = "";

	/******/ 	// Load entry module and return exports
	/******/ 	return __webpack_require__(0);
	/******/ })
	/************************************************************************/
	/******/ ([
	/* 0 */
	/***/ function(module, exports, __webpack_require__) {

		__webpack_require__(1);
		__webpack_require__(1);
		module.exports = __webpack_require__(11);


	/***/ },
	/* 1 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		__webpack_require__(2);
		__webpack_require__(4);


	/***/ },
	/* 2 */
	/***/ function(module, exports, __webpack_require__) {

		/* global docCookies */
		'use strict';

		var Resizer = __webpack_require__(3);

		/**
		 * @fileoverview
		 * @author Igor Alexeenko (o0)
		 */

		(function() {
		  /** @enum {string} */
		  var FileType = {
		    'GIF': '',
		    'JPEG': '',
		    'PNG': '',
		    'SVG+XML': ''
		  };

		  /** @enum {number} */
		  var Action = {
		    ERROR: 0,
		    UPLOADING: 1,
		    CUSTOM: 2
		  };


		  /**
		   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
		   * из ключей FileType.
		   * @type {RegExp}
		   */
		  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

		  /**
		   * @type {Object.<string, string>}
		   */
		  var filterMap;

		  /**
		   * Объект, который занимается кадрированием изображения.
		   * @type {Resizer}
		   */
		  var currentResizer;

		  /**
		   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
		   * изображением.
		   */
		  function cleanupResizer() {
		    if (currentResizer) {
		      currentResizer.remove();
		      currentResizer = null;
		    }
		  }

		  /**
		   * Ставит одну из трех случайных картинок на фон формы загрузки.
		   */
		  function updateBackground() {
		    var images = [
		      'img/logo-background-1.jpg',
		      'img/logo-background-2.jpg',
		      'img/logo-background-3.jpg'
		    ];

		    var backgroundElement = document.querySelector('.upload');
		    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
		    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
		  }

		  /**
		   * Проверяет, валидны ли данные, в форме кадрирования.
		   * @return {boolean}
		   */
		  function resizeFormIsValid() {
		    var resizeXField = +document.getElementById('resize-x').value;
		    var resizeYField = +document.getElementById('resize-y').value;
		    var resizeSizeField = +document.getElementById('resize-size').value;
		    var resizeBtn = document.getElementById('resize-fwd');

		    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
		        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
		      resizeBtn.disabled = true;
		    } else {
		      resizeBtn.disabled = false;
		    }

		    return resizeXField < 0 || resizeYField < 0 ? false : true;
		  }

		  /**
		   * Форма загрузки изображения.
		   * @type {HTMLFormElement}
		   */
		  var uploadForm = document.forms['upload-select-image'];

		  /**
		   * Форма кадрирования изображения.
		   * @type {HTMLFormElement}
		   */
		  var resizeForm = document.forms['upload-resize'];

		  /**
		   * Форма добавления фильтра.
		   * @type {HTMLFormElement}
		   */
		  var filterForm = document.forms['upload-filter'];

		  /**
		   * @type {HTMLImageElement}
		   */
		  var filterImage = filterForm.querySelector('.filter-image-preview');

		  /**
		   * @type {HTMLElement}
		   */
		  var uploadMessage = document.querySelector('.upload-message');

		  /**
		   * @param {Action} action
		   * @param {string=} message
		   * @return {Element}
		   */
		  function showMessage(action, message) {
		    var isError = false;

		    switch (action) {
		      case Action.UPLOADING:
		        message = message || 'Кексограмим&hellip;';
		        break;

		      case Action.ERROR:
		        isError = true;
		        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
		        break;
		    }

		    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
		    uploadMessage.classList.remove('invisible');
		    uploadMessage.classList.toggle('upload-message-error', isError);
		    return uploadMessage;
		  }

		  function hideMessage() {
		    uploadMessage.classList.add('invisible');
		  }

		  function setFilter(filterName) {
		    if (!filterMap) {
		      // Ленивая инициализация. Объект не создается до тех пор, пока
		      // не понадобится прочитать его в первый раз, а после этого запоминается
		      // навсегда.
		      filterMap = {
		        'none': 'filter-none',
		        'chrome': 'filter-chrome',
		        'sepia': 'filter-sepia'
		      };
		    }

		    // подсвечиваем выбранный фильтр
		    document.getElementById('upload-filter-' + filterName).checked = true;

		    // Класс перезаписывается, а не обновляется через classList потому что нужно
		    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
		    // состояние или просто перезаписывать.
		    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

		    // сохраняем в кукис
		    var closestDoB = new Date('2015-07-12');
		    var dateToExpire = new Date(
		      Date.now() + (Date.now() - closestDoB)
		    ).toUTCString();

		    docCookies.setItem('filter', filterName, dateToExpire);
		  }

		  /**
		   * Функция синхронизации ресайзера и формы
		   */
		  function syncResizer() {
		    if (currentResizer) {
		      var constraints = currentResizer.getConstraint();
		      document.getElementById('resize-x').value = constraints.x;
		      document.getElementById('resize-y').value = constraints.y;
		      document.getElementById('resize-size').value = constraints.side;
		    }
		  }

		  /**
		   * Обработчик изменения изображения в форме загрузки. Если загруженный
		   * файл является изображением, считывается исходник картинки, создается
		   * Resizer с загруженной картинкой, добавляется в форму кадрирования
		   * и показывается форма кадрирования.
		   * @param {Event} evt
		   */
		  uploadForm.addEventListener('change', function(evt) {
		    var element = evt.target;
		    if (element.id === 'upload-file') {
		      // Проверка типа загружаемого файла, тип должен быть изображением
		      // одного из форматов: JPEG, PNG, GIF или SVG.
		      if (fileRegExp.test(element.files[0].type)) {
		        var fileReader = new FileReader();

		        showMessage(Action.UPLOADING);

		        fileReader.onload = function() {
		          cleanupResizer();

		          currentResizer = new Resizer(fileReader.result);
		          currentResizer.setElement(resizeForm);
		          uploadMessage.classList.add('invisible');

		          uploadForm.classList.add('invisible');
		          resizeForm.classList.remove('invisible');

		          hideMessage();
		          setTimeout(syncResizer, 10);
		        };

		        fileReader.readAsDataURL(element.files[0]);
		      } else {
		        // Показ сообщения об ошибке, если загружаемый файл, не является
		        // поддерживаемым изображением.
		        showMessage(Action.ERROR);
		      }
		    }
		  });

		  /**
		   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
		   * @param {Event} evt
		   */
		  resizeForm.addEventListener('change', function(evt) {
		    // вынес в отдельные переменные для лучшей читаемости
		    resizeFormIsValid();
		    // получаем текущие координаты ресайзера
		    var constraints = currentResizer.getConstraint();

		    var changedElement = evt.target;
		    var newVal = +changedElement.value;

		    // двигаем ресайзер в зависимости от того, какое поле поменялось
		    switch (changedElement.name) {
		      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
		        break;
		      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
		        break;
		      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
		        break;
		    }
		  });

		  /**
		   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
		   * и обновляет фон.
		   * @param {Event} evt
		   */
		  resizeForm.addEventListener('reset', function(evt) {
		    evt.preventDefault();

		    cleanupResizer();
		    updateBackground();

		    resizeForm.classList.add('invisible');
		    uploadForm.classList.remove('invisible');
		  });

		  /**
		   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
		   * кропнутое изображение в форму добавления фильтра и показывает ее.
		   * @param {Event} evt
		   */
		  resizeForm.addEventListener('submit', function(evt) {
		    evt.preventDefault();

		    if (resizeFormIsValid()) {
		      filterImage.src = currentResizer.exportImage().src;

		      resizeForm.classList.add('invisible');
		      filterForm.classList.remove('invisible');
		    }
		  });

		  /**
		   * Сброс формы фильтра. Показывает форму кадрирования.
		   * @param {Event} evt
		   */
		  filterForm.addEventListener('reset', function(evt) {
		    evt.preventDefault();

		    filterForm.classList.add('invisible');
		    resizeForm.classList.remove('invisible');
		  });

		  /**
		   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
		   * записав сохраненный фильтр в cookie.
		   * @param {Event} evt
		   */
		  filterForm.addEventListener('submit', function(evt) {
		    evt.preventDefault();

		    cleanupResizer();
		    updateBackground();

		    filterForm.classList.add('invisible');
		    uploadForm.classList.remove('invisible');
		  });

		  /**
		   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
		   * выбранному значению в форме.
		   */
		  filterForm.addEventListener('change', function() {
		    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
		      return item.checked;
		    })[0].value;
		    setFilter(selectedFilter);
		  });

		  cleanupResizer();
		  updateBackground();
		  // выставляем фильтр, если находим его в кукисах
		  if (docCookies.getItem('filter') === null) {
		    setFilter('none');
		  } else {
		    setFilter( docCookies.getItem('filter') );
		  }

		  window.addEventListener('resizerchange', syncResizer);


		})();


	/***/ },
	/* 3 */
	/***/ function(module, exports) {

		'use strict';

		/**
		 * @constructor
		 * @param {string} image
		 */
		var Resizer = function(image) {
		  // Изображение, с которым будет вестись работа.
		  this._image = new Image();
		  this._image.src = image;

		  // Холст.
		  this._container = document.createElement('canvas');
		  this._ctx = this._container.getContext('2d');

		  // Создаем холст только после загрузки изображения.
		  this._image.onload = function() {
		    // Размер холста равен размеру загруженного изображения. Это нужно
		    // для удобства работы с координатами.
		    this._container.width = this._image.naturalWidth;
		    this._container.height = this._image.naturalHeight;

		    /**
		     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
		     * стороны изображения.
		     * @const
		     * @type {number}
		     */
		    var INITIAL_SIDE_RATIO = 0.75;
		    // Размер меньшей стороны изображения.
		    var side = Math.min(
		        this._container.width * INITIAL_SIDE_RATIO,
		        this._container.height * INITIAL_SIDE_RATIO);

		    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
		    // от размера меньшей стороны.
		    this._resizeConstraint = new Square(
		        this._container.width / 2 - side / 2,
		        this._container.height / 2 - side / 2,
		        side);

		    // Отрисовка изначального состояния канваса.
		    this.redraw();
		  }.bind(this);

		  // Фиксирование контекста обработчиков.
		  this._onDragStart = this._onDragStart.bind(this);
		  this._onDragEnd = this._onDragEnd.bind(this);
		  this._onDrag = this._onDrag.bind(this);
		};

		Resizer.prototype = {
		  /**
		   * Родительский элемент канваса.
		   * @type {Element}
		   * @private
		   */
		  _element: null,

		  /**
		   * Положение курсора в момент перетаскивания. От положения курсора
		   * рассчитывается смещение на которое нужно переместить изображение
		   * за каждую итерацию перетаскивания.
		   * @type {Coordinate}
		   * @private
		   */
		  _cursorPosition: null,

		  /**
		   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
		   * от верхнего левого угла исходного изображения.
		   * @type {Square}
		   * @private
		   */
		  _resizeConstraint: null,

		  /**
		   * Отрисовка канваса.
		   */
		  redraw: function() {
		    // Очистка изображения.
		    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

		    // Параметры линии.
		    // NB! Такие параметры сохраняются на время всего процесса отрисовки
		    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
		    // чего-либо с другой обводкой.

		    // Толщина линии.
		    this._ctx.lineWidth = 6;
		    // Цвет обводки.
		    this._ctx.strokeStyle = '#ffe753';

		    // Сохранение состояния канваса.
		    // Подробней см. строку 132.
		    this._ctx.save();

		    // Установка начальной точки системы координат в центр холста.
		    this._ctx.translate(this._container.width / 2, this._container.height / 2);

		    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
		    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
		    // Отрисовка изображения на холсте. Параметры задают изображение, которое
		    // нужно отрисовать и координаты его верхнего левого угла.
		    // Координаты задаются от центра холста.

		    this._ctx.drawImage(this._image, displX, displY);

		    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
		    // взяты из начального кода отрисовки рамки
		    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
		    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
		    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
		    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

		    // ставим прозрачность 0.8
		    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
		    this._ctx.beginPath();

		    // рисуем зиг-заг прямоугольник
		    zigzagRect(this._ctx, x0, y0, x1, y1);

		    // после этого обводим рамку по внешнему периметру
		    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
		    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
		    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
		    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
		    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
		    // заливаем получившуюся фигуру
		    this._ctx.fill();

		    // рисуем центрированный текст
		    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
		    this._ctx.fillStyle = '#FFF';
		    this._ctx.textAlign = 'center';
		    this._ctx.textBaseline = 'bottom';
		    this._ctx.font = 'normal 30px Arial';
		    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

		    // Восстановление состояния канваса, которое было до вызова ctx.save
		    // и последующего изменения системы координат. Нужно для того, чтобы
		    // следующий кадр рисовался с привычной системой координат, где точка
		    // 0 0 находится в левом верхнем углу холста, в противном случае
		    // некорректно сработает даже очистка холста или нужно будет использовать
		    // сложные рассчеты для координат прямоугольника, который нужно очистить.
		    this._ctx.restore();
		  },

		  /**
		   * Включение режима перемещения. Запоминается текущее положение курсора,
		   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
		   * позволяющие перерисовывать изображение по мере перетаскивания.
		   * @param {number} x
		   * @param {number} y
		   * @private
		   */
		  _enterDragMode: function(x, y) {
		    this._cursorPosition = new Coordinate(x, y);
		    document.body.addEventListener('mousemove', this._onDrag);
		    document.body.addEventListener('mouseup', this._onDragEnd);
		  },

		  /**
		   * Выключение режима перемещения.
		   * @private
		   */
		  _exitDragMode: function() {
		    this._cursorPosition = null;
		    document.body.removeEventListener('mousemove', this._onDrag);
		    document.body.removeEventListener('mouseup', this._onDragEnd);
		  },

		  /**
		   * Перемещение изображения относительно кадра.
		   * @param {number} x
		   * @param {number} y
		   * @private
		   */
		  updatePosition: function(x, y) {
		    this.moveConstraint(
		        this._cursorPosition.x - x,
		        this._cursorPosition.y - y);
		    this._cursorPosition = new Coordinate(x, y);
		  },

		  /**
		   * @param {MouseEvent} evt
		   * @private
		   */
		  _onDragStart: function(evt) {
		    this._enterDragMode(evt.clientX, evt.clientY);
		  },

		  /**
		   * Обработчик окончания перетаскивания.
		   * @private
		   */
		  _onDragEnd: function() {
		    this._exitDragMode();
		  },

		  /**
		   * Обработчик события перетаскивания.
		   * @param {MouseEvent} evt
		   * @private
		   */
		  _onDrag: function(evt) {
		    this.updatePosition(evt.clientX, evt.clientY);
		  },

		  /**
		   * Добавление элемента в DOM.
		   * @param {Element} element
		   */
		  setElement: function(element) {
		    if (this._element === element) {
		      return;
		    }

		    this._element = element;
		    this._element.insertBefore(this._container, this._element.firstChild);
		    // Обработчики начала и конца перетаскивания.
		    this._container.addEventListener('mousedown', this._onDragStart);
		  },

		  /**
		   * Возвращает кадрирование элемента.
		   * @return {Square}
		   */
		  getConstraint: function() {
		    return this._resizeConstraint;
		  },

		  /**
		   * Смещает кадрирование на значение указанное в параметрах.
		   * @param {number} deltaX
		   * @param {number} deltaY
		   * @param {number} deltaSide
		   */
		  moveConstraint: function(deltaX, deltaY, deltaSide) {
		    this.setConstraint(
		        this._resizeConstraint.x + (deltaX || 0),
		        this._resizeConstraint.y + (deltaY || 0),
		        this._resizeConstraint.side + (deltaSide || 0));
		  },

		  /**
		   * @param {number} x
		   * @param {number} y
		   * @param {number} side
		   */
		  setConstraint: function(x, y, side) {
		    if (typeof x !== 'undefined') {
		      this._resizeConstraint.x = x;
		    }

		    if (typeof y !== 'undefined') {
		      this._resizeConstraint.y = y;
		    }

		    if (typeof side !== 'undefined') {
		      this._resizeConstraint.side = side;
		    }

		    requestAnimationFrame(function() {
		      this.redraw();
		      window.dispatchEvent(new CustomEvent('resizerchange'));
		    }.bind(this));
		  },

		  /**
		   * Удаление. Убирает контейнер из родительского элемента, убирает
		   * все обработчики событий и убирает ссылки.
		   */
		  remove: function() {
		    this._element.removeChild(this._container);

		    this._container.removeEventListener('mousedown', this._onDragStart);
		    this._container = null;
		  },

		  /**
		   * Экспорт обрезанного изображения как HTMLImageElement и исходником
		   * картинки в src в формате dataURL.
		   * @return {Image}
		   */
		  exportImage: function() {
		    // Создаем Image, с размерами, указанными при кадрировании.
		    var imageToExport = new Image();

		    // Создается новый canvas, по размерам совпадающий с кадрированным
		    // изображением, в него добавляется изображение взятое из канваса
		    // с измененными координатами и сохраняется в dataURL, с помощью метода
		    // toDataURL. Полученный исходный код, записывается в src у ранее
		    // созданного изображения.
		    var temporaryCanvas = document.createElement('canvas');
		    var temporaryCtx = temporaryCanvas.getContext('2d');
		    temporaryCanvas.width = this._resizeConstraint.side;
		    temporaryCanvas.height = this._resizeConstraint.side;
		    temporaryCtx.drawImage(this._image,
		        -this._resizeConstraint.x,
		        -this._resizeConstraint.y);
		    imageToExport.src = temporaryCanvas.toDataURL('image/png');

		    return imageToExport;
		  }
		};

		/**
		 * Вспомогательный тип, описывающий квадрат.
		 * @constructor
		 * @param {number} x
		 * @param {number} y
		 * @param {number} side
		 * @private
		 */
		var Square = function(x, y, side) {
		  this.x = x;
		  this.y = y;
		  this.side = side;
		};

		/**
		 * Вспомогательный тип, описывающий координату.
		 * @constructor
		 * @param {number} x
		 * @param {number} y
		 * @private
		 */
		var Coordinate = function(x, y) {
		  this.x = x;
		  this.y = y;
		};

		var zigzagRect = function(ctx, x0, y0, x1, y1) {
		  var xStart = x0;
		  var yStart = y0;

		  ctx.fillColor = 'black';
		  ctx.moveTo(x0, y0);
		  ctx.beginPath();
		  // длина зиг-заг линии
		  var line = 5;

		  var step = 0;

		  // слева направо - двигаемся по ox
		  while (x0 < x1) {
		    if (step % 2 === 0) {
		      x0 = x0 + line;
		      y0 = y0 + Math.abs(line);
		      ctx.lineTo(x0, y0);
		    } else {
		      x0 = x0 + line;
		      y0 = y0 - Math.abs(line);
		      ctx.lineTo(x0, y0);
		    }
		    step++;
		  }

		  // потом вниз  - двигаемся по oy
		  while (y0 < y1) {
		    if (step % 2 === 0) {
		      x0 = x0 + Math.abs(line);
		      y0 = y0 + line;
		      ctx.lineTo(x0, y0);
		    } else {
		      x0 = x0 - Math.abs(line);
		      y0 = y0 + line;
		      ctx.lineTo(x0, y0);
		    }
		    step++;
		  }

		  line = line * -1;
		  // налево
		  while (x0 > xStart) {
		    if (step % 2 === 0) {
		      x0 = x0 + line;
		      y0 = y0 + Math.abs(line);
		      ctx.lineTo(x0, y0);
		    } else {
		      x0 = x0 + line;
		      y0 = y0 - Math.abs(line);
		      ctx.lineTo(x0, y0);
		    }
		    step++;
		  }

		  // замыкаем вверх
		  while (y0 + line > yStart ) {
		    if (step % 2 === 0) {
		      x0 = x0 + Math.abs(line);
		      y0 = y0 + line;
		      ctx.lineTo(x0, y0);
		    } else {
		      x0 = x0 - Math.abs(line);
		      y0 = y0 + line;
		      ctx.lineTo(x0, y0);
		    }
		    step++;
		  }
		  ctx.stroke();
		};

		module.exports = Resizer;


	/***/ },
	/* 4 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var Photo = __webpack_require__(5);
		var Gallery = __webpack_require__(8);
		var Video = __webpack_require__(10);

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
		      setActiveFilter( localStorage.getItem('currentFilter') || 'popular' );
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
		    document.getElementById('filter-' + filterName).checked = true;
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


	/***/ },
	/* 5 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var inherit = __webpack_require__(6);
		var PhotoBase = __webpack_require__(7);

		/** Класс, представляющий фотографию на странице.
		* @module Photo
		* @constructor
		* @extends {PhotoBase}
		*/
		function Photo() {
		  this.mediatype = 'img';
		}
		inherit(Photo, PhotoBase);

		/**
		* Подгрузка изображения и создание картинки из шаблона
		*/
		Photo.prototype.render = function() {
		  var template = document.getElementById('picture-template');
		  this.element = template.content.children[0].cloneNode(true);
		  this.element.querySelector('.picture-comments').textContent = this.getComments();
		  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
		  picImage.src = this.getSrc();

		  this.element.addEventListener('click', this._onClick);
		  return this.element;
		};

		/** @function updateLikes - обновление кол-ва лайков в галерее */
		Photo.prototype.updateLikes = function() {
		  this.element.querySelector('.picture-likes').textContent = this.getLikes();
		};

		Photo.prototype.onClick = null;

		Photo.prototype._onClick = function(evt) {
		  evt.preventDefault();
		  if ( !this.classList.contains('picture-load-failure') ) {
		    if (typeof this.onClick === 'function') {
		      this.onClick();
		    }
		  }
		};

		module.exports = Photo;


	/***/ },
	/* 6 */
	/***/ function(module, exports) {

		'use strict';
		/**
		* @module inherit - реализует наследование классов, копированием прототипа
		*                   через временный класс
		* @param {Object} потомок
		* @param {Object} родитель
		*/
		function inherit(Child, Parent) {
		  var TempConstructor = function() {};
		  TempConstructor.prototype = Parent.prototype;
		  Child.prototype = new TempConstructor();
		  Child.prototype.constructor = Child;
		}
		module.exports = inherit;


	/***/ },
	/* 7 */
	/***/ function(module, exports) {

		'use strict';

		/** Базовый класс для медиа-элементов
		* @module PhotoBase
		* @constructor
		*/
		function PhotoBase() {
		}

		/** @type {Object} данные получаемые по AJAX*/
		PhotoBase.prototype._data = null;

		/**
		* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
		* переключении - определяет играть ли видео или нет.
		*/
		PhotoBase.prototype.mediatype = null;

		/**
		* Сохраняет медиа-данные в объекте и прописывает медиатип
		*/
		PhotoBase.prototype.setData = function(data) {
		  this._data = data;
		  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
		    this.mediatype = 'img';
		  } else {
		    this.mediatype = 'video';
		  }
		  this._data.liked = data.liked ? true : false;
		};

		/** @return {Object} - геттер данных объекта */

		PhotoBase.prototype.getData = function() {
		  return this._data;
		};

		/**
		* Функции-геттеры, используемые в сортировках/фильтрации
		*/
		PhotoBase.prototype.getLikes = function() {
		  return parseInt(this.getData().likes, 10);
		};

		PhotoBase.prototype.getComments = function() {
		  return parseInt(this.getData().comments, 10);
		};

		PhotoBase.prototype.getDate = function() {
		  return new Date(this.getData().date);
		};

		PhotoBase.prototype.getSrc = function() {
		  return this.getData().url;
		};



		/** Like dispatcher :) */
		PhotoBase.prototype.setLikes = function(likes) {
		  this._data.likes = likes;
		};

		PhotoBase.prototype.like = function() {
		  this.setLikes( this.getLikes() + 1 );
		  this._data.liked = true;
		};

		PhotoBase.prototype.dislike = function() {
		  this.setLikes( this.getLikes() - 1 );
		  this._data.liked = false;
		};

		PhotoBase.prototype.liked = function() {
		  return this._data.liked;
		};

		module.exports = PhotoBase;


	/***/ },
	/* 8 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var PhotoPreview = __webpack_require__(9);
		var preview = new PhotoPreview();
		var KEYCODE = {
		  'ESC': 27,
		  'LEFT': 37,
		  'RIGHT': 39
		};
		/** Класс, представляющий галерею.
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
		  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
		  currentIndex: null,

		  /**
		  * Показывает галерею и проставляет eventListeners
		  */
		  show: function() {
		    this.element.classList.remove('invisible');

		    // is this way of bind ok?

		    this._closeBtn.addEventListener('click', this._onCloseClick);
		    this._likeBtn.addEventListener('click', this._onLikeClick);
		    this._photo.addEventListener('click', this._onPhotoClick);
		    this._video.addEventListener('click', this._onVideoClick);
		    window.addEventListener('keydown', this._onDocumentKeyDown);
		  },

		  /**
		  * Прячет галерею и удаляет eventListeners, сбрасывает location.hash
		  */
		  hide: function() {
		    this.element.classList.add('invisible');
		    this._photo.removeEventListener('click', this._onPhotoClick);
		    this._video.removeEventListener('click', this._onVideoClick);
		    this._closeBtn.removeEventListener('click', this._onCloseClick);
		    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
		    window.removeEventListener('keydown', this._onDocumentKeyDown);
		    location.hash = '';
		  },

		  /**
		  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
		  * @param {Array.<Photo>} photos
		  */
		  setPictures: function(photos) {
		    this.data = photos;
		  },

		  /**
		  * @param {integer|string} ind - индекс элемента Photo в this.data или
		  * getSrc() этого элемента.
		  */
		  setCurrentPicture: function(ind) {
		    if (typeof ind === 'number') {
		      preview.setData(this.data[ind].getData());
		      this.currentIndex = ind;
		    } else if (typeof ind === 'string') {
		      var item = this.data.filter(function( obj ) {
		        return obj.getSrc() === ind;
		      })[0];
		      this.currentIndex = this.data.indexOf(item);
		      preview.setData(item.getData());
		    }
		    if (!preview) {
		      return false;
		    }
		    preview.render(this.element);
		  },

		  /**
		  * Устанавливает hash в строке браузера в соответствии с getSrc()
		  * элемента, индекс которого передан
		  * @param {integer} ind
		  */
		  updateHash: function(ind) {
		    location.hash = location.hash = 'photo/' + this.data[ind].getSrc();
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

		  /**
		  * Обработчик кликов лайка в галерее
		  */
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

		  /**
		  * Управление проигрыванием видео.
		  */
		  _onVideoClick: function(evt) {
		    if (evt.target.tagName === 'VIDEO') {
		      if (this.paused) {
		        this.play();
		      } else {
		        this.pause();
		      }
		    }
		  },

		  /**
		  * Клавиатурные события: переключение объектов галереи, выход из галереи
		  */
		  _onDocumentKeyDown: function(evt) {
		    this._video.pause();
		    switch (evt.keyCode) {
		      case KEYCODE.ESC: this.hide();
		        break;
		      case KEYCODE.LEFT: this.updateHash(--this.currentIndex);
		        break;
		      case KEYCODE.RIGHT: if (this.currentIndex < this.data.length - 1) {
		        this.updateHash(++this.currentIndex);
		      }
		        break;
		    }
		  }
		};

		module.exports = Gallery;


	/***/ },
	/* 9 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var inherit = __webpack_require__(6);
		var PhotoBase = __webpack_require__(7);

		/** Объект, используемый для показа фото/видео в галерее
		* @module PhotoPreview
		* @constructor
		* @extends {PhotoBase}
		*/
		function PhotoPreview() {
		}

		inherit(PhotoPreview, PhotoBase);

		/**
		* Отрисовывает лайк, в зависимости от данных в объкете
		* и показывает/прячет видео-блок, проверяя mediatype
		*/

		PhotoPreview.prototype.render = function(el, noauto) {
		  el.querySelector('.likes-count').textContent = this.getLikes();
		  el.querySelector('.comments-count').textContent = this.getComments();
		  if ( this.liked() ) {
		    el.querySelector('.likes-count').classList.add('likes-count-liked');
		  } else {
		    el.querySelector('.likes-count').classList.remove('likes-count-liked');
		  }
		  if (this.mediatype === 'img') {
		    el.querySelector('.gallery-overlay-video').style.display = 'none';
		    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
		    el.querySelector('.gallery-overlay-image').src = this.getSrc();
		  } else if (this.mediatype === 'video') {
		    el.querySelector('.gallery-overlay-image').style.display = 'none';
		    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
		    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
		    el.querySelector('.gallery-overlay-video').src = this.getSrc();
		  }
		};

		module.exports = PhotoPreview;


	/***/ },
	/* 10 */
	/***/ function(module, exports, __webpack_require__) {

		'use strict';

		var inherit = __webpack_require__(6);
		var Photo = __webpack_require__(5);

		/** Объект, представляющий видео-элемент в галерее
		* @constructor
		* @extends {Photo}
		*/
		function Video() {
		  this.mediatype = 'video';
		}
		inherit(Video, Photo);

		/**
		* Подгрузка данных и создание видео-элемента
		*/
		Video.prototype.render = function() {
		  var template = document.getElementById('picture-template');
		  this.element = template.content.children[0].cloneNode(true);
		  this.element.querySelector('.picture-comments').textContent = this.getComments();
		  this.element.querySelector('.picture-likes').textContent = this.getLikes();

		  var videoElement = document.createElement('video');
		  videoElement.width = 182;
		  videoElement.height = 182;
		  videoElement.src = this.getSrc();
		  this.element.replaceChild(videoElement, this.element.firstElementChild);

		  this.element.addEventListener('click', this._onClick);
		  return this.element;
		};


		Video.prototype.onClick = null;

		Video.prototype._onClick = function(evt) {
		  evt.preventDefault();
		  if (typeof this.onClick === 'function') {
		    this.onClick();
		  }
		};

		module.exports = Video;


	/***/ },
	/* 11 */
	/***/ function(module, exports) {

		/******/ (function(modules) { // webpackBootstrap
		/******/ 	// The module cache
		/******/ 	var installedModules = {};

		/******/ 	// The require function
		/******/ 	function __webpack_require__(moduleId) {

		/******/ 		// Check if module is in cache
		/******/ 		if(installedModules[moduleId])
		/******/ 			return installedModules[moduleId].exports;

		/******/ 		// Create a new module (and put it into the cache)
		/******/ 		var module = installedModules[moduleId] = {
		/******/ 			exports: {},
		/******/ 			id: moduleId,
		/******/ 			loaded: false
		/******/ 		};

		/******/ 		// Execute the module function
		/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

		/******/ 		// Flag the module as loaded
		/******/ 		module.loaded = true;

		/******/ 		// Return the exports of the module
		/******/ 		return module.exports;
		/******/ 	}


		/******/ 	// expose the modules object (__webpack_modules__)
		/******/ 	__webpack_require__.m = modules;

		/******/ 	// expose the module cache
		/******/ 	__webpack_require__.c = installedModules;

		/******/ 	// __webpack_public_path__
		/******/ 	__webpack_require__.p = "";

		/******/ 	// Load entry module and return exports
		/******/ 	return __webpack_require__(0);
		/******/ })
		/************************************************************************/
		/******/ ([
		/* 0 */
		/***/ function(module, exports, __webpack_require__) {

			__webpack_require__(1);
			__webpack_require__(1);
			module.exports = __webpack_require__(11);


		/***/ },
		/* 1 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			__webpack_require__(2);
			__webpack_require__(4);


		/***/ },
		/* 2 */
		/***/ function(module, exports, __webpack_require__) {

			/* global docCookies */
			'use strict';

			var Resizer = __webpack_require__(3);

			/**
			 * @fileoverview
			 * @author Igor Alexeenko (o0)
			 */

			(function() {
			  /** @enum {string} */
			  var FileType = {
			    'GIF': '',
			    'JPEG': '',
			    'PNG': '',
			    'SVG+XML': ''
			  };

			  /** @enum {number} */
			  var Action = {
			    ERROR: 0,
			    UPLOADING: 1,
			    CUSTOM: 2
			  };


			  /**
			   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
			   * из ключей FileType.
			   * @type {RegExp}
			   */
			  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

			  /**
			   * @type {Object.<string, string>}
			   */
			  var filterMap;

			  /**
			   * Объект, который занимается кадрированием изображения.
			   * @type {Resizer}
			   */
			  var currentResizer;

			  /**
			   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
			   * изображением.
			   */
			  function cleanupResizer() {
			    if (currentResizer) {
			      currentResizer.remove();
			      currentResizer = null;
			    }
			  }

			  /**
			   * Ставит одну из трех случайных картинок на фон формы загрузки.
			   */
			  function updateBackground() {
			    var images = [
			      'img/logo-background-1.jpg',
			      'img/logo-background-2.jpg',
			      'img/logo-background-3.jpg'
			    ];

			    var backgroundElement = document.querySelector('.upload');
			    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
			    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
			  }

			  /**
			   * Проверяет, валидны ли данные, в форме кадрирования.
			   * @return {boolean}
			   */
			  function resizeFormIsValid() {
			    var resizeXField = +document.getElementById('resize-x').value;
			    var resizeYField = +document.getElementById('resize-y').value;
			    var resizeSizeField = +document.getElementById('resize-size').value;
			    var resizeBtn = document.getElementById('resize-fwd');

			    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
			        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
			      resizeBtn.disabled = true;
			    } else {
			      resizeBtn.disabled = false;
			    }

			    return resizeXField < 0 || resizeYField < 0 ? false : true;
			  }

			  /**
			   * Форма загрузки изображения.
			   * @type {HTMLFormElement}
			   */
			  var uploadForm = document.forms['upload-select-image'];

			  /**
			   * Форма кадрирования изображения.
			   * @type {HTMLFormElement}
			   */
			  var resizeForm = document.forms['upload-resize'];

			  /**
			   * Форма добавления фильтра.
			   * @type {HTMLFormElement}
			   */
			  var filterForm = document.forms['upload-filter'];

			  /**
			   * @type {HTMLImageElement}
			   */
			  var filterImage = filterForm.querySelector('.filter-image-preview');

			  /**
			   * @type {HTMLElement}
			   */
			  var uploadMessage = document.querySelector('.upload-message');

			  /**
			   * @param {Action} action
			   * @param {string=} message
			   * @return {Element}
			   */
			  function showMessage(action, message) {
			    var isError = false;

			    switch (action) {
			      case Action.UPLOADING:
			        message = message || 'Кексограмим&hellip;';
			        break;

			      case Action.ERROR:
			        isError = true;
			        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
			        break;
			    }

			    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
			    uploadMessage.classList.remove('invisible');
			    uploadMessage.classList.toggle('upload-message-error', isError);
			    return uploadMessage;
			  }

			  function hideMessage() {
			    uploadMessage.classList.add('invisible');
			  }

			  function setFilter(filterName) {
			    if (!filterMap) {
			      // Ленивая инициализация. Объект не создается до тех пор, пока
			      // не понадобится прочитать его в первый раз, а после этого запоминается
			      // навсегда.
			      filterMap = {
			        'none': 'filter-none',
			        'chrome': 'filter-chrome',
			        'sepia': 'filter-sepia'
			      };
			    }

			    // подсвечиваем выбранный фильтр
			    document.getElementById('upload-filter-' + filterName).checked = true;

			    // Класс перезаписывается, а не обновляется через classList потому что нужно
			    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
			    // состояние или просто перезаписывать.
			    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

			    // сохраняем в кукис
			    var closestDoB = new Date('2015-07-12');
			    var dateToExpire = new Date(
			      Date.now() + (Date.now() - closestDoB)
			    ).toUTCString();

			    docCookies.setItem('filter', filterName, dateToExpire);
			  }

			  /**
			   * Функция синхронизации ресайзера и формы
			   */
			  function syncResizer() {
			    if (currentResizer) {
			      var constraints = currentResizer.getConstraint();
			      document.getElementById('resize-x').value = constraints.x;
			      document.getElementById('resize-y').value = constraints.y;
			      document.getElementById('resize-size').value = constraints.side;
			    }
			  }

			  /**
			   * Обработчик изменения изображения в форме загрузки. Если загруженный
			   * файл является изображением, считывается исходник картинки, создается
			   * Resizer с загруженной картинкой, добавляется в форму кадрирования
			   * и показывается форма кадрирования.
			   * @param {Event} evt
			   */
			  uploadForm.addEventListener('change', function(evt) {
			    var element = evt.target;
			    if (element.id === 'upload-file') {
			      // Проверка типа загружаемого файла, тип должен быть изображением
			      // одного из форматов: JPEG, PNG, GIF или SVG.
			      if (fileRegExp.test(element.files[0].type)) {
			        var fileReader = new FileReader();

			        showMessage(Action.UPLOADING);

			        fileReader.onload = function() {
			          cleanupResizer();

			          currentResizer = new Resizer(fileReader.result);
			          currentResizer.setElement(resizeForm);
			          uploadMessage.classList.add('invisible');

			          uploadForm.classList.add('invisible');
			          resizeForm.classList.remove('invisible');

			          hideMessage();
			          setTimeout(syncResizer, 10);
			        };

			        fileReader.readAsDataURL(element.files[0]);
			      } else {
			        // Показ сообщения об ошибке, если загружаемый файл, не является
			        // поддерживаемым изображением.
			        showMessage(Action.ERROR);
			      }
			    }
			  });

			  /**
			   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
			   * @param {Event} evt
			   */
			  resizeForm.addEventListener('change', function(evt) {
			    // вынес в отдельные переменные для лучшей читаемости
			    resizeFormIsValid();
			    // получаем текущие координаты ресайзера
			    var constraints = currentResizer.getConstraint();

			    var changedElement = evt.target;
			    var newVal = +changedElement.value;

			    // двигаем ресайзер в зависимости от того, какое поле поменялось
			    switch (changedElement.name) {
			      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
			        break;
			      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
			        break;
			      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
			        break;
			    }
			  });

			  /**
			   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
			   * и обновляет фон.
			   * @param {Event} evt
			   */
			  resizeForm.addEventListener('reset', function(evt) {
			    evt.preventDefault();

			    cleanupResizer();
			    updateBackground();

			    resizeForm.classList.add('invisible');
			    uploadForm.classList.remove('invisible');
			  });

			  /**
			   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
			   * кропнутое изображение в форму добавления фильтра и показывает ее.
			   * @param {Event} evt
			   */
			  resizeForm.addEventListener('submit', function(evt) {
			    evt.preventDefault();

			    if (resizeFormIsValid()) {
			      filterImage.src = currentResizer.exportImage().src;

			      resizeForm.classList.add('invisible');
			      filterForm.classList.remove('invisible');
			    }
			  });

			  /**
			   * Сброс формы фильтра. Показывает форму кадрирования.
			   * @param {Event} evt
			   */
			  filterForm.addEventListener('reset', function(evt) {
			    evt.preventDefault();

			    filterForm.classList.add('invisible');
			    resizeForm.classList.remove('invisible');
			  });

			  /**
			   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
			   * записав сохраненный фильтр в cookie.
			   * @param {Event} evt
			   */
			  filterForm.addEventListener('submit', function(evt) {
			    evt.preventDefault();

			    cleanupResizer();
			    updateBackground();

			    filterForm.classList.add('invisible');
			    uploadForm.classList.remove('invisible');
			  });

			  /**
			   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
			   * выбранному значению в форме.
			   */
			  filterForm.addEventListener('change', function() {
			    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
			      return item.checked;
			    })[0].value;
			    setFilter(selectedFilter);
			  });

			  cleanupResizer();
			  updateBackground();
			  // выставляем фильтр, если находим его в кукисах
			  if (docCookies.getItem('filter') === null) {
			    setFilter('none');
			  } else {
			    setFilter( docCookies.getItem('filter') );
			  }

			  window.addEventListener('resizerchange', syncResizer);


			})();


		/***/ },
		/* 3 */
		/***/ function(module, exports) {

			'use strict';

			/**
			 * @constructor
			 * @param {string} image
			 */
			var Resizer = function(image) {
			  // Изображение, с которым будет вестись работа.
			  this._image = new Image();
			  this._image.src = image;

			  // Холст.
			  this._container = document.createElement('canvas');
			  this._ctx = this._container.getContext('2d');

			  // Создаем холст только после загрузки изображения.
			  this._image.onload = function() {
			    // Размер холста равен размеру загруженного изображения. Это нужно
			    // для удобства работы с координатами.
			    this._container.width = this._image.naturalWidth;
			    this._container.height = this._image.naturalHeight;

			    /**
			     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
			     * стороны изображения.
			     * @const
			     * @type {number}
			     */
			    var INITIAL_SIDE_RATIO = 0.75;
			    // Размер меньшей стороны изображения.
			    var side = Math.min(
			        this._container.width * INITIAL_SIDE_RATIO,
			        this._container.height * INITIAL_SIDE_RATIO);

			    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
			    // от размера меньшей стороны.
			    this._resizeConstraint = new Square(
			        this._container.width / 2 - side / 2,
			        this._container.height / 2 - side / 2,
			        side);

			    // Отрисовка изначального состояния канваса.
			    this.redraw();
			  }.bind(this);

			  // Фиксирование контекста обработчиков.
			  this._onDragStart = this._onDragStart.bind(this);
			  this._onDragEnd = this._onDragEnd.bind(this);
			  this._onDrag = this._onDrag.bind(this);
			};

			Resizer.prototype = {
			  /**
			   * Родительский элемент канваса.
			   * @type {Element}
			   * @private
			   */
			  _element: null,

			  /**
			   * Положение курсора в момент перетаскивания. От положения курсора
			   * рассчитывается смещение на которое нужно переместить изображение
			   * за каждую итерацию перетаскивания.
			   * @type {Coordinate}
			   * @private
			   */
			  _cursorPosition: null,

			  /**
			   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
			   * от верхнего левого угла исходного изображения.
			   * @type {Square}
			   * @private
			   */
			  _resizeConstraint: null,

			  /**
			   * Отрисовка канваса.
			   */
			  redraw: function() {
			    // Очистка изображения.
			    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

			    // Параметры линии.
			    // NB! Такие параметры сохраняются на время всего процесса отрисовки
			    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
			    // чего-либо с другой обводкой.

			    // Толщина линии.
			    this._ctx.lineWidth = 6;
			    // Цвет обводки.
			    this._ctx.strokeStyle = '#ffe753';

			    // Сохранение состояния канваса.
			    // Подробней см. строку 132.
			    this._ctx.save();

			    // Установка начальной точки системы координат в центр холста.
			    this._ctx.translate(this._container.width / 2, this._container.height / 2);

			    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
			    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
			    // Отрисовка изображения на холсте. Параметры задают изображение, которое
			    // нужно отрисовать и координаты его верхнего левого угла.
			    // Координаты задаются от центра холста.

			    this._ctx.drawImage(this._image, displX, displY);

			    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
			    // взяты из начального кода отрисовки рамки
			    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
			    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
			    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
			    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

			    // ставим прозрачность 0.8
			    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
			    this._ctx.beginPath();

			    // рисуем зиг-заг прямоугольник
			    zigzagRect(this._ctx, x0, y0, x1, y1);

			    // после этого обводим рамку по внешнему периметру
			    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
			    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
			    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
			    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
			    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
			    // заливаем получившуюся фигуру
			    this._ctx.fill();

			    // рисуем центрированный текст
			    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
			    this._ctx.fillStyle = '#FFF';
			    this._ctx.textAlign = 'center';
			    this._ctx.textBaseline = 'bottom';
			    this._ctx.font = 'normal 30px Arial';
			    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

			    // Восстановление состояния канваса, которое было до вызова ctx.save
			    // и последующего изменения системы координат. Нужно для того, чтобы
			    // следующий кадр рисовался с привычной системой координат, где точка
			    // 0 0 находится в левом верхнем углу холста, в противном случае
			    // некорректно сработает даже очистка холста или нужно будет использовать
			    // сложные рассчеты для координат прямоугольника, который нужно очистить.
			    this._ctx.restore();
			  },

			  /**
			   * Включение режима перемещения. Запоминается текущее положение курсора,
			   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
			   * позволяющие перерисовывать изображение по мере перетаскивания.
			   * @param {number} x
			   * @param {number} y
			   * @private
			   */
			  _enterDragMode: function(x, y) {
			    this._cursorPosition = new Coordinate(x, y);
			    document.body.addEventListener('mousemove', this._onDrag);
			    document.body.addEventListener('mouseup', this._onDragEnd);
			  },

			  /**
			   * Выключение режима перемещения.
			   * @private
			   */
			  _exitDragMode: function() {
			    this._cursorPosition = null;
			    document.body.removeEventListener('mousemove', this._onDrag);
			    document.body.removeEventListener('mouseup', this._onDragEnd);
			  },

			  /**
			   * Перемещение изображения относительно кадра.
			   * @param {number} x
			   * @param {number} y
			   * @private
			   */
			  updatePosition: function(x, y) {
			    this.moveConstraint(
			        this._cursorPosition.x - x,
			        this._cursorPosition.y - y);
			    this._cursorPosition = new Coordinate(x, y);
			  },

			  /**
			   * @param {MouseEvent} evt
			   * @private
			   */
			  _onDragStart: function(evt) {
			    this._enterDragMode(evt.clientX, evt.clientY);
			  },

			  /**
			   * Обработчик окончания перетаскивания.
			   * @private
			   */
			  _onDragEnd: function() {
			    this._exitDragMode();
			  },

			  /**
			   * Обработчик события перетаскивания.
			   * @param {MouseEvent} evt
			   * @private
			   */
			  _onDrag: function(evt) {
			    this.updatePosition(evt.clientX, evt.clientY);
			  },

			  /**
			   * Добавление элемента в DOM.
			   * @param {Element} element
			   */
			  setElement: function(element) {
			    if (this._element === element) {
			      return;
			    }

			    this._element = element;
			    this._element.insertBefore(this._container, this._element.firstChild);
			    // Обработчики начала и конца перетаскивания.
			    this._container.addEventListener('mousedown', this._onDragStart);
			  },

			  /**
			   * Возвращает кадрирование элемента.
			   * @return {Square}
			   */
			  getConstraint: function() {
			    return this._resizeConstraint;
			  },

			  /**
			   * Смещает кадрирование на значение указанное в параметрах.
			   * @param {number} deltaX
			   * @param {number} deltaY
			   * @param {number} deltaSide
			   */
			  moveConstraint: function(deltaX, deltaY, deltaSide) {
			    this.setConstraint(
			        this._resizeConstraint.x + (deltaX || 0),
			        this._resizeConstraint.y + (deltaY || 0),
			        this._resizeConstraint.side + (deltaSide || 0));
			  },

			  /**
			   * @param {number} x
			   * @param {number} y
			   * @param {number} side
			   */
			  setConstraint: function(x, y, side) {
			    if (typeof x !== 'undefined') {
			      this._resizeConstraint.x = x;
			    }

			    if (typeof y !== 'undefined') {
			      this._resizeConstraint.y = y;
			    }

			    if (typeof side !== 'undefined') {
			      this._resizeConstraint.side = side;
			    }

			    requestAnimationFrame(function() {
			      this.redraw();
			      window.dispatchEvent(new CustomEvent('resizerchange'));
			    }.bind(this));
			  },

			  /**
			   * Удаление. Убирает контейнер из родительского элемента, убирает
			   * все обработчики событий и убирает ссылки.
			   */
			  remove: function() {
			    this._element.removeChild(this._container);

			    this._container.removeEventListener('mousedown', this._onDragStart);
			    this._container = null;
			  },

			  /**
			   * Экспорт обрезанного изображения как HTMLImageElement и исходником
			   * картинки в src в формате dataURL.
			   * @return {Image}
			   */
			  exportImage: function() {
			    // Создаем Image, с размерами, указанными при кадрировании.
			    var imageToExport = new Image();

			    // Создается новый canvas, по размерам совпадающий с кадрированным
			    // изображением, в него добавляется изображение взятое из канваса
			    // с измененными координатами и сохраняется в dataURL, с помощью метода
			    // toDataURL. Полученный исходный код, записывается в src у ранее
			    // созданного изображения.
			    var temporaryCanvas = document.createElement('canvas');
			    var temporaryCtx = temporaryCanvas.getContext('2d');
			    temporaryCanvas.width = this._resizeConstraint.side;
			    temporaryCanvas.height = this._resizeConstraint.side;
			    temporaryCtx.drawImage(this._image,
			        -this._resizeConstraint.x,
			        -this._resizeConstraint.y);
			    imageToExport.src = temporaryCanvas.toDataURL('image/png');

			    return imageToExport;
			  }
			};

			/**
			 * Вспомогательный тип, описывающий квадрат.
			 * @constructor
			 * @param {number} x
			 * @param {number} y
			 * @param {number} side
			 * @private
			 */
			var Square = function(x, y, side) {
			  this.x = x;
			  this.y = y;
			  this.side = side;
			};

			/**
			 * Вспомогательный тип, описывающий координату.
			 * @constructor
			 * @param {number} x
			 * @param {number} y
			 * @private
			 */
			var Coordinate = function(x, y) {
			  this.x = x;
			  this.y = y;
			};

			var zigzagRect = function(ctx, x0, y0, x1, y1) {
			  var xStart = x0;
			  var yStart = y0;

			  ctx.fillColor = 'black';
			  ctx.moveTo(x0, y0);
			  ctx.beginPath();
			  // длина зиг-заг линии
			  var line = 5;

			  var step = 0;

			  // слева направо - двигаемся по ox
			  while (x0 < x1) {
			    if (step % 2 === 0) {
			      x0 = x0 + line;
			      y0 = y0 + Math.abs(line);
			      ctx.lineTo(x0, y0);
			    } else {
			      x0 = x0 + line;
			      y0 = y0 - Math.abs(line);
			      ctx.lineTo(x0, y0);
			    }
			    step++;
			  }

			  // потом вниз  - двигаемся по oy
			  while (y0 < y1) {
			    if (step % 2 === 0) {
			      x0 = x0 + Math.abs(line);
			      y0 = y0 + line;
			      ctx.lineTo(x0, y0);
			    } else {
			      x0 = x0 - Math.abs(line);
			      y0 = y0 + line;
			      ctx.lineTo(x0, y0);
			    }
			    step++;
			  }

			  line = line * -1;
			  // налево
			  while (x0 > xStart) {
			    if (step % 2 === 0) {
			      x0 = x0 + line;
			      y0 = y0 + Math.abs(line);
			      ctx.lineTo(x0, y0);
			    } else {
			      x0 = x0 + line;
			      y0 = y0 - Math.abs(line);
			      ctx.lineTo(x0, y0);
			    }
			    step++;
			  }

			  // замыкаем вверх
			  while (y0 + line > yStart ) {
			    if (step % 2 === 0) {
			      x0 = x0 + Math.abs(line);
			      y0 = y0 + line;
			      ctx.lineTo(x0, y0);
			    } else {
			      x0 = x0 - Math.abs(line);
			      y0 = y0 + line;
			      ctx.lineTo(x0, y0);
			    }
			    step++;
			  }
			  ctx.stroke();
			};

			module.exports = Resizer;


		/***/ },
		/* 4 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var Photo = __webpack_require__(5);
			var Gallery = __webpack_require__(8);
			var Video = __webpack_require__(10);

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
			      setActiveFilter( localStorage.getItem('currentFilter') || 'popular' );
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
			    document.getElementById('filter-' + filterName).checked = true;
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


		/***/ },
		/* 5 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var inherit = __webpack_require__(6);
			var PhotoBase = __webpack_require__(7);

			/** Класс, представляющий фотографию на странице.
			* @module Photo
			* @constructor
			* @extends {PhotoBase}
			*/
			function Photo() {
			  this.mediatype = 'img';
			}
			inherit(Photo, PhotoBase);

			/**
			* Подгрузка изображения и создание картинки из шаблона
			*/
			Photo.prototype.render = function() {
			  var template = document.getElementById('picture-template');
			  this.element = template.content.children[0].cloneNode(true);
			  this.element.querySelector('.picture-comments').textContent = this.getComments();
			  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
			  picImage.src = this.getSrc();

			  this.element.addEventListener('click', this._onClick);
			  return this.element;
			};

			/** @function updateLikes - обновление кол-ва лайков в галерее */
			Photo.prototype.updateLikes = function() {
			  this.element.querySelector('.picture-likes').textContent = this.getLikes();
			};

			Photo.prototype.onClick = null;

			Photo.prototype._onClick = function(evt) {
			  evt.preventDefault();
			  if ( !this.classList.contains('picture-load-failure') ) {
			    if (typeof this.onClick === 'function') {
			      this.onClick();
			    }
			  }
			};

			module.exports = Photo;


		/***/ },
		/* 6 */
		/***/ function(module, exports) {

			'use strict';
			/**
			* @module inherit - реализует наследование классов, копированием прототипа
			*                   через временный класс
			* @param {Object} потомок
			* @param {Object} родитель
			*/
			function inherit(Child, Parent) {
			  var TempConstructor = function() {};
			  TempConstructor.prototype = Parent.prototype;
			  Child.prototype = new TempConstructor();
			  Child.prototype.constructor = Child;
			}
			module.exports = inherit;


		/***/ },
		/* 7 */
		/***/ function(module, exports) {

			'use strict';

			/** Базовый класс для медиа-элементов
			* @module PhotoBase
			* @constructor
			*/
			function PhotoBase() {
			}

			/** @type {Object} данные получаемые по AJAX*/
			PhotoBase.prototype._data = null;

			/**
			* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
			* переключении - определяет играть ли видео или нет.
			*/
			PhotoBase.prototype.mediatype = null;

			/**
			* Сохраняет медиа-данные в объекте и прописывает медиатип
			*/
			PhotoBase.prototype.setData = function(data) {
			  this._data = data;
			  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
			    this.mediatype = 'img';
			  } else {
			    this.mediatype = 'video';
			  }
			  this._data.liked = data.liked ? true : false;
			};

			/** @return {Object} - геттер данных объекта */

			PhotoBase.prototype.getData = function() {
			  return this._data;
			};

			/**
			* Функции-геттеры, используемые в сортировках/фильтрации
			*/
			PhotoBase.prototype.getLikes = function() {
			  return parseInt(this.getData().likes, 10);
			};

			PhotoBase.prototype.getComments = function() {
			  return parseInt(this.getData().comments, 10);
			};

			PhotoBase.prototype.getDate = function() {
			  return new Date(this.getData().date);
			};

			PhotoBase.prototype.getSrc = function() {
			  return this.getData().url;
			};



			/** Like dispatcher :) */
			PhotoBase.prototype.setLikes = function(likes) {
			  this._data.likes = likes;
			};

			PhotoBase.prototype.like = function() {
			  this.setLikes( this.getLikes() + 1 );
			  this._data.liked = true;
			};

			PhotoBase.prototype.dislike = function() {
			  this.setLikes( this.getLikes() - 1 );
			  this._data.liked = false;
			};

			PhotoBase.prototype.liked = function() {
			  return this._data.liked;
			};

			module.exports = PhotoBase;


		/***/ },
		/* 8 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var PhotoPreview = __webpack_require__(9);
			var preview = new PhotoPreview();
			var KEYCODE = {
			  'ESC': 27,
			  'LEFT': 37,
			  'RIGHT': 39
			};
			/** Класс, представляющий галерею.
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
			  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
			  currentIndex: null,

			  /**
			  * Показывает галерею и проставляет eventListeners
			  */
			  show: function() {
			    this.element.classList.remove('invisible');

			    // is this way of bind ok?

			    this._closeBtn.addEventListener('click', this._onCloseClick);
			    this._likeBtn.addEventListener('click', this._onLikeClick);
			    this._photo.addEventListener('click', this._onPhotoClick);
			    this._video.addEventListener('click', this._onVideoClick);
			    window.addEventListener('keydown', this._onDocumentKeyDown);
			  },

			  /**
			  * Прячет галерею и удаляет eventListeners
			  */
			  hide: function() {
			    this.element.classList.add('invisible');
			    this._photo.removeEventListener('click', this._onPhotoClick);
			    this._video.removeEventListener('click', this._onVideoClick);
			    this._closeBtn.removeEventListener('click', this._onCloseClick);
			    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
			    window.removeEventListener('keydown', this._onDocumentKeyDown);
			    location.hash = '';
			  },

			  /**
			  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
			  * @param {Array.<Photo>} photos
			  */
			  setPictures: function(photos) {
			    this.data = photos;
			  },

			  /**
			  * @param {integer|string} ind - индекс элемента Photo в this.data или
			  * getSrc() этого элемента.
			  */
			  setCurrentPicture: function(ind) {
			    if (typeof ind === 'number') {
			      preview.setData(this.data[ind].getData());
			      this.currentIndex = ind;
			    } else if (typeof ind === 'string') {
			      var item = this.data.filter(function( obj ) {
			        return obj.getSrc() === ind;
			      })[0];
			      this.currentIndex = this.data.indexOf(item);
			      preview.setData(item.getData());
			    }
			    if (!preview) {
			      return false;
			    }
			    preview.render(this.element);
			  },

			  /**
			  * Устанавливает hash в строке браузера в соответствии с getSrc()
			  * элемента, индекс которого передан
			  * @param {integer} ind
			  */
			  updateHash: function(ind) {
			    location.hash = location.hash = 'photo/' + this.data[ind].getSrc();
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

			  /**
			  * Обработчик кликов лайка в галерее
			  */
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

			  /**
			  * Управление проигрыванием видео.
			  */
			  _onVideoClick: function(evt) {
			    if (evt.target.tagName === 'VIDEO') {
			      if (this.paused) {
			        this.play();
			      } else {
			        this.pause();
			      }
			    }
			  },

			  /**
			  * Клавиатурные события: переключение объектов галереи, выход из галереи
			  */
			  _onDocumentKeyDown: function(evt) {
			    this._video.pause();
			    switch (evt.keyCode) {
			      case KEYCODE.ESC: this.hide();
			        break;
			      case KEYCODE.LEFT: this.updateHash(--this.currentIndex);
			        break;
			      case KEYCODE.RIGHT: if (this.currentIndex < this.data.length - 1) {
			        this.updateHash(++this.currentIndex);
			      }
			        break;
			    }
			  }
			};

			module.exports = Gallery;


		/***/ },
		/* 9 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var inherit = __webpack_require__(6);
			var PhotoBase = __webpack_require__(7);

			/** Объект, используемый для показа фото/видео в галерее
			* @module PhotoPreview
			* @constructor
			* @extends {PhotoBase}
			*/
			function PhotoPreview() {
			}

			inherit(PhotoPreview, PhotoBase);

			/**
			* Отрисовывает лайк, в зависимости от данных в объкете
			* и показывает/прячет видео-блок, проверяя mediatype
			*/

			PhotoPreview.prototype.render = function(el, noauto) {
			  el.querySelector('.likes-count').textContent = this.getLikes();
			  el.querySelector('.comments-count').textContent = this.getComments();
			  if ( this.liked() ) {
			    el.querySelector('.likes-count').classList.add('likes-count-liked');
			  } else {
			    el.querySelector('.likes-count').classList.remove('likes-count-liked');
			  }
			  if (this.mediatype === 'img') {
			    el.querySelector('.gallery-overlay-video').style.display = 'none';
			    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
			    el.querySelector('.gallery-overlay-image').src = this.getSrc();
			  } else if (this.mediatype === 'video') {
			    el.querySelector('.gallery-overlay-image').style.display = 'none';
			    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
			    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
			    el.querySelector('.gallery-overlay-video').src = this.getSrc();
			  }
			};

			module.exports = PhotoPreview;


		/***/ },
		/* 10 */
		/***/ function(module, exports, __webpack_require__) {

			'use strict';

			var inherit = __webpack_require__(6);
			var Photo = __webpack_require__(5);

			/** Объект, представляющий видео-элемент в галерее
			* @constructor
			* @extends {Photo}
			*/
			function Video() {
			  this.mediatype = 'video';
			}
			inherit(Video, Photo);

			/**
			* Подгрузка данных и создание видео-элемента
			*/
			Video.prototype.render = function() {
			  var template = document.getElementById('picture-template');
			  this.element = template.content.children[0].cloneNode(true);
			  this.element.querySelector('.picture-comments').textContent = this.getComments();
			  this.element.querySelector('.picture-likes').textContent = this.getLikes();

			  var videoElement = document.createElement('video');
			  videoElement.width = 182;
			  videoElement.height = 182;
			  videoElement.src = this.getSrc();
			  this.element.replaceChild(videoElement, this.element.firstElementChild);

			  this.element.addEventListener('click', this._onClick);
			  return this.element;
			};


			Video.prototype.onClick = null;

			Video.prototype._onClick = function(evt) {
			  evt.preventDefault();
			  if (typeof this.onClick === 'function') {
			    this.onClick();
			  }
			};

			module.exports = Video;


		/***/ },
		/* 11 */
		/***/ function(module, exports) {

			/******/ (function(modules) { // webpackBootstrap
			/******/ 	// The module cache
			/******/ 	var installedModules = {};

			/******/ 	// The require function
			/******/ 	function __webpack_require__(moduleId) {

			/******/ 		// Check if module is in cache
			/******/ 		if(installedModules[moduleId])
			/******/ 			return installedModules[moduleId].exports;

			/******/ 		// Create a new module (and put it into the cache)
			/******/ 		var module = installedModules[moduleId] = {
			/******/ 			exports: {},
			/******/ 			id: moduleId,
			/******/ 			loaded: false
			/******/ 		};

			/******/ 		// Execute the module function
			/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

			/******/ 		// Flag the module as loaded
			/******/ 		module.loaded = true;

			/******/ 		// Return the exports of the module
			/******/ 		return module.exports;
			/******/ 	}


			/******/ 	// expose the modules object (__webpack_modules__)
			/******/ 	__webpack_require__.m = modules;

			/******/ 	// expose the module cache
			/******/ 	__webpack_require__.c = installedModules;

			/******/ 	// __webpack_public_path__
			/******/ 	__webpack_require__.p = "";

			/******/ 	// Load entry module and return exports
			/******/ 	return __webpack_require__(0);
			/******/ })
			/************************************************************************/
			/******/ ([
			/* 0 */
			/***/ function(module, exports, __webpack_require__) {

				__webpack_require__(1);
				__webpack_require__(1);
				module.exports = __webpack_require__(11);


			/***/ },
			/* 1 */
			/***/ function(module, exports, __webpack_require__) {

				'use strict';

				__webpack_require__(2);
				__webpack_require__(4);


			/***/ },
			/* 2 */
			/***/ function(module, exports, __webpack_require__) {

				/* global docCookies */
				'use strict';

				var Resizer = __webpack_require__(3);

				/**
				 * @fileoverview
				 * @author Igor Alexeenko (o0)
				 */

				(function() {
				  /** @enum {string} */
				  var FileType = {
				    'GIF': '',
				    'JPEG': '',
				    'PNG': '',
				    'SVG+XML': ''
				  };

				  /** @enum {number} */
				  var Action = {
				    ERROR: 0,
				    UPLOADING: 1,
				    CUSTOM: 2
				  };


				  /**
				   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
				   * из ключей FileType.
				   * @type {RegExp}
				   */
				  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

				  /**
				   * @type {Object.<string, string>}
				   */
				  var filterMap;

				  /**
				   * Объект, который занимается кадрированием изображения.
				   * @type {Resizer}
				   */
				  var currentResizer;

				  /**
				   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
				   * изображением.
				   */
				  function cleanupResizer() {
				    if (currentResizer) {
				      currentResizer.remove();
				      currentResizer = null;
				    }
				  }

				  /**
				   * Ставит одну из трех случайных картинок на фон формы загрузки.
				   */
				  function updateBackground() {
				    var images = [
				      'img/logo-background-1.jpg',
				      'img/logo-background-2.jpg',
				      'img/logo-background-3.jpg'
				    ];

				    var backgroundElement = document.querySelector('.upload');
				    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
				    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
				  }

				  /**
				   * Проверяет, валидны ли данные, в форме кадрирования.
				   * @return {boolean}
				   */
				  function resizeFormIsValid() {
				    var resizeXField = +document.getElementById('resize-x').value;
				    var resizeYField = +document.getElementById('resize-y').value;
				    var resizeSizeField = +document.getElementById('resize-size').value;
				    var resizeBtn = document.getElementById('resize-fwd');

				    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
				        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
				      resizeBtn.disabled = true;
				    } else {
				      resizeBtn.disabled = false;
				    }

				    return resizeXField < 0 || resizeYField < 0 ? false : true;
				  }

				  /**
				   * Форма загрузки изображения.
				   * @type {HTMLFormElement}
				   */
				  var uploadForm = document.forms['upload-select-image'];

				  /**
				   * Форма кадрирования изображения.
				   * @type {HTMLFormElement}
				   */
				  var resizeForm = document.forms['upload-resize'];

				  /**
				   * Форма добавления фильтра.
				   * @type {HTMLFormElement}
				   */
				  var filterForm = document.forms['upload-filter'];

				  /**
				   * @type {HTMLImageElement}
				   */
				  var filterImage = filterForm.querySelector('.filter-image-preview');

				  /**
				   * @type {HTMLElement}
				   */
				  var uploadMessage = document.querySelector('.upload-message');

				  /**
				   * @param {Action} action
				   * @param {string=} message
				   * @return {Element}
				   */
				  function showMessage(action, message) {
				    var isError = false;

				    switch (action) {
				      case Action.UPLOADING:
				        message = message || 'Кексограмим&hellip;';
				        break;

				      case Action.ERROR:
				        isError = true;
				        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
				        break;
				    }

				    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
				    uploadMessage.classList.remove('invisible');
				    uploadMessage.classList.toggle('upload-message-error', isError);
				    return uploadMessage;
				  }

				  function hideMessage() {
				    uploadMessage.classList.add('invisible');
				  }

				  function setFilter(filterName) {
				    if (!filterMap) {
				      // Ленивая инициализация. Объект не создается до тех пор, пока
				      // не понадобится прочитать его в первый раз, а после этого запоминается
				      // навсегда.
				      filterMap = {
				        'none': 'filter-none',
				        'chrome': 'filter-chrome',
				        'sepia': 'filter-sepia'
				      };
				    }

				    // подсвечиваем выбранный фильтр
				    document.getElementById('upload-filter-' + filterName).checked = true;

				    // Класс перезаписывается, а не обновляется через classList потому что нужно
				    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
				    // состояние или просто перезаписывать.
				    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

				    // сохраняем в кукис
				    var closestDoB = new Date('2015-07-12');
				    var dateToExpire = new Date(
				      Date.now() + (Date.now() - closestDoB)
				    ).toUTCString();

				    docCookies.setItem('filter', filterName, dateToExpire);
				  }

				  /**
				   * Функция синхронизации ресайзера и формы
				   */
				  function syncResizer() {
				    if (currentResizer) {
				      var constraints = currentResizer.getConstraint();
				      document.getElementById('resize-x').value = constraints.x;
				      document.getElementById('resize-y').value = constraints.y;
				      document.getElementById('resize-size').value = constraints.side;
				    }
				  }

				  /**
				   * Обработчик изменения изображения в форме загрузки. Если загруженный
				   * файл является изображением, считывается исходник картинки, создается
				   * Resizer с загруженной картинкой, добавляется в форму кадрирования
				   * и показывается форма кадрирования.
				   * @param {Event} evt
				   */
				  uploadForm.addEventListener('change', function(evt) {
				    var element = evt.target;
				    if (element.id === 'upload-file') {
				      // Проверка типа загружаемого файла, тип должен быть изображением
				      // одного из форматов: JPEG, PNG, GIF или SVG.
				      if (fileRegExp.test(element.files[0].type)) {
				        var fileReader = new FileReader();

				        showMessage(Action.UPLOADING);

				        fileReader.onload = function() {
				          cleanupResizer();

				          currentResizer = new Resizer(fileReader.result);
				          currentResizer.setElement(resizeForm);
				          uploadMessage.classList.add('invisible');

				          uploadForm.classList.add('invisible');
				          resizeForm.classList.remove('invisible');

				          hideMessage();
				          setTimeout(syncResizer, 10);
				        };

				        fileReader.readAsDataURL(element.files[0]);
				      } else {
				        // Показ сообщения об ошибке, если загружаемый файл, не является
				        // поддерживаемым изображением.
				        showMessage(Action.ERROR);
				      }
				    }
				  });

				  /**
				   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
				   * @param {Event} evt
				   */
				  resizeForm.addEventListener('change', function(evt) {
				    // вынес в отдельные переменные для лучшей читаемости
				    resizeFormIsValid();
				    // получаем текущие координаты ресайзера
				    var constraints = currentResizer.getConstraint();

				    var changedElement = evt.target;
				    var newVal = +changedElement.value;

				    // двигаем ресайзер в зависимости от того, какое поле поменялось
				    switch (changedElement.name) {
				      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
				        break;
				      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
				        break;
				      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
				        break;
				    }
				  });

				  /**
				   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
				   * и обновляет фон.
				   * @param {Event} evt
				   */
				  resizeForm.addEventListener('reset', function(evt) {
				    evt.preventDefault();

				    cleanupResizer();
				    updateBackground();

				    resizeForm.classList.add('invisible');
				    uploadForm.classList.remove('invisible');
				  });

				  /**
				   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
				   * кропнутое изображение в форму добавления фильтра и показывает ее.
				   * @param {Event} evt
				   */
				  resizeForm.addEventListener('submit', function(evt) {
				    evt.preventDefault();

				    if (resizeFormIsValid()) {
				      filterImage.src = currentResizer.exportImage().src;

				      resizeForm.classList.add('invisible');
				      filterForm.classList.remove('invisible');
				    }
				  });

				  /**
				   * Сброс формы фильтра. Показывает форму кадрирования.
				   * @param {Event} evt
				   */
				  filterForm.addEventListener('reset', function(evt) {
				    evt.preventDefault();

				    filterForm.classList.add('invisible');
				    resizeForm.classList.remove('invisible');
				  });

				  /**
				   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
				   * записав сохраненный фильтр в cookie.
				   * @param {Event} evt
				   */
				  filterForm.addEventListener('submit', function(evt) {
				    evt.preventDefault();

				    cleanupResizer();
				    updateBackground();

				    filterForm.classList.add('invisible');
				    uploadForm.classList.remove('invisible');
				  });

				  /**
				   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
				   * выбранному значению в форме.
				   */
				  filterForm.addEventListener('change', function() {
				    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
				      return item.checked;
				    })[0].value;
				    setFilter(selectedFilter);
				  });

				  cleanupResizer();
				  updateBackground();
				  // выставляем фильтр, если находим его в кукисах
				  if (docCookies.getItem('filter') === null) {
				    setFilter('none');
				  } else {
				    setFilter( docCookies.getItem('filter') );
				  }

				  window.addEventListener('resizerchange', syncResizer);


				})();


			/***/ },
			/* 3 */
			/***/ function(module, exports) {

				'use strict';

				/**
				 * @constructor
				 * @param {string} image
				 */
				var Resizer = function(image) {
				  // Изображение, с которым будет вестись работа.
				  this._image = new Image();
				  this._image.src = image;

				  // Холст.
				  this._container = document.createElement('canvas');
				  this._ctx = this._container.getContext('2d');

				  // Создаем холст только после загрузки изображения.
				  this._image.onload = function() {
				    // Размер холста равен размеру загруженного изображения. Это нужно
				    // для удобства работы с координатами.
				    this._container.width = this._image.naturalWidth;
				    this._container.height = this._image.naturalHeight;

				    /**
				     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
				     * стороны изображения.
				     * @const
				     * @type {number}
				     */
				    var INITIAL_SIDE_RATIO = 0.75;
				    // Размер меньшей стороны изображения.
				    var side = Math.min(
				        this._container.width * INITIAL_SIDE_RATIO,
				        this._container.height * INITIAL_SIDE_RATIO);

				    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
				    // от размера меньшей стороны.
				    this._resizeConstraint = new Square(
				        this._container.width / 2 - side / 2,
				        this._container.height / 2 - side / 2,
				        side);

				    // Отрисовка изначального состояния канваса.
				    this.redraw();
				  }.bind(this);

				  // Фиксирование контекста обработчиков.
				  this._onDragStart = this._onDragStart.bind(this);
				  this._onDragEnd = this._onDragEnd.bind(this);
				  this._onDrag = this._onDrag.bind(this);
				};

				Resizer.prototype = {
				  /**
				   * Родительский элемент канваса.
				   * @type {Element}
				   * @private
				   */
				  _element: null,

				  /**
				   * Положение курсора в момент перетаскивания. От положения курсора
				   * рассчитывается смещение на которое нужно переместить изображение
				   * за каждую итерацию перетаскивания.
				   * @type {Coordinate}
				   * @private
				   */
				  _cursorPosition: null,

				  /**
				   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
				   * от верхнего левого угла исходного изображения.
				   * @type {Square}
				   * @private
				   */
				  _resizeConstraint: null,

				  /**
				   * Отрисовка канваса.
				   */
				  redraw: function() {
				    // Очистка изображения.
				    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

				    // Параметры линии.
				    // NB! Такие параметры сохраняются на время всего процесса отрисовки
				    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
				    // чего-либо с другой обводкой.

				    // Толщина линии.
				    this._ctx.lineWidth = 6;
				    // Цвет обводки.
				    this._ctx.strokeStyle = '#ffe753';

				    // Сохранение состояния канваса.
				    // Подробней см. строку 132.
				    this._ctx.save();

				    // Установка начальной точки системы координат в центр холста.
				    this._ctx.translate(this._container.width / 2, this._container.height / 2);

				    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
				    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
				    // Отрисовка изображения на холсте. Параметры задают изображение, которое
				    // нужно отрисовать и координаты его верхнего левого угла.
				    // Координаты задаются от центра холста.

				    this._ctx.drawImage(this._image, displX, displY);

				    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
				    // взяты из начального кода отрисовки рамки
				    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
				    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
				    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
				    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

				    // ставим прозрачность 0.8
				    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
				    this._ctx.beginPath();

				    // рисуем зиг-заг прямоугольник
				    zigzagRect(this._ctx, x0, y0, x1, y1);

				    // после этого обводим рамку по внешнему периметру
				    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
				    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
				    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
				    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
				    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
				    // заливаем получившуюся фигуру
				    this._ctx.fill();

				    // рисуем центрированный текст
				    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
				    this._ctx.fillStyle = '#FFF';
				    this._ctx.textAlign = 'center';
				    this._ctx.textBaseline = 'bottom';
				    this._ctx.font = 'normal 30px Arial';
				    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

				    // Восстановление состояния канваса, которое было до вызова ctx.save
				    // и последующего изменения системы координат. Нужно для того, чтобы
				    // следующий кадр рисовался с привычной системой координат, где точка
				    // 0 0 находится в левом верхнем углу холста, в противном случае
				    // некорректно сработает даже очистка холста или нужно будет использовать
				    // сложные рассчеты для координат прямоугольника, который нужно очистить.
				    this._ctx.restore();
				  },

				  /**
				   * Включение режима перемещения. Запоминается текущее положение курсора,
				   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
				   * позволяющие перерисовывать изображение по мере перетаскивания.
				   * @param {number} x
				   * @param {number} y
				   * @private
				   */
				  _enterDragMode: function(x, y) {
				    this._cursorPosition = new Coordinate(x, y);
				    document.body.addEventListener('mousemove', this._onDrag);
				    document.body.addEventListener('mouseup', this._onDragEnd);
				  },

				  /**
				   * Выключение режима перемещения.
				   * @private
				   */
				  _exitDragMode: function() {
				    this._cursorPosition = null;
				    document.body.removeEventListener('mousemove', this._onDrag);
				    document.body.removeEventListener('mouseup', this._onDragEnd);
				  },

				  /**
				   * Перемещение изображения относительно кадра.
				   * @param {number} x
				   * @param {number} y
				   * @private
				   */
				  updatePosition: function(x, y) {
				    this.moveConstraint(
				        this._cursorPosition.x - x,
				        this._cursorPosition.y - y);
				    this._cursorPosition = new Coordinate(x, y);
				  },

				  /**
				   * @param {MouseEvent} evt
				   * @private
				   */
				  _onDragStart: function(evt) {
				    this._enterDragMode(evt.clientX, evt.clientY);
				  },

				  /**
				   * Обработчик окончания перетаскивания.
				   * @private
				   */
				  _onDragEnd: function() {
				    this._exitDragMode();
				  },

				  /**
				   * Обработчик события перетаскивания.
				   * @param {MouseEvent} evt
				   * @private
				   */
				  _onDrag: function(evt) {
				    this.updatePosition(evt.clientX, evt.clientY);
				  },

				  /**
				   * Добавление элемента в DOM.
				   * @param {Element} element
				   */
				  setElement: function(element) {
				    if (this._element === element) {
				      return;
				    }

				    this._element = element;
				    this._element.insertBefore(this._container, this._element.firstChild);
				    // Обработчики начала и конца перетаскивания.
				    this._container.addEventListener('mousedown', this._onDragStart);
				  },

				  /**
				   * Возвращает кадрирование элемента.
				   * @return {Square}
				   */
				  getConstraint: function() {
				    return this._resizeConstraint;
				  },

				  /**
				   * Смещает кадрирование на значение указанное в параметрах.
				   * @param {number} deltaX
				   * @param {number} deltaY
				   * @param {number} deltaSide
				   */
				  moveConstraint: function(deltaX, deltaY, deltaSide) {
				    this.setConstraint(
				        this._resizeConstraint.x + (deltaX || 0),
				        this._resizeConstraint.y + (deltaY || 0),
				        this._resizeConstraint.side + (deltaSide || 0));
				  },

				  /**
				   * @param {number} x
				   * @param {number} y
				   * @param {number} side
				   */
				  setConstraint: function(x, y, side) {
				    if (typeof x !== 'undefined') {
				      this._resizeConstraint.x = x;
				    }

				    if (typeof y !== 'undefined') {
				      this._resizeConstraint.y = y;
				    }

				    if (typeof side !== 'undefined') {
				      this._resizeConstraint.side = side;
				    }

				    requestAnimationFrame(function() {
				      this.redraw();
				      window.dispatchEvent(new CustomEvent('resizerchange'));
				    }.bind(this));
				  },

				  /**
				   * Удаление. Убирает контейнер из родительского элемента, убирает
				   * все обработчики событий и убирает ссылки.
				   */
				  remove: function() {
				    this._element.removeChild(this._container);

				    this._container.removeEventListener('mousedown', this._onDragStart);
				    this._container = null;
				  },

				  /**
				   * Экспорт обрезанного изображения как HTMLImageElement и исходником
				   * картинки в src в формате dataURL.
				   * @return {Image}
				   */
				  exportImage: function() {
				    // Создаем Image, с размерами, указанными при кадрировании.
				    var imageToExport = new Image();

				    // Создается новый canvas, по размерам совпадающий с кадрированным
				    // изображением, в него добавляется изображение взятое из канваса
				    // с измененными координатами и сохраняется в dataURL, с помощью метода
				    // toDataURL. Полученный исходный код, записывается в src у ранее
				    // созданного изображения.
				    var temporaryCanvas = document.createElement('canvas');
				    var temporaryCtx = temporaryCanvas.getContext('2d');
				    temporaryCanvas.width = this._resizeConstraint.side;
				    temporaryCanvas.height = this._resizeConstraint.side;
				    temporaryCtx.drawImage(this._image,
				        -this._resizeConstraint.x,
				        -this._resizeConstraint.y);
				    imageToExport.src = temporaryCanvas.toDataURL('image/png');

				    return imageToExport;
				  }
				};

				/**
				 * Вспомогательный тип, описывающий квадрат.
				 * @constructor
				 * @param {number} x
				 * @param {number} y
				 * @param {number} side
				 * @private
				 */
				var Square = function(x, y, side) {
				  this.x = x;
				  this.y = y;
				  this.side = side;
				};

				/**
				 * Вспомогательный тип, описывающий координату.
				 * @constructor
				 * @param {number} x
				 * @param {number} y
				 * @private
				 */
				var Coordinate = function(x, y) {
				  this.x = x;
				  this.y = y;
				};

				var zigzagRect = function(ctx, x0, y0, x1, y1) {
				  var xStart = x0;
				  var yStart = y0;

				  ctx.fillColor = 'black';
				  ctx.moveTo(x0, y0);
				  ctx.beginPath();
				  // длина зиг-заг линии
				  var line = 5;

				  var step = 0;

				  // слева направо - двигаемся по ox
				  while (x0 < x1) {
				    if (step % 2 === 0) {
				      x0 = x0 + line;
				      y0 = y0 + Math.abs(line);
				      ctx.lineTo(x0, y0);
				    } else {
				      x0 = x0 + line;
				      y0 = y0 - Math.abs(line);
				      ctx.lineTo(x0, y0);
				    }
				    step++;
				  }

				  // потом вниз  - двигаемся по oy
				  while (y0 < y1) {
				    if (step % 2 === 0) {
				      x0 = x0 + Math.abs(line);
				      y0 = y0 + line;
				      ctx.lineTo(x0, y0);
				    } else {
				      x0 = x0 - Math.abs(line);
				      y0 = y0 + line;
				      ctx.lineTo(x0, y0);
				    }
				    step++;
				  }

				  line = line * -1;
				  // налево
				  while (x0 > xStart) {
				    if (step % 2 === 0) {
				      x0 = x0 + line;
				      y0 = y0 + Math.abs(line);
				      ctx.lineTo(x0, y0);
				    } else {
				      x0 = x0 + line;
				      y0 = y0 - Math.abs(line);
				      ctx.lineTo(x0, y0);
				    }
				    step++;
				  }

				  // замыкаем вверх
				  while (y0 + line > yStart ) {
				    if (step % 2 === 0) {
				      x0 = x0 + Math.abs(line);
				      y0 = y0 + line;
				      ctx.lineTo(x0, y0);
				    } else {
				      x0 = x0 - Math.abs(line);
				      y0 = y0 + line;
				      ctx.lineTo(x0, y0);
				    }
				    step++;
				  }
				  ctx.stroke();
				};

				module.exports = Resizer;


			/***/ },
			/* 4 */
			/***/ function(module, exports, __webpack_require__) {

				'use strict';

				var Photo = __webpack_require__(5);
				var Gallery = __webpack_require__(8);
				var Video = __webpack_require__(10);

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
				      setActiveFilter( localStorage.getItem('currentFilter') || 'popular' );
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
				    document.getElementById('filter-' + filterName).checked = true;
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


			/***/ },
			/* 5 */
			/***/ function(module, exports, __webpack_require__) {

				'use strict';

				var inherit = __webpack_require__(6);
				var PhotoBase = __webpack_require__(7);

				/** Класс, представляющий фотографию на странице.
				* @module Photo
				* @constructor
				* @extends {PhotoBase}
				*/
				function Photo() {
				  this.mediatype = 'img';
				}
				inherit(Photo, PhotoBase);

				/**
				* Подгрузка изображения и создание картинки из шаблона
				*/
				Photo.prototype.render = function() {
				  var template = document.getElementById('picture-template');
				  this.element = template.content.children[0].cloneNode(true);
				  this.element.querySelector('.picture-comments').textContent = this.getComments();
				  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
				  picImage.src = this.getSrc();

				  this.element.addEventListener('click', this._onClick);
				  return this.element;
				};

				/** @function updateLikes - обновление кол-ва лайков в галерее */
				Photo.prototype.updateLikes = function() {
				  this.element.querySelector('.picture-likes').textContent = this.getLikes();
				};

				Photo.prototype.onClick = null;

				Photo.prototype._onClick = function(evt) {
				  evt.preventDefault();
				  if ( !this.classList.contains('picture-load-failure') ) {
				    if (typeof this.onClick === 'function') {
				      this.onClick();
				    }
				  }
				};

				module.exports = Photo;


			/***/ },
			/* 6 */
			/***/ function(module, exports) {

				'use strict';
				/**
				* @module inherit - реализует наследование классов, копированием прототипа
				*                   через временный класс
				* @param {Object} потомок
				* @param {Object} родитель
				*/
				function inherit(Child, Parent) {
				  var TempConstructor = function() {};
				  TempConstructor.prototype = Parent.prototype;
				  Child.prototype = new TempConstructor();
				  Child.prototype.constructor = Child;
				}
				module.exports = inherit;


			/***/ },
			/* 7 */
			/***/ function(module, exports) {

				'use strict';

				/** Базовый класс для медиа-элементов
				* @module PhotoBase
				* @constructor
				*/
				function PhotoBase() {
				}

				/** @type {Object} данные получаемые по AJAX*/
				PhotoBase.prototype._data = null;

				/**
				* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
				* переключении - определяет играть ли видео или нет.
				*/
				PhotoBase.prototype.mediatype = null;

				/**
				* Сохраняет медиа-данные в объекте и прописывает медиатип
				*/
				PhotoBase.prototype.setData = function(data) {
				  this._data = data;
				  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
				    this.mediatype = 'img';
				  } else {
				    this.mediatype = 'video';
				  }
				  this._data.liked = data.liked ? true : false;
				};

				/** @return {Object} - геттер данных объекта */

				PhotoBase.prototype.getData = function() {
				  return this._data;
				};

				/**
				* Функции-геттеры, используемые в сортировках/фильтрации
				*/
				PhotoBase.prototype.getLikes = function() {
				  return parseInt(this.getData().likes, 10);
				};

				PhotoBase.prototype.getComments = function() {
				  return parseInt(this.getData().comments, 10);
				};

				PhotoBase.prototype.getDate = function() {
				  return new Date(this.getData().date);
				};

				PhotoBase.prototype.getSrc = function() {
				  return this.getData().url;
				};



				/** Like dispatcher :) */
				PhotoBase.prototype.setLikes = function(likes) {
				  this._data.likes = likes;
				};

				PhotoBase.prototype.like = function() {
				  this.setLikes( this.getLikes() + 1 );
				  this._data.liked = true;
				};

				PhotoBase.prototype.dislike = function() {
				  this.setLikes( this.getLikes() - 1 );
				  this._data.liked = false;
				};

				PhotoBase.prototype.liked = function() {
				  return this._data.liked;
				};

				module.exports = PhotoBase;


			/***/ },
			/* 8 */
			/***/ function(module, exports, __webpack_require__) {

				'use strict';

				var PhotoPreview = __webpack_require__(9);
				var preview = new PhotoPreview();
				var KEYCODE = {
				  'ESC': 27,
				  'LEFT': 37,
				  'RIGHT': 39
				};
				/** Класс, представляющий галерею.
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
				  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
				  currentIndex: null,

				  /**
				  * Показывает галерею и проставляет eventListeners
				  */
				  show: function() {
				    this.element.classList.remove('invisible');

				    // is this way of bind ok?

				    this._closeBtn.addEventListener('click', this._onCloseClick);
				    this._likeBtn.addEventListener('click', this._onLikeClick);
				    this._photo.addEventListener('click', this._onPhotoClick);
				    this._video.addEventListener('click', this._onVideoClick);
				    window.addEventListener('keydown', this._onDocumentKeyDown);
				  },

				  /**
				  * Прячет галерею и удаляет eventListeners
				  */
				  hide: function() {
				    this.element.classList.add('invisible');
				    this._photo.removeEventListener('click', this._onPhotoClick);
				    this._video.removeEventListener('click', this._onVideoClick);
				    this._closeBtn.removeEventListener('click', this._onCloseClick);
				    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
				    window.removeEventListener('keydown', this._onDocumentKeyDown);
				    location.hash = '';
				  },

				  /**
				  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
				  * @param {Array.<Photo>} photos
				  */
				  setPictures: function(photos) {
				    this.data = photos;
				  },

				  /**
				  * @param {integer|string} ind - индекс элемента Photo в this.data или
				  * getSrc() этого элемента.
				  */
				  setCurrentPicture: function(ind) {
				    if (typeof ind === 'number') {
				      preview.setData(this.data[ind].getData());
				      this.currentIndex = ind;
				    } else if (typeof ind === 'string') {
				      var item = this.data.filter(function( obj ) {
				        return obj.getSrc() === ind;
				      })[0];
				      this.currentIndex = this.data.indexOf(item);
				      preview.setData(item.getData());
				    }
				    if (!preview) {
				      return false;
				    }
				    preview.render(this.element);
				  },

				  /**
				  * Устанавливает hash в строке браузера в соответствии с getSrc()
				  * элемента, индекс которого передан
				  * @param {integer} ind
				  */
				  updateHash: function(ind) {
				    location.hash = location.hash = 'photo/' + this.data[ind].getSrc();
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

				  /**
				  * Обработчик кликов лайка в галерее
				  */
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

				  /**
				  * Управление проигрыванием видео.
				  */
				  _onVideoClick: function(evt) {
				    if (evt.target.tagName === 'VIDEO') {
				      if (this.paused) {
				        this.play();
				      } else {
				        this.pause();
				      }
				    }
				  },

				  /**
				  * Клавиатурные события: переключение объектов галереи, выход из галереи
				  */

				  _onDocumentKeyDown: function(evt) {
				    this._video.pause();
				    switch (evt.keyCode) {
				      case KEYCODE.ESC: this.hide();
				        break;
				      case KEYCODE.LEFT: this.updateHash(--this.currentIndex);
				        break;
				      case KEYCODE.RIGHT: console.log(this.currentIndex);
				        if (this.currentIndex < this.data.length - 1) {
				          this.updateHash(++this.currentIndex);
				        }
				        break;
				    }
				  }
				};

				module.exports = Gallery;


			/***/ },
			/* 9 */
			/***/ function(module, exports, __webpack_require__) {

				'use strict';

				var inherit = __webpack_require__(6);
				var PhotoBase = __webpack_require__(7);

				/** Объект, используемый для показа фото/видео в галерее
				* @module PhotoPreview
				* @constructor
				* @extends {PhotoBase}
				*/
				function PhotoPreview() {
				}

				inherit(PhotoPreview, PhotoBase);

				/**
				* Отрисовывает лайк, в зависимости от данных в объкете
				* и показывает/прячет видео-блок, проверяя mediatype
				*/

				PhotoPreview.prototype.render = function(el, noauto) {
				  el.querySelector('.likes-count').textContent = this.getLikes();
				  el.querySelector('.comments-count').textContent = this.getComments();
				  if ( this.liked() ) {
				    el.querySelector('.likes-count').classList.add('likes-count-liked');
				  } else {
				    el.querySelector('.likes-count').classList.remove('likes-count-liked');
				  }
				  if (this.mediatype === 'img') {
				    el.querySelector('.gallery-overlay-video').style.display = 'none';
				    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
				    el.querySelector('.gallery-overlay-image').src = this.getSrc();
				  } else if (this.mediatype === 'video') {
				    el.querySelector('.gallery-overlay-image').style.display = 'none';
				    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
				    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
				    el.querySelector('.gallery-overlay-video').src = this.getSrc();
				  }
				};

				module.exports = PhotoPreview;


			/***/ },
			/* 10 */
			/***/ function(module, exports, __webpack_require__) {

				'use strict';

				var inherit = __webpack_require__(6);
				var Photo = __webpack_require__(5);

				/** Объект, представляющий видео-элемент в галерее
				* @constructor
				* @extends {Photo}
				*/
				function Video() {
				  this.mediatype = 'video';
				}
				inherit(Video, Photo);

				/**
				* Подгрузка данных и создание видео-элемента
				*/
				Video.prototype.render = function() {
				  var template = document.getElementById('picture-template');
				  this.element = template.content.children[0].cloneNode(true);
				  this.element.querySelector('.picture-comments').textContent = this.getComments();
				  this.element.querySelector('.picture-likes').textContent = this.getLikes();

				  var videoElement = document.createElement('video');
				  videoElement.width = 182;
				  videoElement.height = 182;
				  videoElement.src = this.getSrc();
				  this.element.replaceChild(videoElement, this.element.firstElementChild);

				  this.element.addEventListener('click', this._onClick);
				  return this.element;
				};


				Video.prototype.onClick = null;

				Video.prototype._onClick = function(evt) {
				  evt.preventDefault();
				  if (typeof this.onClick === 'function') {
				    this.onClick();
				  }
				};

				module.exports = Video;


			/***/ },
			/* 11 */
			/***/ function(module, exports) {

				/******/ (function(modules) { // webpackBootstrap
				/******/ 	// The module cache
				/******/ 	var installedModules = {};

				/******/ 	// The require function
				/******/ 	function __webpack_require__(moduleId) {

				/******/ 		// Check if module is in cache
				/******/ 		if(installedModules[moduleId])
				/******/ 			return installedModules[moduleId].exports;

				/******/ 		// Create a new module (and put it into the cache)
				/******/ 		var module = installedModules[moduleId] = {
				/******/ 			exports: {},
				/******/ 			id: moduleId,
				/******/ 			loaded: false
				/******/ 		};

				/******/ 		// Execute the module function
				/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

				/******/ 		// Flag the module as loaded
				/******/ 		module.loaded = true;

				/******/ 		// Return the exports of the module
				/******/ 		return module.exports;
				/******/ 	}


				/******/ 	// expose the modules object (__webpack_modules__)
				/******/ 	__webpack_require__.m = modules;

				/******/ 	// expose the module cache
				/******/ 	__webpack_require__.c = installedModules;

				/******/ 	// __webpack_public_path__
				/******/ 	__webpack_require__.p = "";

				/******/ 	// Load entry module and return exports
				/******/ 	return __webpack_require__(0);
				/******/ })
				/************************************************************************/
				/******/ ([
				/* 0 */
				/***/ function(module, exports, __webpack_require__) {

					__webpack_require__(1);
					__webpack_require__(1);
					module.exports = __webpack_require__(11);


				/***/ },
				/* 1 */
				/***/ function(module, exports, __webpack_require__) {

					'use strict';

					__webpack_require__(2);
					__webpack_require__(4);


				/***/ },
				/* 2 */
				/***/ function(module, exports, __webpack_require__) {

					/* global docCookies */
					'use strict';

					var Resizer = __webpack_require__(3);

					/**
					 * @fileoverview
					 * @author Igor Alexeenko (o0)
					 */

					(function() {
					  /** @enum {string} */
					  var FileType = {
					    'GIF': '',
					    'JPEG': '',
					    'PNG': '',
					    'SVG+XML': ''
					  };

					  /** @enum {number} */
					  var Action = {
					    ERROR: 0,
					    UPLOADING: 1,
					    CUSTOM: 2
					  };


					  /**
					   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
					   * из ключей FileType.
					   * @type {RegExp}
					   */
					  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

					  /**
					   * @type {Object.<string, string>}
					   */
					  var filterMap;

					  /**
					   * Объект, который занимается кадрированием изображения.
					   * @type {Resizer}
					   */
					  var currentResizer;

					  /**
					   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
					   * изображением.
					   */
					  function cleanupResizer() {
					    if (currentResizer) {
					      currentResizer.remove();
					      currentResizer = null;
					    }
					  }

					  /**
					   * Ставит одну из трех случайных картинок на фон формы загрузки.
					   */
					  function updateBackground() {
					    var images = [
					      'img/logo-background-1.jpg',
					      'img/logo-background-2.jpg',
					      'img/logo-background-3.jpg'
					    ];

					    var backgroundElement = document.querySelector('.upload');
					    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
					    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
					  }

					  /**
					   * Проверяет, валидны ли данные, в форме кадрирования.
					   * @return {boolean}
					   */
					  function resizeFormIsValid() {
					    var resizeXField = +document.getElementById('resize-x').value;
					    var resizeYField = +document.getElementById('resize-y').value;
					    var resizeSizeField = +document.getElementById('resize-size').value;
					    var resizeBtn = document.getElementById('resize-fwd');

					    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
					        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
					      resizeBtn.disabled = true;
					    } else {
					      resizeBtn.disabled = false;
					    }

					    return resizeXField < 0 || resizeYField < 0 ? false : true;
					  }

					  /**
					   * Форма загрузки изображения.
					   * @type {HTMLFormElement}
					   */
					  var uploadForm = document.forms['upload-select-image'];

					  /**
					   * Форма кадрирования изображения.
					   * @type {HTMLFormElement}
					   */
					  var resizeForm = document.forms['upload-resize'];

					  /**
					   * Форма добавления фильтра.
					   * @type {HTMLFormElement}
					   */
					  var filterForm = document.forms['upload-filter'];

					  /**
					   * @type {HTMLImageElement}
					   */
					  var filterImage = filterForm.querySelector('.filter-image-preview');

					  /**
					   * @type {HTMLElement}
					   */
					  var uploadMessage = document.querySelector('.upload-message');

					  /**
					   * @param {Action} action
					   * @param {string=} message
					   * @return {Element}
					   */
					  function showMessage(action, message) {
					    var isError = false;

					    switch (action) {
					      case Action.UPLOADING:
					        message = message || 'Кексограмим&hellip;';
					        break;

					      case Action.ERROR:
					        isError = true;
					        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
					        break;
					    }

					    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
					    uploadMessage.classList.remove('invisible');
					    uploadMessage.classList.toggle('upload-message-error', isError);
					    return uploadMessage;
					  }

					  function hideMessage() {
					    uploadMessage.classList.add('invisible');
					  }

					  function setFilter(filterName) {
					    if (!filterMap) {
					      // Ленивая инициализация. Объект не создается до тех пор, пока
					      // не понадобится прочитать его в первый раз, а после этого запоминается
					      // навсегда.
					      filterMap = {
					        'none': 'filter-none',
					        'chrome': 'filter-chrome',
					        'sepia': 'filter-sepia'
					      };
					    }

					    // подсвечиваем выбранный фильтр
					    document.getElementById('upload-filter-' + filterName).checked = true;

					    // Класс перезаписывается, а не обновляется через classList потому что нужно
					    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
					    // состояние или просто перезаписывать.
					    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

					    // сохраняем в кукис
					    var closestDoB = new Date('2015-07-12');
					    var dateToExpire = new Date(
					      Date.now() + (Date.now() - closestDoB)
					    ).toUTCString();

					    docCookies.setItem('filter', filterName, dateToExpire);
					  }

					  /**
					   * Функция синхронизации ресайзера и формы
					   */
					  function syncResizer() {
					    if (currentResizer) {
					      var constraints = currentResizer.getConstraint();
					      document.getElementById('resize-x').value = constraints.x;
					      document.getElementById('resize-y').value = constraints.y;
					      document.getElementById('resize-size').value = constraints.side;
					    }
					  }

					  /**
					   * Обработчик изменения изображения в форме загрузки. Если загруженный
					   * файл является изображением, считывается исходник картинки, создается
					   * Resizer с загруженной картинкой, добавляется в форму кадрирования
					   * и показывается форма кадрирования.
					   * @param {Event} evt
					   */
					  uploadForm.addEventListener('change', function(evt) {
					    var element = evt.target;
					    if (element.id === 'upload-file') {
					      // Проверка типа загружаемого файла, тип должен быть изображением
					      // одного из форматов: JPEG, PNG, GIF или SVG.
					      if (fileRegExp.test(element.files[0].type)) {
					        var fileReader = new FileReader();

					        showMessage(Action.UPLOADING);

					        fileReader.onload = function() {
					          cleanupResizer();

					          currentResizer = new Resizer(fileReader.result);
					          currentResizer.setElement(resizeForm);
					          uploadMessage.classList.add('invisible');

					          uploadForm.classList.add('invisible');
					          resizeForm.classList.remove('invisible');

					          hideMessage();
					          setTimeout(syncResizer, 10);
					        };

					        fileReader.readAsDataURL(element.files[0]);
					      } else {
					        // Показ сообщения об ошибке, если загружаемый файл, не является
					        // поддерживаемым изображением.
					        showMessage(Action.ERROR);
					      }
					    }
					  });

					  /**
					   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
					   * @param {Event} evt
					   */
					  resizeForm.addEventListener('change', function(evt) {
					    // вынес в отдельные переменные для лучшей читаемости
					    resizeFormIsValid();
					    // получаем текущие координаты ресайзера
					    var constraints = currentResizer.getConstraint();

					    var changedElement = evt.target;
					    var newVal = +changedElement.value;

					    // двигаем ресайзер в зависимости от того, какое поле поменялось
					    switch (changedElement.name) {
					      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
					        break;
					      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
					        break;
					      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
					        break;
					    }
					  });

					  /**
					   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
					   * и обновляет фон.
					   * @param {Event} evt
					   */
					  resizeForm.addEventListener('reset', function(evt) {
					    evt.preventDefault();

					    cleanupResizer();
					    updateBackground();

					    resizeForm.classList.add('invisible');
					    uploadForm.classList.remove('invisible');
					  });

					  /**
					   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
					   * кропнутое изображение в форму добавления фильтра и показывает ее.
					   * @param {Event} evt
					   */
					  resizeForm.addEventListener('submit', function(evt) {
					    evt.preventDefault();

					    if (resizeFormIsValid()) {
					      filterImage.src = currentResizer.exportImage().src;

					      resizeForm.classList.add('invisible');
					      filterForm.classList.remove('invisible');
					    }
					  });

					  /**
					   * Сброс формы фильтра. Показывает форму кадрирования.
					   * @param {Event} evt
					   */
					  filterForm.addEventListener('reset', function(evt) {
					    evt.preventDefault();

					    filterForm.classList.add('invisible');
					    resizeForm.classList.remove('invisible');
					  });

					  /**
					   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
					   * записав сохраненный фильтр в cookie.
					   * @param {Event} evt
					   */
					  filterForm.addEventListener('submit', function(evt) {
					    evt.preventDefault();

					    cleanupResizer();
					    updateBackground();

					    filterForm.classList.add('invisible');
					    uploadForm.classList.remove('invisible');
					  });

					  /**
					   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
					   * выбранному значению в форме.
					   */
					  filterForm.addEventListener('change', function() {
					    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
					      return item.checked;
					    })[0].value;
					    setFilter(selectedFilter);
					  });

					  cleanupResizer();
					  updateBackground();
					  // выставляем фильтр, если находим его в кукисах
					  if (docCookies.getItem('filter') === null) {
					    setFilter('none');
					  } else {
					    setFilter( docCookies.getItem('filter') );
					  }

					  window.addEventListener('resizerchange', syncResizer);


					})();


				/***/ },
				/* 3 */
				/***/ function(module, exports) {

					'use strict';

					/**
					 * @constructor
					 * @param {string} image
					 */
					var Resizer = function(image) {
					  // Изображение, с которым будет вестись работа.
					  this._image = new Image();
					  this._image.src = image;

					  // Холст.
					  this._container = document.createElement('canvas');
					  this._ctx = this._container.getContext('2d');

					  // Создаем холст только после загрузки изображения.
					  this._image.onload = function() {
					    // Размер холста равен размеру загруженного изображения. Это нужно
					    // для удобства работы с координатами.
					    this._container.width = this._image.naturalWidth;
					    this._container.height = this._image.naturalHeight;

					    /**
					     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
					     * стороны изображения.
					     * @const
					     * @type {number}
					     */
					    var INITIAL_SIDE_RATIO = 0.75;
					    // Размер меньшей стороны изображения.
					    var side = Math.min(
					        this._container.width * INITIAL_SIDE_RATIO,
					        this._container.height * INITIAL_SIDE_RATIO);

					    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
					    // от размера меньшей стороны.
					    this._resizeConstraint = new Square(
					        this._container.width / 2 - side / 2,
					        this._container.height / 2 - side / 2,
					        side);

					    // Отрисовка изначального состояния канваса.
					    this.redraw();
					  }.bind(this);

					  // Фиксирование контекста обработчиков.
					  this._onDragStart = this._onDragStart.bind(this);
					  this._onDragEnd = this._onDragEnd.bind(this);
					  this._onDrag = this._onDrag.bind(this);
					};

					Resizer.prototype = {
					  /**
					   * Родительский элемент канваса.
					   * @type {Element}
					   * @private
					   */
					  _element: null,

					  /**
					   * Положение курсора в момент перетаскивания. От положения курсора
					   * рассчитывается смещение на которое нужно переместить изображение
					   * за каждую итерацию перетаскивания.
					   * @type {Coordinate}
					   * @private
					   */
					  _cursorPosition: null,

					  /**
					   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
					   * от верхнего левого угла исходного изображения.
					   * @type {Square}
					   * @private
					   */
					  _resizeConstraint: null,

					  /**
					   * Отрисовка канваса.
					   */
					  redraw: function() {
					    // Очистка изображения.
					    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

					    // Параметры линии.
					    // NB! Такие параметры сохраняются на время всего процесса отрисовки
					    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
					    // чего-либо с другой обводкой.

					    // Толщина линии.
					    this._ctx.lineWidth = 6;
					    // Цвет обводки.
					    this._ctx.strokeStyle = '#ffe753';

					    // Сохранение состояния канваса.
					    // Подробней см. строку 132.
					    this._ctx.save();

					    // Установка начальной точки системы координат в центр холста.
					    this._ctx.translate(this._container.width / 2, this._container.height / 2);

					    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
					    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
					    // Отрисовка изображения на холсте. Параметры задают изображение, которое
					    // нужно отрисовать и координаты его верхнего левого угла.
					    // Координаты задаются от центра холста.

					    this._ctx.drawImage(this._image, displX, displY);

					    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
					    // взяты из начального кода отрисовки рамки
					    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
					    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
					    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
					    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

					    // ставим прозрачность 0.8
					    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
					    this._ctx.beginPath();

					    // рисуем зиг-заг прямоугольник
					    zigzagRect(this._ctx, x0, y0, x1, y1);

					    // после этого обводим рамку по внешнему периметру
					    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
					    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
					    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
					    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
					    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
					    // заливаем получившуюся фигуру
					    this._ctx.fill();

					    // рисуем центрированный текст
					    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
					    this._ctx.fillStyle = '#FFF';
					    this._ctx.textAlign = 'center';
					    this._ctx.textBaseline = 'bottom';
					    this._ctx.font = 'normal 30px Arial';
					    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

					    // Восстановление состояния канваса, которое было до вызова ctx.save
					    // и последующего изменения системы координат. Нужно для того, чтобы
					    // следующий кадр рисовался с привычной системой координат, где точка
					    // 0 0 находится в левом верхнем углу холста, в противном случае
					    // некорректно сработает даже очистка холста или нужно будет использовать
					    // сложные рассчеты для координат прямоугольника, который нужно очистить.
					    this._ctx.restore();
					  },

					  /**
					   * Включение режима перемещения. Запоминается текущее положение курсора,
					   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
					   * позволяющие перерисовывать изображение по мере перетаскивания.
					   * @param {number} x
					   * @param {number} y
					   * @private
					   */
					  _enterDragMode: function(x, y) {
					    this._cursorPosition = new Coordinate(x, y);
					    document.body.addEventListener('mousemove', this._onDrag);
					    document.body.addEventListener('mouseup', this._onDragEnd);
					  },

					  /**
					   * Выключение режима перемещения.
					   * @private
					   */
					  _exitDragMode: function() {
					    this._cursorPosition = null;
					    document.body.removeEventListener('mousemove', this._onDrag);
					    document.body.removeEventListener('mouseup', this._onDragEnd);
					  },

					  /**
					   * Перемещение изображения относительно кадра.
					   * @param {number} x
					   * @param {number} y
					   * @private
					   */
					  updatePosition: function(x, y) {
					    this.moveConstraint(
					        this._cursorPosition.x - x,
					        this._cursorPosition.y - y);
					    this._cursorPosition = new Coordinate(x, y);
					  },

					  /**
					   * @param {MouseEvent} evt
					   * @private
					   */
					  _onDragStart: function(evt) {
					    this._enterDragMode(evt.clientX, evt.clientY);
					  },

					  /**
					   * Обработчик окончания перетаскивания.
					   * @private
					   */
					  _onDragEnd: function() {
					    this._exitDragMode();
					  },

					  /**
					   * Обработчик события перетаскивания.
					   * @param {MouseEvent} evt
					   * @private
					   */
					  _onDrag: function(evt) {
					    this.updatePosition(evt.clientX, evt.clientY);
					  },

					  /**
					   * Добавление элемента в DOM.
					   * @param {Element} element
					   */
					  setElement: function(element) {
					    if (this._element === element) {
					      return;
					    }

					    this._element = element;
					    this._element.insertBefore(this._container, this._element.firstChild);
					    // Обработчики начала и конца перетаскивания.
					    this._container.addEventListener('mousedown', this._onDragStart);
					  },

					  /**
					   * Возвращает кадрирование элемента.
					   * @return {Square}
					   */
					  getConstraint: function() {
					    return this._resizeConstraint;
					  },

					  /**
					   * Смещает кадрирование на значение указанное в параметрах.
					   * @param {number} deltaX
					   * @param {number} deltaY
					   * @param {number} deltaSide
					   */
					  moveConstraint: function(deltaX, deltaY, deltaSide) {
					    this.setConstraint(
					        this._resizeConstraint.x + (deltaX || 0),
					        this._resizeConstraint.y + (deltaY || 0),
					        this._resizeConstraint.side + (deltaSide || 0));
					  },

					  /**
					   * @param {number} x
					   * @param {number} y
					   * @param {number} side
					   */
					  setConstraint: function(x, y, side) {
					    if (typeof x !== 'undefined') {
					      this._resizeConstraint.x = x;
					    }

					    if (typeof y !== 'undefined') {
					      this._resizeConstraint.y = y;
					    }

					    if (typeof side !== 'undefined') {
					      this._resizeConstraint.side = side;
					    }

					    requestAnimationFrame(function() {
					      this.redraw();
					      window.dispatchEvent(new CustomEvent('resizerchange'));
					    }.bind(this));
					  },

					  /**
					   * Удаление. Убирает контейнер из родительского элемента, убирает
					   * все обработчики событий и убирает ссылки.
					   */
					  remove: function() {
					    this._element.removeChild(this._container);

					    this._container.removeEventListener('mousedown', this._onDragStart);
					    this._container = null;
					  },

					  /**
					   * Экспорт обрезанного изображения как HTMLImageElement и исходником
					   * картинки в src в формате dataURL.
					   * @return {Image}
					   */
					  exportImage: function() {
					    // Создаем Image, с размерами, указанными при кадрировании.
					    var imageToExport = new Image();

					    // Создается новый canvas, по размерам совпадающий с кадрированным
					    // изображением, в него добавляется изображение взятое из канваса
					    // с измененными координатами и сохраняется в dataURL, с помощью метода
					    // toDataURL. Полученный исходный код, записывается в src у ранее
					    // созданного изображения.
					    var temporaryCanvas = document.createElement('canvas');
					    var temporaryCtx = temporaryCanvas.getContext('2d');
					    temporaryCanvas.width = this._resizeConstraint.side;
					    temporaryCanvas.height = this._resizeConstraint.side;
					    temporaryCtx.drawImage(this._image,
					        -this._resizeConstraint.x,
					        -this._resizeConstraint.y);
					    imageToExport.src = temporaryCanvas.toDataURL('image/png');

					    return imageToExport;
					  }
					};

					/**
					 * Вспомогательный тип, описывающий квадрат.
					 * @constructor
					 * @param {number} x
					 * @param {number} y
					 * @param {number} side
					 * @private
					 */
					var Square = function(x, y, side) {
					  this.x = x;
					  this.y = y;
					  this.side = side;
					};

					/**
					 * Вспомогательный тип, описывающий координату.
					 * @constructor
					 * @param {number} x
					 * @param {number} y
					 * @private
					 */
					var Coordinate = function(x, y) {
					  this.x = x;
					  this.y = y;
					};

					var zigzagRect = function(ctx, x0, y0, x1, y1) {
					  var xStart = x0;
					  var yStart = y0;

					  ctx.fillColor = 'black';
					  ctx.moveTo(x0, y0);
					  ctx.beginPath();
					  // длина зиг-заг линии
					  var line = 5;

					  var step = 0;

					  // слева направо - двигаемся по ox
					  while (x0 < x1) {
					    if (step % 2 === 0) {
					      x0 = x0 + line;
					      y0 = y0 + Math.abs(line);
					      ctx.lineTo(x0, y0);
					    } else {
					      x0 = x0 + line;
					      y0 = y0 - Math.abs(line);
					      ctx.lineTo(x0, y0);
					    }
					    step++;
					  }

					  // потом вниз  - двигаемся по oy
					  while (y0 < y1) {
					    if (step % 2 === 0) {
					      x0 = x0 + Math.abs(line);
					      y0 = y0 + line;
					      ctx.lineTo(x0, y0);
					    } else {
					      x0 = x0 - Math.abs(line);
					      y0 = y0 + line;
					      ctx.lineTo(x0, y0);
					    }
					    step++;
					  }

					  line = line * -1;
					  // налево
					  while (x0 > xStart) {
					    if (step % 2 === 0) {
					      x0 = x0 + line;
					      y0 = y0 + Math.abs(line);
					      ctx.lineTo(x0, y0);
					    } else {
					      x0 = x0 + line;
					      y0 = y0 - Math.abs(line);
					      ctx.lineTo(x0, y0);
					    }
					    step++;
					  }

					  // замыкаем вверх
					  while (y0 + line > yStart ) {
					    if (step % 2 === 0) {
					      x0 = x0 + Math.abs(line);
					      y0 = y0 + line;
					      ctx.lineTo(x0, y0);
					    } else {
					      x0 = x0 - Math.abs(line);
					      y0 = y0 + line;
					      ctx.lineTo(x0, y0);
					    }
					    step++;
					  }
					  ctx.stroke();
					};

					module.exports = Resizer;


				/***/ },
				/* 4 */
				/***/ function(module, exports, __webpack_require__) {

					'use strict';

					var Photo = __webpack_require__(5);
					var Gallery = __webpack_require__(8);
					var Video = __webpack_require__(10);

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
					      setActiveFilter( localStorage.getItem('currentFilter') || 'popular' );
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
					        //gallery.setCurrentPicture( renderedPhotos.indexOf(photoElement) );
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
					    document.getElementById('filter-' + filterName).checked = true;
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


				/***/ },
				/* 5 */
				/***/ function(module, exports, __webpack_require__) {

					'use strict';

					var inherit = __webpack_require__(6);
					var PhotoBase = __webpack_require__(7);

					/** Класс, представляющий фотографию на странице.
					* @module Photo
					* @constructor
					* @extends {PhotoBase}
					*/
					function Photo() {
					  this.mediatype = 'img';
					}
					inherit(Photo, PhotoBase);

					/**
					* Подгрузка изображения и создание картинки из шаблона
					*/
					Photo.prototype.render = function() {
					  var template = document.getElementById('picture-template');
					  this.element = template.content.children[0].cloneNode(true);
					  this.element.querySelector('.picture-comments').textContent = this.getComments();
					  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
					  picImage.src = this.getSrc();

					  this.element.addEventListener('click', this._onClick);
					  return this.element;
					};

					/** @function updateLikes - обновление кол-ва лайков в галерее */
					Photo.prototype.updateLikes = function() {
					  this.element.querySelector('.picture-likes').textContent = this.getLikes();
					};

					Photo.prototype.onClick = null;

					Photo.prototype._onClick = function(evt) {
					  evt.preventDefault();
					  if ( !this.classList.contains('picture-load-failure') ) {
					    if (typeof this.onClick === 'function') {
					      this.onClick();
					    }
					  }
					};

					module.exports = Photo;


				/***/ },
				/* 6 */
				/***/ function(module, exports) {

					'use strict';
					/**
					* @module inherit - реализует наследование классов, копированием прототипа
					*                   через временный класс
					* @param {Object} потомок
					* @param {Object} родитель
					*/
					function inherit(Child, Parent) {
					  var TempConstructor = function() {};
					  TempConstructor.prototype = Parent.prototype;
					  Child.prototype = new TempConstructor();
					  Child.prototype.constructor = Child;
					}
					module.exports = inherit;


				/***/ },
				/* 7 */
				/***/ function(module, exports) {

					'use strict';

					/** Базовый класс для медиа-элементов
					* @module PhotoBase
					* @constructor
					*/
					function PhotoBase() {
					}

					/** @type {Object} данные получаемые по AJAX*/
					PhotoBase.prototype._data = null;

					/**
					* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
					* переключении - определяет играть ли видео или нет.
					*/
					PhotoBase.prototype.mediatype = null;

					/**
					* Сохраняет медиа-данные в объекте и прописывает медиатип
					*/
					PhotoBase.prototype.setData = function(data) {
					  this._data = data;
					  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
					    this.mediatype = 'img';
					  } else {
					    this.mediatype = 'video';
					  }
					  this._data.liked = data.liked ? true : false;
					};

					/** @return {Object} - геттер данных объекта */

					PhotoBase.prototype.getData = function() {
					  return this._data;
					};

					/**
					* Функции-геттеры, используемые в сортировках/фильтрации
					*/
					PhotoBase.prototype.getLikes = function() {
					  return parseInt(this.getData().likes, 10);
					};

					PhotoBase.prototype.getComments = function() {
					  return parseInt(this.getData().comments, 10);
					};

					PhotoBase.prototype.getDate = function() {
					  return new Date(this.getData().date);
					};

					PhotoBase.prototype.getSrc = function() {
					  return this.getData().url;
					};



					/** Like dispatcher :) */
					PhotoBase.prototype.setLikes = function(likes) {
					  this._data.likes = likes;
					};

					PhotoBase.prototype.like = function() {
					  this.setLikes( this.getLikes() + 1 );
					  this._data.liked = true;
					};

					PhotoBase.prototype.dislike = function() {
					  this.setLikes( this.getLikes() - 1 );
					  this._data.liked = false;
					};

					PhotoBase.prototype.liked = function() {
					  return this._data.liked;
					};

					module.exports = PhotoBase;


				/***/ },
				/* 8 */
				/***/ function(module, exports, __webpack_require__) {

					'use strict';

					var PhotoPreview = __webpack_require__(9);
					var preview = new PhotoPreview();
					var KEYCODE = {
					  'ESC': 27,
					  'LEFT': 37,
					  'RIGHT': 39
					};
					/** Класс, представляющий галерею.
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
					  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
					  currentIndex: null,

					  /**
					  * Показывает галерею и проставляет eventListeners
					  */
					  show: function() {
					    this.element.classList.remove('invisible');

					    // is this way of bind ok?

					    this._closeBtn.addEventListener('click', this._onCloseClick);
					    this._likeBtn.addEventListener('click', this._onLikeClick);
					    this._photo.addEventListener('click', this._onPhotoClick);
					    this._video.addEventListener('click', this._onVideoClick);
					    window.addEventListener('keydown', this._onDocumentKeyDown);
					  },

					  /**
					  * Прячет галерею и удаляет eventListeners
					  */
					  hide: function() {
					    this.element.classList.add('invisible');
					    this._photo.removeEventListener('click', this._onPhotoClick);
					    this._video.removeEventListener('click', this._onVideoClick);
					    this._closeBtn.removeEventListener('click', this._onCloseClick);
					    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
					    window.removeEventListener('keydown', this._onDocumentKeyDown);
					    location.hash = '';
					  },

					  /**
					  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
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
					    if (typeof ind === 'number') {
					      preview.setData(this.data[ind].getData());
					    } else if (typeof ind === 'string') {
					      var item = this.data.filter(function( obj ) {
					        return obj.getSrc() === ind;
					      });
					      console.log(item);
					      preview.setData(item[0].getData());
					    }
					    if (!preview) {
					      return false;
					    }
					    this.currentIndex = ind;
					    preview.render(this.element);
					  },

					  /**
					  *
					  */
					  updateHash: function(ind) {
					    console.log('updateHash: ', this.data[ind]);
					    console.log(this.data[ind].getSrc());
					    location.hash = location.hash = 'photo/' + this.data[ind].getSrc();
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

					  /**
					  * Обработчик кликов лайка в галерее
					  */
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

					  /**
					  * Управление проигрыванием видео.
					  */
					  _onVideoClick: function(evt) {
					    if (evt.target.tagName === 'VIDEO') {
					      if (this.paused) {
					        this.play();
					      } else {
					        this.pause();
					      }
					    }
					  },

					  /**
					  * Клавиатурные события: переключение объектов галереи, выход из галереи
					  */

					  _onDocumentKeyDown: function(evt) {
					    this._video.pause();
					    switch (evt.keyCode) {
					      case KEYCODE.ESC: console.log('go');
					        this.hide();
					        break;
					      case KEYCODE.LEFT: this.updateHash(--this.currentIndex);
					        break;
					      case KEYCODE.RIGHT: if (this.currentIndex < this.data.length - 1) {
					        this.updateHash(++this.currentIndex);
					      }
					        break;
					    }
					  }
					};

					module.exports = Gallery;


				/***/ },
				/* 9 */
				/***/ function(module, exports, __webpack_require__) {

					'use strict';

					var inherit = __webpack_require__(6);
					var PhotoBase = __webpack_require__(7);

					/** Объект, используемый для показа фото/видео в галерее
					* @module PhotoPreview
					* @constructor
					* @extends {PhotoBase}
					*/
					function PhotoPreview() {
					}

					inherit(PhotoPreview, PhotoBase);

					/**
					* Отрисовывает лайк, в зависимости от данных в объкете
					* и показывает/прячет видео-блок, проверяя mediatype
					*/

					PhotoPreview.prototype.render = function(el, noauto) {
					  el.querySelector('.likes-count').textContent = this.getLikes();
					  el.querySelector('.comments-count').textContent = this.getComments();
					  if ( this.liked() ) {
					    el.querySelector('.likes-count').classList.add('likes-count-liked');
					  } else {
					    el.querySelector('.likes-count').classList.remove('likes-count-liked');
					  }
					  if (this.mediatype === 'img') {
					    el.querySelector('.gallery-overlay-video').style.display = 'none';
					    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
					    el.querySelector('.gallery-overlay-image').src = this.getSrc();
					  } else if (this.mediatype === 'video') {
					    el.querySelector('.gallery-overlay-image').style.display = 'none';
					    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
					    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
					    el.querySelector('.gallery-overlay-video').src = this.getSrc();
					  }
					};

					module.exports = PhotoPreview;


				/***/ },
				/* 10 */
				/***/ function(module, exports, __webpack_require__) {

					'use strict';

					var inherit = __webpack_require__(6);
					var Photo = __webpack_require__(5);

					/** Объект, представляющий видео-элемент в галерее
					* @constructor
					* @extends {Photo}
					*/
					function Video() {
					  this.mediatype = 'video';
					}
					inherit(Video, Photo);

					/**
					* Подгрузка данных и создание видео-элемента
					*/
					Video.prototype.render = function() {
					  var template = document.getElementById('picture-template');
					  this.element = template.content.children[0].cloneNode(true);
					  this.element.querySelector('.picture-comments').textContent = this.getComments();
					  this.element.querySelector('.picture-likes').textContent = this.getLikes();

					  var videoElement = document.createElement('video');
					  videoElement.width = 182;
					  videoElement.height = 182;
					  videoElement.src = this.getSrc();
					  this.element.replaceChild(videoElement, this.element.firstElementChild);

					  this.element.addEventListener('click', this._onClick);
					  return this.element;
					};


					Video.prototype.onClick = null;

					Video.prototype._onClick = function(evt) {
					  evt.preventDefault();
					  if (typeof this.onClick === 'function') {
					    this.onClick();
					  }
					};

					module.exports = Video;


				/***/ },
				/* 11 */
				/***/ function(module, exports) {

					/******/ (function(modules) { // webpackBootstrap
					/******/ 	// The module cache
					/******/ 	var installedModules = {};

					/******/ 	// The require function
					/******/ 	function __webpack_require__(moduleId) {

					/******/ 		// Check if module is in cache
					/******/ 		if(installedModules[moduleId])
					/******/ 			return installedModules[moduleId].exports;

					/******/ 		// Create a new module (and put it into the cache)
					/******/ 		var module = installedModules[moduleId] = {
					/******/ 			exports: {},
					/******/ 			id: moduleId,
					/******/ 			loaded: false
					/******/ 		};

					/******/ 		// Execute the module function
					/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

					/******/ 		// Flag the module as loaded
					/******/ 		module.loaded = true;

					/******/ 		// Return the exports of the module
					/******/ 		return module.exports;
					/******/ 	}


					/******/ 	// expose the modules object (__webpack_modules__)
					/******/ 	__webpack_require__.m = modules;

					/******/ 	// expose the module cache
					/******/ 	__webpack_require__.c = installedModules;

					/******/ 	// __webpack_public_path__
					/******/ 	__webpack_require__.p = "";

					/******/ 	// Load entry module and return exports
					/******/ 	return __webpack_require__(0);
					/******/ })
					/************************************************************************/
					/******/ ([
					/* 0 */
					/***/ function(module, exports, __webpack_require__) {

						__webpack_require__(1);
						__webpack_require__(1);
						module.exports = __webpack_require__(11);


					/***/ },
					/* 1 */
					/***/ function(module, exports, __webpack_require__) {

						'use strict';

						__webpack_require__(2);
						__webpack_require__(4);


					/***/ },
					/* 2 */
					/***/ function(module, exports, __webpack_require__) {

						/* global docCookies */
						'use strict';

						var Resizer = __webpack_require__(3);

						/**
						 * @fileoverview
						 * @author Igor Alexeenko (o0)
						 */

						(function() {
						  /** @enum {string} */
						  var FileType = {
						    'GIF': '',
						    'JPEG': '',
						    'PNG': '',
						    'SVG+XML': ''
						  };

						  /** @enum {number} */
						  var Action = {
						    ERROR: 0,
						    UPLOADING: 1,
						    CUSTOM: 2
						  };


						  /**
						   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
						   * из ключей FileType.
						   * @type {RegExp}
						   */
						  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

						  /**
						   * @type {Object.<string, string>}
						   */
						  var filterMap;

						  /**
						   * Объект, который занимается кадрированием изображения.
						   * @type {Resizer}
						   */
						  var currentResizer;

						  /**
						   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
						   * изображением.
						   */
						  function cleanupResizer() {
						    if (currentResizer) {
						      currentResizer.remove();
						      currentResizer = null;
						    }
						  }

						  /**
						   * Ставит одну из трех случайных картинок на фон формы загрузки.
						   */
						  function updateBackground() {
						    var images = [
						      'img/logo-background-1.jpg',
						      'img/logo-background-2.jpg',
						      'img/logo-background-3.jpg'
						    ];

						    var backgroundElement = document.querySelector('.upload');
						    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
						    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
						  }

						  /**
						   * Проверяет, валидны ли данные, в форме кадрирования.
						   * @return {boolean}
						   */
						  function resizeFormIsValid() {
						    var resizeXField = +document.getElementById('resize-x').value;
						    var resizeYField = +document.getElementById('resize-y').value;
						    var resizeSizeField = +document.getElementById('resize-size').value;
						    var resizeBtn = document.getElementById('resize-fwd');

						    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
						        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
						      resizeBtn.disabled = true;
						    } else {
						      resizeBtn.disabled = false;
						    }

						    return resizeXField < 0 || resizeYField < 0 ? false : true;
						  }

						  /**
						   * Форма загрузки изображения.
						   * @type {HTMLFormElement}
						   */
						  var uploadForm = document.forms['upload-select-image'];

						  /**
						   * Форма кадрирования изображения.
						   * @type {HTMLFormElement}
						   */
						  var resizeForm = document.forms['upload-resize'];

						  /**
						   * Форма добавления фильтра.
						   * @type {HTMLFormElement}
						   */
						  var filterForm = document.forms['upload-filter'];

						  /**
						   * @type {HTMLImageElement}
						   */
						  var filterImage = filterForm.querySelector('.filter-image-preview');

						  /**
						   * @type {HTMLElement}
						   */
						  var uploadMessage = document.querySelector('.upload-message');

						  /**
						   * @param {Action} action
						   * @param {string=} message
						   * @return {Element}
						   */
						  function showMessage(action, message) {
						    var isError = false;

						    switch (action) {
						      case Action.UPLOADING:
						        message = message || 'Кексограмим&hellip;';
						        break;

						      case Action.ERROR:
						        isError = true;
						        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
						        break;
						    }

						    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
						    uploadMessage.classList.remove('invisible');
						    uploadMessage.classList.toggle('upload-message-error', isError);
						    return uploadMessage;
						  }

						  function hideMessage() {
						    uploadMessage.classList.add('invisible');
						  }

						  function setFilter(filterName) {
						    if (!filterMap) {
						      // Ленивая инициализация. Объект не создается до тех пор, пока
						      // не понадобится прочитать его в первый раз, а после этого запоминается
						      // навсегда.
						      filterMap = {
						        'none': 'filter-none',
						        'chrome': 'filter-chrome',
						        'sepia': 'filter-sepia'
						      };
						    }

						    // подсвечиваем выбранный фильтр
						    document.getElementById('upload-filter-' + filterName).checked = true;

						    // Класс перезаписывается, а не обновляется через classList потому что нужно
						    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
						    // состояние или просто перезаписывать.
						    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

						    // сохраняем в кукис
						    var closestDoB = new Date('2015-07-12');
						    var dateToExpire = new Date(
						      Date.now() + (Date.now() - closestDoB)
						    ).toUTCString();

						    docCookies.setItem('filter', filterName, dateToExpire);
						  }

						  /**
						   * Функция синхронизации ресайзера и формы
						   */
						  function syncResizer() {
						    if (currentResizer) {
						      var constraints = currentResizer.getConstraint();
						      document.getElementById('resize-x').value = constraints.x;
						      document.getElementById('resize-y').value = constraints.y;
						      document.getElementById('resize-size').value = constraints.side;
						    }
						  }

						  /**
						   * Обработчик изменения изображения в форме загрузки. Если загруженный
						   * файл является изображением, считывается исходник картинки, создается
						   * Resizer с загруженной картинкой, добавляется в форму кадрирования
						   * и показывается форма кадрирования.
						   * @param {Event} evt
						   */
						  uploadForm.addEventListener('change', function(evt) {
						    var element = evt.target;
						    if (element.id === 'upload-file') {
						      // Проверка типа загружаемого файла, тип должен быть изображением
						      // одного из форматов: JPEG, PNG, GIF или SVG.
						      if (fileRegExp.test(element.files[0].type)) {
						        var fileReader = new FileReader();

						        showMessage(Action.UPLOADING);

						        fileReader.onload = function() {
						          cleanupResizer();

						          currentResizer = new Resizer(fileReader.result);
						          currentResizer.setElement(resizeForm);
						          uploadMessage.classList.add('invisible');

						          uploadForm.classList.add('invisible');
						          resizeForm.classList.remove('invisible');

						          hideMessage();
						          setTimeout(syncResizer, 10);
						        };

						        fileReader.readAsDataURL(element.files[0]);
						      } else {
						        // Показ сообщения об ошибке, если загружаемый файл, не является
						        // поддерживаемым изображением.
						        showMessage(Action.ERROR);
						      }
						    }
						  });

						  /**
						   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
						   * @param {Event} evt
						   */
						  resizeForm.addEventListener('change', function(evt) {
						    // вынес в отдельные переменные для лучшей читаемости
						    resizeFormIsValid();
						    // получаем текущие координаты ресайзера
						    var constraints = currentResizer.getConstraint();

						    var changedElement = evt.target;
						    var newVal = +changedElement.value;

						    // двигаем ресайзер в зависимости от того, какое поле поменялось
						    switch (changedElement.name) {
						      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
						        break;
						      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
						        break;
						      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
						        break;
						    }
						  });

						  /**
						   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
						   * и обновляет фон.
						   * @param {Event} evt
						   */
						  resizeForm.addEventListener('reset', function(evt) {
						    evt.preventDefault();

						    cleanupResizer();
						    updateBackground();

						    resizeForm.classList.add('invisible');
						    uploadForm.classList.remove('invisible');
						  });

						  /**
						   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
						   * кропнутое изображение в форму добавления фильтра и показывает ее.
						   * @param {Event} evt
						   */
						  resizeForm.addEventListener('submit', function(evt) {
						    evt.preventDefault();

						    if (resizeFormIsValid()) {
						      filterImage.src = currentResizer.exportImage().src;

						      resizeForm.classList.add('invisible');
						      filterForm.classList.remove('invisible');
						    }
						  });

						  /**
						   * Сброс формы фильтра. Показывает форму кадрирования.
						   * @param {Event} evt
						   */
						  filterForm.addEventListener('reset', function(evt) {
						    evt.preventDefault();

						    filterForm.classList.add('invisible');
						    resizeForm.classList.remove('invisible');
						  });

						  /**
						   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
						   * записав сохраненный фильтр в cookie.
						   * @param {Event} evt
						   */
						  filterForm.addEventListener('submit', function(evt) {
						    evt.preventDefault();

						    cleanupResizer();
						    updateBackground();

						    filterForm.classList.add('invisible');
						    uploadForm.classList.remove('invisible');
						  });

						  /**
						   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
						   * выбранному значению в форме.
						   */
						  filterForm.addEventListener('change', function() {
						    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
						      return item.checked;
						    })[0].value;
						    setFilter(selectedFilter);
						  });

						  cleanupResizer();
						  updateBackground();
						  // выставляем фильтр, если находим его в кукисах
						  if (docCookies.getItem('filter') === null) {
						    setFilter('none');
						  } else {
						    setFilter( docCookies.getItem('filter') );
						  }

						  window.addEventListener('resizerchange', syncResizer);


						})();


					/***/ },
					/* 3 */
					/***/ function(module, exports) {

						'use strict';

						/**
						 * @constructor
						 * @param {string} image
						 */
						var Resizer = function(image) {
						  // Изображение, с которым будет вестись работа.
						  this._image = new Image();
						  this._image.src = image;

						  // Холст.
						  this._container = document.createElement('canvas');
						  this._ctx = this._container.getContext('2d');

						  // Создаем холст только после загрузки изображения.
						  this._image.onload = function() {
						    // Размер холста равен размеру загруженного изображения. Это нужно
						    // для удобства работы с координатами.
						    this._container.width = this._image.naturalWidth;
						    this._container.height = this._image.naturalHeight;

						    /**
						     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
						     * стороны изображения.
						     * @const
						     * @type {number}
						     */
						    var INITIAL_SIDE_RATIO = 0.75;
						    // Размер меньшей стороны изображения.
						    var side = Math.min(
						        this._container.width * INITIAL_SIDE_RATIO,
						        this._container.height * INITIAL_SIDE_RATIO);

						    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
						    // от размера меньшей стороны.
						    this._resizeConstraint = new Square(
						        this._container.width / 2 - side / 2,
						        this._container.height / 2 - side / 2,
						        side);

						    // Отрисовка изначального состояния канваса.
						    this.redraw();
						  }.bind(this);

						  // Фиксирование контекста обработчиков.
						  this._onDragStart = this._onDragStart.bind(this);
						  this._onDragEnd = this._onDragEnd.bind(this);
						  this._onDrag = this._onDrag.bind(this);
						};

						Resizer.prototype = {
						  /**
						   * Родительский элемент канваса.
						   * @type {Element}
						   * @private
						   */
						  _element: null,

						  /**
						   * Положение курсора в момент перетаскивания. От положения курсора
						   * рассчитывается смещение на которое нужно переместить изображение
						   * за каждую итерацию перетаскивания.
						   * @type {Coordinate}
						   * @private
						   */
						  _cursorPosition: null,

						  /**
						   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
						   * от верхнего левого угла исходного изображения.
						   * @type {Square}
						   * @private
						   */
						  _resizeConstraint: null,

						  /**
						   * Отрисовка канваса.
						   */
						  redraw: function() {
						    // Очистка изображения.
						    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

						    // Параметры линии.
						    // NB! Такие параметры сохраняются на время всего процесса отрисовки
						    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
						    // чего-либо с другой обводкой.

						    // Толщина линии.
						    this._ctx.lineWidth = 6;
						    // Цвет обводки.
						    this._ctx.strokeStyle = '#ffe753';

						    // Сохранение состояния канваса.
						    // Подробней см. строку 132.
						    this._ctx.save();

						    // Установка начальной точки системы координат в центр холста.
						    this._ctx.translate(this._container.width / 2, this._container.height / 2);

						    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
						    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
						    // Отрисовка изображения на холсте. Параметры задают изображение, которое
						    // нужно отрисовать и координаты его верхнего левого угла.
						    // Координаты задаются от центра холста.

						    this._ctx.drawImage(this._image, displX, displY);

						    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
						    // взяты из начального кода отрисовки рамки
						    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
						    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
						    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
						    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

						    // ставим прозрачность 0.8
						    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
						    this._ctx.beginPath();

						    // рисуем зиг-заг прямоугольник
						    zigzagRect(this._ctx, x0, y0, x1, y1);

						    // после этого обводим рамку по внешнему периметру
						    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
						    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
						    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
						    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
						    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
						    // заливаем получившуюся фигуру
						    this._ctx.fill();

						    // рисуем центрированный текст
						    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
						    this._ctx.fillStyle = '#FFF';
						    this._ctx.textAlign = 'center';
						    this._ctx.textBaseline = 'bottom';
						    this._ctx.font = 'normal 30px Arial';
						    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

						    // Восстановление состояния канваса, которое было до вызова ctx.save
						    // и последующего изменения системы координат. Нужно для того, чтобы
						    // следующий кадр рисовался с привычной системой координат, где точка
						    // 0 0 находится в левом верхнем углу холста, в противном случае
						    // некорректно сработает даже очистка холста или нужно будет использовать
						    // сложные рассчеты для координат прямоугольника, который нужно очистить.
						    this._ctx.restore();
						  },

						  /**
						   * Включение режима перемещения. Запоминается текущее положение курсора,
						   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
						   * позволяющие перерисовывать изображение по мере перетаскивания.
						   * @param {number} x
						   * @param {number} y
						   * @private
						   */
						  _enterDragMode: function(x, y) {
						    this._cursorPosition = new Coordinate(x, y);
						    document.body.addEventListener('mousemove', this._onDrag);
						    document.body.addEventListener('mouseup', this._onDragEnd);
						  },

						  /**
						   * Выключение режима перемещения.
						   * @private
						   */
						  _exitDragMode: function() {
						    this._cursorPosition = null;
						    document.body.removeEventListener('mousemove', this._onDrag);
						    document.body.removeEventListener('mouseup', this._onDragEnd);
						  },

						  /**
						   * Перемещение изображения относительно кадра.
						   * @param {number} x
						   * @param {number} y
						   * @private
						   */
						  updatePosition: function(x, y) {
						    this.moveConstraint(
						        this._cursorPosition.x - x,
						        this._cursorPosition.y - y);
						    this._cursorPosition = new Coordinate(x, y);
						  },

						  /**
						   * @param {MouseEvent} evt
						   * @private
						   */
						  _onDragStart: function(evt) {
						    this._enterDragMode(evt.clientX, evt.clientY);
						  },

						  /**
						   * Обработчик окончания перетаскивания.
						   * @private
						   */
						  _onDragEnd: function() {
						    this._exitDragMode();
						  },

						  /**
						   * Обработчик события перетаскивания.
						   * @param {MouseEvent} evt
						   * @private
						   */
						  _onDrag: function(evt) {
						    this.updatePosition(evt.clientX, evt.clientY);
						  },

						  /**
						   * Добавление элемента в DOM.
						   * @param {Element} element
						   */
						  setElement: function(element) {
						    if (this._element === element) {
						      return;
						    }

						    this._element = element;
						    this._element.insertBefore(this._container, this._element.firstChild);
						    // Обработчики начала и конца перетаскивания.
						    this._container.addEventListener('mousedown', this._onDragStart);
						  },

						  /**
						   * Возвращает кадрирование элемента.
						   * @return {Square}
						   */
						  getConstraint: function() {
						    return this._resizeConstraint;
						  },

						  /**
						   * Смещает кадрирование на значение указанное в параметрах.
						   * @param {number} deltaX
						   * @param {number} deltaY
						   * @param {number} deltaSide
						   */
						  moveConstraint: function(deltaX, deltaY, deltaSide) {
						    this.setConstraint(
						        this._resizeConstraint.x + (deltaX || 0),
						        this._resizeConstraint.y + (deltaY || 0),
						        this._resizeConstraint.side + (deltaSide || 0));
						  },

						  /**
						   * @param {number} x
						   * @param {number} y
						   * @param {number} side
						   */
						  setConstraint: function(x, y, side) {
						    if (typeof x !== 'undefined') {
						      this._resizeConstraint.x = x;
						    }

						    if (typeof y !== 'undefined') {
						      this._resizeConstraint.y = y;
						    }

						    if (typeof side !== 'undefined') {
						      this._resizeConstraint.side = side;
						    }

						    requestAnimationFrame(function() {
						      this.redraw();
						      window.dispatchEvent(new CustomEvent('resizerchange'));
						    }.bind(this));
						  },

						  /**
						   * Удаление. Убирает контейнер из родительского элемента, убирает
						   * все обработчики событий и убирает ссылки.
						   */
						  remove: function() {
						    this._element.removeChild(this._container);

						    this._container.removeEventListener('mousedown', this._onDragStart);
						    this._container = null;
						  },

						  /**
						   * Экспорт обрезанного изображения как HTMLImageElement и исходником
						   * картинки в src в формате dataURL.
						   * @return {Image}
						   */
						  exportImage: function() {
						    // Создаем Image, с размерами, указанными при кадрировании.
						    var imageToExport = new Image();

						    // Создается новый canvas, по размерам совпадающий с кадрированным
						    // изображением, в него добавляется изображение взятое из канваса
						    // с измененными координатами и сохраняется в dataURL, с помощью метода
						    // toDataURL. Полученный исходный код, записывается в src у ранее
						    // созданного изображения.
						    var temporaryCanvas = document.createElement('canvas');
						    var temporaryCtx = temporaryCanvas.getContext('2d');
						    temporaryCanvas.width = this._resizeConstraint.side;
						    temporaryCanvas.height = this._resizeConstraint.side;
						    temporaryCtx.drawImage(this._image,
						        -this._resizeConstraint.x,
						        -this._resizeConstraint.y);
						    imageToExport.src = temporaryCanvas.toDataURL('image/png');

						    return imageToExport;
						  }
						};

						/**
						 * Вспомогательный тип, описывающий квадрат.
						 * @constructor
						 * @param {number} x
						 * @param {number} y
						 * @param {number} side
						 * @private
						 */
						var Square = function(x, y, side) {
						  this.x = x;
						  this.y = y;
						  this.side = side;
						};

						/**
						 * Вспомогательный тип, описывающий координату.
						 * @constructor
						 * @param {number} x
						 * @param {number} y
						 * @private
						 */
						var Coordinate = function(x, y) {
						  this.x = x;
						  this.y = y;
						};

						var zigzagRect = function(ctx, x0, y0, x1, y1) {
						  var xStart = x0;
						  var yStart = y0;

						  ctx.fillColor = 'black';
						  ctx.moveTo(x0, y0);
						  ctx.beginPath();
						  // длина зиг-заг линии
						  var line = 5;

						  var step = 0;

						  // слева направо - двигаемся по ox
						  while (x0 < x1) {
						    if (step % 2 === 0) {
						      x0 = x0 + line;
						      y0 = y0 + Math.abs(line);
						      ctx.lineTo(x0, y0);
						    } else {
						      x0 = x0 + line;
						      y0 = y0 - Math.abs(line);
						      ctx.lineTo(x0, y0);
						    }
						    step++;
						  }

						  // потом вниз  - двигаемся по oy
						  while (y0 < y1) {
						    if (step % 2 === 0) {
						      x0 = x0 + Math.abs(line);
						      y0 = y0 + line;
						      ctx.lineTo(x0, y0);
						    } else {
						      x0 = x0 - Math.abs(line);
						      y0 = y0 + line;
						      ctx.lineTo(x0, y0);
						    }
						    step++;
						  }

						  line = line * -1;
						  // налево
						  while (x0 > xStart) {
						    if (step % 2 === 0) {
						      x0 = x0 + line;
						      y0 = y0 + Math.abs(line);
						      ctx.lineTo(x0, y0);
						    } else {
						      x0 = x0 + line;
						      y0 = y0 - Math.abs(line);
						      ctx.lineTo(x0, y0);
						    }
						    step++;
						  }

						  // замыкаем вверх
						  while (y0 + line > yStart ) {
						    if (step % 2 === 0) {
						      x0 = x0 + Math.abs(line);
						      y0 = y0 + line;
						      ctx.lineTo(x0, y0);
						    } else {
						      x0 = x0 - Math.abs(line);
						      y0 = y0 + line;
						      ctx.lineTo(x0, y0);
						    }
						    step++;
						  }
						  ctx.stroke();
						};

						module.exports = Resizer;


					/***/ },
					/* 4 */
					/***/ function(module, exports, __webpack_require__) {

						'use strict';

						var Photo = __webpack_require__(5);
						var Gallery = __webpack_require__(8);
						var Video = __webpack_require__(10);

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
						    //  var filt = ;
						      setActiveFilter( localStorage.getItem('currentFilter') || 'popular' );
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
						    document.getElementById('filter-' + filterName).checked = true;
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

						})();


					/***/ },
					/* 5 */
					/***/ function(module, exports, __webpack_require__) {

						'use strict';

						var inherit = __webpack_require__(6);
						var PhotoBase = __webpack_require__(7);

						/** Класс, представляющий фотографию на странице.
						* @module Photo
						* @constructor
						* @extends {PhotoBase}
						*/
						function Photo() {
						  this.mediatype = 'img';
						}
						inherit(Photo, PhotoBase);

						/**
						* Подгрузка изображения и создание картинки из шаблона
						*/
						Photo.prototype.render = function() {
						  var template = document.getElementById('picture-template');
						  this.element = template.content.children[0].cloneNode(true);
						  this.element.querySelector('.picture-comments').textContent = this.getComments();
						  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
						  picImage.src = this.getSrc();

						  this.element.addEventListener('click', this._onClick);
						  return this.element;
						};

						/** @function updateLikes - обновление кол-ва лайков в галерее */
						Photo.prototype.updateLikes = function() {
						  this.element.querySelector('.picture-likes').textContent = this.getLikes();
						};

						Photo.prototype.onClick = null;

						Photo.prototype._onClick = function(evt) {
						  evt.preventDefault();
						  if ( !this.classList.contains('picture-load-failure') ) {
						    if (typeof this.onClick === 'function') {
						      this.onClick();
						    }
						  }
						};

						module.exports = Photo;


					/***/ },
					/* 6 */
					/***/ function(module, exports) {

						'use strict';
						/**
						* @module inherit - реализует наследование классов, копированием прототипа
						*                   через временный класс
						* @param {Object} потомок
						* @param {Object} родитель
						*/
						function inherit(Child, Parent) {
						  var TempConstructor = function() {};
						  TempConstructor.prototype = Parent.prototype;
						  Child.prototype = new TempConstructor();
						  Child.prototype.constructor = Child;
						}
						module.exports = inherit;


					/***/ },
					/* 7 */
					/***/ function(module, exports) {

						'use strict';

						/** Базовый класс для медиа-элементов
						* @module PhotoBase
						* @constructor
						*/
						function PhotoBase() {
						}

						/** @type {Object} данные получаемые по AJAX*/
						PhotoBase.prototype._data = null;

						/**
						* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
						* переключении - определяет играть ли видео или нет.
						*/
						PhotoBase.prototype.mediatype = null;

						/**
						* Сохраняет медиа-данные в объекте и прописывает медиатип
						*/
						PhotoBase.prototype.setData = function(data) {
						  this._data = data;
						  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
						    this.mediatype = 'img';
						  } else {
						    this.mediatype = 'video';
						  }
						  this._data.liked = data.liked ? true : false;
						};

						/** @return {Object} - геттер данных объекта */

						PhotoBase.prototype.getData = function() {
						  return this._data;
						};

						/**
						* Функции-геттеры, используемые в сортировках/фильтрации
						*/
						PhotoBase.prototype.getLikes = function() {
						  return parseInt(this.getData().likes, 10);
						};

						PhotoBase.prototype.getComments = function() {
						  return parseInt(this.getData().comments, 10);
						};

						PhotoBase.prototype.getDate = function() {
						  return new Date(this.getData().date);
						};

						PhotoBase.prototype.getSrc = function() {
						  return this.getData().url;
						};



						/** Like dispatcher :) */
						PhotoBase.prototype.setLikes = function(likes) {
						  this._data.likes = likes;
						};

						PhotoBase.prototype.like = function() {
						  this.setLikes( this.getLikes() + 1 );
						  this._data.liked = true;
						};

						PhotoBase.prototype.dislike = function() {
						  this.setLikes( this.getLikes() - 1 );
						  this._data.liked = false;
						};

						PhotoBase.prototype.liked = function() {
						  return this._data.liked;
						};

						module.exports = PhotoBase;


					/***/ },
					/* 8 */
					/***/ function(module, exports, __webpack_require__) {

						'use strict';

						var PhotoPreview = __webpack_require__(9);
						var preview = new PhotoPreview();
						var KEYCODE = {
						  'ESC': 27,
						  'LEFT': 37,
						  'RIGHT': 39
						};
						/** Класс, представляющий галерею.
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
						  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
						  currentIndex: null,

						  /**
						  * Показывает галерею и проставляет eventListeners
						  */
						  show: function() {
						    this.element.classList.remove('invisible');

						    // is this way of bind ok?
						    this._closeBtn.addEventListener('click', this._onCloseClick);
						    this._likeBtn.addEventListener('click', this._onLikeClick);
						    this._photo.addEventListener('click', this._onPhotoClick);
						    this._video.addEventListener('click', this._onVideoClick);
						    window.addEventListener('keydown', this._onDocumentKeyDown);
						  },

						  /**
						  * Прячет галерею и удаляет eventListeners
						  */
						  hide: function() {
						    this.element.classList.add('invisible');
						    this._photo.removeEventListener('click', this._onPhotoClick);
						    this._video.removeEventListener('click', this._onVideoClick);
						    this._closeBtn.removeEventListener('click', this._onCloseClick);
						    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
						    window.removeEventListener('keydown', this._onDocumentKeyDown);
						  },

						  /**
						  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
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

						  /**
						  * Обработчик кликов лайка в галерее
						  */
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

						  /**
						  * Управление проигрыванием видео.
						  */
						  _onVideoClick: function(evt) {
						    if (evt.target.tagName === 'VIDEO') {
						      if (this.paused) {
						        this.play();
						      } else {
						        this.pause();
						      }
						    }
						  },

						  /**
						  * Клавиатурные события: переключение объектов галереи, выход из галереи
						  */

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

						module.exports = Gallery;


					/***/ },
					/* 9 */
					/***/ function(module, exports, __webpack_require__) {

						'use strict';

						var inherit = __webpack_require__(6);
						var PhotoBase = __webpack_require__(7);

						/** Объект, используемый для показа фото/видео в галерее
						* @module PhotoPreview
						* @constructor
						* @extends {PhotoBase}
						*/
						function PhotoPreview() {
						}

						inherit(PhotoPreview, PhotoBase);

						/**
						* Отрисовывает лайк, в зависимости от данных в объкете
						* и показывает/прячет видео-блок, проверяя mediatype
						*/

						PhotoPreview.prototype.render = function(el, noauto) {
						  el.querySelector('.likes-count').textContent = this.getLikes();
						  el.querySelector('.comments-count').textContent = this.getComments();
						  if ( this.liked() ) {
						    el.querySelector('.likes-count').classList.add('likes-count-liked');
						  } else {
						    el.querySelector('.likes-count').classList.remove('likes-count-liked');
						  }
						  if (this.mediatype === 'img') {
						    el.querySelector('.gallery-overlay-video').style.display = 'none';
						    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
						    el.querySelector('.gallery-overlay-image').src = this.getSrc();
						  } else if (this.mediatype === 'video') {
						    el.querySelector('.gallery-overlay-image').style.display = 'none';
						    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
						    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
						    el.querySelector('.gallery-overlay-video').src = this.getSrc();
						  }
						};

						module.exports = PhotoPreview;


					/***/ },
					/* 10 */
					/***/ function(module, exports, __webpack_require__) {

						'use strict';

						var inherit = __webpack_require__(6);
						var Photo = __webpack_require__(5);

						/** Объект, представляющий видео-элемент в галерее
						* @constructor
						* @extends {Photo}
						*/
						function Video() {
						  this.mediatype = 'video';
						}
						inherit(Video, Photo);

						/**
						* Подгрузка данных и создание видео-элемента
						*/
						Video.prototype.render = function() {
						  var template = document.getElementById('picture-template');
						  this.element = template.content.children[0].cloneNode(true);
						  this.element.querySelector('.picture-comments').textContent = this.getComments();
						  this.element.querySelector('.picture-likes').textContent = this.getLikes();

						  var videoElement = document.createElement('video');
						  videoElement.width = 182;
						  videoElement.height = 182;
						  videoElement.src = this.getSrc();
						  this.element.replaceChild(videoElement, this.element.firstElementChild);

						  this.element.addEventListener('click', this._onClick);
						  return this.element;
						};


						Video.prototype.onClick = null;

						Video.prototype._onClick = function(evt) {
						  evt.preventDefault();
						  if (typeof this.onClick === 'function') {
						    this.onClick();
						  }
						};

						module.exports = Video;


					/***/ },
					/* 11 */
					/***/ function(module, exports) {

						/******/ (function(modules) { // webpackBootstrap
						/******/ 	// The module cache
						/******/ 	var installedModules = {};

						/******/ 	// The require function
						/******/ 	function __webpack_require__(moduleId) {

						/******/ 		// Check if module is in cache
						/******/ 		if(installedModules[moduleId])
						/******/ 			return installedModules[moduleId].exports;

						/******/ 		// Create a new module (and put it into the cache)
						/******/ 		var module = installedModules[moduleId] = {
						/******/ 			exports: {},
						/******/ 			id: moduleId,
						/******/ 			loaded: false
						/******/ 		};

						/******/ 		// Execute the module function
						/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

						/******/ 		// Flag the module as loaded
						/******/ 		module.loaded = true;

						/******/ 		// Return the exports of the module
						/******/ 		return module.exports;
						/******/ 	}


						/******/ 	// expose the modules object (__webpack_modules__)
						/******/ 	__webpack_require__.m = modules;

						/******/ 	// expose the module cache
						/******/ 	__webpack_require__.c = installedModules;

						/******/ 	// __webpack_public_path__
						/******/ 	__webpack_require__.p = "";

						/******/ 	// Load entry module and return exports
						/******/ 	return __webpack_require__(0);
						/******/ })
						/************************************************************************/
						/******/ ([
						/* 0 */
						/***/ function(module, exports, __webpack_require__) {

							__webpack_require__(1);
							__webpack_require__(1);
							module.exports = __webpack_require__(11);


						/***/ },
						/* 1 */
						/***/ function(module, exports, __webpack_require__) {

							'use strict';

							__webpack_require__(2);
							__webpack_require__(4);


						/***/ },
						/* 2 */
						/***/ function(module, exports, __webpack_require__) {

							/* global docCookies */
							'use strict';

							var Resizer = __webpack_require__(3);

							/**
							 * @fileoverview
							 * @author Igor Alexeenko (o0)
							 */

							(function() {
							  /** @enum {string} */
							  var FileType = {
							    'GIF': '',
							    'JPEG': '',
							    'PNG': '',
							    'SVG+XML': ''
							  };

							  /** @enum {number} */
							  var Action = {
							    ERROR: 0,
							    UPLOADING: 1,
							    CUSTOM: 2
							  };


							  /**
							   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
							   * из ключей FileType.
							   * @type {RegExp}
							   */
							  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

							  /**
							   * @type {Object.<string, string>}
							   */
							  var filterMap;

							  /**
							   * Объект, который занимается кадрированием изображения.
							   * @type {Resizer}
							   */
							  var currentResizer;

							  /**
							   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
							   * изображением.
							   */
							  function cleanupResizer() {
							    if (currentResizer) {
							      currentResizer.remove();
							      currentResizer = null;
							    }
							  }

							  /**
							   * Ставит одну из трех случайных картинок на фон формы загрузки.
							   */
							  function updateBackground() {
							    var images = [
							      'img/logo-background-1.jpg',
							      'img/logo-background-2.jpg',
							      'img/logo-background-3.jpg'
							    ];

							    var backgroundElement = document.querySelector('.upload');
							    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
							    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
							  }

							  /**
							   * Проверяет, валидны ли данные, в форме кадрирования.
							   * @return {boolean}
							   */
							  function resizeFormIsValid() {
							    var resizeXField = +document.getElementById('resize-x').value;
							    var resizeYField = +document.getElementById('resize-y').value;
							    var resizeSizeField = +document.getElementById('resize-size').value;
							    var resizeBtn = document.getElementById('resize-fwd');

							    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
							        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
							      resizeBtn.disabled = true;
							    } else {
							      resizeBtn.disabled = false;
							    }

							    return resizeXField < 0 || resizeYField < 0 ? false : true;
							  }

							  /**
							   * Форма загрузки изображения.
							   * @type {HTMLFormElement}
							   */
							  var uploadForm = document.forms['upload-select-image'];

							  /**
							   * Форма кадрирования изображения.
							   * @type {HTMLFormElement}
							   */
							  var resizeForm = document.forms['upload-resize'];

							  /**
							   * Форма добавления фильтра.
							   * @type {HTMLFormElement}
							   */
							  var filterForm = document.forms['upload-filter'];

							  /**
							   * @type {HTMLImageElement}
							   */
							  var filterImage = filterForm.querySelector('.filter-image-preview');

							  /**
							   * @type {HTMLElement}
							   */
							  var uploadMessage = document.querySelector('.upload-message');

							  /**
							   * @param {Action} action
							   * @param {string=} message
							   * @return {Element}
							   */
							  function showMessage(action, message) {
							    var isError = false;

							    switch (action) {
							      case Action.UPLOADING:
							        message = message || 'Кексограмим&hellip;';
							        break;

							      case Action.ERROR:
							        isError = true;
							        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
							        break;
							    }

							    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
							    uploadMessage.classList.remove('invisible');
							    uploadMessage.classList.toggle('upload-message-error', isError);
							    return uploadMessage;
							  }

							  function hideMessage() {
							    uploadMessage.classList.add('invisible');
							  }

							  function setFilter(filterName) {
							    if (!filterMap) {
							      // Ленивая инициализация. Объект не создается до тех пор, пока
							      // не понадобится прочитать его в первый раз, а после этого запоминается
							      // навсегда.
							      filterMap = {
							        'none': 'filter-none',
							        'chrome': 'filter-chrome',
							        'sepia': 'filter-sepia'
							      };
							    }

							    // подсвечиваем выбранный фильтр
							    document.getElementById('upload-filter-' + filterName).checked = true;

							    // Класс перезаписывается, а не обновляется через classList потому что нужно
							    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
							    // состояние или просто перезаписывать.
							    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

							    // сохраняем в кукис
							    var closestDoB = new Date('2015-07-12');
							    var dateToExpire = new Date(
							      Date.now() + (Date.now() - closestDoB)
							    ).toUTCString();

							    docCookies.setItem('filter', filterName, dateToExpire);
							  }

							  /**
							   * Функция синхронизации ресайзера и формы
							   */
							  function syncResizer() {
							    if (currentResizer) {
							      var constraints = currentResizer.getConstraint();
							      document.getElementById('resize-x').value = constraints.x;
							      document.getElementById('resize-y').value = constraints.y;
							      document.getElementById('resize-size').value = constraints.side;
							    }
							  }

							  /**
							   * Обработчик изменения изображения в форме загрузки. Если загруженный
							   * файл является изображением, считывается исходник картинки, создается
							   * Resizer с загруженной картинкой, добавляется в форму кадрирования
							   * и показывается форма кадрирования.
							   * @param {Event} evt
							   */
							  uploadForm.addEventListener('change', function(evt) {
							    var element = evt.target;
							    if (element.id === 'upload-file') {
							      // Проверка типа загружаемого файла, тип должен быть изображением
							      // одного из форматов: JPEG, PNG, GIF или SVG.
							      if (fileRegExp.test(element.files[0].type)) {
							        var fileReader = new FileReader();

							        showMessage(Action.UPLOADING);

							        fileReader.onload = function() {
							          cleanupResizer();

							          currentResizer = new Resizer(fileReader.result);
							          currentResizer.setElement(resizeForm);
							          uploadMessage.classList.add('invisible');

							          uploadForm.classList.add('invisible');
							          resizeForm.classList.remove('invisible');

							          hideMessage();
							          setTimeout(syncResizer, 10);
							        };

							        fileReader.readAsDataURL(element.files[0]);
							      } else {
							        // Показ сообщения об ошибке, если загружаемый файл, не является
							        // поддерживаемым изображением.
							        showMessage(Action.ERROR);
							      }
							    }
							  });

							  /**
							   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
							   * @param {Event} evt
							   */
							  resizeForm.addEventListener('change', function(evt) {
							    // вынес в отдельные переменные для лучшей читаемости
							    resizeFormIsValid();
							    // получаем текущие координаты ресайзера
							    var constraints = currentResizer.getConstraint();

							    var changedElement = evt.target;
							    var newVal = +changedElement.value;

							    // двигаем ресайзер в зависимости от того, какое поле поменялось
							    switch (changedElement.name) {
							      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
							        break;
							      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
							        break;
							      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
							        break;
							    }
							  });

							  /**
							   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
							   * и обновляет фон.
							   * @param {Event} evt
							   */
							  resizeForm.addEventListener('reset', function(evt) {
							    evt.preventDefault();

							    cleanupResizer();
							    updateBackground();

							    resizeForm.classList.add('invisible');
							    uploadForm.classList.remove('invisible');
							  });

							  /**
							   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
							   * кропнутое изображение в форму добавления фильтра и показывает ее.
							   * @param {Event} evt
							   */
							  resizeForm.addEventListener('submit', function(evt) {
							    evt.preventDefault();

							    if (resizeFormIsValid()) {
							      filterImage.src = currentResizer.exportImage().src;

							      resizeForm.classList.add('invisible');
							      filterForm.classList.remove('invisible');
							    }
							  });

							  /**
							   * Сброс формы фильтра. Показывает форму кадрирования.
							   * @param {Event} evt
							   */
							  filterForm.addEventListener('reset', function(evt) {
							    evt.preventDefault();

							    filterForm.classList.add('invisible');
							    resizeForm.classList.remove('invisible');
							  });

							  /**
							   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
							   * записав сохраненный фильтр в cookie.
							   * @param {Event} evt
							   */
							  filterForm.addEventListener('submit', function(evt) {
							    evt.preventDefault();

							    cleanupResizer();
							    updateBackground();

							    filterForm.classList.add('invisible');
							    uploadForm.classList.remove('invisible');
							  });

							  /**
							   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
							   * выбранному значению в форме.
							   */
							  filterForm.addEventListener('change', function() {
							    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
							      return item.checked;
							    })[0].value;
							    setFilter(selectedFilter);
							  });

							  cleanupResizer();
							  updateBackground();
							  // выставляем фильтр, если находим его в кукисах
							  if (docCookies.getItem('filter') === null) {
							    setFilter('none');
							  } else {
							    setFilter( docCookies.getItem('filter') );
							  }

							  window.addEventListener('resizerchange', syncResizer);


							})();


						/***/ },
						/* 3 */
						/***/ function(module, exports) {

							'use strict';

							/**
							 * @constructor
							 * @param {string} image
							 */
							var Resizer = function(image) {
							  // Изображение, с которым будет вестись работа.
							  this._image = new Image();
							  this._image.src = image;

							  // Холст.
							  this._container = document.createElement('canvas');
							  this._ctx = this._container.getContext('2d');

							  // Создаем холст только после загрузки изображения.
							  this._image.onload = function() {
							    // Размер холста равен размеру загруженного изображения. Это нужно
							    // для удобства работы с координатами.
							    this._container.width = this._image.naturalWidth;
							    this._container.height = this._image.naturalHeight;

							    /**
							     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
							     * стороны изображения.
							     * @const
							     * @type {number}
							     */
							    var INITIAL_SIDE_RATIO = 0.75;
							    // Размер меньшей стороны изображения.
							    var side = Math.min(
							        this._container.width * INITIAL_SIDE_RATIO,
							        this._container.height * INITIAL_SIDE_RATIO);

							    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
							    // от размера меньшей стороны.
							    this._resizeConstraint = new Square(
							        this._container.width / 2 - side / 2,
							        this._container.height / 2 - side / 2,
							        side);

							    // Отрисовка изначального состояния канваса.
							    this.redraw();
							  }.bind(this);

							  // Фиксирование контекста обработчиков.
							  this._onDragStart = this._onDragStart.bind(this);
							  this._onDragEnd = this._onDragEnd.bind(this);
							  this._onDrag = this._onDrag.bind(this);
							};

							Resizer.prototype = {
							  /**
							   * Родительский элемент канваса.
							   * @type {Element}
							   * @private
							   */
							  _element: null,

							  /**
							   * Положение курсора в момент перетаскивания. От положения курсора
							   * рассчитывается смещение на которое нужно переместить изображение
							   * за каждую итерацию перетаскивания.
							   * @type {Coordinate}
							   * @private
							   */
							  _cursorPosition: null,

							  /**
							   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
							   * от верхнего левого угла исходного изображения.
							   * @type {Square}
							   * @private
							   */
							  _resizeConstraint: null,

							  /**
							   * Отрисовка канваса.
							   */
							  redraw: function() {
							    // Очистка изображения.
							    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

							    // Параметры линии.
							    // NB! Такие параметры сохраняются на время всего процесса отрисовки
							    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
							    // чего-либо с другой обводкой.

							    // Толщина линии.
							    this._ctx.lineWidth = 6;
							    // Цвет обводки.
							    this._ctx.strokeStyle = '#ffe753';

							    // Сохранение состояния канваса.
							    // Подробней см. строку 132.
							    this._ctx.save();

							    // Установка начальной точки системы координат в центр холста.
							    this._ctx.translate(this._container.width / 2, this._container.height / 2);

							    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
							    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
							    // Отрисовка изображения на холсте. Параметры задают изображение, которое
							    // нужно отрисовать и координаты его верхнего левого угла.
							    // Координаты задаются от центра холста.

							    this._ctx.drawImage(this._image, displX, displY);

							    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
							    // взяты из начального кода отрисовки рамки
							    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
							    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
							    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
							    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

							    // ставим прозрачность 0.8
							    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
							    this._ctx.beginPath();

							    // рисуем зиг-заг прямоугольник
							    zigzagRect(this._ctx, x0, y0, x1, y1);

							    // после этого обводим рамку по внешнему периметру
							    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
							    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
							    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
							    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
							    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
							    // заливаем получившуюся фигуру
							    this._ctx.fill();

							    // рисуем центрированный текст
							    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
							    this._ctx.fillStyle = '#FFF';
							    this._ctx.textAlign = 'center';
							    this._ctx.textBaseline = 'bottom';
							    this._ctx.font = 'normal 30px Arial';
							    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

							    // Восстановление состояния канваса, которое было до вызова ctx.save
							    // и последующего изменения системы координат. Нужно для того, чтобы
							    // следующий кадр рисовался с привычной системой координат, где точка
							    // 0 0 находится в левом верхнем углу холста, в противном случае
							    // некорректно сработает даже очистка холста или нужно будет использовать
							    // сложные рассчеты для координат прямоугольника, который нужно очистить.
							    this._ctx.restore();
							  },

							  /**
							   * Включение режима перемещения. Запоминается текущее положение курсора,
							   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
							   * позволяющие перерисовывать изображение по мере перетаскивания.
							   * @param {number} x
							   * @param {number} y
							   * @private
							   */
							  _enterDragMode: function(x, y) {
							    this._cursorPosition = new Coordinate(x, y);
							    document.body.addEventListener('mousemove', this._onDrag);
							    document.body.addEventListener('mouseup', this._onDragEnd);
							  },

							  /**
							   * Выключение режима перемещения.
							   * @private
							   */
							  _exitDragMode: function() {
							    this._cursorPosition = null;
							    document.body.removeEventListener('mousemove', this._onDrag);
							    document.body.removeEventListener('mouseup', this._onDragEnd);
							  },

							  /**
							   * Перемещение изображения относительно кадра.
							   * @param {number} x
							   * @param {number} y
							   * @private
							   */
							  updatePosition: function(x, y) {
							    this.moveConstraint(
							        this._cursorPosition.x - x,
							        this._cursorPosition.y - y);
							    this._cursorPosition = new Coordinate(x, y);
							  },

							  /**
							   * @param {MouseEvent} evt
							   * @private
							   */
							  _onDragStart: function(evt) {
							    this._enterDragMode(evt.clientX, evt.clientY);
							  },

							  /**
							   * Обработчик окончания перетаскивания.
							   * @private
							   */
							  _onDragEnd: function() {
							    this._exitDragMode();
							  },

							  /**
							   * Обработчик события перетаскивания.
							   * @param {MouseEvent} evt
							   * @private
							   */
							  _onDrag: function(evt) {
							    this.updatePosition(evt.clientX, evt.clientY);
							  },

							  /**
							   * Добавление элемента в DOM.
							   * @param {Element} element
							   */
							  setElement: function(element) {
							    if (this._element === element) {
							      return;
							    }

							    this._element = element;
							    this._element.insertBefore(this._container, this._element.firstChild);
							    // Обработчики начала и конца перетаскивания.
							    this._container.addEventListener('mousedown', this._onDragStart);
							  },

							  /**
							   * Возвращает кадрирование элемента.
							   * @return {Square}
							   */
							  getConstraint: function() {
							    return this._resizeConstraint;
							  },

							  /**
							   * Смещает кадрирование на значение указанное в параметрах.
							   * @param {number} deltaX
							   * @param {number} deltaY
							   * @param {number} deltaSide
							   */
							  moveConstraint: function(deltaX, deltaY, deltaSide) {
							    this.setConstraint(
							        this._resizeConstraint.x + (deltaX || 0),
							        this._resizeConstraint.y + (deltaY || 0),
							        this._resizeConstraint.side + (deltaSide || 0));
							  },

							  /**
							   * @param {number} x
							   * @param {number} y
							   * @param {number} side
							   */
							  setConstraint: function(x, y, side) {
							    if (typeof x !== 'undefined') {
							      this._resizeConstraint.x = x;
							    }

							    if (typeof y !== 'undefined') {
							      this._resizeConstraint.y = y;
							    }

							    if (typeof side !== 'undefined') {
							      this._resizeConstraint.side = side;
							    }

							    requestAnimationFrame(function() {
							      this.redraw();
							      window.dispatchEvent(new CustomEvent('resizerchange'));
							    }.bind(this));
							  },

							  /**
							   * Удаление. Убирает контейнер из родительского элемента, убирает
							   * все обработчики событий и убирает ссылки.
							   */
							  remove: function() {
							    this._element.removeChild(this._container);

							    this._container.removeEventListener('mousedown', this._onDragStart);
							    this._container = null;
							  },

							  /**
							   * Экспорт обрезанного изображения как HTMLImageElement и исходником
							   * картинки в src в формате dataURL.
							   * @return {Image}
							   */
							  exportImage: function() {
							    // Создаем Image, с размерами, указанными при кадрировании.
							    var imageToExport = new Image();

							    // Создается новый canvas, по размерам совпадающий с кадрированным
							    // изображением, в него добавляется изображение взятое из канваса
							    // с измененными координатами и сохраняется в dataURL, с помощью метода
							    // toDataURL. Полученный исходный код, записывается в src у ранее
							    // созданного изображения.
							    var temporaryCanvas = document.createElement('canvas');
							    var temporaryCtx = temporaryCanvas.getContext('2d');
							    temporaryCanvas.width = this._resizeConstraint.side;
							    temporaryCanvas.height = this._resizeConstraint.side;
							    temporaryCtx.drawImage(this._image,
							        -this._resizeConstraint.x,
							        -this._resizeConstraint.y);
							    imageToExport.src = temporaryCanvas.toDataURL('image/png');

							    return imageToExport;
							  }
							};

							/**
							 * Вспомогательный тип, описывающий квадрат.
							 * @constructor
							 * @param {number} x
							 * @param {number} y
							 * @param {number} side
							 * @private
							 */
							var Square = function(x, y, side) {
							  this.x = x;
							  this.y = y;
							  this.side = side;
							};

							/**
							 * Вспомогательный тип, описывающий координату.
							 * @constructor
							 * @param {number} x
							 * @param {number} y
							 * @private
							 */
							var Coordinate = function(x, y) {
							  this.x = x;
							  this.y = y;
							};

							var zigzagRect = function(ctx, x0, y0, x1, y1) {
							  var xStart = x0;
							  var yStart = y0;

							  ctx.fillColor = 'black';
							  ctx.moveTo(x0, y0);
							  ctx.beginPath();
							  // длина зиг-заг линии
							  var line = 5;

							  var step = 0;

							  // слева направо - двигаемся по ox
							  while (x0 < x1) {
							    if (step % 2 === 0) {
							      x0 = x0 + line;
							      y0 = y0 + Math.abs(line);
							      ctx.lineTo(x0, y0);
							    } else {
							      x0 = x0 + line;
							      y0 = y0 - Math.abs(line);
							      ctx.lineTo(x0, y0);
							    }
							    step++;
							  }

							  // потом вниз  - двигаемся по oy
							  while (y0 < y1) {
							    if (step % 2 === 0) {
							      x0 = x0 + Math.abs(line);
							      y0 = y0 + line;
							      ctx.lineTo(x0, y0);
							    } else {
							      x0 = x0 - Math.abs(line);
							      y0 = y0 + line;
							      ctx.lineTo(x0, y0);
							    }
							    step++;
							  }

							  line = line * -1;
							  // налево
							  while (x0 > xStart) {
							    if (step % 2 === 0) {
							      x0 = x0 + line;
							      y0 = y0 + Math.abs(line);
							      ctx.lineTo(x0, y0);
							    } else {
							      x0 = x0 + line;
							      y0 = y0 - Math.abs(line);
							      ctx.lineTo(x0, y0);
							    }
							    step++;
							  }

							  // замыкаем вверх
							  while (y0 + line > yStart ) {
							    if (step % 2 === 0) {
							      x0 = x0 + Math.abs(line);
							      y0 = y0 + line;
							      ctx.lineTo(x0, y0);
							    } else {
							      x0 = x0 - Math.abs(line);
							      y0 = y0 + line;
							      ctx.lineTo(x0, y0);
							    }
							    step++;
							  }
							  ctx.stroke();
							};

							module.exports = Resizer;


						/***/ },
						/* 4 */
						/***/ function(module, exports, __webpack_require__) {

							'use strict';

							var Photo = __webpack_require__(5);
							var Gallery = __webpack_require__(8);
							var Video = __webpack_require__(10);

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

							  /** @type {string} выставленный фильтр из localStorage/фильтр по умолчанию */
							  ///var currentFilter =
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
							      var filt = localStorage.getItem('currentFilter') || 'popular';
							      setActiveFilter( filt );
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
							    document.getElementById('filter-' + filterName).checked = true;
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

							})();


						/***/ },
						/* 5 */
						/***/ function(module, exports, __webpack_require__) {

							'use strict';

							var inherit = __webpack_require__(6);
							var PhotoBase = __webpack_require__(7);

							/** Класс, представляющий фотографию на странице.
							* @module Photo
							* @constructor
							* @extends {PhotoBase}
							*/
							function Photo() {
							  this.mediatype = 'img';
							}
							inherit(Photo, PhotoBase);

							/**
							* Подгрузка изображения и создание картинки из шаблона
							*/
							Photo.prototype.render = function() {
							  var template = document.getElementById('picture-template');
							  this.element = template.content.children[0].cloneNode(true);
							  this.element.querySelector('.picture-comments').textContent = this.getComments();
							  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
							  picImage.src = this.getSrc();

							  this.element.addEventListener('click', this._onClick);
							  return this.element;
							};

							/** @function updateLikes - обновление кол-ва лайков в галерее */
							Photo.prototype.updateLikes = function() {
							  this.element.querySelector('.picture-likes').textContent = this.getLikes();
							};

							Photo.prototype.onClick = null;

							Photo.prototype._onClick = function(evt) {
							  evt.preventDefault();
							  if ( !this.classList.contains('picture-load-failure') ) {
							    if (typeof this.onClick === 'function') {
							      this.onClick();
							    }
							  }
							};

							module.exports = Photo;


						/***/ },
						/* 6 */
						/***/ function(module, exports) {

							'use strict';
							/**
							* @module inherit - реализует наследование классов, копированием прототипа
							*                   через временный класс
							* @param {Object} потомок
							* @param {Object} родитель
							*/
							function inherit(Child, Parent) {
							  var TempConstructor = function() {};
							  TempConstructor.prototype = Parent.prototype;
							  Child.prototype = new TempConstructor();
							  Child.prototype.constructor = Child;
							}
							module.exports = inherit;


						/***/ },
						/* 7 */
						/***/ function(module, exports) {

							'use strict';

							/** Базовый класс для медиа-элементов
							* @module PhotoBase
							* @constructor
							*/
							function PhotoBase() {
							}

							/** @type {Object} данные получаемые по AJAX*/
							PhotoBase.prototype._data = null;

							/**
							* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
							* переключении - определяет играть ли видео или нет.
							*/
							PhotoBase.prototype.mediatype = null;

							/**
							* Сохраняет медиа-данные в объекте и прописывает медиатип
							*/
							PhotoBase.prototype.setData = function(data) {
							  this._data = data;
							  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
							    this.mediatype = 'img';
							  } else {
							    this.mediatype = 'video';
							  }
							  this._data.liked = data.liked ? true : false;
							};

							/** @return {Object} - геттер данных объекта */

							PhotoBase.prototype.getData = function() {
							  return this._data;
							};

							/**
							* Функции-геттеры, используемые в сортировках/фильтрации
							*/
							PhotoBase.prototype.getLikes = function() {
							  return parseInt(this.getData().likes, 10);
							};

							PhotoBase.prototype.getComments = function() {
							  return parseInt(this.getData().comments, 10);
							};

							PhotoBase.prototype.getDate = function() {
							  return new Date(this.getData().date);
							};

							PhotoBase.prototype.getSrc = function() {
							  return this.getData().url;
							};



							/** Like dispatcher :) */
							PhotoBase.prototype.setLikes = function(likes) {
							  this._data.likes = likes;
							};

							PhotoBase.prototype.like = function() {
							  this.setLikes( this.getLikes() + 1 );
							  this._data.liked = true;
							};

							PhotoBase.prototype.dislike = function() {
							  this.setLikes( this.getLikes() - 1 );
							  this._data.liked = false;
							};

							PhotoBase.prototype.liked = function() {
							  return this._data.liked;
							};

							module.exports = PhotoBase;


						/***/ },
						/* 8 */
						/***/ function(module, exports, __webpack_require__) {

							'use strict';

							var PhotoPreview = __webpack_require__(9);
							var preview = new PhotoPreview();
							var KEYCODE = {
							  'ESC': 27,
							  'LEFT': 37,
							  'RIGHT': 39
							};
							/** Класс, представляющий галерею.
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
							  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
							  currentIndex: null,

							  /**
							  * Показывает галерею и проставляет eventListeners
							  */
							  show: function() {
							    this.element.classList.remove('invisible');

							    // is this way of bind ok?
							    this._closeBtn.addEventListener('click', this._onCloseClick);
							    this._likeBtn.addEventListener('click', this._onLikeClick);
							    this._photo.addEventListener('click', this._onPhotoClick);
							    this._video.addEventListener('click', this._onVideoClick);
							    window.addEventListener('keydown', this._onDocumentKeyDown);
							  },

							  /**
							  * Прячет галерею и удаляет eventListeners
							  */
							  hide: function() {
							    this.element.classList.add('invisible');
							    this._photo.removeEventListener('click', this._onPhotoClick);
							    this._video.removeEventListener('click', this._onVideoClick);
							    this._closeBtn.removeEventListener('click', this._onCloseClick);
							    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
							    window.removeEventListener('keydown', this._onDocumentKeyDown);
							  },

							  /**
							  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
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

							  /**
							  * Обработчик кликов лайка в галерее
							  */
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

							  /**
							  * Управление проигрыванием видео.
							  */
							  _onVideoClick: function(evt) {
							    if (evt.target.tagName === 'VIDEO') {
							      if (this.paused) {
							        this.play();
							      } else {
							        this.pause();
							      }
							    }
							  },

							  /**
							  * Клавиатурные события: переключение объектов галереи, выход из галереи
							  */

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

							module.exports = Gallery;


						/***/ },
						/* 9 */
						/***/ function(module, exports, __webpack_require__) {

							'use strict';

							var inherit = __webpack_require__(6);
							var PhotoBase = __webpack_require__(7);

							/** Объект, используемый для показа фото/видео в галерее
							* @module PhotoPreview
							* @constructor
							* @extends {PhotoBase}
							*/
							function PhotoPreview() {
							}

							inherit(PhotoPreview, PhotoBase);

							/**
							* Отрисовывает лайк, в зависимости от данных в объкете
							* и показывает/прячет видео-блок, проверяя mediatype
							*/

							PhotoPreview.prototype.render = function(el, noauto) {
							  el.querySelector('.likes-count').textContent = this.getLikes();
							  el.querySelector('.comments-count').textContent = this.getComments();
							  if ( this.liked() ) {
							    el.querySelector('.likes-count').classList.add('likes-count-liked');
							  } else {
							    el.querySelector('.likes-count').classList.remove('likes-count-liked');
							  }
							  if (this.mediatype === 'img') {
							    el.querySelector('.gallery-overlay-video').style.display = 'none';
							    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
							    el.querySelector('.gallery-overlay-image').src = this.getSrc();
							  } else if (this.mediatype === 'video') {
							    el.querySelector('.gallery-overlay-image').style.display = 'none';
							    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
							    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
							    el.querySelector('.gallery-overlay-video').src = this.getSrc();
							  }
							};

							module.exports = PhotoPreview;


						/***/ },
						/* 10 */
						/***/ function(module, exports, __webpack_require__) {

							'use strict';

							var inherit = __webpack_require__(6);
							var Photo = __webpack_require__(5);

							/** Объект, представляющий видео-элемент в галерее
							* @constructor
							* @extends {Photo}
							*/
							function Video() {
							  this.mediatype = 'video';
							}
							inherit(Video, Photo);

							/**
							* Подгрузка данных и создание видео-элемента
							*/
							Video.prototype.render = function() {
							  var template = document.getElementById('picture-template');
							  this.element = template.content.children[0].cloneNode(true);
							  this.element.querySelector('.picture-comments').textContent = this.getComments();
							  this.element.querySelector('.picture-likes').textContent = this.getLikes();

							  var videoElement = document.createElement('video');
							  videoElement.width = 182;
							  videoElement.height = 182;
							  videoElement.src = this.getSrc();
							  this.element.replaceChild(videoElement, this.element.firstElementChild);

							  this.element.addEventListener('click', this._onClick);
							  return this.element;
							};


							Video.prototype.onClick = null;

							Video.prototype._onClick = function(evt) {
							  evt.preventDefault();
							  if (typeof this.onClick === 'function') {
							    this.onClick();
							  }
							};

							module.exports = Video;


						/***/ },
						/* 11 */
						/***/ function(module, exports) {

							/******/ (function(modules) { // webpackBootstrap
							/******/ 	// The module cache
							/******/ 	var installedModules = {};

							/******/ 	// The require function
							/******/ 	function __webpack_require__(moduleId) {

							/******/ 		// Check if module is in cache
							/******/ 		if(installedModules[moduleId])
							/******/ 			return installedModules[moduleId].exports;

							/******/ 		// Create a new module (and put it into the cache)
							/******/ 		var module = installedModules[moduleId] = {
							/******/ 			exports: {},
							/******/ 			id: moduleId,
							/******/ 			loaded: false
							/******/ 		};

							/******/ 		// Execute the module function
							/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

							/******/ 		// Flag the module as loaded
							/******/ 		module.loaded = true;

							/******/ 		// Return the exports of the module
							/******/ 		return module.exports;
							/******/ 	}


							/******/ 	// expose the modules object (__webpack_modules__)
							/******/ 	__webpack_require__.m = modules;

							/******/ 	// expose the module cache
							/******/ 	__webpack_require__.c = installedModules;

							/******/ 	// __webpack_public_path__
							/******/ 	__webpack_require__.p = "";

							/******/ 	// Load entry module and return exports
							/******/ 	return __webpack_require__(0);
							/******/ })
							/************************************************************************/
							/******/ ([
							/* 0 */
							/***/ function(module, exports, __webpack_require__) {

								__webpack_require__(1);
								__webpack_require__(1);
								module.exports = __webpack_require__(11);


							/***/ },
							/* 1 */
							/***/ function(module, exports, __webpack_require__) {

								'use strict';

								__webpack_require__(2);
								__webpack_require__(4);


							/***/ },
							/* 2 */
							/***/ function(module, exports, __webpack_require__) {

								/* global docCookies */
								'use strict';

								var Resizer = __webpack_require__(3);

								/**
								 * @fileoverview
								 * @author Igor Alexeenko (o0)
								 */

								(function() {
								  /** @enum {string} */
								  var FileType = {
								    'GIF': '',
								    'JPEG': '',
								    'PNG': '',
								    'SVG+XML': ''
								  };

								  /** @enum {number} */
								  var Action = {
								    ERROR: 0,
								    UPLOADING: 1,
								    CUSTOM: 2
								  };


								  /**
								   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
								   * из ключей FileType.
								   * @type {RegExp}
								   */
								  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

								  /**
								   * @type {Object.<string, string>}
								   */
								  var filterMap;

								  /**
								   * Объект, который занимается кадрированием изображения.
								   * @type {Resizer}
								   */
								  var currentResizer;

								  /**
								   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
								   * изображением.
								   */
								  function cleanupResizer() {
								    if (currentResizer) {
								      currentResizer.remove();
								      currentResizer = null;
								    }
								  }

								  /**
								   * Ставит одну из трех случайных картинок на фон формы загрузки.
								   */
								  function updateBackground() {
								    var images = [
								      'img/logo-background-1.jpg',
								      'img/logo-background-2.jpg',
								      'img/logo-background-3.jpg'
								    ];

								    var backgroundElement = document.querySelector('.upload');
								    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
								    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
								  }

								  /**
								   * Проверяет, валидны ли данные, в форме кадрирования.
								   * @return {boolean}
								   */
								  function resizeFormIsValid() {
								    var resizeXField = +document.getElementById('resize-x').value;
								    var resizeYField = +document.getElementById('resize-y').value;
								    var resizeSizeField = +document.getElementById('resize-size').value;
								    var resizeBtn = document.getElementById('resize-fwd');

								    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
								        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
								      resizeBtn.disabled = true;
								    } else {
								      resizeBtn.disabled = false;
								    }

								    return resizeXField < 0 || resizeYField < 0 ? false : true;
								  }

								  /**
								   * Форма загрузки изображения.
								   * @type {HTMLFormElement}
								   */
								  var uploadForm = document.forms['upload-select-image'];

								  /**
								   * Форма кадрирования изображения.
								   * @type {HTMLFormElement}
								   */
								  var resizeForm = document.forms['upload-resize'];

								  /**
								   * Форма добавления фильтра.
								   * @type {HTMLFormElement}
								   */
								  var filterForm = document.forms['upload-filter'];

								  /**
								   * @type {HTMLImageElement}
								   */
								  var filterImage = filterForm.querySelector('.filter-image-preview');

								  /**
								   * @type {HTMLElement}
								   */
								  var uploadMessage = document.querySelector('.upload-message');

								  /**
								   * @param {Action} action
								   * @param {string=} message
								   * @return {Element}
								   */
								  function showMessage(action, message) {
								    var isError = false;

								    switch (action) {
								      case Action.UPLOADING:
								        message = message || 'Кексограмим&hellip;';
								        break;

								      case Action.ERROR:
								        isError = true;
								        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
								        break;
								    }

								    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
								    uploadMessage.classList.remove('invisible');
								    uploadMessage.classList.toggle('upload-message-error', isError);
								    return uploadMessage;
								  }

								  function hideMessage() {
								    uploadMessage.classList.add('invisible');
								  }

								  function setFilter(filterName) {
								    if (!filterMap) {
								      // Ленивая инициализация. Объект не создается до тех пор, пока
								      // не понадобится прочитать его в первый раз, а после этого запоминается
								      // навсегда.
								      filterMap = {
								        'none': 'filter-none',
								        'chrome': 'filter-chrome',
								        'sepia': 'filter-sepia'
								      };
								    }

								    // подсвечиваем выбранный фильтр
								    document.getElementById('upload-filter-' + filterName).checked = true;

								    // Класс перезаписывается, а не обновляется через classList потому что нужно
								    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
								    // состояние или просто перезаписывать.
								    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

								    // сохраняем в кукис
								    var closestDoB = new Date('2015-07-12');
								    var dateToExpire = new Date(
								      Date.now() + (Date.now() - closestDoB)
								    ).toUTCString();

								    docCookies.setItem('filter', filterName, dateToExpire);
								  }

								  /**
								   * Функция синхронизации ресайзера и формы
								   */
								  function syncResizer() {
								    if (currentResizer) {
								      var constraints = currentResizer.getConstraint();
								      document.getElementById('resize-x').value = constraints.x;
								      document.getElementById('resize-y').value = constraints.y;
								      document.getElementById('resize-size').value = constraints.side;
								    }
								  }

								  /**
								   * Обработчик изменения изображения в форме загрузки. Если загруженный
								   * файл является изображением, считывается исходник картинки, создается
								   * Resizer с загруженной картинкой, добавляется в форму кадрирования
								   * и показывается форма кадрирования.
								   * @param {Event} evt
								   */
								  uploadForm.addEventListener('change', function(evt) {
								    var element = evt.target;
								    if (element.id === 'upload-file') {
								      // Проверка типа загружаемого файла, тип должен быть изображением
								      // одного из форматов: JPEG, PNG, GIF или SVG.
								      if (fileRegExp.test(element.files[0].type)) {
								        var fileReader = new FileReader();

								        showMessage(Action.UPLOADING);

								        fileReader.onload = function() {
								          cleanupResizer();

								          currentResizer = new Resizer(fileReader.result);
								          currentResizer.setElement(resizeForm);
								          uploadMessage.classList.add('invisible');

								          uploadForm.classList.add('invisible');
								          resizeForm.classList.remove('invisible');

								          hideMessage();
								          setTimeout(syncResizer, 10);
								        };

								        fileReader.readAsDataURL(element.files[0]);
								      } else {
								        // Показ сообщения об ошибке, если загружаемый файл, не является
								        // поддерживаемым изображением.
								        showMessage(Action.ERROR);
								      }
								    }
								  });

								  /**
								   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
								   * @param {Event} evt
								   */
								  resizeForm.addEventListener('change', function(evt) {
								    // вынес в отдельные переменные для лучшей читаемости
								    resizeFormIsValid();
								    // получаем текущие координаты ресайзера
								    var constraints = currentResizer.getConstraint();

								    var changedElement = evt.target;
								    var newVal = +changedElement.value;

								    // двигаем ресайзер в зависимости от того, какое поле поменялось
								    switch (changedElement.name) {
								      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
								        break;
								      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
								        break;
								      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
								        break;
								    }
								  });

								  /**
								   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
								   * и обновляет фон.
								   * @param {Event} evt
								   */
								  resizeForm.addEventListener('reset', function(evt) {
								    evt.preventDefault();

								    cleanupResizer();
								    updateBackground();

								    resizeForm.classList.add('invisible');
								    uploadForm.classList.remove('invisible');
								  });

								  /**
								   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
								   * кропнутое изображение в форму добавления фильтра и показывает ее.
								   * @param {Event} evt
								   */
								  resizeForm.addEventListener('submit', function(evt) {
								    evt.preventDefault();

								    if (resizeFormIsValid()) {
								      filterImage.src = currentResizer.exportImage().src;

								      resizeForm.classList.add('invisible');
								      filterForm.classList.remove('invisible');
								    }
								  });

								  /**
								   * Сброс формы фильтра. Показывает форму кадрирования.
								   * @param {Event} evt
								   */
								  filterForm.addEventListener('reset', function(evt) {
								    evt.preventDefault();

								    filterForm.classList.add('invisible');
								    resizeForm.classList.remove('invisible');
								  });

								  /**
								   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
								   * записав сохраненный фильтр в cookie.
								   * @param {Event} evt
								   */
								  filterForm.addEventListener('submit', function(evt) {
								    evt.preventDefault();

								    cleanupResizer();
								    updateBackground();

								    filterForm.classList.add('invisible');
								    uploadForm.classList.remove('invisible');
								  });

								  /**
								   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
								   * выбранному значению в форме.
								   */
								  filterForm.addEventListener('change', function() {
								    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
								      return item.checked;
								    })[0].value;
								    setFilter(selectedFilter);
								  });

								  cleanupResizer();
								  updateBackground();
								  // выставляем фильтр, если находим его в кукисах
								  if (docCookies.getItem('filter') === null) {
								    setFilter('none');
								  } else {
								    setFilter( docCookies.getItem('filter') );
								  }

								  window.addEventListener('resizerchange', syncResizer);


								})();


							/***/ },
							/* 3 */
							/***/ function(module, exports) {

								'use strict';

								/**
								 * @constructor
								 * @param {string} image
								 */
								var Resizer = function(image) {
								  // Изображение, с которым будет вестись работа.
								  this._image = new Image();
								  this._image.src = image;

								  // Холст.
								  this._container = document.createElement('canvas');
								  this._ctx = this._container.getContext('2d');

								  // Создаем холст только после загрузки изображения.
								  this._image.onload = function() {
								    // Размер холста равен размеру загруженного изображения. Это нужно
								    // для удобства работы с координатами.
								    this._container.width = this._image.naturalWidth;
								    this._container.height = this._image.naturalHeight;

								    /**
								     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
								     * стороны изображения.
								     * @const
								     * @type {number}
								     */
								    var INITIAL_SIDE_RATIO = 0.75;
								    // Размер меньшей стороны изображения.
								    var side = Math.min(
								        this._container.width * INITIAL_SIDE_RATIO,
								        this._container.height * INITIAL_SIDE_RATIO);

								    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
								    // от размера меньшей стороны.
								    this._resizeConstraint = new Square(
								        this._container.width / 2 - side / 2,
								        this._container.height / 2 - side / 2,
								        side);

								    // Отрисовка изначального состояния канваса.
								    this.redraw();
								  }.bind(this);

								  // Фиксирование контекста обработчиков.
								  this._onDragStart = this._onDragStart.bind(this);
								  this._onDragEnd = this._onDragEnd.bind(this);
								  this._onDrag = this._onDrag.bind(this);
								};

								Resizer.prototype = {
								  /**
								   * Родительский элемент канваса.
								   * @type {Element}
								   * @private
								   */
								  _element: null,

								  /**
								   * Положение курсора в момент перетаскивания. От положения курсора
								   * рассчитывается смещение на которое нужно переместить изображение
								   * за каждую итерацию перетаскивания.
								   * @type {Coordinate}
								   * @private
								   */
								  _cursorPosition: null,

								  /**
								   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
								   * от верхнего левого угла исходного изображения.
								   * @type {Square}
								   * @private
								   */
								  _resizeConstraint: null,

								  /**
								   * Отрисовка канваса.
								   */
								  redraw: function() {
								    // Очистка изображения.
								    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

								    // Параметры линии.
								    // NB! Такие параметры сохраняются на время всего процесса отрисовки
								    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
								    // чего-либо с другой обводкой.

								    // Толщина линии.
								    this._ctx.lineWidth = 6;
								    // Цвет обводки.
								    this._ctx.strokeStyle = '#ffe753';

								    // Сохранение состояния канваса.
								    // Подробней см. строку 132.
								    this._ctx.save();

								    // Установка начальной точки системы координат в центр холста.
								    this._ctx.translate(this._container.width / 2, this._container.height / 2);

								    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
								    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
								    // Отрисовка изображения на холсте. Параметры задают изображение, которое
								    // нужно отрисовать и координаты его верхнего левого угла.
								    // Координаты задаются от центра холста.

								    this._ctx.drawImage(this._image, displX, displY);

								    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
								    // взяты из начального кода отрисовки рамки
								    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
								    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
								    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
								    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

								    // ставим прозрачность 0.8
								    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
								    this._ctx.beginPath();

								    // рисуем зиг-заг прямоугольник
								    zigzagRect(this._ctx, x0, y0, x1, y1);

								    // после этого обводим рамку по внешнему периметру
								    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
								    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
								    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
								    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
								    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
								    // заливаем получившуюся фигуру
								    this._ctx.fill();

								    // рисуем центрированный текст
								    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
								    this._ctx.fillStyle = '#FFF';
								    this._ctx.textAlign = 'center';
								    this._ctx.textBaseline = 'bottom';
								    this._ctx.font = 'normal 30px Arial';
								    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

								    // Восстановление состояния канваса, которое было до вызова ctx.save
								    // и последующего изменения системы координат. Нужно для того, чтобы
								    // следующий кадр рисовался с привычной системой координат, где точка
								    // 0 0 находится в левом верхнем углу холста, в противном случае
								    // некорректно сработает даже очистка холста или нужно будет использовать
								    // сложные рассчеты для координат прямоугольника, который нужно очистить.
								    this._ctx.restore();
								  },

								  /**
								   * Включение режима перемещения. Запоминается текущее положение курсора,
								   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
								   * позволяющие перерисовывать изображение по мере перетаскивания.
								   * @param {number} x
								   * @param {number} y
								   * @private
								   */
								  _enterDragMode: function(x, y) {
								    this._cursorPosition = new Coordinate(x, y);
								    document.body.addEventListener('mousemove', this._onDrag);
								    document.body.addEventListener('mouseup', this._onDragEnd);
								  },

								  /**
								   * Выключение режима перемещения.
								   * @private
								   */
								  _exitDragMode: function() {
								    this._cursorPosition = null;
								    document.body.removeEventListener('mousemove', this._onDrag);
								    document.body.removeEventListener('mouseup', this._onDragEnd);
								  },

								  /**
								   * Перемещение изображения относительно кадра.
								   * @param {number} x
								   * @param {number} y
								   * @private
								   */
								  updatePosition: function(x, y) {
								    this.moveConstraint(
								        this._cursorPosition.x - x,
								        this._cursorPosition.y - y);
								    this._cursorPosition = new Coordinate(x, y);
								  },

								  /**
								   * @param {MouseEvent} evt
								   * @private
								   */
								  _onDragStart: function(evt) {
								    this._enterDragMode(evt.clientX, evt.clientY);
								  },

								  /**
								   * Обработчик окончания перетаскивания.
								   * @private
								   */
								  _onDragEnd: function() {
								    this._exitDragMode();
								  },

								  /**
								   * Обработчик события перетаскивания.
								   * @param {MouseEvent} evt
								   * @private
								   */
								  _onDrag: function(evt) {
								    this.updatePosition(evt.clientX, evt.clientY);
								  },

								  /**
								   * Добавление элемента в DOM.
								   * @param {Element} element
								   */
								  setElement: function(element) {
								    if (this._element === element) {
								      return;
								    }

								    this._element = element;
								    this._element.insertBefore(this._container, this._element.firstChild);
								    // Обработчики начала и конца перетаскивания.
								    this._container.addEventListener('mousedown', this._onDragStart);
								  },

								  /**
								   * Возвращает кадрирование элемента.
								   * @return {Square}
								   */
								  getConstraint: function() {
								    return this._resizeConstraint;
								  },

								  /**
								   * Смещает кадрирование на значение указанное в параметрах.
								   * @param {number} deltaX
								   * @param {number} deltaY
								   * @param {number} deltaSide
								   */
								  moveConstraint: function(deltaX, deltaY, deltaSide) {
								    this.setConstraint(
								        this._resizeConstraint.x + (deltaX || 0),
								        this._resizeConstraint.y + (deltaY || 0),
								        this._resizeConstraint.side + (deltaSide || 0));
								  },

								  /**
								   * @param {number} x
								   * @param {number} y
								   * @param {number} side
								   */
								  setConstraint: function(x, y, side) {
								    if (typeof x !== 'undefined') {
								      this._resizeConstraint.x = x;
								    }

								    if (typeof y !== 'undefined') {
								      this._resizeConstraint.y = y;
								    }

								    if (typeof side !== 'undefined') {
								      this._resizeConstraint.side = side;
								    }

								    requestAnimationFrame(function() {
								      this.redraw();
								      window.dispatchEvent(new CustomEvent('resizerchange'));
								    }.bind(this));
								  },

								  /**
								   * Удаление. Убирает контейнер из родительского элемента, убирает
								   * все обработчики событий и убирает ссылки.
								   */
								  remove: function() {
								    this._element.removeChild(this._container);

								    this._container.removeEventListener('mousedown', this._onDragStart);
								    this._container = null;
								  },

								  /**
								   * Экспорт обрезанного изображения как HTMLImageElement и исходником
								   * картинки в src в формате dataURL.
								   * @return {Image}
								   */
								  exportImage: function() {
								    // Создаем Image, с размерами, указанными при кадрировании.
								    var imageToExport = new Image();

								    // Создается новый canvas, по размерам совпадающий с кадрированным
								    // изображением, в него добавляется изображение взятое из канваса
								    // с измененными координатами и сохраняется в dataURL, с помощью метода
								    // toDataURL. Полученный исходный код, записывается в src у ранее
								    // созданного изображения.
								    var temporaryCanvas = document.createElement('canvas');
								    var temporaryCtx = temporaryCanvas.getContext('2d');
								    temporaryCanvas.width = this._resizeConstraint.side;
								    temporaryCanvas.height = this._resizeConstraint.side;
								    temporaryCtx.drawImage(this._image,
								        -this._resizeConstraint.x,
								        -this._resizeConstraint.y);
								    imageToExport.src = temporaryCanvas.toDataURL('image/png');

								    return imageToExport;
								  }
								};

								/**
								 * Вспомогательный тип, описывающий квадрат.
								 * @constructor
								 * @param {number} x
								 * @param {number} y
								 * @param {number} side
								 * @private
								 */
								var Square = function(x, y, side) {
								  this.x = x;
								  this.y = y;
								  this.side = side;
								};

								/**
								 * Вспомогательный тип, описывающий координату.
								 * @constructor
								 * @param {number} x
								 * @param {number} y
								 * @private
								 */
								var Coordinate = function(x, y) {
								  this.x = x;
								  this.y = y;
								};

								var zigzagRect = function(ctx, x0, y0, x1, y1) {
								  var xStart = x0;
								  var yStart = y0;

								  ctx.fillColor = 'black';
								  ctx.moveTo(x0, y0);
								  ctx.beginPath();
								  // длина зиг-заг линии
								  var line = 5;

								  var step = 0;

								  // слева направо - двигаемся по ox
								  while (x0 < x1) {
								    if (step % 2 === 0) {
								      x0 = x0 + line;
								      y0 = y0 + Math.abs(line);
								      ctx.lineTo(x0, y0);
								    } else {
								      x0 = x0 + line;
								      y0 = y0 - Math.abs(line);
								      ctx.lineTo(x0, y0);
								    }
								    step++;
								  }

								  // потом вниз  - двигаемся по oy
								  while (y0 < y1) {
								    if (step % 2 === 0) {
								      x0 = x0 + Math.abs(line);
								      y0 = y0 + line;
								      ctx.lineTo(x0, y0);
								    } else {
								      x0 = x0 - Math.abs(line);
								      y0 = y0 + line;
								      ctx.lineTo(x0, y0);
								    }
								    step++;
								  }

								  line = line * -1;
								  // налево
								  while (x0 > xStart) {
								    if (step % 2 === 0) {
								      x0 = x0 + line;
								      y0 = y0 + Math.abs(line);
								      ctx.lineTo(x0, y0);
								    } else {
								      x0 = x0 + line;
								      y0 = y0 - Math.abs(line);
								      ctx.lineTo(x0, y0);
								    }
								    step++;
								  }

								  // замыкаем вверх
								  while (y0 + line > yStart ) {
								    if (step % 2 === 0) {
								      x0 = x0 + Math.abs(line);
								      y0 = y0 + line;
								      ctx.lineTo(x0, y0);
								    } else {
								      x0 = x0 - Math.abs(line);
								      y0 = y0 + line;
								      ctx.lineTo(x0, y0);
								    }
								    step++;
								  }
								  ctx.stroke();
								};

								module.exports = Resizer;


							/***/ },
							/* 4 */
							/***/ function(module, exports, __webpack_require__) {

								'use strict';

								var Photo = __webpack_require__(5);
								var Gallery = __webpack_require__(8);
								var Video = __webpack_require__(10);

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

								  /** @type {string} выставленный фильтр из localStorage/фильтр по умолчанию */
								  ///var currentFilter =
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
								      var filt = localStorage.getItem('currentFilter') || 'popular';
								      setActiveFilter( filt );
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
								  * @param {HTMLElement|string} filter - нажатая кнопка фильтра, либо строка
								  *                                      с именем фильтра
								  */

								  function setActiveFilter(filter) {
								    var filterName = typeof filter === 'object' ? filter.value : filter;
								    console.log(filterName);
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
								    document.getElementById('filter' + filterName).checked = true;
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

								})();


							/***/ },
							/* 5 */
							/***/ function(module, exports, __webpack_require__) {

								'use strict';

								var inherit = __webpack_require__(6);
								var PhotoBase = __webpack_require__(7);

								/** Класс, представляющий фотографию на странице.
								* @module Photo
								* @constructor
								* @extends {PhotoBase}
								*/
								function Photo() {
								  this.mediatype = 'img';
								}
								inherit(Photo, PhotoBase);

								/**
								* Подгрузка изображения и создание картинки из шаблона
								*/
								Photo.prototype.render = function() {
								  var template = document.getElementById('picture-template');
								  this.element = template.content.children[0].cloneNode(true);
								  this.element.querySelector('.picture-comments').textContent = this.getComments();
								  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
								  picImage.src = this.getSrc();

								  this.element.addEventListener('click', this._onClick);
								  return this.element;
								};

								/** @function updateLikes - обновление кол-ва лайков в галерее */
								Photo.prototype.updateLikes = function() {
								  this.element.querySelector('.picture-likes').textContent = this.getLikes();
								};

								Photo.prototype.onClick = null;

								Photo.prototype._onClick = function(evt) {
								  evt.preventDefault();
								  if ( !this.classList.contains('picture-load-failure') ) {
								    if (typeof this.onClick === 'function') {
								      this.onClick();
								    }
								  }
								};

								module.exports = Photo;


							/***/ },
							/* 6 */
							/***/ function(module, exports) {

								'use strict';
								/**
								* @module inherit - реализует наследование классов, копированием прототипа
								*                   через временный класс
								* @param {Object} потомок
								* @param {Object} родитель
								*/
								function inherit(Child, Parent) {
								  var TempConstructor = function() {};
								  TempConstructor.prototype = Parent.prototype;
								  Child.prototype = new TempConstructor();
								  Child.prototype.constructor = Child;
								}
								module.exports = inherit;


							/***/ },
							/* 7 */
							/***/ function(module, exports) {

								'use strict';

								/** Базовый класс для медиа-элементов
								* @module PhotoBase
								* @constructor
								*/
								function PhotoBase() {
								}

								/** @type {Object} данные получаемые по AJAX*/
								PhotoBase.prototype._data = null;

								/**
								* @type {string.'video'|'photo'} тип медиа-объекта. Используется в галерее при
								* переключении - определяет играть ли видео или нет.
								*/
								PhotoBase.prototype.mediatype = null;

								/**
								* Сохраняет медиа-данные в объекте и прописывает медиатип
								*/
								PhotoBase.prototype.setData = function(data) {
								  this._data = data;
								  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
								    this.mediatype = 'img';
								  } else {
								    this.mediatype = 'video';
								  }
								  this._data.liked = data.liked ? true : false;
								};

								/** @return {Object} - геттер данных объекта */

								PhotoBase.prototype.getData = function() {
								  return this._data;
								};

								/**
								* Функции-геттеры, используемые в сортировках/фильтрации
								*/
								PhotoBase.prototype.getLikes = function() {
								  return parseInt(this.getData().likes, 10);
								};

								PhotoBase.prototype.getComments = function() {
								  return parseInt(this.getData().comments, 10);
								};

								PhotoBase.prototype.getDate = function() {
								  return new Date(this.getData().date);
								};

								PhotoBase.prototype.getSrc = function() {
								  return this.getData().url;
								};



								/** Like dispatcher :) */
								PhotoBase.prototype.setLikes = function(likes) {
								  this._data.likes = likes;
								};

								PhotoBase.prototype.like = function() {
								  this.setLikes( this.getLikes() + 1 );
								  this._data.liked = true;
								};

								PhotoBase.prototype.dislike = function() {
								  this.setLikes( this.getLikes() - 1 );
								  this._data.liked = false;
								};

								PhotoBase.prototype.liked = function() {
								  return this._data.liked;
								};

								module.exports = PhotoBase;


							/***/ },
							/* 8 */
							/***/ function(module, exports, __webpack_require__) {

								'use strict';

								var PhotoPreview = __webpack_require__(9);
								var preview = new PhotoPreview();
								var KEYCODE = {
								  'ESC': 27,
								  'LEFT': 37,
								  'RIGHT': 39
								};
								/** Класс, представляющий галерею.
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
								  /** @type {integer=} - индекс объекта PhotoBase в отрендеренном массиве */
								  currentIndex: null,

								  /**
								  * Показывает галерею и проставляет eventListeners
								  */
								  show: function() {
								    this.element.classList.remove('invisible');

								    // is this way of bind ok?
								    this._closeBtn.addEventListener('click', this._onCloseClick);
								    this._likeBtn.addEventListener('click', this._onLikeClick);
								    this._photo.addEventListener('click', this._onPhotoClick);
								    this._video.addEventListener('click', this._onVideoClick);
								    window.addEventListener('keydown', this._onDocumentKeyDown);
								  },

								  /**
								  * Прячет галерею и удаляет eventListeners
								  */
								  hide: function() {
								    this.element.classList.add('invisible');
								    this._photo.removeEventListener('click', this._onPhotoClick);
								    this._video.removeEventListener('click', this._onVideoClick);
								    this._closeBtn.removeEventListener('click', this._onCloseClick);
								    this._likeBtn.removeEventListener( 'click', this._onLikeClick );
								    window.removeEventListener('keydown', this._onDocumentKeyDown);
								  },

								  /**
								  * Сохраняет массив с отрендеренными фотографиями в объекте (this.data)
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

								  /**
								  * Обработчик кликов лайка в галерее
								  */
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

								  /**
								  * Управление проигрыванием видео.
								  */
								  _onVideoClick: function(evt) {
								    if (evt.target.tagName === 'VIDEO') {
								      if (this.paused) {
								        this.play();
								      } else {
								        this.pause();
								      }
								    }
								  },

								  /**
								  * Клавиатурные события: переключение объектов галереи, выход из галереи
								  */

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

								module.exports = Gallery;


							/***/ },
							/* 9 */
							/***/ function(module, exports, __webpack_require__) {

								'use strict';

								var inherit = __webpack_require__(6);
								var PhotoBase = __webpack_require__(7);

								/** Объект, используемый для показа фото/видео в галерее
								* @module PhotoPreview
								* @constructor
								* @extends {PhotoBase}
								*/
								function PhotoPreview() {
								}

								inherit(PhotoPreview, PhotoBase);

								/**
								* Отрисовывает лайк, в зависимости от данных в объкете
								* и показывает/прячет видео-блок, проверяя mediatype
								*/

								PhotoPreview.prototype.render = function(el, noauto) {
								  el.querySelector('.likes-count').textContent = this.getLikes();
								  el.querySelector('.comments-count').textContent = this.getComments();
								  if ( this.liked() ) {
								    el.querySelector('.likes-count').classList.add('likes-count-liked');
								  } else {
								    el.querySelector('.likes-count').classList.remove('likes-count-liked');
								  }
								  if (this.mediatype === 'img') {
								    el.querySelector('.gallery-overlay-video').style.display = 'none';
								    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
								    el.querySelector('.gallery-overlay-image').src = this.getSrc();
								  } else if (this.mediatype === 'video') {
								    el.querySelector('.gallery-overlay-image').style.display = 'none';
								    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
								    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
								    el.querySelector('.gallery-overlay-video').src = this.getSrc();
								  }
								};

								module.exports = PhotoPreview;


							/***/ },
							/* 10 */
							/***/ function(module, exports, __webpack_require__) {

								'use strict';

								var inherit = __webpack_require__(6);
								var Photo = __webpack_require__(5);

								/** Объект, представляющий видео-элемент в галерее
								* @constructor
								* @extends {Photo}
								*/
								function Video() {
								  this.mediatype = 'video';
								}
								inherit(Video, Photo);

								/**
								* Подгрузка данных и создание видео-элемента
								*/
								Video.prototype.render = function() {
								  var template = document.getElementById('picture-template');
								  this.element = template.content.children[0].cloneNode(true);
								  this.element.querySelector('.picture-comments').textContent = this.getComments();
								  this.element.querySelector('.picture-likes').textContent = this.getLikes();

								  var videoElement = document.createElement('video');
								  videoElement.width = 182;
								  videoElement.height = 182;
								  videoElement.src = this.getSrc();
								  this.element.replaceChild(videoElement, this.element.firstElementChild);

								  this.element.addEventListener('click', this._onClick);
								  return this.element;
								};


								Video.prototype.onClick = null;

								Video.prototype._onClick = function(evt) {
								  evt.preventDefault();
								  if (typeof this.onClick === 'function') {
								    this.onClick();
								  }
								};

								module.exports = Video;


							/***/ },
							/* 11 */
							/***/ function(module, exports) {

								/******/ (function(modules) { // webpackBootstrap
								/******/ 	// The module cache
								/******/ 	var installedModules = {};

								/******/ 	// The require function
								/******/ 	function __webpack_require__(moduleId) {

								/******/ 		// Check if module is in cache
								/******/ 		if(installedModules[moduleId])
								/******/ 			return installedModules[moduleId].exports;

								/******/ 		// Create a new module (and put it into the cache)
								/******/ 		var module = installedModules[moduleId] = {
								/******/ 			exports: {},
								/******/ 			id: moduleId,
								/******/ 			loaded: false
								/******/ 		};

								/******/ 		// Execute the module function
								/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

								/******/ 		// Flag the module as loaded
								/******/ 		module.loaded = true;

								/******/ 		// Return the exports of the module
								/******/ 		return module.exports;
								/******/ 	}


								/******/ 	// expose the modules object (__webpack_modules__)
								/******/ 	__webpack_require__.m = modules;

								/******/ 	// expose the module cache
								/******/ 	__webpack_require__.c = installedModules;

								/******/ 	// __webpack_public_path__
								/******/ 	__webpack_require__.p = "";

								/******/ 	// Load entry module and return exports
								/******/ 	return __webpack_require__(0);
								/******/ })
								/************************************************************************/
								/******/ ([
								/* 0 */
								/***/ function(module, exports, __webpack_require__) {

									__webpack_require__(1);
									__webpack_require__(1);
									module.exports = __webpack_require__(11);


								/***/ },
								/* 1 */
								/***/ function(module, exports, __webpack_require__) {

									'use strict';

									__webpack_require__(2);
									__webpack_require__(4);


								/***/ },
								/* 2 */
								/***/ function(module, exports, __webpack_require__) {

									/* global docCookies */
									'use strict';

									var Resizer = __webpack_require__(3);

									/**
									 * @fileoverview
									 * @author Igor Alexeenko (o0)
									 */

									(function() {
									  /** @enum {string} */
									  var FileType = {
									    'GIF': '',
									    'JPEG': '',
									    'PNG': '',
									    'SVG+XML': ''
									  };

									  /** @enum {number} */
									  var Action = {
									    ERROR: 0,
									    UPLOADING: 1,
									    CUSTOM: 2
									  };


									  /**
									   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
									   * из ключей FileType.
									   * @type {RegExp}
									   */
									  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

									  /**
									   * @type {Object.<string, string>}
									   */
									  var filterMap;

									  /**
									   * Объект, который занимается кадрированием изображения.
									   * @type {Resizer}
									   */
									  var currentResizer;

									  /**
									   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
									   * изображением.
									   */
									  function cleanupResizer() {
									    if (currentResizer) {
									      currentResizer.remove();
									      currentResizer = null;
									    }
									  }

									  /**
									   * Ставит одну из трех случайных картинок на фон формы загрузки.
									   */
									  function updateBackground() {
									    var images = [
									      'img/logo-background-1.jpg',
									      'img/logo-background-2.jpg',
									      'img/logo-background-3.jpg'
									    ];

									    var backgroundElement = document.querySelector('.upload');
									    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
									    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
									  }

									  /**
									   * Проверяет, валидны ли данные, в форме кадрирования.
									   * @return {boolean}
									   */
									  function resizeFormIsValid() {
									    var resizeXField = +document.getElementById('resize-x').value;
									    var resizeYField = +document.getElementById('resize-y').value;
									    var resizeSizeField = +document.getElementById('resize-size').value;
									    var resizeBtn = document.getElementById('resize-fwd');

									    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
									        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
									      resizeBtn.disabled = true;
									    } else {
									      resizeBtn.disabled = false;
									    }

									    return resizeXField < 0 || resizeYField < 0 ? false : true;
									  }

									  /**
									   * Форма загрузки изображения.
									   * @type {HTMLFormElement}
									   */
									  var uploadForm = document.forms['upload-select-image'];

									  /**
									   * Форма кадрирования изображения.
									   * @type {HTMLFormElement}
									   */
									  var resizeForm = document.forms['upload-resize'];

									  /**
									   * Форма добавления фильтра.
									   * @type {HTMLFormElement}
									   */
									  var filterForm = document.forms['upload-filter'];

									  /**
									   * @type {HTMLImageElement}
									   */
									  var filterImage = filterForm.querySelector('.filter-image-preview');

									  /**
									   * @type {HTMLElement}
									   */
									  var uploadMessage = document.querySelector('.upload-message');

									  /**
									   * @param {Action} action
									   * @param {string=} message
									   * @return {Element}
									   */
									  function showMessage(action, message) {
									    var isError = false;

									    switch (action) {
									      case Action.UPLOADING:
									        message = message || 'Кексограмим&hellip;';
									        break;

									      case Action.ERROR:
									        isError = true;
									        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
									        break;
									    }

									    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
									    uploadMessage.classList.remove('invisible');
									    uploadMessage.classList.toggle('upload-message-error', isError);
									    return uploadMessage;
									  }

									  function hideMessage() {
									    uploadMessage.classList.add('invisible');
									  }

									  function setFilter(filterName) {
									    if (!filterMap) {
									      // Ленивая инициализация. Объект не создается до тех пор, пока
									      // не понадобится прочитать его в первый раз, а после этого запоминается
									      // навсегда.
									      filterMap = {
									        'none': 'filter-none',
									        'chrome': 'filter-chrome',
									        'sepia': 'filter-sepia'
									      };
									    }

									    // подсвечиваем выбранный фильтр
									    document.getElementById('upload-filter-' + filterName).checked = true;

									    // Класс перезаписывается, а не обновляется через classList потому что нужно
									    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
									    // состояние или просто перезаписывать.
									    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

									    // сохраняем в кукис
									    var closestDoB = new Date('2015-07-12');
									    var dateToExpire = new Date(
									      Date.now() + (Date.now() - closestDoB)
									    ).toUTCString();

									    docCookies.setItem('filter', filterName, dateToExpire);
									  }

									  /**
									   * Функция синхронизации ресайзера и формы
									   */
									  function syncResizer() {
									    if (currentResizer) {
									      var constraints = currentResizer.getConstraint();
									      document.getElementById('resize-x').value = constraints.x;
									      document.getElementById('resize-y').value = constraints.y;
									      document.getElementById('resize-size').value = constraints.side;
									    }
									  }

									  /**
									   * Обработчик изменения изображения в форме загрузки. Если загруженный
									   * файл является изображением, считывается исходник картинки, создается
									   * Resizer с загруженной картинкой, добавляется в форму кадрирования
									   * и показывается форма кадрирования.
									   * @param {Event} evt
									   */
									  uploadForm.addEventListener('change', function(evt) {
									    var element = evt.target;
									    if (element.id === 'upload-file') {
									      // Проверка типа загружаемого файла, тип должен быть изображением
									      // одного из форматов: JPEG, PNG, GIF или SVG.
									      if (fileRegExp.test(element.files[0].type)) {
									        var fileReader = new FileReader();

									        showMessage(Action.UPLOADING);

									        fileReader.onload = function() {
									          cleanupResizer();

									          currentResizer = new Resizer(fileReader.result);
									          currentResizer.setElement(resizeForm);
									          uploadMessage.classList.add('invisible');

									          uploadForm.classList.add('invisible');
									          resizeForm.classList.remove('invisible');

									          hideMessage();
									          setTimeout(syncResizer, 10);
									        };

									        fileReader.readAsDataURL(element.files[0]);
									      } else {
									        // Показ сообщения об ошибке, если загружаемый файл, не является
									        // поддерживаемым изображением.
									        showMessage(Action.ERROR);
									      }
									    }
									  });

									  /**
									   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
									   * @param {Event} evt
									   */
									  resizeForm.addEventListener('change', function(evt) {
									    // вынес в отдельные переменные для лучшей читаемости
									    resizeFormIsValid();
									    // получаем текущие координаты ресайзера
									    var constraints = currentResizer.getConstraint();

									    var changedElement = evt.target;
									    var newVal = +changedElement.value;

									    // двигаем ресайзер в зависимости от того, какое поле поменялось
									    switch (changedElement.name) {
									      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
									        break;
									      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
									        break;
									      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
									        break;
									    }
									  });

									  /**
									   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
									   * и обновляет фон.
									   * @param {Event} evt
									   */
									  resizeForm.addEventListener('reset', function(evt) {
									    evt.preventDefault();

									    cleanupResizer();
									    updateBackground();

									    resizeForm.classList.add('invisible');
									    uploadForm.classList.remove('invisible');
									  });

									  /**
									   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
									   * кропнутое изображение в форму добавления фильтра и показывает ее.
									   * @param {Event} evt
									   */
									  resizeForm.addEventListener('submit', function(evt) {
									    evt.preventDefault();

									    if (resizeFormIsValid()) {
									      filterImage.src = currentResizer.exportImage().src;

									      resizeForm.classList.add('invisible');
									      filterForm.classList.remove('invisible');
									    }
									  });

									  /**
									   * Сброс формы фильтра. Показывает форму кадрирования.
									   * @param {Event} evt
									   */
									  filterForm.addEventListener('reset', function(evt) {
									    evt.preventDefault();

									    filterForm.classList.add('invisible');
									    resizeForm.classList.remove('invisible');
									  });

									  /**
									   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
									   * записав сохраненный фильтр в cookie.
									   * @param {Event} evt
									   */
									  filterForm.addEventListener('submit', function(evt) {
									    evt.preventDefault();

									    cleanupResizer();
									    updateBackground();

									    filterForm.classList.add('invisible');
									    uploadForm.classList.remove('invisible');
									  });

									  /**
									   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
									   * выбранному значению в форме.
									   */
									  filterForm.addEventListener('change', function() {
									    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
									      return item.checked;
									    })[0].value;
									    setFilter(selectedFilter);
									  });

									  cleanupResizer();
									  updateBackground();
									  // выставляем фильтр, если находим его в кукисах
									  if (docCookies.getItem('filter') === null) {
									    setFilter('none');
									  } else {
									    setFilter( docCookies.getItem('filter') );
									  }

									  window.addEventListener('resizerchange', syncResizer);


									})();


								/***/ },
								/* 3 */
								/***/ function(module, exports) {

									'use strict';

									/**
									 * @constructor
									 * @param {string} image
									 */
									var Resizer = function(image) {
									  // Изображение, с которым будет вестись работа.
									  this._image = new Image();
									  this._image.src = image;

									  // Холст.
									  this._container = document.createElement('canvas');
									  this._ctx = this._container.getContext('2d');

									  // Создаем холст только после загрузки изображения.
									  this._image.onload = function() {
									    // Размер холста равен размеру загруженного изображения. Это нужно
									    // для удобства работы с координатами.
									    this._container.width = this._image.naturalWidth;
									    this._container.height = this._image.naturalHeight;

									    /**
									     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
									     * стороны изображения.
									     * @const
									     * @type {number}
									     */
									    var INITIAL_SIDE_RATIO = 0.75;
									    // Размер меньшей стороны изображения.
									    var side = Math.min(
									        this._container.width * INITIAL_SIDE_RATIO,
									        this._container.height * INITIAL_SIDE_RATIO);

									    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
									    // от размера меньшей стороны.
									    this._resizeConstraint = new Square(
									        this._container.width / 2 - side / 2,
									        this._container.height / 2 - side / 2,
									        side);

									    // Отрисовка изначального состояния канваса.
									    this.redraw();
									  }.bind(this);

									  // Фиксирование контекста обработчиков.
									  this._onDragStart = this._onDragStart.bind(this);
									  this._onDragEnd = this._onDragEnd.bind(this);
									  this._onDrag = this._onDrag.bind(this);
									};

									Resizer.prototype = {
									  /**
									   * Родительский элемент канваса.
									   * @type {Element}
									   * @private
									   */
									  _element: null,

									  /**
									   * Положение курсора в момент перетаскивания. От положения курсора
									   * рассчитывается смещение на которое нужно переместить изображение
									   * за каждую итерацию перетаскивания.
									   * @type {Coordinate}
									   * @private
									   */
									  _cursorPosition: null,

									  /**
									   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
									   * от верхнего левого угла исходного изображения.
									   * @type {Square}
									   * @private
									   */
									  _resizeConstraint: null,

									  /**
									   * Отрисовка канваса.
									   */
									  redraw: function() {
									    // Очистка изображения.
									    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

									    // Параметры линии.
									    // NB! Такие параметры сохраняются на время всего процесса отрисовки
									    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
									    // чего-либо с другой обводкой.

									    // Толщина линии.
									    this._ctx.lineWidth = 6;
									    // Цвет обводки.
									    this._ctx.strokeStyle = '#ffe753';

									    // Сохранение состояния канваса.
									    // Подробней см. строку 132.
									    this._ctx.save();

									    // Установка начальной точки системы координат в центр холста.
									    this._ctx.translate(this._container.width / 2, this._container.height / 2);

									    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
									    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
									    // Отрисовка изображения на холсте. Параметры задают изображение, которое
									    // нужно отрисовать и координаты его верхнего левого угла.
									    // Координаты задаются от центра холста.

									    this._ctx.drawImage(this._image, displX, displY);

									    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
									    // взяты из начального кода отрисовки рамки
									    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
									    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
									    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
									    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

									    // ставим прозрачность 0.8
									    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
									    this._ctx.beginPath();

									    // рисуем зиг-заг прямоугольник
									    zigzagRect(this._ctx, x0, y0, x1, y1);

									    // после этого обводим рамку по внешнему периметру
									    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
									    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
									    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
									    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
									    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
									    // заливаем получившуюся фигуру
									    this._ctx.fill();

									    // рисуем центрированный текст
									    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
									    this._ctx.fillStyle = '#FFF';
									    this._ctx.textAlign = 'center';
									    this._ctx.textBaseline = 'bottom';
									    this._ctx.font = 'normal 30px Arial';
									    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

									    // Восстановление состояния канваса, которое было до вызова ctx.save
									    // и последующего изменения системы координат. Нужно для того, чтобы
									    // следующий кадр рисовался с привычной системой координат, где точка
									    // 0 0 находится в левом верхнем углу холста, в противном случае
									    // некорректно сработает даже очистка холста или нужно будет использовать
									    // сложные рассчеты для координат прямоугольника, который нужно очистить.
									    this._ctx.restore();
									  },

									  /**
									   * Включение режима перемещения. Запоминается текущее положение курсора,
									   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
									   * позволяющие перерисовывать изображение по мере перетаскивания.
									   * @param {number} x
									   * @param {number} y
									   * @private
									   */
									  _enterDragMode: function(x, y) {
									    this._cursorPosition = new Coordinate(x, y);
									    document.body.addEventListener('mousemove', this._onDrag);
									    document.body.addEventListener('mouseup', this._onDragEnd);
									  },

									  /**
									   * Выключение режима перемещения.
									   * @private
									   */
									  _exitDragMode: function() {
									    this._cursorPosition = null;
									    document.body.removeEventListener('mousemove', this._onDrag);
									    document.body.removeEventListener('mouseup', this._onDragEnd);
									  },

									  /**
									   * Перемещение изображения относительно кадра.
									   * @param {number} x
									   * @param {number} y
									   * @private
									   */
									  updatePosition: function(x, y) {
									    this.moveConstraint(
									        this._cursorPosition.x - x,
									        this._cursorPosition.y - y);
									    this._cursorPosition = new Coordinate(x, y);
									  },

									  /**
									   * @param {MouseEvent} evt
									   * @private
									   */
									  _onDragStart: function(evt) {
									    this._enterDragMode(evt.clientX, evt.clientY);
									  },

									  /**
									   * Обработчик окончания перетаскивания.
									   * @private
									   */
									  _onDragEnd: function() {
									    this._exitDragMode();
									  },

									  /**
									   * Обработчик события перетаскивания.
									   * @param {MouseEvent} evt
									   * @private
									   */
									  _onDrag: function(evt) {
									    this.updatePosition(evt.clientX, evt.clientY);
									  },

									  /**
									   * Добавление элемента в DOM.
									   * @param {Element} element
									   */
									  setElement: function(element) {
									    if (this._element === element) {
									      return;
									    }

									    this._element = element;
									    this._element.insertBefore(this._container, this._element.firstChild);
									    // Обработчики начала и конца перетаскивания.
									    this._container.addEventListener('mousedown', this._onDragStart);
									  },

									  /**
									   * Возвращает кадрирование элемента.
									   * @return {Square}
									   */
									  getConstraint: function() {
									    return this._resizeConstraint;
									  },

									  /**
									   * Смещает кадрирование на значение указанное в параметрах.
									   * @param {number} deltaX
									   * @param {number} deltaY
									   * @param {number} deltaSide
									   */
									  moveConstraint: function(deltaX, deltaY, deltaSide) {
									    this.setConstraint(
									        this._resizeConstraint.x + (deltaX || 0),
									        this._resizeConstraint.y + (deltaY || 0),
									        this._resizeConstraint.side + (deltaSide || 0));
									  },

									  /**
									   * @param {number} x
									   * @param {number} y
									   * @param {number} side
									   */
									  setConstraint: function(x, y, side) {
									    if (typeof x !== 'undefined') {
									      this._resizeConstraint.x = x;
									    }

									    if (typeof y !== 'undefined') {
									      this._resizeConstraint.y = y;
									    }

									    if (typeof side !== 'undefined') {
									      this._resizeConstraint.side = side;
									    }

									    requestAnimationFrame(function() {
									      this.redraw();
									      window.dispatchEvent(new CustomEvent('resizerchange'));
									    }.bind(this));
									  },

									  /**
									   * Удаление. Убирает контейнер из родительского элемента, убирает
									   * все обработчики событий и убирает ссылки.
									   */
									  remove: function() {
									    this._element.removeChild(this._container);

									    this._container.removeEventListener('mousedown', this._onDragStart);
									    this._container = null;
									  },

									  /**
									   * Экспорт обрезанного изображения как HTMLImageElement и исходником
									   * картинки в src в формате dataURL.
									   * @return {Image}
									   */
									  exportImage: function() {
									    // Создаем Image, с размерами, указанными при кадрировании.
									    var imageToExport = new Image();

									    // Создается новый canvas, по размерам совпадающий с кадрированным
									    // изображением, в него добавляется изображение взятое из канваса
									    // с измененными координатами и сохраняется в dataURL, с помощью метода
									    // toDataURL. Полученный исходный код, записывается в src у ранее
									    // созданного изображения.
									    var temporaryCanvas = document.createElement('canvas');
									    var temporaryCtx = temporaryCanvas.getContext('2d');
									    temporaryCanvas.width = this._resizeConstraint.side;
									    temporaryCanvas.height = this._resizeConstraint.side;
									    temporaryCtx.drawImage(this._image,
									        -this._resizeConstraint.x,
									        -this._resizeConstraint.y);
									    imageToExport.src = temporaryCanvas.toDataURL('image/png');

									    return imageToExport;
									  }
									};

									/**
									 * Вспомогательный тип, описывающий квадрат.
									 * @constructor
									 * @param {number} x
									 * @param {number} y
									 * @param {number} side
									 * @private
									 */
									var Square = function(x, y, side) {
									  this.x = x;
									  this.y = y;
									  this.side = side;
									};

									/**
									 * Вспомогательный тип, описывающий координату.
									 * @constructor
									 * @param {number} x
									 * @param {number} y
									 * @private
									 */
									var Coordinate = function(x, y) {
									  this.x = x;
									  this.y = y;
									};

									var zigzagRect = function(ctx, x0, y0, x1, y1) {
									  var xStart = x0;
									  var yStart = y0;

									  ctx.fillColor = 'black';
									  ctx.moveTo(x0, y0);
									  ctx.beginPath();
									  // длина зиг-заг линии
									  var line = 5;

									  var step = 0;

									  // слева направо - двигаемся по ox
									  while (x0 < x1) {
									    if (step % 2 === 0) {
									      x0 = x0 + line;
									      y0 = y0 + Math.abs(line);
									      ctx.lineTo(x0, y0);
									    } else {
									      x0 = x0 + line;
									      y0 = y0 - Math.abs(line);
									      ctx.lineTo(x0, y0);
									    }
									    step++;
									  }

									  // потом вниз  - двигаемся по oy
									  while (y0 < y1) {
									    if (step % 2 === 0) {
									      x0 = x0 + Math.abs(line);
									      y0 = y0 + line;
									      ctx.lineTo(x0, y0);
									    } else {
									      x0 = x0 - Math.abs(line);
									      y0 = y0 + line;
									      ctx.lineTo(x0, y0);
									    }
									    step++;
									  }

									  line = line * -1;
									  // налево
									  while (x0 > xStart) {
									    if (step % 2 === 0) {
									      x0 = x0 + line;
									      y0 = y0 + Math.abs(line);
									      ctx.lineTo(x0, y0);
									    } else {
									      x0 = x0 + line;
									      y0 = y0 - Math.abs(line);
									      ctx.lineTo(x0, y0);
									    }
									    step++;
									  }

									  // замыкаем вверх
									  while (y0 + line > yStart ) {
									    if (step % 2 === 0) {
									      x0 = x0 + Math.abs(line);
									      y0 = y0 + line;
									      ctx.lineTo(x0, y0);
									    } else {
									      x0 = x0 - Math.abs(line);
									      y0 = y0 + line;
									      ctx.lineTo(x0, y0);
									    }
									    step++;
									  }
									  ctx.stroke();
									};

									module.exports = Resizer;


								/***/ },
								/* 4 */
								/***/ function(module, exports, __webpack_require__) {

									'use strict';

									var Photo = __webpack_require__(5);
									var Gallery = __webpack_require__(8);
									var Video = __webpack_require__(10);

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

									})();


								/***/ },
								/* 5 */
								/***/ function(module, exports, __webpack_require__) {

									'use strict';

									var inherit = __webpack_require__(6);
									var PhotoBase = __webpack_require__(7);

									/**
									* @param {Object} data
									* @constructor
									* @extends {PhotoBase}
									*/
									function Photo() {
									  this.mediatype = 'img';
									}
									inherit(Photo, PhotoBase);

									/**
									* Подгрузка изображения и создание картинки из шаблона
									*/
									Photo.prototype.render = function() {
									  var template = document.getElementById('picture-template');
									  this.element = template.content.children[0].cloneNode(true);
									  this.element.querySelector('.picture-comments').textContent = this.getComments();
									  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
									  picImage.src = this.getSrc();

									  this.element.addEventListener('click', this._onClick);
									  return this.element;
									};

									Photo.prototype.remove = function() {
									  this.element.removeEventListener('click', this._onClick);
									};

									Photo.prototype.updateLikes = function() {
									  this.element.querySelector('.picture-likes').textContent = this.getLikes();
									};

									Photo.prototype.onClick = null;

									Photo.prototype._onClick = function(evt) {
									  evt.preventDefault();
									  if ( !this.classList.contains('picture-load-failure') ) {
									    if (typeof this.onClick === 'function') {
									      this.onClick();
									    }
									  }
									};

									module.exports = Photo;


								/***/ },
								/* 6 */
								/***/ function(module, exports) {

									'use strict';
									function inherit(Child, Parent) {
									  var TempConstructor = function() {};
									  TempConstructor.prototype = Parent.prototype;
									  Child.prototype = new TempConstructor();
									  Child.prototype.constructor = Child;
									}
									module.exports = inherit;


								/***/ },
								/* 7 */
								/***/ function(module, exports) {

									'use strict';

									/**
									* @param {Object} data
									* @constructor
									*/
									function PhotoBase(data) {
									  this.setData(data);
									}

									PhotoBase.prototype._data = null;
									PhotoBase.prototype.mediatype = null;

									PhotoBase.prototype.setData = function(data) {
									  this._data = data;
									  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
									    this.mediatype = 'img';
									  } else {
									    this.mediatype = 'video';
									  }
									  this._data.liked = data.liked ? true : false;
									};

									PhotoBase.prototype.getData = function() {
									  return this._data;
									};

									/**
									* Функции-геттеры, используемые в сортировках/фильтрации
									*/
									PhotoBase.prototype.getLikes = function() {
									  return parseInt(this.getData().likes, 10);
									};

									PhotoBase.prototype.getComments = function() {
									  return parseInt(this.getData().comments, 10);
									};

									PhotoBase.prototype.getDate = function() {
									  return new Date(this.getData().date);
									};

									PhotoBase.prototype.getSrc = function() {
									  return this.getData().url;
									};



									/** Like dispatcher :) */
									PhotoBase.prototype.setLikes = function(likes) {
									  this._data.likes = likes;
									};

									PhotoBase.prototype.like = function() {
									  this.setLikes( this.getLikes() + 1 );
									  this._data.liked = true;
									};

									PhotoBase.prototype.dislike = function() {
									  this.setLikes( this.getLikes() - 1 );
									  this._data.liked = false;
									};

									PhotoBase.prototype.liked = function() {
									  return this._data.liked;
									};

									module.exports = PhotoBase;


								/***/ },
								/* 8 */
								/***/ function(module, exports, __webpack_require__) {

									'use strict';

									var PhotoPreview = __webpack_require__(9);
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

									module.exports = Gallery;


								/***/ },
								/* 9 */
								/***/ function(module, exports, __webpack_require__) {

									'use strict';

									var inherit = __webpack_require__(6);
									var PhotoBase = __webpack_require__(7);

									/**
									* @param {Object} data
									* @constructor
									* @extends {PhotoBase}
									*/
									function PhotoPreview() {
									}

									inherit(PhotoPreview, PhotoBase);

									PhotoPreview.prototype.render = function(el, noauto) {
									  el.querySelector('.likes-count').textContent = this.getLikes();
									  el.querySelector('.comments-count').textContent = this.getComments();
									  if ( this.liked() ) {
									    el.querySelector('.likes-count').classList.add('likes-count-liked');
									  } else {
									    el.querySelector('.likes-count').classList.remove('likes-count-liked');
									  }
									  if (this.mediatype === 'img') {
									    el.querySelector('.gallery-overlay-video').style.display = 'none';
									    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
									    el.querySelector('.gallery-overlay-image').src = this.getSrc();
									  } else if (this.mediatype === 'video') {
									    el.querySelector('.gallery-overlay-image').style.display = 'none';
									    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
									    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
									    el.querySelector('.gallery-overlay-video').src = this.getSrc();
									  }
									};

									PhotoPreview.prototype.remove = function() {
									  this.setData(null);
									};

									module.exports = PhotoPreview;


								/***/ },
								/* 10 */
								/***/ function(module, exports, __webpack_require__) {

									'use strict';

									var inherit = __webpack_require__(6);
									var Photo = __webpack_require__(5);

									/**
									* @param {Object} data
									* @constructor
									* @extends {Photo}
									*/
									function Video() {
									  this.mediatype = 'video';
									}
									inherit(Video, Photo);

									/**
									* Подгрузка изображения и создание картинки из шаблона
									*/
									Video.prototype.render = function() {
									  var template = document.getElementById('picture-template');
									  this.element = template.content.children[0].cloneNode(true);
									  this.element.querySelector('.picture-comments').textContent = this.getComments();
									  this.element.querySelector('.picture-likes').textContent = this.getLikes();

									  var videoElement = document.createElement('video');
									  videoElement.width = 182;
									  videoElement.height = 182;
									  videoElement.src = this.getSrc();
									  this.element.replaceChild(videoElement, this.element.firstElementChild);

									  this.element.addEventListener('click', this._onClick);
									  return this.element;
									};


									Video.prototype.onClick = null;

									Video.prototype._onClick = function(evt) {
									  evt.preventDefault();
									  if (typeof this.onClick === 'function') {
									    this.onClick();
									  }
									};

									module.exports = Video;


								/***/ },
								/* 11 */
								/***/ function(module, exports) {

									/******/ (function(modules) { // webpackBootstrap
									/******/ 	// The module cache
									/******/ 	var installedModules = {};

									/******/ 	// The require function
									/******/ 	function __webpack_require__(moduleId) {

									/******/ 		// Check if module is in cache
									/******/ 		if(installedModules[moduleId])
									/******/ 			return installedModules[moduleId].exports;

									/******/ 		// Create a new module (and put it into the cache)
									/******/ 		var module = installedModules[moduleId] = {
									/******/ 			exports: {},
									/******/ 			id: moduleId,
									/******/ 			loaded: false
									/******/ 		};

									/******/ 		// Execute the module function
									/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

									/******/ 		// Flag the module as loaded
									/******/ 		module.loaded = true;

									/******/ 		// Return the exports of the module
									/******/ 		return module.exports;
									/******/ 	}


									/******/ 	// expose the modules object (__webpack_modules__)
									/******/ 	__webpack_require__.m = modules;

									/******/ 	// expose the module cache
									/******/ 	__webpack_require__.c = installedModules;

									/******/ 	// __webpack_public_path__
									/******/ 	__webpack_require__.p = "";

									/******/ 	// Load entry module and return exports
									/******/ 	return __webpack_require__(0);
									/******/ })
									/************************************************************************/
									/******/ ([
									/* 0 */
									/***/ function(module, exports, __webpack_require__) {

										__webpack_require__(1);
										(function webpackMissingModule() { throw new Error("Cannot find module \".js/main.js\""); }());
										module.exports = __webpack_require__(11);


									/***/ },
									/* 1 */
									/***/ function(module, exports, __webpack_require__) {

										'use strict';

										__webpack_require__(2);
										__webpack_require__(4);


									/***/ },
									/* 2 */
									/***/ function(module, exports, __webpack_require__) {

										/* global docCookies */
										'use strict';

										var Resizer = __webpack_require__(3);

										/**
										 * @fileoverview
										 * @author Igor Alexeenko (o0)
										 */

										(function() {
										  /** @enum {string} */
										  var FileType = {
										    'GIF': '',
										    'JPEG': '',
										    'PNG': '',
										    'SVG+XML': ''
										  };

										  /** @enum {number} */
										  var Action = {
										    ERROR: 0,
										    UPLOADING: 1,
										    CUSTOM: 2
										  };


										  /**
										   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
										   * из ключей FileType.
										   * @type {RegExp}
										   */
										  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

										  /**
										   * @type {Object.<string, string>}
										   */
										  var filterMap;

										  /**
										   * Объект, который занимается кадрированием изображения.
										   * @type {Resizer}
										   */
										  var currentResizer;

										  /**
										   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
										   * изображением.
										   */
										  function cleanupResizer() {
										    if (currentResizer) {
										      currentResizer.remove();
										      currentResizer = null;
										    }
										  }

										  /**
										   * Ставит одну из трех случайных картинок на фон формы загрузки.
										   */
										  function updateBackground() {
										    var images = [
										      'img/logo-background-1.jpg',
										      'img/logo-background-2.jpg',
										      'img/logo-background-3.jpg'
										    ];

										    var backgroundElement = document.querySelector('.upload');
										    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
										    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
										  }

										  /**
										   * Проверяет, валидны ли данные, в форме кадрирования.
										   * @return {boolean}
										   */
										  function resizeFormIsValid() {
										    var resizeXField = +document.getElementById('resize-x').value;
										    var resizeYField = +document.getElementById('resize-y').value;
										    var resizeSizeField = +document.getElementById('resize-size').value;
										    var resizeBtn = document.getElementById('resize-fwd');

										    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
										        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
										      resizeBtn.disabled = true;
										    } else {
										      resizeBtn.disabled = false;
										    }

										    return resizeXField < 0 || resizeYField < 0 ? false : true;
										  }

										  /**
										   * Форма загрузки изображения.
										   * @type {HTMLFormElement}
										   */
										  var uploadForm = document.forms['upload-select-image'];

										  /**
										   * Форма кадрирования изображения.
										   * @type {HTMLFormElement}
										   */
										  var resizeForm = document.forms['upload-resize'];

										  /**
										   * Форма добавления фильтра.
										   * @type {HTMLFormElement}
										   */
										  var filterForm = document.forms['upload-filter'];

										  /**
										   * @type {HTMLImageElement}
										   */
										  var filterImage = filterForm.querySelector('.filter-image-preview');

										  /**
										   * @type {HTMLElement}
										   */
										  var uploadMessage = document.querySelector('.upload-message');

										  /**
										   * @param {Action} action
										   * @param {string=} message
										   * @return {Element}
										   */
										  function showMessage(action, message) {
										    var isError = false;

										    switch (action) {
										      case Action.UPLOADING:
										        message = message || 'Кексограмим&hellip;';
										        break;

										      case Action.ERROR:
										        isError = true;
										        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
										        break;
										    }

										    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
										    uploadMessage.classList.remove('invisible');
										    uploadMessage.classList.toggle('upload-message-error', isError);
										    return uploadMessage;
										  }

										  function hideMessage() {
										    uploadMessage.classList.add('invisible');
										  }

										  function setFilter(filterName) {
										    if (!filterMap) {
										      // Ленивая инициализация. Объект не создается до тех пор, пока
										      // не понадобится прочитать его в первый раз, а после этого запоминается
										      // навсегда.
										      filterMap = {
										        'none': 'filter-none',
										        'chrome': 'filter-chrome',
										        'sepia': 'filter-sepia'
										      };
										    }

										    // подсвечиваем выбранный фильтр
										    document.getElementById('upload-filter-' + filterName).checked = true;

										    // Класс перезаписывается, а не обновляется через classList потому что нужно
										    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
										    // состояние или просто перезаписывать.
										    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

										    // сохраняем в кукис
										    var closestDoB = new Date('2015-07-12');
										    var dateToExpire = new Date(
										      Date.now() + (Date.now() - closestDoB)
										    ).toUTCString();

										    docCookies.setItem('filter', filterName, dateToExpire);
										  }

										  /**
										   * Функция синхронизации ресайзера и формы
										   */
										  function syncResizer() {
										    if (currentResizer) {
										      var constraints = currentResizer.getConstraint();
										      document.getElementById('resize-x').value = constraints.x;
										      document.getElementById('resize-y').value = constraints.y;
										      document.getElementById('resize-size').value = constraints.side;
										    }
										  }

										  /**
										   * Обработчик изменения изображения в форме загрузки. Если загруженный
										   * файл является изображением, считывается исходник картинки, создается
										   * Resizer с загруженной картинкой, добавляется в форму кадрирования
										   * и показывается форма кадрирования.
										   * @param {Event} evt
										   */
										  uploadForm.addEventListener('change', function(evt) {
										    var element = evt.target;
										    if (element.id === 'upload-file') {
										      // Проверка типа загружаемого файла, тип должен быть изображением
										      // одного из форматов: JPEG, PNG, GIF или SVG.
										      if (fileRegExp.test(element.files[0].type)) {
										        var fileReader = new FileReader();

										        showMessage(Action.UPLOADING);

										        fileReader.onload = function() {
										          cleanupResizer();

										          currentResizer = new Resizer(fileReader.result);
										          currentResizer.setElement(resizeForm);
										          uploadMessage.classList.add('invisible');

										          uploadForm.classList.add('invisible');
										          resizeForm.classList.remove('invisible');

										          hideMessage();
										          setTimeout(syncResizer, 10);
										        };

										        fileReader.readAsDataURL(element.files[0]);
										      } else {
										        // Показ сообщения об ошибке, если загружаемый файл, не является
										        // поддерживаемым изображением.
										        showMessage(Action.ERROR);
										      }
										    }
										  });

										  /**
										   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
										   * @param {Event} evt
										   */
										  resizeForm.addEventListener('change', function(evt) {
										    // вынес в отдельные переменные для лучшей читаемости
										    resizeFormIsValid();
										    // получаем текущие координаты ресайзера
										    var constraints = currentResizer.getConstraint();

										    var changedElement = evt.target;
										    var newVal = +changedElement.value;

										    // двигаем ресайзер в зависимости от того, какое поле поменялось
										    switch (changedElement.name) {
										      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
										        break;
										      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
										        break;
										      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
										        break;
										    }
										  });

										  /**
										   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
										   * и обновляет фон.
										   * @param {Event} evt
										   */
										  resizeForm.addEventListener('reset', function(evt) {
										    evt.preventDefault();

										    cleanupResizer();
										    updateBackground();

										    resizeForm.classList.add('invisible');
										    uploadForm.classList.remove('invisible');
										  });

										  /**
										   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
										   * кропнутое изображение в форму добавления фильтра и показывает ее.
										   * @param {Event} evt
										   */
										  resizeForm.addEventListener('submit', function(evt) {
										    evt.preventDefault();

										    if (resizeFormIsValid()) {
										      filterImage.src = currentResizer.exportImage().src;

										      resizeForm.classList.add('invisible');
										      filterForm.classList.remove('invisible');
										    }
										  });

										  /**
										   * Сброс формы фильтра. Показывает форму кадрирования.
										   * @param {Event} evt
										   */
										  filterForm.addEventListener('reset', function(evt) {
										    evt.preventDefault();

										    filterForm.classList.add('invisible');
										    resizeForm.classList.remove('invisible');
										  });

										  /**
										   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
										   * записав сохраненный фильтр в cookie.
										   * @param {Event} evt
										   */
										  filterForm.addEventListener('submit', function(evt) {
										    evt.preventDefault();

										    cleanupResizer();
										    updateBackground();

										    filterForm.classList.add('invisible');
										    uploadForm.classList.remove('invisible');
										  });

										  /**
										   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
										   * выбранному значению в форме.
										   */
										  filterForm.addEventListener('change', function() {
										    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
										      return item.checked;
										    })[0].value;
										    setFilter(selectedFilter);
										  });

										  cleanupResizer();
										  updateBackground();
										  // выставляем фильтр, если находим его в кукисах
										  if (docCookies.getItem('filter') === null) {
										    setFilter('none');
										  } else {
										    setFilter( docCookies.getItem('filter') );
										  }

										  window.addEventListener('resizerchange', syncResizer);


										})();


									/***/ },
									/* 3 */
									/***/ function(module, exports) {

										'use strict';

										/**
										 * @constructor
										 * @param {string} image
										 */
										var Resizer = function(image) {
										  // Изображение, с которым будет вестись работа.
										  this._image = new Image();
										  this._image.src = image;

										  // Холст.
										  this._container = document.createElement('canvas');
										  this._ctx = this._container.getContext('2d');

										  // Создаем холст только после загрузки изображения.
										  this._image.onload = function() {
										    // Размер холста равен размеру загруженного изображения. Это нужно
										    // для удобства работы с координатами.
										    this._container.width = this._image.naturalWidth;
										    this._container.height = this._image.naturalHeight;

										    /**
										     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
										     * стороны изображения.
										     * @const
										     * @type {number}
										     */
										    var INITIAL_SIDE_RATIO = 0.75;
										    // Размер меньшей стороны изображения.
										    var side = Math.min(
										        this._container.width * INITIAL_SIDE_RATIO,
										        this._container.height * INITIAL_SIDE_RATIO);

										    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
										    // от размера меньшей стороны.
										    this._resizeConstraint = new Square(
										        this._container.width / 2 - side / 2,
										        this._container.height / 2 - side / 2,
										        side);

										    // Отрисовка изначального состояния канваса.
										    this.redraw();
										  }.bind(this);

										  // Фиксирование контекста обработчиков.
										  this._onDragStart = this._onDragStart.bind(this);
										  this._onDragEnd = this._onDragEnd.bind(this);
										  this._onDrag = this._onDrag.bind(this);
										};

										Resizer.prototype = {
										  /**
										   * Родительский элемент канваса.
										   * @type {Element}
										   * @private
										   */
										  _element: null,

										  /**
										   * Положение курсора в момент перетаскивания. От положения курсора
										   * рассчитывается смещение на которое нужно переместить изображение
										   * за каждую итерацию перетаскивания.
										   * @type {Coordinate}
										   * @private
										   */
										  _cursorPosition: null,

										  /**
										   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
										   * от верхнего левого угла исходного изображения.
										   * @type {Square}
										   * @private
										   */
										  _resizeConstraint: null,

										  /**
										   * Отрисовка канваса.
										   */
										  redraw: function() {
										    // Очистка изображения.
										    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

										    // Параметры линии.
										    // NB! Такие параметры сохраняются на время всего процесса отрисовки
										    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
										    // чего-либо с другой обводкой.

										    // Толщина линии.
										    this._ctx.lineWidth = 6;
										    // Цвет обводки.
										    this._ctx.strokeStyle = '#ffe753';

										    // Сохранение состояния канваса.
										    // Подробней см. строку 132.
										    this._ctx.save();

										    // Установка начальной точки системы координат в центр холста.
										    this._ctx.translate(this._container.width / 2, this._container.height / 2);

										    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
										    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
										    // Отрисовка изображения на холсте. Параметры задают изображение, которое
										    // нужно отрисовать и координаты его верхнего левого угла.
										    // Координаты задаются от центра холста.

										    this._ctx.drawImage(this._image, displX, displY);

										    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
										    // взяты из начального кода отрисовки рамки
										    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
										    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
										    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
										    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

										    // ставим прозрачность 0.8
										    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
										    this._ctx.beginPath();

										    // рисуем зиг-заг прямоугольник
										    zigzagRect(this._ctx, x0, y0, x1, y1);

										    // после этого обводим рамку по внешнему периметру
										    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
										    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
										    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
										    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
										    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
										    // заливаем получившуюся фигуру
										    this._ctx.fill();

										    // рисуем центрированный текст
										    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
										    this._ctx.fillStyle = '#FFF';
										    this._ctx.textAlign = 'center';
										    this._ctx.textBaseline = 'bottom';
										    this._ctx.font = 'normal 30px Arial';
										    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

										    // Восстановление состояния канваса, которое было до вызова ctx.save
										    // и последующего изменения системы координат. Нужно для того, чтобы
										    // следующий кадр рисовался с привычной системой координат, где точка
										    // 0 0 находится в левом верхнем углу холста, в противном случае
										    // некорректно сработает даже очистка холста или нужно будет использовать
										    // сложные рассчеты для координат прямоугольника, который нужно очистить.
										    this._ctx.restore();
										  },

										  /**
										   * Включение режима перемещения. Запоминается текущее положение курсора,
										   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
										   * позволяющие перерисовывать изображение по мере перетаскивания.
										   * @param {number} x
										   * @param {number} y
										   * @private
										   */
										  _enterDragMode: function(x, y) {
										    this._cursorPosition = new Coordinate(x, y);
										    document.body.addEventListener('mousemove', this._onDrag);
										    document.body.addEventListener('mouseup', this._onDragEnd);
										  },

										  /**
										   * Выключение режима перемещения.
										   * @private
										   */
										  _exitDragMode: function() {
										    this._cursorPosition = null;
										    document.body.removeEventListener('mousemove', this._onDrag);
										    document.body.removeEventListener('mouseup', this._onDragEnd);
										  },

										  /**
										   * Перемещение изображения относительно кадра.
										   * @param {number} x
										   * @param {number} y
										   * @private
										   */
										  updatePosition: function(x, y) {
										    this.moveConstraint(
										        this._cursorPosition.x - x,
										        this._cursorPosition.y - y);
										    this._cursorPosition = new Coordinate(x, y);
										  },

										  /**
										   * @param {MouseEvent} evt
										   * @private
										   */
										  _onDragStart: function(evt) {
										    this._enterDragMode(evt.clientX, evt.clientY);
										  },

										  /**
										   * Обработчик окончания перетаскивания.
										   * @private
										   */
										  _onDragEnd: function() {
										    this._exitDragMode();
										  },

										  /**
										   * Обработчик события перетаскивания.
										   * @param {MouseEvent} evt
										   * @private
										   */
										  _onDrag: function(evt) {
										    this.updatePosition(evt.clientX, evt.clientY);
										  },

										  /**
										   * Добавление элемента в DOM.
										   * @param {Element} element
										   */
										  setElement: function(element) {
										    if (this._element === element) {
										      return;
										    }

										    this._element = element;
										    this._element.insertBefore(this._container, this._element.firstChild);
										    // Обработчики начала и конца перетаскивания.
										    this._container.addEventListener('mousedown', this._onDragStart);
										  },

										  /**
										   * Возвращает кадрирование элемента.
										   * @return {Square}
										   */
										  getConstraint: function() {
										    return this._resizeConstraint;
										  },

										  /**
										   * Смещает кадрирование на значение указанное в параметрах.
										   * @param {number} deltaX
										   * @param {number} deltaY
										   * @param {number} deltaSide
										   */
										  moveConstraint: function(deltaX, deltaY, deltaSide) {
										    this.setConstraint(
										        this._resizeConstraint.x + (deltaX || 0),
										        this._resizeConstraint.y + (deltaY || 0),
										        this._resizeConstraint.side + (deltaSide || 0));
										  },

										  /**
										   * @param {number} x
										   * @param {number} y
										   * @param {number} side
										   */
										  setConstraint: function(x, y, side) {
										    if (typeof x !== 'undefined') {
										      this._resizeConstraint.x = x;
										    }

										    if (typeof y !== 'undefined') {
										      this._resizeConstraint.y = y;
										    }

										    if (typeof side !== 'undefined') {
										      this._resizeConstraint.side = side;
										    }

										    requestAnimationFrame(function() {
										      this.redraw();
										      window.dispatchEvent(new CustomEvent('resizerchange'));
										    }.bind(this));
										  },

										  /**
										   * Удаление. Убирает контейнер из родительского элемента, убирает
										   * все обработчики событий и убирает ссылки.
										   */
										  remove: function() {
										    this._element.removeChild(this._container);

										    this._container.removeEventListener('mousedown', this._onDragStart);
										    this._container = null;
										  },

										  /**
										   * Экспорт обрезанного изображения как HTMLImageElement и исходником
										   * картинки в src в формате dataURL.
										   * @return {Image}
										   */
										  exportImage: function() {
										    // Создаем Image, с размерами, указанными при кадрировании.
										    var imageToExport = new Image();

										    // Создается новый canvas, по размерам совпадающий с кадрированным
										    // изображением, в него добавляется изображение взятое из канваса
										    // с измененными координатами и сохраняется в dataURL, с помощью метода
										    // toDataURL. Полученный исходный код, записывается в src у ранее
										    // созданного изображения.
										    var temporaryCanvas = document.createElement('canvas');
										    var temporaryCtx = temporaryCanvas.getContext('2d');
										    temporaryCanvas.width = this._resizeConstraint.side;
										    temporaryCanvas.height = this._resizeConstraint.side;
										    temporaryCtx.drawImage(this._image,
										        -this._resizeConstraint.x,
										        -this._resizeConstraint.y);
										    imageToExport.src = temporaryCanvas.toDataURL('image/png');

										    return imageToExport;
										  }
										};

										/**
										 * Вспомогательный тип, описывающий квадрат.
										 * @constructor
										 * @param {number} x
										 * @param {number} y
										 * @param {number} side
										 * @private
										 */
										var Square = function(x, y, side) {
										  this.x = x;
										  this.y = y;
										  this.side = side;
										};

										/**
										 * Вспомогательный тип, описывающий координату.
										 * @constructor
										 * @param {number} x
										 * @param {number} y
										 * @private
										 */
										var Coordinate = function(x, y) {
										  this.x = x;
										  this.y = y;
										};

										var zigzagRect = function(ctx, x0, y0, x1, y1) {
										  var xStart = x0;
										  var yStart = y0;

										  ctx.fillColor = 'black';
										  ctx.moveTo(x0, y0);
										  ctx.beginPath();
										  // длина зиг-заг линии
										  var line = 5;

										  var step = 0;

										  // слева направо - двигаемся по ox
										  while (x0 < x1) {
										    if (step % 2 === 0) {
										      x0 = x0 + line;
										      y0 = y0 + Math.abs(line);
										      ctx.lineTo(x0, y0);
										    } else {
										      x0 = x0 + line;
										      y0 = y0 - Math.abs(line);
										      ctx.lineTo(x0, y0);
										    }
										    step++;
										  }

										  // потом вниз  - двигаемся по oy
										  while (y0 < y1) {
										    if (step % 2 === 0) {
										      x0 = x0 + Math.abs(line);
										      y0 = y0 + line;
										      ctx.lineTo(x0, y0);
										    } else {
										      x0 = x0 - Math.abs(line);
										      y0 = y0 + line;
										      ctx.lineTo(x0, y0);
										    }
										    step++;
										  }

										  line = line * -1;
										  // налево
										  while (x0 > xStart) {
										    if (step % 2 === 0) {
										      x0 = x0 + line;
										      y0 = y0 + Math.abs(line);
										      ctx.lineTo(x0, y0);
										    } else {
										      x0 = x0 + line;
										      y0 = y0 - Math.abs(line);
										      ctx.lineTo(x0, y0);
										    }
										    step++;
										  }

										  // замыкаем вверх
										  while (y0 + line > yStart ) {
										    if (step % 2 === 0) {
										      x0 = x0 + Math.abs(line);
										      y0 = y0 + line;
										      ctx.lineTo(x0, y0);
										    } else {
										      x0 = x0 - Math.abs(line);
										      y0 = y0 + line;
										      ctx.lineTo(x0, y0);
										    }
										    step++;
										  }
										  ctx.stroke();
										};

										module.exports = Resizer;


									/***/ },
									/* 4 */
									/***/ function(module, exports, __webpack_require__) {

										'use strict';

										var Photo = __webpack_require__(5);
										var Gallery = __webpack_require__(8);
										var Video = __webpack_require__(10);

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

										})();


									/***/ },
									/* 5 */
									/***/ function(module, exports, __webpack_require__) {

										'use strict';

										var inherit = __webpack_require__(6);
										var PhotoBase = __webpack_require__(7);

										/**
										* @param {Object} data
										* @constructor
										* @extends {PhotoBase}
										*/
										function Photo() {
										  this.mediatype = 'img';
										}
										inherit(Photo, PhotoBase);

										/**
										* Подгрузка изображения и создание картинки из шаблона
										*/
										Photo.prototype.render = function() {
										  var template = document.getElementById('picture-template');
										  this.element = template.content.children[0].cloneNode(true);
										  this.element.querySelector('.picture-comments').textContent = this.getComments();
										  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
										  picImage.src = this.getSrc();

										  this.element.addEventListener('click', this._onClick);
										  return this.element;
										};

										Photo.prototype.remove = function() {
										  this.element.removeEventListener('click', this._onClick);
										};

										Photo.prototype.updateLikes = function() {
										  this.element.querySelector('.picture-likes').textContent = this.getLikes();
										};

										Photo.prototype.onClick = null;

										Photo.prototype._onClick = function(evt) {
										  evt.preventDefault();
										  if ( !this.classList.contains('picture-load-failure') ) {
										    if (typeof this.onClick === 'function') {
										      this.onClick();
										    }
										  }
										};

										module.exports = Photo;


									/***/ },
									/* 6 */
									/***/ function(module, exports) {

										'use strict';
										function inherit(Child, Parent) {
										  var TempConstructor = function() {};
										  TempConstructor.prototype = Parent.prototype;
										  Child.prototype = new TempConstructor();
										  Child.prototype.constructor = Child;
										}
										module.exports = inherit;


									/***/ },
									/* 7 */
									/***/ function(module, exports) {

										'use strict';

										/**
										* @param {Object} data
										* @constructor
										*/
										function PhotoBase(data) {
										  this.setData(data);
										}

										PhotoBase.prototype._data = null;
										PhotoBase.prototype.mediatype = null;

										PhotoBase.prototype.setData = function(data) {
										  this._data = data;
										  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
										    this.mediatype = 'img';
										  } else {
										    this.mediatype = 'video';
										  }
										  this._data.liked = data.liked ? true : false;
										};

										PhotoBase.prototype.getData = function() {
										  return this._data;
										};

										/**
										* Функции-геттеры, используемые в сортировках/фильтрации
										*/
										PhotoBase.prototype.getLikes = function() {
										  return parseInt(this.getData().likes, 10);
										};

										PhotoBase.prototype.getComments = function() {
										  return parseInt(this.getData().comments, 10);
										};

										PhotoBase.prototype.getDate = function() {
										  return new Date(this.getData().date);
										};

										PhotoBase.prototype.getSrc = function() {
										  return this.getData().url;
										};



										/** Like dispatcher :) */
										PhotoBase.prototype.setLikes = function(likes) {
										  this._data.likes = likes;
										};

										PhotoBase.prototype.like = function() {
										  this.setLikes( this.getLikes() + 1 );
										  this._data.liked = true;
										};

										PhotoBase.prototype.dislike = function() {
										  this.setLikes( this.getLikes() - 1 );
										  this._data.liked = false;
										};

										PhotoBase.prototype.liked = function() {
										  return this._data.liked;
										};

										module.exports = PhotoBase;


									/***/ },
									/* 8 */
									/***/ function(module, exports, __webpack_require__) {

										'use strict';

										var PhotoPreview = __webpack_require__(9);
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

										module.exports = Gallery;


									/***/ },
									/* 9 */
									/***/ function(module, exports, __webpack_require__) {

										'use strict';

										var inherit = __webpack_require__(6);
										var PhotoBase = __webpack_require__(7);

										/**
										* @param {Object} data
										* @constructor
										* @extends {PhotoBase}
										*/
										function PhotoPreview() {
										}

										inherit(PhotoPreview, PhotoBase);

										PhotoPreview.prototype.render = function(el, noauto) {
										  el.querySelector('.likes-count').textContent = this.getLikes();
										  el.querySelector('.comments-count').textContent = this.getComments();
										  if ( this.liked() ) {
										    el.querySelector('.likes-count').classList.add('likes-count-liked');
										  } else {
										    el.querySelector('.likes-count').classList.remove('likes-count-liked');
										  }
										  if (this.mediatype === 'img') {
										    el.querySelector('.gallery-overlay-video').style.display = 'none';
										    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
										    el.querySelector('.gallery-overlay-image').src = this.getSrc();
										  } else if (this.mediatype === 'video') {
										    el.querySelector('.gallery-overlay-image').style.display = 'none';
										    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
										    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
										    el.querySelector('.gallery-overlay-video').src = this.getSrc();
										  }
										};

										PhotoPreview.prototype.remove = function() {
										  this.setData(null);
										};

										module.exports = PhotoPreview;


									/***/ },
									/* 10 */
									/***/ function(module, exports, __webpack_require__) {

										'use strict';

										var inherit = __webpack_require__(6);
										var Photo = __webpack_require__(5);

										/**
										* @param {Object} data
										* @constructor
										* @extends {Photo}
										*/
										function Video() {
										  this.mediatype = 'video';
										}
										inherit(Video, Photo);

										/**
										* Подгрузка изображения и создание картинки из шаблона
										*/
										Video.prototype.render = function() {
										  var template = document.getElementById('picture-template');
										  this.element = template.content.children[0].cloneNode(true);
										  this.element.querySelector('.picture-comments').textContent = this.getComments();
										  this.element.querySelector('.picture-likes').textContent = this.getLikes();

										  var videoElement = document.createElement('video');
										  videoElement.width = 182;
										  videoElement.height = 182;
										  videoElement.src = this.getSrc();
										  this.element.replaceChild(videoElement, this.element.firstElementChild);

										  this.element.addEventListener('click', this._onClick);
										  return this.element;
										};


										Video.prototype.onClick = null;

										Video.prototype._onClick = function(evt) {
										  evt.preventDefault();
										  if (typeof this.onClick === 'function') {
										    this.onClick();
										  }
										};

										module.exports = Video;


									/***/ },
									/* 11 */
									/***/ function(module, exports) {

										/******/ (function(modules) { // webpackBootstrap
										/******/ 	// The module cache
										/******/ 	var installedModules = {};

										/******/ 	// The require function
										/******/ 	function __webpack_require__(moduleId) {

										/******/ 		// Check if module is in cache
										/******/ 		if(installedModules[moduleId])
										/******/ 			return installedModules[moduleId].exports;

										/******/ 		// Create a new module (and put it into the cache)
										/******/ 		var module = installedModules[moduleId] = {
										/******/ 			exports: {},
										/******/ 			id: moduleId,
										/******/ 			loaded: false
										/******/ 		};

										/******/ 		// Execute the module function
										/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

										/******/ 		// Flag the module as loaded
										/******/ 		module.loaded = true;

										/******/ 		// Return the exports of the module
										/******/ 		return module.exports;
										/******/ 	}


										/******/ 	// expose the modules object (__webpack_modules__)
										/******/ 	__webpack_require__.m = modules;

										/******/ 	// expose the module cache
										/******/ 	__webpack_require__.c = installedModules;

										/******/ 	// __webpack_public_path__
										/******/ 	__webpack_require__.p = "";

										/******/ 	// Load entry module and return exports
										/******/ 	return __webpack_require__(0);
										/******/ })
										/************************************************************************/
										/******/ ([
										/* 0 */
										/***/ function(module, exports, __webpack_require__) {

											__webpack_require__(1);
											__webpack_require__(1);
											(function webpackMissingModule() { throw new Error("Cannot find module \"out/main.js\""); }());


										/***/ },
										/* 1 */
										/***/ function(module, exports, __webpack_require__) {

											'use strict';

											__webpack_require__(2);
											__webpack_require__(4);


										/***/ },
										/* 2 */
										/***/ function(module, exports, __webpack_require__) {

											/* global docCookies */
											'use strict';

											var Resizer = __webpack_require__(3);

											/**
											 * @fileoverview
											 * @author Igor Alexeenko (o0)
											 */

											(function() {
											  /** @enum {string} */
											  var FileType = {
											    'GIF': '',
											    'JPEG': '',
											    'PNG': '',
											    'SVG+XML': ''
											  };

											  /** @enum {number} */
											  var Action = {
											    ERROR: 0,
											    UPLOADING: 1,
											    CUSTOM: 2
											  };


											  /**
											   * Регулярное выражение, проверяющее тип загружаемого файла. Составляется
											   * из ключей FileType.
											   * @type {RegExp}
											   */
											  var fileRegExp = new RegExp('^image/(' + Object.keys(FileType).join('|').replace('\+', '\\+') + ')$', 'i');

											  /**
											   * @type {Object.<string, string>}
											   */
											  var filterMap;

											  /**
											   * Объект, который занимается кадрированием изображения.
											   * @type {Resizer}
											   */
											  var currentResizer;

											  /**
											   * Удаляет текущий объект {@link Resizer}, чтобы создать новый с другим
											   * изображением.
											   */
											  function cleanupResizer() {
											    if (currentResizer) {
											      currentResizer.remove();
											      currentResizer = null;
											    }
											  }

											  /**
											   * Ставит одну из трех случайных картинок на фон формы загрузки.
											   */
											  function updateBackground() {
											    var images = [
											      'img/logo-background-1.jpg',
											      'img/logo-background-2.jpg',
											      'img/logo-background-3.jpg'
											    ];

											    var backgroundElement = document.querySelector('.upload');
											    var randomImageNumber = Math.round(Math.random() * (images.length - 1));
											    backgroundElement.style.backgroundImage = 'url(' + images[randomImageNumber] + ')';
											  }

											  /**
											   * Проверяет, валидны ли данные, в форме кадрирования.
											   * @return {boolean}
											   */
											  function resizeFormIsValid() {
											    var resizeXField = +document.getElementById('resize-x').value;
											    var resizeYField = +document.getElementById('resize-y').value;
											    var resizeSizeField = +document.getElementById('resize-size').value;
											    var resizeBtn = document.getElementById('resize-fwd');

											    if (resizeXField + resizeSizeField > currentResizer._image.naturalWidth ||
											        resizeYField + resizeSizeField > currentResizer._image.naturalHeight) {
											      resizeBtn.disabled = true;
											    } else {
											      resizeBtn.disabled = false;
											    }

											    return resizeXField < 0 || resizeYField < 0 ? false : true;
											  }

											  /**
											   * Форма загрузки изображения.
											   * @type {HTMLFormElement}
											   */
											  var uploadForm = document.forms['upload-select-image'];

											  /**
											   * Форма кадрирования изображения.
											   * @type {HTMLFormElement}
											   */
											  var resizeForm = document.forms['upload-resize'];

											  /**
											   * Форма добавления фильтра.
											   * @type {HTMLFormElement}
											   */
											  var filterForm = document.forms['upload-filter'];

											  /**
											   * @type {HTMLImageElement}
											   */
											  var filterImage = filterForm.querySelector('.filter-image-preview');

											  /**
											   * @type {HTMLElement}
											   */
											  var uploadMessage = document.querySelector('.upload-message');

											  /**
											   * @param {Action} action
											   * @param {string=} message
											   * @return {Element}
											   */
											  function showMessage(action, message) {
											    var isError = false;

											    switch (action) {
											      case Action.UPLOADING:
											        message = message || 'Кексограмим&hellip;';
											        break;

											      case Action.ERROR:
											        isError = true;
											        message = message || 'Неподдерживаемый формат файла<br> <a href="' + document.location + '">Попробовать еще раз</a>.';
											        break;
											    }

											    uploadMessage.querySelector('.upload-message-container').innerHTML = message;
											    uploadMessage.classList.remove('invisible');
											    uploadMessage.classList.toggle('upload-message-error', isError);
											    return uploadMessage;
											  }

											  function hideMessage() {
											    uploadMessage.classList.add('invisible');
											  }

											  function setFilter(filterName) {
											    if (!filterMap) {
											      // Ленивая инициализация. Объект не создается до тех пор, пока
											      // не понадобится прочитать его в первый раз, а после этого запоминается
											      // навсегда.
											      filterMap = {
											        'none': 'filter-none',
											        'chrome': 'filter-chrome',
											        'sepia': 'filter-sepia'
											      };
											    }

											    // подсвечиваем выбранный фильтр
											    document.getElementById('upload-filter-' + filterName).checked = true;

											    // Класс перезаписывается, а не обновляется через classList потому что нужно
											    // убрать предыдущий примененный класс. Для этого нужно или запоминать его
											    // состояние или просто перезаписывать.
											    filterImage.className = 'filter-image-preview ' + filterMap[filterName];

											    // сохраняем в кукис
											    var closestDoB = new Date('2015-07-12');
											    var dateToExpire = new Date(
											      Date.now() + (Date.now() - closestDoB)
											    ).toUTCString();

											    docCookies.setItem('filter', filterName, dateToExpire);
											  }

											  /**
											   * Функция синхронизации ресайзера и формы
											   */
											  function syncResizer() {
											    if (currentResizer) {
											      var constraints = currentResizer.getConstraint();
											      document.getElementById('resize-x').value = constraints.x;
											      document.getElementById('resize-y').value = constraints.y;
											      document.getElementById('resize-size').value = constraints.side;
											    }
											  }

											  /**
											   * Обработчик изменения изображения в форме загрузки. Если загруженный
											   * файл является изображением, считывается исходник картинки, создается
											   * Resizer с загруженной картинкой, добавляется в форму кадрирования
											   * и показывается форма кадрирования.
											   * @param {Event} evt
											   */
											  uploadForm.addEventListener('change', function(evt) {
											    var element = evt.target;
											    if (element.id === 'upload-file') {
											      // Проверка типа загружаемого файла, тип должен быть изображением
											      // одного из форматов: JPEG, PNG, GIF или SVG.
											      if (fileRegExp.test(element.files[0].type)) {
											        var fileReader = new FileReader();

											        showMessage(Action.UPLOADING);

											        fileReader.onload = function() {
											          cleanupResizer();

											          currentResizer = new Resizer(fileReader.result);
											          currentResizer.setElement(resizeForm);
											          uploadMessage.classList.add('invisible');

											          uploadForm.classList.add('invisible');
											          resizeForm.classList.remove('invisible');

											          hideMessage();
											          setTimeout(syncResizer, 10);
											        };

											        fileReader.readAsDataURL(element.files[0]);
											      } else {
											        // Показ сообщения об ошибке, если загружаемый файл, не является
											        // поддерживаемым изображением.
											        showMessage(Action.ERROR);
											      }
											    }
											  });

											  /**
											   * Обработка изменения формы кадрирования. Делает кнопку submit enabled/disabled.
											   * @param {Event} evt
											   */
											  resizeForm.addEventListener('change', function(evt) {
											    // вынес в отдельные переменные для лучшей читаемости
											    resizeFormIsValid();
											    // получаем текущие координаты ресайзера
											    var constraints = currentResizer.getConstraint();

											    var changedElement = evt.target;
											    var newVal = +changedElement.value;

											    // двигаем ресайзер в зависимости от того, какое поле поменялось
											    switch (changedElement.name) {
											      case 'x': currentResizer.moveConstraint(newVal - constraints.x);
											        break;
											      case 'y': currentResizer.moveConstraint(false, newVal - constraints.y);
											        break;
											      case 'size': currentResizer.setConstraint(constraints.x, constraints.y, newVal);
											        break;
											    }
											  });

											  /**
											   * Обработка сброса формы кадрирования. Возвращает в начальное состояние
											   * и обновляет фон.
											   * @param {Event} evt
											   */
											  resizeForm.addEventListener('reset', function(evt) {
											    evt.preventDefault();

											    cleanupResizer();
											    updateBackground();

											    resizeForm.classList.add('invisible');
											    uploadForm.classList.remove('invisible');
											  });

											  /**
											   * Обработка отправки формы кадрирования. Если форма валидна, экспортирует
											   * кропнутое изображение в форму добавления фильтра и показывает ее.
											   * @param {Event} evt
											   */
											  resizeForm.addEventListener('submit', function(evt) {
											    evt.preventDefault();

											    if (resizeFormIsValid()) {
											      filterImage.src = currentResizer.exportImage().src;

											      resizeForm.classList.add('invisible');
											      filterForm.classList.remove('invisible');
											    }
											  });

											  /**
											   * Сброс формы фильтра. Показывает форму кадрирования.
											   * @param {Event} evt
											   */
											  filterForm.addEventListener('reset', function(evt) {
											    evt.preventDefault();

											    filterForm.classList.add('invisible');
											    resizeForm.classList.remove('invisible');
											  });

											  /**
											   * Отправка формы фильтра. Возвращает в начальное состояние, предварительно
											   * записав сохраненный фильтр в cookie.
											   * @param {Event} evt
											   */
											  filterForm.addEventListener('submit', function(evt) {
											    evt.preventDefault();

											    cleanupResizer();
											    updateBackground();

											    filterForm.classList.add('invisible');
											    uploadForm.classList.remove('invisible');
											  });

											  /**
											   * Обработчик изменения фильтра. Добавляет класс из filterMap соответствующий
											   * выбранному значению в форме.
											   */
											  filterForm.addEventListener('change', function() {
											    var selectedFilter = [].filter.call(filterForm['upload-filter'], function(item) {
											      return item.checked;
											    })[0].value;
											    setFilter(selectedFilter);
											  });

											  cleanupResizer();
											  updateBackground();
											  // выставляем фильтр, если находим его в кукисах
											  if (docCookies.getItem('filter') === null) {
											    setFilter('none');
											  } else {
											    setFilter( docCookies.getItem('filter') );
											  }

											  window.addEventListener('resizerchange', syncResizer);


											})();


										/***/ },
										/* 3 */
										/***/ function(module, exports) {

											'use strict';

											/**
											 * @constructor
											 * @param {string} image
											 */
											var Resizer = function(image) {
											  // Изображение, с которым будет вестись работа.
											  this._image = new Image();
											  this._image.src = image;

											  // Холст.
											  this._container = document.createElement('canvas');
											  this._ctx = this._container.getContext('2d');

											  // Создаем холст только после загрузки изображения.
											  this._image.onload = function() {
											    // Размер холста равен размеру загруженного изображения. Это нужно
											    // для удобства работы с координатами.
											    this._container.width = this._image.naturalWidth;
											    this._container.height = this._image.naturalHeight;

											    /**
											     * Предлагаемый размер кадра в виде коэффициента относительно меньшей
											     * стороны изображения.
											     * @const
											     * @type {number}
											     */
											    var INITIAL_SIDE_RATIO = 0.75;
											    // Размер меньшей стороны изображения.
											    var side = Math.min(
											        this._container.width * INITIAL_SIDE_RATIO,
											        this._container.height * INITIAL_SIDE_RATIO);

											    // Изначально предлагаемое кадрирование — часть по центру с размером в 3/4
											    // от размера меньшей стороны.
											    this._resizeConstraint = new Square(
											        this._container.width / 2 - side / 2,
											        this._container.height / 2 - side / 2,
											        side);

											    // Отрисовка изначального состояния канваса.
											    this.redraw();
											  }.bind(this);

											  // Фиксирование контекста обработчиков.
											  this._onDragStart = this._onDragStart.bind(this);
											  this._onDragEnd = this._onDragEnd.bind(this);
											  this._onDrag = this._onDrag.bind(this);
											};

											Resizer.prototype = {
											  /**
											   * Родительский элемент канваса.
											   * @type {Element}
											   * @private
											   */
											  _element: null,

											  /**
											   * Положение курсора в момент перетаскивания. От положения курсора
											   * рассчитывается смещение на которое нужно переместить изображение
											   * за каждую итерацию перетаскивания.
											   * @type {Coordinate}
											   * @private
											   */
											  _cursorPosition: null,

											  /**
											   * Объект, хранящий итоговое кадрирование: сторона квадрата и смещение
											   * от верхнего левого угла исходного изображения.
											   * @type {Square}
											   * @private
											   */
											  _resizeConstraint: null,

											  /**
											   * Отрисовка канваса.
											   */
											  redraw: function() {
											    // Очистка изображения.
											    this._ctx.clearRect(0, 0, this._container.width, this._container.height);

											    // Параметры линии.
											    // NB! Такие параметры сохраняются на время всего процесса отрисовки
											    // canvas'a поэтому важно вовремя поменять их, если нужно начать отрисовку
											    // чего-либо с другой обводкой.

											    // Толщина линии.
											    this._ctx.lineWidth = 6;
											    // Цвет обводки.
											    this._ctx.strokeStyle = '#ffe753';

											    // Сохранение состояния канваса.
											    // Подробней см. строку 132.
											    this._ctx.save();

											    // Установка начальной точки системы координат в центр холста.
											    this._ctx.translate(this._container.width / 2, this._container.height / 2);

											    var displX = -(this._resizeConstraint.x + this._resizeConstraint.side / 2);
											    var displY = -(this._resizeConstraint.y + this._resizeConstraint.side / 2);
											    // Отрисовка изображения на холсте. Параметры задают изображение, которое
											    // нужно отрисовать и координаты его верхнего левого угла.
											    // Координаты задаются от центра холста.

											    this._ctx.drawImage(this._image, displX, displY);

											    // координаты левого верхнего и правого нижнего угла зиг-заг прямоугольника
											    // взяты из начального кода отрисовки рамки
											    var x0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
											    var y0 = (-this._resizeConstraint.side / 2) - this._ctx.lineWidth / 2;
											    var x1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;
											    var y1 = this._resizeConstraint.side / 2 - this._ctx.lineWidth / 2;

											    // ставим прозрачность 0.8
											    this._ctx.fillStyle = 'rgba(0,0,0,0.8)';
											    this._ctx.beginPath();

											    // рисуем зиг-заг прямоугольник
											    zigzagRect(this._ctx, x0, y0, x1, y1);

											    // после этого обводим рамку по внешнему периметру
											    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
											    this._ctx.lineTo(0 - this._container.width / 2, this._container.height / 2);
											    this._ctx.lineTo(this._container.width / 2, this._container.height / 2);
											    this._ctx.lineTo(this._container.width / 2, 0 - this._container.height / 2);
											    this._ctx.lineTo(0 - this._container.width / 2, 0 - this._container.height / 2);
											    // заливаем получившуюся фигуру
											    this._ctx.fill();

											    // рисуем центрированный текст
											    var sizeMessage = (this._image.naturalWidth + ' x ' + this._image.naturalHeight);
											    this._ctx.fillStyle = '#FFF';
											    this._ctx.textAlign = 'center';
											    this._ctx.textBaseline = 'bottom';
											    this._ctx.font = 'normal 30px Arial';
											    this._ctx.fillText(sizeMessage, x0 + (x1 - x0) / 2, y0);

											    // Восстановление состояния канваса, которое было до вызова ctx.save
											    // и последующего изменения системы координат. Нужно для того, чтобы
											    // следующий кадр рисовался с привычной системой координат, где точка
											    // 0 0 находится в левом верхнем углу холста, в противном случае
											    // некорректно сработает даже очистка холста или нужно будет использовать
											    // сложные рассчеты для координат прямоугольника, который нужно очистить.
											    this._ctx.restore();
											  },

											  /**
											   * Включение режима перемещения. Запоминается текущее положение курсора,
											   * устанавливается флаг, разрешающий перемещение и добавляются обработчики,
											   * позволяющие перерисовывать изображение по мере перетаскивания.
											   * @param {number} x
											   * @param {number} y
											   * @private
											   */
											  _enterDragMode: function(x, y) {
											    this._cursorPosition = new Coordinate(x, y);
											    document.body.addEventListener('mousemove', this._onDrag);
											    document.body.addEventListener('mouseup', this._onDragEnd);
											  },

											  /**
											   * Выключение режима перемещения.
											   * @private
											   */
											  _exitDragMode: function() {
											    this._cursorPosition = null;
											    document.body.removeEventListener('mousemove', this._onDrag);
											    document.body.removeEventListener('mouseup', this._onDragEnd);
											  },

											  /**
											   * Перемещение изображения относительно кадра.
											   * @param {number} x
											   * @param {number} y
											   * @private
											   */
											  updatePosition: function(x, y) {
											    this.moveConstraint(
											        this._cursorPosition.x - x,
											        this._cursorPosition.y - y);
											    this._cursorPosition = new Coordinate(x, y);
											  },

											  /**
											   * @param {MouseEvent} evt
											   * @private
											   */
											  _onDragStart: function(evt) {
											    this._enterDragMode(evt.clientX, evt.clientY);
											  },

											  /**
											   * Обработчик окончания перетаскивания.
											   * @private
											   */
											  _onDragEnd: function() {
											    this._exitDragMode();
											  },

											  /**
											   * Обработчик события перетаскивания.
											   * @param {MouseEvent} evt
											   * @private
											   */
											  _onDrag: function(evt) {
											    this.updatePosition(evt.clientX, evt.clientY);
											  },

											  /**
											   * Добавление элемента в DOM.
											   * @param {Element} element
											   */
											  setElement: function(element) {
											    if (this._element === element) {
											      return;
											    }

											    this._element = element;
											    this._element.insertBefore(this._container, this._element.firstChild);
											    // Обработчики начала и конца перетаскивания.
											    this._container.addEventListener('mousedown', this._onDragStart);
											  },

											  /**
											   * Возвращает кадрирование элемента.
											   * @return {Square}
											   */
											  getConstraint: function() {
											    return this._resizeConstraint;
											  },

											  /**
											   * Смещает кадрирование на значение указанное в параметрах.
											   * @param {number} deltaX
											   * @param {number} deltaY
											   * @param {number} deltaSide
											   */
											  moveConstraint: function(deltaX, deltaY, deltaSide) {
											    this.setConstraint(
											        this._resizeConstraint.x + (deltaX || 0),
											        this._resizeConstraint.y + (deltaY || 0),
											        this._resizeConstraint.side + (deltaSide || 0));
											  },

											  /**
											   * @param {number} x
											   * @param {number} y
											   * @param {number} side
											   */
											  setConstraint: function(x, y, side) {
											    if (typeof x !== 'undefined') {
											      this._resizeConstraint.x = x;
											    }

											    if (typeof y !== 'undefined') {
											      this._resizeConstraint.y = y;
											    }

											    if (typeof side !== 'undefined') {
											      this._resizeConstraint.side = side;
											    }

											    requestAnimationFrame(function() {
											      this.redraw();
											      window.dispatchEvent(new CustomEvent('resizerchange'));
											    }.bind(this));
											  },

											  /**
											   * Удаление. Убирает контейнер из родительского элемента, убирает
											   * все обработчики событий и убирает ссылки.
											   */
											  remove: function() {
											    this._element.removeChild(this._container);

											    this._container.removeEventListener('mousedown', this._onDragStart);
											    this._container = null;
											  },

											  /**
											   * Экспорт обрезанного изображения как HTMLImageElement и исходником
											   * картинки в src в формате dataURL.
											   * @return {Image}
											   */
											  exportImage: function() {
											    // Создаем Image, с размерами, указанными при кадрировании.
											    var imageToExport = new Image();

											    // Создается новый canvas, по размерам совпадающий с кадрированным
											    // изображением, в него добавляется изображение взятое из канваса
											    // с измененными координатами и сохраняется в dataURL, с помощью метода
											    // toDataURL. Полученный исходный код, записывается в src у ранее
											    // созданного изображения.
											    var temporaryCanvas = document.createElement('canvas');
											    var temporaryCtx = temporaryCanvas.getContext('2d');
											    temporaryCanvas.width = this._resizeConstraint.side;
											    temporaryCanvas.height = this._resizeConstraint.side;
											    temporaryCtx.drawImage(this._image,
											        -this._resizeConstraint.x,
											        -this._resizeConstraint.y);
											    imageToExport.src = temporaryCanvas.toDataURL('image/png');

											    return imageToExport;
											  }
											};

											/**
											 * Вспомогательный тип, описывающий квадрат.
											 * @constructor
											 * @param {number} x
											 * @param {number} y
											 * @param {number} side
											 * @private
											 */
											var Square = function(x, y, side) {
											  this.x = x;
											  this.y = y;
											  this.side = side;
											};

											/**
											 * Вспомогательный тип, описывающий координату.
											 * @constructor
											 * @param {number} x
											 * @param {number} y
											 * @private
											 */
											var Coordinate = function(x, y) {
											  this.x = x;
											  this.y = y;
											};

											var zigzagRect = function(ctx, x0, y0, x1, y1) {
											  var xStart = x0;
											  var yStart = y0;

											  ctx.fillColor = 'black';
											  ctx.moveTo(x0, y0);
											  ctx.beginPath();
											  // длина зиг-заг линии
											  var line = 5;

											  var step = 0;

											  // слева направо - двигаемся по ox
											  while (x0 < x1) {
											    if (step % 2 === 0) {
											      x0 = x0 + line;
											      y0 = y0 + Math.abs(line);
											      ctx.lineTo(x0, y0);
											    } else {
											      x0 = x0 + line;
											      y0 = y0 - Math.abs(line);
											      ctx.lineTo(x0, y0);
											    }
											    step++;
											  }

											  // потом вниз  - двигаемся по oy
											  while (y0 < y1) {
											    if (step % 2 === 0) {
											      x0 = x0 + Math.abs(line);
											      y0 = y0 + line;
											      ctx.lineTo(x0, y0);
											    } else {
											      x0 = x0 - Math.abs(line);
											      y0 = y0 + line;
											      ctx.lineTo(x0, y0);
											    }
											    step++;
											  }

											  line = line * -1;
											  // налево
											  while (x0 > xStart) {
											    if (step % 2 === 0) {
											      x0 = x0 + line;
											      y0 = y0 + Math.abs(line);
											      ctx.lineTo(x0, y0);
											    } else {
											      x0 = x0 + line;
											      y0 = y0 - Math.abs(line);
											      ctx.lineTo(x0, y0);
											    }
											    step++;
											  }

											  // замыкаем вверх
											  while (y0 + line > yStart ) {
											    if (step % 2 === 0) {
											      x0 = x0 + Math.abs(line);
											      y0 = y0 + line;
											      ctx.lineTo(x0, y0);
											    } else {
											      x0 = x0 - Math.abs(line);
											      y0 = y0 + line;
											      ctx.lineTo(x0, y0);
											    }
											    step++;
											  }
											  ctx.stroke();
											};

											module.exports = Resizer;


										/***/ },
										/* 4 */
										/***/ function(module, exports, __webpack_require__) {

											'use strict';

											var Photo = __webpack_require__(5);
											var Gallery = __webpack_require__(8);
											var Video = __webpack_require__(10);

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

											})();


										/***/ },
										/* 5 */
										/***/ function(module, exports, __webpack_require__) {

											'use strict';

											var inherit = __webpack_require__(6);
											var PhotoBase = __webpack_require__(7);

											/**
											* @param {Object} data
											* @constructor
											* @extends {PhotoBase}
											*/
											function Photo() {
											  this.mediatype = 'img';
											}
											inherit(Photo, PhotoBase);

											/**
											* Подгрузка изображения и создание картинки из шаблона
											*/
											Photo.prototype.render = function() {
											  var template = document.getElementById('picture-template');
											  this.element = template.content.children[0].cloneNode(true);
											  this.element.querySelector('.picture-comments').textContent = this.getComments();
											  this.element.querySelector('.picture-likes').textContent = this.getLikes();

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
											  picImage.src = this.getSrc();

											  this.element.addEventListener('click', this._onClick);
											  return this.element;
											};

											Photo.prototype.remove = function() {
											  this.element.removeEventListener('click', this._onClick);
											};

											Photo.prototype.updateLikes = function() {
											  this.element.querySelector('.picture-likes').textContent = this.getLikes();
											};

											Photo.prototype.onClick = null;

											Photo.prototype._onClick = function(evt) {
											  evt.preventDefault();
											  if ( !this.classList.contains('picture-load-failure') ) {
											    if (typeof this.onClick === 'function') {
											      this.onClick();
											    }
											  }
											};

											module.exports = Photo;


										/***/ },
										/* 6 */
										/***/ function(module, exports) {

											'use strict';
											function inherit(Child, Parent) {
											  var TempConstructor = function() {};
											  TempConstructor.prototype = Parent.prototype;
											  Child.prototype = new TempConstructor();
											  Child.prototype.constructor = Child;
											}
											module.exports = inherit;


										/***/ },
										/* 7 */
										/***/ function(module, exports) {

											'use strict';

											/**
											* @param {Object} data
											* @constructor
											*/
											function PhotoBase(data) {
											  this.setData(data);
											}

											PhotoBase.prototype._data = null;
											PhotoBase.prototype.mediatype = null;

											PhotoBase.prototype.setData = function(data) {
											  this._data = data;
											  if (this._data.hasOwnProperty('url') && this._data.url.search(/mp4/) < 0) {
											    this.mediatype = 'img';
											  } else {
											    this.mediatype = 'video';
											  }
											  this._data.liked = data.liked ? true : false;
											};

											PhotoBase.prototype.getData = function() {
											  return this._data;
											};

											/**
											* Функции-геттеры, используемые в сортировках/фильтрации
											*/
											PhotoBase.prototype.getLikes = function() {
											  return parseInt(this.getData().likes, 10);
											};

											PhotoBase.prototype.getComments = function() {
											  return parseInt(this.getData().comments, 10);
											};

											PhotoBase.prototype.getDate = function() {
											  return new Date(this.getData().date);
											};

											PhotoBase.prototype.getSrc = function() {
											  return this.getData().url;
											};



											/** Like dispatcher :) */
											PhotoBase.prototype.setLikes = function(likes) {
											  this._data.likes = likes;
											};

											PhotoBase.prototype.like = function() {
											  this.setLikes( this.getLikes() + 1 );
											  this._data.liked = true;
											};

											PhotoBase.prototype.dislike = function() {
											  this.setLikes( this.getLikes() - 1 );
											  this._data.liked = false;
											};

											PhotoBase.prototype.liked = function() {
											  return this._data.liked;
											};

											module.exports = PhotoBase;


										/***/ },
										/* 8 */
										/***/ function(module, exports, __webpack_require__) {

											'use strict';

											var PhotoPreview = __webpack_require__(9);
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

											module.exports = Gallery;


										/***/ },
										/* 9 */
										/***/ function(module, exports, __webpack_require__) {

											'use strict';

											var inherit = __webpack_require__(6);
											var PhotoBase = __webpack_require__(7);

											/**
											* @param {Object} data
											* @constructor
											* @extends {PhotoBase}
											*/
											function PhotoPreview() {
											}

											inherit(PhotoPreview, PhotoBase);

											PhotoPreview.prototype.render = function(el, noauto) {
											  el.querySelector('.likes-count').textContent = this.getLikes();
											  el.querySelector('.comments-count').textContent = this.getComments();
											  if ( this.liked() ) {
											    el.querySelector('.likes-count').classList.add('likes-count-liked');
											  } else {
											    el.querySelector('.likes-count').classList.remove('likes-count-liked');
											  }
											  if (this.mediatype === 'img') {
											    el.querySelector('.gallery-overlay-video').style.display = 'none';
											    el.querySelector('.gallery-overlay-image').style.display = 'inline-block';
											    el.querySelector('.gallery-overlay-image').src = this.getSrc();
											  } else if (this.mediatype === 'video') {
											    el.querySelector('.gallery-overlay-image').style.display = 'none';
											    el.querySelector('.gallery-overlay-video').style.display = 'inline-block';
											    el.querySelector('.gallery-overlay-video').autoplay = noauto ? false : true;
											    el.querySelector('.gallery-overlay-video').src = this.getSrc();
											  }
											};

											PhotoPreview.prototype.remove = function() {
											  this.setData(null);
											};

											module.exports = PhotoPreview;


										/***/ },
										/* 10 */
										/***/ function(module, exports, __webpack_require__) {

											'use strict';

											var inherit = __webpack_require__(6);
											var Photo = __webpack_require__(5);

											/**
											* @param {Object} data
											* @constructor
											* @extends {Photo}
											*/
											function Video() {
											  this.mediatype = 'video';
											}
											inherit(Video, Photo);

											/**
											* Подгрузка изображения и создание картинки из шаблона
											*/
											Video.prototype.render = function() {
											  var template = document.getElementById('picture-template');
											  this.element = template.content.children[0].cloneNode(true);
											  this.element.querySelector('.picture-comments').textContent = this.getComments();
											  this.element.querySelector('.picture-likes').textContent = this.getLikes();

											  var videoElement = document.createElement('video');
											  videoElement.width = 182;
											  videoElement.height = 182;
											  videoElement.src = this.getSrc();
											  this.element.replaceChild(videoElement, this.element.firstElementChild);

											  this.element.addEventListener('click', this._onClick);
											  return this.element;
											};


											Video.prototype.onClick = null;

											Video.prototype._onClick = function(evt) {
											  evt.preventDefault();
											  if (typeof this.onClick === 'function') {
											    this.onClick();
											  }
											};

											module.exports = Video;


										/***/ }
										/******/ ]);

									/***/ }
									/******/ ]);

								/***/ }
								/******/ ]);

							/***/ }
							/******/ ]);

						/***/ }
						/******/ ]);

					/***/ }
					/******/ ]);

				/***/ }
				/******/ ]);

			/***/ }
			/******/ ]);

		/***/ }
		/******/ ]);

	/***/ }
	/******/ ]);

/***/ }
/******/ ]);