import type { MicroBrief } from "./types";
// Focus briefs for days 1..7
export const WEEK1_BRIEFS_FOCUS: MicroBrief[] = [
  {
    day: 1,
    title: "Start before you feel ready",
    tldr: "A short imperfect start beats a perfect plan.",
    content:
      "Momentum comes from action. Today, pick one tiny task and start a 10–25 minute focus block. Silence notifications, choose one task, and press start. Done is data you can improve tomorrow.",
  longcontent: "Starting is often the hardest part because our brains prefer certainty and comfort; waiting to 'feel ready' becomes a permission slip to delay. This deep dive breaks starting into a tiny, repeatable experiment: pick one ultra-specific first action, set a short timebox (10–25 minutes), remove or hide your biggest distraction, and make a tiny pre-commitment (say it aloud, jot it down, or tell a friend). Treat the timer as a boundary — not a lifetime promise — and approach the session as data: note what helped you focus, what stalled you, and one tweak you’ll try next time. Over many repetitions these micro-starts compound into momentum, grow your confidence, and slowly shift your identity from ‘I plan to’ into ‘I do.’",
    actionLabel: "Start focus block",
  },
  {
    day: 2,
    title: "Implementation intentions",
    tldr: "After [cue], I will [action] for 2 minutes.",
    content:
      "Design the moment before the habit. Choose a specific cue—after coffee, after lunch—and commit to a 2-minute first rep. Clarity reduces friction.",
      longcontent: "Implementation intentions are powerful because they create a mental link between a specific situation (the cue) and a behavior (the action). This pre-planning makes it easier to act when the moment arrives, reducing the chances of procrastination. By starting with just 2 minutes, you lower the barrier to entry, making it more likely you'll follow through and build momentum for longer sessions.",
    actionLabel: "Do 2-minute first rep",
  },
  {
    day: 3,
    title: "Environment beats willpower",
    tldr: "Make the good easier and the distracting harder.",
    content:
      "Remove one friction and add one prompt. Lay out what you need, and put distractions out of sight. Small tweaks, big payoff.",
      longcontent: "Your environment plays a crucial role in shaping your behavior. By making positive actions more accessible and reducing the visibility of distractions, you create a setting that naturally encourages focus and productivity. These small adjustments can significantly enhance your ability to stick to your habits, as they reduce the reliance on willpower, which can be inconsistent.",
    actionLabel: "Do a 5-minute setup",
  },
  {
    day: 4,
    title: "Timeboxing tomorrow (mini)",
    tldr: "Decide the when, not just the what.",
    content:
      "Pick tomorrow’s top task and give it a 15–25 minute slot. Your calendar becomes a promise to your future self.",
      longcontent: "Timeboxing is a powerful technique that helps you allocate specific time slots for tasks, reducing decision fatigue and increasing accountability. By scheduling your most important task for the next day, you create a clear commitment that your future self is more likely to honor. This approach not only enhances focus but also helps in managing time effectively, ensuring that critical tasks receive the attention they deserve.",
    actionLabel: "Timebox 15–25 minutes",
  },
  {
    day: 5,
    title: "Single-tasking cue",
    tldr: "One tab, one task, one timer.",
    content:
      "Multitasking splits attention. Today, try a single-task drill: one tab/app only during your next focus block. Notice the difference.",
      longcontent: "Single-tasking is a powerful way to enhance focus and productivity. By dedicating your attention to one task at a time, you reduce cognitive load and improve the quality of your work. Using a single tab or app during focus blocks minimizes distractions and helps you stay immersed in the task at hand. This practice can lead to deeper concentration, better outcomes, and a greater sense of accomplishment.",
    actionLabel: "Run single-task drill",
  },
  {
    day: 6,
    title: "Shutdown mini",
    tldr: "Close loops; write tomorrow’s top 3.",
    content:
      "End your day with a 5-minute shutdown: capture loose ends, pick the top 1–3 for tomorrow, and tidy your space.",
      longcontent: "A structured shutdown routine helps you transition from work to rest, reducing stress and improving sleep quality. By capturing loose ends and identifying your top tasks for the next day, you create a clear plan that your future self can easily follow. Tidying your workspace also contributes to a sense of closure and readiness for the next day, making it easier to start fresh and focused.",
    actionLabel: "Do a 5-minute shutdown",
  },
  {
    day: 7,
    title: "Weekly retro",
    tldr: "Review what worked; choose one tweak.",
    content:
      "Look at your completions this week. What helped? What got in the way? Choose one tiny tweak for next week. You’re building a system.",
      longcontent: "Regular reflection is key to continuous improvement. By reviewing your successes and challenges, you gain valuable insights into what strategies are effective and which areas need adjustment. Choosing one small tweak for the upcoming week allows you to make incremental changes that can lead to significant progress over time. This practice not only enhances your self-awareness but also helps you refine your approach to building lasting habits.",
    actionLabel: "Do 2-minute retro",
  },
];
export const WEEK_BRIEFS_OVERALL: MicroBrief[] = [
  {
    day: 1,
    title: "Decide Who You’re Becoming",
    tldr: "Identity drives behavior; choose who you’re practicing to be.",
    content:
      "You can’t hit a target you can’t see. Today you’ll define your identity for the next 30 days: the kind of person you are practicing being. Identity drives behavior. Instead of “I want to work out,” adopt “I am someone who keeps promises to myself.” Keep it simple and powerful. When you choose identity, you reduce decision fatigue—habits become expressions of who you are rather than chores.",
  longcontent: "Defining an identity is less about lofty statements and more about the tiny choices that prove the claim. Start by naming the version of yourself you want to practice for the next 30 days, then pick three micro-behaviors that would make that identity visible (for example: ‘I write for 10 minutes daily,’ ‘I walk after lunch,’ ‘I close my laptop by 8pm’). Commit to the smallest possible instance of each behavior and treat the first week as an experiment—log attempts, notice friction, and iterate. Over time the repeated behaviors change the networks in your brain and your sense of who you are, which makes consistent action feel natural rather than forced.",
    controlquestion: "If I fully embodied this identity today, what one action would prove it?",
    actionLabel: "Write a one-sentence identity statement + list 3 matching behaviors",
  },
  {
    day: 2,
    title: "One Big Reason",
    tldr: "Connect habits to your deeper values.",
    content:
      "Motivation fades; meaning endures. Your “why” should be emotionally charged enough to pull you through resistance. Tie your why to people you love, values you live by, and a future you actually want. Big reasons make small discomforts feel trivial.",
  controlquestion: "Does my #1 reason make discomfort worth it today?",
  longcontent: "A compelling reason acts like a gravitational pull when motivation wanes. To find a durable why, connect the habit to something emotionally meaningful—relationships you protect, identity you want to embody, or a future role you’re aiming for. Write a brief scene that describes a day in that future life: what you feel, who you’re with, and what has changed. Keep this scene accessible (a sticky note, a phone wallpaper) so when small resistance appears you can read the image and remember why the small pain is an investment in a larger life. The stronger and more sensory the why, the more likely you’ll persist when the immediate reward is low.",
    actionLabel: "Write down and display your #1 reason",
  },
  {
    day: 3,
    title: "Keystone Habit: Wake Time",
    tldr: "A fixed wake time stabilizes energy and willpower.",
    content:
      "Consistency beats complexity. A fixed wake time stabilizes your circadian rhythm, energy, and willpower. Protect the morning; it’s your launchpad. If nights are chaotic, mornings become your anchor.",
  controlquestion: "Did I honor my wake time today? If not, what will I adjust tonight?",
  longcontent: "A consistent wake time stabilizes rhythms that underlie focus, mood, and hunger. Choose a wake time you can realistically keep on 80% of days, then design two supporting rituals: a predictable evening wind-down (cut screens, dim lights, simple prep) and a morning anchor (water, sunlight, quick movement). Track compliance for a week and treat deviations as data—not failure. Over several weeks, the regular wake time lowers decision friction and creates reserves of willpower to spend on high-leverage tasks.",
    actionLabel: "Choose a consistent wake time and set a wind-down alarm",
  },
  {
    day: 4,
    title: "Digital Minimalism: Morning No-Scroll",
    tldr: "Guard your first hour to protect focus.",
    content:
      "Your first inputs shape your focus. Dopamine spikes from social feeds create a fog that lingers. Reclaim your attention by keeping mornings clean—no social media, no email for the first 60 minutes.",
  controlquestion: "How did my focus change without morning dopamine distractions?",
  longcontent: "Morning inputs set the tone for your day because they prime your attention and mood. A no-scroll window protects your prefrontal resources—those that plan, prioritize and persist. Replace the habit reflex with a tiny ritual: open a notebook, make a cup of tea, step outside for two minutes of light. Notice what shifts in your ability to sustain attention for the first block of work. If you catch yourself reaching for the phone, use that moment as a cue: breathe, re-state your one priority for the morning, and start the smallest possible action toward it.",
    actionLabel: "Keep phone on airplane mode and no-scroll for 60 minutes after waking",
  },
  {
    day: 5,
    title: "Move Your Body, Move Your Mind",
    tldr: "Daily movement is the fastest mood lever.",
    content:
      "Movement is the fastest mood lever. It boosts energy, confidence, and mental clarity. Don’t aim for perfect—aim for done. The identity is “I am someone who moves daily.”",
  controlquestion: "What’s the smallest workout that still makes me proud today?",
  longcontent: "Movement is a direct lever on mood and cognitive performance. You don’t need a long routine—choose the smallest motion that reliably shifts your state (a 10–20 minute walk, a short bodyweight set, or stretching with breath). Treat movement as a non-negotiable input: schedule it like a meeting and notice the mental clarity that follows. If energy is low, prioritize gentle, consistent movement over intensity; consistency compounds more than sporadic heroics.",
    actionLabel: "Do 20–30 minutes of movement and log before/after mood",
  },
  {
    day: 6,
    title: "The Two Lists: To-Do and To-Stop",
    tldr: "Progress is addition and subtraction.",
    content:
      "Success is addition and subtraction. Your progress is held back as much by low-quality inputs as by missing actions. Identify your top 3 daily needle-movers and your top 3 time-wasters.",
  controlquestion: "Which “Must Stop” will I eliminate first—and how?",
  longcontent: "High returns come from both adding the right behaviors and removing low-value ones. Make two lists: the top three things that move the needle, and the top three activities stealing time. For each item on the ‘stop’ list, design one concrete barrier (remove apps, set an auto-reply, schedule a replacement activity). For each ‘do’ item, choose the smallest experiment that increases the likelihood of execution. Systems that pair addition with subtraction free cognitive bandwidth and create space for consistent progress.",
    actionLabel: "Write 3 Must Do and 3 Must Stop items and post them where you work",
  },
  {
    day: 7,
    title: "Review and Reset",
    tldr: "Weekly reflection compounds learning.",
    content:
      "Weekly reflection compounds learning. What gets measured gets improved. Celebrate tiny wins—they’re seeds of identity. Use insights to adjust the coming week.",
  controlquestion: "What one tweak would make next week 20% more effective?",
  longcontent: "A weekly review converts friction into learning. Spend 15–20 minutes reviewing wins, slow points, and surprises. Focus on patterns: what times, environments, or triggers consistently help or hinder you? Choose one experiment for the next week—specific, timebound, and easy to measure—and schedule it. Treat the review as a forward-facing planning tool that turns insights into deliberate changes rather than vague intentions.",
    actionLabel: "Review 3 wins, 2 lessons, 1 change; recommit to wake time and no-scroll",
  },
  {
    day: 8,
    title: "The Power Block (Deep Work)",
    tldr: "Protect 60–90 minutes for single-task focus.",
    content:
      "High-output people defend one focused block daily. No multitasking; batch distractions. Train your brain to sustain attention by creating a ritual: clear desk, closed tabs, timer on, phone away. One concentrated block can move the needle more than a scattered day.",
  controlquestion: "Did I protect my power block like a meeting with my future self?",
  longcontent: "Deep work requires an orchestration of signals: a clear pre-work ritual, an environment with minimal friction, and a boundary that protects the block. Before your power block, write a one-sentence objective, remove or hide distractions, and set a single concrete subtask you can finish in the block. Use a timer and a short pre/post reflection (one sentence: ‘what I accomplished’ and ‘what to carry forward’). Over time, these rituals reduce start-up costs and amplify output during your most productive hours.",
    actionLabel: "Schedule a 60–90 minute deep work block and eliminate distractions",
  },
  {
    day: 9,
    title: "Self-Talk Upgrade",
    tldr: "Coach yourself, don’t criticize yourself.",
    content:
      "Your inner dialogue sets your limits. Replace vague negativity with precise, actionable language. Speak to yourself like a trusted coach: acknowledge the challenge, then choose your response. Clarity beats drama.",
  controlquestion: "What did I tell myself today that made action easier?",
  longcontent: "Language shapes action because it shapes identity and expectation. Replace vague criticism with concrete coaching language: name the obstacle, acknowledge it, and suggest a one-step response (e.g., ‘I’m tired, so I’ll do the smallest useful step’). Practice writing and saying these reframes aloud during small challenges; the repetition trains your inner coach. Over time your internal script will default to encouragement and solutions rather than paralysis.",
    actionLabel: "Catch one negative thought and rewrite it: “Even though X, I choose Y”",
  },
  {
    day: 10,
    title: "Tiny Wins, Big Momentum",
    tldr: "Shrink tasks until they’re startable now.",
    content:
      "Momentum loves completion. Break big tasks into 10-minute steps and finish one immediately. Progress becomes addictive when it’s visible. Let small wins snowball.",
  controlquestion: "What’s the next 10-minute step I can start now?",
  longcontent: "Shrinking tasks into immediate next steps creates a bias toward action. When a task feels large, break it into a sequence of 10-minute moves and commit to one. The first completion releases dopamine and reduces the perceived distance to the next step. Track those tiny wins—visual evidence of progress builds motivation and creates a reliable chain of forward movement.",
    actionLabel: "Split your biggest task into 3–5 steps and complete step one",
  },
  {
    day: 11,
    title: "Environment Design",
    tldr: "Make good choices easy; bad choices inconvenient.",
    content:
      "Willpower is inconsistent; environments are consistent. Remove friction for desired behaviors and add friction for temptations. Your space should quietly steer you toward your standards.",
  controlquestion: "What change in my environment nudged me forward today?",
  longcontent: "Design your environment to make the desired behavior the path of least resistance. Remove triggers for unwanted behavior, place cues for good behavior in visible spots, and create a ‘go’ zone where the primary activity happens. Small physical changes (lighting, layout, visible tools) signal your brain about what’s allowed in that space, reducing the need for willpower and improving the likelihood of automatic, desired actions.",
    actionLabel: "Remove one temptation and add one friction reducer in your workspace",
  },
  {
    day: 12,
    title: "Energy Audit: Food, Sleep, Hydration",
    tldr: "Track biology to improve psychology.",
    content:
      "Your brain runs on your body. Today, track sleep/wake times, meals, water, and energy every 3 hours. Notice patterns; small biological tweaks often yield big cognitive gains.",
  controlquestion: "What one change to my biology gave me the biggest energy return?",
  longcontent: "Biology is a multiplier for behavior. Track simple inputs—sleep, water, meals, and energy—across the day and look for correlations: when does your focus dip? What food leaves you sluggish? Make one targeted experiment (shift hydration timing, adjust meal composition, move bedtime by 30 minutes) and measure results for a week. Small biological optimizations often produce outsized gains in clarity and resilience.",
    actionLabel: "Log sleep, meals, water, and energy; choose one improvement for tomorrow",
  },
  {
    day: 13,
    title: "Curate Your Inputs",
    tldr: "Consume ideas that make you braver.",
    content:
      "You absorb the mindset of what you watch and who you follow. Replace 30 minutes of low-value content with a book, talk, or mentor aligned with your goals. Upgrade input, upgrade output.",
  controlquestion: "Did today’s inputs make me braver or more distracted?",
  longcontent: "Your mental diet shapes habit formation by determining what ideas and standards you internalize. Replace low-value consumption with content that stretches your thinking—long-form writing, a focused podcast, or a technical chapter. After consuming, distill one practical takeaway and apply it within 24 hours. This habit of curation turns passive intake into active growth and reduces the background noise that erodes attention.",
    actionLabel: "Swap 30 minutes of low-value media for a high-quality idea and note one takeaway",
  },
  {
    day: 14,
    title: "Week 2 Review and Reset",
    tldr: "Reflection converts effort into insight.",
    content:
      "Don’t just do more—do better. Review what worked and what dragged. Double down on the highest-leverage habits and schedule them like commitments.",
  controlquestion: "What will I stop doing next week to protect my focus?",
  longcontent: "At the two-week mark you have early evidence about what’s working. Do a focused review: which rituals stuck, which felt unsustainable, and what moments consistently defeated you? Keep what scales, tweak what almost worked, and remove one low-value practice. Planning small experiments rather than wholesale change preserves momentum while improving fit.",
    actionLabel: "List 3 wins, 2 lessons, 1 habit to double down on; schedule three power blocks",
  },
  {
    day: 15,
    title: "One Courageous Act",
    tldr: "Confidence grows from action, not waiting.",
    content:
      "Confidence is the memory of past action. Pick one scary-but-useful move—ask, pitch, apply, or start. Do it before noon to beat overthinking and build a new baseline for bravery.",
  controlquestion: "What fear did I face, and what story did it rewrite?",
  longcontent: "Courage is a muscle that grows with repeated, small exposures. Pick a concrete act that feels slightly uncomfortable but useful—ask for feedback, pitch an idea, or apply for an opportunity. Script the ask, rehearse briefly, then act in the morning when energy and decisiveness are higher. Reflect afterward: what surprised you? Most outcomes are less catastrophic than the fear imagined, and each act expands your comfort zone.",
    actionLabel: "Identify and complete one courageous action before noon",
  },
  {
    day: 16,
    title: "Standards, Not Feelings",
    tldr: "On low-motivation days, follow your floor, not your mood.",
    content:
      "Feelings are weather; standards are climate. Define your bare minimums so progress continues even on off days. A consistent floor creates an impressive ceiling over time.",
  controlquestion: "Did I follow my standards even when I didn’t feel like it?",
  longcontent: "Standards are predefined thresholds that preserve progress on low-energy days. Define minimal acceptable versions of your key habits—the non-negotiable floor—and practice following them when motivation dips. Over time these floors prevent long regressions and maintain identity signals even during busy or tired periods. Standards are not rigid rules; they are practical guardrails.",
    actionLabel: "Write your bare minimum standards and follow them today",
  },
  {
    day: 17,
    title: "The Compliment Reps",
    tldr: "Spot and say what’s good—specifically.",
    content:
      "Leadership begins with attention. Offer three specific, sincere compliments. You’ll train your mind to notice value and strengthen relationships without cost.",
  controlquestion: "Who did I lift today, and how did it change our connection?",
  longcontent: "Giving specific compliments trains you to notice value and strengthens relationships with almost zero cost. Be concrete: name the behavior, the impact, and why it mattered. Practicing this habit rewires attention toward strengths, improves collaboration, and builds social capital that pays dividends when you need support or honest feedback.",
    actionLabel: "Give three specific compliments (in person or written)",
  },
  {
    day: 18,
    title: "Boundaries = Self-Respect",
    tldr: "Protect your yes by saying no well.",
    content:
      "Boundaries create room for your best work. Decide response times, meeting limits, or quiet hours and communicate them calmly. Clear is kind—to others and yourself.",
  controlquestion: "What boundary did I set, and how will I uphold it?",
  longcontent: "Boundaries protect focus and energy by converting vague intentions into concrete rules. Choose one boundary you can communicate simply (e.g., ‘no meetings after 4pm’ or ‘no email before 9am’) and give it a non-negotiable reason you can state aloud. Communicate it to stakeholders if needed and set a mechanical enforcement (auto-reply, calendar block). Boundaries create predictable space for priority work and reduce the cognitive load of constant negotiation.",
    actionLabel: "Write and communicate one boundary you’ll keep",
  },
  {
    day: 19,
    title: "Learn in Public",
    tldr: "Share progress to accelerate progress.",
    content:
      "Articulating your process clarifies thinking and attracts allies. Share one short update about what you’re building or learning and a key insight from it.",
  controlquestion: "What did I learn by articulating my progress publicly?",
  longcontent: "Publishing your process clarifies thinking because it forces structure and exposes gaps. Start small: a short note describing what you tried, one metric, and one insight. Public accountability increases follow-through and attracts people who can accelerate your progress. Treat each post as feedback—look for the comments that refine your approach and the audience signals that matter.",
    actionLabel: "Post or share a brief update with one insight",
  },
  {
    day: 20,
    title: "Relationship Deposit",
    tldr: "Trust grows from small, consistent value.",
    content:
      "Be useful without keeping score. Reach out to someone you value with help, a resource, or a thoughtful check-in. Deposits compound.",
  controlquestion: "Who is better off today because I reached out?",
  longcontent: "Relationships are built through consistent, small deposits. The highest-leverage outreach is useful and personalized—share a resource, offer help, or check in with genuine curiosity. Track the outreach and the responses: small predictable investments compound into a network that supports your goals and provides tangible help when you need it.",
    actionLabel: "Message someone with a helpful resource or genuine check-in",
  },
  {
    day: 21,
    title: "Week 3 Review and Reset",
    tldr: "Notice how your courage threshold moved.",
    content:
      "Courage compounds quickly. Review your brave moments and discomfort lessons, then set a new standard for next week’s challenges.",
  controlquestion: "Where did I choose discomfort over avoidance—and what was the payoff?",
  longcontent: "At week three you have clearer signals about what’s sustainable. Do a focused retrospective: which habits moved you forward, which drained resources, and which situations predict failure? Use that insight to iterate your plan: swap weak habits for simpler ones, protect high-leverage blocks, and schedule one bold experiment that stretches your capabilities without breaking the system.",
    actionLabel: "List 3 brave moments, 2 lessons, 1 new standard; plan one courageous act",
  },
  {
    day: 22,
    title: "Systemize One Repeating Task",
    tldr: "If you do it twice, build a system once.",
    content:
      "Systems reduce decision fatigue and raise quality. Choose a repeating task and create a simple checklist or template so future you moves faster with fewer errors.",
  controlquestion: "What did I systemize, and how much time will it save weekly?",
  longcontent: "When a task repeats, invest once to create a template that saves time and reduces error. Map the steps, capture the decisions that typically arise, and build a 3–5 step checklist or template you can reuse. Measure time saved across the week; even small efficiencies compound, and systemization frees mental space for creative and strategic work.",
    actionLabel: "Create a 3–5 step checklist or template for a repeat task",
  },
  {
    day: 23,
    title: "The Weekly Preview",
    tldr: "Script the week before it scripts you.",
    content:
      "Calendars reveal priorities. Map your next seven days: top outcomes, deep work blocks, workouts, and one recovery/social block. Protect what matters first.",
  controlquestion: "Are my calendar and my priorities aligned?",
  longcontent: "A proactive weekly preview prevents context-driven planning. Block your most precious time (deep work, workouts, family) first, then fit secondary commitments around them. Identify the one outcome you must move forward this week and schedule focused sessions to support it. This preview turns vague intentions into enforceable commitments your future self can honor.",
    actionLabel: "Plan the next 7 days with outcomes and scheduled blocks",
  },
  {
    day: 24,
    title: "Upgrade Your Environment v2",
    tldr: "Iterate your setup for compounding focus.",
    content:
      "Small environmental tweaks compound over time. Optimize lighting, ergonomics, and visual clutter. Keep one inspiring object visible; remove one more distraction.",
  controlquestion: "What single change improved my focus most?",
  longcontent: "Iteration unlocks compounding returns. Revisit your workspace: optimize for light, posture, and minimal distractions. Remove one common friction (replace a slow mouse, improve lighting, declutter a shelf) and add one inspiration (a note, a photo, or a book). Test changes for a week and keep what measurably improves your attention.",
    actionLabel: "Make one optimization and remove one distraction from your workspace",
  },
  {
    day: 25,
    title: "Teach What You Know",
    tldr: "Teaching cements mastery.",
    content:
      "Sharing a concept clarifies it. Create a short how-to or Loom explaining one tactic that helped you this month. Generosity multiplies learning.",
  controlquestion: "What became clearer to me by teaching it?",
  longcontent: "Teaching forces clarity because you must translate tacit knowledge into explicit steps. Choose a single concept you used this month and explain it in 3–5 concise points—what it is, why it matters, and how to do it. Recording or writing the explanation consolidates learning and often reveals gaps you can fill to improve mastery.",
    actionLabel: "Publish a short how-to explaining one concept you used",
  },
  {
    day: 26,
    title: "Recovery Is a Skill",
    tldr: "Deliberate rest fuels performance.",
    content:
      "High performance requires cycles of stress and repair. Schedule a brief, intentional recovery session and aim for an early bedtime. Restoration is strategic.",
  controlquestion: "How did intentional recovery affect my mood and clarity?",
  longcontent: "Treat recovery like training: schedule deliberate rest that restores cognitive and physical resources. Choose an active recovery (walk, light stretching, breathing) and pair it with a wind-down routine for sleep. Consistent recovery increases resilience and productivity during high-demand periods—think of it as investment in future performance rather than indulgence.",
    actionLabel: "Do 20–30 minutes of active recovery and sleep early",
  },
  {
    day: 27,
    title: "Financial Integrity Mini-Audit",
    tldr: "Clarity with money reduces anxiety.",
    content:
      "Self-improvement includes your finances. Review the last 30 days of spending, identify easy cuts, and pick one investment in your growth (education, health, tools).",
  controlquestion: "What money habit will give me the best ROI next month?",
  longcontent: "Financial clarity reduces stress and frees cognitive bandwidth for growth. Review last month’s spending, flag recurring drains, and identify one small, sustainable change (a subscription to cancel, a budget category to trim). Decide on one intentional investment—an education course, a tool, or a health expense—and schedule it. Small financial discipline compounds into stability and options.",
    actionLabel: "Identify 3 cuts and 1 investment for the coming month",
  },
  {
    day: 28,
    title: "Identity Calibration",
    tldr: "Refine the identity you’ve practiced.",
    content:
      "Update your Day 1 statement with specifics. Keep what felt authentic and upgrade what didn’t. Tie identity to visible behaviors and values you’re proud of.",
  controlquestion: "What evidence proves I am becoming this person?",
  longcontent: "After a month of practice, refine your identity statement with real evidence. Look for behaviors you repeated without friction and the moments that felt aligned. Update your statement to be specific, measurable, and compelling. The calibration lets you keep the parts that became effortless and adjust what felt aspirational but unrealistic.",
    actionLabel: "Rewrite your identity statement with concrete habits and values",
  },
  {
    day: 29,
    title: "The 90-Day Bridge",
    tldr: "Extend 30-day momentum into 90-day outcomes.",
    content:
      "Transformation needs time frames. Pick three 90-day outcomes with a clear why, weekly actions, and simple metrics. Schedule check-ins to stay honest.",
  controlquestion: "What will be undeniably different in 90 days if I follow this plan?",
  longcontent: "Thirty days builds momentum; ninety days builds habit scaffolding. Translate the behaviors you sustained this month into weekly rhythms that scale to 90 days: define outcomes, leading indicators, and a simple check-in cadence. Keep metrics small and measurable so you can course-correct, and commit to one accountability mechanism (a partner, a public log, or a weekly review) to maintain focus across the longer horizon.",
    actionLabel: "Define 3 outcomes, whys, weekly actions, and metrics for 90 days",
  },
  {
    day: 30,
    title: "Gratitude and Commitment",
    tldr: "Close strong; decide what continues.",
    content:
      "Gratitude locks in joy; commitment sustains progress. Thank your past self for starting. Choose one daily ritual and one weekly ritual to carry forward.",
  controlquestion: "What single promise will I keep to myself from here on?",
  longcontent: "Closing a 30-day arc benefits from both celebration and intentional continuation. Spend time thanking your past self and noting three specific wins—however small. Then choose one daily ritual and one weekly ritual to continue: make them tiny enough to be non-negotiable. Finally, set a simple accountability step (a calendar reminder, a public post, or a check-in buddy) so the next month begins with momentum rather than a fresh decision.",
    actionLabel: "Write a thank-you note to yourself and select daily/weekly rituals",
  },
];

export function getBriefForDay(day: number, type:string): MicroBrief | null {
  if(type==="overall improvement") return WEEK_BRIEFS_OVERALL.find((b) => b.day === day) ?? null;
  if(type==="focus") {
    return WEEK1_BRIEFS_FOCUS.find((b) => b.day === day) ?? null;
  }
  return null;
}
