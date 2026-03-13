const chat = document.getElementById("chat");
const input = document.getElementById("input");
const sendBtn = document.getElementById("sendBtn");
const toggleTheme = document.getElementById("toggleTheme");
const clearChat = document.getElementById("clearChat");

// 🔑 Put your Gemini API key here
const API_KEY = "AIzaSyB_0uDcMNa2tuBcEbQsV53V1k4p5tZb-1I";

let history = JSON.parse(localStorage.getItem("chat_history")) || [];

function timeStamp(){
    const now = new Date();
    return now.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
}

function addMessage(text, role){

    const msg = document.createElement("div");
    msg.classList.add("message", role);

    msg.innerHTML = `
    <div>${text}</div>
    <div class="time">${timeStamp()}</div>
    `;

    chat.appendChild(msg);
    chat.scrollTop = chat.scrollHeight;
}

// Load old chat from localStorage
history.forEach(m => addMessage(m.text, m.role));

async function sendMessage(){

    const userText = input.value.trim();

    if(userText === "") return;

    addMessage(userText,"user");

    history.push({
        role:"user",
        text:userText
    });

    input.value="";

    const typing = document.createElement("div");
    typing.classList.add("typing");
    typing.innerText="Bot is typing...";
    chat.appendChild(typing);

    try{

        const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`,
        {
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
            body:JSON.stringify({
                contents:[
                    {
                        parts:[
                            {text:userText}
                        ]
                    }
                ]
            })
        });

        const data = await response.json();

        console.log(data); // debugging

        typing.remove();

        let reply = "No response";

        if (data.candidates && data.candidates.length > 0) {
        const parts = data.candidates[0].content.parts;
        reply = parts.map(p => p.text).join("");
        }

        addMessage(reply,"bot");

        history.push({
            role:"bot",
            text:reply
        });

        localStorage.setItem("chat_history", JSON.stringify(history));

    }
    catch(error){

        console.error(error);

        typing.remove();

        addMessage("API error. Check your Gemini API key.","bot");

    }

}

sendBtn.addEventListener("click", sendMessage);

input.addEventListener("keypress", (e)=>{
    if(e.key === "Enter"){
        sendMessage();
    }
});

toggleTheme.addEventListener("click", ()=>{
    document.body.classList.toggle("light");
});

clearChat.addEventListener("click", ()=>{
    chat.innerHTML="";
    history=[];
    localStorage.removeItem("chat_history");
});
