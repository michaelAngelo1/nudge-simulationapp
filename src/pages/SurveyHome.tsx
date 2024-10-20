import { useEffect } from "react";
import supabase from "../database/supabaseClient"
import { useNavigate } from "react-router-dom";
import { useGetUser } from "../hooks/useGetUser";

export default function SurveyHome() {
  
  const { user } = useGetUser();
  const navigate = useNavigate();

  async function getCurrentSession() {
    const { data, error } = await supabase.auth.getSession();
    if(data && data.session) {
      console.log('user is logged in');
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
      console.log('user signed out');
    }
  }

  useEffect(() => {
    getCurrentSession();
  }, [])
  

  return (
    <div className="flex flex-col">
      <div>Welcome, {user?.email}</div>
      <button onClick={userSignOut}>Sign out</button>
    </div>
  )
}
