### labV4NwabudeArinze
DA217B: Backend Development, Lab assignment #4

### README.md

# Web Application

This web application provides user authentication, role-based access control, and dynamic routing for user profiles. Users can register, log in, and access different pages based on their roles (student, teacher, admin).

## Features

- User Registration and Login
- Role-Based Access Control
- Dynamic User Profile Pages
- Password Encryption with bcrypt
- JSON Web Tokens (JWT) for Authentication

## Prerequisites

- Node.js (version 14.x or higher)
- npm (Node Package Manager)

## Installation

1. Clone the repository:
   ```terminal
   git clone https://github.com/Arinwa/labV4NwabudeArinze.git
   cd labV4NwabudeArinze
   ```

2. Install the dependencies:
   ```terminal
   npm install
   ```

3. Set up the environment variables:
   - Create a `.env` file in the root directory.
   - Add the following line to the `.env` file:
     ```plaintext
     TOKEN=your_secret_token
     ```

4. Initialize the database:
   ```terminal
   node database.js
   ```

## Running the Application

1. Start the server:
   ```terminal
   npm start
   ```

2. Open your browser and navigate to `http://localhost:5000`.

## User Roles and Access

- **Admin**:
  - Access to `/admin`
  - Can view all user data
- **Teacher**:
  - Access to `/teacher`
  - Can view student pages and their own profile page
- **Student1**:
  - Access to `/student1`
  - Can view their own profile page
- **Student2**:
  - Access to `/student2`
  - Can view their own profile page

## Routes

- `/LOGIN`: Login page
- `/REGISTER`: Registration page
- `/identify`: Re-identification page for sensitive operations
- `/admin`: Admin home page (restricted to admin users)
- `/student1`: Student1 home page (restricted to specific students, teachers, and admin)
- `/student2`: Student2 home page (restricted to specific students, teachers, and admin)
- `/teacher`: Teacher home page (restricted to teachers and admin)
- `/users/:userId`: Dynamic user profile page (restricted to the logged-in user)

## Troubleshooting

- Ensure all dependencies are installed correctly by running `npm install`.
- Check the `.env` file for the correct token value.
- Verify the database is initialized properly by running `node database.js`.
- Ensure the server is running on the correct port by accessing `http://localhost:5000`.

## License

This project is licensed under the MIT License.

---

Feel free to modify the instructions based on your specific setup and requirements.
