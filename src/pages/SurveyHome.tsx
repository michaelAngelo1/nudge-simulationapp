import { useEffect } from "react";
import supabase from "../database/supabaseClient"
import { Link, useNavigate } from "react-router-dom";
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
    <div className="p-3 h-screen flex flex-col space-y-3 justify-center items-center max-mobile:justify-center max-tablet:justify-center">
      <div className="text-center text-xl font-medium">
        Welcome, {user?.email}
      </div>
      <div className="text-center">
        Start if you are ready to take the study
      </div>
      <Link 
        className="btn btn-primary text-base" 
        to="/surveyForms">
        Let's start
      </Link>
    </div>

  )
}
