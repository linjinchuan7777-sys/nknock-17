import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';

const firebaseConfig = {
  apiKey: "AIzaSyAmoW8QnsjIJf2_n1P-qNe7cNmpqW3SM9o",
  authDomain: "project-5995689044921351338.firebaseapp.com",
  projectId: "project-5995689044921351338",
  storageBucket: "project-5995689044921351338.firebasestorage.app",
  messagingSenderId: "918256635786",
  appId: "1:918256635786:web:092d866d016c8ab9dac273",
  measurementId: "G-QPZYQYNWSM"
};

// 初始化 Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const auth = firebase.auth();
export const googleProvider = new firebase.auth.GoogleAuthProvider();
export default firebase;
