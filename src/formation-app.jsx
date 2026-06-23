import { useState, useEffect, useRef } from "react";
import { supabase } from "./supabase.js";

const C = {
  bg:"#0f1117",surface:"#1a1d27",panel:"#13151f",border:"#2a2d3e",
  accent:"#5865f2",green:"#23a55a",red:"#f23f43",yellow:"#f0b232",
  text:"#e3e5e8",muted:"#878c9b",dim:"#4e5468",
};

const EVENT_COLORS = ["#4285f4","#0f9d58","#f4b400","#db4437","#ab47bc","#00acc1","#ff7043","#8d6e63"];

const TRANSLATIONS = {
  fr:{
    loginSubtitle:"Connecte-toi à ta session",namePlaceholder:"Ton prénom / pseudo",
    passwordPlaceholder:"Mot de passe",loginBtn:"Se connecter",noAccount:"Pas encore de compte ?",
    createAccount:"Créer un compte",createTitle:"Créer un compte",confirmPassword:"Confirmer le mot de passe",
    createBtn:"Créer mon compte",backToLogin:"← Retour à la connexion",
    errNameEmpty:"Entre ton prénom ou pseudo.",errPassShort:"Mot de passe trop court (min. 4 caractères).",
    errPassMismatch:"Les mots de passe ne correspondent pas.",errNameTaken:"Ce nom est déjà utilisé.",
    errWrongCredentials:"Nom ou mot de passe incorrect.",errNetwork:"Problème de connexion. Réessaie.",
    loading:"Chargement…",
    sessionActive:"Session en cours",roleAdmin:"Formateur",roleStudent:"Participant",logout:"Se déconnecter",
    tabSchedule:"Horaires",tabChat:"Discussion",tabInOut:"In / Out",tabDocs:"Documents",
    calToday:"Aujourd'hui",calAdd:"+ Créer",calNoEvent:"Aucune séance ce jour.",
    calAddTitle:"Nouvelle séance",calEventTitle:"Titre",calEventDesc:"Description (optionnel)",
    calTimeStart:"Heure de début",calTimeEnd:"Heure de fin",calSave:"Enregistrer",calCancel:"Annuler",
    calDelete:"Supprimer",calBy:"Ajouté par",calColor:"Couleur",
    calDays:["Dim","Lun","Mar","Mer","Jeu","Ven","Sam"],
    calMonths:["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"],
    chatTitle:"💬 Discussion",chatSubtitle:"Canal général de la formation",
    chatEmpty:"Soyez les premiers à écrire ici !",chatPlaceholder:"Écrire un message…",
    chatHint:"Entrée pour envoyer · Maj+Entrée pour un saut de ligne",
    inoutTitle:"🚪 Présences — Entrées / Sorties",inoutMyStatus:"Mon statut actuel",
    inoutReasonPlaceholder:"Raison (optionnel — pause, rdv médical…)",
    inoutIn:"✅ Je suis rentré(e)",inoutOut:"🚪 Je pars",
    inoutCurrentlyOut:"Tu es actuellement absent(e)",inoutCurrentlyIn:"Tu es actuellement présent(e)",
    inoutPresent:"✅ Présents",inoutAbsent:"🚪 Absents",
    inoutLog:"Journal d'aujourd'hui",inoutLogEmpty:"Aucun mouvement enregistré.",
    inoutCameBack:" est rentré(e)",inoutLeft:" est parti(e)",
    docsTitle:"📎 Documents & Photos",docsAdd:"Ajouter un document",
    docsChooseFile:"📷 Choisir une photo / fichier",docsTitleField:"Titre du document",
    docsSave:"Enregistrer",docsCancel:"Annuler",docsEmpty:"Aucun document partagé pour l'instant.",
    docsBy:"Par",docsDelete:"Supprimer",docsUploading:"Envoi en cours…",
  },
  en:{
    loginSubtitle:"Sign in to your session",namePlaceholder:"Your first name / username",
    passwordPlaceholder:"Password",loginBtn:"Sign in",noAccount:"No account yet?",
    createAccount:"Create an account",createTitle:"Create an account",confirmPassword:"Confirm password",
    createBtn:"Create my account",backToLogin:"← Back to login",
    errNameEmpty:"Enter your name or username.",errPassShort:"Password too short (min. 4 characters).",
    errPassMismatch:"Passwords do not match.",errNameTaken:"This name is already taken.",
    errWrongCredentials:"Incorrect name or password.",errNetwork:"Connection problem. Try again.",
    loading:"Loading…",
    sessionActive:"Session active",roleAdmin:"Trainer",roleStudent:"Participant",logout:"Sign out",
    tabSchedule:"Schedule",tabChat:"Chat",tabInOut:"In / Out",tabDocs:"Documents",
    calToday:"Today",calAdd:"+ Create",calNoEvent:"No sessions this day.",
    calAddTitle:"New session",calEventTitle:"Title",calEventDesc:"Description (optional)",
    calTimeStart:"Start time",calTimeEnd:"End time",calSave:"Save",calCancel:"Cancel",
    calDelete:"Delete",calBy:"Added by",calColor:"Color",
    calDays:["Sun","Mon","Tue","Wed","Thu","Fri","Sat"],
    calMonths:["January","February","March","April","May","June","July","August","September","October","November","December"],
    chatTitle:"💬 Chat",chatSubtitle:"General training channel",
    chatEmpty:"Be the first to write here!",chatPlaceholder:"Write a message…",
    chatHint:"Enter to send · Shift+Enter for a new line",
    inoutTitle:"🚪 Attendance — In / Out",inoutMyStatus:"My current status",
    inoutReasonPlaceholder:"Reason (optional — break, medical appointment…)",
    inoutIn:"✅ I'm back",inoutOut:"🚪 I'm leaving",
    inoutCurrentlyOut:"You are currently absent",inoutCurrentlyIn:"You are currently present",
    inoutPresent:"✅ Present",inoutAbsent:"🚪 Absent",
    inoutLog:"Today's log",inoutLogEmpty:"No movements recorded.",
    inoutCameBack:" came back",inoutLeft:" left",
    docsTitle:"📎 Documents & Photos",docsAdd:"Add a document",
    docsChooseFile:"📷 Choose a photo / file",docsTitleField:"Document title",
    docsSave:"Save",docsCancel:"Cancel",docsEmpty:"No documents shared yet.",
    docsBy:"By",docsDelete:"Delete",docsUploading:"Uploading…",
  },
};

