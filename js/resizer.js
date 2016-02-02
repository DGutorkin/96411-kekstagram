'use strict';

(function() {
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

  window.Resizer = Resizer;
})();
