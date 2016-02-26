'use strict';
(function() {
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

  window.PhotoBase = PhotoBase;
})();
