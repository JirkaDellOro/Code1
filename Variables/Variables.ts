window.addEventListener("load", start);
window.addEventListener("dragstart", dragStart);
window.addEventListener("drop", drop);
window.addEventListener("change", change);

type Input = HTMLInputElement;
type List = Input[];
type Types = string | number | boolean | undefined;
let dropTargets: List;
let dragSources: List;
let literal: Input;
let variables: HTMLFieldSetElement;

function start(): void {
  dragSources = <List>[...document.querySelectorAll(".drag")];
  dropTargets = <List>[...document.querySelectorAll(".drop")];

  for (let dragSource of dragSources)
    dragSource.draggable = true;
  for (let dropTarget of dropTargets)
    dropTarget.addEventListener("dragover", dragOver);

  literal = getInputByName("literal");
  literal.addEventListener("input", input);

  variables = document.querySelector("fieldset#variables")!;
  variables.addEventListener("pointerdown", addVariable);
}

function addVariable(_event: PointerEvent): void {
  if (_event.target != _event.currentTarget)
    return;
  let template: HTMLTemplateElement = document.querySelector("template")!;
  let clone: Node = template.content.cloneNode(true);
  variables.appendChild(clone);
}


function dragStart(_event: DragEvent): void {
  let target: Input = <Input>_event.target;
  let value: string = target.value;

  if (target.name == "name") {
    _event.dataTransfer!.setData("value", value)
    _event.dataTransfer!.setData("variable", value);
    _event.dataTransfer!.setData("type", target.parentElement!.querySelector("select")!.value);
    return;
  }

  let converted: Types = convert(value);
  if (typeof (converted) == "undefined")
    _event.preventDefault();

  _event.dataTransfer!.setData("value", value)
  _event.dataTransfer!.setData("type", typeof (converted))
}

function dragOver(_event: DragEvent): void {
  _event.preventDefault();
}

function drop(_event: DragEvent): void {
  let value: string = _event.dataTransfer!.getData("value");
  let variable: string = _event.dataTransfer!.getData("variable");
  let type: string = _event.dataTransfer!.getData("type");
  let target: Input = <Input>_event.target;
  let parent: HTMLElement = target.parentElement!;

  if (parent.getAttribute("name") == "variable")
    if (parent.querySelector("select")!.value != type)
      return;

  target.value = value;
  change()
}

function input(_event: Event): void {
  let type: string = typeof (convert(literal.value));
  getInputByName("type", literal.parentElement).value = type;

  literal.setAttribute("invalid", String(literal.value != "" && type == "undefined"));
}

function change(_event?: Event): void {
  validateVariables();
  operate();
}

function operate(): void {
  let left: Types = convert(getInputByName("left").value);
  let right: Types = convert(getInputByName("right").value);
  let operator: string = (<Input>document.querySelector("select[name=operator]")!).value;
  let output: Input = getInputByName("result");

  if (!left || !right)
    return;

  let results: { [operator: string]: Types } = {
    //@ts-ignore
    "+": left + right, "-": left - right, "*": left * right, "/": left / right, "%": left % right
  }
  let result: Types = results[operator];
  if (typeof (result) == "string")
    result = '"' + result + '"';
  output.value = String(result);

  output.setAttribute("invalid", String(output.value == "NaN"));
}

function getInputByName(_name: string, _from: HTMLElement | null = null): Input {
  return <Input>(_from ? _from : document).querySelector(`input[name=${_name}]`);
}

function validateVariables(): void {
  let divs: List = <List>[...variables.querySelectorAll("div")!]
  for (let variable of divs) {
    let name: Input = getInputByName("name", variable);
    if (name.disabled == true)
      continue;
    let value: Input = getInputByName("value", variable);
    let type: HTMLSelectElement = <HTMLSelectElement>variable.querySelector("select")!
    if (name.value && type.value) {
      name.disabled = true;
      type.disabled = true;
      value.disabled = false;
      value.classList.add("drop");
      name.classList.add("drag");
      value.addEventListener("dragover", dragOver);
      name.draggable = true;
      // dragSources.push(name);
      // dropTargets.push(value);
    }
  }
}

function convert(_value: string): Types {
  try {
    let parsed: any = JSON.parse(_value)
    return parsed;
  } catch (_e) {
    if (_value == "")
      return undefined;
    let variable: Input | null = null;
    for (let input of <List>[...variables.querySelectorAll(`input[name=name]`)]) {
      if (input.value == _value)
        variable = input;
    }
    if (variable && variable.disabled) {
      let value: Types = getInputByName("value", variable.parentElement).value;
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