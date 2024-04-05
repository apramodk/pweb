<script lang="ts">
	import { Card, Images } from '$lib/index';

	let expanded = false;

	function toggleExpand() {
		expanded = !expanded;
	}
</script>

<main class="m-8 grid grid-cols-2 items-center justify-between">
	<div class="card w-3/4 m-10">
		<Card
			title="MGP1: LED Game"
			description="Simple LED game controlled by capacitive touch sensors"
			isModalOpen={false}
		>
			<div class="report">
				<p>
					<strong>Introduction:</strong> The provided code implements a simple LED game controlled by
					capacitive touch sensors. The game utilizes an 8x8 LED matrix to display the game state and
					four capacitive sensors as input devices. The objective of the game is to press the correct
					capacitive sensor corresponding to the LED tile at the bottom row.
				</p>
				<p><strong>Components:</strong></p>
				<ul>
					<li>
						LED Matrix: An 8x8 LED matrix is used to represent the game board. Each LED corresponds
						to a pixel in the game grid.
					</li>
					<li>
						Capacitive Sensors: Four capacitive sensors are employed as input devices. These sensors
						detect touch inputs and trigger corresponding actions in the game.
					</li>
					<li>
						Arduino Board: The code is designed to run on an Arduino board, which provides the
						necessary hardware interface for controlling the LED matrix and reading sensor inputs.
					</li>
				</ul>
				<div class="flex justify-center p-5">
					<div>
						<iframe
							width="560"
							height="315"
							src="https://www.youtube.com/embed/0R-9baJcEcI?si=BwuiWXOWA6UuVAY3"
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
						></iframe>
					</div>
					<!-- <iframe width="560" height="315" frameborder="0" src="https://replit.com/@AkashPramod/MaroonHarmlessDisk#main.cpp"></iframe> -->
				</div>
				<p>
					<strong>Initialization:</strong> The code begins with the initialization of necessary
					variables and pin configurations. Two arrays, <code>row</code> and <code>col</code>, store
					the pin numbers for rows and columns of the LED matrix, respectively. An array of
					<code>CapacitiveSensor</code>
					objects, <code>buttonPins</code>, is created to handle capacitive input from the sensors.
					Other variables like <code>pixels</code>, <code>currentMillis</code>,
					<code>prevMillis</code>, <code>sensorMillis</code>, <code>lives</code>, and
					<code>score</code> are initialized.
				</p>
				<p>
					<strong>Main Loop:</strong> The <code>loop()</code> function contains the main game logic and
					is executed continuously. It updates the game state, handles input from capacitive sensors,
					and refreshes the LED matrix display. The game checks for button presses using capacitive sensors
					and updates the game state accordingly. Tiles are moved down one row, and a new tile is generated
					at the top row periodically.
				</p>
				<p>
					<strong>Game Logic:</strong> The <code>moveTilesDown()</code> function moves existing
					tiles down one row, while the <code>generateNewTile()</code> function randomly generates a
					new tile at the top row. Button presses are detected using capacitive sensors. If the correct
					button is pressed, the score is incremented; otherwise, lives are decremented.
				</p>
				<p>
					<strong>Screen Refresh:</strong> The <code>refreshScreen()</code> function updates the LED
					matrix display by iterating over rows and columns. It turns on LEDs where the row is
					<code>HIGH</code>
					and the column is <code>LOW</code>, representing the intersection of rows and columns.
					Pixels are turned off by setting the column pin to <code>HIGH</code> when the pixel state
					is <code>LOW</code>.
				</p>
			</div>
		</Card>
	</div>

	<div class="card w-3/4 m-10">
		<Card
			title="MGP2: Plant Tamogachi"
			description="A device that treats a plant as a virtual pet"
			isModalOpen={false}
		>
			<div class="report">
				<h2><strong>Introduction:</strong></h2>
				<p>
					The provided code implements an interactive LCD controlled by photoresistors and
					capacitive sensors. The photoresistor detects if there is sunlight at least 4 hours a day
					and the capacitive sensor detects if it’s watered at least once per day. The state is
					updated at the end of each day.
				</p>
				<br />

				<h2><strong>Prototyping:</strong></h2>
				<p>
					Our first idea was to create a variation of our previous project, the Piano Tiles game. We
					wanted a uniqur input device, and one idea was to use a conductive, squishy ball. How hard
					you squeezed would determine which piano tile you pressed. For example, a light squeeze
					would indicate the first key is pressed while a hard squeeze indicates the last key is
					pressed.
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={0} />
				</div>
				<p>
					We eventually decided against the idea for three reason:<br />
					1. Difficulty to find effective candidates for conductive material that is squeezable.<br
					/>
					2. The complex and extensive debounce development.<br />
					3. Idea seemed more frustrating than actually function.<br />
				</p>
				<br />
				<p>
					We then decided to explore a new input material and we decided on dough. Our idea was to
					use four pieces of dough as the inputs for the Piano Tiles game.
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={1} />
				</div>
				<p>
					Again, we abandoned the idea for three reasons:<br />
					1. Dough was a lot harder to make then anticipated.<br />
					2. The game was just too similar to our previous project.<br />
					3. Having to use the same dough for days on end with multiple people touching it just seemed
					nasty.<br />
				</p>
				<br />
				<p>
					We ultimately decided against doing the Piano Tiles game. We couldn't find a way to
					improve it as it already was a really creative project with unique input. That's when we
					began brainstorming all over again. We looked back at some of the mini projects and
					recalled the photoresistor. We thought light itself as an input is so intriguing.
					Therefore, we came up with the idea of an interactive 8x8 screen. We could make a
					threshold where the screen would display a sad face if the photoresistor wasn't receiving
					sufficient lighting, a happy face if it receives a lot of lighting, and a content face for
					everything in between.
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={2} />
				</div>
				<p>
					The big issue with this program was that it was too simple. It was creative, but not
					impressive. Also, the 8x8 LED matrix was just becoming boring as we have all programmed it
					multiple times. Again, we were stuck brainstorming until Akash made a remark, "Don't you
					guys think the photoresistor is basically like a plant, where it's happy to receive
					sunlight." That's when we came up with our project idea, a plant that could be treated
					like a virtual pet. We thought that we could use an LCD screen to determine whether the
					plant was happy, sad, or content based on how it's being treated, like how much sun or
					water it has received.
				</p>
				<br />

				<p><strong>Components:</strong></p>
				<ul>
					<li>3D Printed Pot</li>
					<li>ESP-WROOM-32</li>
					<li>TFT LCD Display Module GC9A01 Driver</li>
					<li>Analog Soil Moisture Sensor</li>
					<li>Photoresistor</li>
					<li>Wires</li>
					<li>Breadboard</li>
				</ul>
				<br />

				<p><strong>Usage:</strong></p>
				<p>
					The device monitors two crucial aspects for the plant's well-being: soil moisture level
					and light exposure.
				</p>
				<br />
				<ul>
					<li>
						<strong>Soil Moisture Level:</strong> The analog soil moisture sensor measures the moisture
						level in the soil. When the soil becomes too dry, the device prompts the user to water the
						plant.
					</li>
					<li>
						<strong>Light Exposure:</strong> The photoresistor measures the intensity of light. Plants
						require a certain amount of sunlight to thrive. The device keeps track of the duration of
						sunlight exposure. If the plant receives insufficient sunlight, its happiness level decreases.
					</li>
				</ul>
				<br />
				<p>
					The device simulates a day-night cycle, with each simulated day lasting approximately 24
					hours. Throughout the day, the plant's happiness level is updated based on its care and
					the environmental conditions.
				</p>
				<br />

				<p><strong>Functionality:</strong></p>
				<ul>
					<li>
						<strong>Plant Happiness:</strong> The device displays a digital representation of the plant's
						mood (either happy or sad) based on its care and environmental conditions.
					</li>
					<li>
						<strong>User Interaction:</strong>Users can interact with the device by watering the
						plant when prompted and ensuring it receives adequate sunlight.
					</li>
				</ul>
				<br />
				<h2><strong>Video Demonstration:</strong></h2>
				<div class="flex justify-center p-5">
					<div>
						<iframe
							width="560"
							height="315"
							src="https://www.youtube.com/embed/S3geHCH6NZI?si=5XOA_6Rp4RHyvEdr"
							title="YouTube video player"
							frameborder="0"
							allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
							allowfullscreen
						></iframe>
					</div>
				</div>
			</div>
		</Card>
	</div>

	<div class="card w-3/4 m-10">
		<Card
			title="MGP3: Intermediate Prototype"
			description="How we came up with the prototype to mgP3"
			isModalOpen={false}
		>
			<div class="report">
				<h2><strong>Ideation/Brainstorming: </strong></h2>
				<p>
					When we first saw the project prompt, the idea of a chicken's head immediately popped up.
					It is so intriguing to see videos of how chickens automatically stabilize their heads
					while their body is moved aroun. We immediately thought of a camera stabilizer. With the
					use of an IMU and a few motors, the idea of a camera stabilizer was feasible. However, we
					wanted to make this device easily accessible and not everyone is carrying a digital
					camera. Therefore, we believed that the stabilizers should be designed to carry phones.
				</p>
				<br />
				<br />
				<h2><strong>Protoype 1: </strong></h2>
				<p>
					We wanted to practice our parallel prototyping skills by coming up with different designs
					of different ideas. The first design we thought of was a headband with a phone carrier,
					inspired by the head of chicken we brought up earlier.
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={12} />
				</div>
				<p>
					We eventually passed out on this idea because we could not figure out how we would be able
					to support the weight of a phone on a headband. Also, it looked really ridiculous.
				</p>
				<br />
				<p>
					The second design we came up with for our first prototype was a hand-held phone
					stabilizer.
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={11} />
				</div>
				<p>
					We knew this idea was feasible and useful. We eventually passed on this idea as we thought
					it was too basic. There are already so many handheld phone stabilizers out there that we
					could easily purchase. So this would not really be our design, just more of a recreation
					of an already well-established design.
				</p>
				<br />
				<br />
				<h2><strong>Protoype 2: </strong></h2>
				<p>
					For our second prototype, we thought about how IMU design could facilitate life in
					general, specifically for the disabled. There are many activities and hobbies people with
					disabilities cannot partake in due to their conditions. We came up with a contoller that
					uses an IMU as an input. We wanted to make a glove that had an IMU attached to it, and the
					user could give input on devices by tilting their hand forward, backward, left, or right.
					We could use the Arduino Nano's IMU and WiFi communication capabilities to acheive this.
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={13} />
				</div>
				<p>
					Eventually, we decided on this prototype and design. We were fascinated by the idea of
					creating something for the benefit of others. We were also intrigued in using the WiFi
					communication capabilites of a microcontroller, something neither of us has done before.
				</p>
				<br />
				<br />
				<h2><strong>Beginning Work: </strong></h2>
				<p>
					We have not thought about what application we will use for our demonstration. The idea of
					a drone did get brought up. The glove could be used to not only direct the movement of the
					drone, but also at what speed. So for our very first prototype, we came up with a design
					that included six LEDS. Three LEDS indicating forward movement and three indicating
					backward movement. Each LED would light up based on how far forward or backward the Nano
					would move. The following is a video of our prototype.
				</p>
				<div class="flex justify-center p-5">
					<video width="560" height="315" controls src="src\lib\images\mgp3_prototype.MOV">
						<track kind="captions" />
					</video>
				</div>
				<p>The following is the code we used to program our prototype.</p>
                <br/>
				<button on:click={toggleExpand} style="padding: 10px 20px; background-color: #007bff; color: white; border: none; border-radius: 5px; cursor: pointer;">Code</button>
                <div class="expandable {expanded ? 'expanded' : ''}">
					<pre>
                        <code>
                            #include &lt;Arduino_LSM6DS3.h&gt;

                            float x, y, z;
                            int forward = 0;
                            int backward = 0;
                            int left_movement = 0;
                            int right_movement = 0;

                            const int LED_PIN[] = &#91;2, 3, 4, 5, 6, 7&#93;; 

                            void lightLed(int, int);

                            void setup() &#123;
                                Serial.begin(115200);
                                while (!Serial);
                                Serial.println("Started");

                                if (!IMU.begin()) &#123;
                                    Serial.println("Failed to initialize IMU!");
                                    while (1);
                                &#125;

                                for(int i = 0; i &lt; 4; i++) &#123;
                                    pinMode(LED_PIN[i], OUTPUT);
                                &#125;

                                Serial.print("Accelerometer sample rate = ");
                                Serial.print(IMU.accelerationSampleRate());
                                Serial.println("Hz");
                            &#125;

                            void loop() &#123;

                                if (IMU.accelerationAvailable()) &#123;
                                    IMU.readAcceleration(x, y, z);

                                &#125;

                                if (x &gt; 0.1) &#123;
                                    x = 100 * x;
                                    backward = map(x, 0, 97, 0, 4);
                                    Serial.print("Moving backwards at speed setting ");
                                    Serial.print(backward);
                                    Serial.print("\n");
                                &#125;
                                if (x &lt; -0.1) &#123;
                                    x = 100 * x;
                                    forward = map(x, 0, -100, 0, 4);
                                    Serial.print("Moving forward at speed setting ");
                                    Serial.print(forward);
                                    Serial.print("\n");
                                &#125;
                                if (y &gt; 0.1) &#123;
                                    y = 100 * y;
                                    left_movement = map(y, 0, 97, 0, 4);
                                    Serial.print("Moving left at speed setting ");
                                    Serial.print(left_movement);
                                    Serial.print("\n");
                                &#125;
                                if (y &lt; -0.1) &#123;
                                    y = 100 * y;
                                    right_movement = map(y, 0, -100, 0, 4);
                                    Serial.print("Moving right at speed setting ");
                                    Serial.print(right_movement);
                                    Serial.print("\n");
                                &#125;

                                lightLed(forward, backward);

                                delay(50);
                            &#125;

                            void lightLed(int f, int b) &#123;
                                if(f == 0) &#123;
                                    for(int i = 3; i &lt; 6; i++) &#123;
                                    digitalWrite(LED_PIN[i], 0);
                                    &#125;
                                &#125;
                                if (b == 0) &#123;
                                    for(int i = 0; i &lt; 3; i++) &#123;
                                    digitalWrite(LED_PIN[i], 0);
                                    &#125;
                                &#125;
                                if(f &gt; b) &#123;
                                    for(int i = 0; i &lt; 3; i++) &#123;
                                    digitalWrite(LED_PIN[i], 0);
                                    &#125;
                                    switch(f) &#123;
                                    case 1:
                                        for(int i = 4; i &lt; 6; i++) &#123;
                                        digitalWrite(LED_PIN[i], 0);
                                        &#125;
                                        digitalWrite(LED_PIN[3], 1);
                                        break;
                                    case 2:
                                        digitalWrite(LED_PIN[3], 1);
                                        digitalWrite(LED_PIN[4], 1);
                                        digitalWrite(LED_PIN[5], 0);
                                        break;
                                    case 3:
                                        for(int i = 3; i &lt; 6; i++) &#123;
                                        digitalWrite(LED_PIN[i], 1);
                                        &#125;
                                        break;
                                    default:
                                        break;
                                    &#125;
                                &#125;else if (b &gt; f) &#123;
                                    for(int i = 3; i &lt; 6; i++) &#123;
                                    digitalWrite(LED_PIN[i], 0);
                                    &#125;
                                    switch(b) &#123;
                                    case 1:
                                        for(int i = 0; i &lt; 2; i++) &#123;
                                        digitalWrite(LED_PIN[i], 0);
                                        &#125;
                                        digitalWrite(LED_PIN[2], 1);
                                        break;
                                    case 2:
                                        digitalWrite(LED_PIN[2], 1);
                                        digitalWrite(LED_PIN[1], 1);
                                        digitalWrite(LED_PIN[0], 0);
                                        break;
                                    case 3:
                                        for(int i = 0; i &lt; 3; i++) &#123;
                                        digitalWrite(LED_PIN[i], 1);
                                        &#125;
                                        break;
                                    default:
                                        break;
                                    &#125;
                                &#125;
                            &#125;
                        </code>
                    </pre>
				</div>
			</div>
		</Card>
	</div>

	<div class="card w-3/4 m-10">
		<Card
			title="MGP3: IMU Glove Controller"
			description="An IMU controller alternative for interactive devices like drones"
			isModalOpen={false}
		>
			<div class="report">
				<h2><strong>Ideation/Brainstorming: </strong></h2>
				<p>
					When brainstorming ideas for mini-project 4, we pondered the exciting possibilities of
					utilizing Inertial Measurement Units (IMUs). Our research into real-world applications
					revealed that drones employ IMUs to relay contextual information about the drone's
					relative position and movement back to the remote controller. This technology facilitates
					precise and responsive control, enhancing the user's experience. Since this is a
					Human-Computer Interaction (HCI) course, we were also keen on approaching this project
					from a unique angle that would redefine the way we interact with technology.
					<br />
					While exploring YouTube, I came across a video featuring the Xbox team at Microsoft discussing
					the development of the adaptive controller. This innovative controller was specifically designed
					to accommodate individuals with disabilities, with the goal of providing a more inclusive gaming
					experience.
				</p>
				<div class="flex justify-center p-5">
					<iframe
						width="560"
						height="315"
						src="https://www.youtube.com/embed/9fcK19CAjWM?si=3qDqINjkUSMtGXat"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerpolicy="strict-origin-when-cross-origin"
						allowfullscreen
					></iframe>
				</div>
				<p>
					One particularly insightful statement from a team member responsible for creating the
					adaptive controller caught my attention. They asserted that "a disability is defined as a
					mismatch in human interaction." This perspective challenges the conventional understanding
					of disabilities, suggesting that many are not inherent flaws or limitations of the
					individual but rather arise from a lack of support and accommodation in their environment.
					<br />
					<br />
					In essence, this viewpoint shifts the focus from the individual's impairment to the societal
					and environmental barriers that prevent them from fully participating in various activities,
					including gaming. By embracing this perspective, the Xbox team emphasized the importance of
					creating inclusive products and environments that empower individuals with disabilities to
					engage more fully in the activities they enjoy.
					<br />
					<br />
					This approach to understanding and addressing disabilities highlights the need for more inclusive
					design practices across various industries, not just gaming. It showcases the potential for
					technology to break down barriers and create opportunities for people of all abilities to participate
					equally in society.
					<br />
					<br />
					A compelling question arises: why is it important to make such accommodations in something
					as seemingly trivial as video games? Beyond the simple premise that everyone deserves the chance
					to experience these enjoyable activities, there is a deeper significance. The genesis of the
					Adaptive Controller can be traced back to veterans who utilized video games as a form of prescribed
					therapy. Veterans account for a disproportionate number of suicides, and a psychological study
					demonstrated that veterans prescribed video games exhibited better signs of recovery from severe
					depression.
				</p>
				<h2><strong>Finalized Idea #1: </strong></h2>
				<p>So we're going to make an IMU controller for an fpv drone. Why an fpv drone?</p>
				<div class="flex justify-center p-5">
					<iframe
						width="560"
						height="315"
						src="https://www.youtube.com/embed/nsI2eMFEvkc?si=DQPkpuFHmPLXr8gP"
						title="YouTube video player"
						frameborder="0"
						allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
						referrerpolicy="strict-origin-when-cross-origin"
						allowfullscreen
					></iframe>
				</div>

				<h2><strong>Finalized Idea #2: </strong></h2>
				<p>
					The first challenge we anticipated was formalizing the IMU data to be read as valid input.
					It's difficult to determine the exact input format required, but what if we built a drone
					ourselves? Drones are expensive, and FPV drones are even more so. How about we build our
					own drone?
					<br />
					Building our own drone presents several advantages. We were inclined to use the ESP32, as it
					features a dual-core processor and can create a WiFi access point. By utilizing the ESP32,
					we can use it to act as the drone's controller and provide a point of connection for the Arduino
					with the built-in IMU to connect wirelessly.
					<br />
					Additionally, the extra layer of complexity beyond just getting imu readings also made this
					a more interesting project.
				</p>

				<h2><strong>How to build a drone: </strong></h2>
				<p>To build the drone we have to address a few important aspects.</p>
				<ul>
					<li>- What electrical parts do we need</li>
					<li>
						- We also need to implement some signal based communication channel between the remote
						controller and the drones onboard controller.
					</li>
					<li>- We need some sort of housing for the drones electronic components.</li>
				</ul>

				<h3>Addressing Electronics Parts</h3>
				<p>
					So drones have 7 important parts, the remote controller, the drone's onboard controller,
					the motor, the propellor, an Electronic Speed Controller, a power source, and a frame. We
					have two parts covered, the two controllers. We find a project from another individual who
					is working towards building an esp32 drone and he lists a few parts for us an 8.5x20mm
					Motor 3-5V brushed motor and propellor combo, a CAD file for the frame, and a P-channel
					MOSFET transistor for making his own ESC.
				</p>
				<h3>Addressing communication channel</h3>
				<p>
					As I said earlier we wanted to use Wifi. The esp32, has a way to creat a wifi access
					point, this lets up basically create this private network where connected devices can
					communicate with each other. Since the Arduino and ESP32 can both use the WiFi.h library
					this implementation is fairly simple.
				</p>

				<h3>Addressing Housing</h3>
				<p>
					While the online resource provided a CAD file, the built in housing meant to fit the motor
					didn't fit, so we had to design our own frame.
				</p>
				<div class="flex justify-center m-8">
					<Images im_index={3} />
				</div>
				<div class="flex justify-center p-5">
					<Images im_index={4} />
				</div>

				<h2><strong>What went wrong? </strong></h2>
				<p>
					In Short, the SMD Transistor was not an apt alternative for an actual Electronic Speed
					Controller. There is also a reason the motor was cheap. The transistor ended up being too
					small to actually try and write an electronic speed controller with, even though the GPIO
					pins on the esp32 actually have a way of sending varying voltages, which would've allowed
					us to manipulate the current to the motor. Because the transistor was too small, it was
					just almost impossible for unexperienced to work with using just tweezers and a soldering
					iron.
					<!-- 8,9,10 -->
				</p>
				<div class="flex justify-center p-5">
					<Images im_index={8} />
				</div>
				<div class="flex justify-center p-5">
					<Images im_index={9} />
				</div>

				<h2><strong>What did we learn?</strong></h2>
				<p>
					Our journey in building an IMU drone controller provided us with valuable learning
					experiences and insights. Firstly, we gained a deeper understanding of the intricate
					components and technologies involved in drone construction, including the role of IMUs in
					flight stabilization and control.
					<br />
					Additionally, we learned the importance of thorough planning and research in project development.
					Identifying suitable electronic parts, establishing communication channels between controllers,
					and designing a suitable housing demanded meticulous attention to detail and problem-solving
					skills.
					<br />
					Furthermore, our project underscored the significance of experimentation and iteration in the
					prototyping process. Despite encountering challenges such as incompatible components and design
					limitations, each setback served as an opportunity for learning and refinement.
					<br />
					Importantly, our experience highlighted the value of interdisciplinary collaboration and knowledge-sharing.
					By drawing upon resources and insights from diverse sources, including online communities and
					existing projects, we were able to navigate challenges more effectively and enrich our understanding.
					<br />
					Ultimately, our venture into building an IMU drone controller not only expanded our technical
					competencies but also cultivated essential skills in teamwork, problem-solving, and adaptability.
					These lessons will undoubtedly inform and enhance our future endeavors in the realm of technology
					and innovation.
				</p>
			</div>
		</Card>
	</div>
</main>

<style>
	.expandable {
		overflow: hidden;
		transition: max-height 100.0s ease;
		max-height: 0;
	}

	.expanded {
		max-height: none; /* Set your desired max height here */
	}

	img {
		width: 560px; /* Set the width to 100 pixels */
		height: auto; /* Automatically calculate the height based on the aspect ratio */
	}

	pre {
		background-color: #f4f4f4;
		padding: 1em;
		overflow-x: auto;
	}
</style>
