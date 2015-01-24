#web-historian
This is a project I reworked as a Hacker-in-Residence at [Hack Reactor](www.hackreactor.com) to practice pure Node.js. The first time I did this project, I did it with callbacks; this redo was a good opportunity to work with promises.

It works much like [Archive.org](www.archive.org), but is far less pretty.

##Technologies
- Node.js
- Q promise library
- http-request
- cron

##To Run:

1. Clone the repo to your local machine.
2. Run `npm install` from within `web-historian/`.
3. From the root, start a node server: `node web/server.js`.
4. Open a browser; enter `http://localhost:8080/` in the URL bar.
5. Play!
