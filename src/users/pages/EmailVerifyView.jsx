import React, { useEffect, useState, useContext } from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { AuthContext } from '../../shared/Components/Context/auth-context';
import useHttp from '../../shared/hooks/http-hook'

import logo from '../../assets/logos/ppgcikampek.png';
import LoadingCircle from '../../shared/Components/UIElements/LoadingCircle';

const EmailVerifyView = () => {
    const token = useParams().token
    const [message, setMessage] = useState('')
    const { isLoading, error, sendRequest, setError } = useHttp();

    const auth = useContext(AuthContext)
    const navigate = useNavigate()

    console.log(token)

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const responseData = await sendRequest(`http://localhost:5000/api/users/verify-email/${token}`)
                console.log(responseData)
                setMessage(responseData.message)
            } catch (err) {
                console.log(err)
            }
        }
        verifyEmail()
    }, [sendRequest, token])

    return (
        <div className='card-basic mx-auto mt-36 w-96 h-64 flex flex-col gap-4 justify-center items-center'>
            {isLoading && (
                <div className="flex justify-center mt-16">
                    <LoadingCircle size={32} />
                </div>
            )}
            {message || error && (
                <>
                    <img src={logo} alt="logo" className="size-24 self-center mb-4" />
                    <h1 className={`text-2xl font-bold self-center ${error && 'text-red-500'} `}>{message || error}</h1>
                    <p onClick={() => navigate('/')} className='text-gray-600 hover:text-blue-500 hover:cursor-pointer hover:underline'>Kembali ke {auth.token ? 'Dashboard' : 'Login'}</p>
                </>
            )}
        </div>
    )
}

export default EmailVerifyView