import Vue from 'vue'
import axios from 'axios'
import store from '../store'

const localAPI = axios.create({
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
})

localAPI.interceptors.request.use((req) => {
  req.headers.authorization = 'Bearer ' + store.state.token
  return req
}, (error) => {
  console.log(error)
  return Promise.reject(error)
})

localAPI.interceptors.response.use((res) => {
  return res
}, async (err) => {
  if (err.response.status === 403 && err.config.resend === undefined) {
    err.config.resend = true
    await store.dispatch('getUser', store.state.user)
    return localAPI(err.config)
  }
  return Promise.reject(err)
})

Vue.prototype.$axios = localAPI
