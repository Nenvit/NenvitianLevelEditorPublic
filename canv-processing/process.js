/*  [[Graphics]]  */
const eBOUNDS =  [[-320_000, -320_000, 200],[320_000, 320_000, 8000]];
const PREF = {};
const HOMES = {
    '00': {x: 0, y: 0, z: 800}
}
var HOME = HOMES['00']
var curHomeKey = '00'
const pressed={};

//Define operators
var opPal;
var opLevel;


let EI;

let pal0;
let map0;

const UIscalar = 199/800;
//End of operators
var caF;
var drawCanv = false;
var isEditing = false;
var cam, cPos, caPos, cVel, isNumLockOff;
var glide = 'Sharp'; //Sharp, Long, None, Default.
var czPos = 200;
var SrH = false;
var show_grid = false;
var bkgColor;
var msgW = 0;
var font;
var zoom;
var gmode = 'chunk'
var gl;
var camInterface;
let smb = false;
let showCamSq = true;
let showMousRect = true;
let living = false;
let dir;
var EIinfo;
var saved = true;
let prefPath;
p5.disableFriendlyErrors = true;

async function setup(){
    const canv = createCanvas(displayWidth, displayHeight-60, WEBGL)
    const gl = canv.canvas.getContext(WEBGL2, {willReadFrequently:true, imageSmoothingEnabled:false})
    prefPath = await api.getAstPath("preferences.json").then((result)=> {
        if(result.includes("resources\\app\\app\\assets")) return result.replace("\\app\\assets", "");
        else if( result.includes("\\app\\assets")) return result.replace("\\app\\assets", "");
        else return result;
    });
    Object.assign(PREF, await api.readJSON(prefPath))
    Object.assign(HOMES, PREF.HOMES);
    pal0 = new Palette();
    map0 = new LevelMap({path:"example_map/example_map.json", def:true});
    map0.renderDistance = 8 * pal0.chkCtx
    dir = await api.getDSKTP();
    console.log(dir);
    opLevel = map0;
    opPal = pal0;
    pal0.init().then((plt)=>{map0.establish(plt)})
               .then(()=>{map0.renderDistance = PREF.renderDistance * pal0.chkCtx})
               .catch((e)=>{console.log(e)})
    camInterface = createGraphics(200,80);
    EI = createGraphics(camInterface.width, 200);
    EI.noSmooth();
    EIinfo = createGraphics(200,80);
    noCursor();
    font = await loadFont('arial.ttf')
    cPos = createVector(0, 0, czPos);
    caPos = createVector(0, 0, 0);
    cVel = createVector(0, 0, 0);
    cam = createCamera();
    cam.setPosition(cPos.x, cPos.y, czPos);
    cPos.limit(16_000_000 * opPal.pltCtx);
    cVel.limit(60);
    cam.lookAt(0, 0, 0);
    setCamera(cam);
    angleMode(DEGREES)
    noSmooth();
    frameRate(60);
    bkgColor = color(0, 0, 0);
    textAlign(LEFT, TOP)  
    textFont(font);
    textSize(5);
    colorMode(RGB)
}

function draw(){
    background(bkgColor);
    setCamera(cam);
    updateCamInterface();
    if( isEditing ) EditorLoop();
    else previewLevel();
    if(show_grid){ draw_Grid(gmode); }
    applyCameraPhysics()
    caF = (glide === "Sharp") ? opPal.pltCtx : ((glide === "Default") ? opPal.chkCtx: 0.062);
    stroke(0);
}

function changeHome(h){
    HOMES[h].x = cPos.x;
    HOMES[h].z = cPos.z;
    HOMES[h].y = cPos.y;
    console.log(`Changes Home #${h} to ${HOMES[h]}`)
}

function smoothReturnCameraHome(){
    const target = createVector(HOME.x, HOME.y, HOME.z);
    const easeF = 0.04;
    const diff = p5.Vector.sub(target, cPos);
    cVel.set();
    caPos.set();
    diff.mult(easeF);
    cPos.add(diff);       
    
    if(cPos.dist(target) < 8){
        SrH = false;
        cPos.set(target);
        Notify(`Arrived at: ${HOME.x}, ${HOME.y}  ${zoom}%`, 3)
    }
}

