import Vue from 'vue'
import VueRouter from 'vue-router'
import Home from '../views/Home.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import(/* webpackChunkName: "about" */ '../views/Dashboard.vue')
  },
  {
    path: '/axios',
    name: 'axios',
    component: () => import(/* webpackChunkName: "about" */ '../views/lectures/axios.vue')
  },
  {
    path: '/sign',
    name: 'sign',
    component: () => import(/* webpackChunkName: "about" */ '../views/sign.vue')
  },
  {
    path: '/about',
    name: 'about',
    component: () => import(/* webpackChunkName: "about" */ '../views/About.vue')
  },
  {
    path: '/about2',
    name: 'about2',
    component: () => import('../views/About2.vue')
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

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
