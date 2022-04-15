//PARTE RENDERIZADORA DO ELECTRON

const { ipcRenderer } = require('electron');


//ELEMENTOS
const textarea = document.getElementById('text');
const title = document.getElementById('title');

//SET FILE (chamando o evento criado no main.js)
ipcRenderer.on('set-file', function (event, data) {
    textarea.value = data.content;
    title.innerHTML = data.name + ' | Editron';
    // console.log(data)
});

//UPDATE TEXTAREA
function handleChangeText() {
    ipcRenderer.send('update-content', textarea.value);
}