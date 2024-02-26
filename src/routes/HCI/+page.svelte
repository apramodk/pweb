<script lang="ts">
    import {Card} from "$lib/index"

</script>


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
