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
    <li><a href="/companies">Companies</a> </li>
    <li><a href="/employees">Employees</a> </li>
    </ul>
    `)
  })
  
 //get them all
  const getApplicants = db.prepare(`
  SELECT * FROM applicants;
  `)
  const getInterviewers = db.prepare(`
  SELECT * FROM interviewers;
  `)
  const getInterviews = db.prepare(`
  SELECT * FROM interviews;
  `)
  const getCompanies = db.prepare(`
  SELECT * FROM companies`)
  const getEmployees = db.prepare(`
  SELECT * FROM employees`)


 //get them by Id
  const getApplicantsById = db.prepare(`
  SELECT * FROM applicants WHERE id = ?;
  `)
  const getInterviewersById = db.prepare(`
  SELECT * FROM interviewers WHERE id = ?;
  `)
  const getInterviewsById = db.prepare(`
  SELECT * FROM interviews WHERE id = ?;
  `)
  const getCompaniesById = db.prepare(`
  SELECT * FROM companies WHERE id = ?;
  `)
  const getEmployeesById = db.prepare(`
  SELECT * FROM employees WHERE id = ?;
  `)


  //get everything else
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
const getEmployeesforCompanies = db.prepare(`
  SELECT * FROM employees WHERE companyId = ?;
  `)

  
//get employees 
app.get('/employees', (req, res) => {
    const employees = getEmployees.all()
    for(let employee of employees){
        employee.companies = getCompaniesById.get(employee.companyId)
    }
    res.send(employees)
    
  })
  //get employees with the companies they work in by id
  app.get('/employees/:id', (req, res) => {
    const id = Number(req.params.id)
    const employee = getEmployeesById.get(id)
    if (employee) {
        employee.companies = getCompaniesById.get(employee.companyId)
      res.send(employee)
    } else {
      res.status(404).send({ error: 'Employee not found' })
    }
  })
//get companies with employees
app.get('/companies', (req, res) => {
    const companies = getCompanies.all()
    for(let company of companies){
        company.employees = getEmployeesforCompanies.all(company.id)
    }
    res.send(companies)
  })
   //get companies with employees by id
   app.get('/companies/:id', (req, res) => {
    const id = Number(req.params.id)
  const company = getCompaniesById.get(id)
    if (company) {
        company.employees = getEmployeesforCompanies.all(company.id)
      res.send(company)
    } else {
      res.status(404).send({ error: 'Company not found' })
    }
  })
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
  INSERT INTO interviewers (name, companyId) VALUES (?, ?);
  `)

  app.post('/interviewers', (req, res) => {
    const name = req.body.name
    const companyId = req.body.companyId
      let errors: string[] = []
      
      if (typeof req.body.name !== 'string') {
          errors.push('Add a proper NAME!')
        }
     
      if(typeof req.body.companyId  !=='number') {
          errors.push('Add a proper company ID')
      }
      if( errors.length === 0)  {
        const interviewerInfo = postInterviewer.run(name, companyId)
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
    // Post Companies
    const postCompanies = db.prepare(`
    INSERT INTO companies (name, email) VALUES (?, ?);
    `)
  
    app.post('/companies', (req, res) => {
      const name = req.body.name
      const email = req.body.email
        let errors: string[] = []
        
        if (typeof req.body.name !== 'string') {
            errors.push('Add a proper Name!')
          }
        if(typeof req.body.email  !=='string') {
            errors.push('Add a proper Email')
        }
       
        if( errors.length === 0)  {
          const companyInfo = postCompanies.run(name, email)
          const newCompany = getCompaniesById.get(companyInfo.lastInsertRowid)
          res.send(newCompany)
        }
        else {
            res.status(400).send({ errors: errors })
          }
    })
    // TESTS

   
//    app.patch('/applicants/:id', (req, res) => {
  
//     let id = Number(req.params.id)
//     let match = (applicant => applicant.id === id)
//     if (match) {
//       if (req.body.applicants) {
//         match.applicants = req.body.applicants
//       }
  
//       if (req.body.authorId) {
//         match.authorId = req.body.authorId
//       }
//       res.send(match)
//     } else {

//       res.status(404).send({ error: 'applicants not found.' })
//     }
//   })

  const deleteApplicants= db.prepare(`
  DELETE FROM applicants WHERE id = ?;
`) 
    app.delete('/applicants/:id', (req, res) => {
        const id = Number(req.params.id)
        deleteApplicants.run(id)
      })
   


  app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
  })
  
  

