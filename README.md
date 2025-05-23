# UI/place - Collaborative Pixel Canvas Editr

> Project built as part of "Distributed and Network Programming" and "System and Network Administration" courses final project

Real-time collaborative pixel canvas editor, inspired by the famous [Reddit Place](https://www.reddit.com/r/place/) (
also known as Pixel Battle). \
The project allows users to draw on a shared canvas with real-time updates. \
System supports 100+ concurrent users and 1000+ requests per second.

## Authors

- [Nikita Timofeev](https://github.com/morisummerz)
- [Almaz Andukov](https://github.com/andiazdi)

## How to run it ?

1. Clone the repository

```bash
git clone https://github.com/MoriSummerz/IU-Place/
cd IU-Place
```

2. Run the compose file

```bash
DB_PASSWORD=<YOUR_PASSWORD> APP_PORT=<YOUR_PORT> GF_USER=<GRAFANA_USER> GF_PASSWORD=<GRAFANA_PASSWORD> docker compose up --build
```

3. Open the browser and go to `localhost:<YOUR_PORT>` \
   You should see the application running.

## What technologies were used?

#### Backend
![Backend](https://skillicons.dev/icons?i=python,fastapi,redis,postgres&theme=dark)
#### Frontend
![Frontend](https://skillicons.dev/icons?i=ts,react,vite,tailwind&theme=dark)
#### DevOps
![DevOps](https://skillicons.dev/icons?i=docker,nginx,prometheus,grafana&theme=dark)