function keyPressed(event) {
    if (!SrH) {
        switch (keyCode) {
            case 38: // 2
                caPos.add(0, -caF, 0);
                break;
            case 40: // 8
                caPos.add(0, caF, 0);
                break;
            case 37: // 4
                caPos.add(-caF, 0, 0);
                break;
            case 39: // 6
                caPos.add(caF, 0, 0);
                break;
            case 12: // 5
                HOME = HOMES['00']
                curHomeKey = '00'
                SrH = true;
                break;
            case 33: // 9
                caPos.add(0, 0, -caF);
                break;
            case 34: //NP 3
                caPos.add(0, 0, caF);
                break;
            case 45: //Np 0 hard break;
                caPos.set();
                cVel.set();
                glide = 'Sharp'
                break;
            case 35: //Break Scrolling. NumPad 1
                glide = 'Default';
                break;
            case 36: //7
                glide = 'Long'; //Smooth Scroll for a while.
                break;
            default:
                break;
        }
        if (isEditing){
            EIkey(event);
        }
    }
    if(event.repeat) return;
    pressed[event.which] = event.timeStamp
}

var timeToSet = 4
function keyReleased(event){
    pressed[event.which] = (event.timeStamp - pressed[event.which]) / 1000
    const str = String(keyCode);
    if (str in HOMES) {
        if (pressed[event.which] < timeToSet){
            HOME = HOMES[str]
            curHomeKey = str
            SrH = true;
        } else if(pressed[event.which] >= timeToSet){
            changeHome(str)
        }
    }
    pressed[event.which] = 0
}

function mouseWheel(event){
    if((mouseX > 20) && (mouseX < EI.width + 20) && (mouseY > 90) && (mouseY < EI.height + 90) && isEditing){
        scroll += event.delta;
        scroll = constrain(scroll, 0, EImenu[EImenu.length-1].y - 4)
    }
}

function previewLevel(){
    opLevel.render(cPos)
    if(living) opLevel.reAssess(cPos)
};



function applyCameraPhysics(){
    if(SrH){
        smoothReturnCameraHome();
    }else if(show_grid === true){
        cPos.add(cVel);
        cVel.set();
    }else{
        cVel.add(caPos);
        if(glide !== "Long") caPos.set();
        cVel.limit(600);
        cPos.add(cVel);
        cVel.mult((glide == 'Long') ? 1 : ((glide == 'Sharp') ? 0.59 : 0.8));
        cPos.z = constrain(cPos.z, eBOUNDS[0][2], eBOUNDS[1][2]);
        cPos.x = constrain(cPos.x, eBOUNDS[0][0], eBOUNDS[1][0]);
        cPos.y = constrain(cPos.y, eBOUNDS[0][1], eBOUNDS[1][1]);
    };
    cam.setPosition(cPos.x, cPos.y, cPos.z); 
    zoom = round((800 / cPos.z) * 100)
}

function md(m, d){
    return ((m % d) + d) % d
}

const Local = {
    Chunk: {x: 0, y: 0},
    pChunk: {x: 0, y: 0},
    worldTile: {x: 0, y: 0},
    localTile: {ix: 0, iy: 0},
    update(){
        this.Chunk.x = Math.floor(cPos.x / opPal.chkCtx)
        this.Chunk.y = Math.floor(cPos.y / opPal.chkCtx)
        this.worldTile.x = floor(cPos.x / opPal.pltCtx)
        this.worldTile.y = floor(cPos.y / opPal.pltCtx)
        this.localTile.ix = this.worldTile.x - (this.Chunk.x * 16);//Index X of the tile.
        this.localTile.iy = this.worldTile.y - (this.Chunk.y * 16);
        if(!SrH) this.listenChunkChange().then((r)=>{ if(r) updateOpChunk();});
    },
    async listenChunkChange(force=false){
        if(force) return true;
        if((this.pChunk.x !== this.Chunk.x) || (this.pChunk.y !== this.Chunk.y)){
            this.pChunk.x = this.Chunk.x;
            this.pChunk.y = this.Chunk.y;
            return true;
        }
    }
}
const Mous = {
    x : 0,
    y : 0,
    cx: 0,
    cy: 0,
    ix: 0,
    iy: 0,
    update(){
        this.x = floor((((mouseX - width/2) / opPal.pltCtx) * (cPos.z/800)) + (cPos.x / opPal.pltCtx))
        this.y = floor((((mouseY - height/2) / opPal.pltCtx) * (cPos.z/800)) + (cPos.y / opPal.pltCtx))
        this.ix = md(this.x, 16);
        this.iy = md(this.y, 16);
        this.cy = floor(this.y / 16);
        this.cx = floor(this.x / 16);
    }
}



