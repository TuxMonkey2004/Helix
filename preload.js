const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('helix', {
  getLog: (repoPath) => ipcRenderer.invoke('git:log', repoPath),
  getStatus: (repoPath) => ipcRenderer.invoke('git:status', repoPath),
  getBranches: (repoPath) => ipcRenderer.invoke('git:branches', repoPath),
  getDiff: (repoPath, hash) => ipcRenderer.invoke('git:diff', repoPath, hash),
  getUnstagedDiff: (repoPath) => ipcRenderer.invoke('git:unstaged-diff', repoPath),
  getStagedDiff: (repoPath) => ipcRenderer.invoke('git:staged-diff', repoPath),
  stage: (repoPath, files) => ipcRenderer.invoke('git:stage', repoPath, files),
  unstage: (repoPath, files) => ipcRenderer.invoke('git:unstage', repoPath, files),
  commit: (repoPath, message) => ipcRenderer.invoke('git:commit', repoPath, message),
  checkout: (repoPath, branch) => ipcRenderer.invoke('git:checkout', repoPath, branch),
  createBranch: (repoPath, name) => ipcRenderer.invoke('git:create-branch', repoPath, name),
  pull: (repoPath) => ipcRenderer.invoke('git:pull', repoPath),
  push: (repoPath) => ipcRenderer.invoke('git:push', repoPath),
  fetch: (repoPath) => ipcRenderer.invoke('git:fetch', repoPath),
  discard: (repoPath, file) => ipcRenderer.invoke('git:discard', repoPath, file),
  openRepo: () => ipcRenderer.invoke('dialog:open-repo'),
  loadSettings: () => ipcRenderer.invoke('settings:load'),
  saveSettings: (settings) => ipcRenderer.invoke('settings:save', settings),
  minimize: () => ipcRenderer.invoke('window:minimize'),
  maximize: () => ipcRenderer.invoke('window:maximize'),
  close: () => ipcRenderer.invoke('window:close')
});
