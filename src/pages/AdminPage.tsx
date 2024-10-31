import { useNavigate } from "react-router-dom";
import { useGetUser } from "../hooks/useGetUser"
import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient";

export default function AdminPage() {
  const { user } = useGetUser();
  const navigate = useNavigate();
  const [validate, setValidate] = useState(true);

  const validateAdmin = () => {
    if(user && user.email) {
      if(user.email.includes('admin') == false) {
        setValidate(false);
        alert('You are not authorized to access this page');
        navigate('/surveyHome')
      }
    }
  }

  async function fetchAllUserResponses() {
    if(validate) {
      const { data, error } = await supabase
        .from('user_responses')
        .select('*')
      
      if(error) {
        console.log('Error while fetching user responses');
      }
      if(data) {
        console.log(data);
      }
    } else {
      console.log('user not authorized');
    }
  }

  useEffect(() => {
    validateAdmin();
  }, [user])

  useEffect(() => {
    fetchAllUserResponses();
  }, [validate])
  
  
  if(validate == false) {
    return <div></div>
  }
  return (
    <div className="p-3 h-screen flex flex-col space-y-3 max-mobile:justify-center max-tablet:justify-center">
      <div className="text-xl font-medium">
        Welcome, {user?.email}
      </div>
      <div className="">
        List of User Responses
      </div>
      <div className="">
        List of User Page Time Spent
      </div>
    </div>
  )
}
