<svelte:head>
    <title>HCI &amp; Embedded Systems — Akash Pramod Kumar</title>
</svelte:head>

<script lang="ts">
    import { Card, Images } from '$lib/index';
    import { slide } from 'svelte/transition';
    import { base } from '$app/paths';

    let expanded: Record<string, boolean> = {};

    function toggleExpand(id: string) {
        expanded[id] = !expanded[id];
    }
</script>

<div class="max-w-6xl mx-auto px-6 py-12">
    <header class="mb-10">
        <h1 class="text-3xl md:text-4xl font-bold tracking-tight">HCI &amp; Embedded Systems</h1>
        <p class="mt-2 text-base-content/60 font-mono text-sm">Hardware prototypes from UTK's Human-Computer Interaction course</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card
            title="Capacitive Touch LED Game"
            description="An 8x8 LED matrix game using capacitive sensors as input on Arduino"
            isModalOpen={false}
        >
            <div>
                <p>
                    <strong>Overview:</strong> A reaction-speed game built on an 8x8 LED matrix.
                    Tiles fall down the grid and the player must tap the matching capacitive
                    touch sensor before a tile reaches the bottom row. Score goes up on a
                    correct press; lives decrease on a miss.
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
                    <div class="aspect-video w-full max-w-lg">
                        <iframe
                            class="w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/0R-9baJcEcI?si=BwuiWXOWA6UuVAY3"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                        ></iframe>
                    </div>
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

        <Card
            title="Plant Tamagotchi"
            description="IoT plant monitor with photoresistor, soil sensor, and LCD mood display"
            isModalOpen={false}
        >
            <div>
                <h2><strong>Introduction:</strong></h2>
                <p>
                    The provided code implements an interactive LCD controlled by photoresistors and
                    capacitive sensors. The photoresistor detects if there is sunlight at least 4 hours a day
                    and the capacitive sensor detects if it's watered at least once per day. The state is
                    updated at the end of each day.
                </p>

                <h2><strong>Prototyping:</strong></h2>
                <p>
                    Our first idea was to create a variation of our previous project, the Piano Tiles game. We
                    wanted a unique input device, and one idea was to use a conductive, squishy ball. How hard
                    you squeezed would determine which piano tile you pressed. For example, a light squeeze
                    would indicate the first key is pressed while a hard squeeze indicates the last key is
                    pressed.
                </p>
                <div class="flex justify-center p-5">
                    <Images im_index={0} />
                </div>
                <p>
                    We eventually decided against the idea for three reason:<br />
                    1. Difficulty to find effective candidates for conductive material that is squeezable.<br />
                    2. The complex and extensive debounce development.<br />
                    3. Idea seemed more frustrating than actually function.<br />
                </p>
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

                <p><strong>Usage:</strong></p>
                <p>
                    The device monitors two crucial aspects for the plant's well-being: soil moisture level
                    and light exposure.
                </p>
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
                <p>
                    The device simulates a day-night cycle, with each simulated day lasting approximately 24
                    hours. Throughout the day, the plant's happiness level is updated based on its care and
                    the environmental conditions.
                </p>

                <p><strong>Functionality:</strong></p>
                <ul>
                    <li>
                        <strong>Plant Happiness:</strong> The device displays a digital representation of the plant's
                        mood (either happy or sad) based on its care and environmental conditions.
                    </li>
                    <li>
                        <strong>User Interaction:</strong> Users can interact with the device by watering the
                        plant when prompted and ensuring it receives adequate sunlight.
                    </li>
                </ul>
                <h2><strong>Video Demonstration:</strong></h2>
                <div class="flex justify-center p-5">
                    <div class="aspect-video w-full max-w-lg">
                        <iframe
                            class="w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/S3geHCH6NZI?si=5XOA_6Rp4RHyvEdr"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>
            </div>
        </Card>

        <Card
            title="IMU Glove — Prototyping"
            description="Design process: from camera stabilizer to accessible motion controller"
            isModalOpen={false}
        >
            <div>
                <h2><strong>Ideation/Brainstorming: </strong></h2>
                <p>
                    When we first saw the project prompt, the idea of a chicken's head immediately popped up.
                    It is so intriguing to see videos of how chickens automatically stabilize their heads
                    while their body is moved around. We immediately thought of a camera stabilizer. With the
                    use of an IMU and a few motors, the idea of a camera stabilizer was feasible. However, we
                    wanted to make this device easily accessible and not everyone is carrying a digital
                    camera. Therefore, we believed that the stabilizers should be designed to carry phones.
                </p>

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

                <h2><strong>Protoype 2: </strong></h2>
                <p>
                    For our second prototype, we thought about how IMU design could facilitate life in
                    general, specifically for the disabled. There are many activities and hobbies people with
                    disabilities cannot partake in due to their conditions. We came up with a controller that
                    uses an IMU as an input. We wanted to make a glove that had an IMU attached to it, and the
                    user could give input on devices by tilting their hand forward, backward, left, or right.
                    We could use the Arduino Nano's IMU and WiFi communication capabilities to achieve this.
                </p>
                <div class="flex justify-center p-5">
                    <Images im_index={13} />
                </div>
                <p>
                    Eventually, we decided on this prototype and design. We were fascinated by the idea of
                    creating something for the benefit of others. We were also intrigued in using the WiFi
                    communication capabilites of a microcontroller, something neither of us has done before.
                </p>

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
                    <video class="w-full max-w-lg rounded-lg" controls src="{base}/videos/mgp3_prototype.MOV">
                        <track kind="captions" />
                    </video>
                </div>
                <p>The following is the code we used to program our prototype.</p>
                <button
                    on:click={() => toggleExpand('proto_code')}
                    class="px-4 py-2 rounded-lg bg-primary text-primary-content text-sm font-medium
                           shadow-btn-retro hover:shadow-none hover:translate-y-px transition-all
                           focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    {expanded['proto_code'] ? 'Hide Code' : 'Show Code'}
                </button>
                {#if expanded['proto_code']}
                    <div transition:slide={{ duration: 200 }}>
                        <pre class="mt-3 bg-base-200 border border-base-300 rounded-lg p-4 overflow-x-auto text-sm"><code>#include &lt;Arduino_LSM6DS3.h&gt;

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
            default: break;
        &#125;
    &#125; else if (b &gt; f) &#123;
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
            default: break;
        &#125;
    &#125;
&#125;</code></pre>
                    </div>
                {/if}
            </div>
        </Card>

        <Card
            title="IMU Glove Drone Controller"
            description="Wireless glove controller using Arduino Nano IMU and ESP32 for accessible drone piloting"
            isModalOpen={false}
        >
            <div>
                <div class="flex justify-center p-5">
                    <Images im_index={14} />
                </div>
                <h2><strong>Ideation/Brainstorming: </strong></h2>
                <p>
                    When brainstorming ideas for MGP4, we pondered the exciting possibilities of utilizing
                    Inertial Measurement Units (IMUs). To see more of our brainstorming process, you can view
                    it under "MGP3: Intermediate Prototype" section of the blog. Basically, our research led
                    us into real-world applications used by IMUs. For example, we found out that drones employ
                    IMUs to relay contextual information about the drone's relative position and movement back
                    to its remote controller. This technology facilitates precise and responsive control,
                    enhancing the user's experience. Since this is a Human-Computer Interaction (HCI) course,
                    we were also keen on approaching this project from a unique angle that would redefine the
                    way we interact with technology.
                    <br />
                    <br />
                    While exploring YouTube, we came across a video featuring the Xbox team at Microsoft discussing
                    the development of the adaptive controller. This innovative controller was specifically designed
                    to accommodate individuals with disabilities, with the goal of providing a more inclusive gaming
                    experience.
                </p>
                <div class="flex justify-center p-5">
                    <div class="aspect-video w-full max-w-lg">
                        <iframe
                            class="w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/9fcK19CAjWM?si=3qDqINjkUSMtGXat"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen
                        ></iframe>
                    </div>
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
                    equally in society. Our team wanted to implement this ideology in our project. Of course, we
                    had to think about the practicality of designing such a device.
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
                <p>
                    We wanted this device to not just be used for video games, but for any device that
                    utilizes user inputs. People with disabilities deserve to have as much flexibility in
                    their hobbies as everyone else. That is how we decided on a glove, which uses the tilt of
                    one's hand as input.
                </p>
                <h2><strong>Finalized Idea #1: </strong></h2>
                <p>
                    So we decided, on making a glove, with the Arduino Nano attached and using its internal
                    IMU. We made a program that determines how far up, down, left, and right the user's glove
                    tilts. We also added LEDs on all four sides of the Nano to indicate where the user is
                    tilting. The following video is a demonstration of the glove we made:
                </p>
                <div class="flex justify-center p-5">
                    <video class="w-full max-w-lg rounded-lg" controls src="{base}/videos/mgp3_glove1.MOV">
                        <track kind="captions" />
                    </video>
                </div>
                <p>
                    Our idea was to use another microcontroller, an ESP32, to wirelessly communicate with the
                    Arduino Nano. Since the ESP32 has two cores on its processor, we planned to use one of its
                    core to communicate with the Arduino and receive input while the other core controlled the
                    device we were wirelessly sending inputs to. The ESP32 would receive four inputs of the
                    four directions the glove would tilt. The following is a video showcasing the inputs the
                    ESP32 would receive:
                </p>
                <div class="flex justify-center p-5">
                    <video class="w-full max-w-lg rounded-lg" controls src="{base}/videos/mgp3_glove2.MOV">
                        <track kind="captions" />
                    </video>
                </div>
                <p>
                    We successfully sent the inputs to the ESP32. The following is a video of the ESP32
                    outputting the inputs it read:
                </p>
                <p>The following is the code we used for this project.</p>
                <button
                    on:click={() => toggleExpand('nano_code')}
                    class="px-4 py-2 rounded-lg bg-primary text-primary-content text-sm font-medium
                           shadow-btn-retro hover:shadow-none hover:translate-y-px transition-all
                           focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                    {expanded['nano_code'] ? 'Hide Arduino Nano Code' : 'Arduino Nano Code'}
                </button>
                {#if expanded['nano_code']}
                    <div transition:slide={{ duration: 200 }}>
                        <pre class="mt-3 bg-base-200 border border-base-300 rounded-lg p-4 overflow-x-auto text-sm"><code>#include &lt;Arduino_LSM6DS3.h&gt;
#include &lt;Wire.h&gt;

float x, y, z;
int degreesX_f = 0;
int degreesX_b = 0;
int degreesY_r = 0;
int degreesY_l = 0;
int threshold = 23;

const int LED_PIN[] = &#123;17, 2, 9, 4&#125;;

void setup() &#123;
    for(int i = 0; i &lt; 4; i++) &#123;
        pinMode(LED_PIN[i], OUTPUT);
    &#125;

    Wire.begin();
    Serial.begin(9600);
    while (!Serial);
    Serial.println("Started");

    if (!IMU.begin()) &#123;
        Serial.println("Failed to initialize IMU!");
        while (1);
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
        digitalWrite(4, 0);
        x = 100 * x;
        degreesX_f = map(x, 0, 97, 0, 90);
        Serial.print("Tilting forward ");
        Serial.print(degreesX_f);
        Serial.println("  degrees");
        if (degreesX_f &gt; threshold) digitalWrite(2, 1);
        else digitalWrite(2, 0);
    &#125; else digitalWrite(2, 0);

    delay(50);

    if (x &lt; -0.1) &#123;
        digitalWrite(2, 0);
        x = 100 * x;
        degreesX_b = map(x, 0, -100, 0, 90);
        Serial.print("Tilting backward ");
        Serial.print(degreesX_b);
        Serial.println("  degrees");
        if (degreesX_b &gt; threshold) digitalWrite(4, 1);
        else digitalWrite(4, 0);
    &#125; else digitalWrite(4, 0);

    delay(50);

    if (y &gt; 0.1) &#123;
        digitalWrite(17, 0);
        y = 100 * y;
        degreesY_l = map(y, 0, 97, 0, 90);
        Serial.print("Tilting left ");
        Serial.print(degreesY_l);
        Serial.println("  degrees");
        if (degreesY_l &gt; threshold) digitalWrite(9, 1);
        else digitalWrite(9, 0);
    &#125; else digitalWrite(9,0);

    delay(50);

    if (y &lt; -0.1) &#123;
        digitalWrite(9, 0);
        y = 100 * y;
        degreesY_r = map(y, 0, -100, 0, 90);
        Serial.print("Tilting right ");
        Serial.print(degreesY_r);
        Serial.println("  degrees");
        if (degreesY_r &gt; threshold) digitalWrite(17, 1);
        else digitalWrite(17, 0);
    &#125; else digitalWrite(17,0);

    byte sendData[8];
    sendData[0] = (degreesX_f &gt;&gt; 8) & 0xFF;
    sendData[1] = degreesX_f & 0xFF;
    sendData[2] = (degreesX_b &gt;&gt; 8) & 0xFF;
    sendData[3] = degreesX_b & 0xFF;
    sendData[4] = (degreesY_r &gt;&gt; 8) & 0xFF;
    sendData[5] = degreesY_r & 0xFF;
    sendData[6] = (degreesY_l &gt;&gt; 8) & 0xFF;
    sendData[7] = degreesY_l & 0xFF;

    Wire.beginTransmission(8);
    Wire.write(sendData, 8);
    Wire.endTransmission();

    delay(1000);
&#125;</code></pre>
                    </div>
                {/if}
                <span class="inline-block ml-2">
                    <button
                        on:click={() => toggleExpand('esp32_code')}
                        class="px-4 py-2 rounded-lg bg-secondary text-secondary-content text-sm font-medium
                               shadow-btn-retro hover:shadow-none hover:translate-y-px transition-all
                               focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2"
                    >
                        {expanded['esp32_code'] ? 'Hide ESP32 Code' : 'ESP32 Code'}
                    </button>
                </span>
                {#if expanded['esp32_code']}
                    <div transition:slide={{ duration: 200 }}>
                        <pre class="mt-3 bg-base-200 border border-base-300 rounded-lg p-4 overflow-x-auto text-sm"><code>// ESP32 receiver code
// Reads I2C data from Arduino Nano and reconstructs
// tilt direction/degree values for drone control.
// (Source code not available for this component.)</code></pre>
                    </div>
                {/if}
                <h2><strong>Code Breakdown: </strong></h2>
                <p>
                    If you look at the code, we use the Arduino's bultin library to read in it's IMU values.
                    We then map those readings to display the tilt as a measure between 0 and 90 degrees.
                    Afterwards, we display each of those values if they are actively being tilted more than
                    the threshold we set, which is 23 degrees. Then, the respective led is lit up. If an LED
                    is lit up, then it's opposite LED will not be. This way, there wouldn't be any confusion
                    on the tilt of the hands. However, its perpendicular LED could still be lit up, allowing
                    the user to see if it's tilted above the threshold in both directions, the X and Y axis
                    values.
                </p>
                <p>
                    We then use the Wire.h library to communicate with the ESP32 microcontroller. We send an
                    array of 8 bytes, where all four inputs are divided into two bytes of data. The ESP32
                    reads this data and then converts it into an array of four ints. A for loop is used to
                    combine two bytes of data into one, then inputs the recovered data into the array.
                    Afterwards, each element of the array is assigned to it's respective integers. That is how
                    the ESP32 receives the data, which can be used for many applications.
                </p>
                <p>
                    We thought about different cases we could use this for. We could use it as an interactive
                    video game controller, but that idea has already been done, which was also the main
                    inspiration for this project. We wanted to make something new, not just recreate something
                    already made. That is when we decided to use the glove as a controller for a drone.
                </p>

                <h2><strong>Finalized Idea #2: </strong></h2>
                <p>So we're going to make an IMU controller for an fpv drone. Why an fpv drone?</p>
                <div class="flex justify-center p-5">
                    <div class="aspect-video w-full max-w-lg">
                        <iframe
                            class="w-full h-full rounded-lg"
                            src="https://www.youtube.com/embed/nsI2eMFEvkc?si=DQPkpuFHmPLXr8gP"
                            title="YouTube video player"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                            referrerpolicy="strict-origin-when-cross-origin"
                            allowfullscreen
                        ></iframe>
                    </div>
                </div>
                <p>
                    The first challenge we anticipated was formalizing the IMU data to be read as valid input.
                    It's difficult to determine the exact input format required, but what if we built a drone
                    ourselves? Drones are expensive, and FPV drones are even more so. How about we build our
                    own drone?
                </p>
                <p>
                    Building our own drone presents several advantages. We were inclined to use the ESP32, as
                    it features a dual-core processor and can create a WiFi access point. By utilizing the
                    ESP32, we can use it to act as the drone's controller and provide a point of connection
                    for the Arduino with the built-in IMU to connect wirelessly.
                </p>
                <p>
                    Additionally, the extra layer of complexity beyond just getting imu readings also made
                    this a more interesting project.
                </p>

                <h2><strong>How to build a drone: </strong></h2>
                <p>To build the drone we have to address a few important aspects.</p>
                <ul>
                    <li>What electrical parts do we need</li>
                    <li>
                        We also need to implement some signal based communication channel between the remote
                        controller and the drones onboard controller.
                    </li>
                    <li>We need some sort of housing for the drones electronic components.</li>
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
                    As I said earlier we wanted to use Wifi. The esp32, has a way to create a wifi access
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
</div>
