//Define Palette:
class Palette{
    constructor(srcPath='./default_palette/default.png', jsonPath='./default_palette/default.json'){
        this.data_src = srcPath;
        this.key_src = jsonPath;
    }
    async init(){
        this.key_src = await api.getAstPath(this.key_src)
        this.data_src = await api.getAstPath(this.data_src)
        await this.setKey()
        await this.setSpriteSheet()
        await this.setPalette()
        return this;
    }
    async setKey(){
        try{
        await api.readJSON(this.key_src).then((pltData)=>{
            Object.assign(this, pltData);
        })} catch(e){
            throw new Error(e)
        }
        
    }
    async setSpriteSheet(){
        let tempImg = await loadImage(this.data_src)
        this.refImg = tempImg;
        this.blank = createImage(this.pltCtx, this.pltCtx)
        for(let x = 0; x < this.blank.width; x++){
            for(let y = 0; y < this.blank.width; y++){
                this.blank.set(x, y, 255)
            }
        }
        this.blank.updatePixels()
    }
    async setPalette(){
        this.families = Object.groupBy(this.tiles, ({cls}) => {return cls;})
        this.extended_families = Object.groupBy(this.tiles, ({cls}) => {return cls.split("_")[0];})
        for(let fam of Array.from(Object.keys(this.families))){
            let members = [];
            for (let cousin of this.families[fam]){
                members.push(Object.keys(cousin)[0])
            }
            this.families[fam] = members;
        }
        for(let fam of Array.from(Object.keys(this.extended_families))){
            let members = [];
            for (let cousin of this.extended_families[fam]){
                members.push(Object.keys(cousin)[0])
            }
            this.extended_families[fam] = members;
        }
        let tempObj = {};
        this.tiles.forEach((tile) => {
            let tempKey = Object.keys(tile)[0]
            Object.defineProperty( tempObj, tempKey, { value:this.refImg.get(tile[tempKey].x, tile[tempKey].y, this.tileCtx, this.tileCtx), enumerable:true});  
        })
        Object.assign(this, tempObj) //move the tiles up a notch;
        this.all = Array.from(Object.keys(tempObj));
        delete this.tiles;
    }
}

class LevelMap{
    constructor(cfg={fresh:false}){
        if(cfg?.path) this.path = cfg.path;
        if(cfg?.def) this.def = cfg.def;
        if(this?.def) api.getAstPath(this.path).then((p) => {this.path = p});
        print(this?.path)
        if(cfg?.title) this.title = cfg.title;
        this.fresh = cfg.fresh;
    }
    get title(){
        return this._title;
    }
    set title(str){
        this._title = str
        if(this?.def) return;
        let rnid = Math.random().toString(36).slice(2, -1);
        console.log(rnid)
        console.log(str)
        let tmp = str !== '' ? str: rnid;
        console.log(tmp)
        let fn = tmp.replace(/[<>\\*+\/.{}`?;:$%^&@#!~=]/g, '');
        fn = fn.replace(/^[\d-]+/i, '')
        api.getDSKTP().then((dp) => this.path = dp + `\\Maps\\${fn}.json`)
    }
    async establish( plt = this.plt, path = this.path){
        if(!this.fresh){
                api.readJSON(path).then((tempObj)=>{
                print(tempObj)
                this.obj = tempObj
                this.assessLevel(plt);
                this.title = tempObj.title;
                this.established = true;;
        })} else{
            this.obj = {
                title:  this._title,
                Chunks: [{
                    x:0,
                    y:0,
                    tiles:[
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0),
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), 
                        Array(16).fill(0), Array(16).fill(0), Array(16).fill(0), Array(16).fill(0)
                    ]
                }]
            };
        }
        
    }
    async assessLevel(plt){
        let sc = plt.chkCtx;
        let st = plt.pltCtx;
        this.chunks = JSON.parse(JSON.stringify(this.obj.Chunks));
        for (let chunkI = 0; chunkI < this.chunks.length; chunkI++){ //should be 1
                let chunk = this.chunks[chunkI]
                if(chunk?.latest) continue;
                let cX = chunk.x * sc;
                let cY = chunk.y * sc;
                let tempChunk = createGraphics(sc, sc);
                tempChunk.noSmooth();
                for (let cl = 0; cl < chunk.tiles.length; cl++){ //Pull each layer out of each chunk. l % 16 === 0
                    for (let ti = 0; ti < chunk.tiles[cl].length; ti++){ //Finally got to the tile names!
                        let tile = chunk.tiles[cl][ti]
                        if(plt[tile]){ //Gotta make sure its a tile! The we add the tile to the graphics.
                            tempChunk.image(plt[tile], (st * ti), (st * (cl % 16)), st, st)
                        }
                    }    
                }
                this.chunks[chunkI] = {image: tempChunk, x: cX, y: cY, s: sc, latest:true}  //Replace the object with the graphics.
        };
    }
    filterChunks(chunk, pos){
        let compare;
         if(chunk instanceof Chunk) compare = (dist(chunk.x, chunk.y, pos.x, pos.y) < this.renderDistance);
         else compare = (dist(chunk.x, chunk.y, pos.x, pos.y) < this.renderDistance);
         if (compare) return true; else return false;
    }
    render(pos){
        if(!this.established){return}
        let immediateRender = this.chunks.filter(chunk => this.filterChunks(chunk, pos))
        immediateRender.forEach((imr) => image(imr.image, imr.x, imr.y, imr.s, imr.s))
    }
}

function divmod(d,r){
    return [Math.floor(d/r), d % r]
}

function cycleArray(arr=[0, 1, 2], dir=1, iter=0){
    if(!arr.length){ return;}; //If there are no UI elements, return.
    if(!((iter + dir) < 0)) {iter = (iter + dir) % arr.length;}
    else {iter = arr.length - 1;}
    return [iter, arr[iter]];
}

Array.prototype.nest = function(indices=1){
    if(indices < 0) return;
    let a = [];
    for(let i = 0; i < this.length; i += indices){
        a.push(Array.from(this.slice(i, i + indices)))
    }
    this.length = 0;
    this.push(...a)
}

Array.prototype.flatten = function(depth=1){ //Different from .flat() because this reassigns the values to the parent.
    let a = this.flat(depth);
    this.length = 0;
    this.push(...a)
}

Array.nest = function(arr, indices=1){ //This returns a new array, opposite of .flat()
    let a = [];
    for(let i = 0; i < arr.length; i += indices){
        a.push(Array.from(arr.slice(i, i + indices)))
    }
    arr.length = 0;
    arr.push(...a)
}