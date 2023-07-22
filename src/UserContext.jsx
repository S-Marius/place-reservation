import axios from "axios"
import {createContext, useEffect, useState} from "react"

export const UserContext = createContext({})

export function UserContextProvider({children}) {
    // The code above receives a prop called "children", which represents the nested components within it.
    const [user, setUser] = useState(null)

    const [ready, setReady] = useState(false)

    // The function passed to useEffect is the actual side effect code. It will be executed after the component is rendered for the first time and after every subsequent re-render. Inside this function, you can perform any asynchronous or synchronous operations, like making HTTP requests, updating the DOM, or subscribing to events. 

    // "useEffect" is used to perform a side effect when the component is mounted (i.e., after the initial render)

    useEffect(() => {
        if (!user) {
            axios.get('/profile').then(({data}) => {
                setUser(data)
                setReady(true)
            })
        }
    }, [])

    return (
        <UserContext.Provider value={{user, setUser, ready}}>
            {children}
        </UserContext.Provider>
    )
}