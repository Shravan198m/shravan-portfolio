export const projects = [
  {
    id: 'glaucoma', number: '01', title: 'Hybrid Glaucoma Screening', category: 'HEALTHCARE AI', year: '2025—26', theme: 'olive', icon: 'eye',
    summary: 'Two kinds of retinal evidence. One more considered decision.',
    description: 'A hybrid screening approach that combines visual and structural retinal evidence, with a conformal safety net for uncertain cases.',
    role: 'Team lead · Team of 4', tags: ['ResNet-50', 'FastAPI', 'React'],
    metric: '87.21%', metricLabel: 'FUSED TEST ACCURACY',
    overview: 'I led a four-person team combining image-based and structural retinal features for glaucoma screening. Rather than forcing a prediction in every case, the system routes uncertain results for manual review.',
    approach: 'Training used 7,618 retinal images. Evaluation on a separate 1,353-image test set reported a rise from 82.71% to 87.21% accuracy, with 89.57% sensitivity and 85.80% specificity. The uncertainty safeguard referred 26 cases (1.92%) for manual review.',
    note: 'Academic project results from the supplied résumé; these are evaluation results, not a clinical validation claim.',
    flow: ['Retinal input', 'Visual + structural features', 'Evidence fusion', 'Prediction / referral'],
    stack: ['ResNet-50', 'TensorFlow', 'Keras', 'FastAPI', 'React', 'Conformal prediction'],
    links: [{label:'View source',href:'https://github.com/Shravan198m/glaucoma_project'},{label:'Open demo',href:'https://glucoma-lyart.vercel.app/'}]
  },
  {
    id: 'interview', number: '02', title: 'AI Interview Platform', category: 'DISTRIBUTED SYSTEMS', year: '2025—26', theme: 'rust', icon: 'network',
    summary: 'Six services. A connected interview experience.',
    description: 'Interview orchestration, code execution and real-time computer-vision proctoring, built as a six-service system.',
    role: 'Individual project', tags: ['Next.js', 'YOLO', 'Redis'], metric: '06', metricLabel: 'INDEPENDENT SERVICES',
    overview: 'An individual full-stack project bringing interview workflows, live proctoring, evaluation and code execution together through a service-based architecture.',
    approach: 'The platform separates authentication, interview orchestration, proctoring, evaluation, code execution and notifications. Computer-vision components use YOLO and MediaPipe; PostgreSQL and Redis support the application data and service workflows.',
    note: 'The diagram summarises the service responsibilities described in my résumé; it is not a deployment topology.',
    flow: ['Authentication', 'Orchestration', 'Proctoring', 'Evaluation', 'Code execution', 'Notifications'],
    stack: ['Next.js', 'FastAPI', 'PostgreSQL', 'Redis', 'YOLO', 'MediaPipe', 'Docker'],
    links: [{label:'View source',href:'https://github.com/Shravan198m/INTERVIEW-APPLICTION'},{label:'View demo files',href:'https://drive.google.com/drive/folders/1gdI7vjtrOWVZarVuTRNYMzxSeXhls47B?usp=sharing'}]
  },
  {
    id: 'underwater', number: '03', title: 'Underwater Image Enhancement', category: 'REINFORCEMENT LEARNING', year: '2025', theme: 'teal', icon: 'waves',
    summary: 'Learning to see beneath the surface.',
    description: 'A physics-informed DQN learns a sequence of image corrections to recover visibility and colour.',
    role: 'Team of 3', tags: ['PyTorch', 'DQN', 'OpenCV'], metric: '+43.3%', metricLabel: 'UIQM IMPROVEMENT',
    overview: 'A team project exploring how reinforcement learning can select image corrections rather than relying on one fixed enhancement pipeline.',
    approach: 'A 10-dimensional visual state informs a Deep Q-Network. Available corrections include white balance, CLAHE, gamma correction, denoising, dehazing and colour compensation. On 649 test images, UIQM improved from 46.43 to 66.55 (+43.3%), and UCIQE from 24.36 to 29.70 (+21.9%).',
    note: 'Reported image-quality metrics are from the supplied résumé and apply to the evaluated test set.',
    flow: ['Underwater image', 'Visual state', 'DQN correction policy', 'Enhanced image'], stack: ['PyTorch', 'Deep Q-Network', 'OpenCV', 'Image processing'],
    links: [{label:'View source',href:'https://github.com/sumukha2005/underwaterImageEnhancement'},{label:'View sample images',href:'https://drive.google.com/drive/folders/13UpTWRZlys0oKSBlAFsi__--NlRc3uqf?usp=drive_link'}]
  },
  {
    id: 'aarogya', number: '04', title: 'AarogyaLink', category: 'DIGITAL HEALTH CONCEPT', year: '2025', theme: 'plum', icon: 'cross',
    summary: 'Healthcare information, connected with care.',
    description: 'An ideathon concept for secure healthcare records, verified access and offline-first synchronisation.',
    role: 'Team lead · MITE First Ideathon', tags: ['Flutter', 'Node.js', 'PostgreSQL'], metric: '01', metricLabel: 'IDEATHON CONCEPT',
    overview: 'I led the AarogyaLink presentation at the MITE First Ideathon, exploring a connected approach to healthcare records and role-aware access.',
    approach: 'The concept brings together verified roles, encrypted sharing, emergency access and offline-first synchronisation. Flutter, Node.js and PostgreSQL form the proposed technology direction recorded in the existing portfolio.',
    note: 'Presented as an ideathon concept. The listed capabilities describe the proposal, not a deployed healthcare service.',
    flow: ['Verified roles', 'Healthcare records', 'Controlled sharing', 'Offline sync'], stack: ['Flutter (proposed)', 'Node.js (proposed)', 'PostgreSQL (proposed)'], links: []
  },
  {
    id: 'labcode', number: '05', title: 'LabCode', category: 'ACADEMIC PLATFORM', year: 'ONGOING', theme: 'sand', icon: 'code',
    summary: 'From a submission to a meaningful result.',
    description: 'Backend workflows for programming problems, submissions, evaluations and marks across academic domains.',
    role: 'Backend contributor · Team of 3', tags: ['REST APIs', 'Validation', 'Testing'], metric: 'IN BUILD', metricLabel: 'ONGOING PROJECT',
    overview: 'An ongoing three-person project supporting programming practice and evaluation through structured academic workflows.',
    approach: 'My work covers problem and submission management, DTO validation, evaluation and marks, academic domain modelling, and unit and integration testing. The focus is a backend that is understandable and reliable as the workflows grow.',
    note: 'Ongoing work. No production adoption or completion figures are claimed.',
    flow: ['Problem', 'Submission', 'Validation + evaluation', 'Marks'], stack: ['REST APIs', 'DTO validation', 'Domain modelling', 'Unit tests', 'Integration tests'],
    links: [{label:'View source',href:'https://github.com/sumukha2005/LabCode'}]
  }
];

