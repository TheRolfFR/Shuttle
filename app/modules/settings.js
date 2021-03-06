const { remote, ipcRenderer } = require('electron')
const AutoLaunch = require('auto-launch')
const fs = require('fs')
const saveAs = require('file-saver')
const files = require('./files')
const searchengines = require('./searchengines.json')
const config = require('./config.json')

const { app } = require('electron').remote

let ShuttleAutoLauncher = new AutoLaunch({
  name: 'Shuttle'
})

let settingsIsShow = false

EventsEmitter.on('SHOW_SETTINGS', (bool) => {
  let settingsView = document.querySelector('.settings')

  if(document.querySelector('.historyModal')) {
    settings.showHistory(false)
  }

  if (bool === true) {
    settingsView.style.display = 'block'
    settingsIsShow = true
  } else if (bool === false) {
    settingsView.style.display = 'none'
    settingsIsShow = false
  } else {
    if (settingsIsShow) {
      settingsView.style.display = 'none'
      settingsIsShow = false
    } else {
      settingsView.style.display = 'block'
      settingsIsShow = true
    }
  }
})

const settings = {
  setAccountBtn () {
    if (files.settings.getValue('settings.isLogged')) {
      document.querySelector('input[name=logout]').style.display = 'block'
      document.querySelector('input[name=singin]').style.display = 'none'

      document.querySelector('input[name=syncButton]').disabled = false
    } else {
      document.querySelector('input[name=logout]').style.display = 'none'
      document.querySelector('input[name=singin]').style.display = 'block'
      
      document.querySelector('input[name=syncButton]').disabled = true
    }
  },

  setCheckBox () {
    let checkboxAutoStart = document.querySelector('input[name=SAboot]')
    let checkboxStayOpen = document.querySelector('input[name=SOpen]')
    let checkboxShowFrame = document.querySelector('input[name=SFrame]')
    let checkboxSync = document.querySelector('input[name=syncButton]')
    let checkboxBlockWebsite = document.querySelector('input[name=blockDangerousWebsiteBox]')

    if (files.settings.getValue('settings.autostart') === true || files.settings.getValue('settings.autostart') === undefined) {
      checkboxAutoStart.checked = true
      files.settings.setValue('settings.autostart', true)
    }
    if (files.settings.getValue('settings.StayOpen')) {
      checkboxStayOpen.checked = true
    }
    if (files.settings.getValue('settings.frame')) {
      checkboxShowFrame.checked = true
    }
    if (files.settings.getValue('settings.sync') === true || files.settings.getValue('settings.sync') === undefined) {
      checkboxSync.checked = true
      files.settings.setValue('settings.sync', true)
    }
    if (files.settings.getValue('settings.blockDangerousWebsite') === true || files.settings.getValue('settings.blockDangerousWebsite') === undefined) {
      checkboxBlockWebsite.checked = true
      files.settings.setValue('settings.blockDangerousWebsite', true)
    }
  },

  setLang () {
    document.getElementById('startAtBoot').innerHTML = lang('SETTINGS_START_AT_BOOT')
    document.getElementById('stayOpen').innerHTML = lang('SETTINGS_STAY_OPEN')
    document.getElementById('showFrame').innerHTML = lang('SETTINGS_SHOW_FRAME')

    document.getElementById('bkms').innerHTML = lang('SETTINGS_BOOKMARKS')
    document.getElementById('Export').innerHTML = lang('SETTINGS_EXPORT_BOKMARKS')
    document.getElementById('Import').innerHTML = lang('SETTINGS_IMPORT_BOKMARKS')
    document.getElementById('Reset').innerHTML = lang('SETTINGS_RESET_BOOKMARKS')

    document.getElementById('navigation').innerHTML = lang('SETTINGS_NAVIGATION')
    document.getElementById('chooseSearchEngine').innerHTML = lang('SETTINGS_CHOOSESEARCHENGINE');
    document.getElementById('clearCache').innerHTML = lang('SETTINGS_CLEAR_CACHE')
    document.getElementById('historyText').innerHTML = lang('SETTINGS_SHOW_HISTORY')

    document.getElementById('advanced').innerHTML = lang('SETTINGS_ADVANCED')
    document.getElementById('showConsole').innerHTML = lang('SETTINGS_SHOW_CONSOLE')
    document.getElementById('reportBug').innerHTML = lang('SETTINGS_REPORT_BUG')
    document.getElementById('blockDangerousWebsite').innerHTML = lang('SETTINGS_BLOCK_WEBSITE')

    document.getElementById('accountTitle').innerHTML = lang('SETTINGS_SYNC_TITLE')
    document.getElementById('accountStatus').innerHTML = lang('SETTINGS_ACCOUNT_STATUS')
    document.getElementById('syncButton').innerHTML = lang('SETTINGS_SYNC')
    document.getElementById('logoutButton').value = lang('AUTH_LOGOUT').toUpperCase()
    document.getElementById('signinButton').value = lang('AUTH_SIGNIN').toUpperCase()

    document.querySelector('.version').innerHTML = `VERSION ${require('electron').remote.app.getVersion()}`

    document.querySelector('.history-modale-title').innerHTML = lang('HISTORY_TITLE')
    document.getElementById('history_no_ativity_title').innerHTML = lang('HISTORY_TITLE')
    document.querySelector('.history-modale-clear-button').innerHTML = lang('HISTORY_CLEAR_ALL')
    document.getElementById('history_no_ativity_title').innerHTML = lang('HISTORY_NO_ACTIVITY_TITLE')
    document.getElementById('history_no_activity_p').innerHTML = lang('HISTORY_NO_ACTIVITY_P')
    document.getElementById('history_start_use').innerHTML = lang('HISTORY_START_USE')
  },

  setAutoStart () {
    let checkboxAutoStart = document.querySelector('input[name=SAboot]')
    if (checkboxAutoStart.checked) {
      files.settings.setValue('settings.autostart', true)
      ShuttleAutoLauncher.enable()
      console.log(`Autostart: ${checkboxAutoStart.checked}`)
    } else {
      files.settings.setValue('settings.autostart', false)
      ShuttleAutoLauncher.disable()
      console.log(`Autostart: ${checkboxAutoStart.checked}`)
    }
  },

  setStayOpen () {
    let checkboxStayOpen = document.querySelector('input[name=SOpen]')
    files.settings.setValue('settings.StayOpen', checkboxStayOpen.checked)
    ipcRenderer.send('SettingSetAlwaysOnTop', checkboxStayOpen.checked)
    console.log(`StayOpen: ${checkboxStayOpen.checked}`)
  },

  setShowFrame () {
    let checkboxShowFrame = document.querySelector('input[name=SFrame]')
    files.settings.setValue('settings.frame', checkboxShowFrame.checked)
    shuttle.frame(checkboxShowFrame.checked)
    console.log(`ShowFrame: ${checkboxShowFrame.checked}`)
  },

  downloadButton () {
    console.log(`download button is clicked`)
    this.downloadFavorites()
  },

  uploadButton () {
    console.log(`upload button is clicked`)
    this.uploadFavorites()
  },

  resetButton () {
    console.log(`reset button is clicked`)
    this.resetFavorites()
  },

  hideControlBar () {
    EventsEmitter.emit('SHOW_CONTROL_BAR', {
      id: 0,
      show: false
    })
  },

  // Button for show developper console
  showConsoleButton () {
    console.log(`Show console button is clicked`)
    remote.getCurrentWindow().openDevTools()
  },

  // Button for report a bug
  reportBugButton () {
    
    modales.feedback((email, desc) => {

      console.log(`report bug button is clicked`)

      let body = {
        email: email,
        shuttleVersion: app.getVersion(),
        osPlatform: process.platform,
        osVersion: require('os').release,
        arch: process.arch,
        electronVerison: process.versions.electron,
        nodeVerison: process.versions.node,
        chromiumVerison: process.versions.chrome,
        v8Version: process.versions.v8,
        description: desc        
      }

      fetch(`${config.api}/utils/feedback/send`, {
        method: 'post',
        body: JSON.stringify(body),
        headers: { 'Content-Type': 'application/json' }
      }).then(res => res.json()).catch(() => {
        reject()
      }).then((data) => {
          if (data.message === 'success') {
            alert('Message sent !')
          } else {
            alert(`Error with the server : ${data.message}`)
          }
        })

    })
  },

  clearCacheButton () {
    console.log(`clear cache button is clicked`)
    let win = remote.getCurrentWindow()
    win.webContents.session.clearCache(() => {
      win.webContents.session.clearStorageData()
      alert('cache is cleared')
    })
  },

  downloadFavorites () {
    let data = fs.readFileSync(`${app.getPath('userData')}/bookmarks.json`, 'utf8')
    let fileToSave = new Blob([data], {
      type: 'application/json',
      name: 'myBookmarks.shtd'
    })
    saveAs(fileToSave, 'myBookmarks.shtd')
  },

  uploadFavorites () {
    remote.dialog.showOpenDialog({ filters: [{ name: 'Shuttle data', extensions: ['shtd'] }] }, (fileNames) => {
      if (fileNames === undefined) {
        console.log('[ERROR] > No file selected')
      } else {
        fs.createReadStream(fileNames[0]).pipe(fs.createWriteStream(`${app.getPath('userData')}/bookmarks.json`))
        sync.uploadBookmarks().then((data) => {
          console.log(data)
          bookmarks.loadBookmarks()
        })
      }
    })
  },

  resetFavorites () {
    let choice = remote.dialog.showMessageBox({
      type: 'question',
      buttons: ['continue', 'cancel'],
      title: 'Reset',
      message: 'Reset all bookmarks ?'
    })
    if (choice === 0) {
      console.log('[INFO] > Reset bookmarks')
      fs.writeFile(`${app.getPath('userData')}/bookmarks.json`, '', (err) => {
        if (err) {
          return console.log(`[ERROR] > ${err}`)
        }
        sync.uploadBookmarks().then((data) => {
          console.log(data)
          bookmarks.loadBookmarks()
        }).catch(() => {
          bookmarks.loadBookmarks()
        })
      })
    }
  },

  setSync () {
    let checkboxSync = document.querySelector('input[name=syncButton]')
    files.settings.setValue('settings.sync', checkboxSync.checked)
  },

  logout () {
    files.settings.setValue('settings.isLogged', false)
    ipcRenderer.send('auth-logout')
    document.querySelector('input[name="syncButton"]').disabled = true
    document.querySelector('input[name=logout]').style.display = 'none'
    document.querySelector('input[name=singin]').style.display = 'block'
  },

  searchEngineSelectorIsShow: false,
  showSearchEngineSelector () {
    let searchEngineSelector = document.querySelector('.selector-list')
    let searchEngineSelectorArrow = document.querySelector('.selector-arrow')
    if (this.searchEngineSelectorIsShow) {
      searchEngineSelector.style.display = 'none'
      searchEngineSelectorArrow.innerHTML = "▼"
      this.searchEngineSelectorIsShow = false
    } else {
      searchEngineSelector.style.display = 'block'
      searchEngineSelectorArrow.innerHTML = "▲"
      this.searchEngineSelectorIsShow = true
    }
  },

  setSearchEngineSelect () {
    document.querySelector('.selector-list').innerHTML = ''
    for(let key in searchengines) {
      selected = ( (files.settings.getValue('settings.searchEngine') === undefined && key == "Google") || (files.settings.getValue('settings.searchEngine') == key) ) ? "selected" : "";
      if (selected) {
        document.querySelector('.selector-list').innerHTML += `<a href="#" onclick="settings.chooseSearchEngine('${key}')" class="selector-list-buttons selector-list-buttons-selected">${key.toUpperCase()}</a>`
        document.querySelector('.selector-text').innerHTML = key.toUpperCase()
      } else {
        document.querySelector('.selector-list').innerHTML += `<a href="#" onclick="settings.chooseSearchEngine('${key}')" class="selector-list-buttons">${key.toUpperCase()}</a>`
      }
    }
  },

  chooseSearchEngine(engine) {
    files.settings.setValue('settings.searchEngine', engine)
    this.setSearchEngineSelect()
    this.showSearchEngineSelector()
  },

  setWebsiteBlocking () {
    let checkboxBlockWebsite = document.querySelector('input[name=blockDangerousWebsiteBox]')
    files.settings.setValue('settings.blockDangerousWebsite', checkboxBlockWebsite.checked)
  },

  showHistory (show) {
    if (show) {
      document.querySelector('.historyModal').style.display = 'block'
      document.querySelector('.settings').style.overflow = 'hidden'
      this.listHistory()
    } else {
      document.querySelector('.historyModal').style.display = 'none'
      document.querySelector('.settings').style.overflow = 'auto'
    }
  },

  removeHistory (id) {
    files.history.remove({
      id: id
    })
    this.listHistory()
  },

  clearHistory () {
    files.history.resetHistory()
    this.listHistory()
  },

  listHistory () {
    let historyList = files.history.getHistory()
    let list = document.querySelector('.history-modale-list-wrapper')

    list.innerHTML = ''
    let color
    for (i in historyList) {

      color = (i%2 ? '#fafafa' : '#f1f1f1')

      list.innerHTML += `
      <div class="history-item" style="background-color: ${color}" title="${historyList[i].title} (${require('url').parse(historyList[i].url).hostname})">
        <span class="history-item-date">
          ${historyList[i].date}
        </span><span class="history-item-content">
          <span>${historyList[i].title}</span> (${require('url').parse(historyList[i].url).hostname})
        </span><span class="history-item-remove"><a href="#" onclick="settings.removeHistory(${historyList[i].id})">
          <img src="./assets/img/store/close.svg" alt="x">
        </a></span>
      </div>
      `
    }
  }
}

module.exports = settings