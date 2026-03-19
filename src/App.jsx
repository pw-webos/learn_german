import { useState, useEffect } from "react";

const C = {
  purple: "#7F77DD", purpleLight: "#EEEDFE", purpleDark: "#3C3489",
  teal: "#1D9E75", tealLight: "#E1F5EE",
  coral: "#D85A30", coralLight: "#FAECE7",
  amber: "#BA7517", amberLight: "#FAEEDA",
  pink: "#D4537E", pinkLight: "#FBEAF0",
  gray: "#888780", grayLight: "#F1EFE8",
  green: "#3B6D11", greenLight: "#EAF3DE",
  red: "#A32D2D", redLight: "#FCEBEB",
};

const PROFILES = {
  parag: { id:"parag", name:"Parag", avatar:"P", color:C.purple, colorLight:C.purpleLight, xp:340, streak:7, completedEps:[1,2], activeEp:3 },
  neha:  { id:"neha",  name:"Neha",  avatar:"N", color:C.pink,   colorLight:C.pinkLight,   xp:180, streak:3, completedEps:[1],   activeEp:2 },
};

const SCREENS = { PROFILE:"profile", MAP:"map", EPISODE:"episode", VOCAB_GAME:"vocab_game", GRAMMAR:"grammar", PHRASE:"phrase", AI_TUTOR:"ai_tutor" };

// ── Content ───────────────────────────────────────────────────

const episodes = [
  { id:1, title:"Der erste Tag",   subtitle:"Arrival at München Flughafen", level:"A1" },
  { id:2, title:"Die U-Bahn",      subtitle:"Finding the right train",      level:"A1" },
  { id:3, title:"Das Zimmer",      subtitle:"A note on the door...",        level:"A1" },
  { id:4, title:"Der Supermarkt",  subtitle:"First grocery run",            level:"A1" },
  { id:5, title:"Die Nachbarin",   subtitle:"Meeting next door",            level:"A1" },
  { id:6, title:"Das Amt",         subtitle:"Bureaucracy begins",           level:"A2" },
  { id:7, title:"Der Arzttermin",  subtitle:"Something's not right",        level:"A2" },
  { id:8, title:"Die Arbeit",      subtitle:"First day at work",            level:"A2" },
];

const ep3panels = [
  { id:1, text:"Hunar finally reaches the apartment building. Tired, jet-lagged, but smiling.", german:null, action:null },
  { id:2, text:"The landlord is nowhere to be seen. There's a handwritten note on the door.", german:"Liebe Hunar,\nIch bin leider nicht da.\nDer Schlüssel liegt unter der Fußmatte.\nBis morgen!\n— Frau Weber", action:null },
  { id:3, text:"Hunar stares at the note. Tap each word to decode it.", german:null, action:"tap",
    tapWords:[
      { word:"leider",    meaning:"unfortunately" },
      { word:"Schlüssel", meaning:"key" },
      { word:"unter",     meaning:"under / beneath" },
      { word:"Fußmatte",  meaning:"doormat" },
      { word:"morgen",    meaning:"tomorrow" },
    ]
  },
  { id:4, text:"Hunar finds the key. The door opens. But something inside is... unexpected.", german:null, action:"cliffhanger" },
];

const ep4panels = [
  { id:1, text:"Hunar needs groceries. The nearest Supermarkt is a 5-minute walk. Simple enough... or so it seems.", german:null, action:null },
  { id:2, text:"Inside, everything is labelled in German. Hunar picks up a carton and tries to read it.", german:"Vollmilch\n3,5 % Fett\n1 Liter\nMindesthaltbarkeitsdatum: 15.04.2026", action:null },
  { id:3, text:"At the checkout, the cashier says something fast. Very fast.", german:"Das macht zusammen vier Euro fünfzig, bitte.", action:"translate", choices:["That makes four fifty altogether, please.","You have four items, please.","Please go to aisle four."], correct:0 },
  { id:4, text:"Hunar pays. The cashier smiles and says one more thing...", german:"Haben Sie eine Kundenkarte?", action:"translate", choices:["Have a good day!","Do you have a loyalty card?","Do you need a bag?"], correct:1 },
  { id:5, text:"Hunar walks back with groceries. First supermarket run: complete. +50 XP", german:null, action:"complete" },
];

const vocabSets = {
  3: [
    { de:"der Schlüssel", en:"the key",       hint:"Opens doors" },
    { de:"die Fußmatte",  en:"the doormat",   hint:"You wipe your feet on it" },
    { de:"leider",        en:"unfortunately", hint:"Said when things go wrong" },
    { de:"morgen",        en:"tomorrow",      hint:"The day after today" },
    { de:"unter",         en:"under / below", hint:"Something is beneath another" },
    { de:"die Wohnung",   en:"the apartment", hint:"Where Hunar will live" },
  ],
  4: [
    { de:"die Milch",         en:"the milk",          hint:"White drink from cows" },
    { de:"der Supermarkt",    en:"the supermarket",   hint:"Where you buy food" },
    { de:"die Kasse",         en:"the checkout",      hint:"Where you pay" },
    { de:"zusammen",          en:"altogether / total", hint:"Everything combined" },
    { de:"die Kundenkarte",   en:"the loyalty card",  hint:"Gives you discounts" },
    { de:"bezahlen",          en:"to pay",            hint:"Handing over money" },
  ],
};

