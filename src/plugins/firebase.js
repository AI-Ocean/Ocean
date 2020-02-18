import Vue from 'vue'
import * as firebase from 'firebase/app'

// Add the Firebase products that you want to use
import 'firebase/auth'
import 'firebase/firestore'

import firebaseConfig from '../../firebase.config'

// Initialize Firebase
firebase.initializeApp(firebaseConfig)

Vue.prototype.$firebase = firebase

export default {
}