const detectLang = () => {
  const saved = localStorage.getItem("lang");
  if (saved === "fr" || saved === "en") return saved;
  const b = (navigator.language || "en").toLowerCase();
  return b.startsWith("fr") ? "fr" : "en";
};

const sget=(k)=>{ try{ return JSON.parse(localStorage.getItem(k)); }catch{ return null; } };
const sset=(k,v)=>localStorage.setItem(k,JSON.stringify(v));

const avatarColors=["#5865f2","#23a55a","#f0b232","#f23f43","#eb459e","#3ba55c","#faa81a","#00b0f4"];
const randomColor =()=>avatarColors[Math.floor(Math.random()*avatarColors.length)];
const loc      = l => l==="fr" ? "fr-FR" : "en-US";
const formatTime  = (iso,l)=>new Date(iso).toLocaleTimeString(loc(l),{hour:"2-digit",minute:"2-digit"});
const formatDate  = (iso,l)=>new Date(iso).toLocaleDateString(loc(l),{weekday:"short",day:"numeric",month:"short"});
const pad = n => String(n).padStart(2,"0");
const dateKey = (y,m,d) => `${y}-${pad(m+1)}-${pad(d)}`;

// ── Supabase data layer ───────────────────────────────────────────────────────
const db = {
  async ensureAdmin(){
    const { data } = await supabase.from("users").select("id").eq("id","admin").maybeSingle();
    if(!data){
      await supabase.from("users").insert({id:"admin",name:"Formateur",role:"admin",password:"admin123",color:"#5865f2"});
    }
  },
  async login(name,pass){
    const { data } = await supabase.from("users").select("*").ilike("name",name.trim()).eq("password",pass).maybeSingle();
    return data;
  },
  async nameExists(name){
    const { data } = await supabase.from("users").select("id").ilike("name",name.trim()).maybeSingle();
    return !!data;
  },
  async register(u){
    const { error } = await supabase.from("users").insert({id:u.id,name:u.name,role:u.role,password:u.password,color:u.color});
    return !error;
  },
  // messages
  async getMessages(){
    const { data } = await supabase.from("messages").select("*").order("created_at",{ascending:true});
    return (data||[]).map(m=>({id:m.id,userId:m.user_id,userName:m.user_name,userColor:m.user_color,text:m.text,at:m.created_at}));
  },
  async sendMessage(m){
    await supabase.from("messages").insert({id:m.id,user_id:m.userId,user_name:m.userName,user_color:m.userColor,text:m.text});
  },
  // events
  async getEvents(){
    const { data } = await supabase.from("events").select("*").order("date",{ascending:true});
    return (data||[]).map(e=>({id:e.id,date:e.date,title:e.title,desc:e.description,timeStart:e.time_start,timeEnd:e.time_end,color:e.color,createdBy:e.created_by}));
  },
  async addEvent(e){
    await supabase.from("events").upsert({id:e.id,date:e.date,title:e.title,description:e.desc,time_start:e.timeStart,time_end:e.timeEnd,color:e.color,created_by:e.createdBy});
  },
  async deleteEvent(id){ await supabase.from("events").delete().eq("id",id); },
  // documents
  async getDocs(){
    const { data } = await supabase.from("documents").select("*").order("created_at",{ascending:false});
    return (data||[]).map(d=>({id:d.id,src:d.src,name:d.name,uploadedBy:d.uploaded_by,userColor:d.user_color,at:d.created_at}));
  },
  async addDoc(d){
    await supabase.from("documents").insert({id:d.id,src:d.src,name:d.name,uploaded_by:d.uploadedBy,user_color:d.userColor});
  },
  async deleteDoc(id){ await supabase.from("documents").delete().eq("id",id); },
  // in/out
  async getInOut(){
    const today=new Date().toISOString().split("T")[0];
    const { data } = await supabase.from("inout").select("*").gte("created_at",today).order("created_at",{ascending:true});
    return (data||[]).map(e=>({id:e.id,userId:e.user_id,userName:e.user_name,userColor:e.user_color,type:e.type,reason:e.reason,at:e.created_at}));
  },
  async addInOut(e){
    await supabase.from("inout").insert({id:e.id,user_id:e.userId,user_name:e.userName,user_color:e.userColor,type:e.type,reason:e.reason});
  },
};

// ── image compression ─────────────────────────────────────────────────────────
const compressImage = (file) => new Promise((resolve)=>{
  if(!file.type.startsWith("image/")){
    const r=new FileReader(); r.onload=e=>resolve(e.target.result); r.readAsDataURL(file); return;
  }
  const reader=new FileReader();
  reader.onload=e=>{
    const img=new Image();
    img.onload=()=>{
      const max=1200;
      let {width,height}=img;
      if(width>max){ height=height*max/width; width=max; }
      const canvas=document.createElement("canvas");
      canvas.width=width; canvas.height=height;
      canvas.getContext("2d").drawImage(img,0,0,width,height);
      resolve(canvas.toDataURL("image/jpeg",0.7));
    };
    img.src=e.target.result;
  };
  reader.readAsDataURL(file);
});

const globalStyle=`
  *{box-sizing:border-box;margin:0;padding:0;}
  body{background:#0f1117;color:#e3e5e8;font-family:'Inter',system-ui,sans-serif;}
  ::-webkit-scrollbar{width:6px;}::-webkit-scrollbar-track{background:transparent;}
  ::-webkit-scrollbar-thumb{background:#4e5468;border-radius:3px;}
  input,textarea,button,select{font-family:inherit;}button{cursor:pointer;}
  @keyframes spin{to{transform:rotate(360deg);}}
`;

