<script lang="ts">
    import {Card} from "$lib/index"

</script>

<style>
    img {
        width: 560px; /* Set the width to 100 pixels */
        height: auto; /* Automatically calculate the height based on the aspect ratio */
    }
</style>

<main class="card w-max m-10">
    <Card title="LED Game" description="Simple LED game controlled by capacitive touch sensors"isModalOpen={false}>
        <div class="report">
            <p><strong>Introduction:</strong> The provided code implements a simple LED game controlled by capacitive touch sensors. The game utilizes an 8x8 LED matrix to display the game state and four capacitive sensors as input devices. The objective of the game is to press the correct capacitive sensor corresponding to the LED tile at the bottom row.</p>
            <p><strong>Components:</strong></p>
            <ul>
                <li>LED Matrix: An 8x8 LED matrix is used to represent the game board. Each LED corresponds to a pixel in the game grid.</li>
                <li>Capacitive Sensors: Four capacitive sensors are employed as input devices. These sensors detect touch inputs and trigger corresponding actions in the game.</li>
                <li>Arduino Board: The code is designed to run on an Arduino board, which provides the necessary hardware interface for controlling the LED matrix and reading sensor inputs.</li>
            </ul>
            <div class="flex justify-center p-5">
                <div>
                    <iframe width="560" height="315" src="https://www.youtube.com/embed/0R-9baJcEcI?si=BwuiWXOWA6UuVAY3" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
                <!-- <iframe width="560" height="315" frameborder="0" src="https://replit.com/@AkashPramod/MaroonHarmlessDisk#main.cpp"></iframe> -->
            </div>
            <p><strong>Initialization:</strong> The code begins with the initialization of necessary variables and pin configurations. Two arrays, <code>row</code> and <code>col</code>, store the pin numbers for rows and columns of the LED matrix, respectively. An array of <code>CapacitiveSensor</code> objects, <code>buttonPins</code>, is created to handle capacitive input from the sensors. Other variables like <code>pixels</code>, <code>currentMillis</code>, <code>prevMillis</code>, <code>sensorMillis</code>, <code>lives</code>, and <code>score</code> are initialized.</p>
            <p><strong>Main Loop:</strong> The <code>loop()</code> function contains the main game logic and is executed continuously. It updates the game state, handles input from capacitive sensors, and refreshes the LED matrix display. The game checks for button presses using capacitive sensors and updates the game state accordingly. Tiles are moved down one row, and a new tile is generated at the top row periodically.</p>
            <p><strong>Game Logic:</strong> The <code>moveTilesDown()</code> function moves existing tiles down one row, while the <code>generateNewTile()</code> function randomly generates a new tile at the top row. Button presses are detected using capacitive sensors. If the correct button is pressed, the score is incremented; otherwise, lives are decremented.</p>
            <p><strong>Screen Refresh:</strong> The <code>refreshScreen()</code> function updates the LED matrix display by iterating over rows and columns. It turns on LEDs where the row is <code>HIGH</code> and the column is <code>LOW</code>, representing the intersection of rows and columns. Pixels are turned off by setting the column pin to <code>HIGH</code> when the pixel state is <code>LOW</code>.</p>
        </div> 
    </Card>
</main>

