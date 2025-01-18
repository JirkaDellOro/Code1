window.addEventListener("load", start)
window.addEventListener("dragstart", dragStart)
window.addEventListener("drop", drop)
window.addEventListener("change", change)

type Input = HTMLInputElement
type List = Input[]
let dropTargets: List;
let dragSources: List;

function start(): void {
  dragSources = <List>[...document.querySelectorAll(".drag")]
  dropTargets = <List>[...document.querySelectorAll(".drop")]

  for (let dragSource of dragSources)
    dragSource.draggable = true
  for (let dropTarget of dropTargets)
    dropTarget.addEventListener("dragover", dragOver)
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
function change(_event: Event): void {
  let variables: List = <List>[...document.querySelectorAll("fieldset#variables div")!]
  for (let variable of variables) {
    let name: HTMLInputElement = <HTMLInputElement>variable.querySelector("input[name=name]")!
    let value: HTMLInputElement = <HTMLInputElement>variable.querySelector("input[name=value]")!
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