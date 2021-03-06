import Vue from 'vue'
import Vuex from './vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    a: {
      state: {
        a: 1
      },
      modules: {
        b: {
          state: {
            b: 2
          }
        }
      }
    }
  },
  state: {
    count: 1
  },
  getters: {
    getCount (state) {
      return state.count + 2
    }
  },
  mutations: {
    setCount (state) {
      state.count += 2
    }
  },
  actions: {
    updateCount ({commit}) {
      setTimeout(() => {
        commit('setCount')
      }, 1000);
    }
  }
})