const chat = document.getElementById("chat");
const input = document.getElementById("input");
const send = document.getElementById("send");
const clear = document.getElementById("clear");
const toggle = document.getElementById("toggle");

const API_KEY = "AIzaSyCf0cmGFkjx0CLJsl7Y5nqi9-lGt04y2KY";

let history = JSON.parse(localStorage.getItem("chat_history")) || [];

function timeStamp(){
const now = new Date();
return now.toLocaleTimeString([], {hour:"2-digit",minute:"2-digit"});
}

function addMessage(text,role){

const msg = document.createElement("div");
msg.classList.add("message",role);

msg.innerHTML = `
<div>${text}</div>
<div class="time">${timeStamp()}</div>
`;

chat.appendChild(msg);
chat.scrollTop = chat.scrollHeight;

}

history.forEach(m=>addMessage(m.text,m.role));

async function sendMessage(){

const text = input.value.trim();
if(!text) return;

addMessage(text,"user");

history.push({role:"user",text:text});
localStorage.setItem("chat_history",JSON.stringify(history));

input.value="";

const typing = document.createElement("div");
typing.classList.add("message","bot");
typing.innerText="AI typing...";
chat.appendChild(typing);

try{

const res = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body:JSON.stringify({
contents:[
{
parts:[{text:text}]
}
]
})
}
);

const data = await res.json();

typing.remove();

let reply="No response";

if(data.candidates){
reply=data.candidates[0].content.parts[0].text;
}

addMessage(reply,"bot");

history.push({role:"bot",text:reply});
localStorage.setItem("chat_history",JSON.stringify(history));

}catch(err){

typing.remove();
addMessage("⚠️ API error","bot");
console.log(err);

}

}

send.addEventListener("click",sendMessage);

input.addEventListener("keypress",e=>{
if(e.key==="Enter") sendMessage();
});

clear.addEventListener("click",()=>{
chat.innerHTML="";
history=[];
localStorage.removeItem("chat_history");
});

toggle.addEventListener("click",()=>{

document.body.classList.toggle("light");

if(document.body.classList.contains("light")){
toggle.innerText="☀️";
}else{
toggle.innerText="🌙";
}

});
