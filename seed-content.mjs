import { projects, films } from './data.js';

// Initial copy is preserved from archive/console-2026-11-03/index.html.
// Existing saved content is never replaced by this seed on startup.
export function createSeedContent() {
  return migrateContent({
    revision: 1,
    profile: {
      name: 'Shravan V Moodlu', shortName: 'SVM', role: 'Software engineer. Visual storyteller.',
      location: 'Sagara, Karnataka, India', kicker: 'A curious mind. An original broadcast.',
      homeTitle: 'The Shravan Show',
      homeSubtitle: 'Software engineer. Visual storyteller.',
      portrait: '/assets/hero-campaign-v2.png', resume: '/assets/Shravan-V-Moodlu-Resume.pdf',
      footer: 'SHRAVAN V MOODLU / MADE WITH INTENT'
    },
    appearance: {
      wallImage: '/assets/retro-room.png', posterLeft: '', posterRight: '', accent: '#bb482c',
      cream: '#ead4a7', ink: '#252b26', teal: '#315653', wood: '#643920',
      buttonColor: '#bc9c61', screenColor: '#e4c998', fontFamily: 'retro', scanlines: true,
      transitionMs: 450, soundEnabled: false
    },
    channels: [
      {id:'home',label:'Home',subtitle:'Code × camera',color:'#d76b35',enabled:true},
      {id:'work',label:'Engineering',subtitle:'Ideas, built into systems',color:'#6a7953',enabled:true},
      {id:'films',label:'Films',subtitle:'Behind the frame',color:'#377c79',enabled:true},
      {id:'about',label:'About',subtitle:'The person behind the work',color:'#ad694e',enabled:true},
      {id:'skills',label:'The toolkit',subtitle:'From interface to infrastructure',color:'#9a8451',enabled:true},
      {id:'journey',label:'Journey',subtitle:'Built by doing',color:'#756483',enabled:true},
      {id:'contact',label:'Say hello',subtitle:"Let's make it matter",color:'#d76b35',enabled:true}
    ],
    projects: projects.map(project => ({...structuredClone(project), thumbnail:'', enabled:true})),
    films: films.map((film,index) => ({...film,id:`film-${String(index+1).padStart(2,'0')}`,file:`/assets/${film.file}`,poster:`/assets/${film.poster}`,description:'',enabled:true})),
    about: {
      title: 'Curiosity is the common thread.', intro:'I build where ideas meet engineering.',
      paragraphs: [
        "I'm a full-stack developer and AI/ML builder working across backend architecture, distributed systems, product interfaces and computer vision.",
        'I like understanding the problem deeply, then finding a clear, dependable way forward. Outside the code, I explore that same process through a camera, a performance or an edit.',
        'Through Captcha and Pixel, I contribute across the production process—from performance and the shoot to behind-the-scenes capture and the edit.'
      ], portrait:'/assets/hero-campaign-v2.png',signature:'/assets/signature-transparent-v2.png'
    },
    skills: [
      {title:'Backend engineering',description:'Production APIs, authentication, validation, relational models and event-driven workflows designed for clarity under growth.',tools:['Node.js','FastAPI','Express','PostgreSQL','Prisma','Redis','Socket.IO']},
      {title:'AI & computer vision',description:'Research-minded models carried into usable applications, with evaluation, safeguards and understandable outputs.',tools:['PyTorch','TensorFlow','Keras','OpenCV','YOLO','MediaPipe','ResNet-50']},
      {title:'Product development',description:'Responsive web products, multi-tenant workflows and role-aware interfaces connected to dependable service layers.',tools:['React','Next.js','TypeScript','REST','JWT','Real-time UX']},
      {title:'Quality & delivery',description:'Testing and deployment practices that make complex systems safer to change and easier to inspect.',tools:['Docker','Playwright','Unit tests','Integration tests','Git','CI/CD']}
    ],
    journey: [
      {period:'FEB 2026 — PRESENT',title:'Software Developer Intern',organization:'Shiktra Technologies LLP',description:'Building full-stack product workflows across React, Node.js, FastAPI, PostgreSQL, real-time updates and automated testing.',type:'Experience'},
      {period:'2023 — 2027',title:'B.E. Information Science & Engineering',organization:'Mangalore Institute of Technology & Engineering',description:'CGPA 8.38 / 10. Exploring software engineering, machine learning, computer vision and system design.',type:'Education'},
      {period:'BEYOND THE CLASSROOM',title:'Team lead. Core member.',organization:'MITE First Ideathon · Pixel Club',description:"Leading AarogyaLink's ideathon presentation and contributing to workshops, coding events, hackathons and peer learning.",type:'Leadership'},
      {period:'CONTINUOUS LEARNING',title:'Learning, then applying.',organization:'NPTEL Elite · Oracle AI Foundations',description:'Soft computing, cloud AI fundamentals and applied GenAI data analytics.',type:'Certifications'}
    ],
    contact: {
      title:'A good idea starts with a hello.',description:"A problem worth solving. A story worth telling. I'd love to hear what you have in mind.",
      email:'svmoodlu198@gmail.com',github:'https://github.com/Shravan198m',linkedin:'https://www.linkedin.com/in/shravan-v-moodlu-a19a582a5/',
      resume:'/assets/Shravan-V-Moodlu-Resume.pdf',label:"Let's talk"
    },
    posters: [
      {title:'BUILT / NOT BOUGHT',subtitle:'SOFTWARE / AI / SYSTEMS',image:'',channel:'work',enabled:true},
      {title:'PICTURES / IN MOTION',subtitle:'ACT / SHOOT / CAPTURE / EDIT',image:'',channel:'films',enabled:true}
    ]
  });
}

