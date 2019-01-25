import Vue from 'vue'
import Router from 'vue-router'

import EditableManual1 from '@/views/editable/Manual1'
import EditableClick1 from '@/views/editable/Click1'
import EditableClick2 from '@/views/editable/Click2'
import EditableClick3 from '@/views/editable/Click3'
import EditableClick4 from '@/views/editable/Click4'
import EditableClick5 from '@/views/editable/Click5'
import EditableClick6 from '@/views/editable/Click6'
import EditableClick7 from '@/views/editable/Click7'
import EditableClick8 from '@/views/editable/Click8'
import EditableClick9 from '@/views/editable/Click9'
import EditableDblclick1 from '@/views/editable/Dblclick1'
import EditableDblclick2 from '@/views/editable/Dblclick2'
import EditableDblclick3 from '@/views/editable/Dblclick3'
import EditableExcel1 from '@/views/editable/Excel1'
import EditableExcel2 from '@/views/editable/Excel2'
import EditableExcel3 from '@/views/editable/Excel3'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: {
        name: 'EditableManual1'
      }
    },
    {
      path: '/demo/editable/manual1',
      name: 'EditableManual1',
      component: EditableManual1
    },
    {
      path: '/demo/editable/click1',
      name: 'EditableClick1',
      component: EditableClick1
    },
    {
      path: '/demo/editable/click2',
      name: 'EditableClick2',
      component: EditableClick2
    },
    {
      path: '/demo/editable/click3',
      name: 'EditableClick3',
      component: EditableClick3
    },
    {
      path: '/demo/editable/click4',
      name: 'EditableClick4',
      component: EditableClick4
    },
    {
      path: '/demo/editable/click5',
      name: 'EditableClick5',
      component: EditableClick5
    },
    {
      path: '/demo/editable/click6',
      name: 'EditableClick6',
      component: EditableClick6
    },
    {
      path: '/demo/editable/click7',
      name: 'EditableClick7',
      component: EditableClick7
    },
    {
      path: '/demo/editable/click8',
      name: 'EditableClick8',
      component: EditableClick8
    },
    {
      path: '/demo/editable/click9',
      name: 'EditableClick9',
      component: EditableClick9
    },
    {
      path: '/demo/editable/dblclick1',
      name: 'EditableDblclick1',
      component: EditableDblclick1
    },
    {
      path: '/demo/editable/dblclick2',
      name: 'EditableDblclick2',
      component: EditableDblclick2
    },
    {
      path: '/demo/editable/dblclick3',
      name: 'EditableDblclick3',
      component: EditableDblclick3
    },
    {
      path: '/demo/editable/excel1',
      name: 'EditableExcel1',
      component: EditableExcel1
    },
    {
      path: '/demo/editable/excel2',
      name: 'EditableExcel2',
      component: EditableExcel2
    },
    {
      path: '/demo/editable/excel3',
      name: 'EditableExcel3',
      component: EditableExcel3
    }
  ]
})
