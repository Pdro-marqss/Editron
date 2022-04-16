const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const fs = require('fs');
const path = require('path');


//JANELA PRINCIPAL (precisa do async)
var mainWindow = null;
async function createWindow() {
    mainWindow = new BrowserWindow({
        width: 800,
        height: 600,
        minWidth: 450,
        minHeight: 400,
        webPreferences: {
            contextIsolation: false,
            nodeIntegration: true,
            devTools: false
        }
    });


    await mainWindow.loadFile('src/pages/editor/index.html');

    //habilita os devtools
    // mainWindow.webContents.openDevTools();

    createNewFile();

    ipcMain.on('update-content', function (event, data) {
        file.content = data;
    });

}

//FUNÇOES DO APP

//Arquivo
var file = {};
var images = [];

//Criar novo arquivo
function createNewFile() {
    file = {
        name: 'novo-arquivo.txt',
        content: '',
        saved: false,
        path: app.getPath('documents') + '/novo-arquivo.txt',
    };

    mainWindow.webContents.send('set-file', file);
}

//Salva arquivo no disco
function writeFile(filePath) {
    try {
        fs.writeFile(filePath, file.content, function (error) {
            //ERRO
            if (error) throw error;

            //ARQUIVO SALVO
            file.path = filePath;
            file.saved = true;
            file.name = path.basename(filePath);

            mainWindow.webContents.send('set-file', file);
        })
    } catch (error) {
        console.log(error)
    }
}

//Salvar como
async function saveFileAs() {
    //Dialog
    let dialogFile = await dialog.showSaveDialog({
        defaultPath: file.path
    });

    //Verificar se cancelou o save
    if (dialogFile.canceled) {
        return false;
    }

    //Salvar arquivo
    writeFile(dialogFile.filePath)
}


//SALVAR ARQUIVO
function saveFile() {
    //save
    if (file.saved) {
        return writeFile(file.path);
    }
    //save as
    return saveFileAs();
}


//LER ARQUIVO
function readFile(filePath) {
    try {
        return fs.readFileSync(filePath, 'utf8');
    } catch (error) {
        console.log(error);
        return '';
    }
}


//ABRIR ARQUIVO
async function openFile() {
    //dialogo
    let dialogFile = await dialog.showOpenDialog({
        defaultPath: file.path
    });

    //verificar se foi cancelado
    if (dialogFile.canceled) return false;

    //abrir o arquivo
    file = {
        name: path.basename(dialogFile.filePaths[0]),
        content: readFile(dialogFile.filePaths[0]),
        saved: true,
        path: dialogFile.filePaths[0]
    }

    mainWindow.webContents.send('set-file', file);
}


//BACKGROUND
function BackgroundChanger(index) {
    images = [
        'url(../../images/gragas.jpg)',
        'url(../../images/gragas2.jpg)',
        'url(../../images/ez1.jpg)',
        'url(../../images/ez2.jpg)',
        'url(../../images/lee.jpg)',
        'url(../../images/dog.jpg)',
    ]
    // console.log('aqui: ' + images)

    mainWindow.webContents.send('set-images', images, index);
}



//TEMPLATE MENU
const templateMenu = [
    {
        label: 'Arquivo',
        submenu: [
            {
                label: 'Novo',
                accelerator: 'CmdOrCtrl+N',
                click() {
                    createNewFile();
                }
            },
            {
                label: 'Abrir',
                accelerator: 'CmdOrCtrl+O',
                click() {
                    openFile();
                }
            },
            {
                label: 'Salvar',
                accelerator: 'CmdOrCtrl+S',
                click() {
                    saveFile();
                }
            },
            {
                label: 'Salvar como',
                accelerator: 'CmdOrCtrl+Shift+S',
                click() {
                    saveFileAs();
                }
            },
            {
                label: 'Fechar',
                role: process.platform === 'darwin' ? 'close' : 'quit'
            }
        ]
    },
    {
        label: 'Editar',
        submenu: [
            {
                label: 'Desfazer',
                role: 'undo'
            },
            {
                label: 'Refazer',
                role: 'redo'
            },
            {
                type: 'separator'
            },
            {
                label: 'Copiar',
                role: 'copy'
            },
            {
                label: 'Cortar',
                role: 'cut'
            },
            {
                label: 'Colar',
                role: 'paste'
            }
        ]
    },
    {
        label: 'ajuda',
        submenu: [
            {
                label: 'Canal Jubicleison',
                click() {
                    shell.openExternal('https://www.youtube.com/channel/UCYI3qFqffE11Pfa5Yp66sgQ');
                }
            }
        ]
    },
    {
        label: 'Temas',
        submenu: [
            {
                label: 'Gragas 1',
                click() {
                    BackgroundChanger([0]);
                    console.log('gragas1');
                }
            },
            {
                label: 'Gragas 2',
                click() {
                    BackgroundChanger([1]);
                    console.log('gragas2');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Ezreal 1',
                click() {
                    BackgroundChanger([2]);
                    console.log('gragas2');
                }
            },
            {
                label: 'Ezreal 2',
                click() {
                    BackgroundChanger([3]);
                    console.log('gragas2');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Lee Sin',
                click() {
                    BackgroundChanger([4]);
                    console.log('gragas2');
                }
            },
            {
                type: 'separator'
            },
            {
                label: 'Dog',
                click() {
                    BackgroundChanger([5]);
                    console.log('gragas2');
                }
            }
        ]
    }
];


//MENU
const menu = Menu.buildFromTemplate(templateMenu);
Menu.setApplicationMenu(menu);


//ON READY
app.whenReady().then(createWindow);


//ACTIVATE (resolve problema de rodar em MAC)
app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
    }
})