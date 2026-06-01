const fs = require('fs');
const p = 'C:\\Users\\dailu\\Desktop\\expert-platform\\public\\index.html';
let html = fs.readFileSync(p, 'utf8');

// Find and replace showBooking
const oldSB = `function showBooking(expertId){const today=new Date().toISOString().split("T")[0];openModal("<h3>预约咨询</h3><div class=\\"form-group\\"><label>预约日期</label><input type=\\"date\\" id=\\"bookingDate\\" min=\\""+today+"\\"></div><div class=\\"form-group\\"><label>预约时间</label><input type=\\"time\\" id=\\"bookingTime\\" value=\\"09:00\\"></div><div class=\\"form-group\\"><label>咨询时长（分钟）</label><input type=\\"number\\" id=\\"bookingDuration\\" value=\\"60\\" min=\\"30\\" max=\\"180\\"></div><div class=\\"form-group\\"><label>咨询主题</label><textarea id=\\"bookingTopic\\" placeholder=\\"简要描述...\\"></textarea></div><button class=\\"btn btn-primary\\" onclick=\\"submitBooking("+expertId+")\\">提交预约</button>");}`;

if (!html.includes(oldSB)) {
  console.log('showBooking not found, checking...');
  const idx = html.indexOf('function showBooking(');
  if (idx > 0) console.log('At:', idx, JSON.stringify(html.substring(idx, idx+80)));
  process.exit(1);
}

const newSB = `function showBooking(expertId){window._bExp=expertId;window._bY=new Date().getFullYear();window._bM=new Date().getMonth();openModal("<h3>预约咨询</h3><div class=\\"calendar-view\\"><div class=\\"cal-header\\"><button onclick=\\"calNav(-1)\\">◀</button><h4 id=\\"calTitle\\"></h4><button onclick=\\"calNav(1)\\">▶</button></div><div class=\\"cal-grid\\" id=\\"calGrid\\"></div><div class=\\"time-slots\\" id=\\"timeSlots\\" style=\\"display:none\\"></div></div><div class=\\"form-group\\" style=\\"margin-top:16px\\"><label>咨询时长（分钟）</label><input type=\\"number\\" id=\\"bookingDuration\\" value=\\"60\\" min=\\"30\\" max=\\"180\\"></div><div class=\\"form-group\\"><label>咨询主题</label><textarea id=\\"bookingTopic\\" placeholder=\\"简要描述...\\"></textarea></div><button class=\\"btn btn-primary\\" id=\\"submitBookingBtn\\" onclick=\\"submitBooking("+expertId+")\\" disabled>请选择日期和时间</button>");renderCal();}

function renderCal(){const y=window._bY,m=window._bM;const t=document.getElementById("calTitle");if(t)t.textContent=y+"年"+(m+1)+"月";const g=document.getElementById("calGrid");if(!g)return;const fd=new Date(y,m,1).getDay();const dim=new Date(y,m+1,0).getDate();const today=new Date();let h="";const dn=["日","一","二","三","四","五","六"];for(const d of dn)h+='<div class="day-hdr">'+d+'</div>';for(let i=0;i<fd;i++)h+='<div class="day-c dis"></div>';for(let d=1;d<=dim;d++){const dt=new Date(y,m,d);const past=dt<new Date(today.getFullYear(),today.getMonth(),today.getDate());const isT=dt.toDateString()===today.toDateString();const ds=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");h+='<div class="day-c'+(past?" dis":"")+(isT?" today":"")+'" onclick=\\"pickDay(\\''+ds+'\\',this)\\" data-d=\\"'+ds+'\\">'+d+'</div>';}g.innerHTML=h;}

function pickDay(ds,el){document.querySelectorAll(".day-c.sel").forEach(function(e){e.classList.remove("sel")});if(el)el.classList.add("sel");window._bDate=ds;var ts=document.getElementById("timeSlots");ts.style.display="flex";ts.innerHTML='<div style="width:100%;text-align:center;color:#718096;padding:12px">加载中...</div>';loadSlots(ds);}

async function loadSlots(ds){var eid=window._bExp;if(!eid)return;try{var r=await api("/expert/slots?expert_id="+eid+"&date="+ds);var el=document.getElementById("timeSlots");if(!el)return;if(!r.slots||!r.slots.length){el.innerHTML='<div style="width:100%;text-align:center;color:#a0aec0;padding:12px">该日期暂无可用时段</div>';return;}var h="";var booked=r.booked||[];for(var i=0;i<r.slots.length;i++){var s=r.slots[i];var isB=booked.indexOf(s)>=0;h+='<div class="ts'+(isB?" booked":"")+'" '+(isB?"":'onclick="pickTime(\\''+s+'\\',this)"')+'>'+s+'</div>';}el.innerHTML=h;}catch(e){document.getElementById("timeSlots").innerHTML='<div style="width:100%;text-align:center;color:#e53e3e;padding:12px">加载失败</div>';}}

function pickTime(t,el){document.querySelectorAll(".ts.sel").forEach(function(e){e.classList.remove("sel")});if(el)el.classList.add("sel");window._bTime=t;var btn=document.getElementById("submitBookingBtn");if(btn){btn.disabled=false;btn.textContent="提交预约";}}

function calNav(dir){window._bM+=dir;if(window._bM>11){window._bM=0;window._bY++;}else if(window._bM<0){window._bM=11;window._bY--;}renderCal();}`;

html = html.replace(oldSB, newSB);
console.log('Calendar booking added');

// Update submitBooking to use window vars
const oldSub = `async function submitBooking(expertId){const d=document.getElementById("bookingDate").value,t=document.getElementById("bookingTime").value;`;
if (html.includes(oldSub)) {
  html = html.replace(oldSub, `async function submitBooking(expertId){const d=window._bDate||document.getElementById("bookingDate").value,t=window._bTime||document.getElementById("bookingTime").value;`);
  console.log('submitBooking updated');
}

// Validate
const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
let match;
while ((match = scriptRegex.exec(html)) !== null) {
  const code = match[1].trim();
  if (code && code.length > 10000) {
    try {
      new Function(code);
      console.log('Syntax OK');
    } catch (e) {
      console.log('Syntax ERROR:', e.message);
    }
  }
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
