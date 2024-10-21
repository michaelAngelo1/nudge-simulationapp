import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient"
import { Question, UserResponses } from "../interface/SurveyInterface";
import { useGetUser } from "../hooks/useGetUser";
import { User } from "@supabase/supabase-js";

export default function SurveyForms() {

  const { userId } = useGetUser();
  const [questions, setQuestions] = useState<Question[]>([]);

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

  async function postAnswer({ ...userResponse } : UserResponses) {
    const { data, error } = await supabase
      .from('user_responses')
      .insert(
        {
          user_id: userId,
          question_id: userResponse.question_id,
          response: userResponse.response,
        }
      )
      .select();
    
    if(data) {
      console.log('success data response: ', data);
    }
    if(error) {
      console.log('error while submitting response');
    }
  }

  useEffect(() => {
    fetchQuestions();
  }, [])
  

  return (
    <div className="m-3 border border-1 p-3">
      <div className="text-xl font-medium">Data Demografis</div>
      <div className="flex flex-col overflow-auto">
        {
          questions.map((question) => {
            return (
              <div key={question.id} className="flex flex-col space-y-2">
                <div className="">{question.question_text}</div>
                {
                  question.options.map((option) => (
                    <div className="flex flex-row space-x-2 items-center">
                      <div className="w-4 h-4 rounded-full border border-1"></div>
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
  )
}