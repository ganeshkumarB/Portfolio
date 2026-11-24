/* Ask Sunny configuration.
   Leave SUNNY_AI_ENDPOINT empty and Sunny answers from a fixed list about this site only.
   Set it to your deployed worker URL (see ai/README.md) and Sunny answers in natural language with Claude,
   still only about Ganesh and his work, from the KNOWLEDGE in ai/worker.js. */
window.SUNNY_AI_ENDPOINT = "";

/* Where Sunny's feedback card sends answers. Leave empty and "Send" opens the visitor's email app instead.
   To collect answers without email, paste a form endpoint here (for example a Formspree form URL). */
window.SUNNY_FEEDBACK_ENDPOINT = "";
