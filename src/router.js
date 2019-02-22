import Vue from 'vue'
import Router from 'vue-router'

import EditableManual1 from '@/views/editable/Manual1'
import EditableManual2 from '@/views/editable/Manual2'
import EditableManual3 from '@/views/editable/Manual3'
import EditableManual4 from '@/views/editable/Manual4'
import EditableClick1 from '@/views/editable/Click1'
import EditableClick2 from '@/views/editable/Click2'
import EditableClick3 from '@/views/editable/Click3'
import EditableClick4 from '@/views/editable/Click4'
import EditableClick5 from '@/views/editable/Click5'
import EditableClick6 from '@/views/editable/Click6'
import EditableClick7 from '@/views/editable/Click7'
import EditableClick8 from '@/views/editable/Click8'
import EditableClick9 from '@/views/editable/Click9'
import EditableClick10 from '@/views/editable/Click10'
import EditableClick11 from '@/views/editable/Click11'
import EditableClick12 from '@/views/editable/Click12'
import EditableClick13 from '@/views/editable/Click13'
import EditableDblclick1 from '@/views/editable/Dblclick1'
import EditableDblclick2 from '@/views/editable/Dblclick2'
import EditableDblclick3 from '@/views/editable/Dblclick3'
import EditableDblclick4 from '@/views/editable/Dblclick4'
import EditableDblclick5 from '@/views/editable/Dblclick5'
import EditableDblclick6 from '@/views/editable/Dblclick6'
import EditableExcel1 from '@/views/editable/Excel1'
import EditableExcel2 from '@/views/editable/Excel2'
import EditableExcel3 from '@/views/editable/Excel3'
import EditableExcel4 from '@/views/editable/Excel4'

Vue.use(Router)

export default new Router({
  mode: 'hash',
  base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      redirect: {
        name: 'EditableClick1'
      }
    },
    {
      path: '/editable/manual1',
      name: 'EditableManual1',
      component: EditableManual1
    },
    {
      path: '/editable/manual2',
      name: 'EditableManual2',
      component: EditableManual2
    },
    {
      path: '/editable/manual3',
      name: 'EditableManual3',
      component: EditableManual3
    },
    {
      path: '/editable/manual4',
      name: 'EditableManual4',
      component: EditableManual4
    },
    {
      path: '/editable/click1',
      name: 'EditableClick1',
      component: EditableClick1
    },
    {
      path: '/editable/click2',
      name: 'EditableClick2',
      component: EditableClick2
    },
    {
      path: '/editable/click3',
      name: 'EditableClick3',
      component: EditableClick3
    },
    {
      path: '/editable/click4',
      name: 'EditableClick4',
      component: EditableClick4
    },
    {
      path: '/editable/click5',
      name: 'EditableClick5',
      component: EditableClick5
    },
    {
      path: '/editable/click6',
      name: 'EditableClick6',
      component: EditableClick6
    },
    {
      path: '/editable/click7',
      name: 'EditableClick7',
      component: EditableClick7
    },
    {
      path: '/editable/click8',
      name: 'EditableClick8',
      component: EditableClick8
    },
    {
      path: '/editable/click9',
      name: 'EditableClick9',
      component: EditableClick9
    },
    {
      path: '/editable/click10',
      name: 'EditableClick10',
      component: EditableClick10
    },
    {
      path: '/editable/click11',
      name: 'EditableClick11',
      component: EditableClick11
    },
    {
      path: '/editable/click12',
      name: 'EditableClick12',
      component: EditableClick12
    },
    {
      path: '/editable/click13',
      name: 'EditableClick13',
      component: EditableClick13
    },
    {
      path: '/editable/dblclick1',
      name: 'EditableDblclick1',
      component: EditableDblclick1
    },
    {
      path: '/editable/dblclick2',
      name: 'EditableDblclick2',
      component: EditableDblclick2
    },
    {
      path: '/editable/dblclick3',
      name: 'EditableDblclick3',
      component: EditableDblclick3
    },
    {
      path: '/editable/dblclick4',
      name: 'EditableDblclick4',
      component: EditableDblclick4
    },
    {
      path: '/editable/dblclick5',
      name: 'EditableDblclick5',
      component: EditableDblclick5
    },
    {
      path: '/editable/dblclick6',
      name: 'EditableDblclick6',
      component: EditableDblclick6
    },
    {
      path: '/editable/excel1',
      name: 'EditableExcel1',
      component: EditableExcel1
    },
    {
      path: '/editable/excel2',
      name: 'EditableExcel2',
      component: EditableExcel2
    },
    {
      path: '/editable/excel3',
      name: 'EditableExcel3',
      component: EditableExcel3
    },
    {
      path: '/editable/excel4',
      name: 'EditableExcel4',
      component: EditableExcel4
    }
  ]
})
