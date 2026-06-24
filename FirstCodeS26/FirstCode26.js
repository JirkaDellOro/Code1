"use strict";
let z0 = parseInt(prompt("Input the number of lit lamps in row 0", "4"));
let z1 = parseInt(prompt("Input the number of lit lamps in row 1", "7"));
let z2 = parseInt(prompt("Input the number of lit lamps in row 2", "5"));
let z3 = parseInt(prompt("Input the number of lit lamps in row 3", "3"));
let win = calculateWin(z0, z1, z2, z3);
console.log(win);
alert("The indicator for a winning condition is: " + win);
function calculateWin(_z0, _z1, _z2, _z3) {
    let result = _z0 ^ _z1 ^ _z2 ^ _z3;
    return result;
}
//# sourceMappingURL=FirstCode26.js.map