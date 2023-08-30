import "highlight.js/styles/stackoverflow-light.css";
import hljs from "highlight.js/lib/core";
import plaintext from "highlight.js/lib/languages/plaintext";
import powershell from "highlight.js/lib/languages/powershell";
import typescript from "highlight.js/lib/languages/typescript";
import hljsVuePlugin from "@highlightjs/vue-plugin";

export default defineNuxtPlugin((nuxtApp) => {
  hljs.registerLanguage("plaintext", plaintext);
  hljs.registerLanguage("powershell", powershell);
  hljs.registerLanguage("typescript", typescript);
  nuxtApp.vueApp.use(hljsVuePlugin);
});
