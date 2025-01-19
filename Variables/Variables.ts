window.addEventListener("load", start)
window.addEventListener("dragstart", dragStart)
window.addEventListener("drop", drop)
window.addEventListener("change", change)

type Input = HTMLInputElement
type List = Input[]
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

  literal = (<Input>document.querySelector("input[name=literal]"))
  literal.addEventListener("input", input)
}

function dragStart(_event: DragEvent): void {
  let value: string = (<Input>_event.target).value;
  _event.dataTransfer!.setData("value", value)
}

function dragOver(_event: DragEvent): void {
  _event.preventDefault();
}

function drop(_event: DragEvent): void {
  let value: string = _event.dataTransfer!.getData("value");
  let target: Input = <Input>_event.target
  target.value = value
}

function input(_event: Event): void {
  let type: string = infer(literal.value);
  (<Input>literal.parentElement?.querySelector("input[name=type]")).value = type;
  if (literal.value != "" && type == "")
    literal.setCustomValidity("unkown type");
  else
    literal.setCustomValidity("");

}

function change(_event: Event): void {
  let variables: List = <List>[...document.querySelectorAll("fieldset#variables div")!]
  for (let variable of variables) {
    let name: Input = <Input>variable.querySelector("input[name=name]")!
    let value: Input = <Input>variable.querySelector("input[name=value]")!
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

function infer(_value: string): string {
  if (_value == "true" || _value == "false")
    return "boolean"
  if (Number(_value).toString() === _value)
    return "number"

  let first: string = _value[0]
  let last: string = _value[_value.length - 1]
  let content: string = _value.slice(1, _value.length - 2)
  if (first == last)
    if (first == "'" || first == '"')
      if (content.indexOf(first) == -1)
        if (String(content).toString() === content)
          return "string"

  return ""
}