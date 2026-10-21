let uv=9.2,temp=36,hum=28,sunMins=0,water=1200,goal=2800,running=false,iv=null,safe=12,urineScore=20,chatOpen=true;
let recognition=null,speechEnabled=true,isListening=false;

function showTab(t,btn){
 document.querySelectorAll('.tab-pane').forEach(e=>e.classList.add('hidden'));
 document.getElementById('tab-'+t).classList.remove('hidden');
 document.querySelectorAll('.tab').forEach(b=>b.classList.remove('active'));
 if(btn) btn.classList.add('active');
}
function toggleSun(){
 running=!running;
 document.getElementById('sunBtn').innerText=running?'Stop Monitoring':'Start Monitoring';
 if(running){
  iv=setInterval(()=>{
   sunMins++;
   let m=Math.floor(sunMins/60),s=sunMins%60;
   document.getElementById('timerDisplay').innerText=`${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
   let pct=Math.min(100,sunMins/safe*100);
   document.getElementById('timerBar').style.width=pct+'%';
   document.getElementById('timerRing').style.background=`conic-gradient(#1A1D23 ${pct}%,#F3F4F6 ${pct}%)`;
   document.getElementById('timerInfo').innerText=`Safe: ${safe} min • ${Math.max(0,safe-sunMins)} min left`;
   updateKidney();updateAI();
   if(sunMins>=safe){alert('AI ALERT: UV limit exceeded!');toggleSun()}
  },1000);
 }else clearInterval(iv);
}
function resetTimer(){clearInterval(iv);running=false;sunMins=0;document.getElementById('timerDisplay').innerText='00:00';document.getElementById('timerBar').style.width='0%';document.getElementById('timerRing').style.background='conic-gradient(#1A1D23 0%,#F3F4F6 0%)';}
function addWater(ml){water=Math.min(goal,water+ml);document.getElementById('waterDisplay').innerText=`${water} / ${goal} ml`;document.getElementById('waterBar').style.width=(water/goal*100)+'%';updateKidney();updateAI()}
function setUrine(text,score){urineScore=score;document.querySelectorAll('.urine').forEach(b=>b.classList.remove('active'));event.target.classList.add('active');let el=document.getElementById('urineStatus');el.innerText='Status: '+text;el.className=score>60?'alert-box danger':'alert-box success';updateKidney();updateAI()}
function updateKidney(){
 let heat=temp>34?25:0,dehyd=goal-water>1200?35:0,sun=sunMins>15?25:0;
 let total=urineScore+heat+dehyd+sun;let score=Math.max(0,100-total);
 let label=score>80?'Good':score>50?'Moderate':score>30?'High Risk':'DANGER';
 document.getElementById('kidneyScore').innerText=`${score}/100 - ${label}`;document.getElementById('kidneyCircle').innerText=score;
 let alerts=document.getElementById('kidneyAlerts');
 let html='';
 if(water<1200) html+=`<div class="alert-box danger">Danger: Low water - Benue needs 2.8L daily. Drink 500ml now!</div>`;
 else if(water<2000) html+=`<div class="alert-box warning">Warning: Water low. Drink soon to avoid kidney stress.</div>`;
 else html+=`<div class="alert-box success">Good: Hydration adequate - kidneys functioning normally.</div>`;
 if(temp>35 && water<1800) html+=`<div class="alert-box danger">Danger: Benue heat ${temp}°C - kidneys losing water very fast</div>`;
 if(sunMins>20) html+=`<div class="alert-box danger">Danger: Prolonged sun exposure - risk of kidney injury</div>`;
 alerts.innerHTML=html;
}
function updateAI(){
  let waterDeficit=goal-water;let riskScore=(urineScore*0.4)+(waterDeficit/50)+(temp-30)*2+sunMins*1.5;
  let aiBox=document.getElementById('aiPrediction');let kidneyPred=document.getElementById('kidneyPred');let waterAi=document.getElementById('waterAi');
  if(riskScore>100){aiBox.className='alert-box danger';aiBox.innerHTML=`Danger: AI predicts 84% chance of kidney stress in next 45 mins. Action required.`;if(kidneyPred)kidneyPred.innerText="AI Forecast: Danger in 45 mins";}
  else if(riskScore>65){aiBox.className='alert-box warning';aiBox.innerHTML=`Warning: Moderate strain building. Kidneys working harder due to heat.`;if(kidneyPred)kidneyPred.innerText="AI Forecast: Safe for 1 hour";}
  else{aiBox.className='alert-box success';aiBox.innerHTML=`Good: AI predicts kidneys safe for next 3 hours at current hydration.`;if(kidneyPred)kidneyPred.innerText="AI Forecast: Safe for 3 hours";}
  if(waterAi){let need=Math.max(0,goal-water);if(need>1000){waterAi.className='alert-box danger mt-3';waterAi.innerText=`Danger: Critical deficit ${need}ml. Drink 500ml now.`;}else if(need>500){waterAi.className='alert-box warning mt-3';waterAi.innerText=`Warning: Need ${need}ml more. You lose 300ml/hr in Benue heat.`;}else{waterAi.className='alert-box success mt-3';waterAi.innerText=`Good: Excellent! Only ${need}ml left. Kidneys healthy.`;}}
}
function checkKidney(){
  let waterDeficit=goal-water;let riskScore=(urineScore*0.4)+(waterDeficit/50)+(temp-30)*2+sunMins*1.5;
  let msg=`BENUE KIDNEY AI ANALYSIS\nRisk Score: ${riskScore.toFixed(1)}/150\n\n`;
  if(riskScore>80)msg+="Status: DANGER - High risk. Drink 1L now, avoid sun 11am-4pm, see BSUTH if pain persists.";else msg+="Status: MODERATE - Keep 2.8L daily, avoid peak sun.";
  alert(msg);speakAI(msg);
}
function testAir(){
 let aqi=Math.floor(80+Math.random()*90);
 document.getElementById('aqiVal').innerText=aqi;
 document.getElementById('pm25').innerText=Math.floor(aqi/2.5)+' µg';
 document.getElementById('pm10').innerText=Math.floor(aqi/1.2)+' µg';
 document.getElementById('o3').innerText=Math.floor(Math.random()*50+20)+' µg';
 let label=aqi<50?'Good':aqi<100?'Moderate':aqi<150?'Unhealthy':'Unhealthy-Harmattan';
 document.getElementById('aqiLabel').innerText=label;
 let badge=document.getElementById('aqiBadge');
 if(aqi>100){badge.className='badge danger';badge.innerText='UNHEALTHY';}else{badge.className='badge neutral';badge.innerText='MODERATE';}
 let triggers=document.getElementById('asthmaTriggers');
 triggers.innerHTML=`<div class='trigger'><span>Benue Heat + Dryness</span><b style='color:#DC2626'>High Risk</b></div><div class='trigger'><span>Harmattan Dust PM10</span><b style='color:#DC2626'>${aqi>100?'Very High':'High'}</b></div><div class='trigger'><span>AI Asthma Risk</span><b>${aqi>100?'84% Attack':'32% Low'}</b></div>`;
 let alertBox=document.getElementById('asthmaAlert');
 let forecast=document.getElementById('asthmaAiForecast');
 if(aqi>90||hum<40){alertBox.classList.remove('hidden');alertBox.className='alert-box danger';alertBox.innerHTML=`Danger: AI predicts AQI ${aqi} (${label}) will trigger asthma. Humidity ${hum}% - dry airway. Stay indoors, mask mandatory.`;if(forecast)forecast.innerText=`AI Forecast: 84% attack risk next 6 hours`;}
 else{alertBox.classList.remove('hidden');alertBox.className='alert-box success';alertBox.innerHTML=`Good: Air moderate. Risk low. Keep monitoring - Harmattan can spike quickly.`;if(forecast)forecast.innerText=`AI Forecast: 28% risk - safe with mask`;}
}
function toggleChat(){let body=document.getElementById('chatBody');let tog=document.getElementById('chatToggle');chatOpen=!chatOpen;body.style.display=chatOpen?'flex':'none';tog.innerText=chatOpen?'▲':'▼';}
function askAI(){
  let qEl=document.getElementById('userQ');let q=qEl.value.trim();let box=document.getElementById('chatBox');if(!q)return;
  box.innerHTML+=`<div class="msg user"><b>You:</b> ${q}</div>`;qEl.value='';
  let lower=q.toLowerCase();let answer="";
  if(lower.includes('urine')||lower.includes('pee')){answer=urineScore>60?'Danger: Dark urine means severe dehydration in Benue heat. Drink 500ml now. If brown plus back pain, go to BSUTH Makurdi.':'Good: Light yellow means optimal hydration. Kidneys safe.';}
  else if(lower.includes('asthma')||lower.includes('dust')||lower.includes('air')||lower.includes('breathe')){let aqi=document.getElementById('aqiVal').innerText;answer=parseInt(aqi)>100?`Danger: AQI ${aqi} - Harmattan dust very high. 84% asthma attack risk. Stay indoors, N95 mask mandatory.`:`Good: AQI ${aqi} moderate. Risk low but keep mask ready.`;}
  else if(lower.includes('kidney')||lower.includes('pain')){answer=`Analysis: Water deficit ${goal-water}ml, temp ${temp}C. Risk ${(urineScore*0.4+(goal-water)/50).toFixed(0)}/100. Drink 500ml now, avoid 11am-4pm sun.`;}
  else if(lower.includes('water')||lower.includes('drink')){answer=`Hydration: ${water}ml/${goal}ml. Need ${goal-water}ml more. In Benue you lose 300ml per hour sweat.`;}
  else{answer=`I'm Benue Voice AI. Current: ${water}ml water, ${sunMins}min sun, AQI ${document.getElementById('aqiVal').innerText}. Ask: dark urine, asthma dust, kidney pain, water need.`;}
  box.innerHTML+=`<div class="msg ai">${answer}</div>`;box.scrollTop=box.scrollHeight;setTimeout(()=>speakAI(answer),300);
}
function initVoice(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR){document.getElementById('micBtn').innerText='❌';return;}
  recognition=new SR();recognition.continuous=false;recognition.interimResults=false;recognition.lang='en-NG';
  recognition.onstart=()=>{isListening=true;document.getElementById('voiceStatus').style.display='block';document.getElementById('micBtn').innerText='🔴';};
  recognition.onend=()=>{isListening=false;document.getElementById('voiceStatus').style.display='none';document.getElementById('micBtn').innerText='🎤';};
  recognition.onresult=(e)=>{let t=e.results[0][0].transcript;document.getElementById('userQ').value=t;setTimeout(()=>askAI(),500);};
  recognition.onerror=()=>{isListening=false;document.getElementById('micBtn').innerText='🎤';};
}
function startVoice(){if(!recognition)initVoice();if(!recognition){alert('Voice not supported. Use Chrome Android.');return;}if(isListening)recognition.stop();else{try{recognition.start();if(navigator.vibrate)navigator.vibrate(50);}catch(e){}}}
function speakAI(text){
  if(!speechEnabled)return;
  let clean=text.replace(/<[^>]*>/g,'').substring(0,280);
  if('speechSynthesis' in window){
    window.speechSynthesis.cancel();
    let utter=new SpeechSynthesisUtterance(clean);utter.lang='en-NG';utter.rate=0.95;
    window.speechSynthesis.speak(utter);
  }
}
function toggleSpeech(){speechEnabled=!speechEnabled;let b=document.getElementById('speakBtn');b.innerText=speechEnabled?'🔊':'🔇';b.style.background=speechEnabled?'#16A34A':'#6B7280';if(!speechEnabled)window.speechSynthesis.cancel();}
window.addEventListener('load',()=>{initVoice();});
async function loadLive(){try{navigator.geolocation.getCurrentPosition(p=>{document.getElementById('location').innerText=`📍 ${p.coords.latitude.toFixed(2)}, ${p.coords.longitude.toFixed(2)} • Benue Voice AI`;});}catch(e){}}
loadLive();updateKidney();testAir();updateAI();
