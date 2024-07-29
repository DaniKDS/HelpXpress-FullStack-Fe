# HelpXpress Frontend Documentation

## Overview

The frontend of HelpXpress is designed to provide a user-friendly interface that allows easy access to various support services for the disabled community in Romania. It is developed using HTML, CSS, and JavaScript to ensure a responsive and accessible experience across different devices and platforms.

## Architecture

The frontend architecture follows the classic Model-View-Controller (MVC) pattern to separate the concerns, making the codebase more maintainable and scalable. Below is a high-level overview of this architecture, illustrating how the frontend interacts with the backend services.

(https://github.com/user-attachments/assets/b5214619-aeac-4b3e-9915-e8bf1a4989e1)


## Key Components

### 1. User Interface
The user interface is the visual part of the application where users interact with the app. It includes various pages like Home, Services, About Us, Contact, and User Reviews.

#### Home Page
The Home Page welcomes users with a brief introduction and navigation options to various services offered by the app.

![image](https://github.com/user-attachments/assets/fc202132-31d7-4a00-abe7-2ae1fed1fb16)


### 2. Services
Services are detailed on their respective pages where users can browse and select the services they need.

### 3. Management Portal
For registered users, especially service providers like doctors or personal assistants, there's a management portal.

#### Management Portal Overview
This section of the frontend allows doctors to manage their profiles, view appointments, and interact with their patients or clients.

![image](https://github.com/user-attachments/assets/87b56b70-4f7f-4822-b305-c59b3482506b)


## Interactions with Backend

The frontend communicates with the backend through RESTful APIs, handling data exchange and updates in real-time. Below are examples of these interactions:

### User Controller
- **POST `/login`**: Handles user authentication.
- **GET `/users`**: Retrieves user data.
...
### API Service Implementation
Communications are handled through asynchronous JavaScript calls, ensuring that the user interface remains responsive at all times.

## Data Flow Diagram
The data flow diagram below illustrates the interaction between the frontend, backend, and the database.

![image](https://github.com/user-attachments/assets/f8999a3d-0787-4227-920c-f465d21d4856)

## Technologies Used

- **HTML5**: For structuring the content.
- **CSS3**: For styling and responsive design.
- **JavaScript**: For dynamic interactions and API integrations.

## Conclusion

This documentation provides a comprehensive overview of the frontend part of HelpXpress. It outlines the structure, key components, and interactions with the backend to facilitate understanding and further development of the platform.

