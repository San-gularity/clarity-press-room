const stage = document.querySelector("#stage");
const plays = [
  {type:"Direct answer", points:0, reputation:8, effect:"A clear commitment wins some trust."},
  {type:"Vague answer", points:1, reputation:-3, effect:"You left room to maneuver, but the press wanted a detail."},
  {type:"Topic pivot", points:2, reputation:-8, effect:"You changed the subject. The room noticed."},
  {type:"Open refusal", points:0, reputation:-10, effect:"Declining outright costs trust and earns no dodge points."}
];
let round, position, points, reputation, locked;
function shuffle(items) {
  const result = [...items];
  for (let i=result.length-1;i>0;i--) {
    const j=Math.floor(Math.random()*(i+1));
    [result[i],result[j]]=[result[j],result[i]];
  }
  return result;
}
function action(label, handler, parent=stage) {
  const button=document.createElement("button");
  button.className="action";button.textContent=label;button.onclick=handler;parent.append(button);
}
function intro() {
  stage.innerHTML='<div class="intro"><p class="eyebrow">A political Q&amp;A game</p><h1>Dodge the question.<br>Keep the room.</h1><p>You’re at the podium. Ten reporters want a straight answer. Pick one of four replies each time.</p><div class="rules"><strong>Finish with 7 dodge points and at least 35 reputation.</strong><p>You start at 55 reputation. A vague reply earns 1 point and costs 3 reputation. A pivot earns 2 and costs 8. A direct answer restores 8. A refusal costs 10.</p></div><p class="muted">After each reply, the project’s classifiers predict its clarity and evasion strategy. The game scores your written choice separately.</p></div>';
  action("Start briefing",start);
}
function start(){
  round=shuffle(questions).slice(0,10);position=0;points=0;reputation=55;showQuestion();
}
function status(){
  return '<div class="status"><strong>Question '+(position+1)+' / 10</strong><span>Dodge points <b>'+points+'</b></span><span>Reputation <b>'+reputation+'</b></span></div>';
}
function showQuestion(){
  locked=false;
  stage.innerHTML=status()+'<h2 tabindex="-1"></h2><div class="choices"></div>';
  const [question,...answers]=round[position];
  const title=stage.querySelector("h2");title.textContent=question;title.focus();
  shuffle(answers.map((text,i)=>({text,i}))).forEach(({text,i},order)=>{
    const btn=document.createElement("button");btn.className="choice";
    const letter=document.createElement("span");letter.className="letter";letter.textContent="ABCD"[order];
    btn.append(letter,document.createTextNode(text));
    btn.onclick=()=>selectAnswer(btn,question,text,i);
    stage.querySelector(".choices").append(btn);
  });
}
function selectAnswer(btn,question,answer,kind){
  if(locked)return;
  locked=true;
  const [clarity,strategy]=classify(question,answer);
  const play=plays[kind];
  const previousReputation=reputation;
  points+=play.points;reputation=Math.max(0,Math.min(100,reputation+play.reputation));
  btn.classList.add("selected");
  stage.querySelectorAll(".choice").forEach(b=>b.disabled=true);
  stage.querySelector(".status").outerHTML=status();
  const feedback=document.createElement("div");feedback.className="feedback";
  feedback.innerHTML='<strong>'+play.type+' · '+(play.points?'+'+play.points:'0')+' points · '+(reputation>previousReputation?'+':'')+(reputation-previousReputation)+' reputation</strong><p>'+play.effect+'</p><p>Model prediction: <b>'+clarity+'</b> / <b>'+strategy+'</b></p>';
  stage.append(feedback);
  action(position===9?"See final result":"Next question",()=>{
    if(position===9)finish();else{position++;showQuestion();}
  },feedback);
  feedback.querySelector("button").focus();
}
function finish(){
  const win=points>=7&&reputation>=35;
  stage.innerHTML='<p class="eyebrow">Briefing complete · 10 answers</p><h1>'+(win?'You kept the room.':points<7?'Too few dodges.':'Trust ran out.')+'</h1><p class="stats">'+points+' dodge points &nbsp;·&nbsp; '+reputation+' reputation</p><p>The target was 7 points and at least 35 reputation.</p><p class="muted">The classifiers read your words. Reputation follows the game rules; it measures no real audience.</p>';
  action("Play another round",start);
}
intro();
