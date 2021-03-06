import React from 'react'
import { Formik } from 'formik'
import { Country } from './Country'
import { Phone } from './Phone'
import { Button, FormControl, Stack } from '@mui/material'
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
            {({ handleSubmit }) => (
                <form onSubmit={handleSubmit} autoComplete="off">
                    {authState === 'authorizationStateWaitPhoneNumber' && (
                        <>
                            <Stack spacing={2} direction="column">
                                <Country countries={countries} />
                                <Phone />
                            </Stack>
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