// ── UI primitives ─────────────────────────────────────────────────────────────
function Spinner({size=24}){
  return <div style={{width:size,height:size,border:`3px solid ${C.border}`,borderTopColor:C.accent,borderRadius:"50%",animation:"spin .8s linear infinite"}}/>;
}
function Avatar({name,color,size=36}){
  return <div style={{width:size,height:size,borderRadius:"50%",background:color||C.accent,display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,fontSize:size*0.4,color:"#fff",flexShrink:0}}>{(name||"?")[0].toUpperCase()}</div>;
}
function Btn({children,onClick,variant="primary",style:s={},disabled}){
  const base={padding:"8px 16px",borderRadius:6,border:"none",fontWeight:600,fontSize:14,transition:"background .15s",cursor:disabled?"not-allowed":"pointer",opacity:disabled?.5:1};
  const v={primary:{background:C.accent,color:"#fff"},danger:{background:C.red,color:"#fff"},ghost:{background:"transparent",color:C.muted,border:`1px solid ${C.border}`},success:{background:C.green,color:"#fff"}};
  return <button style={{...base,...v[variant],...s}} onClick={onClick} disabled={disabled}>{children}</button>;
}
function Inp({value,onChange,placeholder,type="text",style:s={},onKeyDown}){
  return <input type={type} value={value} onChange={onChange} placeholder={placeholder} onKeyDown={onKeyDown} style={{background:C.bg,border:`1px solid ${C.border}`,borderRadius:6,padding:"9px 12px",color:C.text,fontSize:14,outline:"none",width:"100%",...s}}/>;
}
function LangToggle({lang,setLang}){
  return(
    <div style={{display:"flex",gap:4,background:C.bg,borderRadius:20,padding:3,border:`1px solid ${C.border}`}}>
      {["fr","en"].map(l=>(
        <button key={l} onClick={()=>setLang(l)} style={{padding:"4px 12px",borderRadius:16,border:"none",fontSize:12,fontWeight:700,cursor:"pointer",background:lang===l?C.accent:"transparent",color:lang===l?"#fff":C.muted,transition:"all .15s"}}>
          {l==="fr"?"🇫🇷 FR":"🇬🇧 EN"}
        </button>
      ))}
    </div>
  );
}

// ── Auth ──────────────────────────────────────────────────────────────────────
function LoginScreen({onLogin,onRegister,lang,setLang}){
  const t=TRANSLATIONS[lang];
  const [name,setName]=useState(""); const [pass,setPass]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const submit=async()=>{
    setErr(""); setBusy(true);
    try{
      const u=await db.login(name,pass);
      u ? onLogin(u) : setErr(t.errWrongCredentials);
    }catch{ setErr(t.errNetwork); }
    setBusy(false);
  };
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{background:C.surface,borderRadius:12,padding:36,width:380,boxShadow:"0 8px 32px #0006"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><LangToggle lang={lang} setLang={setLang}/></div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:32,marginBottom:8}}>🎓</div>
          <h1 style={{fontSize:22,fontWeight:800,color:C.text}}>4thebest</h1>
          <p style={{color:C.muted,fontSize:14,marginTop:4}}>{t.loginSubtitle}</p>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp value={name} onChange={e=>setName(e.target.value)} placeholder={t.namePlaceholder}/>
          <Inp value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.passwordPlaceholder} type="password" onKeyDown={e=>e.key==="Enter"&&submit()}/>
          {err&&<p style={{color:C.red,fontSize:13}}>{err}</p>}
          <Btn onClick={submit} disabled={busy} style={{marginTop:4,display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>{busy&&<Spinner size={16}/>}{t.loginBtn}</Btn>
          <p style={{textAlign:"center",color:C.muted,fontSize:13}}>{t.noAccount}{" "}<span style={{color:C.accent,cursor:"pointer"}} onClick={onRegister}>{t.createAccount}</span></p>
        </div>
      </div>
    </div>
  );
}

function RegisterScreen({onBack,onLogin,lang,setLang}){
  const t=TRANSLATIONS[lang];
  const [name,setName]=useState(""); const [pass,setPass]=useState(""); const [pass2,setPass2]=useState(""); const [err,setErr]=useState(""); const [busy,setBusy]=useState(false);
  const submit=async()=>{
    if(!name.trim()) return setErr(t.errNameEmpty);
    if(pass.length<4) return setErr(t.errPassShort);
    if(pass!==pass2) return setErr(t.errPassMismatch);
    setErr(""); setBusy(true);
    try{
      if(await db.nameExists(name)){ setBusy(false); return setErr(t.errNameTaken); }
      const nu={id:Date.now().toString(),name:name.trim(),role:"student",password:pass,color:randomColor()};
      const ok=await db.register(nu);
      ok ? onLogin(nu) : setErr(t.errNetwork);
    }catch{ setErr(t.errNetwork); }
    setBusy(false);
  };
  return(
    <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:C.bg}}>
      <div style={{background:C.surface,borderRadius:12,padding:36,width:380,boxShadow:"0 8px 32px #0006"}}>
        <div style={{display:"flex",justifyContent:"flex-end",marginBottom:16}}><LangToggle lang={lang} setLang={setLang}/></div>
        <div style={{textAlign:"center",marginBottom:28}}>
          <div style={{fontSize:32,marginBottom:8}}>🎓</div>
          <h1 style={{fontSize:22,fontWeight:800}}>{t.createTitle}</h1>
        </div>
        <div style={{display:"flex",flexDirection:"column",gap:12}}>
          <Inp value={name} onChange={e=>setName(e.target.value)} placeholder={t.namePlaceholder}/>
          <Inp value={pass} onChange={e=>setPass(e.target.value)} placeholder={t.passwordPlaceholder} type="password"/>
          <Inp value={pass2} onChange={e=>setPass2(e.target.value)} placeholder={t.confirmPassword} type="password"/>
          {err&&<p style={{color:C.red,fontSize:13}}>{err}</p>}
          <Btn onClick={submit} disabled={busy} style={{marginTop:4,display:"flex",justifyContent:"center",alignItems:"center",gap:8}}>{busy&&<Spinner size={16}/>}{t.createBtn}</Btn>
          <p style={{textAlign:"center",color:C.muted,fontSize:13,cursor:"pointer"}} onClick={onBack}>{t.backToLogin}</p>
        </div>
      </div>
    </div>
  );
}

