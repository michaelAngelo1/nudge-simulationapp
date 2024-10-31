import { useLocation, useNavigate } from "react-router-dom";
import { Records } from "../interface/SimulationInterface";

export default function SimulationDetailPage() {

  const recordProps = useLocation();
  const { ...record } = recordProps.state as Records 
  const navigate = useNavigate();

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
