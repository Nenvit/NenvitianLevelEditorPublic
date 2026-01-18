var EImenu = [];
const MAX_LAYERS = 5;
let EIm = 'deaf' // OR NOISY
let scroll = 0;
let hideEI = false;
let opTile = 'dirt0';
let noisy = false;
var gen = false;
let constructed = EIm;
let smartEdges = false;
let opLayer = 0


function addLayer(autoSelect=false){
    opChunk.obj.tiles.push([
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0) ])
    opChunk.obj.tiles.length = constrain(opChunk.obj.tiles.length, 0, MAX_LAYERS) //Should stop overflow.
    if(autoSelect) opLayer = opChunk.obj.tiles.length - 1 
    updateOpChunk();
    console.log("Added Layer")
};
function setOpLayer(dir){
    opLayer = constrain(int(opLayer + dir), 0, opChunk.obj.tiles.length-1);
};
function removeLayer(){
    if(opChunk.obj.tiles.length === 1) return "MUST HAVE AT LEAST ONE LAYER."
    delete opChunk.obj.tiles[opLayer]
    setOpLayer(0)
    opChunk.obj.tiles = opChunk.obj.tiles.filter(()=>true)
    print("Completely Abolished Layer.")
};

function NoisyTile(tile){
    let ts = "^" + tile;
    if(/\d/.test(tile)){ ts = ts.slice(0,-1)};
    let fltr = new RegExp(ts)
    print("RegExp: " + fltr);
    let family = computeFamily(tile)
    let possibilities = opPal.families[family];
    print(`Possible Outcomes: ${possibilities}`)
    let blacklist = possibilities.filter((s)=>!(fltr.test(s)))
    possibilities = possibilities.filter((item)=>{
        if(blacklist.includes(item)) return false;
        else return true
    });
    if(possibilities.length === 0) return;
    let r = random(possibilities)
    print(`Result: ${r}`)
    return r;
}
function ChooseFromExtendedFamily(family, blacklist=[0]){
    let possibilities = opPal.extended_families[family];
    if(possibilities.length === 0) return;
    possibilities = possibilities.filter((item)=>{
        if(blacklist.includes(item)) return false;
        else return true
    });
    return random(possibilities);
}
function computeFamily(tile){
    let ts = "^" + tile;
    if(/\d/.test(tile)){ ts = ts.slice(0,-1)};
    let fltr = new RegExp(ts)
    let family = Object.keys(opPal.families).find(fam => opPal.families[fam].some(cousin => fltr.test(cousin)))
    print("Resulted Family: " + family);
    return family
}
function computeUpVeg(tile){
    let cf = computeFamily(tile)
    let bf = cf.split('_')[0]
    let pf = cf.replace(bf, '')
    if (bf in opPal.extended_families){
        return "vegetation" + pf
    }
}
function ChooseFromFamily(family){
    let possibilities = opPal.families[family];
    if(possibilities.length === 0) return;
    return random(possibilities);
}
function computeName(str, adj){
    console.log(`Given name ${str}`)
    if (!opPal.all.includes(str)) {
        console.log(`Invalid tile detected: ${str}\nDeleting tile...`)
        return 0
    };
    let side = '';
    let surf = '_top';
    let sn = '';
    let base = str.split('_')[0];
    const isVegU = opPal.families.vegetation.some(veg => new RegExp("^" + ((adj.u?.tile) ? adj.u.tile: "0")).test(veg)) || opPal.families.vegetation_snow.some(veg => new RegExp("^" + ((adj.u?.tile) ? adj.u.tile: "0")).test(veg));
    const isVeg = opPal.families.vegetation.includes(str) || opPal.families.vegetation_snow.includes(str);
    if(isVeg) {console.log(`Vegetation Identified: ${str}`); surf = ''}
    if(/\d/.test(str)){
        sn = str.slice( -1);
        console.log(`Number: ${sn}`)
        if(/\d/.test(base)) base = base.slice(0, -1); 
    }
    console.log(`Base: ${base}`)
    const hasU = (adj.u?.tile && parseInt(adj.u.tile) !== 0);
    const hasL = (adj.l?.tile && parseInt(adj.l.tile) !== 0);
    const hasD = (adj.d?.tile && parseInt(adj.d.tile) !== 0);
    const hasR = (adj.r?.tile && parseInt(adj.r.tile) !== 0);
    if(hasD){ 
        if(hasU){
            if(/_top(_left|_right)\d?/.test(adj.u.tile)) ;//Intentionally left blank.
            else if(hasL && hasR) surf = '';
            else if((hasL || hasR)) surf = "_edge";
            if(isVegU) surf = '_top';
        }
    }else if(hasU) { surf = '_bottom' }
    if(hasL || hasR){
        if(/_top(_left|_right)\d?/.test(adj.u?.tile) && ((/_top(_left)?\d?/.test(adj.l?.tile) || /_top(_right)?\d?/.test(adj.r?.tile)))){
            surf = "_top"
        }
        if((hasL && hasR) || isVeg || isVegU){ side = '' }
        else if(hasL){ side = '_right' }
        else { side = '_left' }
        print(`Left: ${hasL}, Right: ${hasR}`)
    }
    console.log(`Surface? ${surf}`)
    console.log(`Side? ${side}`)
    if(isVegU){
        console.log(`Rooted Vegetation Detected: ${adj.u.tile}`)
        surf = '_top';
        side = '';
        console.log(`Overwriting Surface and Side...\n Surface${surf}\n Side? ${side}`)
        if(!(/bush/.test(adj.u.tile))){
            console.log(`Overwriting Base...`);
            if(/\d/.test(adj.u.tile)) base = adj.u.tile.slice(0, -1)
            else base = adj.u.tile
        }
    }
    let tempbase = base + surf + side + sn;
    console.log(`Testing Base: ${tempbase}`)
    if(opPal.all.includes(tempbase)){
        console.log(`Resting Base: ${tempbase}`)
        return tempbase;
    } 
    if(opPal.all.some(item=> new RegExp('^' + tempbase + '\\d$').test(item))) {
        console.log(`Appending 0 to ${tempbase}: ${tempbase + String(0)}\nResting Base: ${tempbase + '0'}`);;
        return tempbase + '0';

    }
    if (isVeg){
        console.log(`Vegetation detected... ${base}`)
        tempbase = base + sn;
        console.log(`Resting Base ${tempbase}`)
        return tempbase;
    }
    if(/\d/.test(tempbase)){
        console.log(`Resting Base: ${tempbase.slice(0, -1)}`)
        return tempbase.slice(0, -1);
    } else return str;
}
function adjName(x, y){
        if(y < 0 || y > 15) return null;
        if(x < 0 || x > 15) return null;
        return {tile: opChunk.obj.tiles[opLayer][y][x], x: x, y: y};
    }
