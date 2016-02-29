'use strict';
function inherit(Child, Parent) {
  var TempConstructor = function() {};
  TempConstructor.prototype = Parent.prototype;
  Child.prototype = new TempConstructor();
  Child.prototype.constructor = Child;
}
module.exports = inherit;
