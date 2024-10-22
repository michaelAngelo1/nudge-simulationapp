export interface Question {
  created_at: string;
  id: string;
  options: string[];
  question_text: string;
  question_type: string;
  survey_type_id: string;
}

export interface SingleUserResponse {
  question_id: string;
  response: string[];
}
