import React, { useState, useEffect } from 'react';
import { auth, db } from './firebase';
import { signOut, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { collection, addDoc, query, where, getDocs } from 'firebase/firestore'; // Añadido addDoc
import { useNavigate } from 'react-router-dom';

function Home() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const signUp = async () => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null);

      // Guardar el usuario en Firestore
      await addDoc(collection(db, 'users'), {
        uid: userCredential.user.uid,
        email: userCredential.user.email
      });
      console.log('User registered and saved in Firestore');

      // Redirigir al usuario a la URL personalizada
      const username = email.split('@')[0];
      navigate(`/dashboard/${username}/${userCredential.user.uid}`);
    } catch (error) {
      console.error('Error signing up: ', error);
      setError(error.message);
    }
  };

  const logIn = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      setError(null);

      // Redirigir al usuario a la URL personalizada
      const username = email.split('@')[0];
      navigate(`/dashboard/${username}/${userCredential.user.uid}`);
    } catch (error) {
      console.error('Error logging in: ', error);
      setError(error.message);
    }
  };

  const logOut = async () => {
    await signOut(auth);
    setUser(null);
    navigate('/');
  };

  const searchUsers = async () => {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('email', '>=', searchTerm), where('email', '<=', searchTerm + '\uf8ff'));
    const querySnapshot = await getDocs(q);
    const userList = [];
    querySnapshot.forEach((doc) => {
      userList.push({ id: doc.id, ...doc.data() });
    });
    setUsers(userList);
  };

  return (
    <div>
      <h1>Firebase Authentication</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {user ? (
        <div>
          <p>Welcome, {user.email}</p>
          <button onClick={logOut}>Log Out</button>
          <div>
            <input
              type="text"
              placeholder="Search users"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button onClick={searchUsers}>Search</button>
            <ul>
              {users.map((user) => (
                <li key={user.id}>
                  {user.email}
                  <button onClick={() => navigate(`/chat/${user.id}`)}>Chat</button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div>
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button onClick={signUp}>Sign Up</button>
          <button onClick={logIn}>Log In</button>
        </div>
      )}
    </div>
  );
}

export default Home;