export function migrateContent(doc){
  const legacy=!Object.hasOwn(doc,'quotes');
  if(!Object.hasOwn(doc,'quotes'))doc.quotes=[
    ['Begin with curiosity. Keep going with care.','left'],['Small steps become work worth sharing.','right'],['Make something useful. Make it your own.','left'],['The next good idea starts with a question.','right']
  ].map(([text,side],i)=>({id:`quote-${i+1}`,text,side,duration:10,frame:i%2?'brass':'wood',font:'serif',color:'#35291d',background:'#e7d5ad',fontSize:24,enabled:true}));
  if(!Object.hasOwn(doc,'services'))doc.services=[
    {title:'Websites with a clear purpose',description:'Responsive portfolio and business websites, with thoughtful design and a practical editing workflow. We agree the pages and features before building.'},
    {title:'Software and AI prototypes',description:'I build web applications and explore AI features where they solve a real problem. A small prototype helps us test an idea before committing to a larger build.'},
    {title:'Visual storytelling',description:'Video editing and creative presentation for ideas that need a visual voice. We start with your audience, references and the message you want to communicate.'},
    {title:'A straightforward process',description:'We discuss the brief, agree scope and milestones, review the first version together, then test and hand over the work. Send your idea, timeline and priorities to start the conversation.'}
  ];
  if(!Object.hasOwn(doc,'reviews'))doc.reviews=[];
  if(Array.isArray(doc.channels)&&!doc.channels.some(c=>c.id==='services'))doc.channels.push({id:'services',label:'Work with me',subtitle:'Ideas into useful work',color:'#826d48',enabled:true});
  if(legacy)for(const project of doc.projects||[]){if(['glaucoma','interview','underwater','aarogya','labcode'].includes(project.id)&&!project.thumbnail)project.thumbnail=`/assets/project-${project.id}.svg`;if(project.id==='glaucoma')for(const link of project.links||[])if(link.href==='https://glucoma-lyart.vercel.app/')link.href='https://glaucoma-kprx.vercel.app/';}
  return doc;
}
