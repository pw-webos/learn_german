import { useState, useEffect } from "react"
import { supabase } from "./supabase"

const C = {
  purple: "#7F77DD", purpleLight: "#EEEDFE", purpleDark: "#3C3489",
  teal: "#1D9E75", tealLight: "#E1F5EE",
  coral: "#D85A30", coralLight: "#FAECE7",
  amber: "#BA7517", amberLight: "#FAEEDA",
  pink: "#D4537E", pinkLight: "#FBEAF0",
  gray: "#888780", grayLight: "#F1EFE8",
  green: "#3B6D11", greenLight: "#EAF3DE",
  red: "#A32D2D", redLight: "#FCEBEB",
}

const SCREENS = {
  PROFILE: "profile", MAP: "map", EPISODE: "episode",
  VOCAB_GAME: "vocab_game", GRAMMAR: "grammar",
  PHRASE: "phrase", AI_TUTOR: "ai_tutor"
}

const ep1panels = [
  { id:1, text:"The plane touches down at München Flughafen. Hunar presses their face against the window. Germany. Finally.", german:null, action:null },
  { id:2, text:"At passport control, the officer says something in German.", german:"Guten Tag. Ihren Reisepass, bitte.", action:"translate", choices:["Good day. Your passport, please.","Please go to gate B.","Do you have anything to declare?"], correct:0 },
  { id:3, text:"Hunar hands over the passport. The officer stamps it and says:", german:"Willkommen in Deutschland!", action:"translate", choices:["Have a safe flight!","Welcome to Germany!","Please collect your luggage."], correct:1 },
  { id:4, text:"Hunar walks through the arrivals gate, one suitcase in hand. The adventure begins. +30 XP", german:null, action:"complete" },
]

const ep2panels = [
  { id:1, text:"Hunar needs to get to the apartment. The U-Bahn is the way. But which line? Which direction?", german:null, action:null },
  { id:2, text:"At the ticket machine, Hunar stares at the screen. Tap the words you recognise.", german:null, action:"tap",
    tapWords:[
      { word:"Einzelfahrt", meaning:"single journey ticket" },
      { word:"Erwachsene",  meaning:"adults" },
      { word:"Innenraum",   meaning:"inner zone" },
      { word:"Zahlen",      meaning:"to pay" },
    ]
  },
  { id:3, text:"Ticket bought. On the platform, an announcement crackles overhead.", german:"Die U-Bahn nach Marienplatz fährt in zwei Minuten ab.", action:"translate", choices:["The U-Bahn to Marienplatz departs in two minutes.","The next train is delayed by two minutes.","Please change at Marienplatz."], correct:0 },
  { id:4, text:"Hunar boards the train. A seat by the window. Munich rushes past outside. Almost there. +40 XP", german:null, action:"complete" },
]

const ep3panels = [
  { id:1, text:"Hunar finally reaches the apartment building. Tired, jet-lagged, but smiling.", german:null, action:null },
  { id:2, text:"The landlord is nowhere to be seen. There's a handwritten note on the door.", german:"Liebe Hunar,\nIch bin leider nicht da.\nDer Schlüssel liegt unter der Fußmatte.\nBis morgen!\n— Frau Weber", action:null },
  { id:3, text:"Hunar stares at the note. Tap each word to decode it.", german:null, action:"tap",
    tapWords:[
      { word:"leider", meaning:"unfortunately" },
      { word:"Schlüssel", meaning:"key" },
      { word:"unter", meaning:"under / beneath" },
      { word:"Fußmatte", meaning:"doormat" },
      { word:"morgen", meaning:"tomorrow" },
    ]
  },
  { id:4, text:"Hunar finds the key. The door opens. But something inside is... unexpected.", german:null, action:"cliffhanger" },
]

const ep4panels = [
  { id:1, text:"Hunar needs groceries. The nearest Supermarkt is a 5-minute walk.", german:null, action:null },
  { id:2, text:"Inside, everything is labelled in German. Hunar picks up a carton.", german:"Vollmilch\n3,5 % Fett\n1 Liter\nMindesthaltbarkeitsdatum: 15.04.2026", action:null },
  { id:3, text:"At the checkout, the cashier says something fast. Very fast.", german:"Das macht zusammen vier Euro fünfzig, bitte.", action:"translate", choices:["That makes four fifty altogether, please.","You have four items, please.","Please go to aisle four."], correct:0 },
  { id:4, text:"Hunar pays. The cashier smiles and says one more thing...", german:"Haben Sie eine Kundenkarte?", action:"translate", choices:["Have a good day!","Do you have a loyalty card?","Do you need a bag?"], correct:1 },
  { id:5, text:"Hunar walks back with groceries. First supermarket run: complete. +50 XP", german:null, action:"complete" },
]

