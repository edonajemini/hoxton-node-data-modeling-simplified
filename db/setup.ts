import Database from "better-sqlite3";
const db = new Database('./db/data.db', { verbose: console.log });


function createApplicants(){
    const applicants = [
        {
            name: "Lara Hancock",
            age:22,
            position:"Receptionist"
        },
        {
            name: "Bryant Higgins",
            age:28,
            position:"Assistant Director"
        },
        {
            name: "Luna Johnson",
            age:26,
            position:"Office manager"
        },
        {
            name: "Conrad Sharp",
            age:31,
            position:"Purchasing manager"
        },
        {
            name: "Veronica Beck",
            age:34,
            position:"Operations manager"
        }
    ]

const dropApplicantsTable = db.prepare(`
    DROP TABLE IF EXISTS applicants;
`)
dropApplicantsTable.run();

const createApplicantsTable = db.prepare(`
    CREATE TABLE IF NOT EXISTS applicants (
        id INTEGER NOT NULL,
        name TEXT NOT NULL,
        age INTEGER NOT NULL,
        position TEXT NOT NULL,
        PRIMARY KEY (id)
    );
`)
createApplicantsTable.run();



const createNewApplicant = db.prepare(`
    INSERT INTO applicants (name, age, position) VALUES (?,?,?);
`)

for(let applicant of applicants){
    createNewApplicant.run(applicant.name, applicant.age, applicant.position);
}
}

function createInterviewers(){
    
    const interviewers = [
        {
            name: "Brantley Shelton",
            companyId:1
        },
        {
            name: "Warner Parris",
            companyId:2
        },
        {
            name: "Amy Daley",
            companyId:4
        },
        {
            name: "Frederick Garland",
            companyId:3
        }
    ]

    const dropInterviewersTable = db.prepare(`
        DROP TABLE IF EXISTS interviewers;
    `)
    dropInterviewersTable.run();

    const createInterviewersTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS interviewers (
            id INTEGER NOT NULL,
            name TEXT NOT NULL,
            companyId INTEGER NOT NULL,
            PRIMARY KEY (id),
            FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
        );
    `)
    createInterviewersTable.run();

    const createNewInterviewer = db.prepare(`
        INSERT INTO interviewers (name, companyId) VALUES (?,?);
    `)

    for(let interviewer of interviewers){
        createNewInterviewer.run(interviewer.name, interviewer.companyId);
    }
}

function createInterviews(){
    const interviews = [
        {
            applicantsId: 1,
            interviewersId:2,
            time:"12/10/2022",
            place:"",
            successful:"yes"
        },
        {
            applicantsId: 2,
            interviewersId:3,
            time:"12/10/2022",
            place:"",
            successful:"no"
        },
        {
            applicantsId: 3,
            interviewersId:1,
            time:"12/10/2022",
            place:"",
            successful:"yes"
        },
        {
            applicantsId: 4,
            interviewersId:2,
            time:"12/10/2022",
            place:"",
            successful:"no"
        }
    ]
    
    const dropInterviewsTable = db.prepare(`
        DROP TABLE IF EXISTS interviews;
    `)
    dropInterviewsTable.run();

    const createInterviewsTable = db.prepare(`
            CREATE TABLE IF NOT EXISTS interviews (
                id INTEGER NOT NULL,
                applicantsId INTEGER NOT NULL,
                interviewersId INTEGER  NOT NULL,
                time TEXT,
                place TEXT,
                successful TEXT NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (applicantsId) REFERENCES applicants(id) ON DELETE CASCADE,
                FOREIGN KEY (interviewersId) REFERENCES interviewers(id) ON DELETE CASCADE
            );
        `)
        createInterviewsTable.run();

    
        const createNewInterview = db.prepare(`
            INSERT INTO interviews (applicantsId, interviewersId, time, place, successful) VALUES (?,?,?,?,?);
        `)
    
        for(let interview of interviews){
            createNewInterview.run(interview.applicantsId, interview.interviewersId, interview.time, interview.place, interview.successful);
        }
}

function createCompanies(){
        
    const companies = [
        {
            name:"Google",
            email:"google@google.com"
        },
        {
            name:"Apple",
            email:"apple@apple.com"
        },
        {
            name:"Amazon",
            email:"amazon@amazon.com"
        },
        {
            name:"Walmart",
            email:"walmart@walmart.com"
        },
    ]
    
    const dropCompaniesTable = db.prepare(`
        DROP TABLE IF EXISTS companies;
    `)
    dropCompaniesTable.run();
    
    const createCompaniesTable = db.prepare(`
        CREATE TABLE IF NOT EXISTS companies (
            id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            PRIMARY KEY (id)
        );
    `)
    createCompaniesTable.run();
    
    const createNewCompany = db.prepare(`
        INSERT INTO companies (name, email) VALUES (?, ?);
    `)
    
    for(let company of companies){
        createNewCompany.run(company.name, company.email);
    }
}

function createEmployees(){
            
     const employees = [
        {
             name: "Brantley Shelton",
             email: "BrantleyShelton@google.com",
             position: "Product Manager",
             companyId: 1
        },
        {
            name: "Warner Parris",
            email: "WarnerParris@gmail.com",
            position: "Team Leader",
            companyId: 2
        },
        {
            name: "Amy Daley",
            email: "Amy Daley@apple.com",
            position: "Executive",
            companyId: 3
        },
        {
            name: "Frederick Garland",
            email:"FrederickGarland@gmail.com",
            position:"Assistant Manager",
            companyId:4
        }
        ]

        const dropEmployeesTable = db.prepare(`
            DROP TABLE IF EXISTS employees;
        `)
        dropEmployeesTable.run();

        const createEmployeesTable = db.prepare(`
            CREATE TABLE IF NOT EXISTS employees (
                id INTEGER NOT NULL,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                position TEXT NOT NULL,
                companyId INTEGER NOT NULL,
                PRIMARY KEY (id),
                FOREIGN KEY (companyId) REFERENCES companies(id) ON DELETE CASCADE
            );
        `)
        createEmployeesTable.run();

        const createNewEmployee = db.prepare(`
            INSERT INTO employees (name, email, position, companyId) VALUES (?,?,?,?);
        `)

        for(let employee of employees){
            createNewEmployee.run(employee.name, employee.email, employee.position, employee.companyId);
        }
}

createCompanies();
createEmployees();
createApplicants();
createInterviewers();
createInterviews();