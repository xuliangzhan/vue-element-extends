import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import './plugins/element.js'

import Editable from '@/components/Editable.vue'
import EditableColumn from '@/components/EditableColumn.vue'

Vue.component(Editable.name, Editable)
Vue.component(EditableColumn.name, EditableColumn)

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
