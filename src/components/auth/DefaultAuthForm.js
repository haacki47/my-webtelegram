import React from 'react'
import { Formik } from 'formik'
import { Country } from './Country'
import { Phone } from './Phone'
import { Button, FormControl, TextField } from '@mui/material'
import * as Yup from 'yup'
import { Code } from './Code'
import { Password } from './Password'

export const DefaultAuthForm = ({
    countries,
    authState,
    onSendConfirmationCode,
    onSendPassword,
    onSendPhoneNumber,
}) => {
    const initialValues = {
        countryCode: '',
        phoneNumber: '',
        code: '',
        password: '',
    }

    const validationSchema = Yup.object({
        countryCode: Yup.string().required('Country is required'),
        phoneNumber: Yup.string().required("Phone number can't be empty"),
    })

    const onSubmit = (fields, options) => {
        switch (authState) {
            case 'authorizationStateWaitPhoneNumber':
                onSendPhoneNumber(fields, options)
                break
            case 'authorizationStateWaitCode':
                onSendConfirmationCode(fields, options)
                break
            case 'authorizationStateWaitPassword':
                onSendPassword(fields, options)
                break
        }
    }

    return (
        <Formik
            initialValues={initialValues}
            validationSchema={validationSchema}
            onSubmit={onSubmit}
        >
            {({ handleSubmit, errors, handleChange, touched, values }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                    {authState === 'authorizationStateWaitPhoneNumber' && (
                        <>
                            <FormControl fullWidth margin="normal">
                                <Country countries={countries} />
                            </FormControl>
                            <FormControl fullWidth margin="normal">
                                <Phone />
                            </FormControl>
                        </>
                    )}
                    {authState === 'authorizationStateWaitCode' && (
                        <FormControl margin="normal" fullWidth>
                            <Code />
                        </FormControl>
                    )}
                    {authState === 'authorizationStateWaitPassword' && (
                        <FormControl margin="normal" fullWidth>
                            <Password />
                        </FormControl>
                    )}
                    <FormControl fullWidth margin="normal">
                        <Button type="submit" variant="contained" fullWidth>
                            NEXT
                        </Button>
                    </FormControl>
                </form>
            )}
        </Formik>
    )
}
