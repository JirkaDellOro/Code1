"use strict";
window.addEventListener("load", start);
window.addEventListener("dragstart", dragStart);
window.addEventListener("drop", drop);
window.addEventListener("change", change);
let dropTargets;
let dragSources;
function start() {
    dragSources = [...document.querySelectorAll(".drag")];
    dropTargets = [...document.querySelectorAll(".drop")];
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
    let target = _event.target;
    target.value = value;
}
function change(_event) {
    let variables = [...document.querySelectorAll("fieldset#variables div")];
    for (let variable of variables) {
        let name = variable.querySelector("input[name=name]");
        let value = variable.querySelector("input[name=value]");
        let type = variable.querySelector("select");
        if (name.value && type.value) {
            name.disabled = true;
            type.disabled = true;
            value.disabled = false;
            value.classList.add("drop");
            value.classList.add("drag");
            value.addEventListener("dragover", dragOver);
            dragSources.push(value);
            dropTargets.push(value);
        }
    }
}
