window.addEventListener("load", start)
window.addEventListener("dragstart", dragStart)
window.addEventListener("drop", drop)

type Input = HTMLInputElement
type List = NodeListOf<Input>
let dropTargets: List;
let dragSources: List;

function start(): void {
  dragSources = <List>document.querySelectorAll(".drag")
  dropTargets = <List>document.querySelectorAll(".drop")

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
  (<Input>_event.target).value = value
}