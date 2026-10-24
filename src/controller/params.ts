export function getParams(elementId: string)
{
    const paramsElement = <HTMLInputElement>document.getElementById(elementId);
    try {
        return (new Function("", 
            `return {${paramsElement.value}};`
        ))();
    } catch {
        return errMesage("Grammar error", paramsElement);
    }
}

function errMesage(mes: string, el: HTMLInputElement) {
    alert (mes);
    el.style.backgroundColor = "pink";
    return null;
}
