window.addEventListener("load", start);
window.addEventListener("dragstart", dragStart);
window.addEventListener("drop", drop);
window.addEventListener("change", change);
// window.addEventListener("pointerdown", (_event: PointerEvent) => _event.preventDefault(), true);

type Input = HTMLInputElement;
type List = Input[];
type Types = string | number | boolean | undefined;
type Data = { type?: string, name?: string, value: string, source?: string };
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
  literal.addEventListener("dragover", dragOver);

  variables = document.querySelector("fieldset#variables")!;
  variables.addEventListener("dblclick", clickVariables);

  parseQuery();
}

function parseQuery(): void {
  let query: string = location.search.slice(1);
  if (!query)
    return;

  query = decodeURI(query);

  let variables: string[] = query.split("|");
  for (let variable of variables) {
    let quotes: string[] = variable.split(",").map(_value => '"' + _value + '"');
    variable = "[" + quotes.join(",") + "]";
    let parsed: string[] = JSON.parse(variable);
    if (parsed[1] == "string")
      parsed[2] = '"' + parsed[2] + '"';
    let div: HTMLDivElement = addVariable();
    getInputByName("name", div).value = parsed[0];
    div.querySelector("select")!.value = parsed[1];
    getInputByName("value", div).value = parsed[2];
  }
  validateVariables();
}

function clickVariables(_event: MouseEvent): void {
  if (_event.target != _event.currentTarget)
    return;
  addVariable();
}

function addVariable(): HTMLDivElement {
  // remove call to action
  if (variables.children[1].tagName == "SPAN")
    variables.removeChild(variables.children[1]);
  let template: HTMLTemplateElement = document.querySelector("template")!;
  let clone: DocumentFragment = <DocumentFragment>template.content.cloneNode(true); // Clone the fragment
  let div: HTMLDivElement = clone.querySelector("div")!; // Ensure you're selecting the correct element
  variables.appendChild(clone); // Append the fragment's contents
  return div; // Return the actual div, not the fragment
}

function dragStart(_event: DragEvent): void {
  let target: Input = <Input>_event.target;
  let value: string = target.value;
  let data: Data = { value: value };

  data.source = target.name;

  if (target.name == "name") {
    data.type = target.parentElement!.querySelector("select")!.value;
    data.name = value;
    data.value = getInputByName("value", target.parentElement).value;
    _event.dataTransfer!.setData("text", JSON.stringify(data));
    return;
  }

  let converted: Types = convert(value);
  if (typeof (converted) == "undefined")
    _event.preventDefault();

  data.type = typeof (converted);
  _event.dataTransfer!.setData("text", JSON.stringify(data));
}

function dragOver(_event: DragEvent): void {
  if ((<Input>_event.target).name == "literal")
    _event.dataTransfer!.dropEffect = "none";
  _event.preventDefault();
}

function drop(_event: DragEvent): void {
  let transfer: string = _event.dataTransfer!.getData("text");
  let data: Data = JSON.parse(transfer);
  let target: Input = <Input>_event.target;
  let parent: HTMLElement = target.parentElement!;

  if (parent.getAttribute("name") == "variable") {
    // drop on variable only if types match
    if (parent.querySelector("select")!.value != data.type) {
      alert("Data types do not match!");
      return;
    }
    else
      if (data.source == "result") {
        let operation: string = getInputByName("left").value + " ";
        operation += (<Input>document.querySelector("select[name=operator]")!).value;
        operation += " " + getInputByName("right").value;

        addCode(`${getInputByName("name", parent).value} = ${operation};`)
      }
      else if (data.source == "name")
        addCode(`${getInputByName("name", parent).value} = ${data.name};`)
      else
        addCode(`${getInputByName("name", parent).value} = ${data.value};`)
    target.value = data.value;
  }
  else
    target.value = data.name ? data.name : data.value;

  change();
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

  if (left == undefined || right == undefined)
    return;

  // let results: { [operator: string]: Types } = {
  //   //@ts-ignore
  //   "+": left + right, "-": left - right, "*": left * right, "/": left / right, "%": left % right, "<<": left << right, ">>": left >> right
  // }
  // let result: Types = results[operator];
  let evaluate: string = "" + typeof (left) == "string" ? `'${left}'` : String(left);
  evaluate += operator;
  evaluate += typeof (right) == "string" ? `'${right}'` : String(right);
  let result: Types = eval(evaluate);

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

    if (name.value == "")
      return;

    if (!name.value.match("^[a-z]+(?:[A-Za-z0-9_]*)*$")) {
      alert("Watch coding styleguide on naming variables!");
      return;
    }

    if (divs.find(_variable => _variable != variable && name.value == getInputByName("name", _variable).value)) {
      alert("A variable of that name already exists!");
      return;
    }


    if (!type.value)
      return;

    if (!name.disabled)
      if (value.value)
        addCode(`let ${name.value}: ${type.value} = ${value.value};`);
      else
        addCode(`let ${name.value}: ${type.value};`);

    name.disabled = true;
    name.readOnly = true;
    type.disabled = true;
    value.disabled = false;
    value.classList.add("drop");
    name.classList.add("drag");
    value.addEventListener("dragover", dragOver);
    name.draggable = true;
  }
}


function addCode(_code: string) {
  document.querySelector("fieldset#code")!.innerHTML += (_code + "</br>");
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

