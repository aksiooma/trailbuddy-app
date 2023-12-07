# Trailbuddy - a fictional MTB-Bike Rental Booking and Trailmaps Application

Trailbuddy, a fictional MTB-Bike Rental Booking and TrailmapsApplication, is a sophisticated front-end project that facilitates bike rental reservations. It integrates a sleek user interface with real-time database interactions, ensuring a seamless and responsive booking experience.

## Technologies

   - Next.js: A React framework for building user interfaces with server-side rendering and static site generation.
   - TailwindCSS: A utility-first CSS framework for rapidly building custom designs.
   - TypeScript: A strongly typed programming language that builds on JavaScript.
   - Firebase: A comprehensive app development platform that provides backend services like real-time databases, authentication, and cloud functions.
   - Vercel: A cloud platform for static sites and Serverless Functions that fits perfectly with your workflow.
   - CI/CD Pipeline: Automated Continuous Integration and Continuous Deployment to streamline development and deployment processes.
   - Jest: A JavaScript Testing Framework with a focus on simplicity.

## Features

   - Bike Selection: Choose from a variety of bikes.
   - Size Selection: Select the desired size for the chosen bike (Small, Medium, Large).
   - User Authentication: Secure login using Google, email/password via Firebase Authentication - or anonymous login.
   - Real-time Availability Check: Live updates of bike availability using Firestore. Local storage for session handling.
   - Basket Functionality: Review and manage bike reservations before finalizing.
   - Responsive Design: Fully responsive layout for an optimal viewing experience across different devices.
   - Automated Testing: Unit tests with Jest to ensure application reliability and stability.
   - Scheduled Cloud Function: Automatically removes 'pending' reservations after a set period to maintain database integrity.

## Getting Started

To get a local copy up and running follow these simple steps:

1.  Clone the repository
```bash
git clone https://github.com/aksiooma/trailbuddy-app
```
2. Install dependencies

```bash
npm install
```
3. Run the development server

```bash
npm run dev
```
Open http://localhost:3000 with your browser to see the result.

4. Run tests

```bash
    npm test
```

## Deployment

This application is deployed on Vercel with a integrated CI/CD pipeline for efficient testing and deployment.

## Contributing

Contributions, issues, and feature requests are welcome. Feel free to check issues page if you want to contribute.

## License

Distributed under the MIT License. See LICENSE for more information.
Contact

Teijo Virta - teijo.virta@gmail.com
Project Link: https://github.com/aksiooma/trailbuddy-app