<h1 align="center">Wazafne</h1>

[![Typing SVG](https://readme-typing-svg.herokuapp.com?font=Fira+Code&size=27&pause=500&color=2D90E4&random=false&width=750&lines=Employment+platform+for+software+developers.)](https://git.io/typing-svg)

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB)
![MongoDB](https://img.shields.io/badge/MongoDB-%234ea94b.svg?style=for-the-badge&logo=mongodb&logoColor=white)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)
![Flask](https://img.shields.io/badge/flask-%23000.svg?style=for-the-badge&logo=flask&logoColor=white)
![ESLint](https://img.shields.io/badge/ESLint-4B3263?style=for-the-badge&logo=eslint&logoColor=white)
![JWT](https://img.shields.io/badge/JWT-black?style=for-the-badge&logo=JSON%20web%20tokens)
![Git](https://img.shields.io/badge/git-%23F05033.svg?style=for-the-badge&logo=git&logoColor=white)
![GitHub](https://img.shields.io/badge/github-%23121011.svg?style=for-the-badge&logo=github&logoColor=white)
![Render](https://img.shields.io/badge/Render-%46E3B7.svg?style=for-the-badge&logo=render&logoColor=white)
![Postman](https://img.shields.io/badge/Postman-FF6C37?style=for-the-badge&logo=postman&logoColor=white)

## Features ✨

This platform is an AI-driven solution designed to optimize the software development hiring process. By employing semantic search and vector embeddings, we connect employers with qualified candidates efficiently. Our platform streamlines job posting, application, and talent discovery for both parties.

<details>
    
<summary> As an Employer</summary>

- Create new jops and edit it
- Filter employees by there bio's or data
- List jops i created
- Accept or Reject application to my created jop
- List the applied applications to my created jop
- Edit my created jop status if still accept applications or not
- Genral search and browse employees

</details>

<details>

<summary> As an Employee</summary>

- Apply for a jop
- List All jops i applied in it and my status if Accepted, Rejected or No Response
- Add and edit my profile with my data to match jops
- I will be notified with jops that matched my profile via email
- Access to a page contains all matched jops to my profile
- Track my profile views status
- General search for all jops
- Home page contains all posted jops

 </details>

## Documentation 📜

- Backend API endpoints documentaion here: [**`link`** 🔗](https://documenter.getpostman.com/view/28868026/2sA3kbgyQ6#682d16a7-58ea-497b-b8c7-e4af560838b3)

- You can also access all project documentaions in the docs directory here: [**`link`** 🔗](https://github.com/mhmadalaa/wazafne/tree/main/docs)

## Installation 📥

Install the project with `npm`

```bash
> git clone https://github.com/mhmadalaa/wazafne
> cd wazafne/
> cd backend && npm i
```

To run backend-api

```bash
> cd backend && npm run start
```

To run ai-api

```bash
> cd ai && python app.py
```

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

<details>
    <summary>
        envs
    </summary>

DATABASE=

SECRET_KEY=

EMAIL_HOST=

EMAIL_PORT=

EMAIL_USERNAME=

EMAIL_PASSWORD=

AI_API=

PORT=
