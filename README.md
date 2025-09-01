# Laptop Inventory Tracker

A full-stack, internal laptop inventory tracking application built with Angular 17, Angular Material, and Firebase. This application is designed for IT technicians and administrative staff to efficiently manage laptop inventory with a clean, intuitive interface.

## Features

- **Complete CRUD Operations**: Add, view, edit, and delete laptop entries
- **Smart Status Tracking**: Automatically categorizes laptops as In Stock, Assigned, or Damaged
- **Advanced Filtering**: Filter by status and search by asset tag, assigned person, or make
- **Real-time Updates**: Firebase integration ensures data consistency across all users
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Clean UI/UX**: Material Design principles for intuitive navigation

## Data Model

Each laptop entry tracks the following information:

```json
{
  "asset_tag": "whg000777",
  "make": "HP",
  "assigned_to": "John Wick",
  "assigned_date": "2025-06-16",
  "returned": false,
  "issues": "Screen has a dead pixel.",
  "notes": "Follow up with user in 30 days."
}
```

### Status Logic

- **In Stock**: Laptop is returned (`returned: true`) with no issues
- **Assigned**: Laptop is currently assigned to someone (`returned: false`)
- **Damaged**: Laptop is returned (`returned: true`) but has issues recorded

## Technology Stack

- **Frontend**: Angular 17 (Standalone Components)
- **UI Framework**: Angular Material
- **Backend**: Firebase Firestore
- **Authentication**: Firebase Auth (ready for future implementation)
- **Styling**: CSS with Material Design theme
- **State Management**: RxJS Observables

## Project Structure

```
src/
└── app/
    ├── models/
    │   └── laptop.model.ts          # Data interfaces
    ├── services/
    │   └── laptop.service.ts        # Firebase CRUD operations
    ├── inventory-list/
    │   └── inventory-list.component.ts  # Main inventory view
    ├── laptop-form/
    │   └── laptop-form.component.ts     # Add/Edit forms
    ├── confirm-dialog/
    │   └── confirm-dialog.component.ts  # Confirmation dialogs
    ├── app.component.ts             # Root component
    ├── app.config.ts               # Application configuration
    └── app.routes.ts               # Routing configuration
```

## Prerequisites

Before running this application, ensure you have:

- **Node.js** (v18 or higher)
- **npm** or **yarn** package manager
- **Angular CLI** (v17 or higher)
- **Firebase project** with Firestore enabled

## Installation & Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Firebase Configuration

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Set up Firestore security rules (see below)
4. Copy your Firebase configuration to `src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  firebase: {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "your-sender-id",
    appId: "your-app-id"
  }
};
```

### 3. Firestore Security Rules

Set up the following security rules in your Firebase console:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /laptops/{document} {
      allow read, write: if true; // For development - restrict in production
    }
  }
}
```

**Note**: The above rules allow full access for development. In production, implement proper authentication and authorization.

### 4. Run the Application

```bash
# Development server
npm start

# Build for production
npm run build

# Run tests
npm test
```

The application will be available at `http://localhost:4200`

## Usage Guide

### Adding a New Laptop

1. Click "Add Laptop" in the navigation
2. Fill in the required fields (Asset Tag, Make, Assigned To, Assigned Date)
3. Optionally add issues or notes
4. Check "Laptop has been returned" if the laptop is not currently assigned
5. Click "Add Laptop" to save

### Editing a Laptop

1. Click the edit icon (pencil) next to any laptop in the inventory list
2. Modify the desired fields
3. Click "Update Laptop" to save changes

### Filtering and Searching

- **Status Filter**: Use the chip filters to view laptops by status
- **Search**: Use the search bar to find laptops by asset tag, assigned person, or make
- **Real-time Updates**: Filters and search update automatically as you type

### Deleting a Laptop

1. Click the delete icon (trash) next to any laptop
2. Confirm the deletion in the dialog
3. The laptop will be permanently removed from the database

## Development

### Adding New Features

The application is built with standalone components, making it easy to extend:

1. Create new components in the `src/app/` directory
2. Add routes in `app.routes.ts`
3. Update the navigation in `app.component.ts`

### Styling

- Global styles are in `src/styles.css`
- Component-specific styles use Angular Material theming
- Responsive design is implemented with CSS Grid and Flexbox

### Testing

The application includes a complete testing setup:

```bash
# Run unit tests
npm test

# Run tests with coverage
npm run test:coverage
```

## Deployment

### Firebase Hosting

1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login: `firebase login`
3. Initialize: `firebase init hosting`
4. Build: `npm run build`
5. Deploy: `firebase deploy`

### Other Platforms

The built application can be deployed to any static hosting service:
- Netlify
- Vercel
- AWS S3
- GitHub Pages

## Security Considerations

- **Firebase Rules**: Implement proper Firestore security rules for production
- **Authentication**: Add Firebase Auth for user management
- **Data Validation**: Server-side validation should complement client-side validation
- **HTTPS**: Always use HTTPS in production

## Troubleshooting

### Common Issues

1. **Firebase Connection Errors**
   - Verify your Firebase configuration
   - Check Firestore security rules
   - Ensure your Firebase project is active

2. **Build Errors**
   - Clear node_modules and reinstall: `rm -rf node_modules && npm install`
   - Update Angular CLI: `npm update -g @angular/cli`

3. **Runtime Errors**
   - Check browser console for detailed error messages
   - Verify all required fields are filled in forms

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For technical support or questions:
- Check the troubleshooting section above
- Review Firebase documentation
- Consult Angular Material documentation

---

**Built with ❤️ using Angular 17 and Firebase**
