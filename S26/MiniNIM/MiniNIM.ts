let z0: number = parseInt(prompt("Input the number of lit lamps in row 0", "4")!);
let z1: number = parseInt(prompt("Input the number of lit lamps in row 1", "7")!);
let z2: number = parseInt(prompt("Input the number of lit lamps in row 2", "5")!);
let z3: number = parseInt(prompt("Input the number of lit lamps in row 3", "3")!);

let win: number = calculateWin(z0, z1, z2, z3);
console.log(win);
alert("The indicator for a winning condition is: " + win);

function calculateWin(_z0: number, _z1: number, _z2: number, _z3: number): number {
  let result: number = _z0 ^ _z1 ^ _z2 ^ _z3;
  return result;
}

