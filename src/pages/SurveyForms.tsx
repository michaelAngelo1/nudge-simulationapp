import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient"
import { Question, SingleUserResponse } from "../interface/SurveyInterface";
import { useGetUser } from "../hooks/useGetUser";
import { useSession } from "../context/SessionContext";
import { v4 as uuidv4 } from 'uuid';

// metode jawab: pilih jawaban, trigger opsi "change answer" enabled,
// change_answer onclick -> delete record jawaban from that question
// user pilih jawaban lagi

export default function SurveyForms() {

  const { userId } = useGetUser();
  const { user } = useSession();
  console.log('logged in user: ', user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [responses, setResponses] = useState<SingleUserResponse[]>([]);
  const [selectedOption, setSelectedOption] = useState<{[key: string]: string[] }>({}); 
  const [answered, setAnswered] = useState<{[key: string]: boolean}>({});
  const [answerChange, setAnswerChange] = useState(false);

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
      )
      .select();
    
    if(data) {
      console.log('success data response: ', data);
      handleQuestionAnswered(question_id, true);
    }
    if(error) {
      console.log('error while submitting response', error);
    }
  }

  const fetchCurrentUserResponses = async () => {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
    
    if(data) {
      console.log('responses data: ', data);
      const updateSelectedOptions = (data: SingleUserResponse) => {
        setSelectedOption((prevSelectedOption) => ({
          ...prevSelectedOption,
          [data.question_id]: data.response,
        }));
        setAnswered((prevAnswered) => ({
          ...prevAnswered,
          [data.question_id]: true,
        }));
      };

      for (const response of data) {
        const matchingQuestion = questions.find(
          (question) => question.id === response.question_id
        );
        if (matchingQuestion) {
          updateSelectedOptions(response);
          console.log('matching questions');
        }
      }
      setResponses(data);
    }
    if(error) {
      console.log('error while fetch responses', error);
    }
  }

  const handleChangeAnswer = async (question_id: string) => {
    setAnswerChange(true);
    const { error } = await supabase
      .from('user_responses')
      .delete()
      .eq('question_id', question_id)
      .eq('user_id', userId)
    
    if(error) {
      console.log('error while change answer', error)
    } else {
      console.log('successful change answer');
      // Clear the selected option for the specific question
      setSelectedOption((prevSelectedOption) => {
        const updatedOptions = { ...prevSelectedOption };
        delete updatedOptions[question_id]; // Remove the entry for this question
        return updatedOptions;
      });

      // Also set the answered state to false for this question
      setAnswered((prevAnswered) => ({
        ...prevAnswered,
        [question_id]: false, // Mark this question as not answered
      }));
      setAnswerChange(false);
    }
  }

  const handleQuestionAnswered = (question_id: string, isAnswered: boolean) => {
    setAnswered((prevAnswered) => ({
      ...prevAnswered,
      [question_id]: isAnswered, // Set the selected option for the corresponding question
    }));
  }

  useEffect(() => {
    fetchQuestions();
  }, [answerChange]);

  useEffect(() => {
    if (questions.length > 0) {
      fetchCurrentUserResponses();
    }
  }, [questions]);
  
  

  return (
    <div className="flex justify-center">
      <div className="m-3 border border-1 p-4 w-1/2 max-mobile:w-full max-tablet:w-full">
        <div className="text-xl font-medium">Data Demografis</div>
        <div className="flex flex-col overflow-auto">
          {
            questions.map((question) => {
              return (
                <div key={question.id} className="flex flex-col space-y-2 mt-3">
                  <div className="flex flex-row items-center space-x-2">
                    <div className="">{question.question_text}</div>
                    {
                      answered[question.id] ?
                      <div onClick={() => handleChangeAnswer(question.id)} className="btn btn-sm text-xs font-light">Change Answer</div>
                      :
                      <div></div>
                    }
                  </div>
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