/* What Sunny knows: one structured source for the scripted answers in the
   page (sunny-ai.js) and for the Claude prompt on the worker (ai/worker.js).
   Every fact here is on the site. If something is not on the site, it is not
   here, and Sunny says it does not know.

   Loads as a plain script in the browser and as `import "./knowledge.js"` in
   the worker; both read globalThis.SUNNY_KNOWLEDGE. */
(function (g) {
  "use strict";
  var MAIL = "ganesh.rayanbalu@gmail.com";

  var profile = {
    name: "Ganeshkumar B",
    shortName: "Ganesh",
    pronoun: "he",
    title: "Senior Product Designer (Visual & Systems) on Zoho SalesIQ",
    oneLiner: "Ganesh works on complex SaaS products, turning workflows that feel overwhelming into experiences that make sense.",
    summary: "Senior product designer with 8+ years on one enterprise B2B SaaS product, Zoho SalesIQ: live chat, chatbots, messaging, mobile SDKs and WhatsApp. He leads end-to-end product design and owns the 26+ component design system underneath it, with a focus on the bridge between design and development: Figma variables, design tokens, Code Connect and AI-assisted workflows with Claude and Figma MCP.",
    experience: [
      "Senior Visual Designer, Product Design, Zoho SalesIQ, Aug 2024 to present: leads end-to-end product design across web, mobile SDK and WhatsApp; owns the design system (26+ components on tokens and Figma variables) supporting a five-member engineering team across 20+ product modules; introduced Figma MCP and Code Connect; redesigned the Operator Console; runs design reviews and sets product design practices.",
      "Visual Designer, Zoho SalesIQ, Jul 2018 to Aug 2024: sole designer on Zobot, the no-code chatbot builder; designed nine more product areas end to end (Reports 2.0, Proactive Chat, Brand configuration, Outbound broadcasts, Push campaigns, Survey integration, Rating & Feedback); ran user research, usability testing and customer feedback analysis; made product walkthroughs and launch videos shown at Zoholics and partner events.",
      "Visual Designer, intern, Zoho Corporation, Apr to Jul 2018."
    ],
    education: "BCA, Computer Applications, Kongu Arts and Science College (Bharathiar University), 2014 to 2017. Uxcel courses in UX/UI foundations, UI components and HTML for designers.",
    story: "He started in visual design, where he learned to care about the details, moved into product design to look beyond screens at the problems people face, and now works across product experiences, design systems and the space between design and code.",
    highlights: ["8+ years on one enterprise product, intern to senior", "26+ components in the design system he runs", "10+ product areas designed end to end", "7 channels the chatbot builder ships on today"],
    location: "Chennai, India, on IST",
    workModes: "On-site or hybrid in Chennai, fully remote for an Indian or an international team with IST overlap, and open to relocating for the right role.",
    lookingFor: "A lead, staff or senior product design role with design system ownership, in an enterprise or B2B SaaS team that ships. Most useful where design and engineering need one source of truth.",
    notice: "30 days",
    replies: "within a day, usually the same day",
    email: MAIL,
    links: { linkedin: "https://www.linkedin.com/in/ganeshkumarb1997/", behance: "https://www.behance.net/ganeshrayanbalu", dribbble: "https://dribbble.com/GaneshRayanbalu", instagram: "https://www.instagram.com/rayanuxvibes/" },
    tools: "Figma every day: variables and modes, Code Connect, Dev Mode and Figma MCP. Claude and ChatGPT for critique, research synthesis and design-to-code. Photoshop, Illustrator, After Effects and Spline for visuals and motion. HTML and CSS for prototypes and this site.",
    coding: "Enough to ship this site and to speak the language of the people who build his designs: HTML and CSS by hand, JavaScript with help from Claude. On the product he works in Figma variables and Code Connect so every component maps to its real code, and uses Figma MCP to generate production components from the library. He is not a front-end engineer and does not pretend to be one.",
    leadership: "He has led the design direction, not the people: he owns the design system and the design reviews across a five-engineer team, sets the product design practices and aligns product managers and engineers on what ships. No direct reports yet; a lead role where that changes is what he is looking for.",
    research: "He has run user research, usability testing and customer feedback analysis on SalesIQ. Zobot is the honest counter-example: it launched on website chat with no formal testing and was shaped by feedback once it was live.",
    skills: {
      "Product design": ["User research", "Usability testing", "Information architecture", "Interaction design", "Prototyping", "Accessibility", "Design strategy"],
      "Design systems": ["Component libraries", "Design tokens", "Figma variables and modes", "Code Connect", "Cross-platform consistency", "Governance"],
      "AI-assisted design": ["Figma MCP", "Claude", "ChatGPT", "Figma AI", "Prompt engineering", "AI design-to-code workflows"],
      "Leadership": ["Design reviews and critique", "Product design practices", "Stakeholder management", "PM and engineering alignment"],
      "Visual and motion": ["UI", "Visual and brand design", "Motion", "Photoshop", "Illustrator", "After Effects", "Spline"],
      "Front end": ["HTML", "CSS"]
    },
    nda: "Most of the work is under NDA with Zoho. The case studies recreate every screen with sample data, internal metrics are left out, and the full Figma files are walked through live on a call or shared with a password on request."
  };

  /* Each project: the facts on its case study page, section by section.
     `keys` are words a visitor might use; `tags` describe the kind of problem, for recommendations. */
  var projects = [
    {
      id: "zobot", num: "01", name: "Zobot", path: "case-zobot.html",
      title: "From a basic bot flow to a complete chatbot builder",
      summary: "Zobot is the no-code chatbot builder in Zoho SalesIQ. Ganesh redesigned it from a short linear sequence of steps into a visual builder for contextual, multi-path conversations, without writing code.",
      role: "Product design, end to end, as the sole designer. Team: design and engineering. Web app. 2018 to 2024, shipped in SalesIQ 2.0.",
      problem: "SalesIQ already had a basic, mostly linear way to define a bot: welcome, question, collect, hand off. As the product grew that was not enough. A chatbot collects information, understands responses, handles decisions and branches, performs actions and connects to workflows, and all of it had to fit one visual environment that is approachable for beginners and flexible enough to grow.",
      approach: "Three interaction models were weighed: a linear flow (simple, but branching has to live elsewhere), a freeform canvas (flexible, but hard to follow as flows grow) and a structured flow, the chosen direction: blocks on a canvas, with connections that keep a direction. The design principle: the conversation should read like a list but behave like a flowchart. The builder brings three areas together: a canvas to see the whole conversation left to right, blocks to build it (each output is a place to continue), and a panel that configures the selected block beside the canvas, never on another screen.",
      system: "The blocks (called cards in the product) share one anatomy: block type in the title bar with its family in the foot, an editable title, the content the visitor sees, and output ports where the conversation continues. Four families cover what a bot says (Response), does (Action), collects (Data) and connects to (Integration: Zoho CRM, Desk, webhooks, APIs, workflows).",
      decisions: ["A flowchart, not a script: conversation logic is visible where it happens.", "Start simple, customise when needed: defaults first, advanced controls when asked for.", "Built to expand: new blocks and integrations fit the same system."],
      outcome: ["Visual control over logic: routing and branches are drawn, not scripted.", "Flexibility without code: questions, data and hand-offs are blocks anyone can place.", "A foundation for complex bots: new blocks, templates and channels arrived without changing the canvas.", "Ganesh designed the canvas, block system and configuration, shipped on website chat. The SalesIQ team then extended it with templates, import and export, more block types, integrations, seven channels, 30 languages and Bring Your Own AI; those later capabilities belong to the product team. Internal metrics stay under the NDA."],
      learned: "Defaults matter as much as features. A flexible builder is only useful when people know where to start: structure, sensible defaults, and the freedom to customise as complexity grows.",
      honest: "Zobot launched on website chat with no formal testing before launch and was shaped by feedback once it was live.",
      sections: [
        { id: "part-01", label: "Context", title: "A simpler flow wasn’t enough anymore.", summary: "Zobot began as a basic, linear bot builder: good for simple use cases, but it showed its limits as conversation needs grew." },
        { id: "part-02", label: "Challenge", title: "As conversations grew, the builder became harder to use.", summary: "Linear interaction felt restrictive, configuration was disconnected from the flow, and growing complexity was hard to maintain." },
        { id: "part-03", label: "Exploration", title: "Finding the right way to build conversations.", summary: "Three interaction models compared: linear flow, freeform canvas and the chosen structured flow, a directional canvas that stays readable and scalable. Principle: read like a list, behave like a flowchart." },
        { id: "part-04", label: "Experience", title: "From individual steps to a connected conversation.", summary: "See the whole conversation, build through blocks, configure in context." },
        { id: "part-05", label: "System", title: "Different jobs. One shared anatomy.", summary: "Every block shares one structure (title, content, options, block type, output ports); four families: Response, Action, Data, Integration." },
        { id: "part-06", label: "Design decisions", title: "Three key decisions shaped the builder.", summary: "A flowchart, not a script; start simple and customise when needed; built to expand." },
        { id: "part-07", label: "In action", title: "A conversation, built visually.", summary: "A callback flow: a single-choice question routes Yes to contact details and a thank-you, No to closing the chat." },
        { id: "part-08", label: "Shipped, then it grew", title: "From a focused builder to a broader platform.", summary: "2018 original design, 2020 team implementation, 2022 to 2024 product evolution with more block types, integrations, channels and AI." },
        { id: "part-09", label: "Outcome", title: "Complex conversations became easier to build, understand and extend.", summary: "Visual control over logic, more flexibility without code, a foundation for more complex chatbot experiences." },
        { id: "part-10", label: "Reflection", title: "Defaults matter as much as features.", summary: "A flexible builder is only useful when people know where to start." }
      ],
      questions: ["What was the main problem?", "Why was the canvas chosen?", "What was Ganesh’s role?", "What changed after the redesign?"],
      keys: ["zobot", "chatbot", "bot builder", "bot", "no-code", "no code", "canvas", "flowchart", "blocks"],
      tags: ["complex ux", "complexity to simplicity", "no-code", "builder", "logic", "canvas", "workflow"]
    },
    {
      id: "design-system", num: "02", name: "Design system", path: "case-design-system.html",
      title: "One system. Multiple products. A connected workflow.",
      summary: "A unified design system for Zoho SalesIQ that connects foundations, components and code: 147 variables, 26 components, 359 variants, three platforms and two themes, all from one source of truth.",
      role: "Design systems lead. Scope: tokens, components, platforms, documentation and code. Built with Figma variables, Code Connect, Claude with Figma MCP, HTML and CSS.",
      problem: "As SalesIQ grew the interface drifted: the same components looked and behaved differently across modules, which meant inconsistency, repeated effort and slower delivery. A design system fails quietly.",
      approach: "One source, several outputs. Instead of separate definitions in design and code, a shared system drives both: the Figma library designers use and the components engineers ship come from the same definitions. The path runs from a semantic token (bg/brand resolving to a primitive, one answer per theme) to a component with every fill, radius, height and spacing bound to a token, to the interface.",
      system: "Foundations: 57 colour primitives in six ramps, 40 semantic tokens with a Light and a Dark value each, text styles bound to platform variables, 11 spacing steps and 6 radius steps. Components: 26 share one anatomy (container, leading icon, label, trailing icon); the Button alone has 24 variants, four styles by six states. Adaptability: a Platform collection changes control heights, type and layout for desktop (40), tablet (44) and mobile (48), so nothing is redrawn. Design and code: tokens live as Figma variables, Code Connect maps every component to its production counterpart so the inspector shows real code, and the component library ships the same tokens as CSS custom properties, one class per component. Quality: build, validate (audit bindings, render every component in both themes), release, evolve with a changelog.",
      decisions: ["One source of truth: requirements enter once and drive both the Figma library and the shipped components.", "Primitives underneath, meaning on top: semantic tokens give raw values a job, with one answer per theme.", "One component, three platforms: the Platform collection adapts height, type and layout; nothing is redrawn.", "Every component mapped to its code with Code Connect, so design and engineering stay in step."],
      outcome: ["147 variables, 26 components, 359 variants, 3 platforms, 2 themes. Counts from the system build; no adoption, efficiency or business figures are claimed.", "The same parts power very different screens, from a focused live chat to a data-rich operator console.", "An AI-assisted workflow with Claude and Figma MCP generates the system twice, as a Figma library and as production components, always bound to the tokens."],
      learned: "A system is infrastructure, not a collection. It is a connected foundation that keeps design and development aligned, consistent and ready to scale.",
      sections: [
        { id: "part-01", label: "The problem", title: "The gap between Figma and code.", summary: "Components were being defined and rebuilt in multiple places, leading to inconsistencies across design, code and product surfaces." },
        { id: "part-02", label: "Context", title: "One button, every surface.", summary: "A single chat action, adapted for different contexts, but consistent in structure, behaviour and brand." },
        { id: "part-03", label: "Foundations", title: "Tokens first.", summary: "A token system that brings order to colour, typography, spacing and more, with a clear hierarchy from primitives to semantic tokens to component tokens." },
        { id: "part-04", label: "Architecture", title: "Figma to code without the gap.", summary: "A connected workflow that takes design decisions from tokens to production, with AI-assisted implementation." },
        { id: "part-05", label: "The solution", title: "26+ components on top.", summary: "A reusable component library built on a consistent anatomy, interaction patterns and token-driven styling." },
        { id: "part-06", label: "Implementation", title: "Designed once, generated twice.", summary: "The same component definition produces both a Figma library for design and a production-ready component for engineering." },
        { id: "part-07", label: "Impact", title: "Shipped on three surfaces, from one source.", summary: "A single system now powers multiple product surfaces with greater consistency, faster delivery and easier maintenance." },
        { id: "part-08", label: "Reflection", title: "One source of truth.Zero drift.", summary: "The system is only as good as the gap between Figma and code. My job is to keep that gap at zero." }
      ],
      questions: ["How is the system structured?", "How does Figma connect to code?", "How does the system scale across platforms?", "Where does AI fit in the system?"],
      keys: ["design system", "components", "tokens", "variables", "code connect", "mcp", "figma mcp", "26", "system", "foundations", "primitives", "semantic"],
      tags: ["design system", "tokens", "design to code", "ai workflow", "consistency", "scale", "infrastructure"]
    },
    {
      id: "operator-console", num: "03", name: "Operator Console", path: "case-operator-console.html",
      title: "From a crowded console to a focused workspace",
      summary: "The operator console had everything operators needed, but finding, understanding and acting on information took more effort than it should. Ganesh redesigned it into one connected workspace: queue, conversation and visitor context in one view.",
      role: "Product Designer, experience redesign. Zoho SalesIQ, web.",
      problem: "The console had grown over time, adding features and panels. That made it powerful but visually crowded and harder to navigate: multiple elements competing for attention, key details fragmented across separate panels, and operators scanning more than necessary to take action.",
      approach: "The design challenge was to make a complex workspace feel simpler without losing power, balancing information against focus, flexibility against structure, and density against clarity. Instead of separate, independent panels the console became one workspace where conversations, context and actions work together, following the operator’s path: find the right conversation, understand the context at a glance, respond without losing context, and resolve with the next action.",
      decisions: ["Clearer hierarchy: conversations and actions come first.", "Cleaner layout: unnecessary dividers and density removed, more deliberate space allocation.", "Focused context: relevant visitor, CRM and session details kept in one place."],
      principles: ["Focus on the conversation: it takes the widest, central area.", "Context available, not overwhelming: visitor, CRM and session details are scannable and structured.", "Actions within the flow: assign, close and note without leaving the conversation."],
      outcome: ["A more focused foundation for customer conversations: everything operators need sits in one place, so they understand, respond and act with less effort. Internal metrics stay under the NDA."],
      learned: "A workspace is more than the sum of its panels. Redesigning a complex product is not about removing information; it is about understanding what deserves attention, when it matters, and how the parts work together.",
      sections: [
        { id: "part-01", label: "The problem", title: "Everything was there. But the experience needed to evolve.", summary: "The console had grown into a workspace with multiple navigation layers, conversation queues, chat, visitor details and CRM information. Each served a purpose, but together they made it harder to stay focused and move between information and action." },
        { id: "part-02", label: "The design challenge", title: "How do we make a complex workspace feel simpler?", summary: "The challenge was to make a feature-rich console easier to navigate and operate, without removing the depth operators rely on every day." },
        { id: "part-03", label: "The approach", title: "From individual panels to a connected workspace.", summary: "Rather than treating every area as an equally important panel, I restructured the console around distinct roles: navigation, conversation management, active chat and contextual information." },
        { id: "part-04", label: "The experience", title: "A clearer path through every conversation.", summary: "The redesigned console follows an operator’s natural flow: locating a conversation, understanding its context, responding and taking action, without losing context along the way." },
        { id: "part-05", label: "Key design decisions", title: "Less visual noise. More clarity.", summary: "The redesign sets clearer boundaries between areas, creates a stronger visual hierarchy and keeps supporting information easy to reach." },
        { id: "part-06", label: "Design principles", title: "Three principles shaped the redesign.", summary: "Three principles shaped the redesign." },
        { id: "part-07", label: "The outcome", title: "A more focused foundation for customer conversations.", summary: "A more focused foundation for customer conversations." },
        { id: "part-08", label: "Takeaway", title: "A workspace is more than the sum of its panels.", summary: "Redesigning a complex product isn’t about removing information. It’s about understanding what deserves attention, when it matters, and how each part works together." }
      ],
      questions: ["What made the old console hard to use?", "How was the workspace restructured?", "What principles guided the redesign?", "What was the outcome?"],
      keys: ["operator", "console", "operator console", "agents", "agent", "queue", "support", "workspace", "inbox"],
      tags: ["complex ux", "density", "workspace", "all-day tool", "hierarchy", "workflow efficiency"]
    },
    {
      id: "reports", num: "04", name: "Reports and analytics", path: "case-reports.html",
      title: "Reports and analytics revamp",
      summary: "SalesIQ’s numbers were spread across modules. Ganesh owned the design of the Reports revamp, shipped as Reports 2.0: one place to read engagement, support, bots, outbound and live activity.",
      role: "Owned product design. Web dashboard. 2018 to 2024, as Visual Designer. Built with KPI cards, charts, heatmaps and tables.",
      problem: "Every module kept its own figures, each shown its own way. Admins and team leads, who need to trust the numbers, had to hunt for them.",
      approach: "Reports were regrouped by the question an admin asks rather than where the data comes from: Volume and demand (how much is coming in?), Operations (how well are we handling it?), Bots (how much do bots take on?) and Live insights (what is happening right now?). Every report reads top to bottom in the same four layers: the number, the trend, the breakdown, and the rows behind it.",
      decisions: ["Show the change, not just the number: every KPI carries its change against the previous period.", "One time axis for every chart on a page, so spikes and dips line up.", "The rows are always one scroll away: each report ends in the chats behind the numbers, with export and email."],
      outcome: ["Shipped as Reports 2.0: one analytics surface with seven report groups (Brands, Operators, Outbound, Volume and demand, Operations, Bots, Live insights), each answering a single question and ending in its rows."],
      learned: "Every chart should answer one question. Once reports were grouped by the question an admin asks, the navigation became obvious and choosing the right chart got much easier.",
      sections: [
        { id: "part-01", label: "Context", title: "Reports were valuable, but hard to navigate.", summary: "The existing reports provided useful data, but the experience felt fragmented, visually noisy and inconsistent across different report types." },
        { id: "part-02", label: "The challenge", title: "How can we make complex operational data easier to scan, compare and explore?", summary: "How can we make complex operational data easier to scan, compare and explore?" },
        { id: "part-03", label: "The approach", title: "A clearer structure for deeper insights.", summary: "I reimagined the reporting experience around a simple, consistent structure: overview, trends, distribution and detailed records." },
        { id: "part-04", label: "The new experience", title: "From high-level performance to conversation details.", summary: "A unified reporting experience with clear hierarchy, consistent visual patterns, and everything teams need to understand, monitor and improve customer interactions." },
        { id: "part-05", label: "The outcome", title: "A more consistent, structured and actionable reporting experience.", summary: "A more consistent, structured and actionable reporting experience." }
      ],
      questions: ["How were the reports reorganised?", "What does every report page share?", "What decisions shaped it?", "What shipped?"],
      keys: ["reports", "report", "analytics", "charts", "chart", "dashboard", "metrics", "kpi", "data"],
      tags: ["data", "information architecture", "analytics", "dashboard"]
    },
    {
      id: "brand-configuration", num: "05", name: "Brand configuration", path: "case-brand-configuration.html",
      title: "Brand configuration, rebuilt as self-service",
      summary: "Setting up a brand across website, app and WhatsApp needed developer help. Ganesh rebuilt Brand as a self-service home: shared business settings set once, and every channel on its own card.",
      role: "Product design and information architecture. Web, SDK and WhatsApp. 2018 to 2024, as Visual Designer.",
      problem: "A brand was a long list of settings, one at a time, and admins who run a brand often had no developer nearby to set up a new channel.",
      approach: "The split that made self-service possible: business settings (departments, hours, language, privacy) belong to the brand and are set once; channel settings (install code, look, connection) belong to each channel. The brand became the home, with its name, logo and details at the top of every page, and each channel a card showing its status: active, not set up, or upcoming.",
      decisions: ["The brand is the home, not the channel.", "Shared first, channel second: adding a channel only asks for what is new about it.", "Room for the next channel: new channels slot in as one more card."],
      outcome: ["Admins now configure web, SDK and WhatsApp themselves, brand by brand; today nine channels sit on one page with their status."],
      learned: "Settings are a place, not a list. Giving each brand one home with every channel visible did more for self-service than any single new setting.",
      sections: [
        { id: "part-01", label: "Context", title: "One brand, many channels.", summary: "A brand in SalesIQ works across multiple surfaces (website, mobile SDK and WhatsApp) with a consistent identity and experience. Before, that brand was set up in three different places." },
        { id: "part-02", label: "The transformation", title: "From a settings list to a brand home.", summary: "Earlier, a brand was a long list of settings spread across pages. The new brand home gives a clear overview and an entry point for each channel." },
        { id: "part-03", label: "The approach", title: "Set once, used everywhere.", summary: "A shared business setup for the brand, and channel-specific configuration for unique needs, so nothing is repeated and things stay consistent." },
        { id: "part-04", label: "Chat window customisation", title: "Your brand, inside every conversation.", summary: "A focused, structured customisation experience for the chat window, from how it launches to how conversations look and feel, with a live preview at every step." },
        { id: "part-05", label: "The decisions", title: "Three decisions that shaped it.", summary: "Three decisions that shaped it." },
        { id: "part-06", label: "What changed", title: "What changed.", summary: "A more focused, flexible and scalable brand configuration experience." },
        { id: "part-07", label: "The takeaway", title: "“Settings are a place, not a list.”", summary: "“Settings are a place, not a list.”" }
      ],
      questions: ["What made brand setup hard before?", "What is shared and what is per channel?", "Why cards for channels?", "What did he learn?"],
      keys: ["brand", "brand configuration", "channels", "channel", "whatsapp", "widget", "settings", "self-service", "self service"],
      tags: ["configuration", "self-service", "information architecture", "settings"]
    },
    {
      id: "outbound", num: "06", name: "Outbound campaigns", path: "case-outbound.html",
      title: "Outbound broadcast and push campaigns",
      summary: "Sometimes the business should speak first. Ganesh designed how teams write a campaign, choose who gets it, schedule it and see how it went, on WhatsApp, the web and mobile.",
      role: "Product design. WhatsApp, web push and mobile push. 2018 to 2024, as Visual Designer. Built with a composer, live preview and scheduler.",
      problem: "Teams could answer a chat but had no single place to write a message once, choose who gets it, schedule it and see the result. Messages went out unseen, each channel had its own rules, and nothing planned frequency, so reaching out could turn into spamming.",
      approach: "One composer with a live preview beside the editor, and four steps in the order people think about them: audience, message, schedule, results. Three destinations share it: in-chat message cards, web and mobile push, and WhatsApp broadcasts built on pre-approved templates.",
      decisions: ["Preview beside the editor, so nobody sends a message they have not seen.", "Type % to personalise: visitor details drop in with one keystroke.", "Frequency is part of the plan: start, end and how often are set with the campaign."],
      outcome: ["Shipped across three channels: WhatsApp broadcasts at scale, web and mobile push campaigns, and broadcast and proactive results read from a single dashboard."],
      learned: "People trust what they can see. Showing a message exactly as the visitor will see it answered most questions before anyone had to ask them.",
      sections: [
        { id: "part-01", label: "The opportunity", title: "Conversations don’t always begin with the customer.", summary: "Businesses often need to reach out: to share updates, follow up, promote offers or send timely reminders. The opportunity was to bring outbound communication into SalesIQ with the right flexibility and control." },
        { id: "part-02", label: "Two ways to reach out", title: "One is personal. One is for many.", summary: "One is personal. One is for many." },
        { id: "part-03", label: "Proactive messages", title: "Reach the right person at the right moment.", summary: "Initiate conversations based on visitor conditions, frequency and activation schedules, with complete control over who sees the message and when." },
        { id: "part-04", label: "Broadcasts", title: "A message built to reach an audience.", summary: "Create, configure and send messages to a targeted group, with support for rich content, templates, scheduling and response routing." },
        { id: "part-05", label: "The core decisions", title: "Compose. Target. Schedule. Route.", summary: "The outbound experience comes together through four key decisions, each designed to give businesses the right control without adding complexity." },
        { id: "part-06", label: "From message to conversation", title: "The message is the beginning.", summary: "Outbound messages don’t end at delivery. Responses flow back into SalesIQ, where bots or teams can continue the conversation." },
        { id: "part-07", label: "The outcome", title: "“Different needs. Different ways to reach out. One connected experience.”", summary: "“Different needs. Different ways to reach out. One connected experience.”" }
      ],
      questions: ["What problem did campaigns solve?", "Why a live preview?", "How is frequency handled?", "Which channels shipped?"],
      keys: ["outbound", "broadcast", "broadcasts", "push", "campaign", "campaigns", "notification", "messaging"],
      tags: ["communication", "campaign workflow", "composer", "preview"]
    },
    {
      id: "feedback", num: "07", name: "Rating and Feedback", path: "case-feedback.html",
      title: "Survey, Rating and Feedback",
      summary: "The end of a chat is the best moment to ask how it went. Ganesh redesigned Rating & Feedback so teams choose how visitors rate, how SalesIQ replies to each answer, and when to hand off to a full Zoho Survey.",
      role: "Product design. Live chat, bots and follow-up workflows. 2018 to 2024, as Visual Designer.",
      problem: "The rating came in one format with one reply, whatever the visitor said. An unhappy visitor got the same thank-you as a happy one, and anything longer than one question meant leaving the conversation.",
      approach: "Two findings shaped it: the easiest question gets the most answers, and a bad experience needs help, not a thank-you. The flow stays inside the chat window: the chat ends, the visitor rates with one tap, a comment is optional, and the reply depends on the rating. Teams pick the format that fits their brand (happy, neutral, sad faces; one to five stars; or yes/no), and a Zoho Survey opens inside the conversation when more questions are needed.",
      decisions: ["One tap first: the rating is a single tap and the comment is optional.", "Reply to how they feel: each rating leads somewhere different, so a bad experience gets help.", "A survey when you need more: Zoho Survey opens inside the conversation and maps answers to the visitor."],
      outcome: ["Shipped as one feedback loop: rating in the brand’s format, follow-up replies by rating, and surveys inside the chat."],
      learned: "The easiest question gets the most answers. Keeping the first step to a single tap mattered more than any question that came after it.",
      sections: [
        { id: "part-01", label: "The problem", title: "Feedback existed. Understanding it took more effort.", summary: "The previous experience placed feedback within the conversation workspace. Reviewing responses meant navigating a chat-centric interface, where feedback, conversation history and visitor information shared the same space." },
        { id: "part-02", label: "The reframing", title: "Make feedback the starting point.", summary: "We moved from a conversation-centric view to a dedicated feedback experience, designed to help teams review, explore and act on customer sentiment more effectively." },
        { id: "part-03", label: "Sentiment", title: "See sentiment at a glance.", summary: "See sentiment at a glance." },
        { id: "part-04", label: "Context", title: "Read feedback in context.", summary: "Read feedback in context." },
        { id: "part-05", label: "Conversation", title: "Keep the conversation close.", summary: "Keep the conversation close." },
        { id: "part-06", label: "Takeaway", title: "Feedback is more than a score.", summary: "It is the context that makes it meaningful." }
      ],
      questions: ["Why one tap first?", "How do replies change by rating?", "When does a survey take over?", "What did he learn?"],
      keys: ["feedback", "rating", "ratings", "survey", "stars", "csat", "satisfaction", "emoji"],
      tags: ["user feedback", "experience design", "end of chat", "forms"]
    }
  ];

  var practice = {
    process: [
      { n: "01", name: "Understand", text: "Research, customer needs and the real problem." },
      { n: "02", name: "Explore", text: "Turn insights into flows, ideas and interaction possibilities." },
      { n: "03", name: "Systemize", text: "Patterns, components, tokens and consistency." },
      { n: "04", name: "Build", text: "Bring design and engineering together to make the experience real: a prompt goes in, Figma MCP builds the component, Code Connect returns the code." }
    ],
    principles: ["Clarity over complexity", "Systems over screens", "Design with engineering"],
    designToCode: "Tokens first, as Figma variables with light, dark and three platform modes. Components bound to them, with one shared anatomy. Code Connect maps each Figma component to its production counterpart so the inspector shows real code. Figma MCP lets Claude read the system and generate components bound to the same variables. Review, then ship: the library and the code stay in step because the same tokens drive both.",
    critique: "Critique in order: goal, flow, hierarchy, component, pixel. One question per layer.",
    ai: {
      rule: "AI drafts, he decides. Nothing generated ships unreviewed.",
      does: ["First passes at variants, dark-mode values, copy and code.", "Reads the system through Figma MCP and keeps to the tokens it finds.", "Maps components to code through Code Connect and writes usage examples.", "Critiques a screen in order when asked.", "Wrote the JavaScript on this site, and most of the CSS, from his brief."],
      decides: ["What the problem is and whether it is worth solving.", "The palette, type scale, spacing rhythm and names.", "What ships: every generated screen is reviewed against the tokens.", "Every number: a metric AI cannot source comes out.", "When to stop."],
      rules: ["Draft, never decide.", "Tokens or nothing: a generated component binds to the system’s variables or it is rejected.", "No real data in prompts.", "Say when it is AI."],
      wrong: "The site documents six times AI got it wrong, each caught by review: the logo’s g went white in dark mode, a 30% metric that did not exist was deleted, career years were guessed from date ranges, a gallery rendered blank, a one-page resume spilled to two, and a resume button read as nonsense to a screen reader."
    }
  };

  var portfolio = {
    site: "Designed in Figma, built with Claude in plain HTML, CSS and JavaScript. No framework, no build step. Hosted on GitHub Pages since 13 November 2026.",
    pages: [
      { path: "index.html", name: "Home", what: "Hero, selected work, process, story, playground, writing, skills, AI and contact." },
      { path: "hire.html", name: "Hiring me? Quick answers", what: "Roles that fit, where he works, the FAQ, questions he would love to be asked." },
      { path: "assets/Ganeshkumar-B-Resume.pdf", name: "Resume (PDF)", what: "The resume as a PDF download, from the Resume button in the header of every page." },
      { path: "how-i-use-ai.html", name: "How I use AI", what: "What AI does, what he decides, where it sits in the workflow, and six times it got it wrong." },
      { path: "prompts.html", name: "Prompt library", what: "Seven prompts for tokens, components, Code Connect and critique, free to copy or download as Markdown." },
      { path: "how-this-site-was-built.html", name: "How this site was built", what: "The setup, the timeline, and AI drafts beside the finals." }
    ],
    home: [
      { id: "work", name: "Selected work", what: "Seven case studies." },
      { id: "process", name: "Process", what: "Understand, Explore, Systemize, Build, with the prompt-to-component loop replayed." },
      { id: "story", name: "Story", what: "Visual design, product design, systems and engineering." },
      { id: "gallery", name: "Playground", what: "18 pieces: illustrations, 3D renders and app concepts." },
      { id: "writing", name: "Writing", what: "Short LinkedIn posts on UI fundamentals, UX and design systems. Spacing is 80% of good UI, apparently." },
      { id: "skills", name: "Capabilities", what: "Skills grouped as tokens: product, system, ai, visual." },
      { id: "ai", name: "AI", what: "How he works with AI, the prompt library, how the site was built, and Sunny." },
      { id: "contact", name: "Contact", what: "Email, location, reply time, elsewhere." }
    ],
    shortcuts: "? shows the shortcuts, I toggles the component inspector on the home page, G the grid, T the theme, A opens Ask Sunny. All switchable in the Accessibility and preferences panel."
  };

  var sunny = {
    what: "Sunny is the site companion: a small sun with a sprout who lives in the bottom-right corner of every page. 100% SVG, CSS animation and a little JavaScript, built from a Figma frame.",
    personality: "Curious, warm, a little mischievous, observant and concise. Quiet most of the time, expressive at meaningful moments.",
    does: "Keeps itself busy with small acts (waving, reading, yoga, fishing, a selfie), reacts to clicks, scrolling, the theme and the visitor leaving or returning, notices which section you are reading, and answers questions in the Ask panel (press A).",
    ai: "Without a server Sunny answers from a fixed list written from the site. With the worker deployed it answers in natural language with Claude, only from the facts on the site, through Ganesh’s own server; the API key never ships with the page. Nothing is stored.",
    controls: "Sound is off until you turn it on in the preferences panel (four synthesized voices). The zz button sends Sunny off for a nap. Reduced motion stops its acts. The preferences panel can hide it entirely.",
    puppy: "Puppy is Sunny’s sidekick, drawn from Ganesh’s own illustration. Choose Sunny, Puppy or Together in the preferences panel. The first time the two share the corner, Sunny finds a tiny sleeping pup, pats it, and it wakes and grows. Puppy never answers questions; it reacts, wags, naps, dreams, can be dragged along the bottom edge, and now and then the two share a moment: head pats, a dance, fetch, hide and seek, a selfie, stargazing after dark."
  };

  var recruiter = {
    overview: "Ganeshkumar B is a Senior Product Designer at Zoho SalesIQ with 8+ years on one enterprise B2B SaaS product, from intern to senior. He leads end-to-end product design across web, mobile SDK and WhatsApp, and owns the 26+ component design system: Figma variables, Code Connect and an AI-assisted Figma-MCP workflow that keeps the library and the shipped code in step. Headline work: Zobot, the no-code chatbot builder he designed solo (now on seven channels); the design system; and the Operator Console redesign. He is looking for a lead, staff or senior role with design system ownership. Chennai, remote or relocation, 30-day notice.",
    strengths: "Design systems and the design-to-code bridge (tokens, Figma variables, Code Connect, Figma MCP); turning dense enterprise workflows into clear experiences (Zobot, Operator Console, Reports); and AI-assisted workflows with Claude, with a review discipline behind them.",
    products: "One enterprise product, deeply: Zoho SalesIQ, a customer engagement platform with live chat, chatbots, messaging, mobile SDKs and WhatsApp. He designed 10+ product areas end to end, including the chatbot builder, the operator console, analytics, brand configuration, outbound campaigns and feedback.",
    ai: "Yes. He introduced Figma MCP and Code Connect on SalesIQ, uses Claude for variant matrices, dark-mode values, code mappings and critique, keeps a prompt library, and documents where AI got it wrong. Rule: AI drafts, he decides.",
    relevant: ["design-system", "zobot", "operator-console"]
  };

  /* every path Sunny may link to; anything else is dropped */
  var routes = ["index.html", "hire.html", "assets/Ganeshkumar-B-Resume.pdf", "how-i-use-ai.html", "prompts.html", "how-this-site-was-built.html"].concat(projects.map(function (p) { return p.path; }));

  g.SUNNY_KNOWLEDGE = { mail: MAIL, profile: profile, projects: projects, practice: practice, portfolio: portfolio, sunny: sunny, recruiter: recruiter, routes: routes };
})(typeof globalThis !== "undefined" ? globalThis : window);
