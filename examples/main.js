import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'font-awesome/css/font-awesome.css'
import './plugins/element.js'
import './plugins/element-extends.js'
import './mock'
// import './plugins/iview.js'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')

// 后台异步生成70万数据
var list = window.CACHE_DATA_LIST = []
var currTime = Date.now()
var fullIndex = 0
var size = 700000
function mockData () {
  for (var index = 0; index < 1500; index++) {
    currTime += 5000
    fullIndex++
    list.push({
      id: fullIndex,
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
  if (fullIndex < size) {
    setTimeout(mockData, 50)
  }
}

setTimeout(mockData, 100)
