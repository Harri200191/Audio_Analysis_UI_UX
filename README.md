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

```bash
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

cd..
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
 