function adjTiles(x, y){
    return {
        u: adjName(x, y -1),
        l: adjName(x -1, y),
        d: adjName(x, y +1),
        r: adjName(x +1, y)
    };
}
function smartTile(ix, iy, tile){
    print("Raw name:" + tile)    
    if(!opChunk) return; //safety net.
    const Iadj = adjTiles(ix, iy)
    const Iname = (noisy) ? NoisyTile(computeName(tile, Iadj)): computeName(tile, Iadj);
    opChunk.obj.tiles[opLayer][iy][ix] = Iname;
    const computed = [];
    console.log(Iadj);
    for(let at of Object.values(Iadj)) {if(!at) continue; print(`Adjacent tile: ${at.x}, ${at.y}, ${at.tile}`)}
    
    for(let neighbor of Object.values(Iadj)){
        if(!neighbor) continue; //Skip nulls.
        if(!gen && neighbor.tile === 0) continue; //If not generating, continue.
        const adjN = adjTiles(neighbor.x, neighbor.y);
        const newName = computeName(neighbor.tile, adjN);
        computed.push({x: neighbor.x, y: neighbor.y, tile: newName})
    }
    for(let neighbor of computed){
        opChunk.obj.tiles[opLayer][neighbor.y][neighbor.x] = neighbor.tile
    }
}