const grammarCards = [
  {
    id:1, level:"A1", topic:"Articles — der, die, das",
    icon:"📌",
    en:"Every German noun has a gender — masculine (der), feminine (die), or neuter (das). There's no logical rule for most words. You must learn the article WITH the word. Always say 'der Schlüssel', never just 'Schlüssel'.",
    hi:"German mein har noun ka ek gender hota hai — masculine (der), feminine (die), ya neuter (das). Zyada tar words ke liye koi rule nahi hai. Word ke saath article yaad karna zaroori hai. Hamesha 'der Schlüssel' kaho, sirf 'Schlüssel' nahi.",
    examples:[ { de:"der Mann", en:"the man (masculine)" }, { de:"die Frau", en:"the woman (feminine)" }, { de:"das Kind", en:"the child (neuter)" } ],
    tip:"Trick: Learn 3 words a day — always with their article. Never without.",
  },
  {
    id:2, level:"A1", topic:"Verb position — always second",
    icon:"📐",
    en:"In a German sentence, the verb ALWAYS comes in second position. Not second word — second idea. This is the most important rule in German grammar and it never breaks.",
    hi:"German sentence mein verb HAMESHA doosri position par aata hai. Doosra word nahi — doosri idea. Yeh German grammar ka sabse important rule hai aur yeh kabhi nahi tuta.",
    examples:[ { de:"Ich trinke Kaffee.", en:"I drink coffee. (verb 2nd)" }, { de:"Heute trinke ich Kaffee.", en:"Today I drink coffee. (still 2nd!)" } ],
    tip:"Test: cover the verb. Can you find it? It's always the 2nd chunk.",
  },
  {
    id:3, level:"A1", topic:"Du vs Sie — informal vs formal",
    icon:"🤝",
    en:"German has two ways to say 'you'. Du is informal — for friends, family, children. Sie (always capitalised) is formal — for strangers, officials, older people. In Germany, using du with a stranger can feel rude.",
    hi:"German mein 'you' kehne ke do tarike hain. Du informal hai — dosto, family, bachon ke liye. Sie (hamesha capital S) formal hai — anjaan logon, officials, bade logon ke liye. Germany mein kisi anjaan ko du kehna rude lag sakta hai.",
    examples:[ { de:"Wie heißt du?", en:"What's your name? (to a friend)" }, { de:"Wie heißen Sie?", en:"What's your name? (to a stranger)" } ],
    tip:"In Munich, always start with Sie. Wait for them to offer du first.",
  },
  {
    id:4, level:"A2", topic:"Perfekt — the past tense you'll actually use",
    icon:"⏪",
    en:"Germans rarely use the written past tense in conversation. Instead they use Perfekt: haben/sein + past participle at the end. 'Ich habe gegessen' means 'I ate / I have eaten'. The participle always goes to the very end.",
    hi:"Germans conversation mein written past tense kam use karte hain. Iske bajaye Perfekt use hota hai: haben/sein + past participle end mein. 'Ich habe gegessen' matlab 'Maine khaya'. Participle hamesha sentence ke bilkul end mein jaata hai.",
    examples:[ { de:"Ich habe Kaffee getrunken.", en:"I drank coffee." }, { de:"Ich bin nach Hause gegangen.", en:"I went home." } ],
    tip:"Motion verbs (gehen, kommen, fahren) use sein. Everything else: haben.",
  },
];

const phrases = [
  { category:"Transport",   de:"Fährt dieser Bus zum Hauptbahnhof?",                    en:"Does this bus go to the main station?",          hi:"Kya yeh bus hauptbahnhof jaati hai?" },
  { category:"Shopping",    de:"Haben Sie das in einer anderen Größe?",                 en:"Do you have this in another size?",               hi:"Kya aapke paas yeh doosre size mein hai?" },
  { category:"Social",      de:"Ich lerne noch Deutsch, bitte sprechen Sie langsamer.", en:"I'm still learning German, please speak slower.", hi:"Main abhi German seekh raha/rahi hoon, please dheere boliye." },
  { category:"Restaurant",  de:"Die Rechnung, bitte.",                                  en:"The bill, please.",                               hi:"Bill laiye, please." },
  { category:"Emergency",   de:"Ich brauche einen Arzt.",                               en:"I need a doctor.",                                hi:"Mujhe ek doctor chahiye." },
  { category:"Bureaucracy", de:"Können Sie das bitte wiederholen?",                     en:"Can you please repeat that?",                     hi:"Kya aap woh phir se keh sakte hain?" },
];

// ── API ───────────────────────────────────────────────────────
const isRateLimit = e => e?.status === 429 || e?.status === 529 || e?.message?.toLowerCase().includes("rate") || e?.message?.toLowerCase().includes("limit");

