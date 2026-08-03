(function () {
const { helix } = window;
const { t, setLang, getLang } = window._;

let state = {
  repoPath: null,
  branches: [],
  status: { branch: '', files: [] },
  commits: [],
  selectedCommit: null,
  activeTab: 'unstaged'
};

const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

function applyI18n() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    el.textContent = t(key);
  });
  document.querySelectorAll('[data-i18n-title]').forEach(el => {
    el.title = t(el.dataset.i18nTitle);
  });
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    el.placeholder = t(el.dataset.i18nPlaceholder);
  });
  document.getElementById('welcome-title').textContent = t('welcomeTitle');
  document.getElementById('welcome-desc').textContent = t('welcomeDesc');
  document.getElementById('status-left').textContent = state.repoPath ? t('ready') : t('ready');
  if (!state.repoPath) {
    $('#appTitle') || placeholderCheck();
  }
}

function placeholderCheck() {
  const statusLeft = document.getElementById('status-left');
  if (statusLeft && statusLeft.textContent === '\u5C31\u7EEA') statusLeft.textContent = t('ready');
}

function showToast(message) {
  var toast = $('#toast');
  toast.textContent = message;
  toast.classList.add('visible');
  clearTimeout(toast._timeout);
  toast._timeout = setTimeout(function () { toast.classList.remove('visible'); }, 2200);
}

function showModal(title, content, footer) {
  $('#modal-title').textContent = title;
  $('#modal-content').innerHTML = content;
  $('#modal-footer').innerHTML = footer || '';
  $('#modal-overlay').classList.remove('hidden');
  requestAnimationFrame(function () {
    $('#modal-overlay').classList.add('visible');
  });
}

function hideModal() {
  $('#modal-overlay').classList.remove('visible');
  setTimeout(function () { $('#modal-overlay').classList.add('hidden'); }, 220);
}

$('#modal-close').addEventListener('click', hideModal);
$('#modal-overlay').addEventListener('click', function (e) {
  if (e.target === $('#modal-overlay')) hideModal();
});
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') hideModal();
});

async function openRepo() {
  try {
    const repoPath = await helix.openRepo();
    if (!repoPath) return;
    state.repoPath = repoPath;
    const name = repoPath.split(/[/\\]/).pop();
    $('#repo-name').textContent = name;
    $('#repo-info').classList.remove('hidden');
    $('#toolbar-title').textContent = name;
    $$('.sidebar-actions .btn-secondary').forEach(function (b) { b.classList.remove('hidden'); });
    $('#new-branch-btn').classList.remove('hidden');
    await refreshAll();
  } catch (err) {
    showToast(t('failedStatus'));
  }
}

async function refreshAll() {
  if (!state.repoPath) return;
  $('#status-left').textContent = t('refreshing');
  try {
    await Promise.all([loadStatus(), loadBranches(), loadCommits()]);
  } catch (e) { /* ignore individual failures */ }
  $('#status-left').textContent = t('ready');
}

async function loadStatus() {
  if (!state.repoPath) return;
  try {
    state.status = await helix.getStatus(state.repoPath);
    renderStatus();
    renderFileList();
    $('#repo-branch').textContent = state.status.branch || '\u2014';
    $('#status-branch').textContent = state.status.branch ? (t('on') + ' ' + state.status.branch) : '\u2014';
  } catch (e) { showToast(t('failedStatus')); }
}

async function loadBranches() {
  if (!state.repoPath) return;
  try {
    state.branches = await helix.getBranches(state.repoPath);
    renderBranches();
  } catch (e) { showToast(t('failedBranches')); }
}

async function loadCommits() {
  if (!state.repoPath) return;
  try {
    state.commits = await helix.getLog(state.repoPath);
    renderCommits();
    $('#commit-count').textContent = state.commits.length;
  } catch (e) { showToast(t('failedCommits')); }
}

function renderBranches() {
  var container = $('#branch-list');
  if (state.branches.length === 0) {
    container.innerHTML = '<div class="empty-state">' + t('noBranches') + '</div>';
    return;
  }
  container.innerHTML = state.branches.map(function (b) {
    var classes = ['branch-item'];
    if (b.isCurrent) classes.push('current');
    return '<div class="' + classes.join(' ') + '" data-branch="' + escapeAttr(b.name) + '"><span>' + escapeHtml(b.name) + '</span><span class="branch-hash">' + escapeHtml(b.hash || '') + '</span></div>';
  }).join('');

  container.querySelectorAll('.branch-item').forEach(function (el) {
    el.addEventListener('click', async function () {
      var branch = el.dataset.branch;
      try {
        await helix.checkout(state.repoPath, branch);
        showToast(t('switchedTo') + ' ' + branch);
        await refreshAll();
      } catch (e) { showToast(t('failedSwitch') + ': ' + e.message); }
    });
  });
}