export const films = [
  {title:'Offline',role:'Shoot · Edit',duration:'00:19',file:'film-01-offline.mp4',poster:'film-01-offline-poster.jpg',format:'Portrait',alt:'Stone path under an overcast sky'},
  {title:'College Stage',role:'Event · Behind the scenes',duration:'00:33',file:'film-02-stage.mp4',poster:'film-02-stage-poster.jpg',format:'Landscape',alt:'Performers on a college stage'},
  {title:'Kitchen Study',role:'Shoot · Behind the scenes',duration:'00:16',file:'film-03-kitchen.mp4',poster:'film-03-kitchen-poster.jpg',format:'Landscape',alt:'A food preparation scene in a kitchen'},
  {title:'Field Notes',role:'Shoot · Documentary',duration:'01:02',file:'film-04-field.mp4',poster:'film-04-field-corrected-poster.jpg',format:'Landscape',alt:'A frame from the Field Notes film'},
  {title:'Exhausted',role:'Act · Edit',duration:'01:05',file:'film-05-exhausted.mp4',poster:'film-05-exhausted-poster.jpg',format:'Landscape',alt:'A person working at a desk at night'},
  {title:'Exhausted / Cut',role:'Edit · Alternate cut',duration:'00:11',file:'film-06-corrected.mp4',poster:'film-06-corrected.jpg',format:'Landscape',alt:'A blue-lit workstation from the alternate cut of Exhausted'},
  {title:'Club Production',role:'Act · Behind the scenes',duration:'00:29',file:'film-07-corrected.mp4',poster:'film-07-corrected.jpg',format:'Landscape',alt:'Two club members wearing sunglasses during a production'}
];

export const destinations = {
  home: ['Engineering ideas.\nFraming stories.', 'Thoughtful software. Intelligent systems. Stories in motion.'],
  work: ['Ideas into\nworking systems.', 'Five projects across AI, full-stack engineering and digital health.'],
  about: ['Meet the mind\nbehind the work.', 'An engineer, a storyteller, and always a student of the craft.'],
  journey: ['Built by doing.\nStill exploring.', 'Experience, education and the learning that connects them.'],
  skills: ['From interface\nto infrastructure.', 'Backend engineering, computer vision and thoughtful product development.'],
  films: ['A different lens.\nThe same curiosity.', 'Seven film entries. Acting, shooting, capturing and editing.'],
  resume: ['The short\nversion.', 'Read my experience, projects and education in the full résumé.'],
  contact: ['A good idea\nstarts with hello.', 'Have a problem worth solving or a story worth telling? Let’s talk.']
};
