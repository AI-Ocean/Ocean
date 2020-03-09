import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '../store'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const adminCheck = (to, from, next) => {
  if (!store.state.user) {
    if (to.path !== '/sign') return next('/sign')
  } else {
    if (!store.state.user.emailVerified) return next('/profile')
    if (store.state.claims.level > 0) throw Error('Only allow to Admin.')
    next()
  }
}

const userCheck = (to, from, next) => {
  if (!store.state.user) {
    if (to.path !== '/sign') return next('/sign')
  } else {
    if (!store.state.user.emailVerified) return next('/profile')
    if (store.state.claims.level > 1) throw Error('Only allow to User.')
    next()
  }
}

const guestCheck = (to, from, next) => {
  if (!store.state.user) {
    if (to.path !== '/sign') return next('/sign')
  } else {
    if (!store.state.user.emailVerified) return next('/profile')
    if (store.state.claims.level > 2) throw Error('Only allow to Guest.')
    next()
  }
}

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
    beforeEnter: guestCheck
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import(/* webpackChunkName: "sign" */ '../views/sign.vue'),
    beforeEnter: (to, from, next) => {
      if (store.state.user) return next('/')
      next()
    }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "about" */ '../views/Dashboard.vue'),
    beforeEnter: guestCheck
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import(/* webpackChunkName: "about" */ '../views/Profile.vue'),
    beforeEnter: (to, from, next) => {
      if (!store.state.user) return next('/sign')
      next()
    }
  },
  {
    path: '/admin/users',
    name: 'users',
    component: () => import(/* webpackChunkName: "about" */ '../views/admin/users.vue'),
    beforeEnter: adminCheck
  },
  {
    path: '/test/lv0',
    name: 'lv0',
    component: () => import(/* webpackChunkName: "about" */ '../views/test/lv0.vue'),
    beforeEnter: adminCheck
  },
  {
    path: '/test/lv1',
    name: 'lv1',
    component: () => import(/* webpackChunkName: "about" */ '../views/test/lv1.vue'),
    beforeEnter: userCheck
  },
  {
    path: '/test/lv2',
    name: 'lv2',
    component: () => import(/* webpackChunkName: "about" */ '../views/test/lv2.vue'),
    beforeEnter: guestCheck
  },
  {
    path: '/axios',
    name: 'axios',
    component: () => import(/* webpackChunkName: "about" */ '../views/lectures/axios.vue')
  },
  {
    path: '/vuex',
    name: 'vuex',
    component: () => import(/* webpackChunkName: "about" */ '../views/lectures/vuex.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/card',
    name: 'card',
    component: () => import('../views/lectures/card')
  },
  {
    path: '/layout',
    name: 'layout',
    component: () => import('../views/lectures/layout')
  },
  {
    path: '/notes',
    name: 'notes',
    component: () => import('../views/lectures/notes')
  },
  {
    path: '/*',
    name: 'e404',
    component: () => import('../views/e404.vue')
  }
]

const waitFirebase = () => {
  return new Promise((resolve, reject) => {
    let count = 0
    const tmr = setInterval(() => {
      if (store.state.firebaseLoaded) {
        clearInterval(tmr)
        resolve()
      } else if (count++ > 200) {
        clearInterval(tmr)
        reject(Error('Firebase load time exceeded'))
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
  waitFirebase().then(() => {
    next()
  }).catch(e => Vue.prototype.$toasted.global.error(e.message))
})

router.afterEach((to, from) => {
  Vue.prototype.$Progress.finish()
})

router.onError(e => {
  Vue.prototype.$Progress.finish()
  Vue.prototype.$toasted.global.error(e.message)
})

export default router
