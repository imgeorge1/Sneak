import logo from './logo.svg';
import './App.css';

import 'firebase/compat/analytics';

import firebase from 'firebase/compat/app';
import 'firebase/compat/auth';
import 'firebase/compat/firestore';

import {useAuthState} from 'react-firebase-hooks/auth'
import {useCollectionData} from 'react-firebase-hooks/firestore'
import { useRef, useState} from 'react';

firebase.initializeApp({
  apiKey: "AIzaSyBevQ7cV8ghOK2dqgunYjj6N9_2TbBaGK8",
  authDomain: "sneak-7dd6e.firebaseapp.com",
  projectId: "sneak-7dd6e",
  storageBucket: "sneak-7dd6e.firebasestorage.app",
  messagingSenderId: "934205181331",
  appId: "1:934205181331:web:5f93f0929233c0a334ec66",
  measurementId: "G-YMGCX51QSS"
})

const auth = firebase.auth();
const firestore =firebase.firestore()


function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        <h1>Sneak</h1>
        <SignOut />
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>

    </div>
  );
}

function SignIn() {

  const signInWithGoogle = () => {
    const provider = new firebase.auth.GoogleAuthProvider();
    auth.signInWithPopup(provider);
  }

  return (
    <>
      <button className="sign-in" onClick={signInWithGoogle}>Sign in with Google</button>
      <p>made by zuba because galazy got banned on discord :D</p>
    </>
  )

}

function SignOut() {
  return auth.currentUser && (
    <button className="sign-out" onClick={() => auth.signOut()}>Sign Out</button>
  )
}


function ChatRoom() {
  const dummy = useRef();
  const messagesRef = firestore.collection('messages');
  const query = messagesRef.orderBy('createdAt', 'desc').limit(25);

  const [messages] = useCollectionData(query, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await messagesRef.add({
      text: formValue,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      uid,
      photoURL
    });

    setFormValue('');
    dummy.current?.scrollIntoView({ behavior: 'smooth' });
    const snapshot = await messagesRef.orderBy('createdAt', 'desc').get();
    if (snapshot.size > 25) {
      const oldMessages = snapshot.docs.slice(25); // skip the first 25
      const batch = firestore.batch();
      oldMessages.forEach(doc => batch.delete(doc.ref));
      await batch.commit();
    }
  }
//
  // DANGEROUS CODE!!!! ONLY UNCOMMENT WHEN YOU"RE SURE WHAT IT DOES
    // const deleteAllMessages = async () => {
    //   const snapshot = await messagesRef.get();
    //   const batch = firestore.batch();
    
    //   snapshot.forEach((doc) => {
    //     batch.delete(doc.ref);
    //   });
    
    //   await batch.commit();
    //   console.log('All messages deleted');
    // };
  // DANGEROUS CODE!!!! ONLY UNCOMMENT WHEN YOU"RE SURE WHAT IT DOES
//
  return (
    <>
      <main>
        {messages &&
          [...messages] // copy
            .reverse()   // fix the order
            .map(msg => <ChatMessage key={msg.id} message={msg} />)}

        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        
        <input
          value={formValue}
          onChange={(e) => setFormValue(e.target.value)}
          placeholder="say something nice"
        />
        <button type="submit" disabled={!formValue}>🕊️</button>
      </form>
    </>
  );
}



function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;

  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  return (<>
    <div className={`message ${messageClass}`}>
      <img src={photoURL || 'https://api.adorable.io/avatars/23/abott@adorable.png'} />
      <p>{text}</p>
    </div>
  </>)
}





export default App;