class Chunk{
    constructor(x=null, y=null){
        if(opLevel.obj.Chunks.some((chunk) => ((chunk.x === x) && (chunk.y === y)))){
            this.obj = opLevel.obj.Chunks.find(((chunk) => ((chunk.x === x) && (chunk.y === y))));
        }
        else {
            this.obj = {
                    tiles: [
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0),
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0)
                    ],
                    x: x,
                    y: y
                };
            opLevel.obj.Chunks.push(this)
        };
        this.visualisable = false;
        this.noisy = false;
    }
    setupVisualChunk(){
        this.obj.tiles.flatten()
        let cX = this.obj.x * opPal.chkCtx;
        let cY = this.obj.y * opPal.chkCtx;
        let tempChunk = createGraphics(opPal.chkCtx, opPal.chkCtx);
        tempChunk.noSmooth();
        for (let cl = 0; cl < this.obj.tiles.length; cl++){ //Pull each layer out of each chunk. 
            for (let ti = 0; ti < this.obj.tiles[cl].length; ti++){ //Finally got to the tile names!
                let tile = this.obj.tiles[cl][ti]
                if(opPal[tile]){ //Gotta make sure its a tile! The we add the tile to the graphics.
                    tempChunk.image(opPal[tile], (opPal.pltCtx * ti), (opPal.pltCtx * (cl % 16)), opPal.pltCtx, opPal.pltCtx)
                }
            }    
        }
        this.visualisable = true
        this.visual = {img: tempChunk, x: cX, y: cY}
        this.obj.tiles.nest(16)
    }
    visualizeChunk(force=false){
        if(force) this.visualisable = false;
        if(!this.visualisable) this.setupVisualChunk();
        push();
            tint(230, 150);
            image(this.visual.img, this.visual.x, this.visual.y, opPal.chkCtx, opPal.chkCtx)
        pop();

    }
    applyNoise(cfg={gen: false, smart: false, tumble: false, vegetate: true, easyEye: true}){
        saved = false;
        if(cfg.smart){
            let tempChunk = [] //layer
            for(let y = 0; y < this.obj.tiles[opLayer].length; y++){
                let tempChunkLayer = []
                for(let x = 0; x < this.obj.tiles[opLayer].length; x++){
                    let name = this.obj.tiles[opLayer][y][x];
                    if(name === 0) {tempChunkLayer.push(0); continue;}
                    let adj = adjTiles(x, y);
                    tempChunkLayer.push(computeName(name, adj));
                }
                tempChunk.push(tempChunkLayer)
            }
            this.obj.tiles[opLayer] = tempChunk;
        }
        if(cfg.gen) console.warn("Configuration: GENERATE has not been implemented yet.");
        if(cfg.tumble) {
            for (let i = 0; i < this.obj.tiles[opLayer].length; i++){
                for (let j =0; j < this.obj.tiles[opLayer].length; j++){
                    let tile = this.obj.tiles[opLayer][i][j];
                    if(Array.from(opPal.all).includes(tile)){
                        this.obj.tiles[opLayer][i][j] = NoisyTile(tile)
                    };
                }
            }
        };
        if(cfg.vegetate){
            for (let i = 0; i < this.obj.tiles[opLayer].length; i++){
                for (let j = 0; j < this.obj.tiles[opLayer].length; j++){
                    let tile = this.obj.tiles[opLayer][i][j]
                    if(parseInt(tile) !== 0) continue;
                    console.log(tile)
                    let chances = 0
                    const adj = adjTiles(j, i)
                    const hasD = (adj.d?.tile && parseInt(adj.d.tile) !== 0);
                    if(hasD && opPal.extended_families.grass.includes(adj.d.tile)) chances = Math.round(Math.random() * 5);
                    else continue;
                    if(chances === 0) this.obj.tiles[opLayer][i][j] = ChooseFromFamily(computeUpVeg(adj.d.tile))
                    console.log(`Inserted ${this.obj.tiles[opLayer][i][j]} at ${j}, ${i}`)
                }
            }
        }
        this.setupVisualChunk()
    };
    insert(x, y, tile="dirt0"){
        saved = false;
        this.obj.tiles[opLayer][y][x] = tile; 
        if(noisy) this.obj.tiles[opLayer][y][x] = NoisyTile(tile); 
        if(smartEdges) smartTile(x, y, tile);
    }
}

let opChunk = false

