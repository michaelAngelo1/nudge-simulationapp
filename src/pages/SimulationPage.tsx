import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient";
import { useGetUser } from "../hooks/useGetUser";
import { Pages, Records, UserPageVisits, UserPurchase } from "../interface/SimulationInterface";
import RecordCard from "../components/RecordCard";
import RelatedRecordCard from "../components/RelatedRecordCard";
import { useNavigate } from "react-router-dom";

export default function SimulationPage() {

  const [loading, setLoading] = useState(false);
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
    // {
    //   rule_based_id: '88f674b0-a723-4311-9d60-b9afa32c415e' // outside psychography behavior
    // }
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
  // "Toleransi resiko tinggi, minat invest tinggi" -> "Saham atau Reksadana"
  // "Produk dengan manfaat pajak or selain two above" -> "Obligasi Pemerintah"
  const [rekomendasi, setRekomendasi] = useState(""); // can be "Tabungan", "Deposito", "Saham" (v), "Reksa Dana" (v), "Obligasi"
  function getRulebasedRecommendation() { 
    let responses: string[] = [];
    if(ruleBasedResponses && ruleBasedResponses.length > 0) {
      // console.log('RULE BASED RESPONSES: ', ruleBasedResponses);
      ruleBasedResponses.map((response) => {
        if(response) {
          responses.push(response[0]);
        }
      })
    }
    if(responses && responses.length > 0) {
      // console.log('Array of rulebased responses: ', responses);

      // Rule-based Conditions below
      if(
        // All the conditions that outputs 'Saham'
        (
          responses.includes('Meningkatkan kekayaan dengan cepat') && responses.includes('Risiko tinggi, imbalan tinggi')
        ) ||
        (
          responses.includes('Risiko tinggi, imbalan tinggi') && responses.includes('Stabilitas keuangan jangka panjang')
        ) ||
        (
          responses.includes('Risiko tinggi, imbalan tinggi') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
        ) ||
        (
          responses.includes('Risiko moderat') && responses.includes('Meningkatkan kekayaan dengan cepat')
        )
      ) {
        setRekomendasi('Saham');
      } else if(
        // All the conditions that outputs 'Reksadana'
        (
          responses.includes('Risiko moderat') && responses.includes('Stabilitas keuangan jangka panjang')
        ) ||
        (
          responses.includes('Risiko moderat') && responses.includes('Keamanan dan menghindari risiko')
        ) ||
        (
          responses.includes('Risiko moderat') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
        )
      ) {
        setRekomendasi('Reksa Dana');
      } else if(
        // All the conditions that outputs 'Obligasi'
        (
          responses.includes('Risiko rendah, pertumbuhan stabil') && responses.includes('Stabilitas keuangan jangka panjang')
        ) ||
        (
          responses.includes('Risiko rendah, pertumbuhan stabil') && responses.includes('Keamanan dan menghindari risiko')
        ) ||
        (
          responses.includes('Risiko rendah, pertumbuhan stabil') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
        )
      ) {
        setRekomendasi('Obligasi');
      } else if(
        // All the conditions that outputs 'Tabungan' or 'Deposito'
        (
          responses.includes('Menghindari risiko') && responses.includes('Stabilitas keuangan jangka panjang')
        ) ||
        (
          responses.includes('Menghindari risiko') && responses.includes('Keamanan dan menghindari risiko')
        ) ||
        (
          responses.includes('Menghindari risiko') && responses.includes('Menyeimbangkan pertumbuhan dengan stabilitas')
        )
      ) {
        setRekomendasi('Deposito'); // add Tabungan as an alternative
      } else {
        setRekomendasi('Tabungan');
      }
    }
  }
  
  const [records, setRecords] = useState<Records[]>([]);
  async function getRecords() {
    setLoading(true);
    const { data, error } = await supabase
      .from('records')
      .select('*')
    console.log('MASUK GET RECORDS');
    if(error) {
      console.log('Error while fetching records', error);
    }
    if(data) {
      console.log('response records: ', data);
      setRecords(data);
      setLoading(false);
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
      // console.log('question id: ', data[0].question_id, 'data rule base: ', data[0].response);
      setRuleBasedResponses((prevItem) => [...prevItem, data[0].response]);
    }
  }

  useEffect(() => {
    getRulebasedRecommendation();
  }, [ruleBasedResponses])

  useEffect(() => {
    fetchListPage();
    if(rekomendasi && rekomendasi.length > 0) {
      getRecords();
    }
  }, [rekomendasi])
  
  useEffect(() => {
    if(userId && ruleBasedQuestionIds && !hasFetchedResponses.current) {
      hasFetchedResponses.current = true;
      let i = 0;
      for(const ruleBased of ruleBasedQuestionIds) {
        i++;
        // console.log(ruleBased.rule_based_id);
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
      // console.log('new balance after conversion: ', newBalance);
      setDummyBalance(newBalance * 24000000);
    }
  }, [balance])

  const [listPageData, setListPageData] = useState<Pages>();
  const fetchListPage = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('page_name', 'List Page')
    
    if(error) {
      console.log('error while fetching list page: ', error);
    }
    if(data) {
      // console.log('response list page: ', data[0]);
      setListPageData(data[0]);
    }
  }

  const postTimeSpent = async ({ user_id, page_id, enter_time, exit_time } : UserPageVisits) => {
    console.log('Page ID: ', page_id);

    const enterTimeDate = new Date(enter_time);
    const exitTimeDate = new Date(exit_time);
    
    const { data, error } = await supabase
      .from('user_page_visits')
      .insert({
        user_id: user_id,
        page_id: page_id,
        enter_time: enterTimeDate,
        exit_time: exitTimeDate,
        // time_spent: time_spent,
      });
    
    if(error) {
      console.log('error while posting page time spent: ', error);
    }
    if(data) {
      console.log('SUCCESS PAGE TIME SPENT: ', data);
    }
  }

  const [userPurchases, setUserPurchases] = useState<UserPurchase[]>([]);
  async function fetchUserPurchase() {
    const { data, error } = await supabase
      .from('user_purchases')
      .select('*')
      .eq('user_id', userId)
    
    if(error) {
      console.log('error while fetching user purchase', error);
    }
    if(data) {
      console.log('data user purchases: ', data);
      setUserPurchases(data);
    }
  }

  useEffect(() => {
    if(userId) {
      fetchUserPurchase();
    }
  }, [userId])
  

  const navigate = useNavigate();
  async function userSignOut() {
    const { error } = await supabase.auth.signOut();
    if(error) {
      throw new Error('Error while signing out');
    } else {
      console.log('user signed out');
      navigate('/auth/ui/signIn')
    }
  }

  const startTimeRef = useRef<number>(0);
  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const leaveTime = Date.now();
      const timeSpent = (leaveTime - startTimeRef.current) / 1000;

      if(listPageData && listPageData.id) {
        if(timeSpent > 0.5) {
          console.log(`Time Spent on Simulation Page: ${timeSpent.toFixed(2)} seconds`)
          postTimeSpent({
            user_id: userId,
            page_id: listPageData.id,
            enter_time: startTimeRef.current,
            exit_time: leaveTime,
            time_spent: timeSpent
          })
        }
      }
    }
  }, [startTimeRef, listPageData])
  
  return (
    <div className="p-3 flex flex-col space-y-3">
      <div className="p-3 bg-info opacity-80 max-w-full">
        <div className="flex flex-col">
          <div className="text-center font-medium text-white">Ini adalah sebuah simulasi</div>
          <div className="text-center font-light text-white">Bagaimana Anda mengelola uang Anda pada produk bank berikut ini.</div>
        </div>
      </div>
      <div className="font-bold text-xl">Saldo Anda: {dummyBalance ? formatCurrency(dummyBalance) : 'Calculating balance...'}</div>
      {/* <div className="px-3">
        <div className="font-medium">Your profile is</div>
        <div className="flex flex-col">
          {
            ruleBasedResponses.map((response, index) => (
              <div key={index} className="list">
                {response}
              </div>
            ))
          }
        </div>
      </div> */}
      {/* <div>
        {rekomendasi.length > 0 && rekomendasi}
      </div> */}
      <div className="text-xl font-medium max-tablet:text-center max-mobile:text-center">Anda sudah membeli</div>
      <div className="flex flex-wrap gap-3 max-tablet:justify-center max-mobile:justify-center ">
        {
          userPurchases.length > 0 ?
            userPurchases.map((purchased) => (
              <div className="relative p-3 m-3 bg-primary w-36 h-36 rounded-xl hover:scale-105 transition">
                <div className="text-white text-base font-semibold">{purchased.name_purchased}</div>
                <div className="absolute bottom-3 right-3 text-white text-3xl font-bold">{purchased.percentage_purchased}%</div>
              </div>
            ))
          :
            <div className="flex justify-center p-3">Belum ada pembelian</div>
        }  
      </div>
      <div className="text-xl font-medium max-tablet:text-center max-mobile:text-center">Rekomendasi untuk Anda</div>
      <div className="flex flex-wrap gap-3 max-tablet:justify-center max-mobile:justify-center">
        {
          records && 
          records.length > 0 &&
          records
            .filter((record) => record.record_name.includes(rekomendasi))
            .map((record, index) => (
            <RecordCard key={index} {...record}/>
          ))
        }
      </div>
      <div className="text-xl font-medium max-tablet:text-center max-mobile:text-center">Produk terkait</div>
      <div className="flex flex-wrap gap-3 max-tablet:justify-center max-mobile:justify-center">
        {
          records && 
          records.length > 0 &&
          records
            .filter((record) => !record.record_name.includes(rekomendasi))
            .map((record, index) => (
            <RelatedRecordCard key={index} {...record}/>
          ))
        }
      </div>
      <div className="flex justify-center">
        <button onClick={userSignOut} className="btn btn-shadow w-1/4 text-center font-medium">Finish Simulation?</button>
      </div>
    </div>
  )
}
