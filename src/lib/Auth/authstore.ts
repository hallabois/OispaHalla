import { readable } from 'svelte/store'
import { browser } from '$app/env'
import type { Auth, User } from "firebase/auth"
import { actionCodeSettings } from './firebase_config'

const createAuth = () => {
  let auth: Auth

  const { subscribe } = readable<User>(undefined, set => {
    let unsubscribe = () => {}

    async function listen() {
      if (browser) {
        const { app } = await import('./firebase_config')
        const { getAuth, onAuthStateChanged } = await import('firebase/auth')

        auth = getAuth(app)

        unsubscribe = onAuthStateChanged(auth, set)
      } else {
        set(null)
      }
    }

    listen()

    return () => unsubscribe()
  })

  async function providerFor(name: string) {
    const { GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider } = await import('firebase/auth')
    switch (name) {
      case 'google':   return new GoogleAuthProvider()
      case 'github':   return new GithubAuthProvider()
      case 'twitter':  return new TwitterAuthProvider()
      default:         throw 'unknown provider ' + name
    }
  }

  async function signInWith(name: string) {
    const { signInWithRedirect } = await import('firebase/auth')
    const provider = await providerFor(name)
    await signInWithRedirect(auth, provider)
  }

  async function sendSignInLink(email: string) {
    const { sendSignInLinkToEmail } = await import('firebase/auth');
    try {
      await sendSignInLinkToEmail(auth, email, actionCodeSettings);
      return true;
    }
    catch(e){
      console.warn(e);
    };
    return false;
  }

  async function signOut() {
    const { signOut } = await import('firebase/auth')
    clearTraces();
    await signOut(auth)
  }

  function clearTraces() {
    console.clear();
    console.info("Signed out, have a good day!");
    localStorage.clear();
  }

  return {
    subscribe,
    signInWith,
    sendSignInLink,
    signOut,
  }
}

export const auth = createAuth()