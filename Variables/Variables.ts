window.addEventListener("load", start)
window.addEventListener("dragstart", dragStart)
window.addEventListener("drop", drop)
window.addEventListener("change", change)

type Input = HTMLInputElement
type List = Input[]
type Types = string | number | boolean | undefined
let dropTargets: List
let dragSources: List
let literal: Input

function start(): void {
  dragSources = <List>[...document.querySelectorAll(".drag")]
  dropTargets = <List>[...document.querySelectorAll(".drop")]

  for (let dragSource of dragSources)
    dragSource.draggable = true
  for (let dropTarget of dropTargets)
    dropTarget.addEventListener("dragover", dragOver)

  literal = getInputByName("literal");
  literal.addEventListener("input", input)
}

function dragStart(_event: DragEvent): void {
  let value: string = (<Input>_event.target).value;
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
  let target: Input = <Input>_event.target
  target.value = value
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
  let variables: List = <List>[...document.querySelectorAll("fieldset#variables div")!]
  for (let variable of variables) {
    let name: Input = getInputByName("name", variable);
    let value: Input = getInputByName("value", variable);
    let type: HTMLSelectElement = <HTMLSelectElement>variable.querySelector("select")!
    if (name.value && type.value) {
      name.disabled = true
      type.disabled = true
      value.disabled = false
      value.classList.add("drop")
      value.classList.add("drag")
      value.addEventListener("dragover", dragOver)
      dragSources.push(value)
      dropTargets.push(value)
    }
  }
}

function convert(_value: string): Types {
  try {
    let parsed: any = JSON.parse(_value)
    return parsed;
  } catch (_e) {
    return undefined
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