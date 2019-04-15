onmessage = function (event) {
  var list = []
  var currTime = Date.now()
  var size = event.data.size
  for (var index = 0; index < size; index++) {
    currTime += 5000
    list.push({
      _index: index + 1,
      id: 10000 + index,
      name: 'name_' + index,
      date: currTime,
      sex: index % 3 ? '0' : '1',
      age: index % 4 === 0 ? 30 : index % 3 === 0 ? 28 : index % 2 === 0 ? 26 : 24,
      region: index % 4 === 0 ? [19, 199, 1773] : index % 3 === 0 ? [9, 73, 719] : [1, 1, 5],
      rate: index % 4 === 0 ? 4 : index % 3 === 0 ? 3 : index % 2 === 0 ? 2 : 1,
      updateTime: currTime,
      createTime: currTime
    })
  }
  self.postMessage({ size: size, list: list })
}
