import { useState, useEffect } from "react"
import {
  getProfile, saveProgress,
  getEpisodes, getVocabulary,
  getAllVocabulary, getPhrases, getGrammar,
  addMistake, getMistakes,
  saveWordProgress, getDueWords, getUnseen,
  askTutor
} from "./supabase"

const C = {
  purple: "#7F77DD", purpleLight: "#EEEDFE", purpleDark: "#3C3489",
  teal: "#1D9E75", tealLight: "#E1F5EE",
  coral: "#D85A30", coralLight: "#FAECE7",
  amber: "#BA7517", amberLight: "#FAEEDA",
  pink: "#D4537E", pinkLight: "#FBEAF0",
  gray: "#888780", grayLight: "#F1EFE8",
  green: "#3B6D11", greenLight: "#EAF3DE",
  red: "#A32D2D", redLight: "#FCEBEB",
  blue: "#185FA5", blueLight: "#E6F1FB",
}

const SCREENS = {
  PROFILE:"profile", MAP:"map", EPISODE:"episode",
  VOCAB:"vocab", GRAMMAR:"grammar", PHRASE:"phrase",
  TUTOR:"tutor", WORDBANK:"wordbank", REVIEW:"review",
  MISTAKES:"mistakes"
}

const LEVEL_COLORS = {
  A1: { bg:C.purpleLight, text:C.purpleDark, border:C.purple },
  A2: { bg:C.tealLight,   text:C.teal,       border:C.teal   },
  B1: { bg:C.amberLight,  text:C.amber,       border:C.amber  },
}

// ── Episode panels ────────────────────────────────────────────

const PANELS = {
  1:[
    {id:1,text:"The plane touches down at München Flughafen. Hunar presses their face against the window. Germany. Finally.",action:null},
    {id:2,text:"At passport control, the officer looks up.",german:"Guten Tag. Ihren Reisepass, bitte.",action:"translate",choices:["Good day. Your passport, please.","Please go to gate B.","Do you have anything to declare?"],correct:0},
    {id:3,text:"Stamp. The officer smiles.",german:"Willkommen in Deutschland!",action:"translate",choices:["Have a safe flight!","Welcome to Germany!","Please collect your luggage."],correct:1},
    {id:4,text:"Through arrivals. One suitcase. The adventure begins. +30 XP",action:"complete"},
  ],
  2:[
    {id:1,text:"Hunar calls home. 'Arrived safely!' Then a knock at the door — the neighbour.",action:null},
    {id:2,text:"Frau Müller, warm smile, introduces herself.",german:"Ich heiße Müller. Ich bin verheiratet und habe zwei Kinder. Und Sie?",action:"translate",choices:["I am Müller. Married with two kids. And you?","I am new here too. Do you have children?","I live upstairs. Are you the new tenant?"],correct:0},
    {id:3,text:"Hunar tries to respond. Tap the phrases you need.",action:"tap",tapWords:[{word:"Ich heiße",meaning:"my name is"},{word:"Ich bin",meaning:"I am"},{word:"ledig",meaning:"single"},{word:"aus Indien",meaning:"from India"}]},
    {id:4,text:"Frau Müller beams. 'Willkommen in der Nachbarschaft!' First German conversation: done. +40 XP",action:"complete"},
  ],
  3:[
    {id:1,text:"The apartment is small but it is Hunar's. Time to learn what everything is called.",action:null},
    {id:2,text:"Hunar walks through the rooms, tapping each word.",action:"tap",tapWords:[{word:"die Küche",meaning:"the kitchen"},{word:"das Schlafzimmer",meaning:"the bedroom"},{word:"das Badezimmer",meaning:"the bathroom"},{word:"das Wohnzimmer",meaning:"the living room"}]},
    {id:3,text:"A letter arrives from the landlord.",german:"Die Heizung funktioniert nicht im Winter. Bitte melden Sie sich beim Hausmeister.",action:"translate",choices:["The heating doesn't work in winter. Please contact the caretaker.","The heating bill is due. Please pay at the office.","The heating is new. Please read the manual."],correct:0},
    {id:4,text:"Hunar notes: Hausmeister. One more word for the growing list. +40 XP",action:"complete"},
  ],
  4:[
    {id:1,text:"Monday. Hunar's first full day. Time to build a routine.",action:null},
    {id:2,text:"The alarm goes off at 7. Hunar narrates the day in German.",german:"Ich stehe auf. Ich dusche. Ich frühstücke. Dann gehe ich einkaufen.",action:"translate",choices:["I get up. I shower. I have breakfast. Then I go shopping.","I wake up late. I skip breakfast. Then I go to work.","I get up early. I eat lunch. Then I go to the gym."],correct:0},
    {id:3,text:"Tap the daily routine verbs.",action:"tap",tapWords:[{word:"aufstehen",meaning:"to get up"},{word:"frühstücken",meaning:"to have breakfast"},{word:"einkaufen",meaning:"to go shopping"},{word:"schlafen",meaning:"to sleep"}]},
    {id:4,text:"By evening Hunar has a routine. Small, but real. +50 XP",action:"complete"},
  ],
  5:[
    {id:1,text:"The fridge is empty. Supermarkt time.",action:null},
    {id:2,text:"Hunar picks up a carton.",german:"Vollmilch — 3,5% Fett — 1 Liter\nMindesthaltbarkeitsdatum: 15.04.2026",action:null},
    {id:3,text:"The cashier speaks fast.",german:"Das macht zusammen vier Euro fünfzig, bitte.",action:"translate",choices:["That's four fifty altogether, please.","You have four items, please.","Please go to aisle four."],correct:0},
    {id:4,text:"One more question.",german:"Haben Sie eine Kundenkarte?",action:"translate",choices:["Have a good day!","Do you have a loyalty card?","Do you need a bag?"],correct:1},
    {id:5,text:"Groceries bought. Hunar celebrates with a Brezel. +50 XP",action:"complete"},
  ],
  6:[
    {id:1,text:"Hunar discovers the local Bäckerei. The smell alone is worth learning German for.",action:null},
    {id:2,text:"The menu is entirely in German.",german:"Kaffee — 2,50 €\nTee — 2,00 €\nBrezel — 1,20 €\nKuchen — 3,50 €",action:null},
    {id:3,text:"The baker asks what Hunar would like.",german:"Was darf es sein?",action:"translate",choices:["What can I get you?","What time does it close?","Would you like a receipt?"],correct:0},
    {id:4,text:"Hunar orders. Tap the key phrases.",action:"tap",tapWords:[{word:"Ich möchte",meaning:"I would like"},{word:"einen Kaffee",meaning:"a coffee"},{word:"bitte",meaning:"please"},{word:"zum Mitnehmen",meaning:"to take away"}]},
    {id:5,text:"'Sehr gut!' First German food order: a success. +50 XP",action:"complete"},
  ],
  7:[
    {id:1,text:"Hunar needs to cross the city. The public transport system looks complicated. It isn't.",action:null},
    {id:2,text:"At the U-Bahn ticket machine.",german:"Einzelfahrt — 3,70 €\nTageskarte — 9,20 €\nWochenkarte — 34,00 €",action:"translate",choices:["Single — 3.70 / Day pass — 9.20 / Weekly — 34.00","First class — 3.70 / Business — 9.20 / Group — 34.00","Zone A — 3.70 / Zone B — 9.20 / All zones — 34.00"],correct:0},
    {id:3,text:"An announcement plays on the platform.",german:"Die U-Bahn nach Marienplatz fährt in zwei Minuten ab. Bitte einsteigen.",action:"translate",choices:["The U-Bahn to Marienplatz departs in two minutes. Please board.","Next train delayed two minutes. Please wait.","The U-Bahn arrives in two minutes. Please exit."],correct:0},
    {id:4,text:"Made it. The city is getting smaller — in the best way. +50 XP",action:"complete"},
  ],
  8:[
    {id:1,text:"Hunar wakes up with a sore throat. Time to navigate the German healthcare system.",action:null},
    {id:2,text:"At the Arztpraxis. Tap what you understand.",action:"tap",tapWords:[{word:"der Hals",meaning:"the throat"},{word:"Schmerzen",meaning:"pain"},{word:"seit wann",meaning:"since when"},{word:"die Versicherung",meaning:"insurance"}]},
    {id:3,text:"The doctor speaks.",german:"Sie haben eine leichte Erkältung. Trinken Sie viel Wasser und ruhen Sie sich aus.",action:"translate",choices:["You have a mild cold. Drink plenty of water and rest.","You need antibiotics. Come back in three days.","You have an infection. I'll write a prescription."],correct:0},
    {id:4,text:"Sick note in hand. New word: Erkältung. Germany 1, Hunar 1. +50 XP",action:"complete"},
  ],
}

