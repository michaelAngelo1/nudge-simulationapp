export interface Question {
  created_at: string;
  id: string;
  options: string[];
  question_text: string;
  question_type: string;
  survey_type_id: string;
}

export interface UserResponses {
  created_at: string;
  user_id: string;
  question_id: string;
  response: string[];
}