document.getElementById('open').addEventListener("click", ()=>{
    api.showOpenDialog().then((fp)=>{ if(opLevel?.def) delete opLevel.def; opLevel.establish(opPal, fp[0]) });
    
});
document.getElementById("download").addEventListener("click", ()=>{
    if(isEditing) disengageEditor();
    api.writeJSON(opLevel.path, opLevel.obj);
    saved = true;
    Notify(`Saved to ${opLevel.path}`, 1.5)
})
document.getElementById("opt_pref").addEventListener("click", ()=>{
    PREF.HOMES = HOMES
    api.writeJSON(prefPath, PREF);
    alert("Preferences Saved.")
})
document.getElementById("opt_chunk").addEventListener("click", ()=>{
    ChunkOptions();
})
document.getElementById("opt_levl").addEventListener("click", ()=>{
    if (!isEditing){
    initiateEditor().then(()=>{
        isEditing = true;
        updateOpChunk();
        console.log(isEditing)
    });
    } else disengageEditor().then(()=>{isEditing=false;})
})
document.getElementById("opt_grid").addEventListener("click", ()=>{
    show_grid = !show_grid
})
document.getElementById("opt_camera").addEventListener("click", ()=>{
    showCamSq = !showCamSq
})
document.getElementById("opt_shaders").addEventListener("click", ()=>{
    showMouseRect = !showMouseRect
})
 const dialog = document.getElementById('Title');
const openBtn = document.getElementById('convert');
const canc = document.getElementById('can');
const confirmBtn = document.getElementById('ok');
const input = document.getElementById('cre');
openBtn.addEventListener('click', () => {
    noLoop()
    input.value = ''
    dialog.showModal();
});

canc.addEventListener('click', ()=>{
    loop()
    dialog.close()
});

confirmBtn.onclick = () => {
    console.log("User entered:", input.value);
    loop();
    opLevel = new LevelMap({ title:input.value, fresh:true })
    opLevel.establish(opPal)
        .then(() => {opLevel.assessLevel(opPal)})
    dialog.close();
};

function cnfm(){
    const exidia = document.getElementById('exit-confirmation');
    const cfm = document.getElementById('proceed');
    const cnc = document.getElementById('digress');
    exidia.showModal();
    cfm.onclick = () => {
        if(opLevel?.def) {
            delete opLevel.def;
            opLevel.title = '';
        }
        api.writeJSON(opLevel.path, opLevel.obj);
        exidia.close();
        alert(`Saved to ${opLevel?.path}`)
        window.close()
        
    }
    cnc.onclick = () => {
        exidia.style.display = "none";
        window.close();
    }
}

document.getElementById("opt_quit").addEventListener("click", ()=>{
    if (isEditing) disengageEditor().then(()=>{isEditing=false;});
    if(saved) window.close();
    else cnfm();
})

function Notify(msg, duration){
    const notidia = document.getElementById('info');
    const notimsg = document.getElementById('info-msg');
    notidia.style.display = 'block'
    notimsg.textContent = msg;
    setTimeout(() => notidia.style.display = 'none', duration * 1000)
}

document.getElementById('rename').addEventListener('click', ()=>{
    const dialog = document.getElementById('Title');
    const canc = document.getElementById('can');
    const confirmBtn = document.getElementById('ok');
    const input = document.getElementById('cre');
    input.value = ''
    dialog.showModal();
    confirmBtn.onclick = async () => {
        console.log("User entered:", input.value);
        saved = false;
        if(opLevel?.def) delete opLevel.def;
        opLevel.obj.title = input.value;
        opLevel.title = input.value;
        dialog.close();

    }
    canc.onclick = () =>{
        input.value = ''
    }
});


function ChunkOptions(){
    let tmpe = isEditing;
    isEditing = false;
    const dialog = document.getElementById('opt-chunk')
    const form = document.getElementById('chk-fm')
    const ns = document.getElementById('noisify')
    const sm = document.getElementById('smart')
    const ign = document.getElementById('ign')
    const veg = document.getElementById('veg')
    dialog.showModal()
    ign.onclick = () =>{
        form.reset();
        isEditing = tmpe;
        dialog.close();
    }
    form.onsubmit = () =>{
        isEditing = tmpe;
        if(isEditing){
            opChunk.applyNoise({tumbl:ns.checked, smart:sm.checked, vegetate:veg.checked})
        } 
        form.reset()
    }
}