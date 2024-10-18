import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient"

export default function SurveyHome() {

  const [userEmail, setUserEmail] = useState(''); 
  
  async function getLoggedInUser() {
    const { data: { user } } = await supabase.auth.getUser()
    if(user) {
      setUserEmail(user.user_metadata.email);
    }
  }

  useEffect(() => {
    getLoggedInUser();
  }, [])
  
  return (
    <div>Welcome, {userEmail}</div>
  )
}
