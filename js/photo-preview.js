'use strict';

var inherit = require('inherit');
var PhotoBase = require('photo-base');

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
