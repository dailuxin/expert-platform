const fs = require('fs');
const p = String.raw`C:\Users\dailu\Desktop\expert-platform\public\index.html`;
let html = fs.readFileSync(p, 'utf8');

// Replace showBooking function with calendar view
const oldShowBooking = `function showBooking(expertId){const today=new Date().toISOString().split("T")[0];openModal("<h3>预约咨询</h3><div class=\\"form-group\\"><label>预约日期</label><input type=\\"date\\" id=\\"bookingDate\\" min=\\""+today+"\\"></div><div class=\\"form-group\\"><label>预约时间</label><input type=\\"time\\" id=\\"bookingTime\\" value=\\"09:00\\"></div><div class=\\"form-group\\"><label>咨询时长（分钟）</label><input type=\\"number\\" id=\\"bookingDuration\\" value=\\"60\\" min=\\"30\\" max=\\"180\\"></div><div class=\\"form-group\\"><label>咨询主题</label><textarea id=\\"bookingTopic\\" placeholder=\\"简要描述...\\"></textarea></div><button class=\\"btn btn-primary\\" onclick=\\"submitBooking("+expertId+")\\">提交预约</button>");}`;

if (!html.includes(oldShowBooking)) {
  console.log('Old showBooking not found, checking current...');
  const sbIdx = html.indexOf('function showBooking(');
  if (sbIdx > 0) {
    console.log('showBooking at:', sbIdx);
    console.log('Context:', JSON.stringify(html.substring(sbIdx, sbIdx + 100)));
  }
  process.exit(1);
}

const newShowBooking = `function showBooking(expertId){window._bookingExpertId=expertId;window._bookingYear=new Date().getFullYear();window._bookingMonth=new Date().getMonth();openModal("<h3>预约咨询</h3><div class=\\"calendar-view\\" id=\\"calView\\"><div class=\\"calendar-header\\"><button onclick=\\"calPrev()\\">◀</button><h4 id=\\"calTitle\\"></h4><button onclick=\\"calNext()\\">▶</button></div><div class=\\"calendar-grid\\" id=\\"calGrid\\"></div><div class=\\"time-slots\\" id=\\"timeSlots\\" style=\\"display:none\\"></div></div><div class=\\"form-group\\" style=\\"margin-top:16px\\"><label>咨询时长（分钟）</label><input type=\\"number\\" id=\\"bookingDuration\\" value=\\"60\\" min=\\"30\\" max=\\"180\\"></div><div class=\\"form-group\\"><label>咨询主题</label><textarea id=\\"bookingTopic\\" placeholder=\\"简要描述...\\"></textarea></div><button class=\\"btn btn-primary\\" id=\\"submitBookingBtn\\" onclick=\\"submitBooking("+expertId+")\\" disabled>请选择日期和时间</button>");renderCalendar();}

function renderCalendar(){const y=window._bookingYear,m=window._bookingMonth;const title=document.getElementById("calTitle");if(title)title.textContent=y+"年"+(m+1)+"月";const grid=document.getElementById("calGrid");if(!grid)return;const firstDay=new Date(y,m,1).getDay();const daysInMonth=new Date(y,m+1,0).getDate();const today=new Date();let h="";const dayNames=["日","一","二","三","四","五","六"];for(const d of dayNames)h+='<div class="day-header">'+d+'</div>';for(let i=0;i<firstDay;i++)h+='<div class="day-cell disabled"></div>';for(let d=1;d<=daysInMonth;d++){const date=new Date(y,m,d);const isPast=date<new Date(today.getFullYear(),today.getMonth(),today.getDate());const isToday=date.toDateString()===today.toDateString();const dateStr=y+"-"+String(m+1).padStart(2,"0")+"-"+String(d).padStart(2,"0");h+='<div class="day-cell'+(isPast?" disabled":"")+(isToday?" today":"")+'" onclick=\\"selectCalDay(\\''+dateStr+'\\'',this)\\" data-date=\\"'+dateStr+'\\">'+d+'</div>';}grid.innerHTML=h;}

function selectCalDay(dateStr,el){document.querySelectorAll(".day-cell.selected").forEach(e=>e.classList.remove("selected"));if(el)el.classList.add("selected");window._bookingDate=dateStr;document.getElementById("timeSlots").style.display="flex";document.getElementById("timeSlots").innerHTML='<div style="width:100%;text-align:center;color:#718096;padding:12px">加载可预约时段...</div>';loadTimeSlots(dateStr);}

async function loadTimeSlots(dateStr){const expertId=window._bookingExpertId;if(!expertId)return;try{const r=await api("/expert/slots?expert_id="+expertId+"&date="+dateStr);const el=document.getElementById("timeSlots");if(!el)return;if(!r.slots||!r.slots.length){el.innerHTML='<div style="width:100%;text-align:center;color:#a0aec0;padding:12px">该日期暂无可预约时段</div>';return;}let h="";const booked=r.booked||[];for(const s of r.slots){const isBooked=booked.includes(s);h+='<div class="time-slot'+(isBooked?" booked":"")+'" '+(isBooked?"":'onclick="selectTimeSlot(\\''+s+'\\',this)"')+'>'+s+'</div>';}el.innerHTML=h;}catch(e){document.getElementById("timeSlots").innerHTML='<div style="width:100%;text-align:center;color:#e53e3e;padding:12px">加载失败</div>';}}

function selectTimeSlot(time,el){document.querySelectorAll(".time-slot.selected").forEach(e=>e.classList.remove("selected"));if(el)el.classList.add("selected");window._bookingTime=time;const btn=document.getElementById("submitBookingBtn");if(btn){btn.disabled=false;btn.textContent="提交预约";}}

function calPrev(){window._bookingMonth--;if(window._bookingMonth<0){window._bookingMonth=11;window._bookingYear--;}renderCalendar();}
function calNext(){window._bookingMonth++;if(window._bookingMonth>11){window._bookingMonth=0;window._bookingYear++;}renderCalendar();}`;

html = html.replace(oldShowBooking, newShowBooking);
console.log('Calendar booking view added');

// Also update submitBooking to use window._bookingDate and window._bookingTime
const oldSubmit = `async function submitBooking(expertId){const d=document.getElementById("bookingDate").value,t=document.getElementById("bookingTime").value;`;
if (html.includes(oldSubmit)) {
  html = html.replace(oldSubmit, `async function submitBooking(expertId){const d=window._bookingDate||document.getElementById("bookingDate").value,t=window._bookingTime||document.getElementById("bookingTime").value;`);
  console.log('submitBooking updated for calendar');
} else {
  console.log('submitBooking old code not found');
}

fs.writeFileSync(p, html, 'utf8');
console.log('Saved');
