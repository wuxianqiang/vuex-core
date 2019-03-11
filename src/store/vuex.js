let Vue;

class ModuleCollection {
  constructor (options) {
    this.register([], options)
  }
  register (path, rawModule) {
    let newModule = {
      _raw: rawModule,
      _children: {},
      state: rawModule.state
    }
    if (path.length === 0) {
      // 跟模块
      this.root = newModule
    } else {
      // 子模块
      let parent = path.slice(0, -1).reduce((prev, cur) => {
        return prev._children[cur]
      }, this.root)
      parent._children[path[path.length - 1]] = newModule
    }
    if (rawModule.modules) {
      // 递归
      forEach(rawModule.modules, (childName, module) => {
        this.register(path.concat(childName), module)
      })
    }
  }
}

function installModule (store, rootState, path, rootModule) {
  if (path.length > 0) {
    // state必须定义成响应式的数据
    let parent = path.slice(0, -1).reduce((root, current) => {
      return rootState[current]
    }, rootState)
    Vue.set(parent, path[path.length - 1], rootModule.state)
  }
  if (rootModule._raw.getters) {
    forEach(rootModule._raw.getters, (getterName, getterFn) => {
      Object.defineProperty(store.getters, getterName, {
        get: () => {
          return getterFn(rootModule.state)
        }
      })
    })
  }
  // actions mutation 都是通过一个数组存放，没有分层处理
  if (rootModule._raw.actions) {
    forEach(rootModule._raw.actions, (actionName, actionFn) => {
      let entry = store.actions[actionName] || (store.actions[actionName] = [])
      entry.push(() => {
        actionFn.call(store, store)
      })
    })
  }
  if (rootModule._raw.mutations) {
    forEach(rootModule._raw.mutations, (mutationName, mutationFn) => {
      let entry = store.mutations[mutationName] || (store.mutations[mutationName] = [])
      entry.push(() => {
        mutationFn.call(store, rootModule.state)
      })
    })
  }
  forEach(rootModule._children, (childName, module) => {
    installModule(store, rootState, path.concat(childName), module)
  })
}

class Store {
  constructor (options) {
    this.getters = {}
    this.mutations = {}
    this.actions = {}
    let state = options.state
    this._vm = new Vue({
      data: {
        state
      }
    })
    // 计算模块之间的依赖关系
    this.modules = new ModuleCollection(options)
    // 安装模块，从跟开始安装模块
    installModule(this, state, [], this.modules.root)

    let {commit, dispatch} = this
    this.commit = (type) => {
      commit.call(this, type)
    }
    this.dispatch = (type) => {
      dispatch.call(this, type)
    }
  }
  get state () {
    return this._vm.state
  }
  commit (type) {
    this.mutations[type].forEach(fn => fn())
  }
  dispatch (type) {
    this.actions[type].forEach(fn => fn())
  }
}

function forEach (obj, cb) {
  Object.keys(obj).forEach(item => {
    cb(item, obj[item])
  })
}

let install = (_Vue) => {
  Vue = _Vue
  Vue.mixin({
    beforeCreate() {
      // 所有组件都共用一个store，通过混合注入
      if (this.$options && this.$options.store) {
        this.$store = this.$options.store
      } else {
        this.$store = this.$parent && this.$parent.$store
      }
    }
  })
}

export default {
  install,
  Store
}
