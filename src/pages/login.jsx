import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js'
import userPool from '../UserPool'
import '../css/login.css'

function ErrorMessage({ msg }) {
    return (
        <small style={{ display: "block", color: "red" }} className="error-msg text-danger text-start">
            {msg}
        </small>
    );
}

export default function Login() {

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(true);

    const [password, setPassword] = useState('');
    const [validLen, setValidLen] = useState(true);

    const navigate = useNavigate();

    const validateEmailAndSet = (email) => {
        const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/;
        const valid = emailRegex.test(email);
        setValidEmail(valid);
        setEmail(email);
    }

    const validatePasswordAndSet = (pwd) => {
        const valid = pwd.length >= 8;
        setValidLen(valid);
        setPassword(pwd);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (email !== '' && password !== '' && validEmail && validLen) {
            // create a new CognitoUser object
            const user = new CognitoUser({
                Username: email,
                Pool: userPool
            });

            // get the user's authentication details
            const authData = {
                Username: email,
                Password: password
            };

            // authenticate user credentials on cognito
            const userData = user.authenticateUser(new AuthenticationDetails(authData), {
                onSuccess: (session) => {
                    console.log('Login successful: ', session);
                    const userData = {
                        accessToken: session.getAccessToken().getJwtToken(),
                        userId: session.getAccessToken().payload.username,
                        expiry: session.getAccessToken().payload.exp,
                        idToken: session.getIdToken().getJwtToken(),
                        name: session.getIdToken().payload.name,
                        refreshToken: session.getRefreshToken().getToken()
                    }

                    sessionStorage.setItem("userData", JSON.stringify(userData));
                    navigate('/dashboard', {replace: true});
                },
                onFailure: (err) => {
                    alert(err.message);
                    console.error(err.message);
                }
            });
        } else {
            alert('Please enter valid details');
            window.location.reload();
        }
    }

    return (
        <div className='login-page'>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-md-6'>
                        <div className='card login-form'>
                            <h3 className='card-title'>Log In</h3>
                            <form>
                                <div className="form-group m-3 px-5">
                                    <input type="text" className="form-control" id="emailInput" placeholder="Email" value={email} onInput={(e) => validateEmailAndSet(e.target.value)} />
                                    {!validEmail ? <ErrorMessage msg="Please enter a valid email" /> : null}
                                </div>
                                <div className="form-group m-3 px-5">
                                    <input type="password" className="form-control" id="passwordInput" placeholder="Password" value={password} onInput={(e) => validatePasswordAndSet(e.target.value)} />
                                    {
                                        !validLen ? <ErrorMessage msg="Minimum 8 characters" /> : null
                                    }
                                </div>
                            </form>
                            <Link to='/signup' className='text-center link-info'>Don't have an account? Sign Up</Link>
                            <div className='text-center mb-3'>
                                <button className='btn btn-primary m-3' onClick={(e) => handleSubmit(e)} >Submit</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}