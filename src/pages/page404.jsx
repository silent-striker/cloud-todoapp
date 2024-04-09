import React from 'react'
import { Link } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'

export default function Page404() {
  return (
    <div style={{margin:"1cm"}}>
        <h1>Oops! 404, Page Not found</h1>
        <p>Please click on the button below to go back to the login page</p>
        <Link className="btn btn-primary" to="/login">Go back</Link>
    </div>
  )
}