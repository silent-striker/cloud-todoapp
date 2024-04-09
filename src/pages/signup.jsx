import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import UserPool from '../UserPool';
import { CognitoUserAttribute } from 'amazon-cognito-identity-js';
import '../css/signup.css'

function ErrorMessage({ msg }) {
    return (
        <small style={{ display: "block", color: "red" }} className="error-msg text-danger text-start">
            {msg}
        </small>
    );
}

export default function Signup() {
    const [name, setName] = useState('');
    const [validName, setValidName] = useState(true);

    const [email, setEmail] = useState('');
    const [validEmail, setValidEmail] = useState(true);

    const [password, setPassword] = useState('');
    const [pwdCheck, setPwdCheck] = useState('');
    const [confirmPassword, setConfirmPassword] = useState(true);
    const [validLen, setValidLen] = useState(true);

    const [notifications, setNotifications] = useState(false);

    const navigate = useNavigate();

    // todo: implement password policy
    const validateNameAndSet = (name) => {
        const nameRegex = /^[a-zA-Z\s]+$/;
        const valid = nameRegex.test(name);
        setValidName(valid);
        setName(name);
    }
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

    const checkPasswords = (pwd) => {
        setPwdCheck(pwd);
        setConfirmPassword(pwd === password);
    }

    async function handleSubmit(e) {
        e.preventDefault();

        if (email !== '' && password !== '' && validEmail && validLen) {
            const nameAttribute = new CognitoUserAttribute({ Name: 'name', Value: name });

            const attributeList = [nameAttribute];
            UserPool.signUp(email, password, attributeList, null, (err, data) => {
                if (err) {
                    console.error(err);
                    alert(err.message);
                    return;
                }
                console.log(data);

                // todo: implement notifications with SNS
                if (notifications) {
                    const userSub = data.userSub;
                    console.log('User sub: ', userSub);
                    console.log('Notifications enabled');
                }
                alert('User created successfully!');
                navigate('/login');
            });
        } else {
            alert('Please enter valid details');
            window.location.reload();
        }
    }

    return (
        <div className='signup-page'>
            <div className='container'>
                <div className='row justify-content-center'>
                    <div className='col-md-6'>
                        <div className='card signup-form'>
                            <h3 className='card-title'>Sign up</h3>
                            <form>
                                <div className="form-group m-3 px-5">
                                    <input type="text" className="form-control" id="nameInput" placeholder="Name" value={name} onInput={(e) => validateNameAndSet(e.target.value)} />
                                    {!validName ? <ErrorMessage msg="Please enter a valid name" /> : null}
                                </div>
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
                                <div className="form-group m-3 px-5">
                                    <input type="password" className="form-control" id="confirmPasswordInput" placeholder="Confirm password" value={pwdCheck} onInput={(e) => checkPasswords(e.target.value)} />
                                    {
                                        !confirmPassword ? <ErrorMessage msg="Passwords do not match!" /> : null
                                    }
                                </div>
                                <div className="form-group">
                                    <input className="form-check-input mx-3" type="checkbox" onChange={(e) => { setNotifications(e.target.checked) }} />
                                    <label className="form-check-label">Enable notifications</label>
                                </div>
                            </form>
                            <Link to='/login' className='text-center link-info'>Already have an account? Login</Link>
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