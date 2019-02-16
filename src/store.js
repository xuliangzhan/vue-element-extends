import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    click: null
  },
  getters: {
    globalClick: state => state.click
  },
  mutations: {
    setEvent (state, evnt) {
      state[evnt.type] = evnt
    }
  },
  actions: {

  }
})

window.addEventListener('click', evnt => store.commit('setEvent', evnt))

export default store
