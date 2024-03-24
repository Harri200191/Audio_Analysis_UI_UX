# Audio Analysis UI UX 
## Description

Hey folks! This full stack application is completely AI powered as it aims to convert either audio or a video to its corresponding text and that too in few languages. The resulting text can also be converted to another language upon selection. 🎙️📹🔤  

Some other pros of the application include sentiment analysis of the text so one can easily judge the sentiment of the audio or video being uploaded itself. This comes with a topic and summary section as well. 💬📈📝  
  
If we talk about the technical details, I used a ReactJS frontend with 2 different backend servers - One in NodeJS to handle user profiles and login procedure coupled with mongoDB and the other in Flask to handle the main AI logic. This logic contained the use of PyTorch, transformers, HuggingFace inference API's, nltk, pydub, moviepy and an array of other libraries as well. Have a look at the GitHub repo for more! 💻🚀

## Technologies Used

### Frontend
- React.js
- HTML5/CSS3
- JavaScript
- Redux ToolKit

### Backend
- Node.js
- Express.js
- MongoDB
## Installation

1. Clone the repository:

```git
git clone https://github.com/Harri200191/Audio_Analysis_UI_UX.git
```

2. Navigate to the project directory:

```bash
cd Audio_Analysis_UI_UX
```

3. Install dependencies:

```bash
cd backend
npm install

cd ..
cd frontend
npm install

cd ..
```

## Usage

1. Start the backend server:

```bash
cd backend
npm run backend
```

2. Start the frontend development server, create another terminal and write:

```bash
cd frontend
npm start
```

3. In the flask app .ipynb file, pip install all the dependencies and run the server code. To do so, be in the same directory as the requirements.txt file and write the following command in the terminal

```cmd
pip install -r requirements.txt
```

5. Make sure you edit the .env file of backend and add

```text
URI="<YOUR MONGO ATLAS URL>"
NODE_ENV="deployment"
JWT_SECRET = "RANDOM147297@OIY3"
FRONTEND_URL="http://localhost:3000"
```

5. Open your web browser and navigate to `http://localhost:3000` to view the application.

## Contributing

Contributions are welcome! If you face any issue executing the code, feel free to open up an issue in the repo or contribute by solving it for yourself!
 
