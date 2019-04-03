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
    return cell.className.split(' ').includes(cls)
  },
  removeClass (cell, clss) {
    let classList = []
    cell.className.split(' ').forEach(name => {
      if (clss.indexOf(name) === -1) {
        classList.push(name)
      }
    })
    cell.className = classList.join(' ')
  }
}

export default UtilHandle
