import Vue from 'vue'
import * as firebase from 'firebase/app'
import store from '@/store'

// Add the Firebase products that you want to use
import 'firebase/auth'
import 'firebase/firestore'

// import firebaseConfig from '../../fierbaseConfig'
import configs from '../configs'

// Initialize Firebase
firebase.initializeApp(configs.FIREBASE_CONFIG)

Vue.prototype.$firebase = firebase

firebase.auth().onAuthStateChanged((user) => {
  store.dispatch('getUser', user)
})