const isRateLimit = e => e?.status===429||e?.status===529||e?.message?.toLowerCase().includes("rate")||e?.message?.toLowerCase().includes("limit")

async function callClaude(sys, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sys, messages:[{role:"user",content:user}] }),
  })
  if (!res.ok) { const d=await res.json().catch(()=>({})); const e=new Error(d?.error?.message||"error"); e.status=res.status; throw e }
  const d = await res.json()
  return d.content?.[0]?.text||""
}

// ── Supabase helpers ──────────────────────────────────────────

async function fetchProfile(id) {
  const { data } = await supabase.from("profiles").select("*").eq("id", id).single()
  return data
}

async function saveProfile(profile) {
  await supabase.from("profiles").upsert({
    id: profile.id,
    name: profile.name,
    xp: profile.xp,
    streak: profile.streak,
    completed_eps: profile.completedEps,
    active_ep: profile.activeEp,
    last_seen: new Date().toISOString().split("T")[0],
  })
}

async function fetchEpisodes() {
  const { data } = await supabase.from("episodes").select("*").order("id")
  return data || []
}

async function fetchVocab(episodeId) {
  const { data } = await supabase.from("vocabulary").select("*").eq("episode_id", episodeId)
  return data || []
}

async function fetchPhrases() {
  const { data } = await supabase.from("phrases").select("*")
  return data || []
}

async function fetchGrammar() {
  const { data } = await supabase.from("grammar").select("*")
  return data || []
}

async function saveMistake(profileId, wordDe, wordEn) {
  const { data } = await supabase.from("mistakes").select("*")
    .eq("profile_id", profileId).eq("word_de", wordDe).single()
  if (data) {
    await supabase.from("mistakes").update({ wrong_count: data.wrong_count + 1, last_seen: new Date().toISOString() })
      .eq("id", data.id)
  } else {
    await supabase.from("mistakes").insert({ profile_id: profileId, word_de: wordDe, word_en: wordEn })
  }
}

// ── Components ────────────────────────────────────────────────