class EIelem{
    constructor (index, id=Math.random().toString(36).slice(2,-1), icon=createImage(1,1)){
        this.id = id;
        this.icon = icon;
        this.index = index;
        this.icon.loadPixels();
        this.size = 32;
        this.selected = false;
        this.x = 0;
        this.y = 0;
    }
    display(){
        if(this.selected){
            EI.fill(230);
            EI.square(this.x-2, this.y-2, this.size + 4, 4);
        }
        EI.image(this.icon, this.x, this.y, this.size, this.size);
    }
    select(){ if(!this.selected) this.selected = true; console.log(`Element ${this.index}, ${this.id} has been selected.`); opTile = this.id; Notify(opTile, 2)}
    deselect(){ if(this.selected) this.selected = false; }
    engage(){}
}

function deafEI(){
    EImenu = [new EIelem(0, '0', opPal.blank)];
    let sortedFam = [...Object.keys(opPal.families)].sort((a, b)=>{
        let aa = a.split('_');
        let ab = b.split('_');
        if((aa.length < ab.length) && (a.length < b.length)) {
            return -1
        }else if ((aa.length > ab.length) && (a.length > b.length)) {
            return 1
        } else return 0;
    });
    let temp = [];
    for(let fam of sortedFam) temp.push(...opPal.families[fam].sort());  
    for(let tile = 0; tile < opPal.all.length; tile++) {
        EImenu.push(new EIelem(tile, temp[tile], opPal[temp[tile]]))
    }
    EImenu.nest(5)
    for(let i = 0; i < EImenu.length; i++){
        for(let j = 0; j < EImenu[i].length; j++){
            let t = EImenu[i][j];
            t.x = ((8 + t.size) * j + 4);
            t.y = ((8 + t.size) * i + 4); 
        };
    }
    EImenu.flatten(2);
    constructed = 'deaf'
}

function loudEI(){
    EImenu = [new EIelem(0, '0', opPal.blank)];
    let sortedFam = [...Object.keys(opPal.families)].sort();
    for(let fam of sortedFam) EImenu.push(new EIelem(sortedFam.indexOf(fam), opPal.families[fam][0], opPal[opPal.families[fam][0]]));  
    EImenu.nest(5)
    for(let i = 0; i < EImenu.length; i++){
        for(let j = 0; j < EImenu[i].length; j++){
            let t = EImenu[i][j];
            t.x = ((8 + t.size) * j + 4);
            t.y = ((8 + t.size) * i + 4); 
        };
    }
    EImenu.flatten(2);
    constructed = 'loud'
}

async function initiateEditor(){
    opLevel.obj.Chunks = opLevel.obj.Chunks.map(chunk=> new Chunk(chunk.x, chunk.y))
    deafEI()
}

async function disengageEditor(){
    opChunk.obj.tiles.flatten()
    opLevel.obj.Chunks = await opLevel.obj.Chunks.map(chunk=> chunk.obj)
    await opLevel.assessLevel(opPal)
    opChunk = false;
    return true;
}

function updateEI(){
    if(hideEI) {return;}
    EI.background(100);
    EI.push();
        EI.translate(0, -scroll)
        EImenu.flatMap((elem)=>elem.display())
    EI.pop();
    push();
        let x = (10) * UIscalar;
        let y = (86) * UIscalar
        translate((-width/2 * UIscalar) + (cPos.x), (-height/2 * UIscalar) + (cPos.y), cPos.z - 199)
        image(EI, x, y, EI.width * UIscalar, EI.height * UIscalar)
    pop();
}

function updateOpChunk(){
    if(!isEditing) return;
    if(opChunk) opChunk.obj.tiles.flatten();
    opChunk = opLevel.obj.Chunks.find((chunk)=>(chunk.obj.x === Local.Chunk.x) && (chunk.obj.y === Local.Chunk.y));
    if(typeof opChunk === "undefined") opChunk = new Chunk( Local.Chunk.x, Local.Chunk.y )
    opChunk.obj.tiles.nest(16)
}

