import{r as l,b as c}from"./index-BlEQ5104.js";function T({duration:i,progressStep:n,onProgressStep:u,onTimerFinish:m}){const a=l(),t=l(),e=l(0);function r(){t.value=setTimeout(m??(()=>{}),i),a.value=setInterval(()=>{e.value+=n,u==null||u(e.value)},i*n/100)}function v(){t.value&&clearTimeout(t.value),a.value&&clearInterval(a.value),e.value=0}return c(()=>{v()}),{startTimer:r,clearTimer:v,currentProgress:e}}export{T as u};