function draw_Grid(gmode = 'tile'){ //gmode = 'tile' | 'chunk'
    if(zoom < 100 && !(gmode === "chunk")){return;};
    let sX, sY;
    let eX, eY;
    let opVec = (gmode==='tile') ? opPal.pltCtx : opPal.chkCtx
    let buffer = 2 * opVec;

    push();
        translate(-width/2 + cPos.x - md(cPos.x, opVec), -height/2 + cPos.y - md(cPos.y, opVec), 0);

        sX = -buffer + md(width/2, opVec);
        sY = -buffer + md(height/2, opVec);
        eX = width + buffer;
        eY = height + buffer;

        stroke(255);
        strokeWeight(1);
        for (let x = sX; x <= eX; x += opVec) {
            line(x, sY, x, eY);
        }
        for (let y = sY; y <= eY; y += opVec) {
            line(sX, y, eX, y);
        }
    pop();

    push();
        let sqx = cPos.x - md(cPos.x, opVec) + 0.5 * opVec;
        let sqy = cPos.y - md(cPos.y, opVec) + 0.5 * opVec;
        stroke(255, 0, 0);
        strokeWeight(1);
        rectMode(CENTER);
        noFill();
        square(sqx, sqy, opVec);
        if(showMousRect){
            stroke(240, 250, 0)
            rectMode(CORNER)
            square(Mous.x * opPal.pltCtx, Mous.y * opPal.pltCtx, opPal.pltCtx, opPal.pltCtx/3)
        }
    pop();
}

function homeToString(){
    return `{ X: ${Math.floor(HOME.x / opPal.pltCtx)}, Y: ${Math.floor(HOME.y / opPal.pltCtx)}, Zoom: ${Math.round((800 / HOME.z) * 100)} }`
}

function getHome(){
    switch(curHomeKey){
        case '00':
            return "Default";
        case '48':
            return '0'
        case '49':
            return '1'
        case '50':
            return '2'
        case '51':
            return '3'
        case '52':
            return '4'
        case '53':
            return '5'
        case '54':
            return '6'
        case '55':
            return '7'
        case '56':
            return '8'
        case '57':
            return '9'
        default:
            return '?'
    }
}

function updateCamInterface(){
    let x = 10;
    let y = 5;
    Local.update()
    Mous.update()
    push();
        translate((-width/2 * UIscalar) + (cPos.x), (-height/2 * UIscalar) + (cPos.y), cPos.z-199);
        camInterface.background(20);
        camInterface.stroke(0);
        camInterface.fill(255);
        camInterface.textAlign(LEFT)
        camInterface.text(`Position: ${Local.worldTile.x}, ${Local.worldTile.y}\nChunk: ${Local.Chunk.x}, ${Local.Chunk.y}\nTile: ${Local.localTile.ix}, ${Local.localTile.iy}\nZoom: ${zoom}%`, 10, 20);
        camInterface.textAlign(RIGHT)
        camInterface.text(`${opLevel.obj?.title ? opLevel.obj?.title: "No Title"}\nMouse Chunk: ${Mous.cx}, ${Mous.cy}\nMouse on Tile: ${Mous.ix}, ${Mous.iy}\nHome: ${getHome()}`, camInterface.width-10, 20);
        camInterface.noStroke();
        image(camInterface, (x) * UIscalar, (y) * UIscalar, camInterface.width * UIscalar, camInterface.height * UIscalar);
    pop();
    if(showCamSq){
        push();
            let sqx = cPos.x - md(cPos.x, opPal.pltCtx);
            let sqy = cPos.y - md(cPos.y, opPal.pltCtx);
            stroke(0, 0, 255);
            strokeWeight(1);
            rectMode(CENTER);
            noFill();
            triangle(sqx, sqy - 0.5 * opPal.pltCtx, sqx +  opPal.pltCtx, sqy - 0.5 * opPal.pltCtx, sqx + 0.5 * opPal.pltCtx, sqy + 0.5 * opPal.pltCtx)
        pop();
    }
}

function mouseClicked(){
    if(isEditing) editorClick();
}

function doubleClicked(){
    if(isEditing) editorDblClick();
}