const EPISODE_LIST = [
  {id:1, level:"A1",title:"Sich vorstellen",   subtitle:"Introducing yourself",      grammar:"sein, W-questions, du vs Sie"},
  {id:2, level:"A1",title:"Familie",            subtitle:"Family & relationships",    grammar:"Possessive pronouns, haben"},
  {id:3, level:"A1",title:"Wohnen",             subtitle:"Home & living",             grammar:"Prepositions + Dativ, es gibt"},
  {id:4, level:"A1",title:"Alltag",             subtitle:"Daily routine",             grammar:"Regular verbs, separable verbs"},
  {id:5, level:"A1",title:"Einkaufen",          subtitle:"Shopping",                  grammar:"Akkusativ, kein/keine, nicht"},
  {id:6, level:"A1",title:"Essen & Trinken",    subtitle:"Food & drink",              grammar:"möchten, restaurant vocab"},
  {id:7, level:"A1",title:"Verkehr & Transport",subtitle:"Getting around",            grammar:"Dativ prepositions, contractions"},
  {id:8, level:"A1",title:"Gesundheit",         subtitle:"Health & body",             grammar:"müssen, können, dürfen"},
  {id:9, level:"A1",title:"Freizeit",           subtitle:"Hobbies & free time",       grammar:"mögen, gern, lieber"},
  {id:10,level:"A1",title:"Arbeit",             subtitle:"Work & jobs",               grammar:"All W-questions, job vocabulary"},
  {id:11,level:"A1",title:"Kommunikation",      subtitle:"Phone & messages",          grammar:"Imperative Sie form, dürfen"},
  {id:12,level:"A1",title:"Behörden",           subtitle:"Bureaucracy & paperwork",   grammar:"Numbers, dates, times, V2 rule"},
  {id:13,level:"A2",title:"Vergangenes",        subtitle:"Talking about the past",    grammar:"Perfekt tense"},
  {id:14,level:"A2",title:"Pläne & Zukunft",   subtitle:"Plans & future",            grammar:"Futur I & werden"},
  {id:15,level:"A2",title:"Meinungen",          subtitle:"Expressing opinions",       grammar:"Konjunktionen"},
  {id:16,level:"A2",title:"Kleidung & Mode",    subtitle:"Clothes & shopping",        grammar:"Adjective endings"},
  {id:17,level:"A2",title:"Reisen",             subtitle:"Travel & holidays",         grammar:"Prepositions mit Dativ"},
  {id:18,level:"A2",title:"Wetter",             subtitle:"Weather & seasons",         grammar:"Es gibt / Es ist"},
  {id:19,level:"A2",title:"Medien",             subtitle:"Media & news",              grammar:"Relativsätze intro"},
  {id:20,level:"A2",title:"Bildung",            subtitle:"Education & learning",      grammar:"Nebensätze mit dass"},
  {id:21,level:"A2",title:"Geld & Bank",        subtitle:"Money & banking",           grammar:"Konjunktiv II: würde"},
  {id:22,level:"A2",title:"Nachbarschaft",      subtitle:"Neighbourhood",             grammar:"Genitiv intro"},
  {id:23,level:"A2",title:"Gefühle",            subtitle:"Emotions & relationships",  grammar:"Reflexive verbs"},
  {id:24,level:"A2",title:"Kultur",             subtitle:"Culture & traditions",      grammar:"Passiv intro"},
  {id:25,level:"B1",title:"Beruf & Karriere",   subtitle:"Career & ambitions",        grammar:"Infinitiv mit zu"},
  {id:26,level:"B1",title:"Gesellschaft",       subtitle:"Society & current events",  grammar:"Passiv Perfekt"},
  {id:27,level:"B1",title:"Umwelt",             subtitle:"Environment",               grammar:"Konzessivsätze"},
  {id:28,level:"B1",title:"Technologie",        subtitle:"Technology",                grammar:"Futur II"},
  {id:29,level:"B1",title:"Kunst & Literatur",  subtitle:"Art & literature",          grammar:"Konjunktiv I"},
  {id:30,level:"B1",title:"Geschichte",         subtitle:"History & politics",        grammar:"Plusquamperfekt"},
  {id:31,level:"B1",title:"Gesundheitssystem",  subtitle:"Healthcare system",         grammar:"Modalverben Passiv"},
  {id:32,level:"B1",title:"Recht & Ordnung",    subtitle:"Law & civic life",          grammar:"Partizipialkonstruktionen"},
  {id:33,level:"B1",title:"Wirtschaft",         subtitle:"Economy & business",        grammar:"Nominalisierung"},
  {id:34,level:"B1",title:"Redewendungen",      subtitle:"Idioms & expressions",      grammar:"Sprichwörter"},
  {id:35,level:"B1",title:"Diskutieren",        subtitle:"Debating & arguing",        grammar:"Argumentationsstruktur"},
  {id:36,level:"B1",title:"Prüfungsvorbereitung",subtitle:"Exam preparation",         grammar:"B1 overview"},
]

