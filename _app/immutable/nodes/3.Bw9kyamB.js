import{s as Oe,d as nt,u as st,g as it,f as at,r as rt,y as Ke,n as be}from"../chunks/scheduler.DzGJWsZY.js";import{S as Ae,i as Re,e as s,t as ve,s as c,c as i,a as y,b as we,d as p,f as h,k as v,l as w,B as Qe,g as X,h as t,z as et,j as _e,p as le,n as de,v as ue,w as pe,x as me,y as fe}from"../chunks/index.DGKung3d.js";import"../chunks/paths.D0N0ab6C.js";function ot(l){let e,a,r,g,m,_,L,f,o,u,x,M,A,q,P,H,z,k,S,E,Y="X",j,R,C,B,O;const N=l[4].default,b=nt(N,l,l[3],null);return{c(){e=s("button"),a=s("div"),r=s("h2"),g=ve(l[1]),m=c(),_=s("p"),L=ve(l[2]),f=c(),o=s("dialog"),u=s("div"),x=s("div"),M=s("div"),A=s("h2"),q=ve(l[1]),P=c(),H=s("p"),z=ve(l[2]),k=c(),S=s("div"),E=s("button"),E.textContent=Y,j=c(),R=s("div"),b&&b.c(),this.h()},l(d){e=i(d,"BUTTON",{class:!0});var T=y(e);a=i(T,"DIV",{});var U=y(a);r=i(U,"H2",{});var V=y(r);g=we(V,l[1]),V.forEach(p),m=h(U),_=i(U,"P",{});var ce=y(_);L=we(ce,l[2]),ce.forEach(p),U.forEach(p),T.forEach(p),f=h(d),o=i(d,"DIALOG",{id:!0,class:!0});var J=y(o);u=i(J,"DIV",{class:!0});var I=y(u);x=i(I,"DIV",{class:!0});var $=y(x);M=i($,"DIV",{});var G=y(M);A=i(G,"H2",{class:!0});var W=y(A);q=we(W,l[1]),W.forEach(p),P=h(G),H=i(G,"P",{});var he=y(H);z=we(he,l[2]),he.forEach(p),G.forEach(p),k=h($),S=i($,"DIV",{});var Z=y(S);E=i(Z,"BUTTON",{class:!0,"data-svelte-h":!0}),v(E)!=="svelte-wjnzko"&&(E.textContent=Y),Z.forEach(p),$.forEach(p),j=h(I),R=i(I,"DIV",{class:!0});var K=y(R);b&&b.l(K),K.forEach(p),I.forEach(p),J.forEach(p),this.h()},h(){w(e,"class","btn bg-neutral-content text-accent-content hover:text-neutral-content h-40 shadow-lg"),w(A,"class","text-primary text-xl"),w(E,"class","btn hover:text-error"),w(x,"class","modal-header flex align-baseline justify-between h-10"),w(R,"class","modal-body m-10 bg-slate-400 p-10 rounded-md text-neutral"),w(u,"class","modal-box overflow-y-scroll h-screen max-w-none w-80vw"),w(o,"id","my_modal_1"),w(o,"class","modal"),Qe(o,"modal-open",l[0])},m(d,T){X(d,e,T),t(e,a),t(a,r),t(r,g),t(a,m),t(a,_),t(_,L),X(d,f,T),X(d,o,T),t(o,u),t(u,x),t(x,M),t(M,A),t(A,q),t(M,P),t(M,H),t(H,z),t(x,k),t(x,S),t(S,E),t(u,j),t(u,R),b&&b.m(R,null),C=!0,B||(O=[et(e,"click",l[5]),et(E,"click",l[6])],B=!0)},p(d,[T]){(!C||T&2)&&_e(g,d[1]),(!C||T&4)&&_e(L,d[2]),(!C||T&2)&&_e(q,d[1]),(!C||T&4)&&_e(z,d[2]),b&&b.p&&(!C||T&8)&&st(b,N,d,d[3],C?at(N,d[3],T,null):it(d[3]),null),(!C||T&1)&&Qe(o,"modal-open",d[0])},i(d){C||(le(b,d),C=!0)},o(d){de(b,d),C=!1},d(d){d&&(p(e),p(f),p(o)),b&&b.d(d),B=!1,rt(O)}}}function lt(l,e,a){let{$$slots:r={},$$scope:g}=e,{isModalOpen:m}=e,{title:_}=e,{description:L}=e;const f=()=>a(0,m=!0),o=()=>a(0,m=!1);return l.$$set=u=>{"isModalOpen"in u&&a(0,m=u.isModalOpen),"title"in u&&a(1,_=u.title),"description"in u&&a(2,L=u.description),"$$scope"in u&&a(3,g=u.$$scope)},[m,_,L,g,r,f,o]}class tt extends Ae{constructor(e){super(),Re(this,e,lt,ot,Oe,{isModalOpen:0,title:1,description:2})}}const dt=""+new URL("../assets/mpg2_test1.BPAsu3l8.png",import.meta.url).href,ct=""+new URL("../assets/mpg2_test2.BOCgw0Bk.png",import.meta.url).href,ht=""+new URL("../assets/mpg2_test3.Cm1iqosx.png",import.meta.url).href;function ut(l){let e,a;return{c(){e=s("img"),this.h()},l(r){e=i(r,"IMG",{class:!0,src:!0,alt:!0}),this.h()},h(){w(e,"class","w-2/4"),Ke(e.src,a=l[1][l[0]])||w(e,"src",a),w(e,"alt","mp2_1")},m(r,g){X(r,e,g)},p(r,[g]){g&1&&!Ke(e.src,a=r[1][r[0]])&&w(e,"src",a)},i:be,o:be,d(r){r&&p(e)}}}function pt(l,e,a){let{im_index:r=0}=e;const g=[dt,ct,ht];return l.$$set=m=>{"im_index"in m&&a(0,r=m.im_index)},[r,g]}class Be extends Ae{constructor(e){super(),Re(this,e,pt,ut,Oe,{im_index:0})}}function mt(l){let e,a='<p><strong>Introduction:</strong> The provided code implements a simple LED game controlled by capacitive touch sensors. The game utilizes an 8x8 LED matrix to display the game state and four capacitive sensors as input devices. The objective of the game is to press the correct capacitive sensor corresponding to the LED tile at the bottom row.</p> <p><strong>Components:</strong></p> <ul><li>LED Matrix: An 8x8 LED matrix is used to represent the game board. Each LED corresponds to a pixel in the game grid.</li> <li>Capacitive Sensors: Four capacitive sensors are employed as input devices. These sensors detect touch inputs and trigger corresponding actions in the game.</li> <li>Arduino Board: The code is designed to run on an Arduino board, which provides the necessary hardware interface for controlling the LED matrix and reading sensor inputs.</li></ul> <div class="flex justify-center p-5"><div><iframe width="560" height="315" src="https://www.youtube.com/embed/0R-9baJcEcI?si=BwuiWXOWA6UuVAY3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen=""></iframe></div></div> <p><strong>Initialization:</strong> The code begins with the initialization of necessary variables and pin configurations. Two arrays, <code>row</code> and <code>col</code>, store the pin numbers for rows and columns of the LED matrix, respectively. An array of <code>CapacitiveSensor</code> objects, <code>buttonPins</code>, is created to handle capacitive input from the sensors. Other variables like <code>pixels</code>, <code>currentMillis</code>, <code>prevMillis</code>, <code>sensorMillis</code>, <code>lives</code>, and <code>score</code> are initialized.</p> <p><strong>Main Loop:</strong> The <code>loop()</code> function contains the main game logic and is executed continuously. It updates the game state, handles input from capacitive sensors, and refreshes the LED matrix display. The game checks for button presses using capacitive sensors and updates the game state accordingly. Tiles are moved down one row, and a new tile is generated at the top row periodically.</p> <p><strong>Game Logic:</strong> The <code>moveTilesDown()</code> function moves existing tiles down one row, while the <code>generateNewTile()</code> function randomly generates a new tile at the top row. Button presses are detected using capacitive sensors. If the correct button is pressed, the score is incremented; otherwise, lives are decremented.</p> <p><strong>Screen Refresh:</strong> The <code>refreshScreen()</code> function updates the LED matrix display by iterating over rows and columns. It turns on LEDs where the row is <code>HIGH</code> and the column is <code>LOW</code>, representing the intersection of rows and columns. Pixels are turned off by setting the column pin to <code>HIGH</code> when the pixel state is <code>LOW</code>.</p>';return{c(){e=s("div"),e.innerHTML=a,this.h()},l(r){e=i(r,"DIV",{class:!0,"data-svelte-h":!0}),v(e)!=="svelte-1pzofww"&&(e.innerHTML=a),this.h()},h(){w(e,"class","report")},m(r,g){X(r,e,g)},p:be,d(r){r&&p(e)}}}function ft(l){let e,a,r="<strong>Introduction:</strong>",g,m,_=`The provided code implements an interactive LCD controlled by photoresistors and capacitive sensors. The photoresistor 
                    detects if there is sunlight at least 4 hours a day and the capacitive sensor detects if it’s watered at least once per 
                    day. The state is updated at the end of each day.
                `,L,f,o,u="<strong>Prototyping:</strong>",x,M,A=`Our first idea was to create a variation of our previous project, the Piano Tiles game. We wanted a uniqur input device,
                    and one idea was to use a conductive, squishy ball. How hard you squeezed would determine which piano tile you pressed.
                    For example, a light squeeze would indicate the first key is pressed while a hard squeeze indicates the last key is 
                    pressed.`,q,P,H,z,k,S=`We eventually decided against the idea for three reason:<br/>
                    1. Difficulty to find effective candidates for conductive material that is squeezable.<br/>
                    2. The complex and extensive debounce development.<br/>
                    3. Idea seemed more frustrating than actually function.<br/> `,E,Y,j,R=`We then decided to explore a new input material and we decided on dough. Our idea was to use four pieces of dough as the
                        inputs for the Piano Tiles game.`,C,B,O,N,b,d=`Again, we abandoned the idea for three reasons:<br/>
                    1. Dough was a lot harder to make then anticipated.<br/>
                    2. The game was just too similar to our previous project.<br/>
                    3. Having to use the same dough for days on end with multiple people touching it just seemed nasty.<br/> `,T,U,V,ce=`We ultimately decided against doing the Piano Tiles game. We couldn't find a way to improve it as it already was a 
                    really creative project with unique input. That's when we began brainstorming all over again. We looked back at some of 
                    the mini projects and recalled the photoresistor. We thought light itself as an input is so intriguing. Therefore, we 
                    came up with the idea of an interactive 8x8 screen. We could make a threshold where the screen would display a sad face 
                    if the photoresistor wasn't receiving sufficient lighting, a happy face if it receives a lot of lighting, and a 
                    content face for everything in between.`,J,I,$,G,W,he=`The big issue with this program was that it was too simple. It was creative, but not impressive. Also, the 8x8 LED matrix was just becoming boring as we have all
                    programmed it multiple times. Again, we were stuck brainstorming until Akash made a remark, "Don't you guys think the photoresistor is basically like a plant, where 
                    it's happy to receive sunlight." That's when we came up with our project idea, a plant that could be treated like a virtual pet. We thought that we could use an LCD
                    screen to determine whether the plant was happy, sad, or content based on how it's being treated, like how much sun or water it has received.
                `,Z,K,Q,Ve="<strong>Components:</strong>",ye,ee,We="<li>3D Printed Pot</li> <li>ESP-WROOM-32</li> <li>TFT LCD Display Module GC9A01 Driver</li> <li>Analog Soil Moisture Sensor</li> <li>Photoresistor</li> <li>Wires</li> <li>Breadboard</li> ",xe,Te,te,qe="<strong>Usage:</strong>",Le,ne,ze=`The device monitors two crucial aspects for the plant's well-being: soil moisture level and light exposure.
                `,Ce,Me,se,Se=`<li><strong>Soil Moisture Level:</strong> The analog soil moisture sensor measures the moisture level in the soil. When the soil becomes 
                        too dry, the device prompts the user to water the plant.</li> <li><strong>Light Exposure:</strong> The photoresistor measures the intensity of light. Plants require a certain amount of sunlight to 
                        thrive. The device keeps track of the duration of sunlight exposure. If the plant receives insufficient sunlight, its
                        happiness level decreases.</li> `,He,De,ie,Ue=`The device simulates a day-night cycle, with each simulated day lasting approximately 24 hours. Throughout the day, the 
                    plant's happiness level is updated based on its care and the environmental conditions.
                `,Ee,$e,ae,Ge="<strong>Functionality:</strong>",Ie,re,Ne=`<li><strong>Plant Happiness:</strong> The device displays a digital representation of the plant&#39;s mood (either happy or 
                    sad) based on its care and environmental conditions.</li> <li><strong>User Interaction:</strong>Users can interact with the device by watering the plant when prompted and ensuring
                    it receives adequate sunlight.</li> `,Pe,ke,oe,Fe="<strong>Video Demonstration:</strong>",je,F,Xe='<div><iframe width="560" height="315" src="https://www.youtube.com/embed/S3geHCH6NZI?si=5XOA_6Rp4RHyvEdr" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen=""></iframe></div>',ge;return H=new Be({props:{im_index:0}}),O=new Be({props:{im_index:1}}),$=new Be({props:{im_index:2}}),{c(){e=s("div"),a=s("h2"),a.innerHTML=r,g=c(),m=s("p"),m.textContent=_,L=s("br"),f=c(),o=s("h2"),o.innerHTML=u,x=c(),M=s("p"),M.textContent=A,q=c(),P=s("div"),ue(H.$$.fragment),z=c(),k=s("p"),k.innerHTML=S,E=s("br"),Y=c(),j=s("p"),j.textContent=R,C=c(),B=s("div"),ue(O.$$.fragment),N=c(),b=s("p"),b.innerHTML=d,T=s("br"),U=c(),V=s("p"),V.textContent=ce,J=c(),I=s("div"),ue($.$$.fragment),G=c(),W=s("p"),W.textContent=he,Z=s("br"),K=c(),Q=s("p"),Q.innerHTML=Ve,ye=c(),ee=s("ul"),ee.innerHTML=We,xe=s("br"),Te=c(),te=s("p"),te.innerHTML=qe,Le=c(),ne=s("p"),ne.textContent=ze,Ce=s("br"),Me=c(),se=s("ul"),se.innerHTML=Se,He=s("br"),De=c(),ie=s("p"),ie.textContent=Ue,Ee=s("br"),$e=c(),ae=s("p"),ae.innerHTML=Ge,Ie=c(),re=s("ul"),re.innerHTML=Ne,Pe=s("br"),ke=c(),oe=s("h2"),oe.innerHTML=Fe,je=c(),F=s("div"),F.innerHTML=Xe,this.h()},l(D){e=i(D,"DIV",{class:!0});var n=y(e);a=i(n,"H2",{"data-svelte-h":!0}),v(a)!=="svelte-1e827fz"&&(a.innerHTML=r),g=h(n),m=i(n,"P",{"data-svelte-h":!0}),v(m)!=="svelte-11a5r4l"&&(m.textContent=_),L=i(n,"BR",{}),f=h(n),o=i(n,"H2",{"data-svelte-h":!0}),v(o)!=="svelte-1k77b74"&&(o.innerHTML=u),x=h(n),M=i(n,"P",{"data-svelte-h":!0}),v(M)!=="svelte-aa34h8"&&(M.textContent=A),q=h(n),P=i(n,"DIV",{class:!0});var Ye=y(P);pe(H.$$.fragment,Ye),Ye.forEach(p),z=h(n),k=i(n,"P",{"data-svelte-h":!0}),v(k)!=="svelte-1ynoun6"&&(k.innerHTML=S),E=i(n,"BR",{}),Y=h(n),j=i(n,"P",{"data-svelte-h":!0}),v(j)!=="svelte-1pows1b"&&(j.textContent=R),C=h(n),B=i(n,"DIV",{class:!0});var Je=y(B);pe(O.$$.fragment,Je),Je.forEach(p),N=h(n),b=i(n,"P",{"data-svelte-h":!0}),v(b)!=="svelte-248h9c"&&(b.innerHTML=d),T=i(n,"BR",{}),U=h(n),V=i(n,"P",{"data-svelte-h":!0}),v(V)!=="svelte-1icirw"&&(V.textContent=ce),J=h(n),I=i(n,"DIV",{class:!0});var Ze=y(I);pe($.$$.fragment,Ze),Ze.forEach(p),G=h(n),W=i(n,"P",{"data-svelte-h":!0}),v(W)!=="svelte-fchyit"&&(W.textContent=he),Z=i(n,"BR",{}),K=h(n),Q=i(n,"P",{"data-svelte-h":!0}),v(Q)!=="svelte-nqwmo3"&&(Q.innerHTML=Ve),ye=h(n),ee=i(n,"UL",{"data-svelte-h":!0}),v(ee)!=="svelte-1phshli"&&(ee.innerHTML=We),xe=i(n,"BR",{}),Te=h(n),te=i(n,"P",{"data-svelte-h":!0}),v(te)!=="svelte-1mku9ii"&&(te.innerHTML=qe),Le=h(n),ne=i(n,"P",{"data-svelte-h":!0}),v(ne)!=="svelte-gflg8y"&&(ne.textContent=ze),Ce=i(n,"BR",{}),Me=h(n),se=i(n,"UL",{"data-svelte-h":!0}),v(se)!=="svelte-us6rpu"&&(se.innerHTML=Se),He=i(n,"BR",{}),De=h(n),ie=i(n,"P",{"data-svelte-h":!0}),v(ie)!=="svelte-1mhplzs"&&(ie.textContent=Ue),Ee=i(n,"BR",{}),$e=h(n),ae=i(n,"P",{"data-svelte-h":!0}),v(ae)!=="svelte-mxjwci"&&(ae.innerHTML=Ge),Ie=h(n),re=i(n,"UL",{"data-svelte-h":!0}),v(re)!=="svelte-espvex"&&(re.innerHTML=Ne),Pe=i(n,"BR",{}),ke=h(n),oe=i(n,"H2",{"data-svelte-h":!0}),v(oe)!=="svelte-1abvfx3"&&(oe.innerHTML=Fe),je=h(n),F=i(n,"DIV",{class:!0,"data-svelte-h":!0}),v(F)!=="svelte-1xknqlq"&&(F.innerHTML=Xe),n.forEach(p),this.h()},h(){w(P,"class","flex justify-center p-5"),w(B,"class","flex justify-center p-5"),w(I,"class","flex justify-center p-5"),w(F,"class","flex justify-center p-5"),w(e,"class","report")},m(D,n){X(D,e,n),t(e,a),t(e,g),t(e,m),t(e,L),t(e,f),t(e,o),t(e,x),t(e,M),t(e,q),t(e,P),me(H,P,null),t(e,z),t(e,k),t(e,E),t(e,Y),t(e,j),t(e,C),t(e,B),me(O,B,null),t(e,N),t(e,b),t(e,T),t(e,U),t(e,V),t(e,J),t(e,I),me($,I,null),t(e,G),t(e,W),t(e,Z),t(e,K),t(e,Q),t(e,ye),t(e,ee),t(e,xe),t(e,Te),t(e,te),t(e,Le),t(e,ne),t(e,Ce),t(e,Me),t(e,se),t(e,He),t(e,De),t(e,ie),t(e,Ee),t(e,$e),t(e,ae),t(e,Ie),t(e,re),t(e,Pe),t(e,ke),t(e,oe),t(e,je),t(e,F),ge=!0},p:be,i(D){ge||(le(H.$$.fragment,D),le(O.$$.fragment,D),le($.$$.fragment,D),ge=!0)},o(D){de(H.$$.fragment,D),de(O.$$.fragment,D),de($.$$.fragment,D),ge=!1},d(D){D&&p(e),fe(H),fe(O),fe($)}}}function gt(l){let e,a,r,g,m,_,L;return r=new tt({props:{title:"LED Game",description:"Simple LED game controlled by capacitive touch sensors",isModalOpen:!1,$$slots:{default:[mt]},$$scope:{ctx:l}}}),_=new tt({props:{title:"Plant Tamogachi",description:"A device that treats a plant as a virtual pet",isModalOpen:!1,$$slots:{default:[ft]},$$scope:{ctx:l}}}),{c(){e=s("main"),a=s("div"),ue(r.$$.fragment),g=c(),m=s("div"),ue(_.$$.fragment),this.h()},l(f){e=i(f,"MAIN",{class:!0});var o=y(e);a=i(o,"DIV",{class:!0});var u=y(a);pe(r.$$.fragment,u),u.forEach(p),g=h(o),m=i(o,"DIV",{class:!0});var x=y(m);pe(_.$$.fragment,x),x.forEach(p),o.forEach(p),this.h()},h(){w(a,"class","card w-3/4 m-10"),w(m,"class","card w-3/4 m-10"),w(e,"class","m-8 grid grid-cols-2 items-center justify-between")},m(f,o){X(f,e,o),t(e,a),me(r,a,null),t(e,g),t(e,m),me(_,m,null),L=!0},p(f,[o]){const u={};o&1&&(u.$$scope={dirty:o,ctx:f}),r.$set(u);const x={};o&1&&(x.$$scope={dirty:o,ctx:f}),_.$set(x)},i(f){L||(le(r.$$.fragment,f),le(_.$$.fragment,f),L=!0)},o(f){de(r.$$.fragment,f),de(_.$$.fragment,f),L=!1},d(f){f&&p(e),fe(r),fe(_)}}}class bt extends Ae{constructor(e){super(),Re(this,e,null,gt,Oe,{})}}export{bt as component};