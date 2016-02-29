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