// ── Helpers ───────────────────────────────────────────────────

const Spinner = () => <div style={{textAlign:"center",padding:"3rem",color:"#aaa",fontSize:14}}>Loading...</div>

function BackBtn({onBack,label="Back"}) {
  return (
    <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer",color:"#aaa",padding:"0 0 16px",fontSize:14}}>
      <span style={{fontSize:20}}>←</span>{label}
    </button>
  )
}

function XPBar({xp,color}) {
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

function LimitMessage({onBack}) {
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

// ── Profile Select ────────────────────────────────────────────

function ProfileSelect({onSelect}) {
  const [profiles,setProfiles]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{
    Promise.all([getProfile("parag"),getProfile("neha")]).then(([p,n])=>{
      setProfiles([
        {...p,completedEps:p.completed_eps||[],activeEp:p.active_ep||1,color:C.purple,colorLight:C.purpleLight,avatar:"P"},
        {...n,completedEps:n.completed_eps||[],activeEp:n.active_ep||1,color:C.pink,  colorLight:C.pinkLight,  avatar:"N"},
      ])
      setLoading(false)
    })
  },[])
  if(loading) return <Spinner/>
  const ahead=profiles.length===2?profiles[0].completedEps.length>profiles[1].completedEps.length?profiles[0].id:profiles[1].completedEps.length>profiles[0].completedEps.length?profiles[1].id:null:null
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
        <div><div style={{fontSize:13,fontWeight:500}}>Playing as Hunar</div><div style={{fontSize:12,color:"#888"}}>Both profiles share the same story character</div></div>
      </div>
    </div>
  )
}

// ── Top Bar ───────────────────────────────────────────────────

