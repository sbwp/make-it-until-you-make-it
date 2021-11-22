"use strict";
var Foo;
(function (Foo) {
    class Bar {
        constructor() {
            this.x = 5;
        }
    }
    Foo.Bar = Bar;
})(Foo || (Foo = {}));