function renderStatus() {
  var container = $('#status-summary');
  var files = state.status.files;
  if (files.length === 0) {
    container.innerHTML = '<div class="empty-state">' + t('cleanTree') + '</div>';
    return;
  }
  container.innerHTML = files.map(function (f) {
    var mc = getMarkerClass(f.status);
    return '<div class="status-file" data-file="' + escapeAttr(f.filename) + '" data-status="' + f.status + '"><span class="status-marker ' + mc + '">' + f.status + '</span><span>' + escapeHtml(f.filename) + '</span></div>';
  }).join('');
}

function getMarkerClass(status) {
  if (status && status.indexOf('A') >= 0) return 'added';
  if (status && status.indexOf('D') >= 0) return 'deleted';
  if (status && status.indexOf('R') >= 0) return 'renamed';
  if (status && status.indexOf('M') >= 0) return 'modified';
  if (status === '??') return 'untracked';
  return 'modified';
}

function renderCommits() {
  var container = $('#commit-list');
  if (state.commits.length === 0) return;
  container.innerHTML = state.commits.map(function (c) {
    var initials = (c.author || '?').split(' ').map(function (w) { return w[0]; }).join('').slice(0, 2).toUpperCase();
    var refs = parseRefs(c.refs);
    return '<div class="commit-item" data-hash="' + c.hash + '">' +
      '<div class="commit-avatar">' + initials + '</div>' +
      '<div class="commit-body">' +
        '<div class="commit-subject">' + escapeHtml(c.subject) + '</div>' +
        '<div class="commit-meta">' +
          '<span class="commit-author">' + escapeHtml(c.author) + '</span>' +
          '<span class="commit-hash">' + escapeHtml(c.shortHash || '') + '</span>' +
          '<span>' + escapeHtml(c.date || '') + '</span>' +
        '</div>' +
        (refs.length ? '<div class="commit-refs">' + refs.map(function (r) { return '<span class="ref-tag ' + r.type + '">' + escapeHtml(r.name) + '</span>'; }).join('') + '</div>' : '') +
      '</div></div>';
  }).join('');

  container.querySelectorAll('.commit-item').forEach(function (el) {
    el.addEventListener('click', async function () {
      container.querySelectorAll('.commit-item').forEach(function (e) { e.classList.remove('selected'); });
      el.classList.add('selected');
      state.selectedCommit = el.dataset.hash;
      state.activeTab = 'diff';
      $$('.tab').forEach(function (t) { t.classList.remove('active'); });
      var diffTab = document.querySelector('.tab[data-tab="diff"]');
      if (diffTab) diffTab.classList.add('active');
      await loadDiff(state.selectedCommit);
    });
  });
}

function parseRefs(refsStr) {
  if (!refsStr) return [];
  return refsStr.split(',').map(function (r) {
    var trimmed = r.trim();
    if (trimmed.indexOf('HEAD ->') === 0) return { name: trimmed, type: 'branch' };
    if (trimmed.indexOf('tag:') === 0) return { name: trimmed, type: 'branch' };
    if (trimmed.indexOf('origin/') >= 0) return { name: trimmed, type: 'remote' };
    return { name: trimmed, type: 'branch' };
  });
}

async function loadDiff(hash) {
  if (!state.repoPath) return;
  try {
    var diff = await helix.getDiff(state.repoPath, hash || null);
    var content = $('#detail-content');
    content.innerHTML = diff ? formatDiff(diff) : '<div class="empty-state">' + t('noChanges') + '</div>';
  } catch (e) {
    $('#detail-content').innerHTML = '<div class="empty-state">' + t('failedDiff') + '</div>';
  }
}

function formatDiff(text) {
  return text.split('\n').map(function (line) {
    if (line.match(/^\s+\S.*\|/)) return '<div class="diff-file">' + escapeHtml(line) + '</div>';
    return escapeHtml(line);
  }).join('\n');
}