function TopBar({profile,onSwitch}) {
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

// ── Episode Map ───────────────────────────────────────────────

function EpisodeMap({profile,onEpisode,onPhrase,onTutor,onGrammar,onWordBank,onReview,onMistakes}) {
  const otherColor=profile.id==="parag"?C.pink:C.purple
  const otherColorLight=profile.id==="parag"?C.pinkLight:C.purpleLight
  const otherAvatar=profile.id==="parag"?"N":"P"
  const levels=["A1","A2","B1"]
  return (
    <div>
      <div style={{marginBottom:16}}><XPBar xp={profile.xp} color={profile.color}/></div>
      <div style={{background:"#f5f5f5",borderRadius:"8px",padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:"#888"}}><span style={{fontWeight:500,color:"#222"}}>{profile._otherName}</span> is on ep. {profile._otherActiveEp}</div>
        <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,fontWeight:500,background:profile.activeEp>profile._otherActiveEp?profile.colorLight:profile.activeEp<profile._otherActiveEp?C.amberLight:C.tealLight,color:profile.activeEp>profile._otherActiveEp?profile.color:profile.activeEp<profile._otherActiveEp?C.amber:C.teal}}>
          {profile.activeEp>profile._otherActiveEp?"you're ahead":profile.activeEp<profile._otherActiveEp?"catch up!":"neck & neck"}
        </span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {[
          {label:"Word Bank 📖",   bg:C.blueLight,   color:C.blue,      border:C.blue,   fn:onWordBank},
          {label:"Daily Review 🔁",bg:C.tealLight,   color:C.teal,      border:C.teal,   fn:onReview},
          {label:"Grammar 📐",     bg:C.purpleLight, color:C.purpleDark,border:C.purple, fn:onGrammar},
          {label:"Phrases 🗣️",    bg:C.coralLight,  color:C.coral,     border:C.coral,  fn:onPhrase},
          {label:"Ask Tutor ✨",   bg:C.amberLight,  color:C.amber,     border:C.amber,  fn:onTutor},
          {label:"Mistakes 📓",    bg:C.grayLight,   color:C.gray,      border:"#ccc",   fn:onMistakes},
        ].map(b=>(
          <button key={b.label} onClick={b.fn} style={{padding:"10px 0",background:b.bg,color:b.color,border:`0.5px solid ${b.border}`,borderRadius:"8px",fontSize:13,fontWeight:500,cursor:"pointer"}}>{b.label}</button>
        ))}
      </div>
      {levels.map(level=>{
        const eps=EPISODE_LIST.filter(e=>e.level===level)
        const lc=LEVEL_COLORS[level]
        return (
          <div key={level} style={{marginBottom:24}}>
            <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:12}}>
              <div style={{flex:1,height:0.5,background:"#ddd"}}/>
              <span style={{fontSize:11,padding:"3px 10px",borderRadius:99,background:lc.bg,color:lc.text,fontWeight:500,border:`0.5px solid ${lc.border}`}}>{level}</span>
              <div style={{flex:1,height:0.5,background:"#ddd"}}/>
            </div>
            {eps.map((ep,i)=>{
              const completed=profile.completedEps.includes(ep.id)
              const active=profile.activeEp===ep.id
              const locked=!completed&&!active
              const otherHere=profile._otherActiveEp===ep.id
              const hasContent=!!PANELS[ep.id]
              return (
                <div key={ep.id} style={{display:"flex",alignItems:"stretch"}}>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                    <div style={{width:28,height:28,borderRadius:14,background:completed?profile.color:active?C.coral:"#eee",border:active?`2px solid ${C.coral}`:"0.5px solid #ccc",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:completed||active?"#fff":"#aaa",fontWeight:500,flexShrink:0}}>
                      {completed?"✓":locked?"🔒":ep.id}
                    </div>
                    {i<eps.length-1&&<div style={{flex:1,width:1,background:completed?profile.colorLight:"#eee",minHeight:16}}/>}
                  </div>
                  <div onClick={()=>!locked&&hasContent&&onEpisode(ep)} style={{flex:1,marginLeft:12,marginBottom:8,padding:"10px 14px",background:active?C.coralLight:"#fff",border:active?`1.5px solid ${C.coral}`:"0.5px solid #ddd",borderRadius:"8px",cursor:locked||!hasContent?"default":"pointer",opacity:locked?0.45:1}}>
                    <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                      <div style={{flex:1}}>
                        <div style={{fontSize:14,fontWeight:500,color:active?C.coral:"#222",marginBottom:2}}>{ep.title}</div>
                        <div style={{fontSize:12,color:"#888"}}>{ep.subtitle}</div>
                        <div style={{fontSize:11,color:"#ccc",marginTop:2}}>📐 {ep.grammar}</div>
                        {otherHere&&<div style={{marginTop:6,fontSize:11,color:otherColor,display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:14,borderRadius:7,background:otherColorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,color:otherColor}}>{otherAvatar}</div>{profile._otherName} is here too</div>}
                        {!hasContent&&!locked&&<div style={{fontSize:11,color:C.amber,marginTop:4}}>Coming soon</div>}
                      </div>
                      <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:lc.bg,color:lc.text,fontWeight:500,marginLeft:8,flexShrink:0}}>{ep.level}</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )
      })}
    </div>
  )
}

// ── Episode Screen ────────────────────────────────────────────

function EpisodeScreen({episode,onBack,onComplete}) {
  const panels=PANELS[episode.id]
  const [panel,setPanel]=useState(0)
  const [tapped,setTapped]=useState({})
  const [chosen,setChosen]=useState(null)
  const p=panels[panel]
  const allTapped=p.tapWords?p.tapWords.every(w=>tapped[w.word]):true
  const canContinue=p.action==="tap"?allTapped:p.action==="translate"?chosen!==null:true
  const next=()=>{
    if(p.action==="complete"){onComplete();return}
    if(panel<panels.length-1){setPanel(v=>v+1);setTapped({});setChosen(null)}
  }
  return (
    <div style={{minHeight:440,display:"flex",flexDirection:"column"}}>
      <BackBtn onBack={onBack}/>
      <div style={{display:"flex",gap:4,marginBottom:16}}>
        {panels.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=panel?C.coral:"#eee",transition:"background 0.3s"}}/>)}
      </div>
      <div style={{marginBottom:16,padding:"8px 12px",background:C.purpleLight,borderRadius:"8px"}}>
        <span style={{fontSize:11,color:C.purpleDark,fontWeight:500}}>📐 Grammar focus: </span>
        <span style={{fontSize:11,color:C.purpleDark}}>{episode.grammar}</span>
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"#aaa",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>{episode.level} · {episode.title}</div>
        <p style={{fontSize:15,color:"#555",lineHeight:1.7,marginBottom:20}}>{p.text}</p>
        {p.german&&<div style={{background:C.purpleLight,border:`0.5px solid ${C.purple}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20,fontFamily:"Georgia,serif",fontSize:15,lineHeight:1.9,whiteSpace:"pre-line",color:C.purpleDark}}>{p.german}</div>}
        {p.action==="tap"&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"#888",marginBottom:10}}>Tap each word to learn it:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {p.tapWords.map(w=>(
                <div key={w.word} onClick={()=>setTapped(t=>({...t,[w.word]:true}))} style={{padding:"8px 14px",borderRadius:"8px",cursor:"pointer",background:tapped[w.word]?C.tealLight:"#f5f5f5",border:tapped[w.word]?`0.5px solid ${C.teal}`:"0.5px solid #ddd",transition:"all 0.2s"}}>
                  <div style={{fontSize:14,fontWeight:500,color:tapped[w.word]?C.teal:"#222"}}>{w.word}</div>
                  {tapped[w.word]&&<div style={{fontSize:12,color:C.teal,marginTop:2}}>{w.meaning}</div>}
                </div>
              ))}
            </div>
            {allTapped&&<div style={{marginTop:12,fontSize:13,color:C.teal}}>All learned! You can continue.</div>}
          </div>
        )}
        {p.action==="translate"&&(
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"#888",marginBottom:10}}>What does this mean?</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {p.choices.map((ch,i)=>{
                const isChosen=chosen===i,correct=p.correct===i
                return <div key={i} onClick={()=>chosen===null&&setChosen(i)} style={{padding:"12px 14px",borderRadius:"8px",cursor:chosen===null?"pointer":"default",background:isChosen?(correct?C.greenLight:C.redLight):"#f5f5f5",border:`0.5px solid ${isChosen?(correct?C.teal:C.red):"#ddd"}`,fontSize:14,color:isChosen?(correct?C.green:C.red):"#222",transition:"all 0.2s"}}>{ch}{isChosen&&<span style={{marginLeft:8}}>{correct?"✓":"✗"}</span>}</div>
              })}
            </div>
          </div>
        )}
        {p.action==="complete"&&<div style={{background:C.greenLight,border:`0.5px solid ${C.green}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20}}><div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>Episode complete!</div><div style={{fontSize:13,color:C.green}}>Now practice the vocabulary from this episode.</div></div>}
      </div>
      <button onClick={next} disabled={!canContinue} style={{width:"100%",padding:"12px 0",background:!canContinue?"#eee":C.coral,color:!canContinue?"#aaa":"#fff",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:!canContinue?"default":"pointer",transition:"all 0.2s"}}>
        {p.action==="complete"?"Practice vocabulary":"Continue"}
      </button>
    </div>
  )
}

