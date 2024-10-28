import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient";
import { useGetUser } from "../hooks/useGetUser";

export default function SimulationPage() {

  const [balance, setBalance] = useState<string>();
  const [dummyBalance, setDummyBalance] = useState<number>();
  const { userId } = useGetUser();
  const questionId = "6d06b8b9-c3fa-4309-832c-222f3cb674db";
  const ruleBasedQuestionIds = [
    {
      rule_based_id: '897478ff-81d4-4b9a-975b-f01d82f83894',
    },
    {
      rule_based_id: '1f2603b2-54b5-4dcb-8bc3-137333d84a96',
    },  
    {
      rule_based_id: '88f674b0-a723-4311-9d60-b9afa32c415e' // outside psychography behavior
    }
  ]
  const [ruleBasedResponses, setRuleBasedResponses] = useState<string[]>([]);
  // for fetch rulebased, avoid double calls
  const hasFetchedResponses = useRef(false);

  function getUpperBound(input: string) {
    return parseInt(input[0].slice(-10));  
  }

  function formatCurrency(value: number, currency: string = 'IDR', locale: string = 'id-ID'): string {
    return new Intl.NumberFormat(locale, {
        style: 'currency',
        currency: currency,
        minimumFractionDigits: 0, // No decimal places
    }).format(value);
}

  async function getResponseForBalance() {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', questionId)
    
    if(error) {
      console.log('error while fetching response for balance');
    }

    if(data) {
      setBalance(data[0].response);
    }
  }

  // Rule-based Function determining one of three results
  // "Keamanan atau Likuiditas Tinggi" -> "Tabungan atau Deposito"
  // "Toleransi resikot tinggi, minat invest tinggi" -> "Saham atau Reksadana"
  // "Produk dengan manfaat pajak or selain two above" -> "Obligasi Pemerintah"
  function getRulebasedRecommendation() { 
    if(ruleBasedResponses && ruleBasedResponses.length > 0) {
      console.log(ruleBasedResponses)
    }
  }

  async function getResponseFirstRuleBased(rule_based_id: string) {
    const { data, error } = await supabase
      .from('user_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('question_id', rule_based_id)
    
    if(error) {
      console.log('error while fetching response balance', error);
    }

    if(data) {
      console.log('question id: ', data[0].question_id, 'data rule base: ', data[0].response);
      setRuleBasedResponses((prevItem) => [...prevItem, data[0].response]);
    }
  }

  useEffect(() => {
    getRulebasedRecommendation();
  }, [ruleBasedResponses])
  

  useEffect(() => {
    if(userId && ruleBasedQuestionIds && !hasFetchedResponses.current) {
      hasFetchedResponses.current = true;
      let i = 0;
      for(const ruleBased of ruleBasedQuestionIds) {
        i++;
        console.log(ruleBased.rule_based_id);
        getResponseFirstRuleBased(ruleBased.rule_based_id);
      }
    }
  }, [userId, ruleBasedQuestionIds])
  

  useEffect(() => {
    if(userId && questionId) {
      getResponseForBalance()
    }
  }, [userId, questionId]);

  useEffect(() => {
    if(balance && balance.length > 0) {
      const newBalance = getUpperBound(balance);
      console.log('new balance after conversion: ', newBalance);
      setDummyBalance(newBalance * 24000000);
    }
  }, [balance])

  return (
    <div>
      <div>Saldo Anda: {dummyBalance ? formatCurrency(dummyBalance) : 'Calculating balance...'}</div>
      <div>
        {ruleBasedResponses}
      </div>
    </div>
  )
}