async function renderFileList() {
  var content = $('#detail-content');
  var files = state.status.files;
  var filtered;
  if (state.activeTab === 'staged') {
    filtered = files.filter(function (f) { return f.status !== '??' && f.status !== ' M' && f.status !== ' D'; });
  } else if (state.activeTab === 'unstaged') {
    filtered = files.filter(function (f) { return f.status === '??' || f.status === ' M' || f.status === ' D'; });
  } else {
    filtered = files;
  }

  if (filtered.length === 0) {
    content.innerHTML = '<div class="empty-state">' + t('noChanges') + '</div>';
    return;
  }

  content.innerHTML = filtered.map(function (f) {
    return '<div class="file-list-item" data-file="' + escapeAttr(f.filename) + '" data-status="' + f.status + '">' +
      '<span><span class="status-marker ' + getMarkerClass(f.status) + '">' + f.status + '</span> ' + escapeHtml(f.filename) + '</span>' +
      '<span class="file-actions">' +
        (state.activeTab === 'unstaged' ? '<button class="btn-small stage-btn">' + t('stageBtn') + '</button>' : '') +
        (state.activeTab === 'staged' ? '<button class="btn-small unstage-btn">' + t('unstageBtn') + '</button>' : '') +
        (state.activeTab === 'unstaged' ? '<button class="btn-small discard-btn">' + t('discardFileBtn') + '</button>' : '') +
      '</span></div>';
  }).join('');

  content.querySelectorAll('.stage-btn').forEach(function (btn) {
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      var file = btn.closest('.file-list-item').dataset.file;
      try { await helix.stage(state.repoPath, [file]); showToast(t('stagedF') + ' ' + file); await refreshAll(); }
      catch (e) { showToast(t('failedStage')); }
    });
  });

  content.querySelectorAll('.unstage-btn').forEach(function (btn) {
    btn.addEventListener('click', async function (e) {
      e.stopPropagation();
      var file = btn.closest('.file-list-item').dataset.file;
      try { await helix.unstage(state.repoPath, [file]); showToast(t('unstagedF') + ' ' + file); await refreshAll(); }
      catch (e) { showToast(t('failedUnstage')); }
    });
  });

  content.querySelectorAll('.discard-btn').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var file = btn.closest('.file-list-item').dataset.file;
      showModal(t('discardTitle'),
        '<p style="font-size:0.875rem;color:var(--text-secondary);margin-bottom:8px">' + t('discardDesc') + ' <strong>' + escapeHtml(file) + '</strong>' + t('discardDesc2') + '</p>',
        '<button class="btn-secondary cancel-discard-btn">' + t('cancel') + '</button><button class="btn-primary confirm-discard-btn" style="background:var(--red)">' + t('discardBtn') + '</button>');
      document.querySelector('.cancel-discard-btn').addEventListener('click', hideModal);
      document.querySelector('.confirm-discard-btn').addEventListener('click', async function () {
        hideModal();
        try { await helix.discard(state.repoPath, file); showToast(t('discardedF') + ' ' + file); await refreshAll(); }
        catch (e) { showToast(t('failedDiscard')); }
      });
    });
  });
}

$('#detail-section').addEventListener('click', function (e) {
  if (e.target.classList.contains('tab')) {
    $$('.tab').forEach(function (t) { t.classList.remove('active'); });
    e.target.classList.add('active');
    state.activeTab = e.target.dataset.tab;
    state.selectedCommit = null;
    $$('.commit-item').forEach(function (el) { el.classList.remove('selected'); });
    if (state.activeTab === 'diff' && state.selectedCommit) {
      loadDiff(state.selectedCommit);
    } else {
      renderFileList();
    }
  }
});

$('#open-repo-btn').addEventListener('click', openRepo);
$('#welcome-open-btn').addEventListener('click', openRepo);
$('#refresh-btn').addEventListener('click', refreshAll);

$('#new-branch-btn').addEventListener('click', function () {
  showModal(t('createBranch'),
    '<p style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:12px">' + t('createBranchDesc') + '</p>' +
    '<input class="modal-input" id="branch-name-input" placeholder="' + t('branchName') + '" autofocus>',
    '<button class="btn-secondary cancel-branch-btn">' + t('cancel') + '</button><button class="btn-primary confirm-branch-btn">' + t('create') + '</button>');
  document.querySelector('.cancel-branch-btn').addEventListener('click', hideModal);
  document.querySelector('.confirm-branch-btn').addEventListener('click', async function () {
    var name = document.getElementById('branch-name-input').value.trim();
    if (!name) return;
    hideModal();
    try { await helix.createBranch(state.repoPath, name); showToast(t('createdBranch') + ' ' + name); await refreshAll(); }
    catch (e) { showToast(t('failedCreateBranch') + ': ' + e.message); }
  });
});

