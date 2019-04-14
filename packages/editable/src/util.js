import XEUtils from 'xe-utils'

const browse = XEUtils.browse()
const UtilHandle = {
  addClass (cell, clss) {
    let classList = cell.className.split(' ')
    clss.forEach(name => {
      if (classList.indexOf(name) === -1) {
        classList.push(name)
      }
    })
    cell.className = classList.join(' ')
  },
  hasClass (cell, cls) {
    return cell && cell.className && cell.className.split(' ').includes(cls)
  },
  removeClass (cell, clss) {
    let classList = []
    cell.className.split(' ').forEach(name => {
      if (clss.indexOf(name) === -1) {
        classList.push(name)
      }
    })
    cell.className = classList.join(' ')
  },
  getCsvUrl (opts, content) {
    if (window.Blob && window.URL && window.URL.createObjectURL && !browse.safari) {
      return URL.createObjectURL(new Blob([content], { type: 'text/csv' }))
    }
    return `data:attachment/csv;charset=utf-8,${encodeURIComponent(content)}`
  },
  downloadCsc (opts, content) {
    if (navigator.msSaveBlob && window.Blob) {
      navigator.msSaveBlob(new Blob([content], { type: 'text/csv' }), opts.filename)
    } else if (browse['-ms']) {
      var win = window.top.open('about:blank', '_blank')
      win.document.charset = 'utf-8'
      win.document.write(content)
      win.document.close()
      win.document.execCommand('SaveAs', opts.filename)
      win.close()
    } else {
      var linkElem = document.createElement('a')
      linkElem.target = '_blank'
      linkElem.download = opts.filename
      linkElem.href = UtilHandle.getCsvUrl(opts, content)
      document.body.appendChild(linkElem)
      linkElem.click()
      document.body.removeChild(linkElem)
    }
  },
  getCsvContent (opts, csvData) {
    let isOriginal = opts.original
    let { columns, datas } = csvData
    let content = '\ufeff'
    datas.forEach((record, rowIndex) => {
      if (isOriginal) {
        content += columns.map(column => {
          if (column.type === 'index') {
            return column.index ? column.index(rowIndex) : rowIndex + 1
          }
          return XEUtils.get(record, column.property) || ''
        }).join(',') + '\n'
      } else {
        content += columns.map(column => record[column.id]).join(',') + '\n'
      }
    })
    return content
  }
}

export default UtilHandle
