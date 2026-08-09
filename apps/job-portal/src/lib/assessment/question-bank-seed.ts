// Hand-authored, curated question bank for the platform-wide MCQ assessment
// (language + aptitude sections only — the 10 skill-based questions are
// generated per-candidate, see skill-question-generator.ts). Seeded once via
// scripts/seed-assessment-questions.ts. A scored, gating exam needs reliable
// reviewed content, not live LLM generation — same reasoning as the
// institution seed list (institution-seed.ts).
//
// Aptitude is sized at 25 (not 15) so there's enough pool to cover both a
// normal 15-question draw AND the "candidate listed no skills" fallback,
// which draws 10 more from this same pool without repeating a question
// within one candidate's exam.
export interface SeedQuestion {
  section: "LISTENING" | "SPEAKING" | "READING" | "WRITING" | "APTITUDE";
  prompt: string;
  passage?: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
}

export const APTITUDE_QUESTIONS: SeedQuestion[] = [
  {
    section: "APTITUDE",
    prompt: "If a train travels 60 km in 45 minutes, what is its speed in km/h?",
    options: ["60", "75", "80", "90"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "A shop offers a 20% discount on an item priced at ₹2,500. What is the sale price?",
    options: ["₹1,800", "₹2,000", "₹2,200", "₹2,300"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "Complete the sequence: 2, 6, 12, 20, 30, ?",
    options: ["36", "40", "42", "45"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "If all Zorbs are Mifs, and all Mifs are Taks, which statement must be true?",
    options: ["All Zorbs are Taks", "All Taks are Zorbs", "No Zorbs are Taks", "Cannot be determined"],
    correctIndex: 0,
  },
  {
    section: "APTITUDE",
    prompt:
      "A team completes a task in 12 days with 8 workers. How many days would 6 workers take, at the same work rate per worker?",
    options: ["14", "15", "16", "18"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "Choose the word that does NOT belong with the others.",
    options: ["Apple", "Banana", "Carrot", "Mango"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "If today is Wednesday, what day will it be after 17 days?",
    options: ["Friday", "Saturday", "Sunday", "Monday"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "A is taller than B. C is shorter than B. Who is the shortest?",
    options: ["A", "B", "C", "Cannot be determined"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "Find the odd one out.",
    options: ["8", "27", "64", "100"],
    correctIndex: 3,
  },
  {
    section: "APTITUDE",
    prompt: "If 3 pens cost ₹45, how much do 7 pens cost at the same rate?",
    options: ["₹95", "₹100", "₹105", "₹110"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "Which number should replace the question mark? 5, 10, 20, 40, ?",
    options: ["60", "70", "80", "90"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "Select the word that best completes the relationship: Pen : Write :: Knife : ?",
    options: ["Sharp", "Cut", "Kitchen", "Blade"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt:
      "Priya and Rahul working together finish a project in 6 days. Priya alone can finish it in 10 days. How many days would Rahul alone take?",
    options: ["12", "14", "15", "18"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "Choose the correctly spelled word.",
    options: ["Recieve", "Receive", "Receeve", "Receve"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "If CAT is coded as 3-1-20 (A=1, B=2, C=3...), how is DOG coded using the same pattern?",
    options: ["4-15-7", "4-17-7", "4-15-17", "4-7-15"],
    correctIndex: 0,
  },
  {
    section: "APTITUDE",
    prompt: "A clock shows 3:15. What is the approximate angle between the hour and minute hands?",
    options: ["0°", "7.5°", "15°", "22.5°"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "In a class of 40 students, 60% are girls. How many boys are there?",
    options: ["14", "16", "18", "24"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "Which of these is a leap year?",
    options: ["1900", "2000", "2100", "2200"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "Choose the sentence that is grammatically correct.",
    options: ["He don't like coffee.", "He doesn't likes coffee.", "He doesn't like coffee.", "He not like coffee."],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "If the price of an item increases by 25% and then decreases by 20%, what is the net change?",
    options: ["5% increase", "No change", "5% decrease", "10% decrease"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "A rectangular room is 8 meters long and 5 meters wide. What is its area?",
    options: ["13 sq. m", "35 sq. m", "40 sq. m", "45 sq. m"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "If x + 5 = 12, what is the value of x?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "Which of the following is NOT a prime number?",
    options: ["7", "11", "15", "17"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    prompt: "A survey shows 3 out of every 5 employees prefer flexible hours. What percentage is this?",
    options: ["50%", "60%", "65%", "75%"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    prompt: "Choose the sentence that correctly uses “fewer” vs. “less.”",
    options: [
      "We have less applicants this year.",
      "We have fewer applicants this year.",
      "We have fewer applicant this year.",
      "We have less of applicants this year.",
    ],
    correctIndex: 1,
  },
];

export const READING_QUESTIONS: SeedQuestion[] = [
  {
    section: "READING",
    passage:
      "The company's new remote work policy allows employees to work from home up to three days per week, provided they attend all scheduled team meetings in person or via video call.",
    prompt: "According to the passage, how many days per week can employees work from home?",
    options: ["Up to 2", "Up to 3", "Up to 4", "All five"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "Priya submitted her project report a day before the deadline. Her manager reviewed it and asked for two minor revisions before final approval.",
    prompt: "What did Priya's manager do after reviewing the report?",
    options: ["Approved it immediately", "Rejected it completely", "Asked for two minor revisions", "Extended the deadline"],
    correctIndex: 2,
  },
  {
    section: "READING",
    passage:
      "The office cafeteria will be closed for renovation from Monday to Wednesday next week. Employees are advised to bring their own lunch or use the nearby food court during this period.",
    prompt: "What should employees do while the cafeteria is closed?",
    options: ["Skip lunch", "Bring their own lunch or use the food court", "Wait until the renovation ends", "Order food only on Wednesday"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "Although the meeting was scheduled for 10 a.m., it started fifteen minutes late because two attendees were stuck in traffic.",
    prompt: "Why did the meeting start late?",
    options: ["The room wasn't ready", "Two attendees were stuck in traffic", "The agenda was incomplete", "It was rescheduled"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "The training session covers three modules: workplace communication, time management, and conflict resolution. Each module takes about 90 minutes to complete.",
    prompt: "How long does each module take?",
    options: ["30 minutes", "60 minutes", "90 minutes", "120 minutes"],
    correctIndex: 2,
  },
  {
    section: "READING",
    passage:
      "Employees who complete the accessibility training by the end of this month will receive a certificate of completion, which can be added to their internal profile.",
    prompt: "What do employees receive after completing the training on time?",
    options: ["A bonus", "A certificate of completion", "A day off", "A promotion"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "The new hire orientation includes an introduction to company policies, a tour of the office, and a meeting with the HR team. It usually lasts a full day.",
    prompt: "How long does the new hire orientation usually last?",
    options: ["Half a day", "A full day", "Two days", "A week"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "Due to a scheduled server maintenance window this weekend, the internal portal will be unavailable from Saturday 10 p.m. to Sunday 6 a.m.",
    prompt: "When will the internal portal be unavailable?",
    options: ["Friday night only", "Saturday 10 p.m. to Sunday 6 a.m.", "All weekend", "Sunday only"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "Feedback forms should be submitted within five working days of the workshop. Late submissions will not be included in the final report.",
    prompt: "What happens to feedback submitted after five working days?",
    options: ["It is still included", "It is not included in the final report", "It gets extra weight", "It must be resubmitted twice"],
    correctIndex: 1,
  },
  {
    section: "READING",
    passage:
      "The team lead asked everyone to review the shared document and add comments before Friday, so the final version could be circulated the following Monday.",
    prompt: "When does the team lead want comments added by?",
    options: ["Monday", "Wednesday", "Friday", "The following Monday"],
    correctIndex: 2,
  },
];

export const WRITING_QUESTIONS: SeedQuestion[] = [
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: ["She go to office every day.", "She goes to office every day.", "She going to office every day.", "She gone to office every day."],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Each of the employees have submitted their form.",
      "Each of the employees has submitted their form.",
      "Each of the employees submit their form.",
      "Each of the employees submitting their form.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Identify the sentence with correct punctuation.",
    options: [
      "Please send the report, before 5 PM.",
      "Please send the report before 5 PM.",
      "Please, send the report before 5 PM.",
      "Please send the report before, 5 PM.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Neither of the applicants were qualified.",
      "Neither of the applicants was qualified.",
      "Neither of the applicants qualify.",
      "Neither of the applicants are qualifying.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the word that correctly completes the sentence: “The manager, along with her team, ___ attending the conference.”",
    options: ["are", "is", "were", "be"],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Its important to backup your files regularly.",
      "It's important to backup your files regularly.",
      "Its' important to backup your files regularly.",
      "It is important to backup you're files regularly.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Between you and I, the project is behind schedule.",
      "Between you and me, the project is behind schedule.",
      "Between you and myself, the project is behind schedule.",
      "Between I and you, the project is behind schedule.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: [
      "The report were reviewed by three editors.",
      "The report was reviewed by three editors.",
      "The report is reviewed by three editors last week.",
      "The report reviewed by three editors.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    prompt: "Choose the sentence that uses the correct form of the verb.",
    options: [
      "By next month, she will have completed the certification.",
      "By next month, she will completed the certification.",
      "By next month, she have completed the certification.",
      "By next month, she completing the certification.",
    ],
    correctIndex: 0,
  },
  {
    section: "WRITING",
    prompt: "Choose the correctly written sentence.",
    options: [
      "The number of applicants have increased this year.",
      "The number of applicants has increased this year.",
      "The number of applicants increasing this year.",
      "The number of applicants were increase this year.",
    ],
    correctIndex: 1,
  },
];

// `passage` here is what gets read aloud client-side via speechSynthesis
// (with a transcript-reveal fallback) rather than a real audio file — see
// the assessment page.
export const LISTENING_QUESTIONS: SeedQuestion[] = [
  {
    section: "LISTENING",
    passage:
      "Good morning team. Today's stand-up meeting has been moved from 9:30 to 10 o'clock because the conference room is being used for a client call until 9:45.",
    prompt: "What time was the stand-up meeting moved to?",
    options: ["9:00", "9:30", "9:45", "10:00"],
    correctIndex: 3,
  },
  {
    section: "LISTENING",
    passage:
      "Attention all staff, the fire drill scheduled for this afternoon has been postponed to tomorrow morning due to the ongoing rain.",
    prompt: "Why was the fire drill postponed?",
    options: ["Low staff attendance", "Ongoing rain", "A scheduling conflict", "Equipment failure"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    passage:
      "Hi, this is a reminder that the quarterly performance reviews will be conducted between the 10th and the 15th of next month. Please book a slot with your manager.",
    prompt: "What should employees do to prepare for their performance review?",
    options: ["Wait for their manager to contact them", "Book a slot with their manager", "Submit a written report", "Attend a group session"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    passage:
      "Welcome to the orientation session. Over the next two hours, we'll cover company policies, benefits enrollment, and a short tour of the building.",
    prompt: "How long is the orientation session?",
    options: ["One hour", "Two hours", "Three hours", "Half a day"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    passage:
      "Just a heads up, the parking garage on Fifth Street will be closed for repairs starting Monday. Please use the visitor lot behind the building instead.",
    prompt: "What should employees use instead of the Fifth Street garage?",
    options: ["The street outside", "A nearby mall", "The visitor lot behind the building", "Public transport only"],
    correctIndex: 2,
  },
  {
    section: "LISTENING",
    passage:
      "Thanks everyone for joining. Before we begin the demo, please make sure your microphones are muted unless you're speaking.",
    prompt: "What are attendees asked to do before the demo begins?",
    options: ["Turn on their cameras", "Mute their microphones unless speaking", "Leave the call", "Share their screens"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    passage:
      "Reminder: the deadline to submit expense reports for this quarter is this Friday at 5 p.m. Reports submitted after that will be processed next quarter.",
    prompt: "What happens to expense reports submitted after the deadline?",
    options: ["They are rejected", "They are processed next quarter", "They are processed immediately", "They require manager approval"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    passage:
      "Good afternoon. The IT team will be upgrading everyone's laptops to the new operating system starting next week. You'll receive a calendar invite for your slot.",
    prompt: "How will employees know their laptop upgrade time?",
    options: ["An email announcement", "A calendar invite", "A phone call", "A posted schedule in the office"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    passage:
      "Just to confirm, the client meeting has moved from the main office to the downtown branch, and it now starts thirty minutes earlier than originally planned.",
    prompt: "What two things changed about the client meeting?",
    options: ["Only the location", "Only the time", "Both the location and the time", "Neither changed"],
    correctIndex: 2,
  },
  {
    section: "LISTENING",
    passage:
      "Hello, this is a quick update. The survey results show that most employees prefer a hybrid work schedule over fully remote or fully in-office options.",
    prompt: "What did the survey find that most employees prefer?",
    options: ["Fully remote work", "Fully in-office work", "A hybrid work schedule", "No preference"],
    correctIndex: 2,
  },
];

// MCQ-testable "speaking": choosing the most appropriate spoken response in
// a workplace scenario, not an actual recorded-speech task — no microphone
// anywhere in this feature.
export const SPEAKING_QUESTIONS: SeedQuestion[] = [
  {
    section: "SPEAKING",
    prompt:
      "Your colleague says: “I'm really struggling to finish this report before the deadline.” What is the most appropriate response?",
    options: [
      "That's not my problem.",
      "Let me know how I can help you finish it.",
      "You should have started earlier.",
      "I'm too busy to talk about this.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "Your manager asks: “Can you walk me through the status of the project?” What is the most appropriate way to begin your response?",
    options: [
      "I don't really know where to start.",
      "Sure, here's a quick summary of where we are.",
      "Why do you need to know?",
      "Ask someone else, I'm busy.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "A client says on a call: “I'm not happy with the delay in delivery.” What is the most professional response?",
    options: [
      "That's not my fault.",
      "I understand your frustration — let me look into what happened and update you.",
      "These things happen, don't worry about it.",
      "You should have followed up earlier.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "During a meeting, someone interrupts you while you're speaking. What is the most appropriate way to respond?",
    options: [
      "Please let me finish my point, then I'll happily hear yours.",
      "Stop interrupting me!",
      "Ignore them and keep talking louder.",
      "Stay silent and let them continue.",
    ],
    correctIndex: 0,
  },
  {
    section: "SPEAKING",
    prompt: "A new team member asks you a question you don't know the answer to. What is the most appropriate response?",
    options: [
      "I'm not sure — let me find out and get back to you.",
      "I don't know, figure it out yourself.",
      "Make up an answer that sounds right.",
      "That's a silly question.",
    ],
    correctIndex: 0,
  },
  {
    section: "SPEAKING",
    prompt: "Your manager gives you feedback on a mistake you made. What is the most professional way to respond?",
    options: [
      "That wasn't my fault.",
      "Thank you for the feedback, I'll correct it.",
      "I don't agree with that at all.",
      "Say nothing and walk away.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "You need to ask a colleague to redo part of their work. What is the most appropriate way to phrase this?",
    options: [
      "This is wrong, redo it.",
      "Could you revise this section? Here's what needs to change.",
      "Why did you do it like this?",
      "I'll just do it myself.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "You're presenting to a group and someone asks a question you can only partially answer. What's the best response?",
    options: [
      "Guess the full answer confidently.",
      "Here's what I know, and I'll confirm the rest and follow up.",
      "I can't answer that.",
      "Change the subject.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "A colleague disagrees with your idea in a meeting. What is the most appropriate response?",
    options: ["You're wrong.", "I see your point — can you tell me more about your concern?", "Ignore them.", "Let's just do it my way."],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    prompt: "You need to decline a meeting invite due to a scheduling conflict. What is the most appropriate way to respond?",
    options: [
      "Just don't show up.",
      "I have a conflict at that time — could we find another slot?",
      "I'm not interested in this meeting.",
      "Accept and then not attend.",
    ],
    correctIndex: 1,
  },
];

export const ALL_SEED_QUESTIONS: SeedQuestion[] = [
  ...APTITUDE_QUESTIONS,
  ...READING_QUESTIONS,
  ...WRITING_QUESTIONS,
  ...LISTENING_QUESTIONS,
  ...SPEAKING_QUESTIONS,
];