async function callClaude(sys, user) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method:"POST", headers:{"Content-Type":"application/json"},
    body: JSON.stringify({ model:"claude-sonnet-4-20250514", max_tokens:1000, system:sys, messages:[{role:"user",content:user}] }),
  });
  if (!res.ok) { const d = await res.json().catch(()=>({})); const e = new Error(d?.error?.message||"error"); e.status=res.status; throw e; }
  const d = await res.json();
  return d.content?.[0]?.text || "";
}

function LimitMessage({ onBack }) {
  return (
    <div style={{textAlign:"center",padding:"2rem 1rem"}}>
      <div style={{fontSize:48,marginBottom:16}}>☕</div>
      <h3 style={{fontSize:17,fontWeight:500,margin:"0 0 10px"}}>Hunar needs a coffee break!</h3>
      <p style={{fontSize:14,color:"var(--color-text-secondary)",lineHeight:1.7,margin:"0 0 12px"}}>The AI tutor has hit its daily limit. Your story, phrases and vocabulary still work perfectly. Come back tomorrow!</p>
      <p style={{fontSize:13,color:C.teal,margin:"0 0 24px"}}>Your progress is saved. Nothing is lost.</p>
      {onBack && <button onClick={onBack} style={{padding:"10px 24px",background:C.amberLight,color:C.amber,border:`0.5px solid ${C.amber}`,borderRadius:"var(--border-radius-md)",fontSize:14,fontWeight:500,cursor:"pointer"}}>Back to map</button>}
    </div>
  );
}

// ── Vocab Game ────────────────────────────────────────────────
function VocabGame({ episodeId, onDone }) {
  const words = vocabSets[episodeId] || [];
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [result, setResult] = useState(null); // 'know' | 'review'
  const [scores, setScores] = useState({ know:0, review:0 });
  const [done, setDone] = useState(false);

  const current = words[idx];

  const answer = (knew) => {
    setResult(knew ? "know" : "review");
    setScores(s => ({ ...s, [knew?"know":"review"]: s[knew?"know":"review"]+1 }));
    setTimeout(() => {
      if (idx < words.length - 1) { setIdx(i=>i+1); setFlipped(false); setResult(null); }
      else setDone(true);
    }, 800);
  };

  if (done) return (
    <div style={{textAlign:"center",padding:"2rem 0"}}>
      <div style={{fontSize:48,marginBottom:16}}>🎉</div>
      <h3 style={{fontSize:18,fontWeight:500,margin:"0 0 8px"}}>Vocab round complete!</h3>
      <div style={{display:"flex",gap:12,justifyContent:"center",margin:"20px 0"}}>
        <div style={{padding:"12px 20px",background:C.greenLight,borderRadius:"var(--border-radius-md)",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:500,color:C.green}}>{scores.know}</div>
          <div style={{fontSize:12,color:C.green}}>I knew it</div>
        </div>
        <div style={{padding:"12px 20px",background:C.amberLight,borderRadius:"var(--border-radius-md)",textAlign:"center"}}>
          <div style={{fontSize:22,fontWeight:500,color:C.amber}}>{scores.review}</div>
          <div style={{fontSize:12,color:C.amber}}>needs review</div>
        </div>
      </div>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 24px"}}>Words to review go into your Mistake Journal automatically.</p>
      <button onClick={onDone} style={{padding:"12px 32px",background:C.purple,color:"#fff",border:"none",borderRadius:"var(--border-radius-lg)",fontSize:15,fontWeight:500,cursor:"pointer"}}>Back to map  +{scores.know * 10} XP</button>
    </div>
  );

  return (
    <div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:20}}>
        <span style={{fontSize:13,color:"var(--color-text-secondary)"}}>{idx+1} / {words.length}</span>
        <div style={{display:"flex",gap:4}}>
          {words.map((_,i)=><div key={i} style={{width:8,height:8,borderRadius:4,background:i<idx?C.purple:i===idx?C.coral:"var(--color-background-secondary)"}}/>)}
        </div>
        <span style={{fontSize:13,color:C.green}}>{scores.know} known</span>
      </div>

      <div onClick={()=>setFlipped(f=>!f)} style={{minHeight:180,background:result==="know"?C.greenLight:result==="review"?C.amberLight:flipped?C.purpleLight:"var(--color-background-secondary)",border:`1.5px solid ${result==="know"?C.teal:result==="review"?C.amber:flipped?C.purple:"var(--color-border-secondary)"}`,borderRadius:"var(--border-radius-lg)",padding:"24px 20px",cursor:"pointer",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",transition:"all 0.2s",marginBottom:20}}>
        {!flipped ? (
          <>
            <div style={{fontSize:24,fontWeight:500,color:"var(--color-text-primary)",marginBottom:8}}>{current.de}</div>
            <div style={{fontSize:13,color:"var(--color-text-tertiary)"}}>tap to reveal</div>
          </>
        ) : (
          <>
            <div style={{fontSize:14,color:C.purpleDark,marginBottom:8}}>{current.de}</div>
            <div style={{fontSize:22,fontWeight:500,color:C.purpleDark,marginBottom:12}}>{current.en}</div>
            <div style={{fontSize:12,color:C.purple,background:"#fff",padding:"4px 12px",borderRadius:99}}>{current.hint}</div>
          </>
        )}
      </div>

      {flipped && !result && (
        <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:12}}>
          <button onClick={()=>answer(false)} style={{padding:"14px 0",background:C.amberLight,color:C.amber,border:`0.5px solid ${C.amber}`,borderRadius:"var(--border-radius-md)",fontSize:14,fontWeight:500,cursor:"pointer"}}>Still learning</button>
          <button onClick={()=>answer(true)} style={{padding:"14px 0",background:C.greenLight,color:C.green,border:`0.5px solid ${C.green}`,borderRadius:"var(--border-radius-md)",fontSize:14,fontWeight:500,cursor:"pointer"}}>I knew it!</button>
        </div>
      )}
      {!flipped && <div style={{textAlign:"center",fontSize:13,color:"var(--color-text-tertiary)"}}>Tap the card to see the meaning</div>}
    </div>
  );
}

