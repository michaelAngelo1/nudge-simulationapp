import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient"
import { useNavigate } from "react-router-dom";

export default function SurveyHome() {

  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState(''); 
  
  async function getLoggedInUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if(user) {
      setUserEmail(user.user_metadata.email);
    }
  }

  async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if(data && data.session) {
      getLoggedInUser();
    } else {
      navigate('/');
    }
    if(error) {
      console.log(error);
    }
  }

  async function userSignOut() {
    const { error } = await supabase.auth.signOut();
    if(error) {
      throw new Error('Error while signing out');
    } else {
      getCurrentSession();
    }
  }

  useEffect(() => {
    getCurrentSession();
  }, [])
  

  return (
    <div className="flex flex-col">
      <div>Welcome, {userEmail}</div>
      <button onClick={userSignOut}>Sign out</button>
    </div>
  )
}