function updateEIinfo(){
    let x = 11 + camInterface.width;
    let y = 5;
    let leftText = `Layer: ${opLayer + 1}/${opChunk.obj.tiles.length} out of ${MAX_LAYERS}\nNoisy: ${noisy}\nSmart Edges: ${smartEdges}`;
    let rightText = `\n\n\nCP: ${homeToString()}`;
    push();
        translate((-width/2 * UIscalar) + (cPos.x), (-height/2 * UIscalar) + (cPos.y), cPos.z-199);
        EIinfo.background(20);
        EIinfo.stroke(0);
        EIinfo.fill(255);
        EIinfo.textAlign(LEFT)
        EIinfo.text(leftText, 10, 20);
        EIinfo.textAlign(RIGHT)
        EIinfo.text(rightText, 190, 20);
        EIinfo.noStroke();
        image(EIinfo, (x) * UIscalar, (y) * UIscalar, EIinfo.width * UIscalar, EIinfo.height * UIscalar);
    pop();
}

function EditorLoop(){
    if(!opChunk) return;
    opLevel.render(cPos);
    opChunk.visualizeChunk();
    updateEI()
    updateEIinfo()
}


function editorClick(){
    if(!(opChunk instanceof Chunk)) return;
    if(mouseY < 0) return;
    if((mouseX > 20) && (mouseX < EI.width + 20) && (mouseY > 90) && (mouseY < EI.height + 90)){
        let elem = EImenu.find((lm)=>{
            if((mouseX >= lm.x + 20) && (mouseX <= lm.x + lm.size + 20) && (mouseY >= lm.y - scroll + 90) && (mouseY  <= lm.y + lm.size - scroll + 90)) return true;
            else return false;
        });
        EImenu.forEach((lm)=>{
            if(lm === EImenu[EImenu.indexOf(elem)]) lm.select();
            else lm.deselect();
        })
    } else if(Mous.cx === Local.Chunk.x && Mous.cy === Local.Chunk.y){
        opChunk.insert(Mous.ix, Mous.iy, opTile);
    };
    opChunk.setupVisualChunk();
    return true;
}

function editorDblClick(){
    chunkOptions();
}

function EIkey(event){
    if(event.location === KeyboardEvent.DOM_KEY_LOCATION_LEFT || event.location === KeyboardEvent.DOM_KEY_LOCATION_RIGHT) {
        if(event.code === "ShiftLeft") setOpLayer(-1);
        else if(event.code === "ShiftRight") setOpLayer(1);
    } else if (event.location === KeyboardEvent.DOM_KEY_LOCATION_NUMPAD){
        switch (event.code) {
            case "Numpad8": // 8
                cPos.add(0, -opPal.pltCtx, 0);
                break;
            case "Numpad2": // 2
                cPos.add(0, opPal.pltCtx, 0);
                break;
            case "Numpad4": // 4
                cPos.add(-opPal.pltCtx, 0, 0);
                break;
            case "Numpad6": // 6
                cPos.add(opPal.pltCtx, 0, 0);
                break;
            case "Numpad5": // 5
                SrH = true;
                break;
            case "Numpad9": // 9
                cPos.add(0, 0, -100);
                break;
            case "Numpad3": //NP 3
                cPos.add(0, 0, 100);
                break;
            case "Numpad1": //Will clean up edges.
                smartEdges = !smartEdges
                Notify(`Smart Edges ${smartEdges ? "On": "Off"}...`, 3)
                loudEI();
                break;
            case "Numpad5":
                Notify("Returning Home", 0)
                curHomeKey = "00"
                HOME = HOMES[curHomeKey]
                SrH = true;
                break;
            case "Numpad7": //7
                noisy = !noisy;
                Notify(`Random Tiles ${noisy ? "On": "Off"}...`, 3)
                if((constructed === "deaf")) loudEI();
                else if((constructed === 'loud')) deafEI();
                break;
            case "NumpadAdd": //+
                addLayer();
                break;
            case "NumpadSubtract": //-
                removeLayer();
                break;
            default: //more to come.
                break;
        }
    } else{
        switch(keyCode){
            case 87: //W will move up by one chunk.
                cPos.add(0, -(opPal.chkCtx), 0)
                break;
            case 83: //s will move down by one chunk.
                cPos.add(0, opPal.chkCtx, 0)
                break;
            case 68: //d -> 1 chunk
                cPos.add(opPal.chkCtx, 0, 0);
                break;
            case 65: //a <- 1 chunk
                cPos.add(-opPal.chkCtx, 0, 0)
                break;
            case 107: //+
                addLayer();
                break;
            case 109: //-
                removeLayer();
                break;
            case 8:
                opChunk.setAll(0)
            default: //more to come.
                break;
        }
    }
}