// ── Vocab Game ────────────────────────────────────────────────

function VocabGame({episodeId,profileId,onDone,onBack}) {
  const [words,setWords]=useState([])
  const [idx,setIdx]=useState(0)
  const [flipped,setFlipped]=useState(false)
  const [result,setResult]=useState(null)
  const [scores,setScores]=useState({know:0,review:0})
  const [done,setDone]=useState(false)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getVocabulary(episodeId).then(d=>{setWords(d);setLoading(false)})},[episodeId])
  if(loading) return <Spinner/>
  if(!words.length) return <div style={{textAlign:"center",padding:"2rem",color:"#888"}}><div style={{fontSize:32,marginBottom:12}}>📚</div>Vocabulary coming soon for this episode.<br/><br/><button onClick={()=>onDone(0)} style={{padding:"10px 24px",background:C.purpleLight,color:C.purpleDark,border:`0.5px solid ${C.purple}`,borderRadius:"8px",fontSize:14,cursor:"pointer"}}>Back to map</button></div>
  const current=words[idx]
  const answer=async(knew)=>{
    setResult(knew?"know":"review")
    setScores(s=>({...s,[knew?"know":"review"]:s[knew?"know":"review"]+1}))
    await saveWordProgress(profileId,current.id,knew)
    if(!knew) await addMistake(profileId,current.de,current.en)
    setTimeout(()=>{
      if(idx<words.length-1){setIdx(i=>i+1);setFlipped(false);setResult(null)}
      else setDone(true)
    },700)
  }
  if(done) return (
    <div style={{textAlign:"center",padding:"2rem 0"}}>
      <div style={{fontSize:48,marginBottom:16}}>🎉</div>
      <h3 style={{fontSize:18,fontWeight:500,margin:"0 0 8px"}}>Vocab round complete!</h3>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"20px 0"}}>
        <div style={{padding:"12px 20px",background:C.greenLight,borderRadius:"8px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:500,color:C.green}}>{scores.know}</div><div style={{fontSize:12,color:C.green}}>I knew it</div></div>
        <div style={{padding:"12px 20px",background:C.amberLight,borderRadius:"8px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:500,color:C.amber}}>{scores.review}</div><div style={{fontSize:12,color:C.amber}}>needs review</div></div>
      </div>
      <p style={{fontSize:13,color:"#888",margin:"0 0 24px"}}>Words to review saved to your Daily Review.</p>
      <button onClick={()=>onDone(scores.know*10)} style={{padding:"12px 32px",background:C.purple,color:"#fff",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:"pointer"}}>Back to map · +{scores.know*10} XP</button>
    </div>
  )
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:13,color:"#888"}}>{idx+1} / {words.length}</span>
        <div style={{display:"flex",gap:4}}>{words.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i<idx?C.purple:i===idx?C.coral:"#eee"}}/>)}</div>
        <span style={{fontSize:13,color:C.green}}>{scores.know} known</span>
      </div>
      <div onClick={()=>setFlipped(f=>!f)} style={{minHeight:200,background:result==="know"?C.greenLight:result==="review"?C.amberLight:flipped?C.purpleLight:"#f5f5f5",border:`1.5px solid ${result==="know"?C.teal:result==="review"?C.amber:flipped?C.purple:"#ddd"}`,borderRadius:"12px",padding:"24px 20px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"all 0.2s",marginBottom:20}}>
        {!flipped?(<><div style={{fontSize:22,fontWeight:500,marginBottom:8}}>{current.de}</div><div style={{fontSize:13,color:"#aaa"}}>tap to reveal</div></>):(<><div style={{fontSize:13,color:C.purpleDark,marginBottom:8}}>{current.de}</div><div style={{fontSize:20,fontWeight:500,color:C.purpleDark,marginBottom:12}}>{current.en}</div><div style={{fontSize:12,color:C.purple,background:"#fff",padding:"4px 12px",borderRadius:99}}>{current.hint}</div></>)}
      </div>
      {flipped&&!result&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><button onClick={()=>answer(false)} style={{padding:"14px 0",background:C.amberLight,color:C.amber,border:`0.5px solid ${C.amber}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Still learning</button><button onClick={()=>answer(true)} style={{padding:"14px 0",background:C.greenLight,color:C.green,border:`0.5px solid ${C.green}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>I knew it!</button></div>}
      {!flipped&&<div style={{textAlign:"center",fontSize:13,color:"#aaa"}}>Tap the card to see the meaning</div>}
    </div>
  )
}

// ── Word Bank ─────────────────────────────────────────────────

function WordBankScreen({profileId,onBack}) {
  const [words,setWords]=useState([])
  const [filter,setFilter]=useState("A1")
  const [search,setSearch]=useState("")
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getAllVocabulary().then(d=>{setWords(d);setLoading(false)})},[])
  if(loading) return <><BackBtn onBack={onBack}/><Spinner/></>
  const eps=EPISODE_LIST.filter(e=>e.level===filter)
  const epIds=new Set(eps.map(e=>e.id))
  const filtered=words.filter(w=>epIds.has(w.episode_id)&&(search===""||w.de.toLowerCase().includes(search.toLowerCase())||w.en.toLowerCase().includes(search.toLowerCase())))
  const byEp={}
  filtered.forEach(w=>{if(!byEp[w.episode_id])byEp[w.episode_id]=[];byEp[w.episode_id].push(w)})
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Word Bank</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 16px"}}>All {filter} vocabulary — {filtered.length} words</p>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {["A1","A2","B1"].map(l=>{const lc=LEVEL_COLORS[l];return<button key={l} onClick={()=>setFilter(l)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:filter===l?lc.bg:"#f5f5f5",color:filter===l?lc.text:"#888",border:filter===l?`0.5px solid ${lc.border}`:"none",cursor:"pointer",fontWeight:filter===l?500:400}}>{l}</button>})}
      </div>
      <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search words..." style={{width:"100%",boxSizing:"border-box",marginBottom:16,padding:"8px 12px",borderRadius:"8px",border:"0.5px solid #ddd",fontSize:14}}/>
      {Object.entries(byEp).map(([epId,epWords])=>{
        const ep=EPISODE_LIST.find(e=>e.id===parseInt(epId))
        return (
          <div key={epId} style={{marginBottom:20}}>
            <div style={{fontSize:12,fontWeight:500,color:"#888",marginBottom:8,textTransform:"uppercase",letterSpacing:0.5}}>{ep?.title} · {epWords.length} words</div>
            <div style={{display:"flex",flexDirection:"column",gap:4}}>
              {epWords.map(w=>(
                <div key={w.id} style={{display:"flex",justifyContent:"space-between",padding:"8px 12px",background:"#f9f9f9",borderRadius:"6px",border:"0.5px solid #eee"}}>
                  <span style={{fontSize:14,fontWeight:500,color:"#222"}}>{w.de}</span>
                  <span style={{fontSize:13,color:"#888"}}>{w.en}</span>
                </div>
              ))}
            </div>
          </div>
        )
      })}
      {filtered.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#aaa"}}>No words found</div>}
    </div>
  )
}

