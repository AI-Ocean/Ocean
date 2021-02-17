import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

// const adminCheck = (to, from, next) => {
//   if (!store.state.user) {
//     if (to.path !== '/sign') return next('/sign')
//   } else {
//     // if (!store.state.user.emailVerified) return next('/profile')
//     if (!store.getters.isAdmin) throw Error('Only allow to Admin.')
//     next()
//   }
// }

// const userCheck = (to, from, next) => {
//   if (!store.state.user) {
//     if (to.path !== '/sign') return next('/sign')
//   } else {
//     next()
//   }
// }

const roleCheck = (to, from, next) => {
  // user check
  if (!store.state.user) {
    if (to.path !== '/sign') return next('/sign')
  }
  // admin check
  if (to.path.substring(0, 7) === '/admin' && !store.getters.isAdmin) {
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
      if (store.state.user) return next('/')
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

// const waitFirebase = () => {
//   return new Promise((resolve, reject) => {
//     let count = 0
//     const tmr = setInterval(() => {
//       if (store.state.firebaseLoaded) {
//         clearInterval(tmr)
//         resolve()
//       } else if (count++ > 500) {
//         clearInterval(tmr)
//         reject(Error('Firebase load time exceeded'))
//       }
//     }, 10)
//   })
// }

const init = () => {
  return new Promise((resolve, reject) => {
    let count = 0
    const tmr = setInterval(() => {
      if (store.state.isInit) {
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
