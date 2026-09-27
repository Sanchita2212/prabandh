import React,{useState} from 'react';
import { CheckCircle2, XCircle, Sparkles, BrainCircuit, Loader2 } from 'lucide-react';
import PageHeader from '../../components/ui/PageHeader';
import { useEventData } from '../../context/EventDataContext';
import { runNugenInference, isNugenConfigured } from '../../services/nugenService';

export default function AIOperations(){
  const { recommendations, applyRecommendation, dismissRecommendation, crowd, volunteers } = useEventData();
  const pending = recommendations.filter(r=>r.status==='pending').length;
  const [result,setResult]=useState(null);
  const [loading,setLoading]=useState(false);

  async function runInference(){
    setLoading(true); setResult(null);
    try{
      const response=await runNugenInference({
        task:'event_operations_recommendation',
        event:{crowd,volunteers,pendingRecommendations:recommendations.filter(r=>r.status==='pending')},
        instruction:'Return concise, explainable operational recommendations. Never invent unavailable sensor data. Include reason, affected zone and suggested action.'
      });
      setResult(response);
    }catch(e){ setResult({configured:true,error:e.message}); }
    finally{ setLoading(false); }
  }

  return <><PageHeader eyebrow="ORGANIZER · AI OPERATIONS" title="AI Operations" subtitle={`Nugen-aligned recommendations for human approval — ${pending} pending.`}/>
    <div className="ai-banner"><BrainCircuit/><div><b>Base model → Nugen alignment → PRABANDH event-operations model → inference</b><p>{isNugenConfigured()?'Nugen inference endpoint is configured.':'Nugen endpoint is not configured yet. Add the credentials/endpoints from your Nugen workspace before the final sync.'}</p></div><button className="primary-small" onClick={runInference} disabled={loading}>{loading?<><Loader2 className="spin"/> Running</>:<><Sparkles/> Run Nugen inference</>}</button></div>
    {result && <section className="panel"><div className="panel-head"><div><h3><BrainCircuit/> Nugen inference result</h3><p>{result.demo?'Adapter is ready; connect the Nugen inference endpoint to receive the aligned model output.':result.error||'Live model response'}</p></div></div>{result.output&&<pre style={{whiteSpace:'pre-wrap',margin:0,color:'#b9c8ca',fontSize:11}}>{typeof result.output==='string'?result.output:JSON.stringify(result.output,null,2)}</pre>}{!result.output&&!result.error&&<div className="empty-state"><BrainCircuit/><b>{result.message||'No model output returned.'}</b></div>}</section>}
    <div className="recommend-list">{recommendations.map((x,i)=><div className={`recommend-card ${x.status==='Applied'?'applied':''}`} key={x.id}><div className="recommend-no">0{i+1}</div><div><span>{x.impact}</span><h3>{x.title}</h3><p>{x.reason}</p>{x.status==='Applied'?<span className="text-btn"><CheckCircle2 size={15}/> Approved & applied</span>:x.status==='Dismissed'?<span className="text-btn" style={{color:'#8a9b9e'}}><XCircle size={15}/> Dismissed</span>:<div style={{display:'flex',gap:14,marginTop:10}}><button className="text-btn" onClick={()=>applyRecommendation(x.id)}>Approve <CheckCircle2 size={15}/></button><button className="text-btn" style={{color:'#ff9da4'}} onClick={()=>dismissRecommendation(x.id)}>Dismiss <XCircle size={15}/></button></div>}</div><CheckCircle2 style={{opacity:x.status==='Applied'?1:.25}}/></div>)}</div>
  </>;
}
