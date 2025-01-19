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
    literal = getInputByName("literal");
    literal.addEventListener("input", input);
}
function dragStart(_event) {
    let value = _event.target.value;
    let converted = convert(value);
    if (typeof (converted) == "undefined")
        _event.preventDefault();
    _event.dataTransfer.setData("value", value);
    _event.dataTransfer.setData("type", typeof (converted));
}
function dragOver(_event) {
    _event.preventDefault();
}
function drop(_event) {
    let value = _event.dataTransfer.getData("value");
    let target = _event.target;
    target.value = value;
    change();
}
function input(_event) {
    let type = typeof (convert(literal.value));
    getInputByName("type", literal.parentElement).value = type;
    if (literal.value != "" && type == "undefined")
        literal.setCustomValidity("unkown type");
    else
        literal.setCustomValidity("");
}
function change(_event) {
    validateVariables();
    operate();
}
function operate() {
    let left = convert(getInputByName("left").value);
    let right = convert(getInputByName("right").value);
    let operator = document.querySelector("select[name=operator]").value;
    let output = getInputByName("result");
    let results = {
        //@ts-ignore
        "+": left + right, "-": left - right, "*": left * right, "/": left / right, "%": left % right
    };
    let result = results[operator];
    if (typeof (result) == "string")
        result = '"' + result + '"';
    output.value = String(result);
}
function getInputByName(_name, _from = null) {
    return (_from ? _from : document).querySelector(`input[name=${_name}]`);
}
function validateVariables() {
    let variables = [...document.querySelectorAll("fieldset#variables div")];
    for (let variable of variables) {
        let name = getInputByName("name", variable);
        let value = getInputByName("value", variable);
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
function convert(_value) {
    try {
        let parsed = JSON.parse(_value);
        return parsed;
    }
    catch (_e) {
        return undefined;
    }
    // if (_value == "true" || _value == "false")
    //   return "boolean"
    // if (Number(_value).toString() === _value)
    //   return "number"
    // let first: string = _value[0]
    // let last: string = _value[_value.length - 1]
    // let content: string = _value.slice(1, _value.length - 2)
    // if (first == last)
    //   if (first == "'" || first == '"')
    //     if (content.indexOf(first) == -1)
    //       if (String(content).toString() === content)
    //         return "string"
    // return ""
}
