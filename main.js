const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');

let mainWindow;
const settingsPath = path.join(app.getPath('userData'), 'settings.json');

function loadSettings() {
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'));
    }
  } catch (e) { /* ignore */ }
  return { language: 'zh-CN' };
}

function saveSettings(settings) {
  fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2), 'utf-8');
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    frame: false,
    backgroundColor: '#f5f5f7',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.loadFile('src/index.html');
}

function runGitCommand(repoPath, args) {
  return new Promise((resolve, reject) => {
    exec(`git ${args.join(' ')}`, { cwd: repoPath, maxBuffer: 10 * 1024 * 1024 }, (err, stdout, stderr) => {
      if (err) {
        reject({ message: err.message, stderr: stderr || '' });
      } else {
        resolve(stdout.trim());
      }
    });
  });
}

ipcMain.handle('settings:load', () => loadSettings());
ipcMain.handle('settings:save', (event, settings) => saveSettings(settings));

ipcMain.handle('git:log', async (event, repoPath) => {
  try {
    const format = '--format=%H||%h||%an||%ae||%ad||%s||%D||%P';
    const output = await runGitCommand(repoPath, ['log', '-50', format, '--date=relative', '--all', '--topo-order']);
    if (!output) return [];
    return output.split('\n').map(line => {
      const [hash, shortHash, author, email, date, subject, refs, parents] = line.split('||');
      return { hash, shortHash, author, email, date, subject, refs, parents };
    });
  } catch (e) { return []; }
});

ipcMain.handle('git:status', async (event, repoPath) => {
  try {
    const output = await runGitCommand(repoPath, ['status', '--porcelain', '-b']);
    const lines = output ? output.split('\n') : [];
    const branchLine = lines[0] || '';
    const branch = branchLine.replace('## ', '').split('...')[0].replace(/ \[.*\]/, '').trim();
    const files = lines.slice(1).filter(Boolean).map(line => ({
      status: line.substring(0, 2).trim(),
      filename: line.substring(3).trim()
    }));
    return { branch, files };
  } catch (e) { return { branch: '', files: [] }; }
});

ipcMain.handle('git:branches', async (event, repoPath) => {
  try {
    const output = await runGitCommand(repoPath, ['branch', '--format=%(refname:short)||%(objectname:short)||%(upstream:short)||%(committerdate:relative)']);
    if (!output) return [];
    return output.split('\n').map(line => {
      const isCurrent = line.startsWith('*');
      const clean = line.replace(/^\* /, '');
      const [name, hash, upstream, date] = clean.split('||');
      return { name, hash, upstream, date, isCurrent };
    });
  } catch (e) { return []; }
});

ipcMain.handle('git:diff', async (event, repoPath, hash) => {
  try {
    const args = hash ? ['show', '--stat', '--format=', hash] : ['diff', '--stat', 'HEAD'];
    return await runGitCommand(repoPath, args);
  } catch (e) { return ''; }
});

ipcMain.handle('git:unstaged-diff', async (event, repoPath) => {
  try { return await runGitCommand(repoPath, ['diff', '--stat']); } catch (e) { return ''; }
});

ipcMain.handle('git:staged-diff', async (event, repoPath) => {
  try { return await runGitCommand(repoPath, ['diff', '--cached', '--stat']); } catch (e) { return ''; }
});

ipcMain.handle('git:stage', async (event, repoPath, files) => {
  return runGitCommand(repoPath, ['add', ...files]);
});

ipcMain.handle('git:unstage', async (event, repoPath, files) => {
  return runGitCommand(repoPath, ['reset', 'HEAD', '--', ...files]);
});

ipcMain.handle('git:commit', async (event, repoPath, message) => {
  return runGitCommand(repoPath, ['commit', '-m', message]);
});

ipcMain.handle('git:checkout', async (event, repoPath, branch) => {
  return runGitCommand(repoPath, ['checkout', branch]);
});

ipcMain.handle('git:create-branch', async (event, repoPath, name) => {
  return runGitCommand(repoPath, ['branch', name]);
});

ipcMain.handle('git:pull', async (event, repoPath) => {
  return runGitCommand(repoPath, ['pull']);
});

ipcMain.handle('git:push', async (event, repoPath) => {
  return runGitCommand(repoPath, ['push']);
});

ipcMain.handle('git:fetch', async (event, repoPath) => {
  return runGitCommand(repoPath, ['fetch', '--all']);
});

ipcMain.handle('git:discard', async (event, repoPath, file) => {
  return runGitCommand(repoPath, ['checkout', '--', file]);
});

ipcMain.handle('dialog:open-repo', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
    title: 'Open Git Repository'
  });
  if (result.canceled || result.filePaths.length === 0) return null;
  return result.filePaths[0];
});

ipcMain.handle('window:minimize', () => mainWindow.minimize());
ipcMain.handle('window:maximize', () => {
  if (mainWindow.isMaximized()) mainWindow.unmaximize();
  else mainWindow.maximize();
});
ipcMain.handle('window:close', () => mainWindow.close());

app.whenReady().then(createWindow);
app.on('window-all-closed', () => app.quit());
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
