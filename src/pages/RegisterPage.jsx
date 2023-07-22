import axios from "axios";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function RegisterPage() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    async function handleRegister(ev) {
        ev.preventDefault()

        try {
            await axios.post('/register', {
                name, email, password,
            })
            alert('Registration Successful')
        } catch (e) {
            alert('Name or Email already taken!')
        }
    }

    return (
        <div className="mt-4 grow flex items-center justify-around">
            <div className="mb-32">
            <h1 className="text-4xl text-center">Register Page</h1>

            <form className="max-w-md mx-auto mt-4" onSubmit={handleRegister}>
                <input type="text" 
                    placeholder="Your Name" 
                    value={name} 
                    onChange={ev => {setName(ev.target.value)}} />

                <input type="email" 
                    placeholder="your@email.com" 
                    value={email} 
                    onChange={ev => {setEmail(ev.target.value)}} />
                
                <input type="password" 
                    placeholder="your password" 
                    value={password} 
                    onChange={ev => {setPassword(ev.target.value)}} />
                <button className="primary">Register</button>

                <div className="text-center py-2 text-gray-600">Already a member? <Link to={'/login'} className="underline text-black font-bold">Login Now</Link>
                </div>

            </form>
            </div>
        </div>
    )
}