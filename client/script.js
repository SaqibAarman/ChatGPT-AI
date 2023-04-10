import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chatContainer = document.querySelector("#chat_container");

let loadInterval;

// Loading Some [ ... ] Till We Get Result
function loader(ele) {
  ele.textContent = "";

  loadInterval = setInterval(() => {
    ele.textContent += ".";

    if (ele.textContent === "....") {
      ele.textContent = "";
    }
  }, 300);
}

// Typing Functionality Of Bot ( Displaying Result By Bot Typing On The Screen)
function typeText(ele, text) {
  let index = 0;

  let interval = setInterval(() => {
    if (index < text.length) {
      ele.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// UniqueId For Each Random Input
// generate unique ID for each message div of bot
// necessary for typing text effect for that specific reply
// without unique ID, typing text will work on every element
function generateUniqueId() {
  const timestamp = Date.now();
  const randomNum = Math.random();
  const hexaDecimalString = randomNum.toString(16);

  return `id-${timestamp}-${hexaDecimalString}`;
}

function chatStripe(isAI, value, uniqueId) {
  return (`
      <div class='wrapper ${isAI && "ai"}'>
        <div class='chat'>
          <div class='profile'>
            <img 
            src='${isAI ? bot : user}'
            alt='${isAI ? "bot" : "user"}'
            />
          </div>
          <div class='message' id=${uniqueId}>
            ${value}
          </div>

        </div>
      </div>
    `);
}

const handleSubmit = async (e) => {
  e.preventDefault();

  const data = new FormData(form);

  // User's Chat Stripe
  chatContainer.innerHTML += chatStripe(false, data.get("prompt"));
  // To Clear The Textarea Input
  form.reset();

  // Bot's ChatStripe
  const uniqueId = generateUniqueId();
  // console.log(uniqueId,'==');
  chatContainer.innerHTML += chatStripe(true, " ", uniqueId);

  // To Focus Scroll To The Bottom
  chatContainer.scrollTop = chatContainer.scrollHeight - chatContainer.clientHeight ;
  
  // Specific Message Div
  const messageDiv = document.getElementById(uniqueId);

  // messageDiv.innerHTML = "..."
  loader(messageDiv);

  // Fetch Data From Server ---> Bot's Response

  const response = await fetch("http://localhost:5000", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";

  if (response.ok) {
    const data = await response.json();
    const parseData = data.bot.trim();

    typeText(messageDiv, parseData);
  } else {
    const err = await response.text();

    messageDiv.innerHTML = "Something Went Wrong!";

    alert(err);
  }
};

// This Is Submit While Pressing (Submit) Button
form.addEventListener("submit", handleSubmit);

// This Is Submitted While We Enter "Enter" Key From Keyboard
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
