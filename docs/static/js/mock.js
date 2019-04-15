onmessage = function (event) {
  var list = []
  var currTime = Date.now()
  var fullIndex = 0
  var size = event.data.size
  var setData = function () {
    for (var index = 0; index < 2000; index++) {
      currTime += 5000
      fullIndex++
      list.push({
        _index: fullIndex,
        id: 10000 + fullIndex,
        name: 'name_' + fullIndex,
        date: currTime,
        sex: index % 3 ? '0' : '1',
        age: index % 4 === 0 ? 30 : index % 3 === 0 ? 28 : index % 2 === 0 ? 26 : 24,
        region: index % 4 === 0 ? [19, 199, 1773] : index % 3 === 0 ? [9, 73, 719] : [1, 1, 5],
        rate: index % 4 === 0 ? 4 : index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1,
        updateTime: currTime,
        createTime: currTime
      })
    }
    if (fullIndex >= size) {
      self.postMessage({ size: size, list: list })
    } else {
      setTimeout(setData, 50)
    }
  }
  setData()
}
