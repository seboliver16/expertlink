(self.webpackChunk_N_E=self.webpackChunk_N_E||[]).push([[235],{7192:function(e,s,t){Promise.resolve().then(t.bind(t,2365))},6463:function(e,s,t){"use strict";var a=t(1169);t.o(a,"useParams")&&t.d(s,{useParams:function(){return a.useParams}}),t.o(a,"useRouter")&&t.d(s,{useRouter:function(){return a.useRouter}})},2365:function(e,s,t){"use strict";t.r(s),t.d(s,{default:function(){return u}});var a=t(7437),r=t(2265),n=t(8634),l=t(5186),o=t(9842),c=t(6463);function u(){let[e,s]=(0,r.useState)(""),[t,u]=(0,r.useState)(""),[i,d]=(0,r.useState)(""),[m,p]=(0,r.useState)(!1),[x,h]=(0,r.useState)(!1),[b,f]=(0,r.useState)(""),y=(0,c.useRouter)(),g=async s=>{s.preventDefault(),d(""),f("");try{if(m){let s=(await (0,l.Xb)(n.I,e,t)).user;await (0,o.pl)((0,o.JU)(n.db,"users",s.uid),{email:s.email,createdAt:new Date}),f("Account created successfully! Please sign in."),p(!1)}else await (0,l.e5)(n.I,e,t),y.push("/search")}catch(e){d(e instanceof Error?e.message:"Failed to authenticate.")}},w=async s=>{s.preventDefault(),d(""),f("");try{await (0,l.LS)(n.I,e),f("Password reset email sent. Please check your inbox."),h(!1)}catch(e){d(e instanceof Error?e.message:"Failed to reset password.")}};return(0,a.jsx)("main",{className:"flex min-h-screen items-center justify-center bg-gray-50 p-8",children:(0,a.jsxs)("div",{className:"max-w-md w-full space-y-8",children:[(0,a.jsxs)("div",{className:"text-center",children:[(0,a.jsx)("h1",{className:"text-4xl font-bold text-blue-600",children:"Minerva"}),(0,a.jsx)("p",{className:"mt-2 text-gray-600",children:x?"Reset your password":m?"Create an account":"Sign in to your account"})]}),i&&(0,a.jsx)("p",{className:"text-red-600 text-center",children:i}),b&&(0,a.jsx)("p",{className:"text-green-600 text-center",children:b}),(0,a.jsxs)("form",{onSubmit:x?w:g,className:"mt-8 space-y-6",children:[(0,a.jsxs)("div",{className:"rounded-md shadow-sm",children:[(0,a.jsxs)("div",{className:"mb-4",children:[(0,a.jsx)("label",{htmlFor:"email-address",className:"sr-only",children:"Email address"}),(0,a.jsx)("input",{id:"email-address",name:"email",type:"email",autoComplete:"email",required:!0,value:e,onChange:e=>s(e.target.value),className:"appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",placeholder:"Email address"})]}),!x&&(0,a.jsxs)("div",{children:[(0,a.jsx)("label",{htmlFor:"password",className:"sr-only",children:"Password"}),(0,a.jsx)("input",{id:"password",name:"password",type:"password",autoComplete:"current-password",required:!0,value:t,onChange:e=>u(e.target.value),className:"appearance-none rounded w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm",placeholder:"Password"})]})]}),(0,a.jsx)("div",{children:(0,a.jsx)("button",{type:"submit",className:"w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none",children:x?"Send Reset Email":m?"Sign Up":"Sign In"})})]}),!x&&(0,a.jsx)("div",{className:"text-sm text-center",children:(0,a.jsx)("button",{onClick:()=>p(!m),className:"text-blue-600 hover:underline",children:m?"Already have an account? Sign in":"Don't have an account? Sign up"})}),(0,a.jsx)("div",{className:"text-sm text-center",children:(0,a.jsx)("button",{onClick:()=>{h(!x),p(!1)},className:"text-blue-600 hover:underline",children:x?"Back to Sign In":"Forgot your password?"})})]})})}},8634:function(e,s,t){"use strict";t.d(s,{I:function(){return c},db:function(){return o}});var a=t(5236),r=t(9842),n=t(5186);let l=(0,a.ZF)({apiKey:"AIzaSyA14LUJlrrF9qjTs_sdSKWoxcr4Nbmo4Yk",authDomain:"expert-link-pro.firebaseapp.com",projectId:"expert-link-pro",storageBucket:"expert-link-pro.appspot.com",messagingSenderId:"936590460150",appId:"1:936590460150:web:b376036b84b0a689db18d7",measurementId:"G-YL2DDQBBTG"}),o=(0,r.ad)(l),c=(0,n.v0)(l)}},function(e){e.O(0,[358,691,72,971,23,744],function(){return e(e.s=7192)}),_N_E=e.O()}]);