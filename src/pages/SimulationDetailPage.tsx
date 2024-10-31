import { useLocation, useNavigate } from "react-router-dom";
import { Pages, Records } from "../interface/SimulationInterface";
import { useEffect, useRef, useState } from "react";
import supabase from "../database/supabaseClient";
import { useGetUser } from "../hooks/useGetUser";

export default function SimulationDetailPage() {

  const recordProps = useLocation();
  const { ...record } = recordProps.state as Records 
  const navigate = useNavigate();
  const { userId } = useGetUser();

  const [detailPageData, setDetailPageData] = useState<Pages>();
  const fetchDetailPage = async () => {
    const { data, error } = await supabase
      .from('pages')
      .select('*')
      .eq('page_name', 'Detail Page')
    
    if(error) {
      console.log('error while fetching list page: ', error);
    }
    if(data) {
      // console.log('response list page: ', data[0]);
      setDetailPageData(data[0]);
    }
  }

  const postTimeSpent = async ({ user_id, page_id, record_id, enter_time, exit_time, time_spent } : UserPageVisits) => {
    console.log('Page ID: ', page_id);

    const enterTimeDate = new Date(enter_time);
    const exitTimeDate = new Date(exit_time);
    
    const { data, error } = await supabase
      .from('user_page_visits')
      .insert({
        user_id: user_id,
        page_id: page_id,
        record_id: record_id,
        enter_time: enterTimeDate,
        exit_time: exitTimeDate,
        // time_spent: time_spent,
      });
    
    if(error) {
      console.log('error while posting page time spent: ', error);
    }
    if(data) {
      console.log('SUCCESS detail PAGE TIME SPENT: ', data);
    }
  }

  const startTimeRef = useRef<number>(0);

  useEffect(() => {
    fetchDetailPage();
  }, [startTimeRef])
  

  useEffect(() => {
    startTimeRef.current = Date.now();

    return () => {
      const leaveTime = Date.now();
      const timeSpent = (leaveTime - startTimeRef.current) / 1000;
      if(detailPageData && detailPageData.id) {
        if(timeSpent > 0.5) {
          console.log('Start time: ', typeof startTimeRef.current, 'Leave time: ', typeof leaveTime);
          console.log(`Time Spent on Detail Page with Record ${record.record_title}: ${timeSpent.toFixed(2)} seconds`)

          postTimeSpent({
            user_id: userId,
            page_id: detailPageData.id,
            record_id: record.id,
            enter_time: startTimeRef.current,
            exit_time: leaveTime,
            time_spent: timeSpent
          })
        }
      }
    }
  }, [startTimeRef, detailPageData])

  return (
    <div className="p-3 flex flex-col w-full space-y-3 max-tablet:justify-center max-tablet:h-screen max-mobile:justify-center max-mobile:h-screen">
      <div className="text-2xl font-semibold">{record.record_title}</div>

      <div className="flex flex-row space-x-2">
        <div className="font-medium bg-primary px-2 py-1 w-1/10 rounded-full text-slate-100 text-center text-xs">{record.record_name}</div>
        <div className="font-medium bg-secondary px-2 py-1 w-1/10 rounded-full text-slate-100 text-center text-xs">{record.record_code}</div>
      </div>

      <div className="text-base">{record.record_description}</div>
      <div className="flex flex-col space-y-3 max-tablet:flex-row max-tablet:items-center max-tablet:space-x-3 max-mobile:space-x-3 max-mobile:flex-row max-mobile:items-center">
        <div className="font-medium">Tertarik membeli produk ini?</div>
        <button className="btn btn-primary w-32 text-slate-100">Beli sekarang</button>
        <button onClick={() => navigate('/simulation')} className="btn btn-shadow w-32 ">Kembali</button>
      </div>    
    </div>
  )
}
