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
  // Omitted = EASY, for every question written before difficulty levels
  // existed — no backfill needed, this is just the default.
  difficulty?: "EASY" | "MEDIUM" | "HARD";
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

// --- Medium tier ---------------------------------------------------------
// Starter content for the difficulty-levels feature. Sized smaller than
// the Easy tier (25 aptitude — the minimum needed to safely cover the
// no-skills-listed fallback draw, which is a hard constraint — plus 8 per
// language section, the minimum needed to cover the worst case where only
// two LSRW sections apply and 15 questions split as [8,7]). Meant to grow
// over time, same reasoning as every other starter seed list in this repo.
export const MEDIUM_APTITUDE_QUESTIONS: SeedQuestion[] = [
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A can do a job in 12 days, B in 15 days. They work together for 4 days, then A leaves. How many more days will B alone need to finish the remaining work?",
    options: ["4", "5", "6", "8"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "The average of 5 consecutive even numbers is 24. What is the largest number?",
    options: ["26", "28", "30", "32"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A sum invested at compound interest amounts to ₹4,840 in 2 years and ₹5,324 in 3 years at the same rate. What is the rate of interest?",
    options: ["8%", "10%", "12%", "15%"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "In how many ways can the letters of the word 'LEADER' be arranged?",
    options: ["360", "720", "180", "120"],
    correctIndex: 0,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt:
      "Pipes A and B can fill a tank in 20 and 30 minutes respectively. Pipe C can empty it in 40 minutes. If all three are opened together, how long will it take to fill the tank?",
    options: ["15 minutes", "120/7 minutes", "20 minutes", "24 minutes"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A boat travels 36 km upstream in 6 hours and returns downstream in 4 hours. What is the speed of the boat in still water?",
    options: ["6 km/h", "7 km/h", "7.5 km/h", "8 km/h"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "If x% of 250 is 45 more than 15% of 400, what is x?",
    options: ["38", "40", "42", "45"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt:
      "A vessel contains milk and water in the ratio 5:3. If 4 liters of water is added, the ratio becomes 5:4. What was the initial quantity of milk?",
    options: ["15 liters", "18 liters", "20 liters", "24 liters"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A father is 3 times as old as his son. In 12 years, he will be twice as old as his son. What is the father's current age?",
    options: ["30", "33", "36", "40"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt:
      "Facing north, you turn 90° clockwise, then 180°, then 90° anticlockwise. Which direction do you face now?",
    options: ["North", "East", "South", "West"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "In an election, candidate X got 60% of votes and won by 4,000 votes over the only other candidate. What was the total number of votes?",
    options: ["16,000", "18,000", "20,000", "22,000"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt:
      "Statement: All pens are pencils. Some pencils are erasers. Conclusion I: Some pens are erasers. Conclusion II: No pens are erasers. Which follows?",
    options: ["Only I", "Only II", "Both I and II", "Neither I nor II"],
    correctIndex: 3,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A is twice as efficient as B. Together they finish a job in 10 days. How many days would A alone take?",
    options: ["12", "15", "20", "25"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A shopkeeper marks an item 40% above cost price and gives a 10% discount. What is his profit percentage?",
    options: ["24%", "26%", "30%", "34%"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "How many degrees does the minute hand of a clock move in 20 minutes?",
    options: ["100°", "110°", "120°", "130°"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "Complete the series: A, C, F, J, O, ?",
    options: ["T", "U", "V", "S"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "Two numbers are in ratio 3:5. If each is increased by 10, the ratio becomes 5:7. Find the larger number.",
    options: ["9 & 15", "12 & 20", "15 & 25", "18 & 30"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "In a survey, 70% like tea, 60% like coffee, and 40% like both. What percentage like neither?",
    options: ["5%", "10%", "15%", "20%"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A bag has 4 red and 6 blue balls. What is the probability of drawing a red ball?",
    options: ["1/3", "2/5", "1/2", "3/5"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "In a certain code, TABLE is written as UBCMF (each letter shifted forward by one). How is CHAIR written?",
    options: ["DIBJS", "DIBIS", "DHBJS", "DIBJT"],
    correctIndex: 0,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "Complete the series: 1, 4, 9, 16, 25, ?",
    options: ["30", "32", "34", "36"],
    correctIndex: 3,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "If it takes 5 machines 5 minutes to make 5 widgets, how long would it take 100 machines to make 100 widgets?",
    options: ["5 minutes", "20 minutes", "100 minutes", "500 minutes"],
    correctIndex: 0,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt:
      "Two trains 120 m and 180 m long run in opposite directions at 54 km/h and 36 km/h. How long do they take to cross each other?",
    options: ["10 s", "12 s", "15 s", "20 s"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "Which number does not belong: 27, 64, 100, 125?",
    options: ["27", "64", "100", "125"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "MEDIUM",
    prompt: "A is B's brother. C is B's mother. D is C's father. How is A related to D?",
    options: ["Uncle", "Grandchild", "Nephew", "Son"],
    correctIndex: 1,
  },
];

export const MEDIUM_LISTENING_QUESTIONS: SeedQuestion[] = [
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "What was the company's overall net growth?",
    passage:
      "The quarterly sales report showed a 15% increase in the northern region, but a 5% decline in the south, resulting in an overall net growth of 8% for the company.",
    options: ["5%", "8%", "10%", "15%"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "What happens to employees who miss the deadline?",
    passage:
      "Employees who complete the safety training by Friday will receive a certificate; those who miss the deadline must retake the full course next month.",
    options: ["They get a certificate anyway", "They retake the full course next month", "They are exempted", "Nothing happens"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "Why was the meeting rescheduled?",
    passage:
      "Although the meeting was originally scheduled for 10 AM, it was pushed to 2 PM because two key stakeholders were delayed by a flight cancellation.",
    options: ["The room was unavailable", "Stakeholders' flight was cancelled", "The agenda changed", "It was a public holiday"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "What is different under the new policy?",
    passage:
      "The new policy requires all remote workers to log their hours daily, whereas previously only a weekly summary was needed.",
    options: ["Hours are logged daily instead of weekly", "Remote work is banned", "Logging is no longer required", "Only managers log hours"],
    correctIndex: 0,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "How did the team increase engagement despite the budget cuts?",
    passage:
      "Despite the budget cuts, the marketing team managed to increase engagement by relying more on organic social media content instead of paid ads.",
    options: ["By increasing paid ads", "By using organic social media content", "By hiring more staff", "By cancelling campaigns"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "What happens to deliveries arriving after 6 PM?",
    passage:
      "The warehouse manager noted that deliveries arriving after 6 PM would be processed the next morning instead of the same day.",
    options: ["Processed immediately", "Rejected", "Processed the next morning", "Sent back"],
    correctIndex: 2,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "What changed in the revised version of the document?",
    passage:
      "While the first draft focused heavily on technical detail, the revised version simplified the language to suit a general audience.",
    options: ["More technical detail was added", "Language was simplified for a general audience", "It became longer", "It was translated"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "MEDIUM",
    prompt: "Why were the survey results inconclusive?",
    passage:
      "The survey results were inconclusive because fewer than half of the invited participants responded within the given timeframe.",
    options: ["Too many people responded", "Fewer than half responded in time", "The questions were unclear", "The survey was cancelled"],
    correctIndex: 1,
  },
];

export const MEDIUM_READING_QUESTIONS: SeedQuestion[] = [
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "According to the passage, what is one downside of remote work mentioned?",
    passage:
      "Remote work has increased productivity for many employees by eliminating commute time, but it has also blurred the boundary between personal and professional life for some.",
    options: ["Increased commute time", "Blurred boundary between personal and professional life", "Lower productivity", "Higher costs"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "What can excessive fat intake lead to?",
    passage:
      "A balanced diet includes carbohydrates for energy, proteins for muscle repair, and fats for long-term energy storage, though excessive fat intake can lead to health issues.",
    options: ["More energy", "Muscle repair", "Health issues", "Better digestion"],
    correctIndex: 2,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "What complaint did some shop owners have about the new cycling lanes?",
    passage:
      "The city's new cycling lanes reduced traffic congestion in the downtown area, though some shop owners complained about reduced parking space.",
    options: ["Increased traffic", "Reduced parking space", "Higher taxes", "Noise pollution"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "What does the reliability of renewable energy depend on?",
    passage:
      "Renewable energy sources like solar and wind are becoming cheaper, but their reliability depends heavily on weather conditions, unlike fossil fuels.",
    options: ["Government subsidies", "Weather conditions", "Fossil fuel prices", "Population size"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "What trade-off did the company accept when switching suppliers?",
    passage:
      "The company's decision to switch suppliers was driven by cost savings, even though the new supplier had a longer average delivery time.",
    options: ["Higher cost for faster delivery", "Lower cost for longer delivery time", "Better quality for higher price", "Faster delivery for lower quality"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "Why did the novel become a bestseller?",
    passage:
      "Although the novel received mixed reviews from critics, it became a bestseller due to strong word-of-mouth recommendations among readers.",
    options: ["Critic reviews", "Word-of-mouth recommendations", "Advertising", "Awards"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "Why was the clinical trial halted early?",
    passage:
      "The clinical trial was halted early after preliminary results showed the treatment was significantly more effective than the placebo.",
    options: ["The treatment failed", "Results showed strong effectiveness", "Funding ran out", "Participants dropped out"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "MEDIUM",
    prompt: "What benefit do urban farming initiatives provide, according to the passage?",
    passage:
      "Urban farming initiatives face challenges such as limited space and soil contamination, yet they provide fresh produce access in food deserts.",
    options: ["Unlimited space", "Fresh produce access in food deserts", "No contamination risk", "Lower labor needs"],
    correctIndex: 1,
  },
];

export const MEDIUM_WRITING_QUESTIONS: SeedQuestion[] = [
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Choose the grammatically correct sentence.",
    options: [
      "The list of items are on the table.",
      "The list of items is on the table.",
      "The list of items being on the table.",
      "The list of items were on the table.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Neither of the applicants have submitted their forms.",
      "Neither of the applicants has submitted their forms.",
      "Neither of the applicants submit their forms.",
      "Neither of the applicants submitting their forms.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Select the sentence with correct word usage.",
    options: [
      "The new policy will effect several departments.",
      "The new policy will affect several departments.",
      "The new policy will affects several departments.",
      "The new policy will be affect several departments.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Choose the correctly punctuated sentence.",
    options: [
      "Despite the rain, the event continued as planned.",
      "Despite the rain the event, continued as planned.",
      "Despite, the rain the event continued as planned.",
      "Despite the rain the event continued, as planned.",
    ],
    correctIndex: 0,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Choose the sentence with correct subject-verb agreement.",
    options: [
      "Each of the employees have their own desk.",
      "Each of the employees has their own desk.",
      "Each of the employees having their own desk.",
      "Each of the employees have its own desk.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Select the correctly written sentence.",
    options: [
      "The reason he was late is because of traffic.",
      "The reason he was late was traffic.",
      "The reason he was late is because traffic.",
      "The reason he was late because of traffic.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Choose the correctly written sentence.",
    options: [
      "She is one of the employees who works remotely.",
      "She is one of the employees who work remotely.",
      "She is one of the employee who work remotely.",
      "She are one of the employees who work remotely.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "MEDIUM",
    prompt: "Select the sentence that uses the correct comparative form.",
    options: [
      "This report is more better than the last one.",
      "This report is better than the last one.",
      "This report is more good than the last one.",
      "This report is best than the last one.",
    ],
    correctIndex: 1,
  },
];

export const MEDIUM_SPEAKING_QUESTIONS: SeedQuestion[] = [
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "Your manager says: 'We're behind schedule on this project — what do you suggest?' What is the most appropriate response?",
    options: [
      "That's not my problem.",
      "I think we should prioritize the critical tasks and ask for help on the rest.",
      "I don't know, ask someone else.",
      "We should just cancel the project.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "A colleague says: 'I disagree with your approach to this task.' What is the most professional response?",
    options: [
      "You're wrong.",
      "I'd like to understand your concerns — can you walk me through your reasoning?",
      "Whatever, I'll do it my way.",
      "Stop criticizing me.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "A client asks: 'Can you explain why the delivery is delayed?' What is the most appropriate response?",
    options: [
      "It's not my fault.",
      "There was an unexpected supply issue, and we're working to resolve it as quickly as possible.",
      "I don't know.",
      "Delays happen, deal with it.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "Your interviewer asks: 'Tell me about a time you handled a difficult situation at work.' What is the best way to begin your answer?",
    options: [
      "I don't really remember any difficult situations.",
      "Let me describe the situation, what I did, and the outcome.",
      "Difficult situations aren't really a big deal to me.",
      "I'd rather not talk about that.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "A coworker says: 'I think we missed an important detail in the report.' What is the most constructive response?",
    options: [
      "That's your mistake, not mine.",
      "Let's review it together and fix it before it goes out.",
      "It's too late now, just leave it.",
      "I'm sure it's fine.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "Your supervisor says: 'Can you take on an extra task this week?' but you're already at capacity. What is the most appropriate response?",
    options: [
      "No, absolutely not.",
      "I'm currently at capacity — can we discuss priorities or a new deadline?",
      "Fine, whatever.",
      "I'll just ignore my other work.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "During a team meeting, someone asks for your opinion on a proposal you disagree with. What is the most appropriate response?",
    options: [
      "Say nothing to avoid conflict.",
      "Share your concerns respectfully and suggest an alternative.",
      "Criticize the person who proposed it.",
      "Agree even though you disagree.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "MEDIUM",
    prompt: "A customer says: 'I'm not satisfied with this product.' What is the most appropriate response?",
    options: [
      "That's not our problem.",
      "I'm sorry to hear that — can you tell me more so I can help resolve it?",
      "Products don't always work, that's normal.",
      "You should have checked before buying.",
    ],
    correctIndex: 1,
  },
];

// --- Hard tier -------------------------------------------------------------
export const HARD_APTITUDE_QUESTIONS: SeedQuestion[] = [
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt:
      "A alone can do a piece of work in 18 days and B alone in (x+5) more days than A, for some x. Together they complete it in 6 days. If A alone takes x days, find x.",
    options: ["8", "9", "10", "12"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt:
      "A sells a bicycle to B at a profit of 20%, and B sells it to C at a loss of 10%. If C pays ₹1,080, what did A pay originally (his cost price)?",
    options: ["₹900", "₹1,000", "₹1,100", "₹1,200"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A number when divided by 15 leaves a remainder of 7. What is the remainder when twice that number is divided by 15?",
    options: ["7", "10", "13", "14"],
    correctIndex: 3,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A can complete a task 3 times as fast as B. Together they complete the task in 15 days. How long would B alone take?",
    options: ["45 days", "50 days", "60 days", "75 days"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "The perimeter of a rectangle is 100 m and its length is 10 m more than its width. What is the area?",
    options: ["500 m²", "550 m²", "600 m²", "650 m²"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "In a group of 60 people, 40 speak English, 30 speak French, and 15 speak both. How many speak neither language?",
    options: ["0", "5", "10", "15"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "How many 3-digit numbers can be formed using digits 1-9 (no repetition) such that the number is divisible by 5?",
    options: ["42", "48", "56", "64"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A cyclist covers a certain distance at 15 km/h and returns over the same route at 10 km/h. What is his average speed for the entire trip?",
    options: ["12 km/h", "12.5 km/h", "13 km/h", "13.5 km/h"],
    correctIndex: 0,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A number consists of two digits whose sum is 9. If 27 is subtracted from the number, the digits interchange places. Find the number.",
    options: ["54", "63", "72", "81"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "What is the compound interest on ₹8,000 for 2 years at 5% per annum, compounded annually?",
    options: ["₹800", "₹810", "₹820", "₹840"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt:
      "A shopkeeper sells two items at ₹1,200 each. On one he makes a 20% profit, and on the other a 20% loss. What is his overall profit or loss?",
    options: ["No profit no loss", "4% profit", "4% loss", "5% loss"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "Complete the series: 2, 3, 5, 8, 13, 21, ?",
    options: ["29", "32", "34", "36"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A is 3 years older than B, and B is twice as old as C. If the sum of their ages is 38, how old is C?",
    options: ["5", "6", "7", "8"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt:
      "A train crosses a platform 200 m long in 30 seconds and a signal pole (negligible length) in 18 seconds. What is the length of the train?",
    options: ["250 m", "270 m", "300 m", "320 m"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt:
      "A alone can finish a work in 18 days and B alone in 24 days. A started the work, and after some days B joined him, and they finished the remaining work together in 4 days. After how many days did B join A?",
    options: ["9", "10", "11", "12"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A person invests equal amounts in two schemes, at 8% and 10% simple interest respectively. After 2 years, total interest earned is ₹720. How much was invested in each scheme?",
    options: ["₹1,500", "₹1,800", "₹2,000", "₹2,500"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "If log₂(x) = 5, what is the value of x?",
    options: ["16", "25", "32", "64"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A container has milk and water. After removing 16 liters of the mixture and replacing it with water, calculations show the milk fraction dropped from 5/8 to 5/16 of the total. What was the total volume of the mixture?",
    options: ["24 liters", "28 liters", "32 liters", "36 liters"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A boat's speed in still water is 15 km/h and the speed of the stream is 5 km/h. How long will the boat take to cover 100 km downstream?",
    options: ["4 hours", "5 hours", "6 hours", "8 hours"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "Find the odd one out: 121, 144, 169, 200, 225 (all perfect squares except one).",
    options: ["144", "169", "200", "225"],
    correctIndex: 2,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A sum of ₹12,000 becomes ₹15,600 in 3 years at simple interest. What is the annual rate of interest?",
    options: ["8%", "10%", "12%", "15%"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "Three friends A, B, and C invest in a business in the ratio 2:3:5. If the total profit is ₹50,000, what is C's share?",
    options: ["₹10,000", "₹15,000", "₹20,000", "₹25,000"],
    correctIndex: 3,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A clock is set right at 12 noon. It gains 10 minutes every 24 hours. What will be the true time when the clock shows 6 PM the next day?",
    options: ["5:40 PM", "5:47 PM", "5:56 PM", "6:00 PM"],
    correctIndex: 1,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "If the radius of a circle is increased by 20%, by what percentage does its area increase?",
    options: ["20%", "36%", "40%", "44%"],
    correctIndex: 3,
  },
  {
    section: "APTITUDE",
    difficulty: "HARD",
    prompt: "A committee of 5 is to be formed from 6 men and 4 women, including at least 2 women. In how many ways can this be done?",
    options: ["180", "186", "196", "210"],
    correctIndex: 2,
  },
];

export const HARD_LISTENING_QUESTIONS: SeedQuestion[] = [
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What was the main reason the program failed in rural regions?",
    passage:
      "While the pilot program showed promising results in urban areas, its success could not be replicated in rural regions, largely due to inconsistent internet connectivity rather than any flaw in the program's design.",
    options: ["A flaw in program design", "Inconsistent internet connectivity", "Lack of funding", "Poor management"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What specifically did the auditor flag for further review?",
    passage:
      "The auditor's report noted that while the company's revenue figures were accurate, the classification of certain expenses as capital rather than operational costs warranted further review.",
    options: ["Revenue accuracy", "Expense classification", "Tax filings", "Employee salaries"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "Why didn't the merger save costs in the first year?",
    passage:
      "Contrary to initial expectations, the merger did not result in significant cost savings in the first year, as integration expenses offset the anticipated efficiencies.",
    options: ["Efficiencies were too large", "Integration expenses offset the savings", "The merger was cancelled", "Revenue declined"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What condition did the committee attach to their approval?",
    passage:
      "The committee approved the proposal on the condition that a follow-up review be conducted within six months to assess its actual impact before any further funding is allocated.",
    options: ["Immediate full funding", "A follow-up review within six months", "Rejection of future funding", "No conditions"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What was a temporary downside of the new software?",
    passage:
      "Although the new software reduced processing time by 30%, it introduced a learning curve that temporarily lowered overall team output during the first month of adoption.",
    options: ["It increased processing time", "It lowered output during the learning period", "It was more expensive", "It caused errors"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What point was the researcher making?",
    passage:
      "The researcher clarified that correlation observed between the two variables does not, on its own, establish that one causes the other.",
    options: ["Correlation proves causation", "Correlation does not by itself prove causation", "The variables are unrelated", "The study was flawed"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What increased despite fewer applications?",
    passage:
      "Despite receiving fewer applications this year, the university reported an increase in the average qualification level of applicants, attributing it to more targeted recruitment.",
    options: ["Number of applicants", "Average qualification level of applicants", "Tuition fees", "Number of universities"],
    correctIndex: 1,
  },
  {
    section: "LISTENING",
    difficulty: "HARD",
    prompt: "What was the actual sticking point in the negotiation?",
    passage:
      "The negotiation stalled not over price, but over the timeline for delivery, which neither party was willing to compromise on initially.",
    options: ["Price", "Delivery timeline", "Payment method", "Product quality"],
    correctIndex: 1,
  },
];

export const HARD_READING_QUESTIONS: SeedQuestion[] = [
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "According to critics, what is the actual effect of the policy?",
    passage:
      "Critics of the policy argue that while it addresses short-term revenue shortfalls, it does so by deferring costs to future budgets, effectively borrowing against later fiscal years rather than solving the underlying structural deficit.",
    options: [
      "It solves the structural deficit",
      "It defers costs to future years without fixing the underlying problem",
      "It increases current revenue permanently",
      "It has no effect on the budget",
    ],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "What limitation do the study's authors acknowledge?",
    passage:
      "The study's authors caution that their sample, drawn exclusively from urban hospitals, may limit the generalizability of the findings to rural healthcare settings.",
    options: ["The sample size was too small", "Findings may not generalize to rural settings", "The study had no control group", "The results were statistically insignificant"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "What paradox does the passage describe about automation?",
    passage:
      "While automation has eliminated certain routine roles, it has simultaneously created demand for workers skilled in maintaining and supervising the very systems that replaced those roles.",
    options: [
      "Automation only eliminates jobs",
      "Automation eliminates some roles while creating demand for others",
      "Automation has no effect on employment",
      "Automation is universally opposed",
    ],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "Which of the following would most likely NOT be covered by the warranty?",
    passage:
      "The manufacturer's warranty covers defects arising from materials or workmanship, but explicitly excludes damage resulting from misuse, unauthorized modification, or normal wear and tear.",
    options: ["A defect in the original materials", "Damage from an unauthorized modification", "A workmanship error", "A manufacturing defect"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "What does the passage suggest about the relationship between wait times and satisfaction?",
    passage:
      "Although the pilot scheme reduced average wait times by 25%, patient satisfaction scores remained largely unchanged, suggesting that wait time was not the primary driver of dissatisfaction.",
    options: [
      "Wait time was the main driver of dissatisfaction",
      "Wait time was likely not the primary driver of dissatisfaction",
      "Satisfaction improved significantly",
      "The scheme failed completely",
    ],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "What caution does the report raise?",
    passage:
      "The report distinguishes between correlation and causation, noting that regions with higher coffee consumption also report higher productivity, but cautions against concluding that coffee consumption causes the productivity gains.",
    options: ["Coffee definitely causes productivity gains", "The link between coffee and productivity may not be causal", "Productivity data is unreliable", "Coffee consumption should be banned"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "Under what condition can the agreement be terminated without the standard notice period?",
    passage:
      "The clause stipulates that either party may terminate the agreement with 30 days' written notice, except in cases of material breach, which permits immediate termination without notice.",
    options: ["Any disagreement", "A material breach", "Mutual consent only", "Never — notice is always required"],
    correctIndex: 1,
  },
  {
    section: "READING",
    difficulty: "HARD",
    prompt: "What concern do opponents raise about the tax?",
    passage:
      "Proponents claim the new tax primarily targets luxury consumption, though opponents point out that several everyday household items fall within its scope, disproportionately affecting lower-income households.",
    options: ["It only affects luxury goods", "It also covers everyday items, disproportionately affecting lower-income households", "It has no effect on prices", "It targets only wealthy households"],
    correctIndex: 1,
  },
];

export const HARD_WRITING_QUESTIONS: SeedQuestion[] = [
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Having finished the report, the meeting was attended by the manager.",
      "Having finished the report, the manager attended the meeting.",
      "The manager, having finished the report the meeting attended.",
      "Having finished the report the manager the meeting attended.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Select the sentence that avoids a dangling modifier.",
    options: [
      "Walking into the office, the computer was already on.",
      "Walking into the office, she noticed the computer was already on.",
      "The computer was on, walking into the office.",
      "Into the office walking, the computer was on.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Choose the correctly written sentence.",
    options: [
      "Between you and I, the proposal needs work.",
      "Between you and me, the proposal needs work.",
      "Between you and myself, the proposal needs work.",
      "Between yourself and I, the proposal needs work.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Select the sentence with the correct use of 'fewer' or 'less'.",
    options: [
      "We received less applications this year.",
      "We received fewer applications this year.",
      "We received fewest applications this year.",
      "We received little applications this year.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Choose the correctly written sentence with parallel structure.",
    options: [
      "The job requires strong writing, to analyze data, and communication skills.",
      "The job requires strong writing, data analysis, and communication skills.",
      "The job requires strong writing, analyzing data, and communication.",
      "The job requires writing strongly, data analysis, and to communicate.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Select the sentence with the correct use of the subjunctive mood.",
    options: [
      "If I was you, I would accept the offer.",
      "If I were you, I would accept the offer.",
      "If I am you, I would accept the offer.",
      "If I be you, I would accept the offer.",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Choose the sentence that correctly uses 'whom'.",
    options: [
      "Who did you give the report to?",
      "Whom did you give the report to?",
      "Whom gave the report to you?",
      "Who's report did you give?",
    ],
    correctIndex: 1,
  },
  {
    section: "WRITING",
    difficulty: "HARD",
    prompt: "Select the sentence free of a misplaced modifier.",
    options: [
      "She almost finished all of her homework before dinner.",
      "She finished almost all of her homework before dinner.",
      "Almost she finished all of her homework before dinner.",
      "She finished all of her homework almost before dinner.",
    ],
    correctIndex: 1,
  },
];

export const HARD_SPEAKING_QUESTIONS: SeedQuestion[] = [
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "During a high-stakes client call, the client raises an objection you weren't prepared for. What is the most appropriate response?",
    options: [
      "Improvise an answer even if unsure, to avoid looking unprepared.",
      "Acknowledge the point, and say you'll follow up with a precise answer shortly.",
      "Deflect the question entirely.",
      "Tell the client the objection is invalid.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "Your team disagrees on the best approach, and the discussion is becoming tense. What is the most appropriate way to respond?",
    options: [
      "Insist your approach is correct and end the discussion.",
      "Suggest taking a short break and revisiting the discussion with a structured comparison of options.",
      "Stay silent and let others decide.",
      "Escalate immediately to a manager without discussion.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "A senior colleague gives you feedback that feels overly harsh but contains a valid point. What is the most professional response?",
    options: [
      "Argue back defensively.",
      "Thank them for the feedback and ask clarifying questions about how to improve.",
      "Ignore the feedback entirely.",
      "Complain about them to others.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt:
      "In a panel interview, one interviewer asks a question that seems to contradict something another interviewer said earlier. What is the best way to respond?",
    options: [
      "Point out the contradiction directly and ask them to resolve it themselves.",
      "Answer thoughtfully, and if relevant, briefly note the different context or ask for clarification.",
      "Refuse to answer until they agree with each other.",
      "Give two completely different answers to please both.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "You need to deliver disappointing news to a stakeholder about a missed deadline. What is the most appropriate opening?",
    options: [
      "Avoid the topic and hope they don't notice.",
      "Clearly state the situation, the reason, and the plan to address it.",
      "Blame another team entirely.",
      "Wait for them to ask before saying anything.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "A team member consistently interrupts you during meetings. What is the most constructive way to address this?",
    options: [
      "Interrupt them back to make a point.",
      "Speak to them privately and calmly explain how it affects the discussion.",
      "Complain about them publicly in the next meeting.",
      "Say nothing and disengage from meetings.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "You're asked a question in an interview that you don't know the answer to. What is the most appropriate response?",
    options: [
      "Make up an answer confidently.",
      "Honestly say you're not certain, but explain how you would find out.",
      "Change the subject.",
      "Say the question is unfair.",
    ],
    correctIndex: 1,
  },
  {
    section: "SPEAKING",
    difficulty: "HARD",
    prompt: "During a presentation, a senior executive challenges one of your key assumptions in front of the whole team. What is the most appropriate response?",
    options: [
      "Get defensive and dismiss the challenge.",
      "Acknowledge the concern, explain your reasoning, and offer to revisit it with more data if needed.",
      "Ignore the executive and continue.",
      "Agree immediately just to avoid conflict, even if you believe you're right.",
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
  ...MEDIUM_APTITUDE_QUESTIONS,
  ...MEDIUM_LISTENING_QUESTIONS,
  ...MEDIUM_READING_QUESTIONS,
  ...MEDIUM_WRITING_QUESTIONS,
  ...MEDIUM_SPEAKING_QUESTIONS,
  ...HARD_APTITUDE_QUESTIONS,
  ...HARD_LISTENING_QUESTIONS,
  ...HARD_READING_QUESTIONS,
  ...HARD_WRITING_QUESTIONS,
  ...HARD_SPEAKING_QUESTIONS,
];
