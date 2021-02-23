import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const roleCheck = (to, from, next) => {
  // token check
  if (store.state.userStore.token) {
    var payload = JSON.parse(atob(store.state.userStore.token.split('.')[1]))
    if (payload.exp - (Date.now() / 1000) < 0) {
      store.dispatch('signOut')
      next('/sign')
    }
  }
  // user check
  if (!store.state.userStore.user) {
    if (to.path !== '/sign') return next('/sign')
  }
  // admin check
  if (to.path.substring(0, 7) === '/admin' && !store.userStore.getters.isAdmin) {
    throw Error('Only allow to Admin.')
  }
  return next()
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: roleCheck
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import(/* webpackChunkName: "core" */ '../views/Sign.vue'),
    beforeEnter: (to, from, next) => {
      if (store.state.userStore.user) return next('/')
      next()
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "core" */ '../views/Dashboard.vue'),
    beforeEnter: roleCheck
  },
  {
    path: '/instances',
    name: 'instances',
    component: () => import(/* webpackChunkName: "core" */ '../views/Instances.vue'),
    beforeEnter: roleCheck
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "core" */ '../views/Profile.vue'),
    beforeEnter: roleCheck
  },
  {
    path: '/admin/users',
    name: 'users',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/Users.vue'),
    beforeEnter: roleCheck
  },
  {
    path: '/admin/settings',
    name: 'settings',
    component: () => import(/* webpackChunkName: "admin" */ '../views/admin/Settings.vue'),
    beforeEnter: roleCheck
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "core" */ '../views/About.vue'),
    beforeEnter: roleCheck
  },
  {
    path: '/*',
    name: 'e404',
    component: () => import(/* webpackChunkName: "core" */ '../views/e404.vue')
  }
]

const init = () => {
  return new Promise((resolve, reject) => {
    let count = 0
    const tmr = setInterval(() => {
      if (store.state.userStore.isInit) {
        clearInterval(tmr)
        resolve()
      } else if (count++ > 500) {
        clearInterval(tmr)
        reject(Error('init time exceeded'))
      }
    }, 10)
  })
}

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

router.beforeEach((to, from, next) => {
  Vue.prototype.$Progress.start()
  init().then(() => {
    next()
  }).catch(e => Vue.prototype.$toasted.error(e.message))
})

router.afterEach((to, from) => {
  Vue.prototype.$Progress.finish()
})

router.onError(e => {
  Vue.prototype.$Progress.finish()
  Vue.prototype.$toasted.error(e.message)
})

export default router
