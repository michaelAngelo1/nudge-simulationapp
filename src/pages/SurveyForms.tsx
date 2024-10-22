import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient"
import { Question, SingleUserResponse } from "../interface/SurveyInterface";
import { useGetUser } from "../hooks/useGetUser";
import { useSession } from "../context/SessionContext";

export default function SurveyForms() {

  const { userId } = useGetUser();
  const { user } = useSession();
  console.log('logged in user: ', user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [selectedOption, setSelectedOption] = useState<{[key: string]: string[] }>({}); 

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('*');
    
    if(data) {
      console.log('questions data: ', data);
      setQuestions(data);
    }
    if(error) {
      console.log('error while fetch questions');
    }
  }
  
  async function postSingleSelectAnswer({ question_id, response } : SingleUserResponse) {

    setSelectedOption((prevSelectedOption) => ({
      ...prevSelectedOption,
      [question_id]: response, // Set the selected option for the corresponding question
    }));
    const { data, error } = await supabase
      .from('user_responses')
      .upsert(
        {
          user_id: userId,
          question_id: question_id,
          response: response,
        },  
        { 
          onConflict: ['user_id','question_id'] 
        }
      )
      .select();
    
    if(data) {
      console.log('success data response: ', data);
    }
    if(error) {
      console.log('error while submitting response', error);
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [])
  

  return (
    <div className="flex justify-center">
      <div className="m-3 border border-1 p-4 w-1/2 max-mobile:w-full max-tablet:w-full">
        <div className="text-xl font-medium">Data Demografis</div>
        <div className="flex flex-col overflow-auto">
          {
            questions.map((question) => {
              return (
                <div key={question.id} className="flex flex-col space-y-2 mt-3">
                  <div className="">{question.question_text}</div>
                  {
                    question.options.map((option, index) => (
                      <div key={index} onClick={() => postSingleSelectAnswer({ question_id: question.id, response: [option] })} className="flex flex-row space-x-2 items-center">
                        <div className={`w-4 h-4 rounded-full border border-1 ${selectedOption[question.id]?.includes(option) ? "bg-slate-200" : "bg-transparent"}`}></div>
                        <div>{option}</div>
                      </div>
                    ))
                  }
                </div>
              )
            })
          }
        </div>
      </div>
    </div>
  )
}