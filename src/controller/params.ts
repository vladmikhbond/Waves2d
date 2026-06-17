export function getSpaceParams(): [number, number, number]
{
    const defValue: [number, number, number] = [500, 0.99, 0];
    const paramsElement = (document.getElementById("spaceParams") as HTMLInputElement)!;
    let ps: [number, number, number];
    try {
        ps = (new Function("", 
            "let size, k, loss;" + 
            paramsElement.value + 
            "; return [size, k, loss]" 
        ))();
    } catch {
        return errMesage("Space params: grammar error", defValue, paramsElement);
    }
    // перевірки
    if (ps[0] == undefined || ps[0] < 100) 
        return errMesage("Size must by >= 100", defValue, paramsElement);

    if (ps[1] == undefined || ps[1] < 0 || ps[1] > 1/2)
        return errMesage("K: 0 < k < 1/2", defValue, paramsElement);

    if (ps[2] == undefined || ps[2] < 0 || ps[2] > 1)
        return errMesage("Loss: 0 < loss < 1", defValue, paramsElement);
    paramsElement.style.backgroundColor = "";
    return ps;
}

export function getOscilParams(): [number, number, number, number]
{
    const defValue: [number, number, number, number] = [1, 100, 0, 0];
    const paramsElement = (document.getElementById("oscilParams") as HTMLInputElement)!;
    let ps: [number, number, number, number];
 
    try {
        ps = (new Function("", 
            "let amp, q, vx, la;" + 
            paramsElement.value +
            "; return [amp, q, vx, la]" )
        )();
        } catch {
        return errMesage("Grammar error", defValue, paramsElement);
    }
    // перевірки
    if (ps[0] == undefined) 
        return errMesage("Amplitude (amp) is undefined", defValue, paramsElement);
    if (ps[1] == undefined && ps[3] == undefined)
        return errMesage("Wave number (q) and Wave length (la) are undefined", defValue, paramsElement);
    if (ps[2] == undefined)
        return errMesage("Hor velocity (vx) is undefined", defValue, paramsElement);
    paramsElement.style.backgroundColor = "";
    return ps;
}

export function getReceiverParams() {
    const defValue = 0;
    const paramsElement = (document.getElementById("recieverParams") as HTMLInputElement)!;
    let loss: number;
 
    try {
        loss = (new Function("", 
             "let loss;" + 
            paramsElement.value +
            "; return loss;"
        ))();
        } catch {
        return errMesage("Grammar error", defValue, paramsElement);
    }
    // перевірки
    if (loss == undefined || loss < 0 || loss > 1) 
        return errMesage("Loss: 0 <= loss <= 1", defValue, paramsElement);
    paramsElement.style.backgroundColor = "";
    return loss;
}


function errMesage(mes: string, defValue: any, el: HTMLInputElement) {
    alert (mes);
    el.style.backgroundColor = "pink";
    return defValue;
}
