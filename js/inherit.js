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
