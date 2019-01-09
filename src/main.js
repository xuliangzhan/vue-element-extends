// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import XEUtils from 'xe-utils'
import VXEUtils from 'vxe-utils'

import App from './App'
import store from '@/store'
import router from './router'

import Editable from '@/components/Editable.vue'
import EditableColumn from '@/components/EditableColumn.vue'

import {
  Dialog,
  Switch,
  Input,
  InputNumber,
  Select,
  Option,
  OptionGroup,
  Button,
  ButtonGroup,
  Cascader,
  Table,
  TableColumn,
  DatePicker,
  Tree
} from 'element-ui'

Vue.component(Editable.name, Editable)
Vue.component(EditableColumn.name, EditableColumn)

Vue.use(Dialog)
Vue.use(Switch)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Select)
Vue.use(Option)
Vue.use(OptionGroup)
Vue.use(Button)
Vue.use(ButtonGroup)
Vue.use(Cascader)
Vue.use(Table)
Vue.use(TableColumn)
Vue.use(DatePicker)
Vue.use(Tree)

Vue.use(VXEUtils, XEUtils)
Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  store,
  router,
  components: { App },
  template: '<App/>'
})
