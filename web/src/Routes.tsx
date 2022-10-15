// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Set, Router, Route, Private } from '@redwoodjs/router'

import MainLayout from './layouts/MainLayout'
import UserPage from './pages/UserPage/UserPage'

const Routes = () => {
  return (
    <Router>
      <Set wrap={MainLayout}>
        <Private unauthenticated="login">
          <Route path="/account" page={AccountEditAccountPage} name="editAccount" />
          <Set>
            <Route path="/updates/new" page={UpdateNewUpdatePage} name="newUpdate" />
            <Route path="/updates/{id}/edit" page={UpdateEditUpdatePage} name="editUpdate" />
          </Set>
        </Private>
        <Route path="/" page={IndexPage} name="home" />
        <Route path="/login" page={LoginPage} name="login" />
        <Route path="/signup" page={SignupPage} name="signup" />
        <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
        <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
        <Route notfound page={NotFoundPage} />
        <Route path="/{username}" page={UserPage} name="user" />
      </Set>
    </Router>
  )
}

export default Routes
