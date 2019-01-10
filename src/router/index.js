import Vue from 'vue'
import Router from 'vue-router'
import EditableDemo1 from '@/views/editable/Demo1'
import EditableDemo2 from '@/views/editable/Demo2'

Vue.use(Router)

export default new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      redirect: {
        name: 'EditableDemo1'
      }
    },
    {
      path: '/demo/editable1',
      name: 'EditableDemo1',
      component: EditableDemo1
    },
    {
      path: '/demo/editable2',
      name: 'EditableDemo2',
      component: EditableDemo2
    }
  ]
})
