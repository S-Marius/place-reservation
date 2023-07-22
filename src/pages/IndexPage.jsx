import { Link } from "react-router-dom";
import Header from "../Header";
import Recommandations from "./Recommandations";
import axios from "axios";
import { useEffect, useState } from "react";

export default function IndexPage() {
    const [places, setPlaces] = useState([])
    
    useEffect(() => {
        axios.get('/places').then(response => {
            setPlaces(response.data) 
        })
    }, [])
    return (
        <div className="mt-10 gap-x-6 gap-y-10 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {places.length > 0 && places.map(place => (
                <Link to={'/place/' + place._id} key={place._id}>
                    <div className="bg-gray-500 mb-2 rounded-3xl flex">
                    {place.photos?.[0] && (
                        <img className="rounded-3xl object-cover aspect-square" src={'http://localhost:4000/uploads/' + place.photos[0]} alt="" />
                    )}
                    </div>
                    <h3 className="font-bold">{place.address}</h3>
                    <h2 className="text-sm truncate text-gray-500">{place.title}</h2>
                    <div className="mt-2">
                        <span className="font-bold">${place.price}</span> per night
                    </div>
                </Link>
            ))}
        </div>
    )
}