$('#fetch-btn').addEventListener('click', async function () {
  try { await helix.fetch(state.repoPath); showToast(t('fetched')); await refreshAll(); }
  catch (e) { showToast(t('failedFetch')); }
});
$('#pull-btn').addEventListener('click', async function () {
  try { await helix.pull(state.repoPath); showToast(t('pulled')); await refreshAll(); }
  catch (e) { showToast(t('failedPull') + ': ' + e.message); }
});
$('#push-btn').addEventListener('click', async function () {
  try { await helix.push(state.repoPath); showToast(t('pushed')); await refreshAll(); }
  catch (e) { showToast(t('failedPush') + ': ' + e.message); }
});

function showCommitDialog() {
  showModal(t('commitChanges'),
    '<p style="font-size:0.8125rem;color:var(--text-secondary);margin-bottom:12px">' + t('commitDesc') + '</p>' +
    '<input class="modal-input" id="commit-message-input" placeholder="' + t('commitMessage') + '" autofocus>',
    '<button class="btn-secondary cancel-commit-btn">' + t('cancel') + '</button><button class="btn-primary confirm-commit-btn">' + t('commit') + '</button>');
  document.querySelector('.cancel-commit-btn').addEventListener('click', hideModal);
  document.querySelector('.confirm-commit-btn').addEventListener('click', async function () {
    var message = document.getElementById('commit-message-input').value.trim();
    if (!message) return;
    hideModal();
    try { await helix.commit(state.repoPath, message); showToast(t('committed')); await refreshAll(); }
    catch (e) { showToast(t('failedCommit') + ': ' + e.message); }
  });
}

var commitBtn = document.createElement('button');
commitBtn.className = 'btn-primary';
commitBtn.id = 'commit-btn';
commitBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1v9M4 7l3 3 3-3"/></svg> ' + t('commit');
commitBtn.addEventListener('click', showCommitDialog);
$('#toolbar-actions').appendChild(commitBtn);

function escapeHtml(str) {
  if (!str) return '';
  var div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

function escapeAttr(str) {
  if (!str) return '';
  return String(str).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

/* ── Settings ── */
$('#settings-btn').addEventListener('click', function () {
  var currentLang = getLang();
  showModal(t('settings'),
    '<div class="settings-section">' +
      '<label>' + t('languageLabel') + '</label>' +
      '<div class="settings-row">' +
        '<button class="settings-option' + (currentLang === 'zh-CN' ? ' active' : '') + '" data-lang="zh-CN">\u4e2d\u6587</button>' +
        '<button class="settings-option' + (currentLang === 'en' ? ' active' : '') + '" data-lang="en">English</button>' +
      '</div>' +
    '</div>',
    '<button class="btn-secondary settings-close-btn">' + t('cancel') + '</button><button class="btn-primary settings-save-btn">\u2714</button>');

  document.querySelector('.settings-close-btn').addEventListener('click', hideModal);

  document.querySelectorAll('.settings-option').forEach(function (btn) {
    btn.addEventListener('click', function () {
      document.querySelectorAll('.settings-option').forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
    });
  });

  document.querySelector('.settings-save-btn').addEventListener('click', async function () {
    var selected = document.querySelector('.settings-option.active');
    var newLang = selected ? selected.dataset.lang : 'zh-CN';
    if (newLang !== getLang()) {
      setLang(newLang);
      await helix.saveSettings({ language: newLang });
      applyI18n();
      commitBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1v9M4 7l3 3 3-3"/></svg> ' + t('commit');
      if (state.repoPath) await refreshAll();
    }
    hideModal();
  });

  document.addEventListener('keydown', function handler(e) {
    if (e.key === 'Escape') { hideModal(); document.removeEventListener('keydown', handler); }
  });
});

/* ── Init ── */
async function init() {
  try {
    var settings = await helix.loadSettings();
    if (settings && settings.language) {
      setLang(settings.language);
      document.documentElement.lang = settings.language;
    }
  } catch (e) { /* default zh-CN */ }
  applyI18n();
  commitBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M7 1v9M4 7l3 3 3-3"/></svg> ' + t('commit');
  document.getElementById('status-left').textContent = t('ready');

  /* ── Title bar buttons ── */
  document.getElementById('btn-minimize').addEventListener('click', function () { helix.minimize(); });
  document.getElementById('btn-maximize').addEventListener('click', function () { helix.maximize(); });
  document.getElementById('btn-close').addEventListener('click', function () { helix.close(); });
}

init();

})();