<main class="card w-max m-10">
    <Card title="Plant Tamogachi" description="A device that treats a plant as a virtual pet"isModalOpen={false}>
        <div class="report">
            <h2><strong>Introduction:</strong> </h2>
            <p>
                The provided code implements an interactive LCD controlled by photoresistors and capacitive sensors. The photoresistor 
                detects if there is sunlight at least 4 hours a day and the capacitive sensor detects if it’s watered at least once per 
                day. The state is updated at the end of each day.
            </p><br>
            
            <h2><strong>Prototyping:</strong></h2> 
            <p>
                Our first idea was to create a variation of our previous project, the Piano Tiles game. We wanted a uniqur input device,
                and one idea was to use a conductive, squishy ball. How hard you squeezed would determine which piano tile you pressed.
                For example, a light squeeze would indicate the first key is pressed while a hard squeeze indicates the last key is 
                pressed. 
            </p>
            <div class="flex justify-center p-5">
                <img src='src\lib\images\[COSC594]mpg2_test1.png' alt="Prototype 1" />
            </div>
            <p>
                We eventually decided against the idea for three reason:<br>
                1. Difficulty to find effective candidates for conductive material that is squeezable.<br>
                2. The complex and extensive debounce development.<br>
                3. Idea seemed more frustrating than actually function.<br>
            </p><br>
            <p>
                We then decided to explore a new input material and we decided on dough. Our idea was to use four pieces of dough as the
                 inputs for the Piano Tiles game. 
            </p>
            <div class="flex justify-center p-5">
                <img src='src\lib\images\[COSC594]mpg2_test2.png' alt="Prototype 2" />
            </div>            
            <p>
                Again, we abandoned the idea for three reasons:<br>
                1. Dough was a lot harder to make then anticipated.<br>
                2. The game was just too similar to our previous project.<br>
                3. Having to use the same dough for days on end with multiple people touching it just seemed nasty.<br>
            </p><br>
            <p>
                We ultimately decided against doing the Piano Tiles game. We couldn't find a way to improve it as it already was a 
                really creative project with unique input. That's when we began brainstorming all over again. We looked back at some of 
                the mini projects and recalled the photoresistor. We thought light itself as an input is so intriguing. Therefore, we 
                came up with the idea of an interactive 8x8 screen. We could make a threshold where the screen would display a sad face 
                if the photoresistor wasn't receiving sufficient lighting, a happy face if it receives a lot of lighting, and a 
                content face for everything in between.
            </p>
            <div class="flex justify-center p-5">
                <img src='src\lib\images\[COSC594]mpg2_test3.png' alt="Prototype 3" />
            </div>
            <p>
                The big issue with this program was that it was too simple. It was creative, but not impressive. Also, the 8x8 LED matrix was just becoming boring as we have all
                programmed it multiple times. Again, we were stuck brainstorming until Akash made a remark, "Don't you guys think the photoresistor is basically like a plant, where 
                it's happy to receive sunlight." That's when we came up with our project idea, a plant that could be treated like a virtual pet. We thought that we could use an LCD
                screen to determine whether the plant was happy, sad, or content based on how it's being treated, like how much sun or water it has received.
            </p><br>
            
            <p><strong>Components:</strong></p>
            <ul>
                <li>3D Printed Pot</li>
                <li>ESP-WROOM-32</li>
                <li>TFT LCD Display Module GC9A01 Driver</li>
                <li>Analog Soil Moisture Sensor</li>
                <li>Photoresistor</li>
                <li>Wires</li>
                <li>Breadboard</li>
            </ul><br>

            <p><strong>Usage:</strong>
            </p>
            <p>
                The device monitors two crucial aspects for the plant's well-being: soil moisture level and light exposure.
            </p><br>
            <ul>
                <li>
                    <strong>Soil Moisture Level:</strong> The analog soil moisture sensor measures the moisture level in the soil. When the soil becomes 
                    too dry, the device prompts the user to water the plant.
                </li>
                <li>
                    <strong>Light Exposure:</strong> The photoresistor measures the intensity of light. Plants require a certain amount of sunlight to 
                    thrive. The device keeps track of the duration of sunlight exposure. If the plant receives insufficient sunlight, its
                    happiness level decreases.
                </li>
            </ul><br>
            <p>
                The device simulates a day-night cycle, with each simulated day lasting approximately 24 hours. Throughout the day, the 
                plant's happiness level is updated based on its care and the environmental conditions.
            </p><br>

            <p><strong>Functionality:</strong>
            </p>
            <ul>
                <li><strong>Plant Happiness:</strong> The device displays a digital representation of the plant's mood (either happy or 
                    sad) based on its care and environmental conditions.</li>
                <li><strong>User Interaction:</strong>Users can interact with the device by watering the plant when prompted and ensuring
                    it receives adequate sunlight.</li>
            </ul><br>

            <h2><strong>Video Demonstration:</strong></h2>
            <div class="flex justify-center p-5">
                <div>
                    <iframe width="560" height="315" src="https://www.youtube.com/watch?v=S3geHCH6NZI&ab_channel=JackHutchins" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
            </div>
        </div> 
    </Card>
</main>