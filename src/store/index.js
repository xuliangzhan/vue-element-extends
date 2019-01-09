import Vue from 'vue'
import Vuex from 'vuex'

import event from './modules/event'

Vue.use(Vuex)

const store = new Vuex.Store({
  modules: { event }
})

window.addEventListener('click', evnt => store.dispatch('triggerEvent', evnt))

export default store
