import firebase from 'firebase/app' //必須
import 'firebase/firestore'
import 'firebase/storage'

const firebaseConfig = {
  apiKey: 'AIzaSyD2C_v5PZg-yrlXoDfdJOC5IGBGcmgllKY',
  authDomain: 'wedding-sample-public.firebaseapp.com',
  projectId: 'wedding-sample-public',
  storageBucket: 'wedding-sample-public.appspot.com',
  messagingSenderId: '974283901057',
  appId: '1:974283901057:web:7f86cd4504e5e17a61e580',
}

//インスタンスの初期化
firebase.initializeApp(firebaseConfig)

const firestore = firebase.firestore()
export const storage = firebase.storage()
export default firestore
