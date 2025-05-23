Reproducibility Instructions   
To run the London Crime Mapping Platform locally, follow the appropriate setup path below depending on whether you are using your own database or the provisioned one. 
Option 1: Running with Your Own PostgreSQL Database 
1.	Clone the repository:  
git clone https://github.com/scarfacem140i/ldn-crime-app cd ldn-crime-app 
2.	Install dependencies: 
npm install 
3.	Create a .env file at the root of the project and define the following environment variable: 
DATABASE_URL=<your-postgresql-connection-string> 
4.	Push the schema to the database using Drizzle ORM: npx drizzle-kit push 
5.	Start the development server: npm run dev 
6.	In a separate terminal, populate the database with police crime data: npm run db:police-data 
Option 2: Using the Provisioned Database 
1.	Use the provided DATABASE_URL from the course or deployment environment. 
2.	Run the development server: 
npm run dev 
3.	All necessary data and functionality should now be available. 
Creating an Admin User 
1.	Register a new user via the website as normal. 
2.	In your PostgreSQL database, locate the new user entry and update the role column to: 
Admin 
3.	This user now has administrative privileges and can be used to create additional admin accounts. 
