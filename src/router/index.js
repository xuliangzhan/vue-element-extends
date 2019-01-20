import Vue from 'vue'
import Router from 'vue-router'

import EditableDemo1 from '@/views/editable/Demo1'
import EditableDemo2 from '@/views/editable/Demo2'
import EditableDemo3 from '@/views/editable/Demo3'
import EditableDemo4 from '@/views/editable/Demo4'
import EditableDemo5 from '@/views/editable/Demo5'
import EditableDemo6 from '@/views/editable/Demo6'
import EditableDemo7 from '@/views/editable/Demo7'
import EditableDemo8 from '@/views/editable/Demo8'

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
    },
    {
      path: '/demo/editable3',
      name: 'EditableDemo3',
      component: EditableDemo3
    },
    {
      path: '/demo/editable4',
      name: 'EditableDemo4',
      component: EditableDemo4
    },
    {
      path: '/demo/editable5',
      name: 'EditableDemo5',
      component: EditableDemo5
    },
    {
      path: '/demo/editable6',
      name: 'EditableDemo6',
      component: EditableDemo6
    },
    {
      path: '/demo/editable7',
      name: 'EditableDemo7',
      component: EditableDemo7
    },
    {
      path: '/demo/editable8',
      name: 'EditableDemo8',
      component: EditableDemo8
    }
  ]
})
