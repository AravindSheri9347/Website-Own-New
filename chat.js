import { app } from "./firebase.js";

import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

import { 
  getFirestore, addDoc, collection, 
  serverTimestamp, query, orderBy, onSnapshot 
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const auth = getAuth(app);
const db = getFirestore(app);

window.sendMsg = async function () {
  const text = document.getElementById("msg").value;

  await addDoc(collection(db, "messages"), {
    text,
    uid: auth.currentUser.uid,
    time: serverTimestamp()
  });

  document.getElementById("msg").value = "";
};

const messagesDiv = document.getElementById("messages");

const q = query(collection(db, "messages"), orderBy("time"));

onSnapshot(q, (snapshot) => {
  messagesDiv.innerHTML = "";

  snapshot.forEach(doc => {
    const data = doc.data();

    const div = document.createElement("div");
    div.innerText = data.uid + ": " + data.text;

    messagesDiv.appendChild(div);
  });
});
