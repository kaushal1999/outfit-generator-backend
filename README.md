
### Personalized Outfit generation using Large Language Model & Langchain:

Input: User details (age, gender, region, purchase history, etc)
 <br> Output: Outfit recommendations
<br>
Model: Existing Gen AI model
<br>
LangChain: Framework for summarizing previous conversations
<br><br>
The user provides their details to the system.
<br>
The system feeds these details to the Gen AI model.
<br>
The Gen AI model generates outfit recommendations based on the user's details.
<br>
The system summarizes the previous conversations with the user using LangChain.
<br>
The system sends the summarized conversations to the Gen AI model along with the user's details.
<br>
The Gen AI model generates the final outfit recommendations.
<br><br>

### Requirements:
Node.js v18.17.0

## Installation Steps:
1. Either clone the repo or download it as a zip. If using zip, extract it in a folder and open the extracted files in a code editor like vsCode.

### server-side
2. install the required packages using npm install
3. In the .env file, add the openAi api key. Instructions and key for the same are given are the .env file itself.
4. Run the server using the command npm start

### client side
5. run "cd client" to change current directory to client
6. install the required packages using npm install
7. Run npm start

## Using the App
1) Create a new user account
2) Ask any questions to outfit generator