// ── Calendar ──────────────────────────────────────────────────────────────────
function ScheduleTab({user,lang}){
  const t=TRANSLATIONS[lang];
  const today=new Date();
  const [year,setYear]=useState(today.getFullYear());
  const [month,setMonth]=useState(today.getMonth());
  const [selectedDay,setSelectedDay]=useState(null);
  const [items,setItems]=useState([]);
  const [modal,setModal]=useState(null);
  const isAdmin=user.role==="admin";

  const load=async()=>{ setItems(await db.getEvents()); };
  useEffect(()=>{ load(); const i=setInterval(load,10000); return()=>clearInterval(i); },[]);

  const prevMonth=()=>{ if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1); };
  const nextMonth=()=>{ if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1); };
  const goToday=()=>{ setYear(today.getFullYear()); setMonth(today.getMonth()); setSelectedDay(dateKey(today.getFullYear(),today.getMonth(),today.getDate())); };

  const firstDay=new Date(year,month,1).getDay();
  const daysInMonth=new Date(year,month+1,0).getDate();
  const todayStr=dateKey(today.getFullYear(),today.getMonth(),today.getDate());
  const eventsOf=dk=>items.filter(i=>i.date===dk);

  const addEvent=async(ev)=>{ await db.addEvent(ev); await load(); };
  const deleteEvent=async(id)=>{ await db.deleteEvent(id); await load(); };

  const cells=[];
  for(let i=0;i<firstDay;i++) cells.push(null);
  for(let d=1;d<=daysInMonth;d++) cells.push(d);

  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",background:C.bg}}>
      <div style={{display:"flex",alignItems:"center",gap:12,padding:"14px 20px",borderBottom:`1px solid ${C.border}`,background:C.panel,flexShrink:0}}>
        <Btn variant="ghost" style={{padding:"6px 14px",fontSize:13}} onClick={goToday}>{t.calToday}</Btn>
        <div style={{display:"flex",gap:4}}>
          <button onClick={prevMonth} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,color:C.text,width:32,height:32,fontSize:16,cursor:"pointer"}}>‹</button>
          <button onClick={nextMonth} style={{background:"none",border:`1px solid ${C.border}`,borderRadius:6,color:C.text,width:32,height:32,fontSize:16,cursor:"pointer"}}>›</button>
        </div>
        <h2 style={{fontSize:18,fontWeight:700,flex:1}}>{t.calMonths[month]} {year}</h2>
        {isAdmin&&<Btn style={{padding:"7px 16px",fontSize:13}} onClick={()=>setModal({date:selectedDay||todayStr})}>{t.calAdd}</Btn>}
      </div>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{flex:1,display:"flex",flexDirection:"column",overflow:"hidden"}}>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",background:C.panel,borderBottom:`1px solid ${C.border}`,flexShrink:0}}>
            {t.calDays.map(d=><div key={d} style={{textAlign:"center",padding:"8px 4px",fontSize:12,fontWeight:700,color:C.muted,textTransform:"uppercase"}}>{d}</div>)}
          </div>
          <div style={{display:"grid",gridTemplateColumns:"repeat(7,1fr)",gridAutoRows:"minmax(80px,1fr)",flex:1,overflowY:"auto"}}>
            {cells.map((day,i)=>{
              if(!day) return <div key={`e${i}`} style={{borderRight:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,background:C.bg}}/>;
              const dk=dateKey(year,month,day);
              const dayEvents=eventsOf(dk);
              const isToday=dk===todayStr; const isSelected=dk===selectedDay;
              return(
                <div key={dk} onClick={()=>setSelectedDay(isSelected?null:dk)}
                  style={{borderRight:`1px solid ${C.border}`,borderBottom:`1px solid ${C.border}`,padding:"6px 4px",cursor:"pointer",background:isSelected?C.accent+"22":C.bg,minHeight:80,overflow:"hidden"}}>
                  <div style={{display:"flex",justifyContent:"center",marginBottom:3}}>
                    <span style={{width:26,height:26,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:isToday?800:500,background:isToday?C.accent:"transparent",color:isToday?"#fff":isSelected?C.accent:C.text}}>{day}</span>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",gap:2}}>
                    {dayEvents.slice(0,3).map(ev=>(
                      <div key={ev.id} onClick={e=>{e.stopPropagation();setModal({date:dk,event:ev});}}
                        style={{background:ev.color||C.accent,borderRadius:3,padding:"1px 5px",fontSize:11,fontWeight:600,color:"#fff",overflow:"hidden",whiteSpace:"nowrap",textOverflow:"ellipsis"}}>
                        {ev.timeStart?`${ev.timeStart} `:""}{ev.title}
                      </div>
                    ))}
                    {dayEvents.length>3&&<div style={{fontSize:10,color:C.muted,paddingLeft:4}}>+{dayEvents.length-3}</div>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        {selectedDay&&(
          <div style={{width:260,borderLeft:`1px solid ${C.border}`,background:C.surface,display:"flex",flexDirection:"column",flexShrink:0,overflowY:"auto"}}>
            <div style={{padding:"14px 16px",borderBottom:`1px solid ${C.border}`}}>
              <p style={{fontWeight:700,fontSize:15}}>{new Date(selectedDay+"T12:00:00").toLocaleDateString(loc(lang),{weekday:"long",day:"numeric",month:"long"})}</p>
              {isAdmin&&<button onClick={()=>setModal({date:selectedDay})} style={{marginTop:8,background:C.accent,border:"none",borderRadius:6,color:"#fff",padding:"6px 12px",fontSize:12,fontWeight:600,cursor:"pointer",width:"100%"}}>{t.calAdd}</button>}
            </div>
            <div style={{flex:1,padding:"10px 12px",display:"flex",flexDirection:"column",gap:8}}>
              {eventsOf(selectedDay).length===0&&<p style={{color:C.muted,fontSize:13,marginTop:8}}>{t.calNoEvent}</p>}
              {eventsOf(selectedDay).map(ev=>(
                <div key={ev.id} style={{borderLeft:`3px solid ${ev.color||C.accent}`,background:C.bg,borderRadius:"0 6px 6px 0",padding:"8px 10px",cursor:"pointer"}} onClick={()=>setModal({date:selectedDay,event:ev})}>
                  <p style={{fontWeight:700,fontSize:14}}>{ev.title}</p>
                  {ev.timeStart&&<p style={{fontSize:12,color:C.muted,marginTop:2}}>{ev.timeStart}{ev.timeEnd?` – ${ev.timeEnd}`:""}</p>}
                  {ev.desc&&<p style={{fontSize:12,color:C.muted,marginTop:2}}>{ev.desc}</p>}
                  <p style={{fontSize:11,color:C.dim,marginTop:4}}>{t.calBy} {ev.createdBy}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      {modal&&<EventModal t={t} lang={lang} modal={modal} user={user} isAdmin={isAdmin}
        onSave={async ev=>{await addEvent(ev);setModal(null);setSelectedDay(modal.date);}}
        onDelete={async id=>{await deleteEvent(id);setModal(null);}}
        onClose={()=>setModal(null)}/>}
    </div>
  );
}

function EventModal({t,lang,modal,user,isAdmin,onSave,onDelete,onClose}){
  const ev=modal.event;
  const [title,setTitle]=useState(ev?.title||"");
  const [desc,setDesc]=useState(ev?.desc||"");
  const [timeStart,setTimeStart]=useState(ev?.timeStart||"");
  const [timeEnd,setTimeEnd]=useState(ev?.timeEnd||"");
  const [color,setColor]=useState(ev?.color||EVENT_COLORS[0]);
  const [busy,setBusy]=useState(false);
  const viewing=!!ev&&!isAdmin;
  const save=async()=>{
    if(!title.trim()) return;
    setBusy(true);
    await onSave({id:ev?.id||Date.now().toString(),date:modal.date,title:title.trim(),desc:desc.trim(),timeStart,timeEnd,color,createdBy:user.name});
  };
  return(
    <div style={{position:"fixed",inset:0,background:"#000a",display:"flex",alignItems:"center",justifyContent:"center",zIndex:500}} onClick={onClose}>
      <div style={{background:C.surface,borderRadius:12,padding:28,width:380,boxShadow:"0 12px 48px #0009",maxHeight:"90vh",overflowY:"auto"}} onClick={e=>e.stopPropagation()}>
        <div style={{height:6,borderRadius:"8px 8px 0 0",background:color,margin:"-28px -28px 20px"}}/>
        <h3 style={{fontSize:17,fontWeight:700,marginBottom:18}}>{ev?ev.title:t.calAddTitle}</h3>
        {!viewing&&<>
          <div style={{display:"flex",flexDirection:"column",gap:12,marginBottom:16}}>
            <Inp value={title} onChange={e=>setTitle(e.target.value)} placeholder={t.calEventTitle}/>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10}}>
              <Inp value={timeStart} onChange={e=>setTimeStart(e.target.value)} type="time"/>
              <Inp value={timeEnd} onChange={e=>setTimeEnd(e.target.value)} type="time"/>
            </div>
            <Inp value={desc} onChange={e=>setDesc(e.target.value)} placeholder={t.calEventDesc}/>
            <div>
              <p style={{fontSize:12,color:C.muted,marginBottom:6}}>{t.calColor}</p>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {EVENT_COLORS.map(c=><button key={c} onClick={()=>setColor(c)} style={{width:24,height:24,borderRadius:"50%",background:c,border:color===c?"3px solid #fff":"3px solid transparent",cursor:"pointer"}}/>)}
              </div>
            </div>
          </div>
          <div style={{display:"flex",gap:8,justifyContent:"flex-end"}}>
            {ev&&isAdmin&&<Btn variant="danger" style={{marginRight:"auto"}} onClick={()=>onDelete(ev.id)}>{t.calDelete}</Btn>}
            <Btn variant="ghost" onClick={onClose}>{t.calCancel}</Btn>
            <Btn onClick={save} disabled={busy}>{t.calSave}</Btn>
          </div>
        </>}
        {viewing&&<>
          <div style={{display:"flex",flexDirection:"column",gap:8,marginBottom:20}}>
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>🕐</span><p style={{color:C.muted,fontSize:14}}>{ev.timeStart||"—"}{ev.timeEnd?` – ${ev.timeEnd}`:""}</p></div>
            {ev.desc&&<div style={{display:"flex",alignItems:"flex-start",gap:8}}><span>📝</span><p style={{color:C.muted,fontSize:14}}>{ev.desc}</p></div>}
            <div style={{display:"flex",alignItems:"center",gap:8}}><span>👤</span><p style={{color:C.muted,fontSize:14}}>{t.calBy} {ev.createdBy}</p></div>
          </div>
          <Btn variant="ghost" onClick={onClose}>{t.calCancel}</Btn>
        </>}
      </div>
    </div>
  );
}

// ── Chat ──────────────────────────────────────────────────────────────────────
function ChatTab({user,lang}){
  const t=TRANSLATIONS[lang];
  const [messages,setMessages]=useState([]);
  const [text,setText]=useState("");
  const bottomRef=useRef(null);
  const load=async()=>{ setMessages(await db.getMessages()); };
  useEffect(()=>{ load(); const i=setInterval(load,3000); return()=>clearInterval(i); },[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[messages]);
  const send=async()=>{
    if(!text.trim()) return;
    const msg={id:Date.now().toString(),userId:user.id,userName:user.name,userColor:user.color,text:text.trim()};
    setText("");
    setMessages(m=>[...m,{...msg,at:new Date().toISOString()}]);
    await db.sendMessage(msg);
  };
  const handleKey=e=>{if(e.key==="Enter"&&!e.shiftKey){e.preventDefault();send();}};
  const grouped=messages.reduce((acc,msg)=>{
    const last=acc[acc.length-1];
    if(last&&last.userId===msg.userId&&new Date(msg.at)-new Date(last.messages[last.messages.length-1].at)<300000){last.messages.push(msg);}
    else acc.push({userId:msg.userId,userName:msg.userName,userColor:msg.userColor,messages:[msg]});
    return acc;
  },[]);
  return(
    <div style={{display:"flex",flexDirection:"column",height:"100%",maxWidth:800,margin:"0 auto",width:"100%"}}>
      <div style={{padding:"16px 20px 8px",borderBottom:`1px solid ${C.border}`}}>
        <h2 style={{fontSize:18,fontWeight:700}}>{t.chatTitle}</h2>
        <p style={{color:C.muted,fontSize:13}}>{t.chatSubtitle}</p>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:"12px 20px",display:"flex",flexDirection:"column",gap:2}}>
        {grouped.length===0&&<div style={{textAlign:"center",marginTop:80,color:C.muted}}><div style={{fontSize:40,marginBottom:8}}>👋</div><p>{t.chatEmpty}</p></div>}
        {grouped.map((g,gi)=>(
          <div key={gi} style={{display:"flex",gap:12,padding:"6px 0"}}>
            <Avatar name={g.userName} color={g.userColor}/>
            <div style={{flex:1}}>
              <div style={{display:"flex",alignItems:"baseline",gap:8,marginBottom:2}}>
                <span style={{fontWeight:700,fontSize:15,color:g.userColor}}>{g.userName}</span>
                <span style={{fontSize:11,color:C.dim}}>{formatDate(g.messages[0].at,lang)} · {formatTime(g.messages[0].at,lang)}</span>
              </div>
              {g.messages.map(m=><p key={m.id} style={{fontSize:15,lineHeight:1.5,wordBreak:"break-word"}}>{m.text}</p>)}
            </div>
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      <div style={{padding:"12px 20px",borderTop:`1px solid ${C.border}`}}>
        <div style={{display:"flex",gap:10,background:C.surface,borderRadius:10,padding:"8px 12px",border:`1px solid ${C.border}`}}>
          <textarea value={text} onChange={e=>setText(e.target.value)} onKeyDown={handleKey} placeholder={t.chatPlaceholder} rows={1}
            style={{flex:1,background:"transparent",border:"none",outline:"none",color:C.text,fontSize:15,resize:"none",lineHeight:1.5,fontFamily:"inherit"}}/>
          <button onClick={send} style={{background:C.accent,border:"none",borderRadius:6,color:"#fff",padding:"4px 12px",fontWeight:700,fontSize:14}}>→</button>
        </div>
        <p style={{color:C.dim,fontSize:11,marginTop:4}}>{t.chatHint}</p>
      </div>
    </div>
  );
}

// ── InOut ─────────────────────────────────────────────────────────────────────
function InOutTab({user,lang}){
  const t=TRANSLATIONS[lang];
  const [log,setLog]=useState([]);
  const [reason,setReason]=useState("");
  const load=async()=>{ setLog(await db.getInOut()); };
  useEffect(()=>{ load(); const i=setInterval(load,5000); return()=>clearInterval(i); },[]);
  const myStatus=()=>{const my=log.filter(e=>e.userId===user.id);return my.length>0?my[my.length-1].type:null;};
  const toggle=async type=>{
    const e={id:Date.now().toString(),userId:user.id,userName:user.name,userColor:user.color,type,reason:reason.trim()};
    setReason("");
    await db.addInOut(e); await load();
  };
  const isOut=myStatus()==="out"; const isIn=myStatus()==="in";
  const latest={}; log.forEach(e=>{latest[e.userId]=e;});
  const present=Object.values(latest).filter(e=>e.type==="in");
  const absent=Object.values(latest).filter(e=>e.type==="out");
  const todayLog=log.slice().reverse();
  return(
    <div style={{padding:24,maxWidth:720,margin:"0 auto"}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:20}}>{t.inoutTitle}</h2>
      <div style={{background:C.surface,borderRadius:10,padding:20,marginBottom:24,border:`1px solid ${C.border}`}}>
        <p style={{fontWeight:600,marginBottom:12}}>{t.inoutMyStatus}</p>
        <Inp value={reason} onChange={e=>setReason(e.target.value)} placeholder={t.inoutReasonPlaceholder} style={{marginBottom:12}}/>
        <div style={{display:"flex",gap:10}}>
          <Btn variant="success" onClick={()=>toggle("in")} disabled={isIn}>{t.inoutIn}</Btn>
          <Btn variant="danger" onClick={()=>toggle("out")} disabled={isOut}>{t.inoutOut}</Btn>
        </div>
        {myStatus()&&<p style={{marginTop:10,color:isOut?C.red:C.green,fontSize:13}}>{isOut?t.inoutCurrentlyOut:t.inoutCurrentlyIn}</p>}
      </div>
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:24}}>
        <SGroup title={`${t.inoutPresent} (${present.length})`} items={present} color={C.green}/>
        <SGroup title={`${t.inoutAbsent} (${absent.length})`} items={absent} color={C.red}/>
      </div>
      <p style={{color:C.muted,fontSize:12,fontWeight:700,letterSpacing:1,textTransform:"uppercase",marginBottom:10}}>{t.inoutLog}</p>
      <div style={{display:"flex",flexDirection:"column",gap:6}}>
        {todayLog.length===0&&<p style={{color:C.muted}}>{t.inoutLogEmpty}</p>}
        {todayLog.map(e=>(
          <div key={e.id} style={{background:C.surface,borderRadius:8,padding:"10px 14px",display:"flex",alignItems:"center",gap:12,border:`1px solid ${C.border}`}}>
            <span style={{fontSize:18}}>{e.type==="in"?"✅":"🚪"}</span>
            <div style={{flex:1}}>
              <span style={{fontWeight:600,color:e.userColor}}>{e.userName}</span>
              <span style={{color:C.muted,fontSize:13}}>{e.type==="in"?t.inoutCameBack:t.inoutLeft}{e.reason?` · ${e.reason}`:""}</span>
            </div>
            <span style={{color:C.dim,fontSize:12}}>{formatTime(e.at,lang)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
function SGroup({title,items,color}){
  return(
    <div style={{background:C.surface,borderRadius:10,padding:16,border:`1px solid ${C.border}`}}>
      <p style={{color,fontWeight:700,fontSize:13,marginBottom:10}}>{title}</p>
      <div style={{display:"flex",flexDirection:"column",gap:8}}>
        {items.length===0&&<p style={{color:C.dim,fontSize:13}}>—</p>}
        {items.map(e=>(
          <div key={e.userId} style={{display:"flex",alignItems:"center",gap:8}}>
            <Avatar name={e.userName} color={e.userColor} size={28}/>
            <div><p style={{fontSize:14,fontWeight:600}}>{e.userName}</p>{e.reason&&<p style={{fontSize:12,color:C.muted}}>{e.reason}</p>}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Docs ──────────────────────────────────────────────────────────────────────
function DocsTab({user,lang}){
  const t=TRANSLATIONS[lang];
  const [docs,setDocs]=useState([]);
  const [caption,setCaption]=useState(""); const [preview,setPreview]=useState(null); const [lightbox,setLightbox]=useState(null); const [busy,setBusy]=useState(false);
  const fileRef=useRef(null);
  const isAdmin=user.role==="admin";
  const load=async()=>{ setDocs(await db.getDocs()); };
  useEffect(()=>{ load(); const i=setInterval(load,15000); return()=>clearInterval(i); },[]);
  const handleFile=async e=>{
    const f=e.target.files[0]; if(!f) return;
    const src=await compressImage(f);
    setPreview({src,name:f.name});
  };
  const save=async()=>{
    if(!preview) return;
    setBusy(true);
    const doc={id:Date.now().toString(),src:preview.src,name:caption.trim()||preview.name,uploadedBy:user.name,userColor:user.color};
    await db.addDoc(doc); await load();
    setPreview(null); setCaption(""); setBusy(false);
    if(fileRef.current) fileRef.current.value="";
  };
  const remove=async id=>{ await db.deleteDoc(id); await load(); };
  return(
    <div style={{padding:24,maxWidth:800,margin:"0 auto"}}>
      <h2 style={{fontSize:20,fontWeight:700,marginBottom:20}}>{t.docsTitle}</h2>
      <div style={{background:C.surface,borderRadius:10,padding:20,marginBottom:24,border:`1px solid ${C.border}`}}>
        <p style={{fontWeight:600,marginBottom:12,color:C.muted,fontSize:13,textTransform:"uppercase",letterSpacing:.5}}>{t.docsAdd}</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{display:"none"}}/>
        <Btn variant="ghost" onClick={()=>fileRef.current?.click()}>{t.docsChooseFile}</Btn>
        {preview&&(
          <div style={{marginTop:14}}>
            <img src={preview.src} alt="" style={{maxWidth:"100%",maxHeight:200,borderRadius:8,objectFit:"cover"}}/>
            <Inp value={caption} onChange={e=>setCaption(e.target.value)} placeholder={t.docsTitleField} style={{marginTop:10}}/>
            <div style={{display:"flex",gap:8,marginTop:10,alignItems:"center"}}>
              <Btn onClick={save} disabled={busy}>{busy?t.docsUploading:t.docsSave}</Btn>
              <Btn variant="ghost" onClick={()=>{setPreview(null);setCaption("");}}>{t.docsCancel}</Btn>
              {busy&&<Spinner size={18}/>}
            </div>
          </div>
        )}
      </div>
      {docs.length===0&&<p style={{color:C.muted,textAlign:"center",marginTop:48}}>{t.docsEmpty}</p>}
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:14}}>
        {docs.map(doc=>(
          <div key={doc.id} style={{background:C.surface,borderRadius:10,overflow:"hidden",border:`1px solid ${C.border}`,cursor:"pointer"}} onClick={()=>setLightbox(doc)}>
            <img src={doc.src} alt={doc.name} style={{width:"100%",height:140,objectFit:"cover"}}/>
            <div style={{padding:10}}>
              <p style={{fontWeight:600,fontSize:13,marginBottom:4,wordBreak:"break-word"}}>{doc.name}</p>
              <p style={{color:C.muted,fontSize:11}}>{t.docsBy} {doc.uploadedBy} · {formatDate(doc.at,lang)}</p>
              {(isAdmin||doc.uploadedBy===user.name)&&<Btn variant="danger" style={{marginTop:8,padding:"4px 8px",fontSize:11}} onClick={e=>{e.stopPropagation();remove(doc.id);}}>{t.docsDelete}</Btn>}
            </div>
          </div>
        ))}
      </div>
      {lightbox&&(
        <div style={{position:"fixed",inset:0,background:"#000c",display:"flex",alignItems:"center",justifyContent:"center",zIndex:999}} onClick={()=>setLightbox(null)}>
          <img src={lightbox.src} alt={lightbox.name} style={{maxWidth:"90vw",maxHeight:"85vh",borderRadius:10}}/>
        </div>
      )}
    </div>
  );
}

// ── Sidebar ───────────────────────────────────────────────────────────────────
function Sidebar({active,onSelect,user,onLogout,isMobile,lang,setLang,t}){
  const TABS=[
    {id:"schedule",icon:"📅",label:t.tabSchedule},
    {id:"chat",icon:"💬",label:t.tabChat},
    {id:"inout",icon:"🚪",label:t.tabInOut},
    {id:"docs",icon:"📎",label:t.tabDocs},
  ];
  return(
    <div style={{width:isMobile?"100%":220,background:C.panel,display:"flex",flexDirection:"column",borderRight:`1px solid ${C.border}`,height:isMobile?"auto":"100vh",position:isMobile?"fixed":"relative",bottom:isMobile?0:"auto",left:0,right:0,zIndex:100,flexShrink:0}}>
      {!isMobile&&(
        <div style={{padding:"16px 16px 12px",borderBottom:`1px solid ${C.border}`}}>
          <p style={{fontWeight:800,fontSize:15,color:C.text}}>🎓 4thebest</p>
          <p style={{color:C.muted,fontSize:12,marginTop:2}}>{t.sessionActive}</p>
          <div style={{marginTop:10}}><LangToggle lang={lang} setLang={setLang}/></div>
        </div>
      )}
      <nav style={{flex:1,padding:isMobile?"0":"10px 8px",display:"flex",flexDirection:isMobile?"row":"column",gap:isMobile?0:2,justifyContent:isMobile?"space-around":"flex-start"}}>
        {TABS.map(tab=>(
          <button key={tab.id} onClick={()=>onSelect(tab.id)}
            style={{display:"flex",flexDirection:isMobile?"column":"row",alignItems:"center",gap:isMobile?2:10,padding:isMobile?"8px 4px":"9px 12px",borderRadius:isMobile?0:8,border:"none",background:active===tab.id?(isMobile?"transparent":C.border+"cc"):"transparent",color:active===tab.id?C.text:C.muted,fontWeight:active===tab.id?700:500,fontSize:isMobile?10:14,cursor:"pointer",flex:isMobile?1:"unset",borderTop:isMobile&&active===tab.id?`2px solid ${C.accent}`:"2px solid transparent"}}>
            <span style={{fontSize:isMobile?20:16}}>{tab.icon}</span>{tab.label}
          </button>
        ))}
      </nav>
      {!isMobile&&(
        <div style={{padding:"12px 16px",borderTop:`1px solid ${C.border}`,display:"flex",alignItems:"center",gap:10}}>
          <Avatar name={user.name} color={user.color} size={32}/>
          <div style={{flex:1,minWidth:0}}>
            <p style={{fontWeight:700,fontSize:13,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap"}}>{user.name}</p>
            <p style={{color:C.muted,fontSize:11}}>{user.role==="admin"?t.roleAdmin:t.roleStudent}</p>
          </div>
          <button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}} title={t.logout}>⏻</button>
        </div>
      )}
    </div>
  );
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App(){
  const [screen,setScreen]=useState("login");
  const [user,setUser]=useState(null);
  const [tab,setTab]=useState("schedule");
  const [lang,setLang]=useState(detectLang);
  const [isMobile,setIsMobile]=useState(window.innerWidth<640);
  const t=TRANSLATIONS[lang];
  const changeLang=l=>{localStorage.setItem("lang",l);setLang(l);};
  useEffect(()=>{
    db.ensureAdmin();
    const u=sget("currentUser");
    if(u){setUser(u);setScreen("app");}
    const onR=()=>setIsMobile(window.innerWidth<640);
    window.addEventListener("resize",onR);
    return()=>window.removeEventListener("resize",onR);
  },[]);
  const login=u=>{sset("currentUser",u);setUser(u);setScreen("app");};
  const logout=()=>{sset("currentUser",null);setUser(null);setScreen("login");};
  if(screen==="login") return <><style>{globalStyle}</style><LoginScreen onLogin={login} onRegister={()=>setScreen("register")} lang={lang} setLang={changeLang}/></>;
  if(screen==="register") return <><style>{globalStyle}</style><RegisterScreen onBack={()=>setScreen("login")} onLogin={login} lang={lang} setLang={changeLang}/></>;
  return(
    <>
      <style>{globalStyle}</style>
      <div style={{display:"flex",height:"100vh",flexDirection:isMobile?"column":"row",overflow:"hidden"}}>
        {!isMobile&&<Sidebar active={tab} onSelect={setTab} user={user} onLogout={logout} isMobile={false} lang={lang} setLang={changeLang} t={t}/>}
        <div style={{flex:1,display:"flex",flexDirection:"column",height:isMobile?"calc(100vh - 64px)":"100vh",overflow:"hidden"}}>
          {isMobile&&(
            <div style={{padding:"12px 16px",background:C.panel,borderBottom:`1px solid ${C.border}`,display:"flex",justifyContent:"space-between",alignItems:"center",flexShrink:0}}>
              <p style={{fontWeight:800,fontSize:15}}>🎓 4thebest</p>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <LangToggle lang={lang} setLang={changeLang}/>
                <Avatar name={user.name} color={user.color} size={28}/>
                <button onClick={logout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:16}}>⏻</button>
              </div>
            </div>
          )}
          <div style={{flex:1,overflow:"hidden",display:"flex",flexDirection:"column"}}>
            {tab==="schedule"&&<ScheduleTab user={user} lang={lang}/>}
            {tab==="chat"&&<div style={{flex:1,overflowY:"auto",display:"flex",flexDirection:"column"}}><ChatTab user={user} lang={lang}/></div>}
            {tab==="inout"&&<div style={{flex:1,overflowY:"auto"}}><InOutTab user={user} lang={lang}/></div>}
            {tab==="docs"&&<div style={{flex:1,overflowY:"auto"}}><DocsTab user={user} lang={lang}/></div>}
          </div>
        </div>
        {isMobile&&<div style={{height:64,borderTop:`1px solid ${C.border}`,flexShrink:0}}><Sidebar active={tab} onSelect={setTab} user={user} onLogout={logout} isMobile={true} lang={lang} setLang={changeLang} t={t}/></div>}
      </div>
    </>
  );
}
