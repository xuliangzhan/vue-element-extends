import Vue from 'vue'
import App from './App.vue'
import router from './router'

import 'font-awesome/css/font-awesome.css'
import './plugins/element.js'
import './plugins/element-extends.js'
// import './plugins/iview.js'

Vue.config.productionTip = false

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