function LimitMessage({ onBack }) {
  return (
    <div style={{textAlign:"center",padding:"2rem 1rem"}}>
      <div style={{fontSize:48,marginBottom:16}}>☕</div>
      <h3 style={{fontSize:17,fontWeight:500,margin:"0 0 10px"}}>Hunar needs a coffee break!</h3>
      <p style={{fontSize:14,color:"#666",lineHeight:1.7,margin:"0 0 12px"}}>The AI tutor has hit its daily limit. Your story, phrases and vocabulary still work perfectly. Come back tomorrow!</p>
      <p style={{fontSize:13,color:C.teal,margin:"0 0 24px"}}>Your progress is saved. Nothing is lost.</p>
      {onBack&&<button onClick={onBack} style={{padding:"10px 24px",background:C.amberLight,color:C.amber,border:`0.5px solid ${C.amber}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Back to map</button>}
    </div>
  )
}

function Spinner() {
  return <div style={{textAlign:"center",padding:"3rem",color:"#aaa",fontSize:14}}>Loading...</div>
}

function XPBar({ xp, color }) {
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:12,color:"#888",minWidth:36}}>{xp} XP</span>
      <div style={{flex:1,height:6,background:"#eee",borderRadius:99,overflow:"hidden"}}>
        <div style={{width:`${Math.min(Math.round((xp/500)*100),100)}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.5s"}}/>
      </div>
      <span style={{fontSize:12,color:"#888",minWidth:36,textAlign:"right"}}>500</span>
    </div>
  )
}

function VocabGame({ episodeId, profileId, onDone }) {
  const [words, setWords] = useState([])
  const [idx, setIdx] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [result, setResult] = useState(null)
  const [scores, setScores] = useState({know:0,review:0})
  const [done, setDone] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVocab(episodeId).then(d => { setWords(d); setLoading(false) })
  }, [episodeId])

  if (loading) return <Spinner/>
  if (!words.length) return <div style={{textAlign:"center",padding:"2rem",color:"#888"}}>No vocabulary for this episode yet.</div>

  const current = words[idx]

  const answer = async (knew) => {
    setResult(knew?"know":"review")
    setScores(s=>({...s,[knew?"know":"review"]:s[knew?"know":"review"]+1}))
    if (!knew) await saveMistake(profileId, current.de, current.en)
    setTimeout(()=>{
      if(idx<words.length-1){setIdx(i=>i+1);setFlipped(false);setResult(null)}
      else setDone(true)
    },800)
  }

  if (done) return (
    <div style={{textAlign:"center",padding:"2rem 0"}}>
      <div style={{fontSize:48,marginBottom:16}}>🎉</div>
      <h3 style={{fontSize:18,fontWeight:500,margin:"0 0 8px"}}>Vocab round complete!</h3>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"20px 0"}}>
        <div style={{padding:"12px 20px",background:C.greenLight,borderRadius:"8px",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:500,color:C.green}}>{scores.know}</div>
          <div style={{fontSize:12,color:C.green}}>I knew it</div>
        </div>
        <div style={{padding:"12px 20px",background:C.amberLight,borderRadius:"8px",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:500,color:C.amber}}>{scores.review}</div>
          <div style={{fontSize:12,color:C.amber}}>needs review</div>
        </div>
      </div>
      <p style={{fontSize:13,color:"#888",margin:"0 0 24px"}}>Words to review saved to your Mistake Journal.</p>
      <button onClick={()=>onDone(scores.know*10)} style={{padding:"12px 32px",background:C.purple,color:"#fff",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:"pointer"}}>
        Back to map  +{scores.know*10} XP
      </button>
    </div>
  )

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:13,color:"#888"}}>{idx+1} / {words.length}</span>
        <div style={{display:"flex",gap:4}}>
          {words.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i<idx?C.purple:i===idx?C.coral:"#eee"}}/>)}
        </div>
        <span style={{fontSize:13,color:C.green}}>{scores.know} known</span>
      </div>
      <div onClick={()=>setFlipped(f=>!f)} style={{minHeight:180,background:result==="know"?C.greenLight:result==="review"?C.amberLight:flipped?C.purpleLight:"#f5f5f5",border:`1.5px solid ${result==="know"?C.teal:result==="review"?C.amber:flipped?C.purple:"#ddd"}`,borderRadius:"12px",padding:"24px 20px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"all 0.2s",marginBottom:20}}>
        {!flipped?(
          <><div style={{fontSize:24,fontWeight:500,marginBottom:8}}>{current.de}</div><div style={{fontSize:13,color:"#aaa"}}>tap to reveal</div></>
        ):(
          <><div style={{fontSize:14,color:C.purpleDark,marginBottom:8}}>{current.de}</div><div style={{fontSize:22,fontWeight:500,color:C.purpleDark,marginBottom:12}}>{current.en}</div><div style={{fontSize:12,color:C.purple,background:"#fff",padding:"4px 12px",borderRadius:99}}>{current.hint}</div></>
        )}
      </div>
      {flipped&&!result&&(
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <button onClick={()=>answer(false)} style={{padding:"14px 0",background:C.amberLight,color:C.amber,border:`0.5px solid ${C.amber}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Still learning</button>
          <button onClick={()=>answer(true)} style={{padding:"14px 0",background:C.greenLight,color:C.green,border:`0.5px solid ${C.green}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>I knew it!</button>
        </div>
      )}
      {!flipped&&<div style={{textAlign:"center",fontSize:13,color:"#aaa"}}>Tap the card to see the meaning</div>}
    </div>
  )
}

function GrammarScreen() {
  const [cards, setCards] = useState([])
  const [active, setActive] = useState(null)
  const [lang, setLang] = useState("en")
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    fetchGrammar().then(d=>{ setCards(d); setLoading(false) })
  },[])

  if (loading) return <Spinner/>

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Grammar Corner</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 16px"}}>Concepts explained simply — no textbook torture.</p>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setLang(v)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:lang===v?C.purpleLight:"#f5f5f5",color:lang===v?C.purpleDark:"#888",border:"none",cursor:"pointer",fontWeight:lang===v?500:400}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {cards.map(card=>{
          const examples = typeof card.examples === "string" ? JSON.parse(card.examples) : card.examples
          return (
            <div key={card.id} style={{border:active===card.id?`1.5px solid ${C.purple}`:"0.5px solid #ddd",borderRadius:"12px",overflow:"hidden"}}>
              <div onClick={()=>setActive(active===card.id?null:card.id)} style={{padding:"14px 16px",cursor:"pointer",background:active===card.id?C.purpleLight:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:card.level==="A1"?C.tealLight:C.amberLight,color:card.level==="A1"?C.teal:C.amber,fontWeight:500,marginRight:8}}>{card.level}</span>
                  <span style={{fontSize:14,fontWeight:500,color:active===card.id?C.purpleDark:"#222"}}>{card.icon} {card.topic}</span>
                </div>
                <span style={{fontSize:16,color:"#aaa"}}>{active===card.id?"↑":"↓"}</span>
              </div>
              {active===card.id&&(
                <div style={{padding:"0 16px 16px",background:C.purpleLight}}>
                  <p style={{fontSize:14,color:C.purpleDark,lineHeight:1.8,margin:"0 0 16px"}}>{lang==="en"?card.en:card.hi}</p>
                  <div style={{marginBottom:14}}>
                    <div style={{fontSize:11,color:C.purple,fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Examples</div>
                    {examples.map((ex,i)=>(
                      <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"baseline"}}>
                        <div style={{fontSize:14,fontWeight:500,color:C.purpleDark,minWidth:180}}>{ex.de}</div>
                        <div style={{fontSize:13,color:C.purple}}>{ex.en}</div>
                      </div>
                    ))}
                  </div>
                  <div style={{background:"#fff",borderRadius:"8px",padding:"10px 14px",border:`0.5px solid ${C.purple}`}}>
                    <span style={{fontSize:12,fontWeight:500,color:C.purpleDark}}>Teacher tip: </span>
                    <span style={{fontSize:12,color:C.purpleDark}}>{card.tip}</span>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function EpisodeScreen({ episode, onDone, onVocab }) {
  const panelMap = { 1:ep1panels, 2:ep2panels, 3:ep3panels, 4:ep4panels }
  const panels = panelMap[episode.id] || null
  if (!panels) return <div style={{padding:"2rem",textAlign:"center",color:"#888",fontSize:14}}>Episode coming soon — check back after the next update!</div>
  const [panel, setPanel] = useState(0)
  const [tapped, setTapped] = useState({})
  const [chosen, setChosen] = useState(null)
  const p = panels[panel]
  const allTapped = p.tapWords?p.tapWords.every(w=>tapped[w.word]):true
  const canContinue = p.action==="tap"?allTapped:p.action==="translate"?(chosen!==null):true

  const next = () => {
    if (p.action==="complete"){onVocab(episode.id);return}
    if (panel<panels.length-1){setPanel(v=>v+1);setTapped({});setChosen(null)}
    else onDone()
  }

  return (
    <div style={{minHeight:440,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {panels.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=panel?C.coral:"#eee",transition:"background 0.3s"}}/>)}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"#aaa",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Episode {episode.id} · {episode.title}</div>
        <p style={{fontSize:15,color:"#555",lineHeight:1.7,marginBottom:20}}>{p.text}</p>
        {p.german&&<div style={{background:C.purpleLight,border:`0.5px solid ${C.purple}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20,fontFamily:"Georgia,serif",fontSize:15,lineHeight:1.9,whiteSpace:"pre-line",color:C.purpleDark}}>{p.german}</div>}
        {p.action==="tap"&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"#888",marginBottom:10}}>Tap each word to decode it:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {p.tapWords.map(w=>(
                <div key={w.word} onClick={()=>setTapped(t=>({...t,[w.word]:true}))} style={{padding:"8px 14px",borderRadius:"8px",cursor:"pointer",background:tapped[w.word]?C.tealLight:"#f5f5f5",border:tapped[w.word]?`0.5px solid ${C.teal}`:"0.5px solid #ddd",transition:"all 0.2s"}}>
                  <div style={{fontSize:14,fontWeight:500,color:tapped[w.word]?C.teal:"#222"}}>{w.word}</div>
                  {tapped[w.word]&&<div style={{fontSize:12,color:C.teal,marginTop:2}}>{w.meaning}</div>}
                </div>
              ))}
            </div>
            {allTapped&&<div style={{marginTop:12,fontSize:13,color:C.teal}}>All decoded! You can continue.</div>}
          </div>
        )}
        {p.action==="translate"&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"#888",marginBottom:10}}>What did the cashier say?</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {p.choices.map((ch,i)=>{
                const isChosen=chosen===i, correct=p.correct===i
                const bg=isChosen?(correct?C.greenLight:C.redLight):"#f5f5f5"
                const border=isChosen?(correct?C.teal:C.red):"#ddd"
                const color=isChosen?(correct?C.green:C.red):"#222"
                return <div key={i} onClick={()=>chosen===null&&setChosen(i)} style={{padding:"12px 14px",borderRadius:"8px",cursor:chosen===null?"pointer":"default",background:bg,border:`0.5px solid ${border}`,fontSize:14,color,transition:"all 0.2s"}}>{ch}{isChosen&&<span style={{marginLeft:8}}>{correct?"✓":"✗"}</span>}</div>
              })}
            </div>
          </div>
        )}
        {p.action==="cliffhanger"&&<div style={{background:C.coralLight,border:`0.5px solid ${C.coral}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20}}><div style={{fontSize:13,fontWeight:500,color:C.coral,marginBottom:4}}>To be continued...</div><div style={{fontSize:13,color:"#888"}}>Complete the vocabulary lesson to unlock what Hunar finds inside.</div></div>}
        {p.action==="complete"&&<div style={{background:C.greenLight,border:`0.5px solid ${C.green}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20}}><div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>Episode complete!</div><div style={{fontSize:13,color:C.green}}>Now test yourself on the vocabulary.</div></div>}
      </div>
      <button onClick={next} disabled={!canContinue} style={{width:"100%",padding:"12px 0",background:!canContinue?"#eee":C.coral,color:!canContinue?"#aaa":"#fff",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:!canContinue?"default":"pointer",transition:"all 0.2s"}}>
        {p.action==="complete"?"Practice vocabulary":panel<panels.length-1?"Continue":"Back to map"}
      </button>
    </div>
  )
}

function PhraseScreen() {
  const [phrases, setPhrases] = useState([])
  const [active, setActive] = useState(null)
  const [showHi, setShowHi] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(()=>{ fetchPhrases().then(d=>{ setPhrases(d); setLoading(false) }) },[])

  if (loading) return <Spinner/>

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Sofort Sprechen</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 16px"}}>Survival phrases — use them now, understand them later.</p>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setShowHi(v==="hi")} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:showHi===(v==="hi")?(v==="en"?C.purpleLight:C.amberLight):"#f5f5f5",color:showHi===(v==="hi")?(v==="en"?C.purpleDark:C.amber):"#888",border:"none",cursor:"pointer",fontWeight:showHi===(v==="hi")?500:400}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {phrases.map((ph,i)=>(
          <div key={i} onClick={()=>setActive(active===i?null:i)} style={{border:active===i?`1.5px solid ${C.teal}`:"0.5px solid #ddd",borderRadius:"8px",padding:"12px 14px",cursor:"pointer",background:active===i?C.tealLight:"#fff"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:500,flex:1}}>{ph.de}</div>
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:C.grayLight,color:C.gray,marginLeft:8,flexShrink:0}}>{ph.category}</span>
            </div>
            {active===i&&<div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid #ddd",fontSize:13,color:C.teal}}>{showHi?ph.hi:ph.en}</div>}
          </div>
        ))}
      </div>
    </div>
  )
}

function AiTutorScreen({ onBack }) {
  const [q,setQ]=useState(""); const [lang,setLang]=useState("en")
  const [ans,setAns]=useState(null); const [loading,setLoading]=useState(false)
  const [limitHit,setLimitHit]=useState(false)
  const ask=async()=>{
    if(!q.trim())return
    setLoading(true);setAns(null);setLimitHit(false)
    try { const sys=`You are a warm German teacher for an adult A1/A2 learner. Explain in ${lang==="hi"?"Hindi (Hinglish ok)":"simple English"}. Max 120 words. Use examples. No bullet points.`; setAns(await callClaude(sys,q)) }
    catch(e){ isRateLimit(e)?setLimitHit(true):setAns("Something went wrong. Please try again.") }
    finally{ setLoading(false) }
  }
  if(limitHit) return <LimitMessage onBack={onBack}/>
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Ask the Tutor</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 16px"}}>Any question about German — grammar, words, culture.</p>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setLang(v)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:lang===v?C.purpleLight:"#f5f5f5",color:lang===v?C.purpleDark:"#888",border:"none",cursor:"pointer",fontWeight:lang===v?500:400}}>{l}</button>
        ))}
      </div>
      <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. When do I use 'der' vs 'die' vs 'das'?" rows={3} style={{width:"100%",boxSizing:"border-box",resize:"none",fontSize:14,padding:12,borderRadius:"8px",border:"0.5px solid #ddd",background:"#fff",color:"#222",fontFamily:"sans-serif",marginBottom:10}}/>
      <button onClick={ask} disabled={loading||!q.trim()} style={{width:"100%",padding:"12px 0",background:q.trim()&&!loading?C.purple:"#eee",color:q.trim()&&!loading?"#fff":"#aaa",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:q.trim()&&!loading?"pointer":"default",marginBottom:20}}>
        {loading?"Thinking...":"Ask"}
      </button>
      {ans&&<div style={{background:C.purpleLight,border:`0.5px solid ${C.purple}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20}}><div style={{fontSize:11,color:C.purpleDark,fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Tutor</div><p style={{fontSize:14,color:C.purpleDark,lineHeight:1.8,margin:0}}>{ans}</p></div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {["Why is it 'dem' not 'der'?","What is Perfekt tense?","Dativ vs Akkusativ?","What does Feierabend mean?"].map(s=>(
          <button key={s} onClick={()=>setQ(s)} style={{fontSize:12,padding:"6px 12px",borderRadius:99,background:"#f5f5f5",color:"#888",border:"0.5px solid #ddd",cursor:"pointer"}}>{s}</button>
        ))}
      </div>
    </div>
  )
}

function ProfileSelect({ onSelect }) {
  const [profiles, setProfiles] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    Promise.all([fetchProfile("parag"), fetchProfile("neha")]).then(([p,n])=>{
      setProfiles([
        { ...p, completedEps: p.completed_eps, activeEp: p.active_ep, color:C.purple, colorLight:C.purpleLight, avatar:"P" },
        { ...n, completedEps: n.completed_eps, activeEp: n.active_ep, color:C.pink,   colorLight:C.pinkLight,   avatar:"N" },
      ])
      setLoading(false)
    })
  },[])

  if (loading) return <Spinner/>

  const ahead = profiles.length===2
    ? profiles[0].completedEps.length > profiles[1].completedEps.length ? profiles[0].id
    : profiles[1].completedEps.length > profiles[0].completedEps.length ? profiles[1].id : null
    : null

  return (
    <div style={{padding:"2rem 0"}}>
      <div style={{marginBottom:28}}>
        <div style={{fontSize:13,color:"#aaa",marginBottom:4}}>Deutsch mit Hunar</div>
        <h2 style={{fontSize:22,fontWeight:500,margin:0}}>Who's learning today?</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
        {profiles.map(pr=>(
          <div key={pr.id} onClick={()=>onSelect(pr)} style={{border:"0.5px solid #ddd",borderRadius:"12px",padding:"16px 18px",cursor:"pointer",background:"#fff",position:"relative"}}>
            {ahead===pr.id&&<div style={{position:"absolute",top:10,right:12,fontSize:11,padding:"2px 10px",borderRadius:99,background:pr.colorLight,color:pr.color,fontWeight:500}}>ahead</div>}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:22,background:pr.colorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:500,color:pr.color,flexShrink:0}}>{pr.avatar}</div>
              <div>
                <div style={{fontSize:16,fontWeight:500}}>{pr.name}</div>
                <div style={{fontSize:12,color:"#888",marginTop:2}}>{pr.completedEps.length} episodes · {pr.streak} day streak 🔥</div>
              </div>
            </div>
            <XPBar xp={pr.xp} color={pr.color}/>
          </div>
        ))}
      </div>
      <div style={{background:"#f5f5f5",borderRadius:"8px",padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:18,background:C.amberLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎭</div>
        <div>
          <div style={{fontSize:13,fontWeight:500}}>Playing as Hunar</div>
          <div style={{fontSize:12,color:"#888"}}>Both profiles share the same story character</div>
        </div>
      </div>
    </div>
  )
}

function TopBar({ profile, onSwitch }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0 16px"}}>
      <button onClick={onSwitch} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"0.5px solid #ddd",borderRadius:"8px",padding:"6px 10px",cursor:"pointer"}}>
        <div style={{width:22,height:22,borderRadius:11,background:profile.colorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,color:profile.color}}>{profile.avatar}</div>
        <span style={{fontSize:13,fontWeight:500}}>{profile.name}</span>
      </button>
      <div style={{display:"flex",gap:12}}>
        <span style={{fontSize:13,color:C.coral,fontWeight:500}}>🔥 {profile.streak}</span>
        <span style={{fontSize:13,color:profile.color,fontWeight:500}}>{profile.xp} XP</span>
      </div>
    </div>
  )
}

function EpisodeMap({ profile, episodes, onEpisode, onPhrase, onTutor, onGrammar }) {
  const otherColor = profile.id==="parag"?C.pink:C.purple
  const otherColorLight = profile.id==="parag"?C.pinkLight:C.purpleLight
  const otherAvatar = profile.id==="parag"?"N":"P"
  const otherActiveEp = profile.id==="parag"?profile._otherActiveEp:profile._otherActiveEp

  return (
    <div>
      <div style={{marginBottom:16}}><XPBar xp={profile.xp} color={profile.color}/></div>
      <div style={{background:"#f5f5f5",borderRadius:"8px",padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:"#888"}}><span style={{fontWeight:500,color:"#222"}}>{profile._otherName}</span> is on ep. {profile._otherActiveEp}</div>
        <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,fontWeight:500,
          background:profile.activeEp>profile._otherActiveEp?profile.colorLight:profile.activeEp<profile._otherActiveEp?C.amberLight:C.tealLight,
          color:profile.activeEp>profile._otherActiveEp?profile.color:profile.activeEp<profile._otherActiveEp?C.amber:C.teal}}>
          {profile.activeEp>profile._otherActiveEp?"you're ahead":profile.activeEp<profile._otherActiveEp?"catch up!":"neck & neck"}
        </span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {[
          {label:"Sofort Sprechen", bg:C.tealLight,  color:C.teal,      border:C.teal,   fn:onPhrase},
          {label:"Grammar Corner",  bg:C.purpleLight, color:C.purpleDark,border:C.purple, fn:onGrammar},
          {label:"Ask Tutor ✨",    bg:C.coralLight,  color:C.coral,     border:C.coral,  fn:onTutor},
          {label:"Mistake Journal", bg:C.amberLight,  color:C.amber,     border:C.amber,  fn:null},
        ].map(b=>(
          <button key={b.label} onClick={b.fn} disabled={!b.fn} style={{padding:"10px 0",background:b.bg,color:b.color,border:`0.5px solid ${b.border}`,borderRadius:"8px",fontSize:13,fontWeight:500,cursor:b.fn?"pointer":"default",opacity:b.fn?1:0.45}}>{b.label}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column"}}>
        {episodes.map((ep,i)=>{
          const completed=profile.completedEps.includes(ep.id)
          const active=profile.activeEp===ep.id
          const locked=!completed&&!active
          const otherHere=profile._otherActiveEp===ep.id
          const isA2Start=ep.level==="A2"&&episodes[i-1]?.level==="A1"
          return (
            <div key={ep.id}>
              {isA2Start&&(<div style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0"}}><div style={{flex:1,height:0.5,background:"#ddd"}}/><span style={{fontSize:11,color:"#aaa",padding:"2px 8px",border:"0.5px solid #ddd",borderRadius:99}}>A2 begins</span><div style={{flex:1,height:0.5,background:"#ddd"}}/></div>)}
              <div style={{display:"flex",alignItems:"stretch"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                  <div style={{width:28,height:28,borderRadius:14,background:completed?profile.color:active?C.coral:"#eee",border:active?`2px solid ${C.coral}`:"0.5px solid #ccc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:completed||active?"#fff":"#aaa",fontWeight:500,flexShrink:0}}>
                    {completed?"✓":locked?"🔒":ep.id}
                  </div>
                  {i<episodes.length-1&&<div style={{flex:1,width:1,background:completed?profile.colorLight:"#eee",minHeight:16}}/>}
                </div>
                <div onClick={()=>!locked&&onEpisode(ep)} style={{flex:1,marginLeft:12,marginBottom:8,padding:"10px 14px",background:active?C.coralLight:"#fff",border:active?`1.5px solid ${C.coral}`:"0.5px solid #ddd",borderRadius:"8px",cursor:locked?"default":"pointer",opacity:locked?0.45:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500,color:active?C.coral:"#222",marginBottom:2}}>Ep. {ep.id} — {ep.title}</div>
                      <div style={{fontSize:12,color:"#888"}}>{ep.subtitle}</div>
                      {otherHere&&<div style={{marginTop:6,fontSize:11,color:otherColor,display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:14,borderRadius:7,background:otherColorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,color:otherColor}}>{otherAvatar}</div>{profile._otherName} is here too</div>}
                    </div>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:ep.level==="A1"?C.purpleLight:C.tealLight,color:ep.level==="A1"?C.purpleDark:C.teal,fontWeight:500,marginLeft:8,flexShrink:0}}>{ep.level}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── App root ──────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState(SCREENS.PROFILE)
  const [profile, setProfile] = useState(null)
  const [episodes, setEpisodes] = useState([])
  const [activeEp, setActiveEp] = useState(null)
  const [vocabEpId, setVocabEpId] = useState(null)

  useEffect(()=>{ fetchEpisodes().then(setEpisodes) },[])

  const handleSelectProfile = async (raw) => {
    const otherId = raw.id==="parag"?"neha":"parag"
    const other = await fetchProfile(otherId)
    setProfile({
      ...raw,
      _otherName: other.name,
      _otherActiveEp: other.active_ep,
    })
    setScreen(SCREENS.MAP)
  }

  const handleVocabDone = async (xpGained) => {
    const updated = { ...profile, xp: profile.xp + xpGained }
    setProfile(updated)
    await saveProfile(updated)
    setScreen(SCREENS.MAP)
  }

  const handleEpisodeDone = async () => {
    const updated = {
      ...profile,
      completedEps: [...new Set([...profile.completedEps, activeEp.id])],
      activeEp: Math.min(activeEp.id + 1, episodes.length),
    }
    setProfile(updated)
    await saveProfile(updated)
    setScreen(SCREENS.MAP)
  }

  const goMap = () => setScreen(SCREENS.MAP)
  const BackBtn = () => <button onClick={goMap} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"#aaa",padding:"0 0 16px",display:"block"}}>←</button>

  return (
    <div style={{maxWidth:420,margin:"0 auto",padding:"0 20px 48px",fontFamily:"system-ui,sans-serif"}}>
      {screen===SCREENS.PROFILE && <ProfileSelect onSelect={handleSelectProfile}/>}
      {profile && screen!==SCREENS.PROFILE && (
        <>
          <TopBar profile={profile} onSwitch={()=>{setProfile(null);setScreen(SCREENS.PROFILE)}}/>
          {screen===SCREENS.MAP && <EpisodeMap profile={profile} episodes={episodes} onEpisode={ep=>{setActiveEp(ep);setScreen(SCREENS.EPISODE)}} onPhrase={()=>setScreen(SCREENS.PHRASE)} onTutor={()=>setScreen(SCREENS.AI_TUTOR)} onGrammar={()=>setScreen(SCREENS.GRAMMAR)}/>}
          {screen===SCREENS.EPISODE && activeEp && <EpisodeScreen episode={activeEp} onDone={handleEpisodeDone} onVocab={id=>{setVocabEpId(id);setScreen(SCREENS.VOCAB_GAME)}}/>}
          {screen===SCREENS.VOCAB_GAME && <><BackBtn/><VocabGame episodeId={vocabEpId} profileId={profile.id} onDone={handleVocabDone}/></>}
          {screen===SCREENS.GRAMMAR && <><BackBtn/><GrammarScreen/></>}
          {screen===SCREENS.PHRASE && <><BackBtn/><PhraseScreen/></>}
          {screen===SCREENS.AI_TUTOR && <><BackBtn/><AiTutorScreen onBack={goMap}/></>}
        </>
      )}
    </div>
  )
}
