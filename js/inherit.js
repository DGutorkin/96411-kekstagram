'use strict';
window.inherit = function(Child, Parent) {
  var TempConstructor = function() {};
  TempConstructor.prototype = Parent.prototype;
  Child.prototype = new TempConstructor();
  Child.prototype.constructor = Child;
};
