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
        { id: "part-01", label: "Context", title: "A simpler flow wasn’t enough anymore.", summary: "SalesIQ had a basic, mostly linear bot flow; the opportunity was to rethink how businesses create bots, from conversations to logic, data and workflows." },
        { id: "part-02", label: "Challenge", title: "Approachable for beginners. Flexible enough to grow.", summary: "A bot handles conversations, logic, data, actions and integrations, and all five had to fit one visual environment." },
        { id: "part-03", label: "Exploration", title: "Finding the right way to build conversations.", summary: "Linear flow, freeform canvas and structured flow were compared; structured flow won because it keeps direction, clarity and flexibility." },
        { id: "part-04", label: "Experience", title: "From individual steps to a connected conversation.", summary: "One canvas to see the conversation, blocks to build it, and a side panel to configure the selected block without leaving the canvas." },
        { id: "part-05", label: "System", title: "A builder made of building blocks.", summary: "Every block shares one anatomy, and four families (Response, Action, Data, Integration) cover what a bot says, does, collects and connects to." },
        { id: "part-06", label: "Decisions", title: "Three decisions shaped the builder.", summary: "A flowchart not a script; start simple and customise when needed; built to expand." },
        { id: "part-07", label: "In action", title: "A conversation, built visually.", summary: "A sample bot asks a single-choice question, a router reads the answer, the conversation branches, then collects details or ends warmly." },
        { id: "part-08", label: "Growth", title: "From a focused builder to a broader platform.", summary: "Ganesh’s canvas, block system and configuration shipped on website chat; the product team later added templates, more blocks, integrations, seven channels and AI." },
        { id: "part-09", label: "Outcome", title: "Complex conversations became easier to build, understand and extend.", summary: "Visual control over logic, flexibility without code, and a foundation new blocks and channels could join without changing the canvas." },
        { id: "part-10", label: "Takeaway", title: "Defaults matter as much as features.", summary: "A flexible builder only works when people know where to start." }
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
        { id: "part-01", label: "Problem", title: "A design system fails quietly.", summary: "Components drifted across modules, causing inconsistency, repeated effort and slower delivery." },
        { id: "part-02", label: "Decision", title: "One source, several outputs.", summary: "A single source of truth drives both the Figma library and the shipped components." },
        { id: "part-03", label: "Foundation to product", title: "Foundations to code, in one line.", summary: "A semantic token resolves to a primitive per theme, binds a component, and lands in the interface." },
        { id: "part-04", label: "Foundations", title: "Primitives underneath, meaning on top.", summary: "57 colour primitives, 40 semantic tokens with light and dark values, typography, 11 spacing steps and 6 radii." },
        { id: "part-05", label: "Components", title: "Twenty-six components, one anatomy.", summary: "Container, leading icon, label and trailing icon shared by every component; the Button has 24 variants." },
        { id: "part-06", label: "Adaptability", title: "One component, three platforms.", summary: "The Platform collection changes control heights, type and layout for desktop, tablet and mobile." },
        { id: "part-07", label: "In products", title: "The same parts, two very different screens.", summary: "The same system powers a live chat window and a data-rich operator console." },
        { id: "part-08", label: "Design and code", title: "Two lanes, one source.", summary: "Figma variables and components, Code Connect in the middle, and a CSS component library on the same tokens." },
        { id: "part-09", label: "Output", title: "What one source produces.", summary: "147 variables, 26 components, 359 variants, three platforms, two themes." },
        { id: "part-10", label: "Quality", title: "Checked before it ships, and after.", summary: "Build, validate, release, evolve: audits, both-theme renders, Code Connect links and a changelog." },
        { id: "part-11", label: "Takeaway", title: "A system is infrastructure, not a collection.", summary: "A connected foundation, not a library of parts." }
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
        { id: "part-01", label: "Problem", title: "Everything was there. But the experience needed to evolve.", summary: "Competing information, fragmented context and excessive scanning in a console that had grown panel by panel." },
        { id: "part-02", label: "Challenge", title: "How do we make a complex workspace feel simpler?", summary: "Information versus focus, flexibility versus structure, density versus clarity." },
        { id: "part-03", label: "Approach", title: "From individual panels to a connected workspace.", summary: "Separate panels became one workspace: nav, folders, queue, conversation and visitor, with context inside the conversation." },
        { id: "part-04", label: "Experience", title: "A clearer path through every conversation.", summary: "Find, understand, respond, resolve: the operator’s workflow in one place." },
        { id: "part-05", label: "Decisions", title: "Less visual noise. More clarity.", summary: "Clearer hierarchy, cleaner layout and focused context; a before-and-after schematic shows the structural change." },
        { id: "part-06", label: "Principles", title: "Three principles shaped the redesign.", summary: "Focus on the conversation, context available but not overwhelming, actions within the flow." },
        { id: "part-07", label: "Outcome", title: "A more focused foundation for customer conversations.", summary: "Clarity, structure and flow; operators understand, respond and act with less effort." },
        { id: "part-08", label: "Takeaway", title: "A workspace is more than the sum of its panels.", summary: "Getting the structure right matters more than removing information." }
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
        { id: "part-01", label: "Context", title: "Numbers for every team in SalesIQ", summary: "Chats, calls, operators, bots, campaigns and feedback each had their own numbers; admins and team leads read them all." },
        { id: "part-02", label: "The problem", title: "From scattered to one surface", summary: "Numbers lived in different places; the goal was one surface grouped by the question." },
        { id: "part-03", label: "Discovery", title: "Grouped by the question you ask", summary: "Volume and demand, Operations, Bots and Live insights, each a question an admin asks." },
        { id: "part-04", label: "Your thinking", title: "Three decisions that shaped it", summary: "Show the change, one time axis per page, rows one scroll away." },
        { id: "part-05", label: "The solution", title: "Every report reads top to bottom", summary: "The number, the trend, the breakdown and the rows, the same on every page." },
        { id: "part-06", label: "Impact", title: "Shipped as Reports 2.0", summary: "One analytics surface, seven report groups." },
        { id: "part-07", label: "Reflection", title: "What I learned", summary: "Every chart should answer one question." }
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
        { id: "part-01", label: "Context", title: "One brand, many channels", summary: "A brand spans website, app, email, WhatsApp and more; the question was who could set it up and from where." },
        { id: "part-02", label: "The problem", title: "From a settings list to a brand home", summary: "One long list of settings became one page that shows the whole brand." },
        { id: "part-03", label: "Discovery", title: "Set once, used everywhere", summary: "Business settings shared across channels; channel settings only for what is unique." },
        { id: "part-04", label: "Your thinking", title: "Three decisions that shaped it", summary: "Brand as home, shared first, room for the next channel." },
        { id: "part-05", label: "The solution", title: "Status on the surface", summary: "Each channel is a card that tells you what is live, what is left and what is coming." },
        { id: "part-06", label: "Impact", title: "Shipped, then it kept growing", summary: "Self-service for admins; nine channels on one page." },
        { id: "part-07", label: "Reflection", title: "What I learned", summary: "Settings are a place, not a list." }
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
        { id: "part-01", label: "Context", title: "When the business speaks first", summary: "Campaigns reverse SalesIQ’s usual direction: the team reaches out." },
        { id: "part-02", label: "The problem", title: "Reaching out had no home", summary: "Blind sends, channel-by-channel rules and no plan for frequency." },
        { id: "part-03", label: "Discovery", title: "Three ways to reach out", summary: "Message cards in the chat window, push notifications, and WhatsApp broadcasts from approved templates." },
        { id: "part-04", label: "Your thinking", title: "Three decisions that shaped it", summary: "Preview beside the editor, % to personalise, frequency in the plan." },
        { id: "part-05", label: "The solution", title: "Compose, target, schedule, measure", summary: "Write on the left and see it on the right, then audience, message, schedule, results." },
        { id: "part-06", label: "Impact", title: "Shipped across three channels", summary: "WhatsApp, web and mobile push, results in one place." },
        { id: "part-07", label: "Reflection", title: "What I learned", summary: "People trust what they can see." }
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
        { id: "part-01", label: "Context", title: "The last moment of a chat", summary: "Rating & Feedback is where the visitor says how it went, inside the chat window." },
        { id: "part-02", label: "The problem", title: "One question, the same for everyone", summary: "One format, one reply, and a separate survey that meant leaving." },
        { id: "part-03", label: "Discovery", title: "What gets answered", summary: "Effort, mood and timing: one tap, three moods, asked while it is fresh." },
        { id: "part-04", label: "Your thinking", title: "Three decisions that shaped it", summary: "One tap first, reply to how they feel, a survey when you need more." },
        { id: "part-05", label: "The solution", title: "One tap, your format, a fitting reply", summary: "Four small steps in the chat window, three rating formats, a different reply for every rating." },
        { id: "part-06", label: "Impact", title: "Shipped as one feedback loop", summary: "Rating, follow-up and surveys as one flow." },
        { id: "part-07", label: "Reflection", title: "What I learned", summary: "The easiest question gets the most answers." }
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
      { path: "resume.html", name: "Resume", what: "Printable one-page resume, plus one-page and full two-page PDFs." },
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
    controls: "Sound is off until you turn it on in the preferences panel (four synthesized voices). The zz button sends Sunny off for a nap. Reduced motion stops its acts. The preferences panel can hide it entirely."
  };

  var recruiter = {
    overview: "Ganeshkumar B is a Senior Product Designer at Zoho SalesIQ with 8+ years on one enterprise B2B SaaS product, from intern to senior. He leads end-to-end product design across web, mobile SDK and WhatsApp, and owns the 26+ component design system: Figma variables, Code Connect and an AI-assisted Figma-MCP workflow that keeps the library and the shipped code in step. Headline work: Zobot, the no-code chatbot builder he designed solo (now on seven channels); the design system; and the Operator Console redesign. He is looking for a lead, staff or senior role with design system ownership. Chennai, remote or relocation, 30-day notice.",
    strengths: "Design systems and the design-to-code bridge (tokens, Figma variables, Code Connect, Figma MCP); turning dense enterprise workflows into clear experiences (Zobot, Operator Console, Reports); and AI-assisted workflows with Claude, with a review discipline behind them.",
    products: "One enterprise product, deeply: Zoho SalesIQ, a customer engagement platform with live chat, chatbots, messaging, mobile SDKs and WhatsApp. He designed 10+ product areas end to end, including the chatbot builder, the operator console, analytics, brand configuration, outbound campaigns and feedback.",
    ai: "Yes. He introduced Figma MCP and Code Connect on SalesIQ, uses Claude for variant matrices, dark-mode values, code mappings and critique, keeps a prompt library, and documents where AI got it wrong. Rule: AI drafts, he decides.",
    relevant: ["design-system", "zobot", "operator-console"]
  };

  /* every path Sunny may link to; anything else is dropped */
  var routes = ["index.html", "hire.html", "resume.html", "how-i-use-ai.html", "prompts.html", "how-this-site-was-built.html"].concat(projects.map(function (p) { return p.path; }));

  g.SUNNY_KNOWLEDGE = { mail: MAIL, profile: profile, projects: projects, practice: practice, portfolio: portfolio, sunny: sunny, recruiter: recruiter, routes: routes };
})(typeof globalThis !== "undefined" ? globalThis : window);
