import axios from "axios";
import { useContext, useState } from "react";
import { Link, Navigate } from "react-router-dom";
import { UserContext } from "../UserContext";

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [redirect, setRedirect] = useState(false)

    const {setUser} = useContext(UserContext)

    async function handleLogin(ev) {
        ev.preventDefault()

        try {
            const userInfo = await axios.post('/login', {
                email,
                password,
            })
            alert('Login Successful')

            setUser(userInfo.data)

            setRedirect(true)
        } catch (e) {
            alert('Login Failed')
        }
    }

    if (redirect) {
        return <Navigate to={'/'} />
    }


    return (
        <div>

            <div className="mt-4 grow flex items-center justify-around">
                <div className="mb-32">
                    <h1 className="text-4xl text-center">Login Page</h1>

                    <form className="max-w-md mx-auto mt-4" onSubmit={handleLogin}>
                        <input type="email"
                            placeholder="your@email.com"
                            value={email}
                            onChange={ev => { setEmail(ev.target.value) }} />

                        <input type="password"
                            placeholder="your password"
                            value={password}
                            onChange={ev => { setPassword(ev.target.value) }} />

                        <button className="primary">Login </button>

                        <div className="text-center py-2 text-gray-600">Don't have an account yet? <Link to={'/register'} className="underline text-black font-bold">Register Now</Link>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    )
}