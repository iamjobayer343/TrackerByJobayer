// ---------- STAR BACKGROUND ----------
const canvas = document.getElementById('starsCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const stars = [];
const starCount = 100;
for(let i=0;i<starCount;i++){
  stars.push({x:Math.random()*canvas.width, y:Math.random()*canvas.height, radius:Math.random()*1.5, speed:Math.random()*0.5+0.1});
}
function animateStars(){
  ctx.clearRect(0,0,canvas.width,canvas.height);
  for(let s of stars){
    s.y += s.speed;
    if(s.y>canvas.height) s.y=0;
    ctx.beginPath();
    ctx.arc(s.x,s.y,s.radius,0,Math.PI*2);
    ctx.fillStyle='white';
    ctx.fill();
  }
  requestAnimationFrame(animateStars);
}
animateStars();
window.addEventListener('resize',()=>{canvas.width=window.innerWidth; canvas.height=window.innerHeight;});

// ---------- DATE ----------
let now = new Date();
let todayKey = now.toISOString().slice(0,10);
let currentMonth = now.toISOString().slice(0,7);
document.getElementById("date").innerText = now.toDateString();

// ---------- MONTHLY CLEANUP ----------
for(let key in localStorage){
  if(key.match(/^\d{4}-\d{2}-\d{2}$/)){
    if(!key.startsWith(currentMonth)) localStorage.removeItem(key);
  }
}

// ---------- DARK MODE ----------
function toggleDark(){
  document.body.classList.toggle("dark");
  localStorage.setItem("dark",document.body.classList.contains("dark"));
}
if(localStorage.getItem("dark")==="true") document.body.classList.add("dark");

// ---------- SALAH ----------
let prayers = ["fajr","dhuhr","asr","maghrib","isha"];
if(!localStorage.getItem(todayKey)){
  localStorage.setItem(todayKey,JSON.stringify({fajr:false,dhuhr:false,asr:false,maghrib:false,isha:false,pages:0,minutes:0}));
}
let data = JSON.parse(localStorage.getItem(todayKey));

prayers.forEach(p=>{
  let box=document.getElementById(p);
  box.checked=data[p];
  box.onchange=()=>{
    data[p]=box.checked;
    saveDay();
    updateProgress();
    updateStreak();
    updateStats();
  }
});

function updateProgress(){
  let count = prayers.filter(p=>data[p]).length;
  document.getElementById("progress").style.width=(count/5*100)+"%";
  document.getElementById("progressText").innerText = `${count}/5 prayers completed`;
}
updateProgress();

// ---------- READING PAGES ----------
function savePages(){
  let p=Number(document.getElementById("pages").value);
  data.pages=p;
  saveDay();
  document.getElementById("pageResult").innerText=`You read ${p} pages today`;
  updateStats();
}
if(data.pages>0) document.getElementById("pageResult").innerText=`You read ${data.pages} pages today`;

// ---------- TIMER ----------
let sec = data.minutes || 0;
let timer = null;
function updateTimeUI(){
  let m=Math.floor(sec/60);
  let s=sec%60;
  document.getElementById("time").innerText = `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
  data.minutes=sec;
  saveDay();
  updateStats();
}
updateTimeUI();
function startTimer(){ if(timer) return; timer=setInterval(()=>{sec++; updateTimeUI();},1000);}
function stopTimer(){ clearInterval(timer); timer=null;}
function resetTimer(){ stopTimer(); sec=0; updateTimeUI();}

// ---------- SAVE & HISTORY ----------
function saveDay(){
  localStorage.setItem(todayKey,JSON.stringify(data));
  loadHistory();
}
function loadHistory(){
  let box=document.getElementById("historyBox");
  box.innerHTML="";
  for(let k in localStorage){
    if(k.match(/^\d{4}-\d{2}-\d{2}$/)){
      let d=JSON.parse(localStorage[k]);
      let done=prayers.filter(p=>d[p]).length;
      box.innerHTML+=`<p><b>${k}</b> → Salah: ${done}/5, Pages: ${d.pages}, Minutes: ${d.minutes}</p>`;
    }
  }
}
loadHistory();

// ---------- STREAK ----------
function updateStreak(){
  let streak=0;
  let keys=Object.keys(localStorage).filter(k=>k.match(/^\d{4}-\d{2}-\d{2}$/)).sort();
  for(let i=keys.length-1;i>=0;i--){
    let d=JSON.parse(localStorage[keys[i]]);
    let done=prayers.filter(p=>d[p]).length;
    if(done===5) streak++; else break;
  }
  document.getElementById("streak").innerText=`🔥 Streak: ${streak} days`;
}
updateStreak();

// ---------- STATS ----------
function updateStats(){
  let doneToday=prayers.filter(p=>data[p]).length;
  document.getElementById("todaySalah").innerText=`Today Salah: ${doneToday}/5`;
  document.getElementById("todayPages").innerText=`Pages read: ${data.pages||0}`;
  document.getElementById("todayMinutes").innerText=`Reading time: ${Math.floor(data.minutes/60)}h ${data.minutes%60}min`;

  let totalPrayers=0,totalPages=0,totalMinutes=0;
  for(let k in localStorage){
    if(k.startsWith(currentMonth)){
      let d=JSON.parse(localStorage[k]);
      totalPrayers+=prayers.filter(p=>d[p]).length;
      totalPages+=Number(d.pages||0);
      totalMinutes+=Number(d.minutes||0);
    }
  }
  document.getElementById("monthSummary").innerText=`This month: ${totalPrayers} prayers, ${totalPages} pages, ${Math.floor(totalMinutes/60)}h ${totalMinutes%60}min`;
}
updateStats();

// ---------- RESET ----------
function resetDay(){ localStorage.removeItem(todayKey); location.reload();}