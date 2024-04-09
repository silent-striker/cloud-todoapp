import React, { useState, useEffect } from 'react';
import useAuth from '../hooks/useAuth';
import image from '../assets/logo192.png';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function Dashboard() {
    const { getUserInfo, clearSession } = useAuth();
    const [incompleteTodos, setIncompleteTodos] = useState([]);
    const [completedTodos, setCompletedTodos] = useState([]);
    const [newTask, setNewTask] = useState('');

    const navigate = useNavigate();

    const apiGateway = process.env.REACT_APP_API_GATEWAY || "http://localhost:8080";

    // fetch all todos
    useEffect(() => {
        const fetchTodos = async (userInfo) => {
            const userId = userInfo.userId;
            const fetchEndpoint = `${apiGateway}/fetchTodo`;

            const headers = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.idToken}`
            }

            const payload = {
                userId: userId
            }

            const response = await axios.post(fetchEndpoint, payload, { headers: headers })
                .then((response) => response)
                .catch((err) => err);

            if (axios.isAxiosError(response)) {
                return;
            }

            const todos = response.data.data;
            if (todos === undefined || todos === null) {
                return;
            }
            setIncompleteTodos(todos.filter(todo => todo.completed === false));
            setCompletedTodos(todos.filter(todo => todo.completed === true));
        };

        const userInfo = getUserInfo();
        fetchTodos(userInfo);
    }
        , []);

    const handleLogout = () => {
        clearSession();
        navigate('/login', { replace: true });
    }

    const generateTaskId = () => {
        return Math.round(new Date().getTime() / 1000);
    }

    // adding a new task
    const handleAddTask = async (e) => {
        e.preventDefault();
        if (newTask === '') {
            return;
        }

        const userId = getUserInfo().userId;
        const taskId = generateTaskId().toString();
        const taskDetails = newTask;
        const completed = false;

        const addEndpoint = `${apiGateway}/addTodo`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getUserInfo().idToken}`
        }
        const newTodo = {
            userId: userId,
            taskId: taskId,
            taskDetails: taskDetails,
            completed: completed
        };

        const response = await axios.post(addEndpoint, newTodo, { headers: headers })
            .then((response) => response)
            .catch((err) => err);

        if (axios.isAxiosError(response)) {
            const error = response;
            console.error(error.response);
            alert("An error occurred while adding the todo. Please try again later.");
            return;
        }

        setIncompleteTodos([...incompleteTodos, { taskId, taskDetails, completed }]);
        setNewTask('');
    }

    // update incomplete task to completed status
    const handleCompleteTask = async (e, taskId) => {
        e.preventDefault();

        // update todo status in db
        const userId = getUserInfo().userId;
        const updateEndpoint = `${apiGateway}/updateTodo`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getUserInfo().idToken}`
        };

        const payload = {
            userId: userId,
            taskId: taskId,
            completed: true
        }

        const response = await axios.post(updateEndpoint, payload, { headers: headers, mode: 'no-cors' })
            .then((response) => response)
            .catch((err) => err);

        if (axios.isAxiosError(response)) {
            const error = response;
            console.error(error.response);
            alert("An error occurred while updating status of the todo. Please try again later.");
            return;
        }

        let todo = incompleteTodos.find((todo) => todo.taskId === taskId);
        setCompletedTodos([...completedTodos, todo]);
        setIncompleteTodos(incompleteTodos.filter((todo) => todo.taskId !== taskId));
    }

    // update content of incompleted task
    const handleUpdateTask = (taskId, newDetails) => {
        let todo = incompleteTodos.find((todo) => todo.taskId === taskId);
        todo.details = newDetails;
    }

    // deleting a task from completed or incomplete list
    const handleDeleteTask = async (e, isCompleted, taskId) => {
        e.preventDefault();

        // delete todo from db
        const userId = getUserInfo().userId;

        const deleteEndpoint = `${apiGateway}/deleteTodo`;
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getUserInfo().idToken}`
        }
        const payload = {
            userId: userId,
            taskId: taskId
        };

        const response = await axios.post(deleteEndpoint, payload, { headers: headers, mode: 'no-cors' })
            .then((response) => response)
            .catch((err) => err);

        if (axios.isAxiosError(response)) {
            const error = response;
            console.error(error.response);
            alert("An error occurred while adding the todo. Please try again later.");
            return;
        }

        if (isCompleted) {
            setCompletedTodos(completedTodos.filter((todo) => todo.taskId !== taskId));
        } else {
            setIncompleteTodos(incompleteTodos.filter((todo) => todo.taskId !== taskId));
        }
    }

    return (
        <div>
            <nav className="navbar navbar-light px-3" style={{ backgroundColor: "#e3f2fd" }}>
                <Link to="/dashboard" className='navbar-brand'>
                    <img src={image} width="30" height="30" className="d-inline-block align-top mx-1" alt="" />
                    TodoApp
                </Link>
                <button className="btn btn-outline-danger" onClick={() => handleLogout()}>Logout</button>
            </nav>
            <div className="m-1">
                <h2>Welcome, {getUserInfo().name ? getUserInfo().name : "User"}!</h2>
            </div>

            <div className="container d-flex justify-content-center my-3">
                <div className="row">
                    <form className="form-inline d-flex justify-content-center">
                        <input type="text" className="form-control mx-2" placeholder="Add a task" value={newTask} onChange={(e) => setNewTask(e.target.value)} />
                        <button type="submit" className="btn btn-outline-primary my-2 my-sm-0" onClick={(e) => { handleAddTask(e) }}>Add</button>
                    </form>
                </div>
            </div>


            <div className="container">
                <div className="row">
                    <div className="col-6">
                        <h3 className="m-2" style={{ color: "red" }}>Incomplete Todos</h3>
                        <ul className="list-group">
                            {
                                incompleteTodos.length > 0 ?
                                    incompleteTodos.map((todo) => {
                                        return (
                                            <li key={todo.taskId} className="list-group-item d-flex .flex-column justify-content-between align-items-center">
                                                <div>
                                                    {todo.taskDetails}
                                                </div>
                                                <div>
                                                    <button className='btn btn-outline-success m-1' onClick={(e) => handleCompleteTask(e, todo.taskId)}>done</button>
                                                    <button className='btn btn-outline-danger m-1' onClick={(e) => handleDeleteTask(e, false, todo.taskId)}>delete</button>
                                                </div>
                                            </li>
                                        );
                                    }) :
                                    <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Yay!! No pending tasks
                                    </li>
                            }
                        </ul>
                    </div>

                    <div className="col-6">
                        <h3 className="m-2" style={{ color: "green" }}>Completed Todos</h3>
                        <ul className="list-group">
                            {
                                completedTodos.length > 0 ?
                                    completedTodos.map((todo) => {
                                        return (
                                            <li key={todo.taskId} className="list-group-item d-flex justify-content-between align-items-center" style={{ backgroundColor: "#D0FFBC", borderColor: "green" }}>
                                                {todo.taskDetails}
                                                <button className='btn btn-outline-danger' onClick={(e) => handleDeleteTask(e, true, todo.taskId)}>delete</button>
                                            </li>
                                        );
                                    }) : incompleteTodos.length === 0 ? <li className="list-group-item d-flex justify-content-between align-items-center">Well done all tasks done!</li> : <li className="list-group-item d-flex justify-content-between align-items-center">
                                        Nothing completed, keep going!
                                    </li>
                            }
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}