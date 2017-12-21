const electron = require('electron');

const { app, BrowserWindow, Menu, ipcMain } = electron;
//  Menu is used to create custom menus
// In the HTML file we use ipcRenderer to send messages
// and on the Electron side we use ipcMain to recieve the messages

let mainWindow;
let addWindow;

app.on('ready', () => {
  mainWindow = new BrowserWindow({});
  mainWindow.loadURL(`file://${__dirname}/main.html`);

  // event 'closed' is emitted when the BrowserWindow closes
  mainWindow.on('closed', () => app.quit());

  const mainMenu = Menu.buildFromTemplate(menuTemplate);
  Menu.setApplicationMenu(mainMenu);
});

function createAddWindow() {
  addWindow = new BrowserWindow({
    width: 300, // pixel values
    height: 200,
    title: 'Add New Todo'
  });
  addWindow.loadURL(`file://${__dirname}/add.html`);

  addWindow.on('close', () => (addWindow = null));
}

// here we will recieve the todo from add.html
// then we will send this recieved todo to main.html using mainWindow.webContents.send
ipcMain.on('todo:add', (event, todo) => {
  mainWindow.webContents.send('todo:add', todo);
  addWindow.close();
  // addWindow.clsoe() = kills this window, remove it from the screen
  // But still te addWindow references to the window and the GC cannot collect this memmory
  // So we need to set addWindow to null for the GC to reclaim this memmory
  // addWindow = null;
  // OR much easier way is to attach a event handler that listens for 'close' event, look in createAddWindow function
});

const menuTemplate = [
  // each object in the menuTemplate represents the menu items such as File, Edit, View, Selection, etc.
  {
    label: 'File',
    // submenu - list of labels to place inside a submenu under say 'File' menu item
    submenu: [
      {
        label: 'New Todo',
        click() {
          createAddWindow();
        }
      },
      {
        label: 'Clear Todos',
        click() {
          mainWindow.webContents.send('todo:clear');
        }
      },
      {
        label: 'Quit',
        // accelerator: 'Command+Q', // this key combination will invoke the click function for 'Quit' option
        // We can either pass the hot key combination or pass a function to accelerator like below
        // Immediately Invoked Function
        // accelerator: (() => {
        //   if (process.platform === 'darwin') {
        //     return 'Command+Q';
        //   } else {
        //     return 'Ctrl+Q';
        //   }
        // })(),
        // pass a ternary expression to accelerator
        accelerator: process.platform === 'darwin' ? 'Command+Q' : 'Ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
];

// The first object in menuTemplate for MacOS is actually taken by the Application Name menu item and not by 'File' menu item
// hence we need to add an empty object as the first entry for menuTemplate
if (process.platform === 'darwin') {
  menuTemplate.unshift({});
}

// 'production'
// 'development'
// 'staging'
// 'test'
if (process.env.NODE_ENV !== 'production') {
  menuTemplate.push({
    label: 'View', // can be 'DEVELOPER'
    submenu: [
      { role: 'reload' },
      // Electron has number of preset role options available such as 'reload'
      // when Electron sees reload role option, its going to add a submenu item for reload
      {
        label: 'Toggle Developer Tools',
        accelerator:
          process.platform === 'darwin' ? 'Command+Alt+I' : 'Ctrl+Shift+I',
        click(item, focusedWindow) {
          //focusedWindow is reference to the window which is currently highlighted or selected
          // as we can have multiple windows open in the same Application
          focusedWindow.toggleDevTools();
        }
      }
    ]
  });
}
