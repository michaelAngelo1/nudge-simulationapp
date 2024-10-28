import { useEffect, useState } from "react";
import supabase from "../database/supabaseClient";
import { useGetUser } from "../hooks/useGetUser";

export default function SimulationPage() {

  const [balance, setBalance] = useState<string>();
  const [dummyBalance, setDummyBalance] = useState<number>();
  const { userId } = useGetUser();
  const questionId = "6d06b8b9-c3fa-4309-832c-222f3cb674db";

  function getUpperBound(input: string) {
    console.log('the upper bound: ', parseInt(input[0].slice(-10)));
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
      console.log('data balance: ', data);
      setBalance(data[0].response);
    }
  }

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
      <div>Saldo Anda: {formatCurrency(dummyBalance!)}</div>
    </div>
  )
}
