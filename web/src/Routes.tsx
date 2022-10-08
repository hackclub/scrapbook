// In this file, all Page components from 'src/pages` are auto-imported. Nested
// directories are supported, and should be uppercase. Each subdirectory will be
// prepended onto the component name.
//
// Examples:
//
// 'src/pages/HomePage/HomePage.js'         -> HomePage
// 'src/pages/Admin/BooksPage/BooksPage.js' -> AdminBooksPage

import { Set, Router, Route } from '@redwoodjs/router'

import AccountsLayout from 'src/layouts/AccountsLayout'
import UpdatesLayout from './layouts/UpdatesLayout'

const Routes = () => {
  return (
    <Router>
      <Route path="/account" page={AccountEditAccountPage} name="editAccount" />
      <Set wrap={UpdatesLayout}>
        <Route path="/updates/new" page={UpdateNewUpdatePage} name="newUpdate" />
        <Route path="/updates/{id}/edit" page={UpdateEditUpdatePage} name="editUpdate" />
        <Route path="/updates/{id}" page={UpdateUpdatePage} name="update" />
        <Route path="/updates" page={UpdateUpdatesPage} name="updates" />
      </Set>
      <Route path="/" page={IndexPage} name="home" />
      <Route path="/login" page={LoginPage} name="login" />
      <Route path="/signup" page={SignupPage} name="signup" />
      <Route path="/forgot-password" page={ForgotPasswordPage} name="forgotPassword" />
      <Route path="/reset-password" page={ResetPasswordPage} name="resetPassword" />
      <Route notfound page={NotFoundPage} />
    </Router>
  )
}

export default Routes
