import express from "express"
import cors from "cors"
import Database from 'better-sqlite3'
const db = Database('./db/data.db', { verbose: console.log })

const app = express()
app.use(cors())
app.use(express.json())
const port = 4000

app.get('/', (req, res) => {
    res.send(`
    <ul>
    <li><a href="/applicants">Applicants</a></li>
    <li><a href="/interviewers">Interviewers</a></li>
    <li><a href="/interviews">Interviews</a></li>
    </ul>
    `)
  })
  
 
  const getApplicants = db.prepare(`
  SELECT * FROM applicants;
  `)
  const getInterviewers = db.prepare(`
  SELECT * FROM interviewers;
  `)
  const getInterviews = db.prepare(`
  SELECT * FROM interviewers;
  `)
  
  const getApplicantsById = db.prepare(`
  SELECT * FROM applicants WHERE id = ?;
  `)
  const getInterviewersById = db.prepare(`
SELECT * FROM interviewers WHERE id = ?;
`)
const getInterviewsById = db.prepare(`
SELECT * FROM interviews WHERE id = ?;
`)
  const getInterviewsForApplicants = db.prepare(`
  SELECT * FROM interviews WHERE applicantsId = ?;
  `)
  const getInterviewsForInterviewers = db.prepare(`
  SELECT * FROM interviews WHERE interviewersId = ?;
  `)
  const getInterviewersForApplicants = db.prepare(`
  SELECT interviewers.* FROM interviewers
  JOIN interviews ON interviewers.id = interviews.interviewersId
  WHERE interviews.applicantsId = ?;
  `)
  const getApplicantsForInterviewers = db.prepare(`
SELECT applicants.* FROM applicants
JOIN interviews ON applicants.id = interviews.applicantsId
WHERE interviews.interviewersId = ?;
`)
  

//get applicants with their interviews and interviewers
  app.get('/applicants', (req, res) => {
    const applicants = getApplicants.all()
    for(let applicant of applicants){
        applicant.interviews = getInterviewsForApplicants.all(applicant.id)
        applicant.interviewers = getInterviewersForApplicants.all(applicant.id)
    }
    res.send(applicants)
  })

  //get applicants by id
  app.get('/applicants/:id', (req, res) => {
    const id = Number(req.params.id)
  const applicant = getApplicantsById.get(id)
    if (applicant) {
        applicant.interviews = getInterviewsForApplicants.all(applicant.id)
        applicant.interviewers = getInterviewersForApplicants.all(applicant.id)
      res.send(applicant)
    } else {
      res.status(404).send({ error: 'Applicants not found' })
    }
  })

  //get Interviewers with their interviews and applicants
  app.get('/interviewers', (req, res) => {
      const interviewers = getInterviewers.all()
      for(let interviewer of interviewers){
        interviewer.interviews = getInterviewsForInterviewers.all(interviewer.id)
        interviewer.applicants = getApplicantsForInterviewers.all(interviewer.id)
    }
      res.send(interviewers)
  })

  //get Interviewers by Id
app.get('/interviewers/:id', (req, res) => {
    const id = Number(req.params.id)
  const interviewer = getInterviewersById.get(id)
    if (interviewer) {
        interviewer.interviews = getInterviewsForInterviewers.all(interviewer.id)
        interviewer.applicants = getApplicantsForInterviewers.all(interviewer.id)
      res.send(interviewer)
    } else {
      res.status(404).send({ error: 'Interviewer not found' })
    }
  })

  //get Interviews
  app.get('/interviews', (req, res) => {
    const interviews = getInterviews.all()
    res.send(interviews)
  })


  // Post applicants
  const postApplicant = db.prepare(`
  INSERT INTO applicants (name, age, position) VALUES (?, ?, ?);
  `)

  app.post('/applicants', (req, res) => {
    const name = req.body.name
    const age = req.body.age
    const position = req.body.position
      let errors: string[] = []
      
      if (typeof req.body.name !== 'string') {
          errors.push('Add a proper NAME!')
        }
     
      if(typeof req.body.age  !=='number') {
          errors.push('Add a proper TYPE OF AGE')
      }
      if (typeof req.body.position !== 'string') {
        errors.push('Add a proper POSITION!')
      }
      if( errors.length === 0)  {
        const applicantInfo = postApplicant.run(name, age, position)
        const newApplicants = getApplicantsById.get(applicantInfo.lastInsertRowid)
        res.send(newApplicants)
      }
      else {
          res.status(400).send({ errors: errors })
        }
  })
   // Post Interviewer
   const postInterviewer = db.prepare(`
  INSERT INTO interviewers (name, company) VALUES (?, ?);
  `)

  app.post('/interviewers', (req, res) => {
    const name = req.body.name
    const company = req.body.company
      let errors: string[] = []
      
      if (typeof req.body.name !== 'string') {
          errors.push('Add a proper NAME!')
        }
     
      if(typeof req.body.company  !=='string') {
          errors.push('Add a proper TYPE OF company')
      }
      if( errors.length === 0)  {
        const interviewerInfo = postInterviewer.run(name, company)
        const newInterviewer = getInterviewersById.get(interviewerInfo.lastInsertRowid)
        res.send(newInterviewer)
      }
      else {
          res.status(400).send({ errors: errors })
        }
  })
    // Post Interviews
    const postInterviews = db.prepare(`
    INSERT INTO interviews (applicantsId, interviewersId, time, place) VALUES (?, ?, ?, ?);
    `)
  
    app.post('/interviews', (req, res) => {
      const applicantsId = req.body.applicantsId
      const interviewersId = req.body.interviewersId
      const time = req.body.time
      const place = req.body.place
        let errors: string[] = []
        
        if (typeof req.body.applicantsId !== 'number') {
            errors.push('Add a proper applicant Id!')
          }
        if(typeof req.body.interviewersId  !=='number') {
            errors.push('Add a proper interviewer Id')
        }
        if(typeof req.body.time  !=='string') {
            errors.push('Add a proper TIME')
        }
        if(typeof req.body.place  !=='string') {
            errors.push('Add a proper place')
        }
        if( errors.length === 0)  {
          const interviewInfo = postInterviews.run(applicantsId, interviewersId, time, place)
          const newInterviews = getInterviewsById.get(interviewInfo.lastInsertRowid)
          res.send(newInterviews)
        }
        else {
            res.status(400).send({ errors: errors })
          }
    })


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  
  

