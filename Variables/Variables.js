"use strict";
window.addEventListener("load", start);
window.addEventListener("dragstart", dragStart);
window.addEventListener("drop", drop);
window.addEventListener("change", change);
let dropTargets;
let dragSources;
let literal;
function start() {
    dragSources = [...document.querySelectorAll(".drag")];
    dropTargets = [...document.querySelectorAll(".drop")];
    for (let dragSource of dragSources)
        dragSource.draggable = true;
    for (let dropTarget of dropTargets)
        dropTarget.addEventListener("dragover", dragOver);
    literal = document.querySelector("input[name=literal]");
    literal.addEventListener("input", input);
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
function input(_event) {
    var _a;
    let type = infer(literal.value);
    ((_a = literal.parentElement) === null || _a === void 0 ? void 0 : _a.querySelector("input[name=type]")).value = type;
    if (literal.value != "" && type == "")
        literal.setCustomValidity("unkown type");
    else
        literal.setCustomValidity("");
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
function infer(_value) {
    if (_value == "true" || _value == "false")
        return "boolean";
    if (Number(_value).toString() === _value)
        return "number";
    let first = _value[0];
    let last = _value[_value.length - 1];
    let content = _value.slice(1, _value.length - 2);
    if (first == last)
        if (first == "'" || first == '"')
            if (content.indexOf(first) == -1)
                if (String(content).toString() === content)
                    return "string";
    return "";
}
