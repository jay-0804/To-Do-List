// Hero opening animation
window.addEventListener('load', ()=>{
  const initials = document.querySelector('.initials');
  const heroMain = document.querySelector('.hero-main');
  initials.style.opacity = '1';
  initials.style.transform = 'translateY(0)';
  setTimeout(()=>{
    heroMain.classList.add('show');
  },1500);
});

// Scroll to section function
function scrollToSection(id){
  document.getElementById(id).scrollIntoView({behavior:'smooth'});
}

// Projects
const projects=[
  {title:"Alien Sacrifice Cosmic Trials",short:"Sacrifice wisely, survive the cosmos! 🌌👾",img:"assets/alien-game.jpg",live:"https://jay-0804.itch.io/alien-sacrifice-cosmic-trials",code:"https://github.com/jay-0804/DayDream-Game-Development.git",tech:["HTML","CSS","JS"]},
  {title:"Tic-Tac-Toe",short:"Three in a row, endless fun to go!",img:"https://via.placeholder.com/300x200?text=Tic-Tac-Toe",live:"http://tic-tac-toe-one-mu-53.vercel.app",code:"https://github.com/jay-0804/Tic-Tac-Toe.git",tech:["HTML","CSS","JS"]},
  {title:"Neon Tunes",short:"Discover the beat, know the words.",img:"https://via.placeholder.com/300x200?text=Neon+Tunes",live:"https://astounding-gingersnap-0ddd69.netlify.app",code:"https://github.com/jay-0804/Neon-Tunes.git",tech:["HTML","CSS","JS"]},
  {title:"Gesture-Control Games",short:"Hands-free gaming: Play your favorite games with just a wave!",img:"https://via.placeholder.com/300x200?text=Gesture+Games",live:"#",code:"https://github.com/jay-0804/Gesture-Control-Games.git",tech:["Python","OpenCV"]},
  {title:"To-Do List",short:"A productivity companion that turns everyday tasks into achievable goals with points, progress tracking, and rewarding completions.",img:"https://via.placeholder.com/300x200?text=To-Do+List",live:"https://to-do-list-tau-ten-19.vercel.app/",code:"https://github.com/jay-0804/To-Do-List.git",tech:["HTML","CSS","JS"]}
];

let currentIndex=0;
const perPage=2;
const projectGrid=document.getElementById('projectGrid');
const nextPage=document.getElementById('nextPage');

function renderProjects(){
  const end=Math.min(currentIndex+perPage,projects.length);
  for(let i=currentIndex;i<end;i++){
    const p=projects[i];
    const card=document.createElement('div');
    card.className='project-card';
    card.innerHTML=`
      <h3>${p.title}</h3>
      <p>${p.short}</p>
      <p><strong>Tech:</strong> ${p.tech.join(", ")}</p>
      <a href="${p.live}" target="_blank" class="btn solid">Live</a>
      <a href="${p.code}" target="_blank" class="btn solid">Code</a>
    `;
    projectGrid.appendChild(card);
  }
  currentIndex+=perPage;
  if(currentIndex>=projects.length) nextPage.disabled=true;

  // Smooth scroll to newly added projects
  projectGrid.scrollBy({left:400, behavior:'smooth'});
}
nextPage.addEventListener('click',renderProjects);
renderProjects();

// Scroll animation for sections
const sections=document.querySelectorAll('.section');
const observer=new IntersectionObserver(entries=>{
  entries.forEach(entry=>{
    if(entry.isIntersecting) entry.target.classList.add('show');
  });
},{threshold:0.2});
sections.forEach(sec=>observer.observe(sec));

// Mobile menu
const hamburger=document.getElementById('hamburger');
const mobileMenu=document.getElementById('mobileMenu');
const closeMobile=document.getElementById('closeMobile');
hamburger.addEventListener('click',()=>{mobileMenu.style.display='flex';});
closeMobile.addEventListener('click',()=>{mobileMenu.style.display='none';});

// Contact form
const contactForm=document.getElementById('contactForm');
const formMsg=document.getElementById('formMsg');
contactForm.addEventListener('submit',(e)=>{
  e.preventDefault();
  const name=document.getElementById('name').value.trim();
  const email=document.getElementById('email').value.trim();
  const message=document.getElementById('message').value.trim();
  if(!name || !email || !message){
    formMsg.textContent="Please fill all fields.";
    return;
  }
  window.location.href=`mailto:baidnaman12@gmail.com?subject=Portfolio%20Message%20from%20${encodeURIComponent(name)}&body=${encodeURIComponent(message + "\n\nFrom: "+name+" | "+email)}`;
  formMsg.textContent="Opening email client...";
  contactForm.reset();
});
