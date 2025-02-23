"use strict";
window.addEventListener("load", start);
window.addEventListener("dragstart", dragStart);
window.addEventListener("drop", drop);
window.addEventListener("change", change);
let dropTargets;
let dragSources;
let literal;
let variables;
function start() {
    dragSources = [...document.querySelectorAll(".drag")];
    dropTargets = [...document.querySelectorAll(".drop")];
    for (let dragSource of dragSources)
        dragSource.draggable = true;
    for (let dropTarget of dropTargets)
        dropTarget.addEventListener("dragover", dragOver);
    literal = getInputByName("literal");
    literal.addEventListener("input", input);
    variables = document.querySelector("fieldset#variables");
    variables.addEventListener("pointerdown", clickVariable);
    parseQuery();
}
function parseQuery() {
    let query = location.search.slice(1);
    let variables = query.split("|");
    for (let variable of variables) {
        let quotes = variable.split(",").map(_value => '"' + _value + '"');
        variable = "[" + quotes.join(",") + "]";
        let parsed = JSON.parse(variable);
        if (parsed[1] == "string")
            parsed[2] = '"' + parsed[2] + '"';
        let div = addVariable();
        getInputByName("name", div).value = parsed[0];
        div.querySelector("select").value = parsed[1];
        getInputByName("value", div).value = parsed[2];
    }
    validateVariables();
}
function clickVariable(_event) {
    if (_event.target != _event.currentTarget)
        return;
    addVariable();
}
function addVariable() {
    let template = document.querySelector("template");
    let clone = template.content.cloneNode(true); // Clone the fragment
    let div = clone.querySelector("div"); // Ensure you're selecting the correct element
    variables.appendChild(clone); // Append the fragment's contents
    return div; // Return the actual div, not the fragment
}
function dragStart(_event) {
    let target = _event.target;
    let value = target.value;
    _event.dataTransfer.setData("value", value);
    _event.dataTransfer.setData("source", target.name);
    if (target.name == "name") {
        _event.dataTransfer.setData("type", target.parentElement.querySelector("select").value);
        _event.dataTransfer.setData("name", target.value);
        _event.dataTransfer.setData("value", getInputByName("value", target.parentElement).value);
        return;
    }
    let converted = convert(value);
    if (typeof (converted) == "undefined")
        _event.preventDefault();
    _event.dataTransfer.setData("type", typeof (converted));
}
function dragOver(_event) {
    _event.preventDefault();
}
function drop(_event) {
    let value = _event.dataTransfer.getData("value");
    let source = _event.dataTransfer.getData("source");
    let type = _event.dataTransfer.getData("type");
    let name = _event.dataTransfer.getData("name");
    let target = _event.target;
    let parent = target.parentElement;
    target.value = `DROP! ${value} ${type}`;
    if (parent.getAttribute("name") == "variable") {
        // drop on variable only if types match
        if (parent.querySelector("select").value != type)
            return;
        else if (source == "result") {
            let operation = getInputByName("left").value + " ";
            operation += document.querySelector("select[name=operator]").value;
            operation += " " + getInputByName("right").value;
            addCode(`${getInputByName("name", parent).value} = ${operation};`);
        }
        else if (source == "name")
            addCode(`${getInputByName("name", parent).value} = ${name};`);
        else
            addCode(`${getInputByName("name", parent).value} = ${value};`);
        target.value = value;
    }
    else
        target.value = name ? name : value;
    change();
}
function input(_event) {
    let type = typeof (convert(literal.value));
    getInputByName("type", literal.parentElement).value = type;
    literal.setAttribute("invalid", String(literal.value != "" && type == "undefined"));
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
    if (!left || !right)
        return;
    let results = {
        //@ts-ignore
        "+": left + right, "-": left - right, "*": left * right, "/": left / right, "%": left % right
    };
    let result = results[operator];
    if (typeof (result) == "string")
        result = '"' + result + '"';
    output.value = String(result);
    output.setAttribute("invalid", String(output.value == "NaN"));
}
function getInputByName(_name, _from = null) {
    return (_from ? _from : document).querySelector(`input[name=${_name}]`);
}
function validateVariables() {
    let divs = [...variables.querySelectorAll("div")];
    for (let variable of divs) {
        let name = getInputByName("name", variable);
        if (name.disabled == true)
            continue;
        let value = getInputByName("value", variable);
        let type = variable.querySelector("select");
        if (name.value && type.value) {
            if (!name.disabled)
                if (value.value)
                    addCode(`let ${name.value}: ${type.value} = ${value.value};`);
                else
                    addCode(`let ${name.value}: ${type.value};`);
            name.disabled = true;
            type.disabled = true;
            value.disabled = false;
            value.classList.add("drop");
            name.classList.add("drag");
            value.addEventListener("dragover", dragOver);
            name.draggable = true;
        }
    }
}
function addCode(_code) {
    document.querySelector("fieldset#code").innerHTML += (_code + "</br>");
}
function convert(_value) {
    try {
        let parsed = JSON.parse(_value);
        return parsed;
    }
    catch (_e) {
        if (_value == "")
            return undefined;
        let variable = null;
        for (let input of [...variables.querySelectorAll(`input[name=name]`)]) {
            if (input.value == _value)
                variable = input;
        }
        if (variable && variable.disabled) {
            let value = getInputByName("value", variable.parentElement).value;
            return convert(value);
        }
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
//# sourceMappingURL=Variables.js.map