// ── Grammar Cards ─────────────────────────────────────────────
function GrammarScreen({ onBack }) {
  const [active, setActive] = useState(null);
  const [lang, setLang] = useState("en");

  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Grammar Corner</h2>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 16px"}}>Concepts explained simply — no textbook torture.</p>
      <div style={{display:"flex",gap:8,marginBottom:20}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setLang(v)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:lang===v?C.purpleLight:"var(--color-background-secondary)",color:lang===v?C.purpleDark:"var(--color-text-secondary)",border:"none",cursor:"pointer",fontWeight:lang===v?500:400}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:10}}>
        {grammarCards.map(card=>(
          <div key={card.id} style={{border:active===card.id?`1.5px solid ${C.purple}`:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-lg)",overflow:"hidden"}}>
            <div onClick={()=>setActive(active===card.id?null:card.id)} style={{padding:"14px 16px",cursor:"pointer",background:active===card.id?C.purpleLight:"var(--color-background-primary)",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:card.level==="A1"?C.tealLight:C.amberLight,color:card.level==="A1"?C.teal:C.amber,fontWeight:500,marginRight:8}}>{card.level}</span>
                <span style={{fontSize:14,fontWeight:500,color:active===card.id?C.purpleDark:"var(--color-text-primary)"}}>{card.icon} {card.topic}</span>
              </div>
              <span style={{fontSize:16,color:"var(--color-text-tertiary)"}}>{active===card.id?"↑":"↓"}</span>
            </div>
            {active===card.id && (
              <div style={{padding:"0 16px 16px",background:C.purpleLight}}>
                <p style={{fontSize:14,color:C.purpleDark,lineHeight:1.8,margin:"0 0 16px"}}>{lang==="en"?card.en:card.hi}</p>
                <div style={{marginBottom:14}}>
                  <div style={{fontSize:11,color:C.purple,fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Examples</div>
                  {card.examples.map((ex,i)=>(
                    <div key={i} style={{display:"flex",gap:12,marginBottom:8,alignItems:"baseline"}}>
                      <div style={{fontSize:14,fontWeight:500,color:C.purpleDark,minWidth:180}}>{ex.de}</div>
                      <div style={{fontSize:13,color:C.purple}}>{ex.en}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#fff",borderRadius:"var(--border-radius-md)",padding:"10px 14px",border:`0.5px solid ${C.purple}`}}>
                  <span style={{fontSize:12,fontWeight:500,color:C.purpleDark}}>Teacher tip: </span>
                  <span style={{fontSize:12,color:C.purpleDark}}>{card.tip}</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Episode screen ────────────────────────────────────────────
function EpisodeScreen({ episode, onDone, onVocab }) {
  const panels = episode.id === 4 ? ep4panels : ep3panels;
  const [panel, setPanel] = useState(0);
  const [tapped, setTapped] = useState({});
  const [chosen, setChosen] = useState(null);
  const p = panels[panel];
  const allTapped = p.tapWords ? p.tapWords.every(w=>tapped[w.word]) : true;
  const choiceCorrect = chosen !== null && p.correct !== undefined ? chosen === p.correct : true;
  const canContinue = p.action==="tap" ? allTapped : p.action==="translate" ? (chosen!==null) : true;

  const next = () => {
    if (p.action==="complete") { onVocab(episode.id); return; }
    if (panel < panels.length-1) { setPanel(v=>v+1); setTapped({}); setChosen(null); }
    else onDone();
  };

  return (
    <div style={{minHeight:440,display:"flex",flexDirection:"column"}}>
      <div style={{display:"flex",gap:4,marginBottom:20}}>
        {panels.map((_,i)=><div key={i} style={{flex:1,height:3,borderRadius:99,background:i<=panel?C.coral:"var(--color-background-secondary)",transition:"background 0.3s"}}/>)}
      </div>
      <div style={{flex:1}}>
        <div style={{fontSize:11,color:"var(--color-text-tertiary)",marginBottom:12,textTransform:"uppercase",letterSpacing:1}}>Episode {episode.id} · {episode.title}</div>
        <p style={{fontSize:15,color:"var(--color-text-secondary)",lineHeight:1.7,marginBottom:20}}>{p.text}</p>

        {p.german && (
          <div style={{background:C.purpleLight,border:`0.5px solid ${C.purple}`,borderRadius:"var(--border-radius-md)",padding:"14px 16px",marginBottom:20,fontFamily:"var(--font-serif)",fontSize:15,lineHeight:1.9,whiteSpace:"pre-line",color:C.purpleDark}}>{p.german}</div>
        )}

        {p.action==="tap" && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:10}}>Tap each word to decode it:</div>
            <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
              {p.tapWords.map(w=>(
                <div key={w.word} onClick={()=>setTapped(t=>({...t,[w.word]:true}))} style={{padding:"8px 14px",borderRadius:"var(--border-radius-md)",cursor:"pointer",background:tapped[w.word]?C.tealLight:"var(--color-background-secondary)",border:tapped[w.word]?`0.5px solid ${C.teal}`:"0.5px solid var(--color-border-secondary)",transition:"all 0.2s"}}>
                  <div style={{fontSize:14,fontWeight:500,color:tapped[w.word]?C.teal:"var(--color-text-primary)"}}>{w.word}</div>
                  {tapped[w.word]&&<div style={{fontSize:12,color:C.teal,marginTop:2}}>{w.meaning}</div>}
                </div>
              ))}
            </div>
            {allTapped&&<div style={{marginTop:12,fontSize:13,color:C.teal}}>All decoded! You can continue.</div>}
          </div>
        )}

        {p.action==="translate" && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:13,color:"var(--color-text-secondary)",marginBottom:10}}>What did the cashier say?</div>
            <div style={{display:"flex",flexDirection:"column",gap:8}}>
              {p.choices.map((ch,i)=>{
                const isChosen = chosen===i;
                const correct = p.correct===i;
                const bg = isChosen ? (correct?C.greenLight:C.redLight) : "var(--color-background-secondary)";
                const border = isChosen ? (correct?C.teal:C.red) : "var(--color-border-secondary)";
                const color = isChosen ? (correct?C.green:C.red) : "var(--color-text-primary)";
                return (
                  <div key={i} onClick={()=>chosen===null&&setChosen(i)} style={{padding:"12px 14px",borderRadius:"var(--border-radius-md)",cursor:chosen===null?"pointer":"default",background:bg,border:`0.5px solid ${border}`,fontSize:14,color,transition:"all 0.2s"}}>
                    {ch}
                    {isChosen&&<span style={{marginLeft:8}}>{correct?"✓":"✗"}</span>}
                  </div>
                );
              })}
            </div>
            {chosen!==null&&!choiceCorrect&&<div style={{marginTop:10,fontSize:13,color:C.amber}}>Not quite — the correct answer is highlighted.</div>}
          </div>
        )}

        {p.action==="cliffhanger" && (
          <div style={{background:C.coralLight,border:`0.5px solid ${C.coral}`,borderRadius:"var(--border-radius-md)",padding:"14px 16px",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:500,color:C.coral,marginBottom:4}}>To be continued...</div>
            <div style={{fontSize:13,color:"var(--color-text-secondary)"}}>Complete the vocabulary lesson to unlock what Hunar finds inside.</div>
          </div>
        )}

        {p.action==="complete" && (
          <div style={{background:C.greenLight,border:`0.5px solid ${C.green}`,borderRadius:"var(--border-radius-md)",padding:"14px 16px",marginBottom:20}}>
            <div style={{fontSize:13,fontWeight:500,color:C.green,marginBottom:4}}>Episode complete!</div>
            <div style={{fontSize:13,color:C.green}}>Now test yourself on the vocabulary from this episode.</div>
          </div>
        )}
      </div>

      <button onClick={next} disabled={!canContinue} style={{width:"100%",padding:"12px 0",background:!canContinue?"var(--color-background-secondary)":C.coral,color:!canContinue?"var(--color-text-tertiary)":"#fff",border:"none",borderRadius:"var(--border-radius-lg)",fontSize:15,fontWeight:500,cursor:!canContinue?"default":"pointer",transition:"all 0.2s"}}>
        {p.action==="complete" ? "Practice vocabulary" : panel<panels.length-1 ? "Continue" : "Back to map"}
      </button>
    </div>
  );
}

// ── Phrase screen ─────────────────────────────────────────────
function PhraseScreen() {
  const [active,setActive]=useState(null);
  const [showHi,setShowHi]=useState(false);
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Sofort Sprechen</h2>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 16px"}}>Survival phrases — use them now, understand them later.</p>
      <div style={{display:"flex",gap:8,marginBottom:16}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setShowHi(v==="hi")} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:showHi===(v==="hi")?(v==="en"?C.purpleLight:C.amberLight):"var(--color-background-secondary)",color:showHi===(v==="hi")?(v==="en"?C.purpleDark:C.amber):"var(--color-text-secondary)",border:"none",cursor:"pointer",fontWeight:showHi===(v==="hi")?500:400}}>{l}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {phrases.map((ph,i)=>(
          <div key={i} onClick={()=>setActive(active===i?null:i)} style={{border:active===i?`1.5px solid ${C.teal}`:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",cursor:"pointer",background:active===i?C.tealLight:"var(--color-background-primary)"}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:14,fontWeight:500,flex:1}}>{ph.de}</div>
              <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:C.grayLight,color:C.gray,marginLeft:8,flexShrink:0}}>{ph.category}</span>
            </div>
            {active===i&&<div style={{marginTop:10,paddingTop:10,borderTop:"0.5px solid var(--color-border-tertiary)",fontSize:13,color:C.teal}}>{showHi?ph.hi:ph.en}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ── AI Tutor ──────────────────────────────────────────────────
function AiTutorScreen({ onBack }) {
  const [q,setQ]=useState(""); const [lang,setLang]=useState("en");
  const [ans,setAns]=useState(null); const [loading,setLoading]=useState(false);
  const [limitHit,setLimitHit]=useState(false);
  const ask = async () => {
    if (!q.trim()) return;
    setLoading(true); setAns(null); setLimitHit(false);
    try {
      const sys=`You are a warm German teacher for an adult A1/A2 learner. Explain in ${lang==="hi"?"Hindi (Hinglish ok)":"simple English"}. Max 120 words. Use examples. No bullet points.`;
      setAns(await callClaude(sys,q));
    } catch(e) { isRateLimit(e)?setLimitHit(true):setAns("Something went wrong. Please try again."); }
    finally { setLoading(false); }
  };
  if (limitHit) return <LimitMessage onBack={onBack}/>;
  return (
    <div>
      <h2 style={{fontSize:18,fontWeight:500,margin:"0 0 4px"}}>Ask the Tutor</h2>
      <p style={{fontSize:13,color:"var(--color-text-secondary)",margin:"0 0 16px"}}>Any question about German — grammar, words, culture.</p>
      <div style={{display:"flex",gap:8,marginBottom:14}}>
        {[["en","English"],["hi","हिंदी"]].map(([v,l])=>(
          <button key={v} onClick={()=>setLang(v)} style={{fontSize:12,padding:"4px 14px",borderRadius:99,background:lang===v?C.purpleLight:"var(--color-background-secondary)",color:lang===v?C.purpleDark:"var(--color-text-secondary)",border:"none",cursor:"pointer",fontWeight:lang===v?500:400}}>{l}</button>
        ))}
      </div>
      <textarea value={q} onChange={e=>setQ(e.target.value)} placeholder="e.g. When do I use 'der' vs 'die' vs 'das'?" rows={3} style={{width:"100%",boxSizing:"border-box",resize:"none",fontSize:14,padding:12,borderRadius:"var(--border-radius-md)",border:"0.5px solid var(--color-border-secondary)",background:"var(--color-background-primary)",color:"var(--color-text-primary)",fontFamily:"var(--font-sans)",marginBottom:10}}/>
      <button onClick={ask} disabled={loading||!q.trim()} style={{width:"100%",padding:"12px 0",background:q.trim()&&!loading?C.purple:"var(--color-background-secondary)",color:q.trim()&&!loading?"#fff":"var(--color-text-tertiary)",border:"none",borderRadius:"var(--border-radius-lg)",fontSize:15,fontWeight:500,cursor:q.trim()&&!loading?"pointer":"default",marginBottom:20}}>
        {loading?"Thinking...":"Ask"}
      </button>
      {ans&&<div style={{background:C.purpleLight,border:`0.5px solid ${C.purple}`,borderRadius:"var(--border-radius-md)",padding:"14px 16px",marginBottom:20}}><div style={{fontSize:11,color:C.purpleDark,fontWeight:500,marginBottom:8,textTransform:"uppercase",letterSpacing:1}}>Tutor</div><p style={{fontSize:14,color:C.purpleDark,lineHeight:1.8,margin:0}}>{ans}</p></div>}
      <div style={{display:"flex",flexWrap:"wrap",gap:8}}>
        {["Why is it 'dem' not 'der'?","What is Perfekt tense?","Dativ vs Akkusativ?","What does Feierabend mean?"].map(s=>(
          <button key={s} onClick={()=>setQ(s)} style={{fontSize:12,padding:"6px 12px",borderRadius:99,background:"var(--color-background-secondary)",color:"var(--color-text-secondary)",border:"0.5px solid var(--color-border-secondary)",cursor:"pointer"}}>{s}</button>
        ))}
      </div>
    </div>
  );
}

// ── XPBar ─────────────────────────────────────────────────────
function XPBar({ xp, color }) {
  const pct = Math.round((xp/500)*100);
  return (
    <div style={{display:"flex",alignItems:"center",gap:8}}>
      <span style={{fontSize:12,color:"var(--color-text-secondary)",minWidth:36}}>{xp} XP</span>
      <div style={{flex:1,height:6,background:"var(--color-background-secondary)",borderRadius:99,overflow:"hidden"}}>
        <div style={{width:`${pct}%`,height:"100%",background:color,borderRadius:99,transition:"width 0.5s"}}/>
      </div>
      <span style={{fontSize:12,color:"var(--color-text-secondary)",minWidth:36,textAlign:"right"}}>500</span>
    </div>
  );
}

// ── Profile select ────────────────────────────────────────────
function ProfileSelect({ onSelect }) {
  const p=PROFILES.parag; const n=PROFILES.neha;
  const ahead=p.completedEps.length>n.completedEps.length?"parag":n.completedEps.length>p.completedEps.length?"neha":null;
  return (
    <div style={{padding:"2rem 0"}}>
      <div style={{marginBottom:28}}>
        <div style={{fontSize:13,color:"var(--color-text-tertiary)",marginBottom:4}}>Deutsch mit Hunar</div>
        <h2 style={{fontSize:22,fontWeight:500,margin:0}}>Who's learning today?</h2>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:24}}>
        {[PROFILES.parag,PROFILES.neha].map(pr=>(
          <div key={pr.id} onClick={()=>onSelect(pr.id)} style={{border:"0.5px solid var(--color-border-secondary)",borderRadius:"var(--border-radius-lg)",padding:"16px 18px",cursor:"pointer",background:"var(--color-background-primary)",position:"relative"}}>
            {ahead===pr.id&&<div style={{position:"absolute",top:10,right:12,fontSize:11,padding:"2px 10px",borderRadius:99,background:pr.colorLight,color:pr.color,fontWeight:500}}>ahead</div>}
            <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:14}}>
              <div style={{width:44,height:44,borderRadius:22,background:pr.colorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,fontWeight:500,color:pr.color,flexShrink:0}}>{pr.avatar}</div>
              <div>
                <div style={{fontSize:16,fontWeight:500}}>{pr.name}</div>
                <div style={{fontSize:12,color:"var(--color-text-secondary)",marginTop:2}}>{pr.completedEps.length} episodes · {pr.streak} day streak 🔥</div>
              </div>
            </div>
            <XPBar xp={pr.xp} color={pr.color}/>
          </div>
        ))}
      </div>
      <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"12px 14px",display:"flex",alignItems:"center",gap:12}}>
        <div style={{width:36,height:36,borderRadius:18,background:C.amberLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0}}>🎭</div>
        <div>
          <div style={{fontSize:13,fontWeight:500}}>Playing as Hunar</div>
          <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>Both profiles share the same story character</div>
        </div>
      </div>
    </div>
  );
}

// ── Top bar ───────────────────────────────────────────────────
function TopBar({ profile, onSwitch }) {
  return (
    <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 0 16px"}}>
      <button onClick={onSwitch} style={{display:"flex",alignItems:"center",gap:8,background:"none",border:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",padding:"6px 10px",cursor:"pointer"}}>
        <div style={{width:22,height:22,borderRadius:11,background:profile.colorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:500,color:profile.color}}>{profile.avatar}</div>
        <span style={{fontSize:13,fontWeight:500}}>{profile.name}</span>
      </button>
      <div style={{display:"flex",gap:12}}>
        <span style={{fontSize:13,color:C.coral,fontWeight:500}}>🔥 {profile.streak}</span>
        <span style={{fontSize:13,color:profile.color,fontWeight:500}}>{profile.xp} XP</span>
      </div>
    </div>
  );
}

// ── Episode map ───────────────────────────────────────────────
function EpisodeMap({ profile, onEpisode, onPhrase, onTutor, onGrammar }) {
  const other=profile.id==="parag"?PROFILES.neha:PROFILES.parag;
  return (
    <div>
      <div style={{marginBottom:16}}><XPBar xp={profile.xp} color={profile.color}/></div>
      <div style={{background:"var(--color-background-secondary)",borderRadius:"var(--border-radius-md)",padding:"10px 14px",marginBottom:16,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div style={{fontSize:13,color:"var(--color-text-secondary)"}}><span style={{fontWeight:500,color:"var(--color-text-primary)"}}>{other.name}</span> is on ep. {other.activeEp}</div>
        <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,fontWeight:500,background:profile.activeEp>other.activeEp?profile.colorLight:profile.activeEp<other.activeEp?C.amberLight:C.tealLight,color:profile.activeEp>other.activeEp?profile.color:profile.activeEp<other.activeEp?C.amber:C.teal}}>
          {profile.activeEp>other.activeEp?"you're ahead":profile.activeEp<other.activeEp?"catch up!":"neck & neck"}
        </span>
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:20}}>
        {[
          {label:"Sofort Sprechen",bg:C.tealLight,  color:C.teal,     border:C.teal,     fn:onPhrase},
          {label:"Grammar Corner", bg:C.purpleLight, color:C.purpleDark,border:C.purple,  fn:onGrammar},
          {label:"Ask Tutor ✨",   bg:C.coralLight,  color:C.coral,    border:C.coral,    fn:onTutor},
          {label:"Mistake Journal",bg:C.amberLight,  color:C.amber,    border:C.amber,    fn:null},
        ].map(b=>(
          <button key={b.label} onClick={b.fn} disabled={!b.fn} style={{padding:"10px 0",background:b.bg,color:b.color,border:`0.5px solid ${b.border}`,borderRadius:"var(--border-radius-md)",fontSize:13,fontWeight:500,cursor:b.fn?"pointer":"default",opacity:b.fn?1:0.45}}>{b.label}</button>
        ))}
      </div>
      <div style={{display:"flex",flexDirection:"column"}}>
        {episodes.map((ep,i)=>{
          const completed=profile.completedEps.includes(ep.id);
          const active=profile.activeEp===ep.id;
          const locked=!completed&&!active;
          const otherHere=other.activeEp===ep.id;
          const isA2Start=ep.level==="A2"&&episodes[i-1]?.level==="A1";
          return (
            <div key={ep.id}>
              {isA2Start&&(<div style={{display:"flex",alignItems:"center",gap:8,margin:"12px 0"}}><div style={{flex:1,height:0.5,background:"var(--color-border-tertiary)"}}/>
              <span style={{fontSize:11,color:"var(--color-text-tertiary)",padding:"2px 8px",border:"0.5px solid var(--color-border-tertiary)",borderRadius:99}}>A2 begins</span>
              <div style={{flex:1,height:0.5,background:"var(--color-border-tertiary)"}}/></div>)}
              <div style={{display:"flex",alignItems:"stretch"}}>
                <div style={{display:"flex",flexDirection:"column",alignItems:"center",width:32,flexShrink:0}}>
                  <div style={{width:28,height:28,borderRadius:14,background:completed?profile.color:active?C.coral:"var(--color-background-secondary)",border:active?`2px solid ${C.coral}`:"0.5px solid var(--color-border-secondary)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,color:completed||active?"#fff":"var(--color-text-tertiary)",fontWeight:500,flexShrink:0}}>
                    {completed?"✓":locked?"🔒":ep.id}
                  </div>
                  {i<episodes.length-1&&<div style={{flex:1,width:1,background:completed?profile.colorLight:"var(--color-border-tertiary)",minHeight:16}}/>}
                </div>
                <div onClick={()=>!locked&&onEpisode(ep)} style={{flex:1,marginLeft:12,marginBottom:8,padding:"10px 14px",background:active?C.coralLight:"var(--color-background-primary)",border:active?`1.5px solid ${C.coral}`:"0.5px solid var(--color-border-tertiary)",borderRadius:"var(--border-radius-md)",cursor:locked?"default":"pointer",opacity:locked?0.45:1}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div style={{flex:1}}>
                      <div style={{fontSize:14,fontWeight:500,color:active?C.coral:"var(--color-text-primary)",marginBottom:2}}>Ep. {ep.id} — {ep.title}</div>
                      <div style={{fontSize:12,color:"var(--color-text-secondary)"}}>{ep.subtitle}</div>
                      {otherHere&&<div style={{marginTop:6,fontSize:11,color:other.color,display:"flex",alignItems:"center",gap:4}}><div style={{width:14,height:14,borderRadius:7,background:other.colorLight,display:"flex",alignItems:"center",justifyContent:"center",fontSize:9,fontWeight:500,color:other.color}}>{other.avatar}</div>{other.name} is here too</div>}
                    </div>
                    <span style={{fontSize:11,padding:"2px 8px",borderRadius:99,background:ep.level==="A1"?C.purpleLight:C.tealLight,color:ep.level==="A1"?C.purpleDark:C.teal,fontWeight:500,marginLeft:8,flexShrink:0}}>{ep.level}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── App root ──────────────────────────────────────────────────
export default function App() {
  const [screen,setScreen]=useState(SCREENS.PROFILE);
  const [profileId,setProfileId]=useState(null);
  const [activeEp,setActiveEp]=useState(null);
  const [vocabEpId,setVocabEpId]=useState(null);
  const profile=profileId?PROFILES[profileId]:null;
  const goMap=()=>setScreen(SCREENS.MAP);
  const BackBtn=()=><button onClick={goMap} style={{background:"none",border:"none",cursor:"pointer",fontSize:20,color:"var(--color-text-secondary)",padding:"0 0 16px",display:"block"}}>←</button>;

  return (
    <div style={{maxWidth:420,margin:"0 auto",padding:"0 20px 48px",fontFamily:"var(--font-sans)"}}>
      {screen===SCREENS.PROFILE&&<ProfileSelect onSelect={id=>{setProfileId(id);setScreen(SCREENS.MAP);}}/>}
      {profile&&screen!==SCREENS.PROFILE&&(
        <>
          <TopBar profile={profile} onSwitch={()=>{setProfileId(null);setScreen(SCREENS.PROFILE);}}/>
          {screen===SCREENS.MAP&&<EpisodeMap profile={profile} onEpisode={ep=>{setActiveEp(ep);setScreen(SCREENS.EPISODE);}} onPhrase={()=>setScreen(SCREENS.PHRASE)} onTutor={()=>setScreen(SCREENS.AI_TUTOR)} onGrammar={()=>setScreen(SCREENS.GRAMMAR)}/>}
          {screen===SCREENS.EPISODE&&activeEp&&<EpisodeScreen episode={activeEp} onDone={goMap} onVocab={id=>{setVocabEpId(id);setScreen(SCREENS.VOCAB_GAME);}}/>}
          {screen===SCREENS.VOCAB_GAME&&<><BackBtn/><VocabGame episodeId={vocabEpId} onDone={goMap}/></>}
          {screen===SCREENS.GRAMMAR&&<><BackBtn/><GrammarScreen onBack={goMap}/></>}
          {screen===SCREENS.PHRASE&&<><BackBtn/><PhraseScreen/></>}
          {screen===SCREENS.AI_TUTOR&&<><BackBtn/><AiTutorScreen onBack={goMap}/></>}
        </>
      )}
    </div>
  );
}
