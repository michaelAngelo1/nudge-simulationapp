import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient"
import { Question, SingleUserResponse, SurveyType } from "../interface/SurveyInterface";
import { useGetUser } from "../hooks/useGetUser";
import { useSession } from "../context/SessionContext";
import { isButtonElement } from "react-router-dom/dist/dom";

// metode jawab: pilih jawaban, trigger opsi "change answer" enabled,
// change_answer onclick -> delete record jawaban from that question
// user pilih jawaban lagi

export default function SurveyForms() {

  const { userId } = useGetUser();
  const { user } = useSession();
  console.log('logged in user: ', user);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [surveyTypes, setSurveyTypes] = useState<SurveyType[]>([]);
  const [currentSurveyType, setCurrentSurveyType] = useState<string>('');
  const [index, setIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<{[key: string]: string[] }>({}); 
  const [answered, setAnswered] = useState<{[key: string]: boolean}>({});
  const [answerChange, setAnswerChange] = useState(false);


  const scrollRef = useRef<HTMLDivElement | null>(null);

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

  async function fetchSurveyTypes() {
    const { data, error } = await supabase
      .from('survey_types')
      .select('*');
    if(data) {
      console.log('survey type data: ', data);
      setSurveyTypes(data);
    }
    if(error) {
      console.log('error while fetching survey types: ', error);
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

  // pagination by survey types
  const handleNext = () => {
    if(index < surveyTypes.length) {
      setIndex(index + 1);
      setCurrentSurveyType(surveyTypes[index].type_name);
      scrollToTop();
    }
  }

  const handlePrevious = () => {
    if(surveyTypes.length > 0) {
      setIndex(index - 1)
      setCurrentSurveyType(surveyTypes[index].type_name);
      scrollToTop();
    }
  }

  const scrollToTop = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    fetchQuestions();
    fetchSurveyTypes();
  }, []);

  useEffect(() => {
    if (questions.length > 0) {
      fetchCurrentUserResponses();
    }
  }, [questions, userId]);

  useEffect(() => {
    if(surveyTypes.length > 0) {
      setCurrentSurveyType(surveyTypes[index].type_name);
    }
  }, [surveyTypes, index])

  useEffect(() => {
    questions.map((question) => {
      surveyTypes.map((surveyType) => {
        if(question.survey_type_id == surveyType.id) {
          console.log('survey name: ', surveyType.type_name);
          question.survey_type_name = surveyType.type_name;
        }
      })
    })
  }, [questions, surveyTypes])
  
  return (
    <div ref={scrollRef} className="flex flex-col justify-center items-center m-3">
      <div className="border border-1 p-4 w-1/2 max-mobile:w-full max-tablet:w-full">
        <div className="text-xl font-medium">{currentSurveyType}</div>
        <div className="flex flex-col overflow-auto">
          {
            questions
              .filter((question) => question.survey_type_name == currentSurveyType)
              .map((question) => {
              return (
                <div key={question.id} className="flex flex-col space-y-2 mt-4">
                  <div className="flex flex-row items-center space-x-2">
                    <div className="text-base font-medium">{question.question_text}</div>
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
      <div className="flex flex-col space-y-2 mt-3">
        <div className="flex flex-row p-3 space-x-2">
          <button disabled={index == 0 && true} onClick={handlePrevious} className="btn btn-secondary text-sm font-medium">Previous</button>
          <button disabled={index == surveyTypes.length - 1 && true} onClick={handleNext} className="btn btn-secondary text-sm font-medium">Next</button>
        </div>
        {index === surveyTypes.length - 1 && <button className="btn btn-primary text-sm font-medium">Submit. Go to simulation</button>}
      </div>
    </div>
  )
}