// ── Daily Review (spaced repetition) ─────────────────────────

function ReviewScreen({profileId,onDone,onBack}) {
  const [words,setWords]=useState([])
  const [idx,setIdx]=useState(0)
  const [flipped,setFlipped]=useState(false)
  const [result,setResult]=useState(null)
  const [scores,setScores]=useState({know:0,review:0})
  const [done,setDone]=useState(false)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getDueWords(profileId,20).then(d=>{setWords(d.map(r=>r.vocabulary));setLoading(false)})},[profileId])
  if(loading) return <><BackBtn onBack={onBack}/><Spinner/></>
  if(!words.length) return (
    <div>
      <BackBtn onBack={onBack}/>
      <div style={{textAlign:"center",padding:"2rem"}}>
        <div style={{fontSize:48,marginBottom:16}}>✅</div>
        <h3 style={{fontSize:17,fontWeight:500,margin:"0 0 10px"}}>All caught up!</h3>
        <p style={{fontSize:14,color:"#888"}}>No words due for review right now. Complete more episodes to add words to your review queue.</p>
      </div>
    </div>
  )
  if(done) return (
    <div style={{textAlign:"center",padding:"2rem 0"}}>
      <div style={{fontSize:48,marginBottom:16}}>🔁</div>
      <h3 style={{fontSize:18,fontWeight:500,margin:"0 0 8px"}}>Review complete!</h3>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"20px 0"}}>
        <div style={{padding:"12px 20px",background:C.greenLight,borderRadius:"8px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:500,color:C.green}}>{scores.know}</div><div style={{fontSize:12,color:C.green}}>remembered</div></div>
        <div style={{padding:"12px 20px",background:C.amberLight,borderRadius:"8px",textAlign:"center"}}><div style={{fontSize:22,fontWeight:500,color:C.amber}}>{scores.review}</div><div style={{fontSize:12,color:C.amber}}>still learning</div></div>
      </div>
      <button onClick={()=>onDone(scores.know*5)} style={{padding:"12px 32px",background:C.teal,color:"#fff",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:"pointer"}}>Done · +{scores.know*5} XP</button>
    </div>
  )
  const current=words[idx]
  const answer=async(knew)=>{
    setResult(knew?"know":"review")
    setScores(s=>({...s,[knew?"know":"review"]:s[knew?"know":"review"]+1}))
    await saveWordProgress(profileId,current.id,knew)
    setTimeout(()=>{
      if(idx<words.length-1){setIdx(i=>i+1);setFlipped(false);setResult(null)}
      else setDone(true)
    },700)
  }
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:13,color:"#888"}}>Review {idx+1} / {words.length}</span>
        <span style={{fontSize:13,color:C.green}}>{scores.know} remembered</span>
      </div>
      <div onClick={()=>setFlipped(f=>!f)} style={{minHeight:200,background:result==="know"?C.greenLight:result==="review"?C.amberLight:flipped?C.tealLight:"#f5f5f5",border:`1.5px solid ${result==="know"?C.teal:result==="review"?C.amber:flipped?C.teal:"#ddd"}`,borderRadius:"12px",padding:"24px 20px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"all 0.2s",marginBottom:20}}>
        {!flipped?(<><div style={{fontSize:22,fontWeight:500,marginBottom:8}}>{current.de}</div><div style={{fontSize:13,color:"#aaa"}}>tap to recall</div></>):(<><div style={{fontSize:13,color:C.teal,marginBottom:8}}>{current.de}</div><div style={{fontSize:20,fontWeight:500,color:C.teal,marginBottom:12}}>{current.en}</div>{current.hint&&<div style={{fontSize:12,color:C.teal,background:"#fff",padding:"4px 12px",borderRadius:99}}>{current.hint}</div>}</>)}
      </div>
      {flipped&&!result&&<div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}><button onClick={()=>answer(false)} style={{padding:"14px 0",background:C.amberLight,color:C.amber,border:`0.5px solid ${C.amber}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Forgot</button><button onClick={()=>answer(true)} style={{padding:"14px 0",background:C.greenLight,color:C.green,border:`0.5px solid ${C.green}`,borderRadius:"8px",fontSize:14,fontWeight:500,cursor:"pointer"}}>Remembered!</button></div>}
      {!flipped&&<div style={{textAlign:"center",fontSize:13,color:"#aaa"}}>Tap the card to try recalling</div>}
    </div>
  )
}

// ── Mistakes ──────────────────────────────────────────────────

function MistakesScreen({profileId,onBack}) {
  const [mistakes,setMistakes]=useState([])
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getMistakes(profileId).then(d=>{setMistakes(d);setLoading(false)})},[profileId])
  if(loading) return <><BackBtn onBack={onBack}/><Spinner/></>
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Mistake Journal</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 16px"}}>Words that need more practice — sorted by difficulty.</p>
      {mistakes.length===0&&<div style={{textAlign:"center",padding:"2rem",color:"#aaa"}}><div style={{fontSize:32,marginBottom:12}}>🌟</div>No mistakes yet! Keep going.</div>}
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {mistakes.map((m,i)=>(
          <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 14px",background:"#fff",borderRadius:"8px",border:"0.5px solid #ddd"}}>
            <div>
              <div style={{fontSize:14,fontWeight:500}}>{m.word_de}</div>
              <div style={{fontSize:12,color:"#888"}}>{m.word_en}</div>
            </div>
            <div style={{textAlign:"right"}}>
              <div style={{fontSize:12,padding:"2px 8px",borderRadius:99,background:m.wrong_count>=3?C.redLight:C.amberLight,color:m.wrong_count>=3?C.red:C.amber,fontWeight:500}}>{m.wrong_count}× wrong</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Grammar ───────────────────────────────────────────────────

function GrammarScreen({onBack}) {
  const [cards,setCards]=useState([])
  const [active,setActive]=useState(null)
  const [lang,setLang]=useState("en")
  const [levelFilter,setLevelFilter]=useState("A1")
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getGrammar().then(d=>{setCards(d);setLoading(false)})},[])
  if(loading) return <><BackBtn onBack={onBack}/><Spinner/></>
  const filtered=cards.filter(c=>c.level===levelFilter)
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Grammar Corner</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 12px"}}>Every grammar concept — nothing missing.</p>
      <div style={{display:"flex",gap:8,marginBottom:12}}>
        {["A1","A2","B1"].map(l=>{const lc=LEVEL_COLORS[l];return<button key={l} onClick={()=>setLevelFilter(l)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:levelFilter===l?lc.bg:"#f5f5f5",color:levelFilter===l?lc.text:"#888",border:"none",cursor:"pointer",fontWeight:levelFilter===l?500:400}}>{l}</button>})}
      </div>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setLang(v)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:lang===v?C.purpleLight:"#f5f5f5",color:lang===v?C.purpleDark:"#888",border:"none",cursor:"pointer",fontWeight:lang===v?500:400}}>{l}</button>
        ))}
      </div>
      <div style={{marginBottom:12,fontSize:12,color:"#aaa"}}>{filtered.length} concepts for {levelFilter}</div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {filtered.map(card=>{
          const examples=typeof card.examples==="string"?JSON.parse(card.examples):card.examples
          const lc=LEVEL_COLORS[card.level]||LEVEL_COLORS.A1
          return (
            <div key={card.id} style={{border:active===card.id?`1.5px solid ${C.purple}`:"0.5px solid #ddd",borderRadius:"12px",overflow:"hidden"}}>
              <div onClick={()=>setActive(active===card.id?null:card.id)} style={{padding:"14px 16px",cursor:"pointer",background:active===card.id?C.purpleLight:"#fff",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div>
                  <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:lc.bg,color:lc.text,fontWeight:500,marginRight:8}}>{card.level}</span>
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
                      <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"baseline",flexWrap:"wrap"}}>
                        <div style={{fontSize:14,fontWeight:500,color:C.purpleDark,minWidth:160}}>{ex.de}</div>
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

// ── Phrases ───────────────────────────────────────────────────

function PhraseScreen({onBack}) {
  const [phrases,setPhrases]=useState([])
  const [active,setActive]=useState(null)
  const [showHi,setShowHi]=useState(false)
  const [loading,setLoading]=useState(true)
  useEffect(()=>{getPhrases().then(d=>{setPhrases(d);setLoading(false)})},[])
  if(loading) return <><BackBtn onBack={onBack}/><Spinner/></>
  return (
    <div>
      <BackBtn onBack={onBack}/>
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

// ── AI Tutor ──────────────────────────────────────────────────

function TutorScreen({onBack}) {
  const [q,setQ]=useState("")
  const [lang,setLang]=useState("en")
  const [ans,setAns]=useState(null)
  const [loading,setLoading]=useState(false)
  const [limitHit,setLimitHit]=useState(false)
  const ask=async()=>{
    if(!q.trim())return
    setLoading(true);setAns(null);setLimitHit(false)
    try{setAns(await askTutor(q,lang))}
    catch(e){e.status===429||e.message==="rate_limit"?setLimitHit(true):setAns("Something went wrong. Please try again.")}
    finally{setLoading(false)}
  }
  if(limitHit) return <><BackBtn onBack={onBack}/><LimitMessage onBack={onBack}/></>
  return (
    <div>
      <BackBtn onBack={onBack}/>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Ask the Tutor</h2>
      <p style={{fontSize:13,color:"#888",margin:"0 0 16px"}}>Any question about German — grammar, words, culture.</p>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setLang(v)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:lang===v?C.purpleLight:"#f5f5f5",color:lang===v?C.purpleDark:"#888",border:"none",cursor:"pointer",fontWeight:lang===v?500:400}}>{l}</button>
        ))}
      </div>
      <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. When do I use 'der' vs 'die' vs 'das'?" rows={3} style={{width:"100%",boxSizing:"border-box",resize:"none",fontSize:14,padding:12,borderRadius:"8px",border:"0.5px solid #ddd",background:"#fff",color:"#222",fontFamily:"sans-serif",marginBottom:10}}/>
      <button onClick={ask} disabled={loading||!q.trim()} style={{width:"100%",padding:"12px 0",background:q.trim()&&!loading?C.amber:"#eee",color:q.trim()&&!loading?"#fff":"#aaa",border:"none",borderRadius:"12px",fontSize:15,fontWeight:500,cursor:q.trim()&&!loading?"pointer":"default",marginBottom:20}}>
        {loading?"Thinking...":"Ask"}
      </button>
      {ans&&<div style={{background:C.amberLight,border:`0.5px solid ${C.amber}`,borderRadius:"8px",padding:"14px 16px",marginBottom:20}}><div style={{fontSize:11,color:C.amber,fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Tutor</div><p style={{fontSize:14,color:"#333",lineHeight:1.8,margin:0}}>{ans}</p></div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {["Why is it 'dem' not 'der'?","What is Perfekt tense?","Dativ vs Akkusativ?","What does Feierabend mean?","How do separable verbs work?","When do I use möchten vs wollen?"].map(s=>(
          <button key={s} onClick={()=>setQ(s)} style={{fontSize:12,padding:"6px 12px",borderRadius:99,background:"#f5f5f5",color:"#888",border:"0.5px solid #ddd",cursor:"pointer"}}>{s}</button>
        ))}
      </div>
    </div>
  )
}

// ── App Root ──────────────────────────────────────────────────

export default function App() {
  const [screen,setScreen]=useState(SCREENS.PROFILE)
  const [profile,setProfile]=useState(null)
  const [activeEp,setActiveEp]=useState(null)
  const [vocabEpId,setVocabEpId]=useState(null)

  const handleSelectProfile=async(raw)=>{
    const otherId=raw.id==="parag"?"neha":"parag"
    const other=await getProfile(otherId)
    setProfile({...raw,_otherName:other.name,_otherActiveEp:other.active_ep})
    setScreen(SCREENS.MAP)
  }

  const handleEpisodeDone=async()=>{
    const newCompleted=[...new Set([...profile.completedEps,activeEp.id])]
    const newActiveEp=Math.min(activeEp.id+1,36)
    const updated={...profile,completedEps:newCompleted,activeEp:newActiveEp}
    setProfile(updated)
    await saveProgress(updated)
    setVocabEpId(activeEp.id)
    setScreen(SCREENS.VOCAB)
  }

  const handleVocabDone=async(xpGained)=>{
    const updated={...profile,xp:profile.xp+xpGained}
    setProfile(updated)
    await saveProgress(updated)
    setScreen(SCREENS.MAP)
  }

  const handleReviewDone=async(xpGained)=>{
    const updated={...profile,xp:profile.xp+xpGained}
    setProfile(updated)
    await saveProgress(updated)
    setScreen(SCREENS.MAP)
  }

  const goMap=()=>setScreen(SCREENS.MAP)

  return (
    <div style={{maxWidth:420,margin:"0 auto",padding:"0 20px 48px",fontFamily:"system-ui,sans-serif"}}>
      {screen===SCREENS.PROFILE&&<ProfileSelect onSelect={handleSelectProfile}/>}
      {profile&&screen!==SCREENS.PROFILE&&(
        <>
          <TopBar profile={profile} onSwitch={()=>{setProfile(null);setScreen(SCREENS.PROFILE)}}/>
          {screen===SCREENS.MAP&&<EpisodeMap profile={profile} onEpisode={ep=>{setActiveEp(ep);setScreen(SCREENS.EPISODE)}} onPhrase={()=>setScreen(SCREENS.PHRASE)} onTutor={()=>setScreen(SCREENS.TUTOR)} onGrammar={()=>setScreen(SCREENS.GRAMMAR)} onWordBank={()=>setScreen(SCREENS.WORDBANK)} onReview={()=>setScreen(SCREENS.REVIEW)} onMistakes={()=>setScreen(SCREENS.MISTAKES)}/>}
          {screen===SCREENS.EPISODE&&activeEp&&<EpisodeScreen episode={activeEp} onBack={goMap} onComplete={handleEpisodeDone}/>}
          {screen===SCREENS.VOCAB&&<VocabGame episodeId={vocabEpId} profileId={profile.id} onDone={handleVocabDone} onBack={goMap}/>}
          {screen===SCREENS.GRAMMAR&&<GrammarScreen onBack={goMap}/>}
          {screen===SCREENS.PHRASE&&<PhraseScreen onBack={goMap}/>}
          {screen===SCREENS.TUTOR&&<TutorScreen onBack={goMap}/>}
          {screen===SCREENS.WORDBANK&&<WordBankScreen profileId={profile.id} onBack={goMap}/>}
          {screen===SCREENS.REVIEW&&<ReviewScreen profileId={profile.id} onDone={handleReviewDone} onBack={goMap}/>}
          {screen===SCREENS.MISTAKES&&<MistakesScreen profileId={profile.id} onBack={goMap}/>}
        </>
      )}
    </div>
  )
}
