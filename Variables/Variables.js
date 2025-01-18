"use strict";
window.addEventListener("load", start);
window.addEventListener("dragstart", dragStart);
window.addEventListener("drop", drop);
let dropTargets;
let dragSources;
function start() {
    dragSources = document.querySelectorAll(".drag");
    dropTargets = document.querySelectorAll(".drop");
    for (let dragSource of dragSources)
        dragSource.draggable = true;
    for (let dropTarget of dropTargets)
        dropTarget.addEventListener("dragover", dragOver);
}
function dragStart(_event) {
    let value = _event.target.value;
    _event.dataTransfer.setData("value", value);
}
function dragOver(_event) {
    _event.preventDefault();
}
function drop(_event) {
    let value = _event.dataTransfer.getData("value");
    _event.target.value = value;
}
